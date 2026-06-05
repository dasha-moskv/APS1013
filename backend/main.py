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

def get_taxonomy_by_id(signal_id, disruption="", facility="", full_desc=""):
    text = f"{disruption} {facility} {full_desc}".lower()

    taxonomy_keywords = {
        "Regulatory & Compliance": [
            "compliance", "regulatory", "regulation", "sanctions", "ban", "legal", 
            "faa", "airworthiness", "approval", "audit", "policy", "tariffs", 
            "customs", "export control"
        ],
        "Manufacturing & Supply": [
            "capacity", "shortage", "shortages", "bottleneck", "bottlenecks", 
            "production", "manufacturing", "throughput", "assembly", "plant", 
            "facility", "factory", "shutdown", "restart", "maintenance", "parts", 
            "supply chain", "constrain", "constraints", "availability"
        ],
        "Foreign Ownership, Control, or Influence (FOCI)": [
            "foci", "foreign ownership", "foreign control", "influence", "adversary", 
            "intel", "spy", "espionage", "foreign intelligence", "ownership control"
        ],
        "Political": [
            "political", "instability", "civil unrest", "territorial", "dispute", 
            "corruption", "terrorism", "geopolitical", "protest", "protests", 
            "riot", "war", "conflict", "sanction"
        ],
        "Technology & Cybersecurity": [
            "cybersecurity", "cyberattack", "hack", "ransomware", "security breach", 
            "malware", "phishing", "cryptographic", "software supply", "sbom", 
            "telecommunication", "internet", "downtime"
        ],
        "Financial": [
            "financial", "revenue", "liquidity", "bankruptcy", "bankrupt", "insolvent", 
            "insolvency", "cash-to-cash", "credit", "profit", "margins", "debt"
        ],
        "Economic": [
            "economic", "inflation", "macroeconomic", "tariff", "trade war", 
            "employment", "market demand", "price spike", "volatility"
        ],
        "Product Quality & Design": [
            "quality", "defect", "defects", "inspection", "inspections", "paperwork", 
            "documentation", "traceability", "forgeries", "rework", "recall", 
            "recalls", "yield", "containment", "airworthiness notification"
        ],
        "Human Capital": [
            "strike", "strikes", "labor", "union", "workforce", "staffing", 
            "recruitment", "labor dispute", "walkout", "personnel"
        ],
        "Transportation & Distribution": [
            "logistics", "transit", "shipping", "shipment", "shipments", "transport", 
            "freight", "cargo", "routing", "rail", "port", "customs", "border", 
            "carrier", "import", "imports", "warehouse", "dock", "route", "freighter", 
            "convoy", "delivery", "deliveries", "stalled", "freight rail"
        ],
        "Environmental": [
            "weather", "freeze", "storm", "natural disaster", "earthquake", 
            "seismic", "climate", "flood", "hurricane", "tornado", "typhoon", 
            "wildfire", "emissions"
        ],
        "Infrastructure": [
            "power", "grid", "telemetry", "scada", "utilities", "lockdown", 
            "infrastructure", "outage", "kiln", "furnace", "autoclave", "spindle", 
            "valve", "machinery", "equipment"
        ]
    }

    scores = {category: 0 for category in taxonomy_keywords}

    for category, keywords in taxonomy_keywords.items():
        for keyword in keywords:
            if keyword in text:
                scores[category] += 1

    # Extra weighting for strong category indicators
    strong_signals = {
        "Regulatory & Compliance": ["export restriction", "sanctions list", "regulatory ban", "airworthiness notification"],
        "Manufacturing & Supply": ["production halt", "shortage bottleneck", "capacity constraint", "supply chain disruption"],
        "Technology & Cybersecurity": ["cyberattack hack", "ransomware breach", "malware injection", "security breach"],
        "Financial": ["chapter 11", "bankruptcy protection", "liquidity crisis", "insolvent supplier"],
        "Economic": ["trade tariffs", "inflation spike", "market demand drop"],
        "Product Quality & Design": ["defect recall", "traceability forgery", "metallurgical inspection", "dimensional tolerance"],
        "Human Capital": ["freight strike", "labor union walkout", "workforce deficit"],
        "Transportation & Distribution": ["logistics bridge", "freight rail stop", "shipping container shortage", "port congestion"],
        "Environmental": ["geothermal freeze", "seismic safety shutdown", "extreme weather storm", "natural disaster"],
        "Infrastructure": ["power grid surge", "scada telemetry fail", "autoclave seal rupture", "machinery downtime"]
    }

    for category, phrases in strong_signals.items():
        for phrase in phrases:
            if phrase in text:
                scores[category] += 3

    # Avoid over-classifying generic delay language as logistics
    generic_delay_terms = ["delay", "delays", "delayed", "delivery", "deliveries"]
    if any(term in text for term in generic_delay_terms):
        scores["Transportation & Distribution"] -= 1

    # Tie-break priority for this project context
    priority = [
        "Manufacturing & Supply",
        "Product Quality & Design",
        "Regulatory & Compliance",
        "Transportation & Distribution",
        "Technology & Cybersecurity",
        "Human Capital",
        "Infrastructure",
        "Financial",
        "Political",
        "Economic",
        "Environmental",
        "Foreign Ownership, Control, or Influence (FOCI)"
    ]

    best_score = max(scores.values())

    if best_score <= 0:
        return "Infrastructure"

    tied_categories = [
        category for category, score in scores.items()
        if score == best_score
    ]

    for category in priority:
        if category in tied_categories:
            return category

def enrich_with_operational_data(selected_signal):
    """
    Looks up the supplier in the Supply Chain Knowledge Graph and enriches the
    threat record with operational parameters (e.g. daily exposure, safety stock levels).
    """
    facility = selected_signal.get("facility", "")
    node = resolve_supplier_node(facility)
    if node:
        selected_signal["dailyExposure"] = selected_signal.get("dailyExposure", node.get("dailyExposure", 0))
        selected_signal["slaThresholdDays"] = selected_signal.get("slaThresholdDays", node.get("slaThresholdDays", 10))
        selected_signal["bufferInventoryLevel"] = selected_signal.get("bufferInventoryLevel", node.get("bufferInventoryLevel", "5 days"))
        
        downstream_ids = get_downstream_dependencies(node["id"])
        if downstream_ids:
            graph = load_knowledge_graph()
            nodes_map = {n["id"]: n["label"] for n in graph.get("nodes", [])}
            dep_labels = [nodes_map[did] for did in downstream_ids if did in nodes_map]
            selected_signal["downstreamDependencies"] = dep_labels
            selected_signal["downstreamBusinessImpact"] = (
                f"Disruption at {facility} directly propagates downstream, threatening operations at "
                f"{', '.join(dep_labels[:3])}."
            )
    return selected_signal

def cluster_and_save_signal(selected_signal, threat_registry_path, logger=None):
    """
    Tries to cluster the selected_signal into an existing threat in threatRegistry.json.
    If clustered, updates the existing threat in place and saves it.
    If not, prepends selected_signal as a new threat.
    Returns the final committed threat dictionary.
    """
    selected_signal["category"] = get_taxonomy_by_id(
        selected_signal.get("id"),
        selected_signal.get("disruption", ""),
        selected_signal.get("facility", ""),
        selected_signal.get("fullDescription", "")
    )
    selected_signal = enrich_with_operational_data(selected_signal)
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
    analyze_signals,
    generate_mitigation_playbook_and_validation_plan
)
from utils import (
    read_from_json,
    send_to_json
)
from utils.validate_geojson import validate_geojson_data
from utils.knowledge_graph_builder import (
    resolve_supplier_node,
    get_downstream_dependencies,
    load_knowledge_graph
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

# Copy baseline JSON databases from frontend assets folder on startup to ensure a clean starting state
FRONTEND_DATA_DIR = BACKEND_ROOT / ".." / "frontend" / "src" / "data"
if FRONTEND_DATA_DIR.exists():
    if (FRONTEND_DATA_DIR / "threatRegistry.json").exists():
        shutil.copy(FRONTEND_DATA_DIR / "threatRegistry.json", THREAT_REGISTRY_PATH)
    if (FRONTEND_DATA_DIR / "signals.json").exists():
        shutil.copy(FRONTEND_DATA_DIR / "signals.json", SIGNALS_PATH)
    if (FRONTEND_DATA_DIR / "knowledgeGraph.json").exists():
        shutil.copy(FRONTEND_DATA_DIR / "knowledgeGraph.json", DATA_DIR / "knowledgeGraph.json")


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

@app.post("/api/ingest")
def ingest_supply_base(geojson: dict):
    try:
        result = validate_geojson_data(geojson)
        return result
    except Exception as e:
        logger.error(f"Ingestion error: {e}")
        raise HTTPException(status_code=400, detail=f"GeoJSON validation failed: {str(e)}")

@app.post("/api/threats/{id}/playbook")
def generate_threat_playbook(id: str):
    logger.info(f"PLAYBOOK GENERATION: Requesting dynamic response plan for threat {id}")
    try:
        try:
            with open(THREAT_REGISTRY_PATH, "r", encoding="utf-8") as f:
                registry = json.load(f)
        except Exception as e:
            logger.error(f"Failed to read registry: {e}")
            raise HTTPException(status_code=500, detail="Threat registry missing or unreadable.")

        target_threat = None
        for threat in registry:
            if threat["id"] == id:
                target_threat = threat
                break

        if not target_threat:
            raise HTTPException(status_code=404, detail=f"Threat ID {id} not found in registry.")

        try:
            supply_base = supply_base_prompt()
            mitigation_playbook, validation_plan = generate_mitigation_playbook_and_validation_plan(
                [target_threat], supply_base
            )
            
            # Day 6: Compliance Interceptor Check
            from backend.utils.governance_guardrails import check_playbook_compliance
            is_compliant, violated_supplier, error_msg = check_playbook_compliance(mitigation_playbook)
            
            if not is_compliant:
                # Intercept the playbook, flag it as a compliance breach
                target_threat["mapPosition"]["status"] = "Compliance Breach"
                target_threat["mapPosition"]["color"] = "#EF4444"  # Red warning color
                target_threat["playbook"] = {
                    "mitigationPlan": {
                        "steps": [
                            "⚠️ COMPLIANCE BREACH INTERCEPTED: Playbook blocked by AI Judge.",
                            f"Proposed non-ASL vendor '{violated_supplier}' fails FAA airworthiness safety certification.",
                            "Reallocated capacity changes rejected. Reverting to manual override queue."
                        ],
                        "timeline": "BLOCKED"
                    },
                    "validationPlan": {
                        "steps": [
                            "Perform manual vendor audit on FAA certification files.",
                            "Escalate to Sourcing Director for Human-in-the-Loop review."
                        ],
                        "timeline": "IMMEDIATE"
                    }
                }
                with open(THREAT_REGISTRY_PATH, "w", encoding="utf-8") as f:
                    json.dump(registry, f, indent=2)
                logger.warning(f"Governance Interceptor blocked playbook for threat {id}: {error_msg}")
                return target_threat

            target_threat["playbook"] = {
                "mitigationPlan": {
                    "steps": mitigation_playbook.get("alternate_supplier_actions", []) + \
                               mitigation_playbook.get("inventory_actions", []) + \
                               mitigation_playbook.get("logistics_actions", []) + \
                               mitigation_playbook.get("communication_actions", []),
                    "timeline": mitigation_playbook.get("alternate_supplier_actions", ["3-5 days"])[0] if mitigation_playbook.get("alternate_supplier_actions") else "3-5 days"
                },
                "validationPlan": {
                    "steps": validation_plan.get("source_validation", []) + \
                               validation_plan.get("supplier_validation", []) + \
                               validation_plan.get("risk_review", []) + \
                               validation_plan.get("ongoing_monitoring", []),
                    "timeline": validation_plan.get("source_validation", ["24 hours"])[0] if validation_plan.get("source_validation") else "24 hours"
                }
            }
            
            with open(THREAT_REGISTRY_PATH, "w", encoding="utf-8") as f:
                json.dump(registry, f, indent=2)
                
            logger.info(f"Successfully generated dynamic playbook for threat {id}")
            return target_threat
            
        except Exception as agent_err:
            logger.error(f"AI Playbook Agent failed: {agent_err}")
            raise HTTPException(status_code=502, detail=f"AI Playbook generation failed: {agent_err}")

    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error in generate_threat_playbook: {e}")
        raise HTTPException(status_code=500, detail=str(e))

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

simulated_ids = set()

@app.post("/api/signals/simulate")
def simulate_signal():
    global simulated_ids
    try:
        # Load the real processed signals
        real_signals = []
        try:
            with open(SIGNALS_PATH, "r", encoding="utf-8") as f:
                real_signals = json.load(f)
        except Exception as e:
            logger.error(f"Failed to read signals.json: {e}")
            raise HTTPException(status_code=500, detail="Signals database missing or unreadable.")

        # Filter out signals that have already been simulated in the current session
        unloaded_signals = [s for s in real_signals if s["id"] not in simulated_ids]

        if not unloaded_signals:
            simulated_ids.clear()
            unloaded_signals = real_signals.copy()

        if not unloaded_signals:
            raise HTTPException(status_code=404, detail="No curated signals available.")

        selected_signal = random.choice(unloaded_signals).copy()
        simulated_ids.add(selected_signal["id"])
        logger.info(f"SIMULATOR PIPELINE: Selecting curated signal {selected_signal['id']} from signals.json pool.")

        # Trigger analyze_signals agent to dynamically structure the signal
        try:
            logger.info("Triggering analyze_signals agent to evaluate the simulated signal.")
            supply_base = supply_base_prompt()
            try:
                with open(THREAT_REGISTRY_PATH, "r", encoding="utf-8") as f:
                    reg_data = json.load(f)
            except Exception:
                reg_data = []
            
            raw_text = f"{selected_signal.get('disruption')} — {selected_signal.get('fullDescription')}"
            analyzed_card = analyze_signals(supply_base, json.dumps(reg_data[:5]), raw_text)
            
            # Merge fields from analyzed_card
            for k, v in analyzed_card.items():
                if v != "TODO" and v is not None:
                    selected_signal[k] = v
            logger.info(f"Successfully analyzed signal {selected_signal.get('id')} using AI agent.")
        except Exception as e:
            logger.warning(f"AI signal analysis failed: {e}. Falling back to default heuristics.")
            selected_signal = make_signal_truly_unique(selected_signal)

        selected_signal["ingestedAt"] = int(time.time() * 1000)
        selected_signal = cluster_and_save_signal(selected_signal, THREAT_REGISTRY_PATH, logger=logger)
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
            
            real_signals = []
            try:
                with open(SIGNALS_PATH, "r", encoding="utf-8") as f:
                    real_signals = json.load(f)
            except Exception as e:
                logger.warning(f"STREAM PIPELINE: Failed to load signals pool: {e}")
                
            unstreamed = [s for s in real_signals if s["id"] not in streamed_ids]

            if not unstreamed:
                logger.info("STREAM PIPELINE: All signals from signals.json have been streamed.")
                break

            selected_signal = random.choice(unstreamed).copy()
            streamed_ids.add(selected_signal["id"])
            logger.info(f"STREAM PIPELINE: Dispatching signal {selected_signal['id']} from pool.")

            selected_signal["ingestedAt"] = int(time.time() * 1000)
            selected_signal["category"] = get_taxonomy_by_id(
                selected_signal.get("id"),
                selected_signal.get("disruption", ""),
                selected_signal.get("facility", ""),
                selected_signal.get("fullDescription", "")
            )
            
            yield {
                "event": "new_signal",
                "data": json.dumps(selected_signal)
            }
            
    return EventSourceResponse(event_generator())

@app.get("/api/real-news")
def get_real_news():
    import sys
    import pandas as pd
    from datetime import datetime
    
    sys.path.append(str(BACKEND_ROOT.parent / "scripts"))
    import google_news_batch_processor as gnp
    
    all_articles = []
    for feed in gnp.REGIONAL_FEEDS:
        for query in gnp.QUERIES:
            xml_data = gnp.fetch_rss_feed(query, feed)
            articles = gnp.parse_rss_xml(xml_data, feed["name"])
            all_articles.extend(articles)
            
    if not all_articles:
        logger.info("RSS feed empty or offline. Attempting to trigger collect_public_signals agent.")
        try:
            try:
                with open(SIGNALS_PATH, "r", encoding="utf-8") as f:
                    current_signals_str = f.read()
            except Exception:
                current_signals_str = "[]"
                
            supply_base = supply_base_prompt()
            generated_headlines = collect_public_signals(supply_base, current_signals_str)
            
            for headline in generated_headlines:
                all_articles.append({
                    "Title": headline,
                    "Source": "AI OSINT Collector",
                    "PublishedAt": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                    "Description": f"Emerging propulsion supply chain alert: {headline}",
                    "URL": f"https://ai-intel-hub.report/signals/{hashlib.md5(headline.encode('utf-8')).hexdigest()[:8]}",
                    "RegionSource": "Global (AI)"
                })
            logger.info(f"AI OSINT Collector generated {len(all_articles)} dynamic headlines.")
        except Exception as e:
            logger.warning(f"AI signal collection failed: {e}. Falling back to static mock articles.")
            all_articles = [
                {
                    "Title": "Spirit AeroSystems halts fuselage shipment to Boeing Renton plant due to logistics gridlock",
                    "Source": "Aviation Week",
                    "PublishedAt": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                    "Description": "Rerouting from Wichita to Renton experiencing extreme winter rail disruptions, stalling crucial component delivery.",
                    "URL": "https://aviationweek.com/spirit-aerosystems-delays",
                    "RegionSource": "United States (EN)"
                },
                {
                    "Title": "GE Aerospace announces additional inspections on GEnx turbine blades after quality controls",
                    "Source": "Reuters",
                    "PublishedAt": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                    "Description": "New safety inspection sweeps introduced at Evendale assembly hubs, potentially slowing engine output schedules.",
                    "URL": "https://reuters.com/ge-aerospace-turbine-blade-quality",
                    "RegionSource": "United Kingdom (EN)"
                },
                {
                    "Title": "Toray carbon fiber prepreg production paused at Ehime plant following regional seismic safety shutdown",
                    "Source": "Nikkei Asia",
                    "PublishedAt": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                    "Description": "Automatic safeguards triggered safety inspection protocols, reducing carbon fiber output for composite wing constructs.",
                    "URL": "https://nikkei.com/toray-ehime-plant-seismic",
                    "RegionSource": "Japan (JA)"
                }
            ]

    df = pd.DataFrame(all_articles)
    df = df.drop_duplicates(subset=["URL"])
    df = df.drop_duplicates(subset=["Title"])
    
    taxonomies = []
    category_names = []
    suppliers = []
    impacted_locations = []
    severities = []
    
    for _, row in df.iterrows():
        tax_code, tax_name = gnp.assign_risk_taxonomy(row["Title"], row["Description"])
        supplier, meta = gnp.resolve_entities(row["Title"], row["Description"])
        sev = gnp.calculate_severity(row["Title"], row["Description"])
        
        taxonomies.append(tax_code)
        category_names.append(tax_name)
        suppliers.append(supplier)
        impacted_locations.append(meta["location"])
        severities.append(sev)
        
    df["TaxonomyCode"] = taxonomies
    df["RiskCategory"] = category_names
    df["AffectedSupplier"] = suppliers
    df["ImpactedLocation"] = impacted_locations
    df["EstimatedSeverity"] = severities
    
    json_signals = gnp.generate_signals_json(df)
    
    # Save directly to signals.json pool on disk
    try:
        try:
            with open(SIGNALS_PATH, "r", encoding="utf-8") as f:
                existing_signals = json.load(f)
        except Exception:
            existing_signals = []
        
        existing_urls = {s.get("sources", [{}])[0].get("url", "") for s in existing_signals if s.get("sources")}
        for sig in json_signals:
            sig_url = sig.get("sources", [{}])[0].get("url", "") if sig.get("sources") else ""
            if sig_url not in existing_urls:
                existing_signals.insert(0, sig)
                
        with open(SIGNALS_PATH, "w", encoding="utf-8") as f:
            json.dump(existing_signals, f, indent=2)
    except Exception as e:
        logger.error(f"Failed to update signals.json in real-news route: {e}")

    # Cluster and save into active threatRegistry.json
    saved_signals = []
    for sig in json_signals:
        try:
            saved_sig = cluster_and_save_signal(sig, THREAT_REGISTRY_PATH, logger=logger)
            saved_signals.append(saved_sig)
        except Exception as e:
            logger.error(f"Failed to cluster signal {sig.get('id')} in real-news: {e}")
            saved_signals.append(sig)
            
    return saved_signals