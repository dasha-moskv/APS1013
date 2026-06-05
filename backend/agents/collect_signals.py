from openai import OpenAI
from dotenv import load_dotenv
import os
import sys
import json
import random

load_dotenv(override=True)
api_key = os.getenv("OPENAI_API_KEY")
is_dummy = not api_key or api_key == "dummy-key" or len(api_key.strip()) == 0

if not is_dummy:
    client = OpenAI(api_key=api_key)
else:
    client = None

def construct_prompt(supply_base, current_json_data):
    prompt = f"""
You are an aerospace supply chain disruption intelligence analyst.

SUPPLY BASE:

{supply_base}

EXISTING SIGNALS:

{current_json_data}

TASK:

Generate EXACTLY ONE new disruption signal that is NOT already represented in the existing signals.

The disruption must be relevant to Boeing's Aircraft Propulsion Systems Supply Base.

Good categories include:
- supplier quality issues
- labor disputes
- material shortages
- logistics disruptions
- export restrictions
- natural disasters
- cyber incidents
- regulatory actions
- manufacturing bottlenecks
- energy disruptions
- transportation delays

Requirements:

- Output exactly ONE sentence.
- No numbering.
- No bullets.
- No explanation.
- No quotation marks.
- Make it specific.
- Make it realistic.
- Make it distinct from existing signals.
- The output should resemble a news headline or intelligence summary.

Examples:

Nickel superalloy shortages following export restrictions increase lead times for aerospace turbine manufacturers

Labor negotiations at a major engine supplier threaten production schedules for widebody aircraft programs

Severe flooding near a titanium processing facility disrupts deliveries of aerospace-grade forgings

Return ONLY the disruption signal.
"""
    return prompt

def dynamic_fallback_collect():
    # Load knowledge graph to generate realistic supplier-specific signals dynamically
    kg_path = os.path.join(os.path.dirname(__file__), "..", "data", "knowledgeGraph.json")
    nodes = []
    if os.path.exists(kg_path):
        try:
            with open(kg_path, "r", encoding="utf-8") as f:
                nodes = json.load(f).get("nodes", [])
        except Exception:
            pass
            
    # Filter nodes that are suppliers (Tiers 1, 2, 3)
    suppliers = [n for n in nodes if n.get("tier", 0) > 0]
    if not suppliers:
        suppliers = [
            {"label": "Precision Castparts Corp.", "location": "Portland, OR", "type": "Forgings"},
            {"label": "Toray Industries, Inc.", "location": "Ehime, JP", "type": "Composites"},
            {"label": "Spirit AeroSystems", "location": "Wichita, KS", "type": "Structures"}
        ]
        
    sup = random.choice(suppliers)
    label = sup.get("label", "Supplier")
    loc = sup.get("location", "Global Region")
    parts_type = sup.get("type", "Component").lower()
    
    templates = [
        f"Labor walkout threats at {label} ({loc}) spark concerns over upcoming deliveries of aerospace-grade {parts_type} components.",
        f"Severe weather conditions near the {label} plant in {loc} disrupt logistics corridors for critical {parts_type} parts.",
        f"Export restrictions on key raw materials disrupt production of high-performance {parts_type} sub-assemblies at {label}.",
        f"Cybersecurity breach at {label} ({loc}) temporarily halts SCADA assembly networks for safety-critical {parts_type} hardware.",
        f"Equipment failure and kiln shutdown at {label} facility restricts monthly capacity for aerospace {parts_type} materials."
    ]
    return [random.choice(templates)]

def collect_public_signals(supply_base, current_json_data):
    global client, is_dummy
    
    # Fallback immediately if client is not configured
    if is_dummy or client is None:
        return dynamic_fallback_collect()
        
    prompt_string = construct_prompt(supply_base, current_json_data) 

    try:
        response = client.responses.create(
            model="gpt-5.5",
            input=[
                {
                    "role": "system",
                    "content": (
                        "You are a supply chain disruption intelligence assistant."
                    )
                },
                {
                    "role": "user",
                    "content": prompt_string
                }
            ],
        )

        result = response.output_text.strip()

        # Convert response into list
        signals = [
            line.strip("- ").strip()
            for line in result.splitlines()
            if line.strip()
        ]

        if not signals:
            return dynamic_fallback_collect()
            
        return signals
        
    except Exception as e:
        print(f"[WARNING] OpenAI API call failed at collect_public_signals: {e}. Falling back to dynamic generator.")
        return dynamic_fallback_collect()
