from openai import OpenAI
from dotenv import load_dotenv
import os
import sys
import json

load_dotenv(override=True)
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

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
- Include realistic severity, likelihood, timeToHit, tier, location, coordinates, role, and status
- Include a mitigationPlan with exactly 3 steps and 1 timeline
- Include a validationPlan with exactly 3 steps and 1 timeline
- Keep the sources section exactly as TODO placeholders

SCORING GUIDANCE:
- severity: number from 1.0 to 10.0
- likelihood: integer from 0 to 100
- timeToHit: integer number of days until Boeing may feel the impact
- tier:
  - 0 = Boeing internal facility
  - 1 = direct supplier
  - 2 = supplier to supplier
  - 3 = upstream raw material or logistics dependency

THREAT CLASSIFICATION GUIDANCE
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
  "likelihood": 0,
  "timeToHit": 0,
  "tier": 1,
  "fullDescription": "Detailed explanation of the disruption and why it matters to Boeing.",
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
    }},
    {{
      "title": "TODO",
      "url": "TODO",
      "summary": "TODO"
    }},
    {{
      "title": "TODO",
      "url": "TODO",
      "summary": "TODO"
    }}
  ]
}}
"""
    return prompt


def analyze_signals(supply_base, current_json_data, raw_signal):

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
        except json.JSONDecodeError:
            print("[ERROR] Model returned invalid JSON:")
            print(result)
            sys.exit(1)

        return parsed_result

    except Exception as e:
        print(f"[ERROR] OpenAI API call failed at analyze_signals: {e}")
        sys.exit(1)
