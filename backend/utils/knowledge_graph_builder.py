import os
import json
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parent.parent
KNOWLEDGE_GRAPH_PATH = BACKEND_ROOT / "data" / "knowledgeGraph.json"

def load_knowledge_graph():
    """Loads the knowledge graph from disk."""
    if not KNOWLEDGE_GRAPH_PATH.exists():
        # Fallback to frontend directory if backend copy doesn't exist yet
        fallback_path = BACKEND_ROOT / ".." / "frontend" / "src" / "data" / "knowledgeGraph.json"
        if fallback_path.exists():
            return json.loads(fallback_path.read_text(encoding="utf-8"))
        return {"nodes": [], "links": []}
    
    try:
        with open(KNOWLEDGE_GRAPH_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {"nodes": [], "links": []}

def resolve_supplier_node(supplier_name):
    """
    Tries to match a raw supplier/facility name to a node in the knowledge graph.
    Returns the node dictionary if found, else None.
    """
    graph = load_knowledge_graph()
    nodes = graph.get("nodes", [])
    
    s_name_lower = supplier_name.lower()
    
    # Try exact or substring matches
    for node in nodes:
        label_lower = node.get("label", "").lower()
        if label_lower in s_name_lower or s_name_lower in label_lower:
            return node
            
    # Try matching parts of the name
    for node in nodes:
        label_parts = [p for p in node.get("label", "").lower().split() if len(p) > 3]
        for part in label_parts:
            if part in s_name_lower:
                return node
                
    return None

def get_downstream_dependencies(node_id):
    """
    Traverses the knowledge graph to find all nodes that depend directly or indirectly
    on the specified node_id. Returns a list of dependent node IDs.
    """
    graph = load_knowledge_graph()
    links = graph.get("links", [])
    
    # Simple BFS traversal
    visited = set()
    queue = [node_id]
    
    while queue:
        current = queue.pop(0)
        for link in links:
            # If current node is the source, then target depends on it
            if link.get("source") == current:
                target = link.get("target")
                if target not in visited:
                    visited.add(target)
                    queue.append(target)
                    
    return list(visited)
