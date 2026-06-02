import os
import json
import random
import asyncio
import time
import shutil
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sse_starlette.sse import EventSourceResponse
from dotenv import load_dotenv

# Import our agents and utilities
from agents import (
    supply_base_prompt,
    collect_public_signals,
    analyze_signals
)
from utils import (
    read_from_json,
    send_to_json
)

load_dotenv(override=True)

app = FastAPI(title="Aerospace Supply Chain Risk Portal API")

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Resolve dynamic backend-isolated directories
BACKEND_ROOT = Path(__file__).resolve().parent
DATA_DIR = BACKEND_ROOT / "data"
DATA_DIR.mkdir(exist_ok=True)

THREAT_REGISTRY_PATH = DATA_DIR / "threatRegistry.json"
SIGNALS_PATH = DATA_DIR / "signals.json"

# Copy baseline JSON databases from frontend assets folder if not present
FRONTEND_DATA_DIR = BACKEND_ROOT / ".." / "frontend" / "public" / "data"
if FRONTEND_DATA_DIR.exists():
    if not THREAT_REGISTRY_PATH.exists() and (FRONTEND_DATA_DIR / "threatRegistry.json").exists():
        shutil.copy(FRONTEND_DATA_DIR / "threatRegistry.json", THREAT_REGISTRY_PATH)
    if not SIGNALS_PATH.exists() and (FRONTEND_DATA_DIR / "signals.json").exists():
        shutil.copy(FRONTEND_DATA_DIR / "signals.json", SIGNALS_PATH)

# Highly realistic fallback supply base signals when OpenAI is not configured
MOCK_POOL = [
    {
        "id": "SUP-994A",
        "facility": "Derby Foundry Ltd",
        "location": "Derby, UK",
        "disruption": "Turbine blade casting kiln shutdown due to refractory brick failure",
        "severity": 8.4,
        "likelihood": 90,
        "timeToHit": 14,
        "tier": 1,
        "fullDescription": "Kiln #3 at the Derby casting yard suffered a structural collapse of its high-temperature refractory lining. Turbine blade casting runs are suspended indefinitely, risking supply gaps for widebody programs.",
        "sourceData": "Factory IoT Kiln Status Feed: DERBY-KILN-03-ERR & Maintenance Log",
        "mapPosition": {
            "coordinates": [-1.4552, 52.8931],
            "color": "#D32F2F",
            "role": "Tier-1 / Casting",
            "status": "Critical threat"
        },
        "playbook": {
            "mitigationPlan": {
                "steps": [
                    "Transfer priority molding dies to backup casting facility in Munich.",
                    "Authorize overtime pay for engineering teams repairing Kiln #3.",
                    "Utilize reserve turbine blade safety stock held at Schiphol hub."
                ],
                "timeline": "6 to 8 business days for complete kiln liner replacement"
            },
            "validationPlan": {
                "steps": [
                    "Inspect thermal imaging logs of Kiln #3 during heat-up cycles to verify insulation integrity.",
                    "Perform non-destructive stress testing on the first batch of replacement castings.",
                    "Audit casting quality and dimensions against FAA approved specification sheets."
                ],
                "timeline": "2 business days for thermal certification and quality sign-off"
            }
        },
        "downstreamImpact": "Threatens core SLA commitments and operational run-rates at primary integration hubs. Direct exposure includes potential line halts, contract liquidation penalties, and customer delivery buffer depletion.",
        "mitigationObjective": "Establish immediate redundant routing profiles, secure spot-market raw precursor supplies, and activate pre-audited storage buffer releases to protect final product delivery schedules."
    },
    {
        "id": "SUP-221B",
        "facility": "Alcoa Smelting",
        "location": "Reykjavik, IS",
        "disruption": "Geothermal power grid surge triggers electrolytic cell freeze",
        "severity": 7.6,
        "likelihood": 85,
        "timeToHit": 30,
        "tier": 2,
        "fullDescription": "A severe geothermal grid surge caused a localized power outage at the Reykjavik smelter, resulting in the cooling and solidifying of raw aluminum within 12 electrolytic cells.",
        "sourceData": "Power Grid SCADA Alert: REYK-SMELT-PWR & Smelter Operations Stream",
        "mapPosition": {
            "coordinates": [-21.8277, 64.1265],
            "color": "#FFB300",
            "role": "Tier-2 / Raw Materials",
            "status": "Elevated Risk"
        },
        "playbook": {
            "mitigationPlan": {
                "steps": [
                    "Procure raw refined ingots from secondary smelter in Trondheim, Norway.",
                    "Initiate heavy machinery clearing of frozen electrolytic cells.",
                    "Re-route incoming bauxite shipments to operational Baltic processors."
                ],
                "timeline": "3 to 4 weeks for complete cell cleaning and restart"
            },
            "validationPlan": {
                "steps": [
                    "Verify power supply stability metrics and install secondary surge protective relays.",
                    "Inspect re-started electrolytic cells for lining degradation or heat cracks.",
                    "Audit physical properties of the first aluminum batches produced after the restart."
                ],
                "timeline": "5 days of continuous operations quality tracking"
            }
        },
        "downstreamImpact": "Threatens core SLA commitments and operational run-rates at primary integration hubs. Direct exposure includes potential line halts, contract liquidation penalties, and customer delivery buffer depletion.",
        "mitigationObjective": "Establish immediate redundant routing profiles, secure spot-market raw precursor supplies, and activate pre-audited storage buffer releases to protect final product delivery schedules."
    }
]

@app.get("/api/threat-registry")
def get_threat_registry():
    try:
        with open(THREAT_REGISTRY_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading threat registry: {e}")

@app.get("/api/signals")
def get_signals():
    try:
        with open(SIGNALS_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading signals: {e}")

@app.post("/api/signals/simulate")
def simulate_signal():
    try:
        # Check if OpenAI Key is configured to run real agents
        if os.getenv("OPENAI_API_KEY"):
            try:
                supply_base = supply_base_prompt()
                current_json_data = read_from_json()
                raw_signal = collect_public_signals(supply_base, current_json_data) 
                new_data = analyze_signals(supply_base, current_json_data, raw_signal)
                send_to_json(new_data)
                return new_data
            except Exception as agent_err:
                print(f"[WARN] Agent pipeline failed: {agent_err}. Falling back to pre-configured pool.")
        
        # Safe premium fallback generator
        fallback = random.choice(MOCK_POOL).copy()
        fallback["id"] = f"SUP-{random.randint(100, 999)}X"
        fallback["ingestedAt"] = int(time.time() * 1000)
        
        # Append to signals.json
        try:
            with open(SIGNALS_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
            data.insert(0, fallback)
            with open(SIGNALS_PATH, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2)
        except Exception as file_err:
            print(f"[ERROR] Failed to save fallback signal to JSON: {file_err}")
            
        return fallback
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/signals/{id}")
def delete_signal(id: str):
    updated = False
    
    # 1. Try removing from signals.json
    try:
        with open(SIGNALS_PATH, "r+", encoding="utf-8") as f:
            data = json.load(f)
            new_data = [item for item in data if item["id"] != id]
            if len(new_data) < len(data):
                f.seek(0)
                json.dump(new_data, f, indent=2)
                f.truncate()
                updated = True
    except Exception as e:
        print(f"[WARN] signals.json remove error: {e}")
        
    # 2. Try removing from threatRegistry.json
    try:
        with open(THREAT_REGISTRY_PATH, "r+", encoding="utf-8") as f:
            data = json.load(f)
            new_data = [item for item in data if item["id"] != id]
            if len(new_data) < len(data):
                f.seek(0)
                json.dump(new_data, f, indent=2)
                f.truncate()
                updated = True
    except Exception as e:
        print(f"[WARN] threatRegistry.json remove error: {e}")
        
    if not updated:
        raise HTTPException(status_code=404, detail="Disruption signal ID not found.")
        
    return {"message": f"Successfully deleted signal {id}"}

@app.get("/api/stream")
async def stream_signals():
    async def event_generator():
        while True:
            # Simulate a new threat signal arriving at random intervals (3 to 7 seconds)
            await asyncio.sleep(random.randint(3, 7))
            
            fallback = random.choice(MOCK_POOL).copy()
            fallback["id"] = f"SUP-{random.randint(100, 999)}S"
            fallback["ingestedAt"] = int(time.time() * 1000)
            
            # Save it to signals database so it becomes queryable/persistent
            try:
                with open(SIGNALS_PATH, "r+", encoding="utf-8") as f:
                    data = json.load(f)
                    data.insert(0, fallback)
                    f.seek(0)
                    json.dump(data, f, indent=2)
                    f.truncate()
            except Exception as e:
                print(f"[ERROR] Failed to save streamed signal: {e}")
                
            yield {
                "event": "new_signal",
                "data": json.dumps(fallback)
            }
            
    return EventSourceResponse(event_generator())