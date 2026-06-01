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
    print(f"Hard coded to Aircraft Propulsion Systems Supply Base for Boeing<>\n")

    print("Collecting public disruption signals...")
    current_json_data = read_from_json()
    raw_signals = collect_public_signals() #TODO: Convert from Fake signal to real signals
    print("[✓] Signals collected")

    print("\nAnalyzing signals...")
    new_data_to_display = analyze_signals(supply_base, current_json_data, raw_signals)
    print("[✓] Signals analyzed")
    
    send_to_json(new_data_to_display)
    

if __name__ == "__main__":
    main()