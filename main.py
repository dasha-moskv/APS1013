from agents import (
    verify_supply_base,
    collect_public_signals,
    analyze_signals,
    score_signals,
    generate_disruption_cards,
    generate_mitigation_playbook
)

from utils import (
    print_disruption_cards,
    print_mitigation_playbook
)


def main():
    while True:
        print("\nWelcome to this Supplier Disruption Radar Agent\n")
        user_input = input("Please enter an industry supply base: ")

        print("\n==================================================")
        print("SYSTEM INFO")
        print("==================================================")
        print(f"Supply Base: {user_input}\n")

        print("Verifying supply base validity...")
        is_valid = verify_supply_base(user_input)

        if not is_valid:
            print("[X] Invalid supply base. Please try again.\n")
            continue

        print("[✓] Verified supply base")

        print("\nCollecting public disruption signals...")
        raw_signals = collect_public_signals(user_input)
        print("[✓] Signals collected")

        print("\nAnalyzing signals...")
        analyzed_signals = analyze_signals(raw_signals)
        print("[✓] Signals analyzed")

        print("\nScoring disruption risks...")
        scored_signals = score_signals(analyzed_signals)
        print("[✓] Risk scoring complete")

        print("\nGenerating disruption cards...")
        disruption_cards = generate_disruption_cards(scored_signals)
        print("[✓] Disruption cards generated")

        print("\nGenerating mitigation playbook...")
        mitigation_playbook = generate_mitigation_playbook(disruption_cards)
        print("[✓] Mitigation playbook generated\n")

        print("==================================================")
        print("DISRUPTION CARDS")
        print("==================================================")
        
        print_disruption_cards(disruption_cards)
        
        print("\n==================================================")
        print("MITIGATION PLAYBOOK")
        print("==================================================")

        print_mitigation_playbook(mitigation_playbook)

        print("\n==================================================")
        print("END OF REPORT")
        print("==================================================")

        run_again = input("\nWould you like to analyze another supply base? (y/n): ")

        if run_again.lower() != "y":
            print("Exiting Supplier Disruption Radar Agent.")
            break


if __name__ == "__main__":
    main()