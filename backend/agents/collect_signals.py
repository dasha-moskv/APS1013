from openai import OpenAI
from dotenv import load_dotenv
import os
import sys

load_dotenv(override=True)
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def construct_prompt(supply_base):
    prompt = f"""
You are an expert supply chain disruption intelligence analyst.

Your task is to generate realistic public disruption signals affecting or potentially affecting a given industry supply base.

A disruption signal represents a real-world operational risk, instability event, or emerging issue that could negatively impact:
- manufacturing
- logistics
- procurement
- distribution
- production capacity
- supplier reliability
- transportation
- material availability
- global operations

Supply Base:
{supply_base}

Possible categories of disruption signals include:
- geopolitical instability
- natural disasters
- labor strikes
- trade restrictions
- tariffs and sanctions
- logistics bottlenecks
- raw material shortages
- cyberattacks
- regulatory actions
- manufacturing slowdowns
- energy instability
- port congestion
- transportation delays
- rising demand pressures
- environmental risks
- political tensions
- infrastructure failures

Requirements:
- Generate EXACTLY 10 disruption signals
- Each signal must be one sentence
- Each signal must be realistic and specific
- Focus on operational and supply chain risk
- Avoid generic business language
- Avoid explanations or introductions
- Do NOT number the signals
- Do NOT include bullet points
- Do NOT repeat similar ideas
- Signals should resemble real-world news headlines or intelligence summaries

EXAMPLE OUTPUT FORMAT:

Taiwan earthquake risks disrupting advanced semiconductor fabrication facilities
Red Sea shipping instability causing delays in electronics freight movement
Export restrictions on rare earth materials increasing procurement uncertainty
Rising AI infrastructure demand creating GPU substrate shortages
Labor strikes at major European ports slowing automotive component distribution

Return ONLY the 10 disruption signals in the exact format shown above.
"""
    return prompt


def collect_public_signals(supply_base):
    prompt_string = construct_prompt(supply_base)

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
        print(f"[ERROR] OpenAI API call failed at verify_supply_base: {e}")
        sys.exit(1) # Kill the program if an API call fails.

