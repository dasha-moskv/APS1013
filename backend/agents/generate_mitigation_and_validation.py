from openai import OpenAI
from dotenv import load_dotenv
import os
import sys
import json

load_dotenv(override=True)
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def construct_prompt(disruption_cards, supply_base):
    prompt = f"""
You are a supply chain resilience analyst creating a mitigation playbook and validation plan.

Supply Base:
{supply_base}

Disruption Cards:
{json.dumps(disruption_cards, indent=2)}

Generate a mitigation playbook and validation plan that directly address the highest-risk disruption cards.

Return ONLY valid JSON in this exact format:

{{
  "mitigation_playbook": {{
    "alternate_supplier_actions": [
      "action 1",
      "action 2",
      "action 3"
    ],
    "inventory_actions": [
      "action 1",
      "action 2",
      "action 3"
    ],
    "logistics_actions": [
      "action 1",
      "action 2",
      "action 3"
    ],
    "communication_actions": [
      "action 1",
      "action 2",
      "action 3"
    ]
  }},
  "validation_plan": {{
    "source_validation": [
      "step 1",
      "step 2"
    ],
    "supplier_validation": [
      "step 1",
      "step 2"
    ],
    "risk_review": [
      "step 1",
      "step 2"
    ],
    "ongoing_monitoring": [
      "step 1",
      "step 2"
    ]
  }}
}}

Mitigation playbook requirements:
- Alternate supplier actions must identify backup sourcing, dual-sourcing, qualification, or supplier substitution.
- Inventory actions must address buffer stock, safety stock, allocation, purchase timing, or critical component prioritization.
- Logistics actions must address routing, freight mode, port/region alternatives, lead times, and shipment prioritization.
- Communication actions must address procurement, suppliers, operations, leadership, and customer/stakeholder updates.
- Actions must be specific to the supply base and disruption cards.
- Avoid generic advice.

Validation plan requirements:
- Source validation must verify public signals through multiple independent sources.
- Supplier validation must include supplier outreach, confirmation, or capacity checks.
- Risk review must include human review of high-risk cards and scoring assumptions.
- Ongoing monitoring must describe how risks will be tracked over time.
- Avoid generic advice.

Do not include markdown.
Do not include code fences.
Do not include text outside the JSON.
"""
    return prompt


def generate_mitigation_playbook_and_validation_plan(disruption_cards, supply_base):
    prompt_string = construct_prompt(disruption_cards, supply_base)

    try:
        response = client.responses.create(
            model="gpt-5.5",
            input=[
                {
                    "role": "system",
                    "content": (
                        "You are an expert supply chain resilience analyst. "
                        "You generate practical mitigation playbooks and validation plans "
                        "based on structured disruption cards. "
                        "Always return only valid JSON."
                    )
                },
                {
                    "role": "user",
                    "content": prompt_string
                }
            ],
        )

        result = response.output_text.strip()

        try:
            parsed_result = json.loads(result)
        except json.JSONDecodeError:
            print("[ERROR] Model returned invalid JSON:")
            print(result)
            sys.exit(1)

        mitigation_playbook = parsed_result["mitigation_playbook"]
        validation_plan = parsed_result["validation_plan"]

        return mitigation_playbook, validation_plan

    except Exception as e:
        print(f"[ERROR] OpenAI API call failed at generate_mitigation_playbook_and_validation_plan: {e}")
        sys.exit(1)