import json
from pathlib import Path

def get_signals_path():
    base_dir = Path(__file__).resolve().parent.parent
    data_dir = base_dir / "data"
    data_dir.mkdir(exist_ok=True)
    return data_dir / "signals.json"

def read_from_json():
    json_path = get_signals_path()
    
    # Fallback to copy from frontend template if it doesn't exist
    if not json_path.exists():
        frontend_path = Path(__file__).resolve().parent.parent.parent / "frontend" / "public" / "data" / "signals.json"
        if frontend_path.exists():
            import shutil
            shutil.copy(frontend_path, json_path)
            
    with open(json_path, "r", encoding="utf-8") as f:
        return json.load(f)

def send_to_json(new_data_to_display):
    json_path = get_signals_path()

    with open(json_path, "r", encoding="utf-8") as f:
        current_data = json.load(f)

    current_data.append(new_data_to_display)

    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(current_data, f, indent=2)