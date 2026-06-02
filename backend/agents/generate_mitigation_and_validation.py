from openai import OpenAI
from dotenv import load_dotenv
import os
import sys
import json

load_dotenv(override=True)
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def construct_prompt(disruption_cards, supply_base):
    prompt = f"""
You are a top-tier supply chain resilience analyst (combining McKinsey supply chain restructuring expertise with Everstream predictive insights) creating a highly detailed mitigation playbook and validation plan.

Supply Base:
{supply_base}

Disruption Cards:
{json.dumps(disruption_cards, indent=2)}

Generate an advanced, comprehensive mitigation playbook and validation plan that directly addresses the highest-risk disruption cards.

Return ONLY valid JSON in this exact format:

{{
  "mitigation_playbook": {{
    "alternate_supplier_actions": [
      "Detail a highly specific alternate sourcing play (e.g., qualifying a secondary ASL partner, tooling shifting steps, FAI prep). Must specify the exact alternative supplier (pre-certified from ASL), concrete First Article Inspection (FAI) documentation requirements, and target timeline for tool re-allocation.",
      "Detail another specific backup play (e.g., dual-sourcing allocation limits, temporary parts substitution under FAA bounds). Include quantitative capacity splits (e.g., 60/40 volume distribution) and compliance verification details."
    ],
    "inventory_actions": [
      "Specify exact safety stock adjustments. Quantify the target inventory levels in parts and 'Days of Coverage'. Calculate the Time-to-Survive (TTS) based on current safety stock and pipeline burn rates.",
      "Detail warehouse allocation plans. Outline buffer allocations in regional transit depots, buffer release triggers, and prioritizations for high-severity parts to preserve final assembly line velocity."
    ],
    "logistics_actions": [
      "Detail an expedited premium logistics routing. Specify the exact transport mode (e.g., Dedicated Air Charter, Oversize Flatbed Road Convoy with police escorts) and route bypasses, calculating direct transit time saved.",
      "Detail port or rail terminal bypasses. Outline backup hub coordinates, customs fast-track arrangements, and secondary carrier agreements to minimize transport blockages."
    ],
    "communication_actions": [
      "Generate a complete, ready-to-send Supplier Outreach Email Draft to a key Tier-1 contact. Include a professional subject line and a detailed body template asking for capacity verification, current flatbed availability, and tooling status.",
      "Generate an internal executive advisory statement summarizing the daily stop-line cost ($8.8M/day for Renton, $14.5M/day for Everett), contractual SLA penalties, and exact escalation triggers to top management."
    ]
  }},
  "validation_plan": {{
    "source_validation": [
      "Step 1: Cross-reference this OSINT signal against secondary independent data sources (such as Lloyd's List, BNSF rail status portals, local port authority RSS feeds, or regional meteorological alerts) to confirm syntactic integrity.",
      "Step 2: Connect directly to SCADA/IoT transport streams and geofence tracking webhooks to verify actual corridor stoppage dimensions."
    ],
    "supplier_validation": [
      "Step 1: Deploy automated Supplier Portal RFC surveys to audit actual supplier buffer capacities and operating statuses.",
      "Step 2: Schedule a mandatory 4-hour alignment call with the supplier's Global Logistics Director to verify flatbed carrier commitments."
    ],
    "risk_review": [
      "Step 1: Convene a boardroom risk governance committee to review unmitigated exposure calculations, scoring assumptions, and traveled-work labor trade-offs.",
      "Step 2: Formally audit all compliance checklist points for FAA Type Certificate bounds and ASL status compliance before executing capacity shifts."
    ],
    "ongoing_monitoring": [
      "Step 1: Set up continuous automated crawlers tracking local labor portals and strike negotiation bulletins to monitor the disruption status.",
      "Step 2: Monitor ongoing lead-times, transit variances, and TTR vs. TTS margins reactively via the SCRM dashboard."
    ]
  }}
}}

Mitigation playbook requirements:
- Alternate supplier actions must identify backup sourcing, dual-sourcing, qualification, or supplier substitution.
- Inventory actions must address buffer stock, safety stock, allocation, purchase timing, or critical component prioritization.
- Logistics actions must address routing, freight mode, port/region alternatives, lead times, and shipment prioritization.
- Communication actions must address procurement, suppliers, operations, leadership, and customer/stakeholder updates.
- All actions must be highly specific, professional, and contain rich, detailed operational steps and quantitative details (e.g., TTR, TTS, costs, carrier names). Avoid generic advice.

Validation plan requirements:
- Source validation must verify public signals through multiple independent sources.
- Supplier validation must include supplier outreach, confirmation, or capacity checks.
- Risk review must include human review of high-risk cards and scoring assumptions.
- Ongoing monitoring must describe how risks will be tracked over time.
- All validation steps must be rigorous, precise, and practical for aerospace operations. Avoid generic advice.

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