import os
import json
import re
import hashlib
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

def get_core_disruption(d):
    """Strips incident IDs, article counts, and procedural mock variation suffixes."""
    # Remove leading [Inc #xxx] or [Incident #xxx]
    d = re.sub(r'^\[Inc(?:ident)?\s*#?\d+\]\s*', '', d)
    # Remove trailing article counts (e.g. (61 articles))
    d = re.sub(r'\s*\(\d+\s*articles\)', '', d)
    # Remove procedural mock variation suffixes
    suffixes = [
        " (Shift-", " (critical", " due to section", " (pressure", " (temperature",
        " (vibration", " (micro-", " (Secondary", " (Shift", " (Incident"
    ]
    for suffix in suffixes:
        if suffix in d:
            d = d.split(suffix)[0]
    return d.strip()

def tokenize_title(t):
    """Tokenizes title for Jaccard similarity comparison, filtering out stopwords."""
    words = re.findall(r'\w+', t.lower())
    stop_words = {
        "boeing", "supply", "chain", "to", "the", "a", "an", "on", "in", 
        "for", "with", "and", "is", "after", "by", "of", "at", "as", "from", 
        "about", "over", "ba", "us", "corp", "co", "ltd", "inc", "company",
        "delays", "delay", "halts", "halt", "shortage", "shortages", "strike", "strikes"
    }
    return {w for w in words if w not in stop_words and len(w) > 2}

def jaccard_similarity(set1, set2):
    if not set1 or not set2:
        return 0.0
    return len(set1.intersection(set2)) / len(set1.union(set2))

def cluster_and_save_signal(selected_signal, threat_registry_path, logger=None):
    """
    Tries to cluster the selected_signal into an existing threat in threatRegistry.json.
    If clustered, updates the existing threat in place and saves it.
    If not, prepends selected_signal as a new threat.
    Returns the final committed threat dictionary.
    """
    try:
        with open(threat_registry_path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception as e:
        if logger:
            logger.warning(f"Failed to read registry during clustering: {e}")
        else:
            print(f"[WARN] Failed to read registry during clustering: {e}")
        data = []

    clustered = False
    
    new_disruption = selected_signal["disruption"]
    new_facility = selected_signal["facility"]
    new_core = get_core_disruption(new_disruption)
    new_tokens = tokenize_title(new_core)
    
    for item in data:
        if item.get("facility", "") == new_facility:
            item_disruption = item.get("disruption", "")
            item_core = get_core_disruption(item_disruption)
            item_tokens = tokenize_title(item_core)
            
            sim = jaccard_similarity(new_tokens, item_tokens)
            if item_core.lower() == new_core.lower() or sim >= 0.65:
                if "sources" not in item or not isinstance(item["sources"], list):
                    item["sources"] = [
                        {
                            "title": item_core,
                            "url": f"http://localhost:8000/api/signals/simulate?inc={item.get('id', 'base')}",
                            "summary": item.get("fullDescription", "")
                        }
                    ]
                
                source_titles = {src.get("title", "").lower() for src in item["sources"]}
                if new_disruption.lower() not in source_titles:
                    item["sources"].append({
                        "title": new_disruption,
                        "url": f"http://localhost:8000/api/signals/simulate?inc={selected_signal['id']}",
                        "summary": selected_signal["fullDescription"]
                    })
                
                count = len(item["sources"])
                item["disruption"] = f"{item_core} ({count} articles)"
                
                clean_desc = re.sub(r'^\[Clustered Event\s*-\s*\d+\s*(?:Sources Reporting|Occurrences)\]\s*', '', item.get("fullDescription", ""))
                clean_desc = re.sub(r'^\[Inc(?:ident)?\s*#?\d+\]\s*', '', clean_desc)
                clean_desc = re.split(r'\s*Additional report\s*', clean_desc, flags=re.IGNORECASE)[0].strip()
                
                item["fullDescription"] = f"[Clustered Event - {count} Sources Reporting] {clean_desc}"
                item["ingestedAt"] = int(time.time() * 1000)
                item["severity"] = max(item.get("severity", 1.0), selected_signal["severity"])
                
                selected_signal = item
                clustered = True
                break
                
    if not clustered:
        if "sources" not in selected_signal:
            selected_signal["sources"] = [
                {
                    "title": selected_signal["disruption"],
                    "url": f"http://localhost:8000/api/signals/simulate?inc={selected_signal['id']}",
                    "summary": selected_signal["fullDescription"]
                }
            ]
        data.insert(0, selected_signal)
        
    with open(threat_registry_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
        
    return selected_signal


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
        "fullDescription": "Kiln #3 suffered a structural collapse of its high-temperature refractory lining. Turbine blade casting runs are suspended indefinitely, risking supply gaps for widebody programs.",
        "sourceData": "Factory IoT Kiln Status Feed: DERBY-KILN-03-ERR",
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
                "timeline": "6 to 8 business days for kiln repair"
            },
            "validationPlan": {
                "steps": [
                    "Inspect thermal imaging logs of Kiln #3 during heat-up cycles.",
                    "Perform non-destructive stress testing on replacement castings."
                ],
                "timeline": "2 business days of thermal validation"
            }
        },
        "downstreamBusinessImpact": "Threatens SLA commitments at primary integration hubs; potential Widebody line halts.",
        "mitigationObjective": "Bypass production downtime via backup molding dies and safety buffer releases."
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
        "fullDescription": "A severe geothermal grid surge caused a localized power outage, resulting in the cooling and solidifying of raw aluminum within 12 electrolytic cells.",
        "sourceData": "Power Grid SCADA Alert: REYK-SMELT-PWR",
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
                "timeline": "3 to 4 weeks for complete cell cleaning"
            },
            "validationPlan": {
                "steps": [
                    "Verify power supply stability and install surge protective relays.",
                    "Inspect restarted cells for lining degradation or cracks."
                ],
                "timeline": "5 days of continuous operations quality tracking"
            }
        },
        "downstreamBusinessImpact": "Alloy supply delays for wing skin extrusions; secondary procurement overhead.",
        "mitigationObjective": "Bypass Icelandic smelter freeze by activating secondary Trondheim raw supply contract."
    },
    {
        "id": "SUP-301C",
        "facility": "Toray Composite Materials",
        "location": "Tacoma, WA, US",
        "disruption": "Carbon fiber autoclave pressure regulator seal rupture",
        "severity": 7.2,
        "likelihood": 80,
        "timeToHit": 14,
        "tier": 2,
        "fullDescription": "High-pressure autoclave seals failed during cure cycle #819. Raw composite layup batches for widebody wing spars must be scrapped due to decompression porosity.",
        "sourceData": "Autoclave Telemetry Webhook: TAC-AUTO-819-PRESS",
        "mapPosition": {
            "coordinates": [-122.4443, 47.2529],
            "color": "#FFB300",
            "role": "Tier-2 / Composites",
            "status": "Elevated Risk"
        },
        "playbook": {
            "mitigationPlan": {
                "steps": [
                    "Shift wing spar composite layup loads to secondary prepreg lines in Nagoya.",
                    "Authorize priority technician dispatch to replace autoclave hydraulic seals.",
                    "Accelerate custom clearance procedures for reserve prepreg shipments."
                ],
                "timeline": "5 to 7 days for seal replacement and autoclave recalibration"
            },
            "validationPlan": {
                "steps": [
                    "Audit pressure profile logs over three consecutive test cycles.",
                    "Perform ultrasonic void-detection tests on the first post-repair layups."
                ],
                "timeline": "2 days of composite curing void inspections"
            }
        },
        "downstreamBusinessImpact": "Composite wing structure assembly halts at final assembly line.",
        "mitigationObjective": "Maintain fuselage/wing structural prepreg flow by activating Nagoya production bridges."
    },
    {
        "id": "SUP-402D",
        "facility": "Honeywell Aerospace Systems",
        "location": "Phoenix, AZ, US",
        "disruption": "Cleanroom HEPA filtration contamination during sensor assembly",
        "severity": 6.8,
        "likelihood": 75,
        "timeToHit": 7,
        "tier": 1,
        "fullDescription": "Sensor assembly cleanroom atmospheric logs recorded a breach of Class 100 particle thresholds. Micro-sensor production lines are suspended for deep decontamination.",
        "sourceData": "Cleanroom Environmental Stream: PHX-CLEAN-SEC4-ERR",
        "mapPosition": {
            "coordinates": [-112.0740, 33.4484],
            "color": "#FFB300",
            "role": "Tier-1 / Avionics",
            "status": "Elevated Risk"
        },
        "playbook": {
            "mitigationPlan": {
                "steps": [
                    "Isolate contaminated batch assemblies and place in quarantine hold.",
                    "Initiate deep cleanroom chemical scrub and replace all HEPA primary elements.",
                    "Divert priority pressure-transducer assembly runs to Penang facility."
                ],
                "timeline": "3 to 4 days for cleanroom scrub and certified air recertification"
            },
            "validationPlan": {
                "steps": [
                    "Monitor continuous particle counts over a 24-hour baseline cycle.",
                    "Audit micro-sensor microchip contacts under scanning electron microscope."
                ],
                "timeline": "24 hours of ambient safety verification"
            }
        },
        "downstreamBusinessImpact": "Flight deck pressure transducer shortages; delayed cockpit modular avionics integration.",
        "mitigationObjective": "Bypass Phoenix cleanroom downtime by routing avionics sensor lines to pre-certified Penang facility."
    },
    {
        "id": "SUP-505E",
        "facility": "Moog Actuation Systems",
        "location": "East Aurora, NY, US",
        "disruption": "Precision CNC micro-honing machine spindle calibration drift",
        "severity": 7.0,
        "likelihood": 80,
        "timeToHit": 10,
        "tier": 2,
        "fullDescription": "Precision honing spindles experienced a 12-micron calibration drift. Servovalve sleeve inventories produced on line #4 have been quarantined due to critical dimensional tolerances.",
        "sourceData": "CNC Metrology Alarm: EA-CNC-HON-04",
        "mapPosition": {
            "coordinates": [-78.6147, 42.7667],
            "color": "#FFB300",
            "role": "Tier-2 / Actuation",
            "status": "Elevated Risk"
        },
        "playbook": {
            "mitigationPlan": {
                "steps": [
                    "Deploy OEM laser interferometer calibration specialist team to reset honing spindle.",
                    "Pull pre-inspected servovalve sleeve safety stock from European logistics hub.",
                    "Engage parallel manufacturing lines #1 and #2 to run overtime shifts."
                ],
                "timeline": "4 days for laser realignment and calibration recertification"
            },
            "validationPlan": {
                "steps": [
                    "Conduct air-gauge dimensional checks on first 50 sleeve samples post-repair.",
                    "Verify functional flow and pressure drop specs on automated hydraulic test benches."
                ],
                "timeline": "2 days of rigorous dimensional micro-auditing"
            }
        },
        "downstreamBusinessImpact": "Flight control hydraulic actuator assembly bottlenecks; delayed flap/slat control deliveries.",
        "mitigationObjective": "Prevent critical actuator delivery slippage by clearing dimensional micro-anomalies."
    },
    {
        "id": "SUP-606F",
        "facility": "Spirit AeroSystems",
        "location": "Wichita, KS, US",
        "disruption": "Automated fuselage riveting head mechanical synchronization failure",
        "severity": 8.5,
        "likelihood": 85,
        "timeToHit": 5,
        "tier": 1,
        "fullDescription": "The primary robotic riveting end-effector suffered a sudden mechanical binding, damaging two skin panel stringers. Wichita line #1 final assembly halts.",
        "sourceData": "Robotic PLC Diagnostics Feed: WIC-ROB-RIVET-01",
        "mapPosition": {
            "coordinates": [-97.2798, 37.6436],
            "color": "#D32F2F",
            "role": "Tier-1 / Fuselages",
            "status": "Critical threat"
        },
        "playbook": {
            "mitigationPlan": {
                "steps": [
                    "Deploy specialized manual riveting crews to override robotic assembly line.",
                    "Secure replacement end-effector assembly from manufacturing backup center.",
                    "Adjust downstream Renton assembly intake timeline to match delayed shell delivery."
                ],
                "timeline": "3 business days for robotic head swap and calibration"
            },
            "validationPlan": {
                "steps": [
                    "Perform non-destructive x-ray testing on stringer rivets in the affected zone.",
                    "Verify fastener squeeze force telemetry via manual torque audits."
                ],
                "timeline": "36 hours of robotic safety and squeeze verification"
            }
        },
        "downstreamBusinessImpact": "Direct fuselage delivery delays to Renton final assembly line; high risk of line stop.",
        "mitigationObjective": "Bypass robotic end-effector failure using manual riveting overlays and safety audits."
    },
    {
        "id": "SUP-707G",
        "facility": "GKN Aerospace Structures",
        "location": "Filton, UK",
        "disruption": "Titanium laser-deposition additive nozzle blockage during casing print",
        "severity": 7.4,
        "likelihood": 80,
        "timeToHit": 12,
        "tier": 1,
        "fullDescription": "The titanium powder feed nozzle suffered a severe thermal feedback melt, halting the direct energy deposition of the compressor housing assembly.",
        "sourceData": "Additive Sensor Telemetry: FILT-DED-NOZ-CRIT",
        "mapPosition": {
            "coordinates": [-2.5936, 51.5222],
            "color": "#FFB300",
            "role": "Tier-1 / Engine Structures",
            "status": "Elevated Risk"
        },
        "playbook": {
            "mitigationPlan": {
                "steps": [
                    "Quarantine the incomplete casing print and perform microstructure heat scans.",
                    "Replace laser-deposition nozzle assembly and clean titanium powder conduits.",
                    "Activate conventional forging production lines in Sweden as secondary routing."
                ],
                "timeline": "6 days for 3D printer print head rebuilding and powder flush"
            },
            "validationPlan": {
                "steps": [
                    "Conduct automated CT scans on post-repair prints to inspect internal cavities.",
                    "Verify material grain structure and tensile properties on co-printed test bars."
                ],
                "timeline": "3 days of advanced metallurgy testing"
            }
        },
        "downstreamBusinessImpact": "Low-pressure compressor engine casing delays; risks assembly integration timeline.",
        "mitigationObjective": "Bypass 3D printing nozzle clogs by activating Sweden's redundant forging tooling channels."
    },
    {
        "id": "SUP-808H",
        "facility": "Howmet Engine Products",
        "location": "Cleveland, OH, US",
        "disruption": "Single-crystal turbine blade mold vacuum pressure loss",
        "severity": 8.2,
        "likelihood": 90,
        "timeToHit": 14,
        "tier": 2,
        "fullDescription": "Vacuum chambers lost hermetic containment during investment casting melt cycle #14. The entire casting batch of high-pressure turbine blades is scrapped.",
        "sourceData": "Vacuum SCADA Feed: CLEV-VAC-CH4-ERR",
        "mapPosition": {
            "coordinates": [-81.6944, 41.4993],
            "color": "#D32F2F",
            "role": "Tier-2 / Castings",
            "status": "Critical threat"
        },
        "playbook": {
            "mitigationPlan": {
                "steps": [
                    "Transfer molds and priority dies to backup casting furnace #5.",
                    "Deploy maintenance crews to inspect and replace vacuum flange seals.",
                    "Re-route high-temperature superalloy precursor supplies to operational bays."
                ],
                "timeline": "5 business days for vacuum flange replacement and safety test"
            },
            "validationPlan": {
                "steps": [
                    "Inspect thermal imaging logs during trial melt cycles to verify insulation.",
                    "Conduct non-destructive micro-focus CT scans on replacement blade castings."
                ],
                "timeline": "2 business days for vacuum certification and quality sign-off"
            }
        },
        "downstreamBusinessImpact": "Critical engine hot-section blade shortages; delayed engine delivery schedules.",
        "mitigationObjective": "Divert casting resources to secondary clean furnaces and replace failed vacuum flange seals."
    }
]

# Helper to procedurally generate a guaranteed-unique variation of a threat signal
def make_signal_truly_unique(base_signal):
    signal = base_signal.copy()
    incident_seq = random.randint(100, 999)
    signal["id"] = f"SUP-{incident_seq}{random.choice(['A', 'B', 'C', 'X', 'Y', 'Z', 'S', 'T'])}"
    
    # 35% chance to make it a completely new unique facility so it doesn't cluster and adds a new row
    if random.random() < 0:
        new_facilities = [
            ("Tokyo Precision Parts", "Tokyo, JP", "Tier-2 / Actuation"),
            ("Munich Castings GmbH", "Munich, DE", "Tier-1 / Casting"),
            ("Penang Avionics Corp", "Penang, MY", "Tier-1 / Avionics"),
            ("Trondheim Refined Metals", "Trondheim, NO", "Tier-2 / Raw Materials"),
            ("Nagoya Wing Systems", "Nagoya, JP", "Tier-1 / Main Line Assembly"),
            ("Everett Logistics Hub", "Everett, WA, US", "Tier-0 / Logistics")
        ]
        facility, location, role = random.choice(new_facilities)
        signal["facility"] = facility
        signal["location"] = location
        if "mapPosition" in signal:
            signal["mapPosition"] = signal["mapPosition"].copy()
            signal["mapPosition"]["role"] = role
            # Shift coordinates slightly to keep it unique
            signal["mapPosition"]["coordinates"] = [
                signal["mapPosition"]["coordinates"][0] + random.uniform(-2.0, 2.0),
                signal["mapPosition"]["coordinates"][1] + random.uniform(-2.0, 2.0)
            ]
    
    # 1. Procedural replacements for disruption text
    disruption = signal["disruption"]
    if "] " in disruption:
        disruption = disruption.split("] ", 1)[1]
    if " (Secondary" in disruption:
        disruption = disruption.split(" (Secondary", 1)[0]
    if " (Shift-" in disruption:
        disruption = disruption.split(" (Shift-", 1)[0]
        
    variation_templates = [
        lambda d: f"[Inc #{incident_seq}] {d} (Shift-{random.choice(['A', 'B', 'C', 'Night'])} telemetry anomaly)",
        lambda d: f"[Inc #{incident_seq}] {d} (critical micro-anomaly #{random.randint(10, 99)} logged)",
        lambda d: f"[Inc #{incident_seq}] {d} due to section {random.randint(1, 9)} calibration drift",
        lambda d: f"[Inc #{incident_seq}] {d} ({random.choice(['pressure', 'temperature', 'vibration'])} delta of {random.choice(['+', '-'])}{random.randint(5, 25)}% detected)",
        lambda d: f"[Inc #{incident_seq}] {d} (micro-indicator Ref #{random.randint(1000, 9999)} tripped)",
    ]
    signal["disruption"] = random.choice(variation_templates)(disruption)
    
    # 2. Procedural modifications for fullDescription
    full_desc = signal.get("fullDescription", "")
    if "] " in full_desc:
        full_desc = full_desc.split("] ", 1)[1]
    
    desc_additions = [
        f"Telemetry logs registered a sudden fluctuation. Maintenance crew has been dispatched to containment area {random.randint(1, 5)}.",
        f"Anomalous telemetry readouts forced safety interlocks to engage. Shift supervisors have initiated the rollback protocol.",
        f"Real-time sensor logs recorded a transient calibration drift. Standard repair procedures are currently underway.",
        f"Visual inspection confirmed micro-scale degradation on primary structural components. Secondary systems are handling the baseline load."
    ]
    signal["fullDescription"] = f"[Incident #{incident_seq}] {full_desc} {random.choice(desc_additions)}"
    
    # 3. Randomize severity slightly (e.g. +/- 0.4)
    base_severity = signal.get("severity", 5.0)
    signal["severity"] = round(max(1.0, min(10.0, base_severity + random.uniform(-0.4, 0.4))), 1)
    
    # 4. Randomize likelihood slightly (e.g. +/- 5%)
    base_likelihood = signal.get("likelihood", 80)
    signal["likelihood"] = max(10, min(99, base_likelihood + random.randint(-5, 5)))
    
    # 5. Randomize timeToHit slightly
    base_time = signal.get("timeToHit", 14)
    if isinstance(base_time, int):
        signal["timeToHit"] = max(1, base_time + random.randint(-3, 3))
        
    return signal

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
                for item in reg_data:
                    if "id" in item:
                        registry_ids.add(item["id"])
                    if "sources" in item and isinstance(item["sources"], list):
                        for src in item["sources"]:
                            url = src.get("url", "")
                            match = re.search(r'inc=([^&]+)', url)
                            if match:
                                registry_ids.add(match.group(1))
        except Exception as e:
            logger.warning(f"Failed to read threatRegistry.json: {e}")

        # Filter out already active threat signals
        unloaded_signals = [
            s for s in real_signals 
            if s["id"] not in registry_ids
        ]
        
        selected_signal = None
        is_mock_fallback = False
        base_mock = None
        
        if unloaded_signals:
            selected_signal = unloaded_signals[0].copy()
            logger.info("SIMULATOR PIPELINE HEALTH: Selecting un-ingested real geocoded signal from registry pool.")
        else:
            # Fallback to premium mocks if pool is fully drained
            logger.warning("SIMULATOR PIPELINE HEALTH: No un-ingested signals in pool. Generating a unique mock fallback.")
            is_mock_fallback = True
            
            # Load active threat keys across both files
            active_keys = set()
            for path in [THREAT_REGISTRY_PATH, SIGNALS_PATH]:
                try:
                    with open(path, "r", encoding="utf-8") as f:
                        data = json.load(f)
                        for item in data:
                            facility = item.get("facility", "")
                            disruption = item.get("disruption", "")
                            disruption_clean = disruption.split("] ")[-1] if "] " in disruption else disruption.split(" (Secondary Incident")[0]
                            disruption_clean = disruption_clean.split(" (Shift-")[0]
                            disruption_clean = disruption_clean.split(" (")[0]
                            active_keys.add((facility, disruption_clean))
                except Exception:
                    pass
                
            unloaded_mocks = [m for m in MOCK_POOL if (m.get("facility", ""), m.get("disruption", "")) not in active_keys]
            
            if unloaded_mocks:
                base_mock = random.choice(unloaded_mocks)
            else:
                base_mock = random.choice(MOCK_POOL)
                
            selected_signal = make_signal_truly_unique(base_mock)
            
        selected_signal["ingestedAt"] = int(time.time() * 1000)
        
        # Append directly to threatRegistry.json so it integrates persistently with map & list grids
        try:
            selected_signal = cluster_and_save_signal(selected_signal, THREAT_REGISTRY_PATH, logger)
            logger.info(f"SIMULATOR PIPELINE SUCCESS: Committed/Clustered signal {selected_signal['id']} to live threat registry database.")
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
                    for item in reg_data:
                        if "id" in item:
                            registry_ids.add(item["id"])
                        if "sources" in item and isinstance(item["sources"], list):
                            for src in item["sources"]:
                                url = src.get("url", "")
                                match = re.search(r'inc=([^&]+)', url)
                                if match:
                                    registry_ids.add(match.group(1))
            except Exception as e:
                logger.warning(f"STREAM PIPELINE: Failed to read threatRegistry.json: {e}")
                
            real_signals = []
            try:
                with open(SIGNALS_PATH, "r", encoding="utf-8") as f:
                    real_signals = json.load(f)
            except Exception as e:
                logger.warning(f"STREAM PIPELINE: Failed to load signals pool: {e}")
                
            # Filter signals with zero overlap (not in threat registry, and not already streamed)
            unstreamed = [
                s for s in real_signals 
                if s["id"] not in registry_ids 
                and s["id"] not in streamed_ids
            ]
            
            selected_signal = None
            is_mock_fallback = False
            base_mock = None
            
            if unstreamed:
                # Pick the highest-priority signal (by severity)
                sorted_unstreamed = sorted(unstreamed, key=lambda x: x.get("severity", 0), reverse=True)
                selected_signal = sorted_unstreamed[0].copy()
                streamed_ids.add(selected_signal["id"])
                logger.info(f"STREAM PIPELINE ACTIVE: Dispatching real news alert. ID={selected_signal['id']} | Facility={selected_signal['facility']} | Severity={selected_signal['severity']}")
            else:
                # Fallback generator if pool is exhausted
                logger.warning("STREAM PIPELINE DRAINED: All pool signals active. Generating unique mock alert.")
                is_mock_fallback = True
                
                # Load active threat keys across both files
                active_keys = set()
                for path in [THREAT_REGISTRY_PATH, SIGNALS_PATH]:
                    try:
                        with open(path, "r", encoding="utf-8") as f:
                            data = json.load(f)
                            for item in data:
                                facility = item.get("facility", "")
                                disruption = item.get("disruption", "")
                                disruption_clean = disruption.split("] ")[-1] if "] " in disruption else disruption.split(" (Secondary Incident")[0]
                                disruption_clean = disruption_clean.split(" (Shift-")[0]
                                disruption_clean = disruption_clean.split(" (")[0]
                                active_keys.add((facility, disruption_clean))
                    except Exception:
                        pass
                        
                unstreamed_mocks = [m for m in MOCK_POOL if (m.get("facility", ""), m.get("disruption", "")) not in active_keys]
                
                if unstreamed_mocks:
                    base_mock = random.choice(unstreamed_mocks)
                else:
                    base_mock = random.choice(MOCK_POOL)
                    
                selected_signal = make_signal_truly_unique(base_mock)
                
            selected_signal["ingestedAt"] = int(time.time() * 1000)
            
            # Save it to signals database so it becomes queryable/persistent
            try:
                with open(SIGNALS_PATH, "r+", encoding="utf-8") as f:
                    data = json.load(f)
                    if not any(item["id"] == selected_signal["id"] for item in data):
                        data.insert(0, selected_signal)
                        f.seek(0)
                        json.dump(data, f, indent=2)
                        f.truncate()
                logger.info(f"STREAM DATABASE UPDATE: Saved streamed signal {selected_signal['id']} to live threat registry database.")
            except Exception as e:
                logger.error(f"Failed to save streamed signal: {e}")
                
            # Also save to threatRegistry.json so it integrates persistently with active threat table!
            try:
                selected_signal = cluster_and_save_signal(selected_signal, THREAT_REGISTRY_PATH, logger)
                logger.info(f"STREAM DATABASE UPDATE: Saved streamed signal {selected_signal['id']} to live threat registry database.")
            except Exception as e:
                logger.error(f"STREAM DATABASE FAILURE: Failed to save streamed signal to threatRegistry.json: {e}")
                
            yield {
                "event": "new_signal",
                "data": json.dumps(selected_signal)
            }
            
    return EventSourceResponse(event_generator())