def print_disruption_cards(cards):
    for i, card in enumerate(cards, start=1):
        print(f"\nDISRUPTION CARD #{i}")
        print("--------------------------------------------------")
        print(f"Title: {card['title']}")
        print(f"Category: {card['category']}")
        print(f"Risk Score: {card['risk_score']} / 10")
        print(f"Likelihood: {card['likelihood']}")
        print(f"Impact: {card['impact']}")
        print(f"Time-To-Hit: {card['time_to_hit']}")
        print(f"Summary: {card['summary']}")
        print("--------------------------------------------------")


def print_mitigation_playbook(playbook):
    for i, action in enumerate(playbook, start=1):
        print(f"{i}. {action}")