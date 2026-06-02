import textwrap

def print_disruption_cards(cards):
    for i, card in enumerate(cards, start=1):

        affected_regions = ", ".join(card["affected_region"])
        affected_suppliers = ", ".join(card["affected_suppliers"])
        impacted_components = ", ".join(card["impacted_components"])

        wrapped_summary = textwrap.fill(
            card["summary"],
            width=70
        )

        print(f"\nDISRUPTION CARD #{i}")
        print("--------------------------------------------------")

        print(f"Title: {card['title']}")
        print(f"Category: {card['category']}")
        print(f"Risk Score: {card['risk_score']} / 10")

        print(f"Likelihood: {card['likelihood']}")
        print(f"Impact: {card['impact']}")

        print(f"Affected Regions: {affected_regions}")
        print(f"Affected Suppliers: {affected_suppliers}")

        print(f"Impacted Components: {impacted_components}")

        print(f"Time-To-Hit: {card['time_to_hit']}")

        print("Summary:")
        print(wrapped_summary)

        print("--------------------------------------------------")


def print_mitigation_playbook(playbook):
    for section_name, actions in playbook.items():
        formatted_section_name = section_name.replace("_", " ").title()

        print(f"\n{formatted_section_name}")
        print("-" * len(formatted_section_name))

        for i, action in enumerate(actions, start=1):
            print(f"{i}. {action}")


def print_validation_plan(validation_plan):
    for section_name, steps in validation_plan.items():
        formatted_section_name = section_name.replace("_", " ").title()

        print(f"\n{formatted_section_name}")
        print("-" * len(formatted_section_name))

        for i, step in enumerate(steps, start=1):
            print(f"{i}. {step}")