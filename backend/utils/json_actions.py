import json
from pathlib import Path

def read_from_json():
    json_path = "../frontend/public/data/signals.json"

    with open(json_path, "r", encoding="utf-8") as f:
        return json.load(f)

def send_to_json(new_data_to_display):
    json_path = "../frontend/public/data/signals.json"

    with open(json_path, "r", encoding="utf-8") as f:
        current_data = json.load(f)

    current_data.append(new_data_to_display)

    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(current_data, f, indent=2)