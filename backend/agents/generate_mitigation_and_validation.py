from openai import OpenAI
from dotenv import load_dotenv
import os
import sys
import json
import re

load_dotenv(override=True)
api_key = os.getenv("OPENAI_API_KEY")
is_dummy = not api_key or api_key == "dummy-key" or len(api_key.strip()) == 0

if not is_dummy:
    client = OpenAI(api_key=api_key)
else:
    client = None

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
      "SOURCING NUDGE: Reallocate [Percentage]% capacity to [Backup Supplier Name] ([Location]). Target Activation: [Days] days. FAI Documentation: [Form/Certificate Name] required. [Action Detail]. Note: The [Backup Supplier Name] must be selected from the following FAA Approved Supplier List (ASL): CFM International, Safran, GE Aerospace, Rolls-Royce, Pratt & Whitney, Precision Castparts, Toray Industries, Hexcel, Alcoa, Honeywell Aerospace, Collins Aerospace, GKN Aerospace, Triumph Group, Moog, Woodward, or Spirit AeroSystems.",
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

def dynamic_fallback_playbook(disruption_cards):
    card = disruption_cards[0] if disruption_cards else {}
    facility = card.get("facility", "Target Supplier Node")
    daily_exposure = card.get("dailyExposure", 4500000)
    
    # Pre-certified ASL list matching various aerospace categories
    asl_list = [
        {"name": "Precision Castparts", "location": "Portland, OR", "form": "FAA Form 8130-3", "type": "Forgings"},
        {"name": "GE Aerospace", "location": "Cincinnati, OH", "form": "FAA Form 8130-3", "type": "Propulsion"},
        {"name": "Safran", "location": "Paris, FR", "form": "FAA Form 8130-3", "type": "Hydraulics"},
        {"name": "Rolls-Royce", "location": "Derby, UK", "form": "FAA Form 8130-3", "type": "Propulsion"},
        {"name": "Pratt & Whitney", "location": "East Hartford, CT", "form": "FAA Form 8130-3", "type": "Propulsion"},
        {"name": "Alcoa", "location": "Pittsburgh, PA", "form": "Form FAI-9021", "type": "Raw Material"},
        {"name": "Toray Industries", "location": "Tokyo, JP", "form": "Form FAI-7782", "type": "Composites"},
        {"name": "Spirit AeroSystems", "location": "Wichita, KS", "form": "FAA Form 8130-3", "type": "Structures"},
        {"name": "Honeywell Aerospace", "location": "Phoenix, AZ", "form": "FAA Form 8130-3", "type": "Avionics"}
    ]
    
    # Determine type of the facility from knowledge graph
    facility_type = "Forgings"
    kg_path = os.path.join(os.path.dirname(__file__), "..", "data", "knowledgeGraph.json")
    if os.path.exists(kg_path):
        try:
            with open(kg_path, "r", encoding="utf-8") as f:
                nodes = json.load(f).get("nodes", [])
                for node in nodes:
                    if node.get("label", "").lower() in facility.lower():
                        facility_type = node.get("type", "Forgings")
                        break
        except Exception:
            pass
            
    # Force a compliance breach if facility name suggests it (useful for Day 6 testing)
    if any(k in facility for k in ["Non-ASL", "Breach", "Uncertified"]):
        backup_name = "Mega Casting Corp"
        backup_loc = "Beijing, CN"
        form_name = "None (UNAPPROVED)"
        target_act = 60
        pct = 50
    else:
        # Find another supplier of the same type in the ASL
        backup = None
        for asl_sup in asl_list:
            if asl_sup["type"] == facility_type and asl_sup["name"].lower() not in facility.lower():
                backup = asl_sup
                break
        if not backup:
            # Pick any ASL supplier that is not the same supplier
            for asl_sup in asl_list:
                if asl_sup["name"].lower() not in facility.lower():
                    backup = asl_sup
                    break
        if not backup:
            backup = asl_list[0]
            
        backup_name = backup["name"]
        backup_loc = backup["location"]
        form_name = backup["form"]
        target_act = 15
        pct = 30
        
    buffer_inventory = card.get("bufferInventoryLevel", "8 days")
    days_match = re.search(r'(\d+)', buffer_inventory)
    buffer_days = int(days_match.group(1)) if days_match else 8
    target_inventory_days = buffer_days + 7
    
    mitigation_playbook = {
        "alternate_supplier_actions": [
            f"SOURCING NUDGE: Reallocate {pct}% capacity to {backup_name} ({backup_loc}). Target Activation: {target_act} days. FAI Documentation: {form_name} required. Shift allocations to pre-certified alternate vendor to stabilize production flow.",
            f"Execute dual-sourcing allocation checks and confirm capacity availability at backup facility ({backup_name})."
        ],
        "inventory_actions": [
            f"Adjust safety stock levels for parts from {facility} to achieve {target_inventory_days} days of coverage.",
            f"Verify warehouse buffer inventory release protocols and allocate parts to assembly lines to offset lead-time variance."
        ],
        "logistics_actions": [
            f"Initiate premium dedicated road convoy and custom fast-track routing from {backup_loc} to bypass transport bottleneck.",
            f"Confirm backup carrier agreements and assign freight billing codes to recovery cost center."
        ],
        "communication_actions": [
            f"Subject: [ACTION REQUIRED] Sourcing Shift - {facility}\n\nDear Team,\n\nWe are shifting {pct}% capacity to {backup_name} due to active disruption. Please verify tooling status.",
            f"Alert executive sponsors of daily stop-line cost exposure of ${daily_exposure/1000000:.1f}M and current buffer inventory gap."
        ]
    }
    
    validation_plan = {
        "source_validation": [
            f"Step 1: Cross-reference OSINT signal against secondary port status and rail reports for {facility}.",
            "Step 2: Connect to geofence transport streams to verify actual route stoppage."
        ],
        "supplier_validation": [
            f"Step 1: Dispatch Supplier Portal RFC survey to audit {backup_name} buffer capacity.",
            "Step 2: Schedule alignment call with supplier's Global Logistics Director."
        ],
        "risk_review": [
            f"Step 1: Convene board committee to review unmitigated exposure of ${daily_exposure/1000000:.1f}M and traveled-work trade-offs.",
            f"Step 2: Verify backup vendor {backup_name} ASL certification status before executing shift."
        ],
        "ongoing_monitoring": [
            "Step 1: Monitor strike bulletins and local labor portals daily for status updates.",
            "Step 2: Track lead-time variances and net coverage gaps on the SCRM dashboard."
        ]
    }
    
    return mitigation_playbook, validation_plan

def generate_mitigation_playbook_and_validation_plan(disruption_cards, supply_base):
    global client, is_dummy
    
    # Fallback immediately if client is not configured
    if is_dummy or client is None:
        return dynamic_fallback_playbook(disruption_cards)

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
            mitigation_playbook = parsed_result["mitigation_playbook"]
            validation_plan = parsed_result["validation_plan"]
            return mitigation_playbook, validation_plan
        except (json.JSONDecodeError, KeyError):
            print("[WARNING] Model returned invalid JSON or format. Falling back to dynamic generator.")
            return dynamic_fallback_playbook(disruption_cards)

    except Exception as e:
        print(f"[WARNING] OpenAI API call failed at generate_mitigation_playbook_and_validation_plan: {e}. Falling back to dynamic generator.")
        return dynamic_fallback_playbook(disruption_cards)