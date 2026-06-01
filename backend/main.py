import os
import sys
from dotenv import load_dotenv
from agents import (
    supply_base_prompt,
    collect_public_signals,
    analyze_signals
)

from utils import (
    read_from_json,
    send_to_json
)

def main():  
 
    print("==================================================")
    print("RUN INFO")
    print("==================================================")
    
    supply_base = supply_base_prompt()
    print(f"Hard coded to Aircraft Propulsion Systems Supply Base for Boeing\n")
    print(f"We generate exactly 1 new entry\n")

    print("Reading current data...")
    current_json_data = read_from_json()

    print("Collecting public disruption signals...")
    #TODO: Convert from Fake signal to real signals
    raw_signal = collect_public_signals(supply_base, current_json_data) 
    print("[✓] Signals collected")

    print("\nAnalyzing signals...")
    #TODO: Time permitting, split card and playbook generation again. Make playbook generation more advanced
    new_data_to_display = analyze_signals(supply_base, current_json_data, raw_signal)
    print("[✓] Signals analyzed")
    
    send_to_json(new_data_to_display)
    print("[✓] New signal written to signals.json")
    

if __name__ == "__main__":
    main()