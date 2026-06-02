from openai import OpenAI
from dotenv import load_dotenv
import os
import sys

load_dotenv(override=True)
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def construct_prompt(supply_base, current_json_data):
    prompt = f"""
You are an aerospace supply chain disruption intelligence analyst.

SUPPLY BASE:

{supply_base}

EXISTING SIGNALS:

{current_json_data}

TASK:

Generate EXACTLY ONE new disruption signal that is NOT already represented in the existing signals.

The disruption must be relevant to Boeing's Aircraft Propulsion Systems Supply Base.

Good categories include:
- supplier quality issues
- labor disputes
- material shortages
- logistics disruptions
- export restrictions
- natural disasters
- cyber incidents
- regulatory actions
- manufacturing bottlenecks
- energy disruptions
- transportation delays

Requirements:

- Output exactly ONE sentence.
- No numbering.
- No bullets.
- No explanation.
- No quotation marks.
- Make it specific.
- Make it realistic.
- Make it distinct from existing signals.
- The output should resemble a news headline or intelligence summary.

Examples:

Nickel superalloy shortages following export restrictions increase lead times for aerospace turbine manufacturers

Labor negotiations at a major engine supplier threaten production schedules for widebody aircraft programs

Severe flooding near a titanium processing facility disrupts deliveries of aerospace-grade forgings

Return ONLY the disruption signal.
"""
    return prompt


def collect_public_signals(supply_base, current_json_data):
    prompt_string = construct_prompt(supply_base, current_json_data) 

    try:
        response = client.responses.create(
            model="gpt-5.5",
            input=[
                {
                    "role": "system",
                    "content": (
                        "You are a supply chain disruption intelligence assistant."
                    )
                },
                {
                    "role": "user",
                    "content": prompt_string
                }
            ],
        )

        result = response.output_text.strip()

        #print("===DEBUG===")
        #print(result)
        #print("===DEBUG===")

        # Convert response into list
        signals = [
            line.strip("- ").strip()
            for line in result.splitlines()
            if line.strip()
        ]

        return signals
        
    except Exception as e:
        print(f"[ERROR] OpenAI API call failed at supply_base_prompt: {e}")
        sys.exit(1) # Kill the program if an API call fails.

