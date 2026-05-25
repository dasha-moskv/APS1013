from openai import OpenAI
from dotenv import load_dotenv
import os
import sys

load_dotenv(override=True)
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def construct_prompt(supply_base):
    prompt = f"""
Determine whether the following input is a valid industry supply base, industrial sector,
supplier ecosystem, manufacturing domain, logistics network, or procurement category.

A valid supply base refers to a real-world industry, supply chain sector,
manufacturing ecosystem, service infrastructure, or category of suppliers
that organizations may depend on operationally.

Examples of VALID supply bases:

Technology & Electronics
- semiconductors
- printed circuit board manufacturing
- consumer electronics
- GPU manufacturing
- cloud computing infrastructure
- telecommunications equipment
- data center infrastructure
- battery manufacturing

Manufacturing & Industrial
- automotive manufacturing
- aerospace suppliers
- industrial machinery
- steel production
- chemical manufacturing
- plastics manufacturing
- robotics manufacturing
- heavy equipment suppliers

Healthcare & Life Sciences
- pharmaceuticals
- medical device manufacturing
- biotechnology suppliers
- hospital equipment suppliers
- laboratory supply chains
- healthcare logistics

Energy & Utilities
- oil and gas
- renewable energy suppliers
- solar panel manufacturing
- nuclear energy infrastructure
- electrical grid infrastructure
- lithium mining

Transportation & Logistics
- food distribution
- shipping and freight logistics
- rail transportation
- airline suppliers
- warehouse logistics
- port operations
- cold chain logistics

Consumer & Retail
- grocery supply chains
- textile manufacturing
- apparel suppliers
- retail distribution
- beverage manufacturing
- packaging suppliers

Construction & Materials
- construction materials
- cement suppliers
- lumber suppliers
- mining operations
- glass manufacturing

Agriculture & Food
- agriculture supply chains
- fertilizer suppliers
- dairy production
- seafood distribution
- grain suppliers
- food processing

Examples of INVALID inputs:
- hello
- banana123
- random nonsense
- what is the weather
- tell me a joke
- i like turtles
- 123456
- open the pod bay doors
- how are you
- purple monkey dishwasher

Input:
"{supply_base}"

Respond ONLY with:
VALID
or
INVALID
"""
    return prompt


def verify_supply_base(supply_base):
    prompt_string = construct_prompt(supply_base)

    try:
        response = client.responses.create(
            model="gpt-5.5",
            input=[
                {
                    "role": "system",
                    "content": (
                        "You are a strict supply chain validation assistant. "
                        "You must ONLY respond with VALID or INVALID."
                    )
                },
                {
                    "role": "user",
                    "content": prompt_string
                }
            ],
        )

        result = response.output_text.strip().upper()

        #print("===DEBUG===")
        #print(result)
        #print("===DEBUG===")

        if result == "VALID":
            return True
        else:
            return False
        
    except Exception as e:
        print(f"[ERROR] OpenAI API call failed at verify_supply_base: {e}")
        sys.exit(1) # Kill the program if an API call fails.