import json
import os

def deduplicate_file(file_path):
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return
        
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception as e:
        print(f"Error loading {file_path}: {e}")
        return

    if not isinstance(data, list):
        print(f"Data in {file_path} is not a list")
        return

    initial_count = len(data)
    seen = set()
    deduplicated = []
    
    for item in data:
        if not isinstance(item, dict):
            deduplicated.append(item)
            continue
        # Define a unique key for deduplication based on facility and disruption
        key = (item.get("facility", ""), item.get("disruption", ""))
        if key not in seen:
            seen.add(key)
            deduplicated.append(item)
            
    final_count = len(deduplicated)
    
    if final_count < initial_count:
        try:
            with open(file_path, "w", encoding="utf-8") as f:
                json.dump(deduplicated, f, indent=2)
            print(f"[SUCCESS] Deduplicated {file_path}: {initial_count} -> {final_count} records (removed {initial_count - final_count} duplicates)")
        except Exception as e:
            print(f"Error writing {file_path}: {e}")
    else:
        print(f"[INFO] No duplicates found in {file_path} ({initial_count} records)")

def main():
    target_files = [
        "/Users/epheriami/Downloads/Projects/aps1013v3/frontend/public/data/signals.json",
        "/Users/epheriami/Downloads/Projects/aps1013v3/frontend/public/data/threatRegistry.json",
        "/Users/epheriami/Downloads/Projects/aps1013v3/backend/data/signals.json",
        "/Users/epheriami/Downloads/Projects/aps1013v3/backend/data/threatRegistry.json",
        "/Users/epheriami/Downloads/Projects/aps1013/project/frontend/dist/data/signals.json",
        "/Users/epheriami/Downloads/Projects/aps1013/project/frontend/dist/data/threatRegistry.json",
        "/Users/epheriami/Downloads/Projects/aps1013/project/frontend/public/data/signals.json",
        "/Users/epheriami/Downloads/Projects/aps1013/project/frontend/public/data/threatRegistry.json",
        "/Users/epheriami/Downloads/Projects/aps1013/project/backend/data/signals.json",
        "/Users/epheriami/Downloads/Projects/aps1013/project/backend/data/threatRegistry.json"
    ]
    
    for file_path in target_files:
        deduplicate_file(file_path)

if __name__ == "__main__":
    main()
