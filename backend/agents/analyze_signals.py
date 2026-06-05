from openai import OpenAI
from dotenv import load_dotenv
import os
import sys
import json
import re
import random

load_dotenv(override=True)
api_key = os.getenv("OPENAI_API_KEY")
is_dummy = not api_key or api_key == "dummy-key" or len(api_key.strip()) == 0

if not is_dummy:
    client = OpenAI(api_key=api_key)
else:
    client = None

def construct_prompt(supply_base, current_json_data, raw_signal):
    prompt = f"""
You are an expert aerospace supply chain risk analyst.

Your task is to generate ONE new JSON entry that can be appended to the existing signals.json file.

SUPPLY BASE CONTEXT:
{supply_base}

RAW DISRUPTION SIGNAL:
{raw_signal}

EXISTING JSON DATA:
{current_json_data}

INSTRUCTIONS:
Generate a new disruption card based on the raw disruption signal.

The new card must:
- Match the exact structure, field names, nesting, and style of the existing JSON data
- Be relevant to Boeing's Aircraft Propulsion Systems Supply Base
- Be realistic for aerospace manufacturing and supply chain monitoring
- Use a new unique id that does not already appear in the existing JSON
- Include realistic severity, severity_justification, likelihood, likelihood_justification, timeToHit, timeToHit_justification, tier, location, coordinates, role, and status
- Include a mitigationPlan with exactly 3 steps and 1 timeline
- Include a validationPlan with exactly 3 steps and 1 timeline
- Keep the sources section exactly as TODO placeholders

SCORING GUIDANCE:
- severity: number from 1.0 to 10.0
- severity_justification: explain why the severity score is appropriate based on operational, delivery, material, revenue, or production impact
- severity_factors: a list of exactly 2-3 short strings detailing the risk factors (e.g. "High daily exposure cost", "Single point of failure", "Downstream assembly line halt risk")
- likelihood: integer from 0 to 100
- likelihood_justification: explain why the likelihood score is appropriate based on whether the disruption is active, recurring, confirmed, emerging, or uncertain
- likelihood_factors: a list of exactly 2-3 short strings detailing the likelihood drivers (e.g. "Active labor strike", "Confirmed customs blockage")
- timeToHit: integer number of days until Boeing may feel the impact
- timeToHit_justification: explain why the impact is expected within that number of days based on inventory buffers, production cadence, logistics timing, or supplier recovery windows
- timeToHit_factors: a list of exactly 2-3 short strings detailing the hit window drivers (e.g. "12-day safety stock buffer", "5-day rail transit delay")
- tier:
  - 0 = Boeing internal facility
  - 1 = direct supplier
  - 2 = supplier to supplier
  - 3 = upstream raw material or logistics dependency

THREAT CLASSIFICATION GUIDANCE:
Critical threat
- color: "#D32F2F"
- status: "Critical threat"
- Use when the disruption is currently occurring or highly likely to occur.
- Expected impact to Boeing within 0-14 days.
- Likely to cause production delays, supplier shutdowns, delivery disruptions, material shortages, or operational interruptions.
- Typical severity: 8.0 - 10.0

Elevated Risk
- color: "#FFB300"
- status: "Elevated Risk"
- Use when the disruption is emerging but impacts are not yet fully realized.
- Expected impact to Boeing within 14-45 days.
- May affect supplier capacity, logistics, inventory, or material availability if conditions worsen.
- Typical severity: 5.0 - 7.9

Nominal
- color: "#86BC25"
- status: "Nominal"
- Use when the disruption signal represents a low-confidence risk, minor incident, or early warning indicator.
- No significant near-term impact expected.
- Typical severity: 0.0 - 4.9

JUSTIFICATION STYLE GUIDANCE:
- severity_justification should focus on the magnitude of downstream business or production impact.
- likelihood_justification should focus on how active, confirmed, recurring, or uncertain the disruption is.
- timeToHit_justification should focus on how quickly the disruption propagates into Boeing operations.
- Keep each justification to one clear sentence.
- Do not mention that an LLM generated the justification.

OUTPUT REQUIREMENTS:
- Return ONLY valid JSON
- Return exactly ONE JSON object
- Do NOT return a list
- Do NOT include markdown
- Do NOT include explanations
- Do NOT wrap the JSON in backticks

The output must follow this general shape:

{{
  "id": "SUP-XXXX",
  "facility": "Supplier or facility name",
  "location": "City/Region, Country",
  "disruption": "Short disruption title",
  "severity": 0.0,
  "severity_justification": "One sentence explaining the severity score.",
  "severity_factors": [
    "Factor 1",
    "Factor 2"
  ],
  "likelihood": 0,
  "likelihood_justification": "One sentence explaining the likelihood score.",
  "likelihood_factors": [
    "Factor 1",
    "Factor 2"
  ],
  "timeToHit": 0,
  "timeToHit_justification": "One sentence explaining the time-to-hit score.",
  "timeToHit_factors": [
    "Factor 1",
    "Factor 2"
  ],
  "tier": 1,
  "fullDescription": "Detailed explanation of the disruption and why it matters to Boeing.",
  "downstreamBusinessImpact": "Brief summary of how this affects downstream production or revenue.",
  "mitigationObjective": "The primary goal of the response strategy.",
  "sourceData": "Public or simulated source data description",
  "mapPosition": {{
    "coordinates": [0.0, 0.0],
    "color": "#FFB300",
    "role": "Tier-X / Role",
    "status": "Elevated Risk"
  }},
  "playbook": {{
    "mitigationPlan": {{
      "steps": [
        "Step 1.",
        "Step 2.",
        "Step 3."
      ],
      "timeline": "Realistic mitigation timeline"
    }},
    "validationPlan": {{
      "steps": [
        "Step 1.",
        "Step 2.",
        "Step 3."
      ],
      "timeline": "Realistic validation timeline"
    }}
  }},
  "sources": [
    {{
      "title": "TODO",
      "url": "TODO",
      "summary": "TODO"
    }}
  ]
}}
"""
    return prompt

def dynamic_fallback_analyze(raw_signal):
    # Load knowledge graph
    kg_path = os.path.join(os.path.dirname(__file__), "..", "data", "knowledgeGraph.json")
    nodes = []
    if os.path.exists(kg_path):
        try:
            with open(kg_path, "r", encoding="utf-8") as f:
                nodes = json.load(f).get("nodes", [])
        except Exception:
            pass
            
    # Default node in case of no match
    target_node = {
        "id": "SUP-000",
        "label": "Propulsion Components Facility",
        "type": "Propulsion",
        "tier": 2,
        "location": "Seattle, WA, US",
        "coordinates": [-122.3321, 47.6062],
        "dailyExposure": 4500000,
        "slaThresholdDays": 12,
        "bufferInventoryLevel": "8 days"
    }
    
    # Search for matching node name in signal text
    for node in nodes:
        label = node.get("label", "")
        # Remove common suffixes like plc, Corp, Inc., Co. to make matching more robust
        clean_label = re.sub(r'\b(plc|corp|pcc|inc|co|ltd|refinery|industries)\b', '', label, flags=re.IGNORECASE).strip()
        if clean_label.lower() in raw_signal.lower() or node.get("id").lower() in raw_signal.lower():
            target_node = node
            break
            
    # Parse status and color based on keywords
    status = "Elevated Risk"
    color = "#FFB300"
    
    sig_lower = raw_signal.lower()
    if any(k in sig_lower for k in ["strike", "shutdown", "halt", "closed", "fire", "rupture"]):
        status = "Critical threat"
        color = "#D32F2F"
    elif any(k in sig_lower for k in ["delay", "bottleneck", "disrupt", "restriction", "shortage"]):
        status = "Elevated Risk"
        color = "#FFB300"
    else:
        status = "Nominal"
        color = "#86BC25"
        
    # Calculate Severity
    daily_exp = target_node.get("dailyExposure", 4500000)
    tier = target_node.get("tier", 1)
    
    # Base severity by tier
    if tier == 0:
        base_sev = 9.0
    elif tier == 1:
        base_sev = 7.5
    elif tier == 2:
        base_sev = 5.5
    else:
        base_sev = 3.5
        
    # Adjust severity by exposure
    exp_factor = min(2.0, daily_exp / 10000000)
    severity = min(10.0, base_sev + exp_factor)
    severity = round(severity, 1)
    
    # Likelihood calculation
    if status == "Critical threat":
        likelihood = random.randint(85, 98)
    elif status == "Elevated Risk":
        likelihood = random.randint(55, 78)
    else:
        likelihood = random.randint(15, 38)
        
    # Time to Hit calculation
    buffer_str = target_node.get("bufferInventoryLevel", "8 days")
    days_match = re.search(r'(\d+)', buffer_str)
    buffer_days = int(days_match.group(1)) if days_match else 8
    
    if "labor" in sig_lower or "strike" in sig_lower:
        time_to_hit = max(0, buffer_days - 2)
    elif "shipping" in sig_lower or "transit" in sig_lower or "port" in sig_lower:
        time_to_hit = max(0, buffer_days + 4)
    else:
        time_to_hit = buffer_days
        
    # Generate unique ID
    rand_id = f"SUP-{random.randint(100, 999)}{chr(random.randint(65, 90))}"
    
    # Format justifications
    severity_just = f"Severity score reflects {target_node['label']}'s daily stop-line exposure of ${daily_exp/1000000:.1f}M for downstream aircraft final assembly."
    likelihood_just = f"Likelihood rated at {likelihood}% based on confirmed active disruption signals affecting the facility."
    hit_just = f"Impact expected in {time_to_hit} days based on current {buffer_str} buffer inventory at Boeing Everett."
    
    # Generate structured fallbacks for playbooks
    mitigation_steps = [
        f"SOURCING NUDGE: Reallocate 30% capacity to Precision Castparts (Portland, OR). Target Activation: 14 days. FAI Documentation: FAA Form 8130-3 required. Shift allocations to pre-certified alternate vendor to stabilize production flow.",
        f"Increase buffer inventory levels at regional transit depots to 15 days of coverage.",
        f"Establish expedited flatbed road convoy routes to bypass current transit blockages."
    ]
    
    validation_steps = [
        f"Step 1: Cross-reference OSINT signals against Port Authority RSS feeds and SCADA status screens.",
        f"Step 2: Dispatch Supplier Portal surveys to verify current inventory holdings.",
        f"Step 3: Schedule urgent review meeting with Boeing Quality Assurance and FAA representatives."
    ]
    
    analyzed_card = {
        "id": rand_id,
        "facility": target_node["label"],
        "location": target_node["location"],
        "disruption": raw_signal.split("—")[0].strip()[:80],
        "severity": severity,
        "severity_justification": severity_just,
        "severity_factors": [
            "High daily exposure cost",
            f"{target_node['type']} supply constraint",
            "Single point of failure"
        ],
        "likelihood": likelihood,
        "likelihood_justification": likelihood_just,
        "likelihood_factors": [
            "Active disruption event",
            "High verification confidence"
        ],
        "timeToHit": time_to_hit,
        "timeToHit_justification": hit_just,
        "timeToHit_factors": [
            f"{buffer_str} buffer inventory",
            "Lead time variance"
        ],
        "tier": tier,
        "fullDescription": raw_signal,
        "downstreamBusinessImpact": f"Disruption at {target_node['label']} affects the supply of critical {target_node['type']} assemblies, threatening production schedules at Boeing Everett.",
        "mitigationObjective": f"Protect downstream assembly schedules by securing alternate supplier capacity for {target_node['type']} parts.",
        "sourceData": "Dynamic Rule-Based Heuristic Processor",
        "mapPosition": {
            "coordinates": target_node["coordinates"],
            "color": color,
            "role": f"Tier-{tier} / {target_node['type']}",
            "status": status
        },
        "playbook": {
            "mitigationPlan": {
                "steps": mitigation_steps,
                "timeline": f"{time_to_hit + 5} days"
            },
            "validationPlan": {
                "steps": validation_steps,
                "timeline": "24 hours"
            }
        },
        "sources": [
            {
                "title": "OSINT Signal Feed",
                "url": "http://localhost:8000/api/signals",
                "summary": "Disruption detected via OSINT automated crawlers."
            }
        ]
    }
    
    return analyzed_card

def analyze_signals(supply_base, current_json_data, raw_signal):
    global client, is_dummy
    
    # Fallback immediately if client is not configured
    if is_dummy or client is None:
        return dynamic_fallback_analyze(raw_signal)
        
    prompt_string = construct_prompt(
        supply_base,
        current_json_data,
        raw_signal
    )

    try:
        response = client.responses.create(
            model="gpt-5.5",
            input=[
                {
                    "role": "system",
                    "content": (
                        "You are a supply chain risk analyst. "
                        "You classify disruption signals using a clear taxonomy and explain their relevance "
                        "to a specific supply base. Always return only valid JSON."
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
            return parsed_result
        except json.JSONDecodeError:
            print("[WARNING] Model returned invalid JSON. Falling back to dynamic heuristic generator.")
            return dynamic_fallback_analyze(raw_signal)

    except Exception as e:
        print(f"[WARNING] OpenAI API call failed at analyze_signals: {e}. Falling back to dynamic heuristic generator.")
        return dynamic_fallback_analyze(raw_signal)
