from openai import OpenAI
from dotenv import load_dotenv
import os
import sys
import json

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def construct_prompt(single_signal, supply_base):
    prompt = f"""
You are an expert supply chain risk analyst working for a Supplier Disruption Radar Agent.

Your task is to analyze a disruption signal and determine how it may impact the specified supply base.

==================================================
SUPPLY BASE
==================================================
{supply_base}

==================================================
RAW DISRUPTION SIGNAL
==================================================
{single_signal}

==================================================
ANALYSIS OBJECTIVE
==================================================

Analyze the disruption signal specifically in the context of the provided supply base.

Your analysis should determine:
- what the disruption is
- how severe it is
- how likely it is to affect the supply base
- which suppliers/components/regions may be impacted
- how quickly the disruption may affect operations

Use realistic supply chain reasoning.

Consider:
- logistics exposure
- supplier dependencies
- manufacturing bottlenecks
- geopolitical implications
- operational impact
- semiconductor/material/component shortages
- transportation disruptions
- urgency and timing

==================================================
TAXONOMY CATEGORIES
==================================================

The category field MUST be EXACTLY one of:

- Natural Disaster
- Logistics / Transportation
- Geopolitical
- Financial
- Manufacturing / Operations
- Supplier Capacity
- Cybersecurity
- Regulatory / Compliance
- Quality / Recall
- Workforce / Labor
- Environmental / Sustainability
- Market Demand Shock
- Other

==================================================
RISK SCORING RULES
==================================================

The risk_score field must:
- be a float between 1.0 and 10.0
- represent overall supply chain risk
- consider:
    - likelihood
    - operational impact
    - urgency
    - relevance to the supply base
    - confidence in the disruption

Higher scores should represent:
- severe operational impact
- high likelihood
- short time-to-hit
- strong relevance to the supply base

Low relevance signals should receive lower scores even if globally significant.

==================================================
OUTPUT REQUIREMENTS
==================================================

Return ONLY valid JSON.

Do NOT include:
- markdown
- code fences
- explanations
- bullet points
- extra text

The JSON MUST match EXACTLY this structure:

{{
  "title": "short professional disruption title",
  "category": "taxonomy category",
  "risk_score": 8.4,
  "likelihood": "Low | Medium | High",
  "impact": "Low | Medium | High",
  "affected_region": [
    "region 1",
    "region 2"
  ],
  "affected_suppliers": [
    "supplier 1",
    "supplier 2"
  ],
  "impacted_components": [
    "component 1",
    "component 2"
  ],
  "time_to_hit": "Immediate | 1-2 weeks | 2-4 weeks | 1-2 months | 3+ months",
  "summary": "2-3 sentence explanation describing why this disruption matters for the specified supply base"
}}

Ensure:
- the JSON is syntactically valid
- all fields are populated
- arrays are always arrays
- risk_score is numeric
- the summary is concise but informative
"""
    return prompt


def analyze_signals(signals, supply_base):
    analyzed_signals = []

    for signal in signals:
        prompt_string = construct_prompt(signal, supply_base)

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

            analyzed_signals.append(parsed_result)

        except Exception as e:
            print(f"[ERROR] OpenAI API call failed at analyze_signals: {e}")
            sys.exit(1)

    return analyzed_signals
