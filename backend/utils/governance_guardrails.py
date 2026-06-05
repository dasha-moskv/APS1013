import re
from backend.utils.validate_geojson import ASL_APPROVED_SUPPLIERS

def check_playbook_compliance(playbook):
    """
    Parses alternate supplier actions to extract the proposed backup supplier name.
    Checks it against the pre-certified ASL database.
    Returns (is_compliant, violated_supplier, error_msg).
    """
    if not playbook:
        return True, None, None
        
    alt_actions = playbook.get("alternate_supplier_actions", [])
    if not alt_actions:
        # Fallback to checking normal steps if unstructured
        alt_actions = playbook.get("steps", [])
        
    if not alt_actions:
        return True, None, None
        
    first_step = alt_actions[0]
    
    # Check if this is a sourcing nudge
    if not first_step.startswith("SOURCING NUDGE:"):
        return True, None, None
        
    # Regex to extract: "SOURCING NUDGE: Reallocate X% capacity to [Backup Supplier Name] ([Location])..."
    match = re.search(r'to\s+([A-Za-z0-9\s\-&]+)\s*\(', first_step)
    if not match:
        return True, None, None
        
    supplier_name = match.group(1).strip()
    
    # Validate supplier_name against the Approved Supplier List (ASL)
    is_compliant = False
    for asl_sup in ASL_APPROVED_SUPPLIERS:
        if asl_sup.lower() in supplier_name.lower() or supplier_name.lower() in asl_sup.lower():
            is_compliant = True
            break
            
    if not is_compliant:
        return (
            False, 
            supplier_name, 
            f"FAA COMPLIANCE VIOLATION: Sourcing recommendation proposes non-ASL vendor '{supplier_name}' "
            f"which has not completed the required First Article Inspection (FAI) audits. Sourcing shift blocked."
        )
        
    return True, None, None
