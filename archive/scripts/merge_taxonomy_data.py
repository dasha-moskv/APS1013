import json
import os

def get_taxonomy(signal_id):
    if not signal_id:
        return "External Infrastructure"
    if signal_id.startswith("FAC-001") or signal_id.startswith("FAC-003") or signal_id.startswith("SUP-771A"):
        return "Operations & Capacity"
    if signal_id.startswith("SUP-001A") or signal_id.startswith("SUP-109B") or signal_id.startswith("FAC-010") or signal_id.startswith("SUP-302B"):
        return "Logistics & Transit"
    if signal_id.startswith("SUP-401A") or signal_id.startswith("SUP-502A") or signal_id.startswith("SUP-404R") or signal_id.startswith("SUP-512S") or signal_id.startswith("SUP-212H"):
        return "Regulatory & Quality"
    return "External Infrastructure"

def process_file(filepath):
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    updated = False
    for item in data:
        if "category" not in item:
            item["category"] = get_taxonomy(item.get("id"))
            updated = True
            
    if updated:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
        print(f"Updated: {filepath}")
    else:
        print(f"No update needed: {filepath}")

if __name__ == "__main__":
    process_file("/Users/epheriami/Downloads/Projects/aps1013/projectv2/frontend/public/data/threatRegistry.json")
    process_file("/Users/epheriami/Downloads/Projects/aps1013/projectv2/backend/data/threatRegistry.json")
    process_file("/Users/epheriami/Downloads/Projects/aps1013/projectv2/backend/data/signals.json")
