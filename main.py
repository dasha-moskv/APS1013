import os
import sys
from dotenv import load_dotenv
from agents import (
    verify_supply_base,
    collect_public_signals,
    analyze_signals,
    generate_mitigation_playbook_and_validation_plan
)

from utils import (
    print_disruption_cards,
    print_mitigation_playbook,
    print_validation_plan,
    TerminalLogger
)

def main():  
    logger = TerminalLogger()
    sys.stdout = logger

    try:
        while True:
            logger.clear()

            print("\nWelcome to this Supplier Disruption Radar Agent\n")
            supply_base = input("Please enter an industry supply base: ")

            print("\n==================================================")
            print("RUN INFO")
            print("==================================================")
            print(f"Supply Base: {supply_base}\n")

            print("Verifying supply base validity...")
            is_valid = verify_supply_base(supply_base)
            if is_valid:
                print("[✓] Verified Supply Base")
            else:
                print("[X] Invalid Supply Base")
                print("Please try again.\n")
                continue
            sys.exit(1)

            print("\nCollecting public disruption signals...")
            raw_signals = collect_public_signals(supply_base)
            print("[✓] Signals collected")

            print("\nAnalyzing signals...")
            disruption_cards = analyze_signals(raw_signals, supply_base)
            print("[✓] Signals analyzed")

            print("\nGenerating mitigation playbook and validation plan...")
            mitigation_playbook, validation_plan = generate_mitigation_playbook_and_validation_plan(disruption_cards, supply_base)
            print("[✓] Mitigation playbook and validation plan generated\n")

            print("==================================================")
            print("DISRUPTION CARDS")
            print("==================================================")

            print_disruption_cards(disruption_cards)

            print("\n==================================================")
            print("MITIGATION PLAYBOOK")
            print("==================================================")

            print_mitigation_playbook(mitigation_playbook)

            print("\n==================================================")
            print("VALIDATION PLAN")
            print("==================================================")

            print_validation_plan(validation_plan)

            print("\n==================================================")
            print("END OF REPORT")
            print("==================================================")

            save_to_file = input("\nWould you like to save the following output to a txt? (y/n): ")

            if save_to_file.lower() == "y":
                save_file_path = logger.save_to_file()
                print(f"Output saved to {save_file_path}\n")

            run_again = input("\nWould you like to analyze another supply base? (y/n): ")

            if run_again.lower() != "y":
                print("Exiting Supplier Disruption Radar Agent.")
                break
            else:
                os.system("cls" if os.name == "nt" else "clear")

    finally:
        sys.stdout = logger.terminal


if __name__ == "__main__":
    main()