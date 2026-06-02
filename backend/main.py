import os
import json
import random
import asyncio
import time
import shutil
import logging
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

# Setup specialized supply chain radar pipeline logs
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("radar_pipeline")

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
        # Load the real processed signals
        real_signals = []
        try:
            with open(SIGNALS_PATH, "r", encoding="utf-8") as f:
                real_signals = json.load(f)
        except Exception as e:
            logger.warning(f"Failed to read signals.json pool: {e}. Falling back to mocks.")
            
        # Load baseline threat registry rows to detect overlap
        registry_ids = set()
        try:
            with open(THREAT_REGISTRY_PATH, "r", encoding="utf-8") as f:
                reg_data = json.load(f)
                registry_ids = {item["id"] for item in reg_data}
        except Exception as e:
            logger.warning(f"Failed to read threatRegistry.json: {e}")

        # Filter out already active threat signals
        unloaded_signals = [s for s in real_signals if s["id"] not in registry_ids]
        
        selected_signal = None
        if unloaded_signals:
            selected_signal = unloaded_signals[0].copy()
            logger.info("SIMULATOR PIPELINE HEALTH: Selecting un-ingested real geocoded signal from registry pool.")
        else:
            # Fallback to premium mocks if pool is fully drained
            logger.warning("SIMULATOR PIPELINE HEALTH: No un-ingested signals in pool. Generating a unique fallback.")
            pool = real_signals if real_signals else MOCK_POOL
            selected_signal = random.choice(pool).copy()
            selected_signal["id"] = f"SUP-{random.randint(100, 999)}A"
            
        selected_signal["ingestedAt"] = int(time.time() * 1000)
        
        # Append directly to threatRegistry.json so it integrates persistently with map & list grids
        try:
            with open(THREAT_REGISTRY_PATH, "r+", encoding="utf-8") as f:
                data = json.load(f)
                data.insert(0, selected_signal)
                f.seek(0)
                json.dump(data, f, indent=2)
                f.truncate()
            logger.info(f"SIMULATOR PIPELINE SUCCESS: Committed non-overlapping signal {selected_signal['id']} to live threat registry database.")
        except Exception as file_err:
            logger.error(f"SIMULATOR PIPELINE FAILURE: Failed to save signal to registry: {file_err}")
            
        return selected_signal
    except Exception as e:
        logger.error(f"SIMULATOR PIPELINE CRITICAL ERROR: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/signals/{id}")
def delete_signal(id: str):
    updated = False
    logger.info(f"DELETION PIPELINE INITIATED: Requesting purge of node ID {id}")
    
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
        logger.warning(f"signals.json remove error: {e}")
        
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
        logger.warning(f"threatRegistry.json remove error: {e}")
        
    if not updated:
        logger.error(f"DELETION PIPELINE FAILURE: Request to purge non-existent node ID {id}")
        raise HTTPException(status_code=404, detail="Disruption signal ID not found.")
        
    logger.info(f"DELETION PIPELINE SUCCESS: Successfully purged node ID {id} from active threat registries.")
    return {"message": f"Successfully deleted signal {id}"}

@app.get("/api/stream")
async def stream_signals():
    async def event_generator():
        streamed_ids = set()
        logger.info("STREAM PIPELINE HEALTH: New Server-Sent Events (SSE) connection established.")
        
        while True:
            # Sleep 4 to 8 seconds between streams
            await asyncio.sleep(random.randint(4, 8))
            
            # Load active registry rows and signals pool
            registry_ids = set()
            try:
                with open(THREAT_REGISTRY_PATH, "r", encoding="utf-8") as f:
                    reg_data = json.load(f)
                    registry_ids = {item["id"] for item in reg_data}
            except Exception as e:
                logger.warning(f"STREAM PIPELINE: Failed to read threatRegistry.json: {e}")
                
            real_signals = []
            try:
                with open(SIGNALS_PATH, "r", encoding="utf-8") as f:
                    real_signals = json.load(f)
            except Exception as e:
                logger.warning(f"STREAM PIPELINE: Failed to load signals pool: {e}")
                
            # Filter signals with zero overlap (not in threat registry, and not already streamed)
            unstreamed = [s for s in real_signals if s["id"] not in registry_ids and s["id"] not in streamed_ids]
            
            selected_signal = None
            if unstreamed:
                # Pick the highest-priority signal (by severity)
                sorted_unstreamed = sorted(unstreamed, key=lambda x: x.get("severity", 0), reverse=True)
                selected_signal = sorted_unstreamed[0].copy()
                streamed_ids.add(selected_signal["id"])
                logger.info(f"STREAM PIPELINE ACTIVE: Dispatching real news alert. ID={selected_signal['id']} | Facility={selected_signal['facility']} | Severity={selected_signal['severity']}")
            else:
                # Fallback generator if pool is exhausted
                logger.warning("STREAM PIPELINE DRAINED: All pool signals active. Generating unique mock alert.")
                pool = real_signals if real_signals else MOCK_POOL
                selected_signal = random.choice(pool).copy()
                selected_signal["id"] = f"SUP-{random.randint(100, 999)}S"
                selected_signal["ingestedAt"] = int(time.time() * 1000)
                
            # Update the live threatRegistry persistently so the signal is stored
            try:
                with open(THREAT_REGISTRY_PATH, "r+", encoding="utf-8") as f:
                    data = json.load(f)
                    # Deduplicate in active file save just in case
                    if not any(item["id"] == selected_signal["id"] for item in data):
                        data.insert(0, selected_signal)
                        f.seek(0)
                        json.dump(data, f, indent=2)
                        f.truncate()
                logger.info(f"STREAM DATABASE UPDATE: Saved streamed signal {selected_signal['id']} to live threat registry database.")
            except Exception as e:
                logger.error(f"STREAM DATABASE FAILURE: Failed to append streamed signal to registry: {e}")
                
            yield {
                "event": "new_signal",
                "data": json.dumps(selected_signal)
            }
            
    return EventSourceResponse(event_generator())