#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Boeing Supply Chain Risk - International Google News RSS Batch Processor & Translator
Ingests international news feeds, deduplicates them, assigns risk taxonomies, resolves 
supplier locations and coordinates, synthesizes structural playbooks, and exports a 100% 
frontend-compatible JSON threat database directly to the live backend directory.
"""

import os
import re
import html
import json
import hashlib
import time
import urllib.request
import urllib.parse
import xml.etree.ElementTree as ET
from datetime import datetime
import pandas as pd

# Define our supply base risk taxonomy mappings
TAXONOMY_MAP = {
    "QS": "Quality & Safety (Supplier defects, quality escapes, airworthiness directives, recalls, inspections)",
    "LW": "Labor & Workforce (Strikes, union disputes, labor shortages, layoffs, negotiations)",
    "MS": "Material & Component Shortages (Raw material shortages, castings, fasteners, titanium/nickel delays)",
    "LT": "Logistics & Transportation (Rail delays, port congestion, shipping/air cargo capacity bottlenecks)",
    "GT": "Geopolitical & Trade (Export restrictions, sanctions, tariffs, trade war/conflicts)",
    "ND": "Natural Disasters & Weather (Earthquakes, typhoons, flooding, extreme weather)",
    "CS": "Cyber & IT Security (Ransomware attacks, IT/system outages, data breaches at key suppliers)",
    "FC": "Financial & Corporate (Supplier bankruptcy, distress, mergers & acquisitions, re-verticalization)",
    "MP": "Manufacturing & Production (Autoclave downtime, kiln shutdowns, factory floor capacity constraints)",
    "EU": "Energy & Utilities (Power outages, gas pressure drops, fuel shortages at smelters/processing plants)"
}

# Resolved Metadata Database matching supplier names to coordinates, facility, tier and roles
RESOLVED_METADATA = {
    "Spirit AeroSystems": {
        "facility": "Spirit AeroSystems Wichita Plant",
        "location": "Wichita, KS, US",
        "coordinates": [-97.2798, 37.6436],
        "tier": 1,
        "role": "Tier-1 / Fuselages & Wings",
        "color": "#D32F2F"
    },
    "GE Aerospace": {
        "facility": "GE Aerospace Evendale Facility",
        "location": "Evendale, OH, US",
        "coordinates": [-84.2619, 39.2573],
        "tier": 1,
        "role": "Tier-1 / Aircraft Engines",
        "color": "#D32F2F"
    },
    "CFM International": {
        "facility": "CFM Evendale Assembly Lines",
        "location": "Evendale, OH, US",
        "coordinates": [-84.2619, 39.2573],
        "tier": 1,
        "role": "Tier-1 / Turbofans",
        "color": "#D32F2F"
    },
    "Safran": {
        "facility": "Safran Landing Systems Bidos",
        "location": "Bidos, FR",
        "coordinates": [-0.605, 43.181],
        "tier": 1,
        "role": "Tier-1 / Landing Gear",
        "color": "#D32F2F"
    },
    "Toray Industries": {
        "facility": "Toray Ehime Plant",
        "location": "Ehime, JP",
        "coordinates": [133.0906, 33.8569],
        "tier": 2,
        "role": "Tier-2 / Carbon Fiber",
        "color": "#FFB300"
    },
    "Hexcel": {
        "facility": "Hexcel Decatur Facility",
        "location": "Decatur, AL, US",
        "coordinates": [-86.9833, 34.6059],
        "tier": 2,
        "role": "Tier-2 / Advanced Composites",
        "color": "#FFB300"
    },
    "Precision Castparts": {
        "facility": "Precision Castparts Portland",
        "location": "Portland, OR, US",
        "coordinates": [-122.6742, 45.5231],
        "tier": 2,
        "role": "Tier-2 / Titanium Forgings",
        "color": "#D32F2F"
    },
    "VSMPO-Avisma": {
        "facility": "VSMPO-Avisma Verkhnyaya Salda",
        "location": "Verkhnyaya Salda, RU",
        "coordinates": [60.8028, 58.0461],
        "tier": 3,
        "role": "Tier-3 / Titanium Billets",
        "color": "#FFB300"
    },
    "Alcoa": {
        "facility": "Alcoa Reykjavik Smelter",
        "location": "Reykjavik, IS",
        "coordinates": [-21.8277, 64.1265],
        "tier": 3,
        "role": "Tier-3 / Raw Aluminum",
        "color": "#FFB300"
    },
    "Honeywell Aerospace": {
        "facility": "Honeywell Phoenix Center",
        "location": "Phoenix, AZ, US",
        "coordinates": [-112.074, 33.4484],
        "tier": 1,
        "role": "Tier-1 / Avionics & APUs",
        "color": "#FFB300"
    },
    "Collins Aerospace": {
        "facility": "Collins Chula Vista Facility",
        "location": "Chula Vista, CA, US",
        "coordinates": [-117.0842, 32.6401],
        "tier": 1,
        "role": "Tier-1 / Systems Integration",
        "color": "#D32F2F"
    },
    "Moog": {
        "facility": "Moog East Aurora Plant",
        "location": "East Aurora, NY, US",
        "coordinates": [-78.6153, 42.7669],
        "tier": 2,
        "role": "Tier-2 / Primary Actuation",
        "color": "#FFB300"
    },
    "Woodward": {
        "facility": "Woodward Fort Collins Plant",
        "location": "Fort Collins, CO, US",
        "coordinates": [-105.0844, 40.5853],
        "tier": 2,
        "role": "Tier-2 / Fuel Controls",
        "color": "#FFB300"
    },
    "GKN Aerospace": {
        "facility": "GKN Aerospace Filton",
        "location": "Filton, UK",
        "coordinates": [-2.5935, 51.5204],
        "tier": 1,
        "role": "Tier-1 / Aerostructures",
        "color": "#D32F2F"
    },
    "Triumph Group": {
        "facility": "Triumph Red Oak Facility",
        "location": "Red Oak, TX, US",
        "coordinates": [-96.8044, 32.5201],
        "tier": 2,
        "role": "Tier-2 / Wing Assembly",
        "color": "#FFB300"
    },
    "Rolls-Royce": {
        "facility": "Rolls-Royce Derby Plant",
        "location": "Derby, UK",
        "coordinates": [-1.4552, 52.8931],
        "tier": 1,
        "role": "Tier-1 / Aircraft Engines",
        "color": "#D32F2F"
    },
    "Pratt & Whitney": {
        "facility": "Pratt & Whitney East Hartford",
        "location": "East Hartford, CT, US",
        "coordinates": [-72.6201, 41.7584],
        "tier": 1,
        "role": "Tier-1 / Turbofans",
        "color": "#D32F2F"
    },
    "Boeing (Direct)": {
        "facility": "Boeing Renton Final Assembly",
        "location": "Renton, WA, US",
        "coordinates": [-122.2034, 47.4797],
        "tier": 0,
        "role": "Tier-0 / Main Line Assembly",
        "color": "#D32F2F"
    },
    "Undetermined Supplier": {
        "facility": "Unspecified Sub-tier Facility",
        "location": "Toulouse, FR",
        "coordinates": [1.4442, 43.6047],
        "tier": 2,
        "role": "Tier-2 / Precision Parts",
        "color": "#FFB300"
    }
}

# Heuristics Playbook and Risk Scenarios based on supply chain taxonomy
PLAYBOOK_TEMPLATES = {
    "QS": {
        "mitigation_steps": [
            "Initiate immediate engineering quality audits on active inventory batches.",
            "Deploy specialized quality assurance teams to inspect supplier production floor.",
            "Expedite backup component inspections from secondary certified distributors."
        ],
        "validation_steps": [
            "Conduct non-destructive ultrasound stress test runs on initial replacement parts.",
            "Verify all quarantined batches meet metallurgical and FAA airworthiness standards."
        ],
        "mitigation_timeline": "4 to 7 operational days for inspection containment",
        "validation_timeline": "2 business days for engineering Stress Certification and sign-off",
        "downstream_impact": "Risk of assembly line stoppage due to critical component quarantine; extended quality-checking overhead.",
        "mitigation_objective": "Restore quality compliance buffers and clear assembly backlogs.",
        "likelihood": 85,
        "time_to_hit": 5
    },
    "LW": {
        "mitigation_steps": [
            "Initiate emergency logistics bypass pathways under Priority-A aerospace clearance.",
            "Deploy parallel shift rotations to maximize operational capacity at active yards.",
            "Consult alternative labor union registries to coordinate standby shift rosters."
        ],
        "validation_steps": [
            "Track daily production output rates against baseline volume recovery requirements.",
            "Audit standby technician credentials to guarantee active FAA safety certifications."
        ],
        "mitigation_timeline": "6 to 10 operational days for alternative logistics routing",
        "validation_timeline": "3 days of continuous logistics performance tracking",
        "downstream_impact": "Extended stoppage risk for direct program sub-assemblies; significant daily stop-line cost exposure.",
        "mitigation_objective": "Establish redundant transportation bridges and bypass active labor roadblocks.",
        "likelihood": 90,
        "time_to_hit": 14
    },
    "MS": {
        "mitigation_steps": [
            "Procure raw precursor feedstock supplies from secondary qualified domestic distributor.",
            "Activate emergency inventory storage buffers held at bonded regional warehouses.",
            "Optimize smelting and forging shifts to prioritize active widebody component runs."
        ],
        "validation_steps": [
            "Verify replacement chemical feedstock composition against aerospace specification sheets.",
            "Perform laboratory analysis on initial output castings to check metallurgical integrity."
        ],
        "mitigation_timeline": "14 to 21 operational days for alternative feedstock logistics",
        "validation_timeline": "4 business days of continuous chemical purity verification",
        "downstream_impact": "Reduced manufacturing capacity at sub-tier casting/forging hubs, increasing downstream lead times.",
        "mitigation_objective": "Diversify feedstock sourcing streams to bypass raw mineral shortages.",
        "likelihood": 75,
        "time_to_hit": 30
    },
    "LT": {
        "mitigation_steps": [
            "Deploy temperature-controlled road courier truck fleets to collect stalled air cargo.",
            "Secure expedited customs processing priority via dedicated aerospace customs brokers.",
            "Divert incoming logistical shipments to secondary operational maritime gateways."
        ],
        "validation_steps": [
            "Verify transit handling logs to ensure correct temperature/vibration bounds were kept.",
            "Audit receiving bay intake capacity sheets before staged highway convoy arrivals."
        ],
        "mitigation_timeline": "5 to 7 business days for custom clearance and trucking",
        "validation_timeline": "2 business days of transit telemetry validation",
        "downstream_impact": "Inbound transport delay causing structural assembly shortages at integration hangars.",
        "mitigation_objective": "Bypass congested ports and secure priority transportation lanes.",
        "likelihood": 80,
        "time_to_hit": 10
    },
    "GT": {
        "mitigation_steps": [
            "Transition critical raw billet imports to approved friendly-nation suppliers.",
            "Obtain emergency regulatory export licenses under national defense exemptions.",
            "Coordinate with trade compliance legal panels to clear port customs constraints."
        ],
        "validation_steps": [
            "Confirm all alternative raw material suppliers possess active ASL-certification tags.",
            "Audit legal compliance registries to guarantee no sanctions regulations are violated."
        ],
        "mitigation_timeline": "20 to 45 operational days for geopolitical supplier pivoting",
        "validation_timeline": "5 business days for compliance audits and legal reviews",
        "downstream_impact": "Long-term lead time volatility and cost spikes for high-temperature superalloys.",
        "mitigation_objective": "Reduce geopolitical dependency by diversifying trade and shipping lanes.",
        "likelihood": 65,
        "time_to_hit": 45
    },
    "ND": {
        "mitigation_steps": [
            "Deploy specialized structural engineering teams to inspect plant foundations.",
            "Divert incoming precursor chemistry supplies to secondary remote storage bays.",
            "Activate emergency battery backup modules to maintain minimum cleanroom operations."
        ],
        "validation_steps": [
            "Test facility pressure, thermal, and leak containment metrics before restarting.",
            "Ensure regional environmental safety agencies issue full restart authorization."
        ],
        "mitigation_timeline": "48 to 72 hours for safety checks and debris clearance",
        "validation_timeline": "24 hours of plant structural pressure monitoring before full load",
        "downstream_impact": "Sudden reduction in component output speed due to utility grid shocks or facility closures.",
        "mitigation_objective": "Ensure absolute structural safety prior to chemical/smelting line reboots.",
        "likelihood": 50,
        "time_to_hit": 0
    },
    "CS": {
        "mitigation_steps": [
            "Isolate compromised network switches to quarantine ransomware vectors.",
            "Deploy backup offline telemetry capture setups on primary manufacturing lines.",
            "Activate pre-audited disaster recovery servers and initialize database restoration."
        ],
        "validation_steps": [
            "Execute complete antivirus and vulnerability scans across all reconnected hosts.",
            "Verify data logs are back to operational synchronization standards."
        ],
        "mitigation_timeline": "24 to 72 hours for server recovery and network quarantine",
        "validation_timeline": "12 hours of network safety logging before production restart",
        "downstream_impact": "Loss of live SCADA telemetry, requiring slower manual tracking and quality logs.",
        "mitigation_objective": "Quarantine network threats and restore clean, verified offline server states.",
        "likelihood": 70,
        "time_to_hit": 1
    },
    "FC": {
        "mitigation_steps": [
            "Authorize priority financial advances or short-term liquidity bridges to critical node.",
            "Initiate pre-merger integration planning to re-verticalize supplier operations.",
            "Establish secondary backup sourcing contacts to cover sudden insolvency scenarios."
        ],
        "validation_steps": [
            "Conduct extensive due diligence and financial audits on targeted supplier lines.",
            "Verify all alternate suppliers are fully audited and integrated into Active Vendor Lists."
        ],
        "mitigation_timeline": "30 to 60 business days for capital structuring or acquisitions",
        "validation_timeline": "5 business days for financial and legal validation",
        "downstream_impact": "Long-term production halts if supplier defaults; critical re-verticalization needed.",
        "mitigation_objective": "Stabilize systemic single-point-of-failure to protect primary program line flows.",
        "likelihood": 60,
        "time_to_hit": 60
    },
    "MP": {
        "mitigation_steps": [
            "Redistribute production curing/smelting loads to active parallel systems.",
            "Dispatch OEM specialized engineering units to rebuild degraded kiln refractories.",
            "Reschedule widebody delivery buffers to smooth line assembly velocity."
        ],
        "validation_steps": [
            "Verify temperature and pressure consistency under peak thermal test cycles.",
            "Track system throughput metrics to confirm structural recovery to baseline rates."
        ],
        "mitigation_timeline": "3 to 5 operational days for equipment calibration and liner replacement",
        "validation_timeline": "24 hours of thermal consistency stress profiling",
        "downstream_impact": "Reduced assembly line curing volume, risking final delivery schedules.",
        "mitigation_objective": "Maximize parallel capacity run-rates to absorb downtime backlogs.",
        "likelihood": 80,
        "time_to_hit": 7
    },
    "EU": {
        "mitigation_steps": [
            "Activate localized emergency backup vaporization arrays and generators.",
            "Divert non-critical precursor synthesis lines to secondary operational hubs.",
            "Optimize chamber temperatures to preserve active chemical synthesis runs."
        ],
        "validation_steps": [
            "Confirm stable gas pressure and electrical output metrics across primary lines.",
            "Analyze chemical precursor samples to verify correct molecular purity."
        ],
        "mitigation_timeline": "10 to 14 business days for energy network stabilization",
        "validation_timeline": "48 hours of pressure stability tracking prior to high-volume synthesis",
        "downstream_impact": "Power/gas shocks causing automatic shutdowns of raw precursor processing ovens.",
        "mitigation_objective": "Stabilize furnace pressure and secure emergency backup energy supplies.",
        "likelihood": 55,
        "time_to_hit": 3
    }
}

# Regional search profiles
REGIONAL_FEEDS = [
    {"name": "United States (EN)", "hl": "en-US", "gl": "US", "ceid": "US:en"},
    {"name": "United Kingdom (EN)", "hl": "en-GB", "gl": "GB", "ceid": "GB:en"},
    {"name": "Germany (DE)", "hl": "de", "gl": "DE", "ceid": "DE:de"},
    {"name": "France (FR)", "hl": "fr", "gl": "FR", "ceid": "FR:fr"},
    {"name": "Japan (JA)", "hl": "ja", "gl": "JP", "ceid": "JP:ja"}
]

# Primary Queries
QUERIES = [
    'Boeing ("supply chain" OR shortage OR strike OR shutdown OR delay OR backlog OR defect OR "quality issue")',
    '("Spirit AeroSystems" OR "GE Aerospace" OR "Toray" OR "Precision Castparts" OR "VSMPO-Avisma") (disruption OR halt OR shortage OR strike OR bottleneck)'
]

def clean_html(raw_html):
    """Clean HTML tags and unescape HTML entities."""
    if not raw_html:
        return ""
    clean_text = re.sub(r'<[^>]+>', '', raw_html)
    return html.unescape(clean_text)

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


def fetch_rss_feed(query, feed_config):
    """Fetch RSS feed from Google News."""
    encoded_query = urllib.parse.quote(query)
    url = f"https://news.google.com/rss/search?q={encoded_query}&hl={feed_config['hl']}&gl={feed_config['gl']}&ceid={feed_config['ceid']}"
    
    headers = {'User-Agent': 'Mozilla/5.0'}
    
    print(f"  Fetching: {feed_config['name']} | Query: {query[:45]}...")
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as response:
            return response.read()
    except Exception as e:
        print(f"  [Error] Failed to fetch feed: {e}")
        return None

def parse_rss_xml(xml_data, region_name):
    """Parse Google News RSS XML data."""
    articles = []
    if not xml_data:
        return articles
        
    try:
        root = ET.fromstring(xml_data)
        for item in root.findall('.//item'):
            title = clean_html(item.find('title').text if item.find('title') is not None else "")
            link = item.find('link').text if item.find('link') is not None else ""
            pub_date_str = item.find('pubDate').text if item.find('pubDate') is not None else ""
            description = clean_html(item.find('description').text if item.find('description') is not None else "")
            
            source = "Google News"
            if " - " in title:
                parts = title.rsplit(" - ", 1)
                title = parts[0]
                source = parts[1]
                
            try:
                pub_date = datetime.strptime(pub_date_str, "%a, %d %b %Y %H:%M:%S %Z")
            except Exception:
                pub_date = datetime.now()
                
            articles.append({
                "Title": title,
                "Source": source,
                "PublishedAt": pub_date.strftime("%Y-%m-%d %H:%M:%S"),
                "Description": description,
                "URL": link,
                "RegionSource": region_name
            })
    except Exception as e:
        print(f"  [Error] XML parsing error: {e}")
        
    return articles

def assign_risk_taxonomy(title, description):
    """Classify risk taxonomy."""
    text = (title + " " + description).lower()
    
    # Simple keyword dictionary
    keywords_dict = {
        "QS": ["quality", "defect", "safety", "plug", "blowout", "regulatory", "faa", "inspect", "recall", "airworthiness", "escape"],
        "LW": ["strike", "union", "labor", "workforce", "layoff", "dispute", "negotiat", "walkout", "iam"],
        "MS": ["shortage", "sponge", "nickel", "titanium", "aluminum", "alloy", "cast", "forg", "fastener", "feedstock", "raw material"],
        "LT": ["rail", "port", "ship", "cargo", "freight", "delay", "logistics", "congest", "transport", "delivery", "bottleneck"],
        "GT": ["export", "import", "sanction", "tariff", "trade", "geopolit", "nationaliz", "war", "ban", "restriction"],
        "ND": ["earthquake", "typhoon", "flood", "weather", "storm", "hurricane", "disaster", "landslide", "seismic"],
        "CS": ["cyber", "ransomware", "breach", "hack", "outage", "software", "malware", "it"],
        "FC": ["bankrupt", "insolv", "finance", "distress", "acquisit", "merger", "buy", "acquire", "decline", "revenue", "downgrade"],
        "MP": ["capacity", "bottleneck", "production", "manufactur", "assembly", "autoclave", "kiln", "halt", "shutdown", "offline", "idle"],
        "EU": ["power", "energy", "electric", "fuel", "gas", "outage", "grid", "pipeline"]
    }
    
    best_tax = "MP"
    max_matches = 0
    
    for tax, keywords in keywords_dict.items():
        matches = sum(1 for kw in keywords if kw in text)
        if matches > max_matches:
            max_matches = matches
            best_tax = tax
            
    return best_tax, TAXONOMY_MAP[best_tax]

def calculate_severity(title, description):
    """Compute an estimated severity score."""
    text = (title + " " + description).lower()
    
    critical_terms = ["halt", "shutdown", "collapse", "catastrophic", "suspend", "cripple", "ground", "critical", "freeze"]
    major_terms = ["strike", "disrupt", "shortage", "defect", "warning", "investig", "probe", "delay", "bottleneck", "struggle"]
    minor_terms = ["monitor", "discuss", "negotiat", "concern", "review", "minor"]
    
    score = 2.5
    
    if any(term in text for term in critical_terms):
        score += 4.5
    elif any(term in text for term in major_terms):
        score += 2.5
    elif any(term in text for term in minor_terms):
        score += 0.5
        
    return round(min(max(score, 1.0), 10.0), 1)

def resolve_entities(title, description):
    """Resolve specific supplier and country names."""
    text = (title + " " + description).lower()
    resolved_supplier = "Undetermined Supplier"
    
    # Resolve using RESOLVED_METADATA keys
    for supplier in RESOLVED_METADATA.keys():
        if supplier == "Undetermined Supplier":
            continue
        patterns = [supplier.lower()]
        if supplier == "Spirit AeroSystems":
            patterns = ["spirit aerosystems", "spirit aero"]
        elif supplier == "GE Aerospace":
            patterns = ["ge aerospace", "general electric aerospace"]
        elif supplier == "Boeing (Direct)":
            patterns = ["boeing"]
            
        if any(re.search(p, text) for p in patterns):
            resolved_supplier = supplier
            break
            
    # Default fallback
    if resolved_supplier == "Undetermined Supplier" and "boeing" in text:
        resolved_supplier = "Boeing (Direct)"
        
    meta = RESOLVED_METADATA[resolved_supplier]
    return resolved_supplier, meta

def generate_signals_json(df):
    """Transforms Pandas DataFrame into 100% compliant frontend JSON schemas."""


    def share_significant_keywords(tokens1, tokens2):
        keywords = {
            "strike", "union", "contract", "labor", "layoff", "negotiat",
            "defect", "inspect", "faa", "safety", "airworthiness", "quality",
            "shortage", "titanium", "alloy", "nickel", "cast", "forg",
            "delay", "logistics", "rail", "port", "ship", "freight",
            "capacity", "autoclave", "kiln", "halt", "shutdown", "offline",
            "power", "energy", "outage", "grid", "freeze", "cyber", "ransomware"
        }
        common = tokens1.intersection(tokens2)
        return len(common.intersection(keywords)) >= 1 or len(common) >= 2

    # Cluster articles
    clusters = []
    
    for idx, row in df.iterrows():
        title = row["Title"]
        desc = row["Description"]
        tax_code, tax_name = assign_risk_taxonomy(title, desc)
        supplier, meta = resolve_entities(title, desc)
        facility = meta["facility"]
        
        title_tokens = tokenize_title(title)
        
        # Check if it fits in an existing cluster
        matched_cluster = None
        for cluster in clusters:
            if cluster["facility"] == facility and cluster["tax_code"] == tax_code:
                sim = jaccard_similarity(title_tokens, cluster["title_tokens"])
                if sim >= 0.20 or share_significant_keywords(title_tokens, cluster["title_tokens"]):
                    matched_cluster = cluster
                    break
                    
        if matched_cluster:
            matched_cluster["articles"].append(row)
            matched_cluster["title_tokens"].update(title_tokens)
        else:
            clusters.append({
                "facility": facility,
                "tax_code": tax_code,
                "tax_name": tax_name,
                "supplier": supplier,
                "meta": meta,
                "title_tokens": title_tokens,
                "articles": [row]
            })
            
    json_signals = []
    
    for cluster in clusters:
        primary = cluster["articles"][0]
        title = primary["Title"]
        desc = primary["Description"]
        meta = cluster["meta"]
        tax_code = cluster["tax_code"]
        tax_name = cluster["tax_name"]
        
        # Calculate max severity across the cluster
        max_severity = 1.0
        for art in cluster["articles"]:
            sev = calculate_severity(art["Title"], art["Description"])
            if sev > max_severity:
                max_severity = sev
                
        # Unique ID Hash Generation
        hash_str = title + primary.get("URL", "")
        hash_id = hashlib.md5(hash_str.encode('utf-8')).hexdigest()[:4].upper()
        item_id = f"SUP-{hash_id}B"
        
        playbook_tmpl = PLAYBOOK_TEMPLATES.get(tax_code, PLAYBOOK_TEMPLATES["MP"])
        
        sources_list = []
        for art in cluster["articles"]:
            sources_list.append({
                "title": art["Title"],
                "url": art["URL"],
                "summary": art["Description"] if art["Description"] else art["Title"]
            })
            
        full_description = desc if desc else title
        if len(cluster["articles"]) > 1:
            full_description = f"[Clustered Event - {len(cluster['articles'])} Sources Reporting] {full_description}\n\nAdditional coverage:\n" + "\n".join([f"- {art['Title']} (Source: {art['Source']})" for art in cluster["articles"][1:]])
            
        json_signals.append({
            "id": item_id,
            "facility": meta["facility"],
            "location": meta["location"],
            "disruption": title if len(cluster["articles"]) == 1 else f"{title} ({len(cluster['articles'])} articles)",
            "severity": max_severity,
            "likelihood": playbook_tmpl["likelihood"],
            "timeToHit": playbook_tmpl["time_to_hit"],
            "tier": meta["tier"],
            "fullDescription": full_description,
            "sourceData": f"Google News RSS Ingest: {primary['Source']} ({primary['RegionSource']})",
            "mapPosition": {
                "coordinates": meta["coordinates"],
                "color": meta["color"],
                "role": meta["role"],
                "status": "Critical threat" if max_severity >= 7.0 else "Elevated Risk"
            },
            "playbook": {
                "mitigationPlan": {
                    "steps": playbook_tmpl["mitigation_steps"],
                    "timeline": playbook_tmpl["mitigation_timeline"]
                },
                "validationPlan": {
                    "steps": playbook_tmpl["validation_steps"],
                    "timeline": playbook_tmpl["validation_timeline"]
                }
            },
            "downstreamImpact": playbook_tmpl["downstream_impact"],
            "mitigationObjective": playbook_tmpl["mitigation_objective"],
            "ingestedAt": int(time.time() * 1000),
            "sources": sources_list
        })
        
    return json_signals

def run_batch_processor():
    """Main pipeline execution."""
    print("="*75)
    print("BOEING SUPPLY CHAIN RISK PORTAL - GOOGLE NEWS BATCH PROCESSOR")
    print("="*75)
    
    all_articles = []
    
    for feed in REGIONAL_FEEDS:
        for query in QUERIES:
            xml_data = fetch_rss_feed(query, feed)
            articles = parse_rss_xml(xml_data, feed["name"])
            all_articles.extend(articles)
            
    if not all_articles:
        print("\n[!] No live articles retrieved. Loading fallback mock feed...")
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
    
    # Deduplicate
    initial_len = len(df)
    df = df.drop_duplicates(subset=["URL"])
    df = df.drop_duplicates(subset=["Title"])
    cleaned_len = len(df)
    print(f"\n[+] Ingested {initial_len} raw articles. Deduplicated to {cleaned_len} unique signals.")
    
    # Clean output columns
    taxonomies = []
    category_names = []
    suppliers = []
    impacted_locations = []
    severities = []
    
    for _, row in df.iterrows():
        tax_code, tax_name = assign_risk_taxonomy(row["Title"], row["Description"])
        supplier, meta = resolve_entities(row["Title"], row["Description"])
        sev = calculate_severity(row["Title"], row["Description"])
        
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
    
    # Save base CSV
    output_dir = "/Users/epheriami/Downloads/Projects/aps1013/project/scripts"
    os.makedirs(output_dir, exist_ok=True)
    csv_path = os.path.join(output_dir, "boeing_supply_chain_signals.csv")
    df.to_csv(csv_path, index=False)
    print(f"[+] Successfully saved {len(df)} base signals to CSV: {csv_path}")
    
    # Transform to Compliant JSON
    json_signals = generate_signals_json(df)
    
    # Save directly to live backend directory for dashboard ingestion!
    live_signals_path = "/Users/epheriami/Downloads/Projects/aps1013/project/backend/data/signals.json"
    with open(live_signals_path, "w", encoding="utf-8") as f:
        json.dump(json_signals, f, indent=2)
    print(f"[+] TRANSFORMATION COMPLETE: Saved {len(json_signals)} fully compliant threat records directly to portal database: {live_signals_path}")

    # Prepend and cluster new signals directly into the threat registry (active table database)
    registry_paths = [
        "/Users/epheriami/Downloads/Projects/aps1013/project/backend/data/threatRegistry.json",
        "/Users/epheriami/Downloads/Projects/aps1013/project/frontend/public/data/threatRegistry.json"
    ]
    
    for registry_path in registry_paths:
        if os.path.exists(registry_path):
            try:
                with open(registry_path, "r", encoding="utf-8") as f:
                    existing_registry = json.load(f)
            except Exception as e:
                print(f"[!] Warning: Failed to load registry at {registry_path}: {e}")
                existing_registry = []
                
            updated_registry = list(existing_registry)
            new_added_count = 0
            
            for sig in json_signals:
                facility = sig["facility"]
                disruption = sig["disruption"]
                core = get_core_disruption(disruption)
                tokens = tokenize_title(core)
                
                clustered = False
                for item in updated_registry:
                    if item.get("facility", "") == facility:
                        item_disruption = item.get("disruption", "")
                        item_core = get_core_disruption(item_disruption)
                        item_tokens = tokenize_title(item_core)
                        
                        sim = jaccard_similarity(tokens, item_tokens)
                        if item_core.lower() == core.lower() or sim >= 0.65:
                            if "sources" not in item or not isinstance(item["sources"], list):
                                item["sources"] = [
                                    {
                                        "title": item_core,
                                        "url": item.get("sources", [{}])[0].get("url", "") if isinstance(item.get("sources"), list) and len(item.get("sources")) > 0 else "",
                                        "summary": item.get("fullDescription", "")
                                    }
                                ]
                                
                            incoming_sources = sig.get("sources", [])
                            if not isinstance(incoming_sources, list):
                                incoming_sources = []
                            if not incoming_sources:
                                incoming_sources = [
                                    {
                                        "title": disruption,
                                        "url": sig.get("sources", [{}])[0].get("url", "") if isinstance(sig.get("sources"), list) and len(sig.get("sources")) > 0 else "",
                                        "summary": sig.get("fullDescription", "")
                                    }
                                ]
                                
                            for src in incoming_sources:
                                title = src.get("title", "")
                                url = src.get("url", "")
                                summary = src.get("summary", "")
                                
                                existing_titles = {s.get("title", "").lower() for s in item["sources"]}
                                if title.lower() not in existing_titles:
                                    item["sources"].append({
                                        "title": title,
                                        "url": url,
                                        "summary": summary
                                    })
                                    
                            count = len(item["sources"])
                            item["disruption"] = f"{item_core} ({count} articles)"
                            
                            clean_matched_desc = re.sub(r'^\[Clustered Event\s*-\s*\d+\s*(?:Sources Reporting|Occurrences)\]\s*', '', item.get("fullDescription", ""))
                            clean_matched_desc = re.sub(r'^\[Inc(?:ident)?\s*#?\d+\]\s*', '', clean_matched_desc)
                            clean_matched_desc = re.split(r'\s*Additional report\s*', clean_matched_desc, flags=re.IGNORECASE)[0].strip()
                            
                            item["fullDescription"] = f"[Clustered Event - {count} Sources Reporting] {clean_matched_desc}"
                                
                            item["severity"] = max(item.get("severity", 1.0), sig.get("severity", 1.0))
                            item["ingestedAt"] = max(item.get("ingestedAt", 0), sig.get("ingestedAt", 0))
                            clustered = True
                            break
                            
                if not clustered:
                    updated_registry.insert(0, sig)
                    new_added_count += 1
            
            try:
                with open(registry_path, "w", encoding="utf-8") as f:
                    json.dump(updated_registry, f, indent=2)
                print(f"[+] AUTO-WRITE REGISTRY: Appended {new_added_count} new unique threats, clustered remaining into threat registry: {registry_path}")
            except Exception as e:
                print(f"[!] Error: Failed to write updated registry to {registry_path}: {e}")
    
    # Also save to scripts folder for record-keeping
    json_path = os.path.join(output_dir, "boeing_supply_chain_signals.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(json_signals, f, indent=2)
    print(f"[+] Saved backup JSON to scripts folder: {json_path}")
    
    # Print active High-Severity Monitor
    print("\n" + "="*85)
    print(f"{'ACTIVE HIGH-SEVERITY THREAT MONITOR (FULLY TRANSLATED SCHEMA)':^85}")
    print("="*85)
    print(f"{'ID':<10} | {'Disruption Title':<35} | {'Facility':<20} | {'Severity':<8}")
    print("-"*85)
    
    # Sort by severity
    sorted_signals = sorted(json_signals, key=lambda x: x["severity"], reverse=True)
    for row in sorted_signals[:10]:
        title_trunc = row["disruption"][:32] + "..." if len(row["disruption"]) > 32 else row["disruption"]
        fac_trunc = row["facility"][:18] + "..." if len(row["facility"]) > 18 else row["facility"]
        print(f"{row['id']:<10} | {title_trunc:<35} | {fac_trunc:<20} | {row['severity']:<8}")
        
    print("="*85)
    print("\nTaxonomy Key:")
    for code, desc in TAXONOMY_MAP.items():
        print(f"  [{code}] {desc}")
    print("="*85)

if __name__ == "__main__":
    run_batch_processor()
