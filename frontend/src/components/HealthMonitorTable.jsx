import { useState, useEffect } from "react";
import { ChevronDown, Calendar, X, ShieldAlert, CheckCircle, Clock, Building, MessageSquare, Terminal, RefreshCw, DollarSign, Activity, FileText, AlertTriangle, Users, Award, PlayCircle, Globe, MapPin, Cpu, Radio, ThumbsUp, ThumbsDown, Star, Sparkles, Box, AlertCircle, ArrowRight } from "lucide-react";
import { getTaxonomy } from "./SignalTaxonomy";
import { getSeverityLabel, getSeverityColor, getLikelihoodLabel, getLikelihoodColor, formatTimeToHit } from "../utils/riskHeuristics";

// Integrated boardroom-grade telemetry receiver for JSON streams
const nodeCSuiteData = {
  "FAC-001": {
    baseDailyExposure: 14500000,
    baseTimelineDays: 10,
    baseWorkaroundCost: 450000,
    slaRisk: "CRITICAL: Contractual liquidated damages trigger at Day 12 ($1.5M per aircraft daily penalty).",
    evidenceBase: "Everett structural logs indicate a tight 4-day buffer on titanium structural spars before line shutdown.",
    options: [
      { id: "air", label: "Air Charter Expedite", cost: 650000, daysSaved: 4, desc: "Bypass standard freight rails; charter 3x Antonov An-124 flights." },
      { id: "permit", label: "Fast-Track DOT Permits", cost: 75000, daysSaved: 2, desc: "Engage Washington DOT for expedited heavy-haul corridor permissions." },
      { id: "shifts", label: "Double Shift Assembly Bays", cost: 280000, daysSaved: 2, desc: "Authorize overtime shifts in structural integration section." }
    ],
    strategicPhases: {
      immediate: "Reallocate titanium structural spars from reserve logistics stocks at the Wichita depot (Wichita reserves are currently at 84% capacity).",
      tactical: "Deploy a secondary material-handling shift to expedite composite unboxing and pre-assembly inspections, verifying micro-fracture thresholds.",
      structural: "Shift 777 fuselage wiring and insulation tracks to parallel assembly bays to absorb line idle time and maintain assembly cadence."
    }
  },
  "SUP-001A": {
    baseDailyExposure: 8800000,
    baseTimelineDays: 15,
    baseWorkaroundCost: 320000,
    slaRisk: "HIGH: Renton assembly line halts on Day 10. Direct delivery delay penalties of $850K per day active.",
    evidenceBase: "Midwest rail union negotiations are locked; cooling-off period expires in 72 hours with no resolution in sight.",
    options: [
      { id: "road", label: "Over-the-road Flatbeds", cost: 420000, daysSaved: 6, desc: "Initiate oversized flatbed road transport with police escorts." },
      { id: "permits", label: "KDOT Fast-Track Permits", cost: 50000, daysSaved: 3, desc: "Pre-file permits in Kansas, Missouri, Illinois, and Washington." },
      { id: "depot", label: "Pre-Stage at Renton Depot", cost: 120000, daysSaved: 2, desc: "Lease temporary logistics space near Renton receiving bays." }
    ],
    strategicPhases: {
      immediate: "Initiate oversize flatbed road transport workarounds under Priority-A emergency aerospace clearance (utilizing contract carriers).",
      tactical: "Contact the Kansas Department of Transportation (KDOT) to fast-track oversized road freight permits for structural components.",
      structural: "Coordinate split-arrival scheduling with Renton receiving bays to stay within local storage space and gantry crane constraints."
    }
  },
  "SUP-701X": {
    baseDailyExposure: 32000000,
    baseTimelineDays: 3,
    baseWorkaroundCost: 1500000,
    slaRisk: "EXTREME: SLA breaches across 14 global OEMs. Direct delivery delays could trigger $5M/day contract penalties.",
    evidenceBase: "Lithography EUV sensors recorded a peak seismic acceleration of 0.12g. Automatic shutdown calibrated correctly; structural integrity verified.",
    options: [
      { id: "calib", label: "EUV Auto-Calibration", cost: 250000, daysSaved: 1, desc: "Deploy digital twins and automated calibration scripts developed with ASML." },
      { id: "divert", label: "Divert Packaging to Fab 15", cost: 800000, daysSaved: 1, desc: "Pre-allocate packaging and testing slots at Taichung (Fab 15) to save transit queue time." }
    ],
    strategicPhases: {
      immediate: "Initiate safety recalibration protocols on extreme ultraviolet (EUV) lithography systems utilizing internal engineering squads.",
      tactical: "Divert critical semiconductor packaging queues to TSMC Fab 15 (Taichung) to absorb manufacturing demand and wafer backlogs.",
      structural: "Mobilize emergency backup generator checks and cleanroom particulate monitoring systems to prevent wafer contamination."
    }
  },
  "SUP-401A": {
    baseDailyExposure: 11000000,
    baseTimelineDays: 4,
    baseWorkaroundCost: 220000,
    slaRisk: "HIGH: Vaccine distribution commitments in 3 EU nations are at risk. Potential regulatory warning letter exposure if validation fails.",
    evidenceBase: "Emerson valve SCADA logs showed a pressure spike of 4.2 bar leading to the mechanical fatigue rupture.",
    options: [
      { id: "oem", label: "OEM Premium Support SLA", cost: 180000, daysSaved: 2, desc: "Activate emergency 4-hour on-site OEM response contract with Emerson Belgium." },
      { id: "audit", label: "Pre-Audit Sterility Loops", cost: 60000, daysSaved: 1, desc: "Pre-run sterilization wash cycles and continuous air particulate audits." }
    ],
    strategicPhases: {
      immediate: "Divert liquid bulk formulation queues to parallel autoclave lines #5 and #6 inside the Puurs facility.",
      tactical: "Dispatch critical service team from OEM partner (Emerson Controls) with custom replacement valves from their Brussels warehouse.",
      structural: "Perform double sterility check loops to comply with European Medicines Agency (EMA) and FDA sterile product regulations."
    }
  },
  "SUP-109B": {
    baseDailyExposure: 18500000,
    baseTimelineDays: 7,
    baseWorkaroundCost: 600000,
    slaRisk: "SEVERE: Delay ripples down to next-gen fab tools. $2.2M per module per day in delayed delivery penalties.",
    evidenceBase: "Schiphol cargo backlog has reached 840 metric tons of temperature-controlled pharmaceutical and precision cargo.",
    options: [
      { id: "charter", label: "Dedicated Air Charter (BRU)", cost: 450000, daysSaved: 3, desc: "Divert all subsequent precision optics to Brussels Airport using chartered cargo carriers." },
      { id: "trucks", label: "Climate Control Couriers", cost: 110000, daysSaved: 2, desc: "Deploy active-cooling temperature-controlled custom courier trucks directly to Schiphol tarmac." }
    ],
    strategicPhases: {
      immediate: "Reroute subsequent optics shipments through Brussels Airport (BRU) using dedicated air-charter services to bypass Schiphol.",
      tactical: "Deploy temperature-controlled custom courier trucks from ASML Veldhoven to expedite Schiphol tarmac cargo collections.",
      structural: "Revise cleanroom system-integration schedules, postponing EUV laser-chamber alignments to prioritize other sub-assemblies."
    }
  },
  "SUP-502A": {
    baseDailyExposure: 15500000,
    baseTimelineDays: 18,
    baseWorkaroundCost: 550000,
    slaRisk: "SEVERE: Global smartphone memory supply at risk. 4% world NAND output bottlenecked at Xi'an.",
    evidenceBase: "Shaanxi transport control directives have restricted hazardous chemical shipping across 3 major highway nodes.",
    options: [
      { id: "airbridge", label: "Korea-China Air Bridge", cost: 950000, daysSaved: 8, desc: "Establish direct air bridge from Samsung Pyeongtaek to Xi'an airport, bypassing highway nodes." },
      { id: "permits", label: "State-Level Priority Permits", cost: 150000, daysSaved: 4, desc: "Lobby Shaanxi Provincial Department of Commerce for hazardous material emergency transit passes." }
    ],
    strategicPhases: {
      immediate: "Activate high-purity chemical buffer reserves held at the Xi'an bonded warehouse zone (currently holding 12 days of reserve stock).",
      tactical: "Obtain priority transport transit permits from regional Chinese regulatory bureaus for emergency raw material transport.",
      structural: "Prepare air-charter alternatives to deliver raw etching gases from Samsung Pyeongtaek, Korea to maintain fab operations."
    }
  },
  "FAC-003": {
    baseDailyExposure: 6500000,
    baseTimelineDays: 3,
    baseWorkaroundCost: 120000,
    slaRisk: "MODERATE: Delays final assembly deliveries. Force majeure not applicable. SLA penalties capped at $300K/day.",
    evidenceBase: "Thermo-couple telemetry in Oven #4 recorded a 4.5% temperature drift during standard cure phase.",
    options: [
      { id: "supp", label: "OEM Calibration Priority", cost: 95000, daysSaved: 1.5, desc: "Pay priority dispatch fee to Thermal Dynamics Corp for immediate engineer fly-in." },
      { id: "shifts", label: "Triple Curing Shifts", cost: 45000, daysSaved: 1, desc: "Authorize continuous 24/7 assembly crew shifts on active ovens #1 and #2." }
    ],
    strategicPhases: {
      immediate: "Redistribute curing loads to active autoclaves #1 and #2 under 24/7 accelerated shifts and load balancing.",
      tactical: "Dispatch specialized thermal calibration crew from OEM supplier (Thermal Dynamics Corp) with calibrated reference meters.",
      structural: "Adjust South Carolina final delivery buffers and reschedule paint shop queues to balance Slowed Curing volumes."
    }
  },
  "FAC-010": {
    baseDailyExposure: 14000000,
    baseTimelineDays: 12,
    baseWorkaroundCost: 400000,
    slaRisk: "HIGH: Cybertruck and Model Y run rates drop by 22% in Austin. Vehicle delivery timelines slip, leading to high consumer backlash.",
    evidenceBase: "Panama Canal daily transit slots are restricted to 18 vessels, compared to the normal historical average of 36 vessels.",
    options: [
      { id: "rail", label: "Union Pacific Dedicated Rail", cost: 350000, daysSaved: 5, desc: "Secure a dedicated unit train from Seattle to Austin, bypassing cargo hubs." },
      { id: "nevada", label: "Nevada 2170 Cell Diversion", cost: 180000, daysSaved: 3, desc: "Reroute cells from Giga Nevada, adapting module assembly lines." }
    ],
    strategicPhases: {
      immediate: "Initiate emergency land-bridge rail transport from Port of Seattle to Austin (WIP inventory diverted to rail cargo).",
      tactical: "Reroute backup 2170 cell production queues from Giga Nevada to maintain vehicle assembly run rates on lines #1 and #2.",
      structural: "Deploy dry-electrode engineering crew to optimize Austin local cell pilot-line output and expedite manufacturing ramp-up."
    }
  },
  "SUP-302B": {
    baseDailyExposure: 5200000,
    baseTimelineDays: 18,
    baseWorkaroundCost: 280000,
    slaRisk: "MODERATE: Structural forging shortage. Direct impact to wing box fabrication timelines at Renton.",
    evidenceBase: "LAX/LGB port customs clearance queue time has increased from 2.1 days to 9.8 days for non-preferred importers.",
    options: [
      { id: "broker", label: "Customs Broker Expediting", cost: 65000, daysSaved: 7, desc: "Hire specialized customs attorneys and brokers to audit and expedite shipping manifests." },
      { id: "secondary", label: "Apex Materials Secondary Buy", cost: 150000, daysSaved: 5, desc: "Procure spot-market titanium feedstock from secondary domestic distributors." }
    ],
    strategicPhases: {
      immediate: "Procure emergency backup chemical feedstock supplies from qualified secondary domestic distributor (Apex Materials).",
      tactical: "Expedite customs clearance through specialized custom brokers under critical aerospace priority and manifest audit.",
      structural: "Prioritize high-criticality structural forgings over general fuselage brackets in current Portland production runs."
    }
  },
  "SUP-202C": {
    baseDailyExposure: 4500000,
    baseTimelineDays: 14,
    baseWorkaroundCost: 190000,
    slaRisk: "LOW: Buffer inventories at European customers cover 21 days of operations. SLA penalties deferred.",
    evidenceBase: "Pipeline SCADA telemetry indicates inlet pressure has stabilized at 42 bar (nominal is 50 bar, minimum threshold is 38 bar).",
    options: [
      { id: "lng", label: "LNG Vaporization Array", cost: 140000, daysSaved: 5, desc: "Deploy temporary LNG truck-mounted vaporization arrays to inject gas into the synthesis grid." },
      { id: "antwerp", label: "Antwerp Precursor Diversion", cost: 95000, daysSaved: 4, desc: "Shift non-critical precursor synthesis lines to BASF Antwerp chemical hub." }
    ],
    strategicPhases: {
      immediate: "Engage local liquefied natural gas (LNG) backup vaporization arrays to steady synthesis chamber pressure and protect catalyst beds.",
      tactical: "Divert non-critical precursor synthesis lines to BASF Antwerp chemical hub to balance pipeline drops.",
      structural: "Optimize catalyst bed temperatures and flow rates to maintain minimum synthetic precursor quality outputs and prevent degradation."
    }
  },
  "FAC-008": {
    baseDailyExposure: 9500000,
    baseTimelineDays: 1,
    baseWorkaroundCost: 80000,
    slaRisk: "VERY LOW: Cluster training state is backed up in real-time. Minimal risk to client-facing cloud service SLAs.",
    evidenceBase: "Santa Clara power grid surge was recorded as a 12% peak voltage spike. Cooling systems successfully tripped into self-preservation mode.",
    options: [
      { id: "utility", label: "PG&E Grid Analysis", cost: 35000, daysSaved: 0.5, desc: "Deploy joint engineering crew with PG&E to inspect and isolate local substation relays." },
      { id: "oregon", label: "Divert to Oregon Cloud", cost: 120000, daysSaved: 0.5, desc: "Seamlessly shift high-intensity model training checkpoints to the Hillsboro, Oregon cluster." }
    ],
    strategicPhases: {
      immediate: "Execute heat calibration loops on the affected server chassis arrays and verify sub-component metrics.",
      tactical: "Coordinate grid diagnostics with local power utility (PG&E) to review automatic regulator relays and surge protection margins.",
      structural: "Adjust AI network priority nodes to route computing threads through the Oregon cloud data cluster with zero training downtime."
    }
  },
  "SUP-8472": {
    baseDailyExposure: 3800000,
    baseTimelineDays: 3,
    baseWorkaroundCost: 150000,
    slaRisk: "LOW: Raw carbon fiber buffer inventory in NA stands at 45 days. Production at composite plants unaffected.",
    evidenceBase: "Masaki-cho plant seismic sensor registered 3 on the Shindo scale. No structural damage detected in primary storage tanks.",
    options: [
      { id: "struct", label: "Rapid Structural Audit", cost: 75000, daysSaved: 1, desc: "Utilize drone-based photogrammetry and ultrasonic scanners to audit pipeline welds." },
      { id: "customs", label: "Expedite NA Bonded Release", cost: 40000, daysSaved: 1, desc: "Pre-file customs withdrawal entries for Toray's Tacoma and Decatur warehouses." }
    ],
    strategicPhases: {
      immediate: "Conduct immediate structural integrity checks on storage tanks and precursor pipelines in Ehime using ultrasonic sensors.",
      tactical: "Validate safety sensor resets under Japanese aviation authority regulatory checks and obtain restart certificates.",
      structural: "Activate inventory buffer stocks in North American warehouses to bypass Ehime shipping delays and maintain customer delivery rates."
    }
  }
};

const nodePipelineData = {
  "FAC-001": {
    crawlers: [
      { type: "Geospatial Logs", icon: "MapPin", detail: "RFID composite cargo containers logged at Wichita central depot." },
      { type: "Industrial IoT", icon: "Activity", detail: "Everett assembly floor throughput sensors (EVT-FAC-904) flag assembly idle cycles." }
    ],
    agentInsight: "NLP processor parsed factory logs and identified structural composite delays, projecting a 12+ day wider assembly threat corridor.",
    timestamp: "2026-05-28T09:12:04Z",
    confidence: "98.4%",
    latency: "142ms",
    dataSize: "45.2 KB",
    events: [
      { time: "09:12:04 UTC", label: "Initial Sensor Match", desc: "Everett floor sensor EVT-FAC-904 logs consecutive idle times." },
      { time: "09:15:20 UTC", label: "Crawler Extraction", desc: "RFID container scanners at Wichita track raw structural composite delay." },
      { time: "09:18:11 UTC", label: "LLM NLP Synthesis", desc: "Agent correlates floor idle cycles with shipping latency coefficient." },
      { time: "09:20:00 UTC", label: "Decision Support Active", desc: "Formulated Boeing Everett widebody mitigation playbook proposal." }
    ]
  },
  "SUP-001A": {
    crawlers: [
      { type: "News Crawler", icon: "Globe", detail: "Scanned 14 local Midwest freight labor blogs and Reuters labor RSS streams." },
      { type: "Geospatial Logs", icon: "MapPin", detail: "BNSF freight GPS logistics tracker coordinates reveal stationary cargo cars." }
    ],
    agentInsight: "Identified freight rail labor shutdown at key transit bottlenecks, calculating high Renton supply line starvation factor.",
    timestamp: "2026-05-28T14:22:15Z",
    confidence: "97.8%",
    latency: "195ms",
    dataSize: "124.8 KB",
    events: [
      { time: "14:22:15 UTC", label: "News Feed Alert", desc: "Local Midwest freight blogs flag impending regional rail union gridlock." },
      { time: "14:25:10 UTC", label: "GPS Tracking Query", desc: "BNSF GPS trackers report stationary cargo cars near Missouri junction." },
      { time: "14:28:40 UTC", label: "Starvation Analysis", desc: "AI Agent computes Wichita-to-Renton supply line starvation velocity." },
      { time: "14:30:00 UTC", label: "Mitigation Initialized", desc: "Formulated oversized road flatbed permits workaround routing options." }
    ]
  },
  "SUP-701X": {
    crawlers: [
      { type: "SCADA Telemetry", icon: "Activity", detail: "TSMC Fab 12 seismic safety systems log automatic safety triggers at 0.12g." },
      { type: "News Crawler", icon: "Globe", detail: "Crawl Taiwan Weather Bureau feeds and local tech supply bulletins." }
    ],
    agentInsight: "SCADA webhook pushed direct lithography EUV calibration safety shutdown status; agent pre-allocated packaging redirect to Fab 15.",
    timestamp: "2026-05-28T02:05:40Z",
    confidence: "99.6%",
    latency: "85ms",
    dataSize: "18.4 KB",
    events: [
      { time: "02:05:40 UTC", label: "Seismic Alert Webhook", desc: "TSMC Fab 12 local safety sensor registers minor 0.12g acceleration spike." },
      { time: "02:06:12 UTC", label: "Weather Bureau Crawl", desc: "Automatic RSS scrap confirms minor earthquake near Hsinchu science park." },
      { time: "02:08:45 UTC", label: "EUV System Shutdown", desc: "Lithography EUV systems log self-preservation calibration shutdown sequence." },
      { time: "02:10:00 UTC", label: "Diversion Pre-Allocation", desc: "Agent automatically checks and reserves assembly slots at Taichung Fab 15." }
    ]
  },
  "SUP-401A": {
    crawlers: [
      { type: "Industrial IoT", icon: "Activity", detail: "SCADA Emerson exhaust valve sensor flags severe chemical bath pressure rupture." },
      { type: "Regulatory Code", icon: "FileText", detail: "Crawl EMA and FDA vaccine sterile products validation regulations loop criteria." }
    ],
    agentInsight: "NLP extractor compiled EMA sterilization validation time-delay coefficients based on history, drafting redundant line diversion plan.",
    timestamp: "2026-05-28T10:14:55Z",
    confidence: "96.5%",
    latency: "220ms",
    dataSize: "54.1 KB",
    events: [
      { time: "10:14:55 UTC", label: "SCADA Valve Rupture", desc: "SCADA valve logs alert of autoclave exhaust valve pressure failure in Puurs." },
      { time: "10:17:33 UTC", label: "Regulatory Loop Scan", desc: "Agent queries EMA/FDA vaccine sterile validation loop requirements." },
      { time: "10:19:12 UTC", label: "NLP Validation Modeling", desc: "Agent projects FDA sterilizer re-clearance timeline models at 96 hours." },
      { time: "10:20:00 UTC", label: "Alternative Routing", desc: "Formulated Antwerp diversion slots and Emerson Belgium priority dispatch." }
    ]
  },
  "SUP-109B": {
    crawlers: [
      { type: "Logistics Manifest", icon: "Truck", detail: "DHL transatlantic Priority manifest backlog coordinates at Schiphol tarmac." },
      { type: "Financial Feeds", icon: "Coins", detail: "Crawl air-charter cold chain capacity indices and spot price indicators." }
    ],
    agentInsight: "Recognized Schiphol cargo bottle-neck early; calculated air-charter redirection options to Brussels and courier trucks.",
    timestamp: "2026-05-28T16:45:10Z",
    confidence: "98.9%",
    latency: "165ms",
    dataSize: "72.3 KB",
    events: [
      { time: "16:45:10 UTC", label: "Manifest backlog alert", desc: "Transatlantic priority optics cargo coordinates logged as stagnant at Schiphol." },
      { time: "16:48:22 UTC", label: "Index Rate Feed Sync", desc: "Agent scans European cold-chain air-freight rates and carrier lists." },
      { time: "16:49:50 UTC", label: "Logistics Synthesis", desc: "Calculated time/cost tradeoffs of ground custom couriers vs Brussels charter." },
      { time: "16:50:00 UTC", label: "Air Bridge Ready", desc: "Compiled dedicated air-charter options and climate-control truck dispatch." }
    ]
  },
  "SUP-502A": {
    crawlers: [
      { type: "Regulatory Feeds", icon: "Globe", detail: "Lobby Shaanxi Provincial transit restrictions for chemical feedstocks." },
      { type: "Logistics Manifest", icon: "Truck", detail: "Samsung local Shaanxi chemical feedstock shipping registries." }
    ],
    agentInsight: "Parsed Shaanxi government transit warnings; estimated chemical gas stock decline rate, prompting Korea air bridge backup option.",
    timestamp: "2026-05-28T05:30:12Z",
    confidence: "95.2%",
    latency: "310ms",
    dataSize: "88.6 KB",
    events: [
      { time: "05:30:12 UTC", label: "Local Directives Parsed", desc: "Shaanxi local department of commerce issues hazardous chemical road locks." },
      { time: "05:32:44 UTC", label: "Logistics Audit", desc: "Samsung local freight shipping logs analyzed to track inbound etch gases." },
      { time: "05:34:10 UTC", label: "Stock Burn Simulation", desc: "Agent models local Fab buffer depletion curve, forecasting a 12-day limit." },
      { time: "05:35:00 UTC", label: "Air Bridge Proposed", desc: "Compiled state transit permit filings and Korea-China air cargo schedules." }
    ]
  },
  "FAC-003": {
    crawlers: [
      { type: "Industrial IoT", icon: "Activity", detail: "Oven #4 thermocouple SCADA sensor records continuous 4.5% temperature drift." },
      { type: "Quality Records", icon: "FileText", detail: "Composite curing cycle quality assurance log registers variance warnings." }
    ],
    agentInsight: "Calibrated curing metrics against baseline; flagged sensor quality variance, triggering preventive maintenance reset window.",
    timestamp: "2026-05-28T11:04:18Z",
    confidence: "99.1%",
    latency: "120ms",
    dataSize: "32.5 KB",
    events: [
      { time: "11:04:18 UTC", label: "Sensor Drift Logged", desc: "South Carolina curing autoclave #4 thermocouple logs drift above 4.2%." },
      { time: "11:06:50 UTC", label: "QA Record Ingestion", desc: "Curing cycle logs ingested; composite structural density variance warnings flag." },
      { time: "11:08:15 UTC", label: "Calibration Check", desc: "Agent evaluates automated calibration tolerances and schedules." },
      { time: "11:10:00 UTC", label: "Maintenance Queue", desc: "Schedules preventative recalibration window and OEM technical crew dispatch." }
    ]
  },
  "FAC-010": {
    crawlers: [
      { type: "Geospatial Logs", icon: "MapPin", detail: "Panama Canal Authority vessel transit registration and bottleneck logs." },
      { type: "Logistics Manifest", icon: "Truck", detail: "Tesla supply logistics carrier status and 4680 cell deliveries tracker." }
    ],
    agentInsight: "Analyzed canal transit backlog forecasts; estimated local Austin inventory buffer burn rate, proposing Nevada cell diversion.",
    timestamp: "2026-05-28T08:12:33Z",
    confidence: "98.7%",
    latency: "180ms",
    dataSize: "61.2 KB",
    events: [
      { time: "08:12:33 UTC", label: "Canal Backlog Update", desc: "Panama Canal Authority registers vessel transit limit down to 18 daily slots." },
      { time: "08:15:40 UTC", label: "Inbound Manifest Scrapped", desc: "Tesla ocean cargo coordinates reveal delayed battery cell carrier ships." },
      { time: "08:18:25 UTC", label: "Buffer Depletion Curve", desc: "Agent calculates Austin structural battery assembly local inventory exhaustion." },
      { time: "08:20:00 UTC", label: "Land Bridge Active", desc: "Generated Dedicated Rail land-bridge schedules from Seattle to Giga Texas." }
    ]
  },
  "SUP-302B": {
    crawlers: [
      { type: "Customs API", icon: "FileText", detail: "LAX/LGB customs clearance manifest databases for precision titanium." },
      { type: "Industrial News", icon: "Globe", detail: "Crawl West Coast port union strike warnings and customs audit guidelines." }
    ],
    agentInsight: "Extracted LA customs queue delays; pre-allocated Apex Materials secondary supply options to bypass port bottleneck.",
    timestamp: "2026-05-28T13:40:22Z",
    confidence: "97.4%",
    latency: "150ms",
    dataSize: "48.7 KB",
    events: [
      { time: "13:40:22 UTC", label: "Customs Manifest Audit", desc: "LAX/LGB import manifests for titanium sponge log custom hold code." },
      { time: "13:43:10 UTC", label: "Port Strike Warnings", desc: "West Coast port union labor dispute notifications parsed." },
      { time: "13:44:50 UTC", label: "Supply Chain Risk Math", desc: "Calculated Portland forging mill output drop of 50% if delays hit 14 days." },
      { time: "13:45:00 UTC", label: "Pre-stage Spot Buy", desc: "Pre-approved titanium spot buy manifest with Apex Materials." }
    ]
  },
  "SUP-202C": {
    crawlers: [
      { type: "Industrial IoT", icon: "Activity", detail: "Ludwigshafen natural gas pipeline SCADA pressure sensors record 42 bar drop." },
      { type: "SCADA Pipeline", icon: "Truck", detail: "Nord-Flow pipeline supply metrics and chemical synthesis feedstocks." }
    ],
    agentInsight: "Detected gas inlet pressure threshold drop; activated Antwerp pre-cursor shift and local LNG vaporization array plans.",
    timestamp: "2026-05-28T15:20:10Z",
    confidence: "99.3%",
    latency: "95ms",
    dataSize: "22.9 KB",
    events: [
      { time: "15:20:10 UTC", label: "Pressure Anomaly Webhook", desc: "Ludwigshafen synthesis grid SCADA logs pressure drop to 42 bar." },
      { time: "15:21:40 UTC", label: "Nord-Flow Telemetry Sync", desc: "Nord-Flow pipeline telemetry verified, confirming upstream valve shutdown." },
      { time: "15:23:15 UTC", label: "Chamber Risk Mapping", desc: "Agent models gas pressure effects on chemical catalyst bed lifetime." },
      { time: "15:25:00 UTC", label: "Mitigation Engaged", desc: "Compiled Antwerp precursor routing options and local LNG vaporizer leases." }
    ]
  },
  "FAC-008": {
    crawlers: [
      { type: "SCADA Power", icon: "Activity", detail: "PG&E high-voltage industrial grid surge sensors record 12% peak voltage spike." },
      { type: "Industrial IoT", icon: "Cpu", detail: "NVIDIA CA cooling rack system-monitoring telemetry logs automatic trip." }
    ],
    agentInsight: "Monitored server failover response logs; verified compute thread failover to Oregon cloud cluster with zero training downtime.",
    timestamp: "2026-05-28T18:02:11Z",
    confidence: "99.8%",
    latency: "70ms",
    dataSize: "14.5 KB",
    events: [
      { time: "18:02:11 UTC", label: "Grid Surge Waveform", desc: "Santa Clara high-voltage relays record 12% voltage spike." },
      { time: "18:03:05 UTC", label: "Substation System Trip", desc: "NVIDIA compute cluster cooling loop power supplies activate emergency trip." },
      { time: "18:04:30 UTC", label: "Failover Validation", desc: "Cloud orchestrator logs automatic state-saving checkpoint operations." },
      { time: "18:05:00 UTC", label: "Computing Redirect", desc: "Verified Computing threads diverted to Hillsboro, Oregon cloud nodes." }
    ]
  },
  "SUP-8472": {
    crawlers: [
      { type: "SCADA Seismic", icon: "Activity", detail: "Japan Meteorological Agency local Ehime seismic vibration sensors record 3 on Shindo." },
      { type: "Industrial IoT", icon: "FileText", detail: "Toray Masaki-cho plant automated cleanroom particulate indicators." }
    ],
    agentInsight: "Verified automatic shutdown sensor response; parsed local inspection schedules to pre-stage NA Tacoma depot cargo release.",
    timestamp: "2026-05-28T03:12:44Z",
    confidence: "96.2%",
    latency: "240ms",
    dataSize: "67.8 KB",
    events: [
      { time: "03:12:44 UTC", label: "Seismic Sensor Match", desc: "Japan Met seismic telemetry logs local Shindo 3 tremor in Ehime." },
      { time: "03:15:30 UTC", label: "Cleanroom Particulates", desc: "Toray Masaki-cho cleanroom air counters log safe, nominal ppm limits." },
      { time: "03:18:15 UTC", label: "Restart Loop Scan", desc: "Agent queries Japanese aviation authority inspection regulations registry." },
      { time: "03:20:00 UTC", label: "Buffer Stock Dispatch", desc: "Pre-filed customs pull entries for backup carbon fiber stocks in Tacoma." }
    ]
  }
};

export default function HealthMonitorTable({ rowData = [], loading = true, selectedCategories = [], onSelectCategories, isDark, onHumanFeedback }) {
  const [selectedTier, setSelectedTier] = useState("ALL");
  const [inspectedRow, setInspectedRow] = useState(null);
  
  // Playbook generation states
  const [isGenerating, setIsGenerating] = useState(false);
  const [playbookGenerated, setPlaybookGenerated] = useState(false);
  // C-suite boardroom sign-off state
  const [signOffs, setSignOffs] = useState({});

  // Interactive C-suite feedback states
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackOption, setFeedbackOption] = useState(null);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const handleSignOffToggle = (nodeId, role) => {
    setSignOffs(prev => {
      const nodeSignOffs = prev[nodeId] || { cfo: false, coo: false, board: false };
      return {
        ...prev,
        [nodeId]: {
          ...nodeSignOffs,
          [role]: !nodeSignOffs[role]
        }
      };
    });
  };

  // Reset states upon inspection target change
  useEffect(() => {
    setFeedbackRating(0);
    setFeedbackOption(null);
    setFeedbackComment("");
    setFeedbackSubmitted(false);
  }, [inspectedRow]);

  // Lock vertical scrolling when the inspect panel is open
  useEffect(() => {
    if (inspectedRow) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [inspectedRow]);

  // Sorting and live ingestion countdown ticks states
  const [sortConfig, setSortConfig] = useState({ key: "newest", direction: "desc" });
  const [, setTick] = useState(0);

  useEffect(() => {
    // Check if any row has an active highlight countdown in progress
    const hasActiveHighlight = rowData.some(
      row => row.ingestedAt && (Date.now() - row.ingestedAt) < 4000
    );
    if (!hasActiveHighlight) return;

    // Periodic 250ms interval ticker to trigger reactive countdown force-renders
    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 250);

    return () => clearInterval(interval);
  }, [rowData]);

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key) {
      if (sortConfig.direction === "asc") {
        direction = "desc";
      } else {
        // Cycle back to default newest descending sort order
        setSortConfig({ key: "newest", direction: "desc" });
        return;
      }
    }
    setSortConfig({ key, direction });
  };

  const filteredRows = selectedTier === "ALL" 
    ? rowData 
    : rowData.filter(row => `Tier ${row.tier}` === selectedTier);

  // Apply C-Suite category taxonomy filtering if active (multi-select)!
  const taxonomyFilteredRows = selectedCategories && selectedCategories.length > 0 
    ? filteredRows.filter(row => selectedCategories.includes(getTaxonomy(row.id)))
    : filteredRows;

  // Sorting algorithms for dynamic, interactive columns
  const sortedRows = [...taxonomyFilteredRows].sort((a, b) => {
    if (sortConfig.key === "newest") {
      const aVal = a.ingestedAt || 0;
      const bVal = b.ingestedAt || 0;
      if (aVal === bVal) {
        return b.id.localeCompare(a.id); // Alphanumeric secondary sorting fallback
      }
      return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
    }

    if (sortConfig.key === "id") {
      return sortConfig.direction === "asc" 
        ? a.id.localeCompare(b.id)
        : b.id.localeCompare(a.id);
    }

    if (sortConfig.key === "facility") {
      return sortConfig.direction === "asc"
        ? a.facility.localeCompare(b.facility)
        : b.facility.localeCompare(a.facility);
    }

    if (sortConfig.key === "severity") {
      const aVal = a.severity || 0;
      const bVal = b.severity || 0;
      return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
    }

    if (sortConfig.key === "likelihood") {
      const aVal = a.likelihood || 0;
      const bVal = b.likelihood || 0;
      return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
    }

    if (sortConfig.key === "timeToHit") {
      const aVal = a.timeToHit || 0;
      const bVal = b.timeToHit || 0;
      return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
    }

    return 0;
  });

  const renderSortIndicator = (key) => {
    if (sortConfig.key !== key) return <span className="text-slate-300 ml-1 select-none font-normal">⇅</span>;
    return sortConfig.direction === "asc" ? <span className="text-[#86BC25] ml-1 select-none font-bold">▲</span> : <span className="text-[#86BC25] ml-1 select-none font-bold">▼</span>;
  };

  // Playbook generation loading trigger
  const handleGeneratePlaybook = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setPlaybookGenerated(true);
    }, 1200);
  };

  const cSuiteEnrichment = inspectedRow ? nodeCSuiteData[inspectedRow.id] : null;

  // Playbook target calculations (all recommended options applied)
  let mitigatedTimelineDays = cSuiteEnrichment ? cSuiteEnrichment.baseTimelineDays : 0;
  let mitigatedWorkaroundCost = cSuiteEnrichment ? cSuiteEnrichment.baseWorkaroundCost : 0;

  if (cSuiteEnrichment) {
    cSuiteEnrichment.options.forEach(option => {
      mitigatedTimelineDays = Math.max(0.5, mitigatedTimelineDays - option.daysSaved);
      mitigatedWorkaroundCost += option.cost;
    });
  }

  const mitigatedTotalExposure = cSuiteEnrichment 
    ? mitigatedTimelineDays * cSuiteEnrichment.baseDailyExposure 
    : 0;

  const totalFinancialAtRisk = cSuiteEnrichment 
    ? (cSuiteEnrichment.baseTimelineDays * cSuiteEnrichment.baseDailyExposure) 
    : 0;

  const financialSaved = Math.max(0, totalFinancialAtRisk - mitigatedTotalExposure - (mitigatedWorkaroundCost - (cSuiteEnrichment ? cSuiteEnrichment.baseWorkaroundCost : 0)));

  const renderPipeline = (row) => {
    const pipeline = nodePipelineData[row.id];
    if (!pipeline) return null;

    return (
      <div className={`border p-4 flex flex-col gap-4 ${isDark ? "border-[#1E293B] bg-[#0A0D14]" : "border-slate-200 bg-slate-50"}`}>
        <div>
          <div className="flex items-center justify-between">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#86BC25] font-mono flex items-center gap-1.5">
              <Radio className="h-4 w-4 text-[#86BC25] animate-pulse" />
              📡 Agent Signal Ingestion Pipeline
            </h4>
            <span className={`text-[8px] font-mono px-1.5 py-0.5 border select-none ${isDark ? "text-slate-400 bg-slate-950 border-[#1E293B]" : "text-slate-500 bg-white border-slate-200"}`}>
              ACTIVE CRAWLER NETWORK
            </span>
          </div>
          <p className={`text-[9px] mt-0.5 font-sans leading-normal ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Real-time crawler scans and autonomous LLM Agent extraction monitoring.
          </p>
        </div>

        {/* Technical Ingestion Telemetry Metadata Ribbon */}
        <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 border p-3 font-mono text-xs select-none ${isDark ? "bg-[#0F1520] border-[#1E293B] text-slate-300" : "bg-white border-slate-200 text-slate-600"}`}>
          <div>
            <span className="text-slate-400 block uppercase text-[9px] tracking-wider">Confidence Score</span>
            <span className="text-[#86BC25] font-bold">{pipeline.confidence}</span>
          </div>
          <div>
            <span className="text-sky-400 block uppercase text-[9px] tracking-wider">Crawl Latency</span>
            <span className="text-sky-500 font-bold">{pipeline.latency}</span>
          </div>
          <div>
            <span className="text-slate-400 block uppercase text-[9px] tracking-wider">Ingested Size</span>
            <span className={`font-bold ${isDark ? "text-slate-200" : "text-slate-700"}`}>{pipeline.dataSize}</span>
          </div>
          <div>
            <span className="text-amber-500 block uppercase text-[9px] tracking-wider">Signal Created</span>
            <span className="text-amber-500 font-bold text-xs">{pipeline.timestamp.replace('T', ' ').replace('Z', ' UTC')}</span>
          </div>
        </div>

        {/* Visual Pipeline Nodes */}
        <div className="flex flex-col gap-4 font-sans text-xs">
          {/* Phase 1: Active Crawlers */}
          <div className="relative flex gap-3 pl-1.5">
            <div className="absolute left-[9px] top-6 bottom-0 w-[1px] border-l border-dashed border-[#86BC25]/40" />
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-none bg-[#86BC25]/10 border border-[#86BC25]/30">
              <Globe className="h-3.5 w-3.5 text-[#86BC25]" />
            </div>
            <div className="flex-1 flex flex-col gap-1.5">
              <span className="font-mono text-xs font-bold text-slate-500 uppercase tracking-wider">
                Phase 1 &bull; Active Crawler Ingestion Feeds
              </span>
              <div className="flex flex-col gap-2">
                {pipeline.crawlers.map((c, i) => (
                  <div key={i} className={`border p-2.5 flex items-start gap-2.5 ${isDark ? "bg-[#0F1520] border-[#1E293B]" : "bg-white border-slate-200"}`}>
                    <span className="h-2 w-2 rounded-full bg-[#86BC25] mt-1 shrink-0 animate-ping" />
                    <div className="text-xs">
                      <span className={`font-bold block font-mono uppercase tracking-wide ${isDark ? "text-slate-200" : "text-slate-800"}`}>{c.type}</span>
                      <p className={`mt-1 font-sans leading-relaxed ${isDark ? "text-slate-400" : "text-slate-500"}`}>{c.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Phase 2: Agent Parsing & Synthesis */}
          <div className="relative flex gap-3 pl-1.5">
            <div className="absolute left-[9px] top-6 bottom-0 w-[1px] border-l border-dashed border-sky-400/40" />
            <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-none border ${isDark ? "bg-sky-950/20 border-sky-800/50" : "bg-sky-50 border-sky-200"}`}>
              <Cpu className="h-3.5 w-3.5 text-sky-500 animate-spin" style={{ animationDuration: '4s' }} />
            </div>
            <div className="flex-1 flex flex-col gap-1.5">
              <span className="font-mono text-xs font-bold text-slate-500 uppercase tracking-wider">
                Phase 2 &bull; LLM Agent Semantic Synthesis
              </span>
              <div className={`border p-2.5 text-xs leading-relaxed ${isDark ? "bg-[#0F1520] border-[#1E293B]" : "bg-white border-slate-200"}`}>
                <span className="font-bold text-sky-500 block font-mono uppercase tracking-wide">NLP Synthesis Core</span>
                <p className={`mt-1 font-sans leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>{pipeline.agentInsight}</p>
              </div>
            </div>
          </div>

          {/* Chronological Event Timeline */}
          <div className="flex gap-3 pl-1.5">
            <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-none border ${isDark ? "bg-amber-950/20 border-amber-800/50" : "bg-amber-50 border-amber-200"}`}>
              <Clock className="h-3.5 w-3.5 text-amber-500" />
            </div>
            <div className="flex-1 flex flex-col gap-1.5">
              <span className="font-mono text-xs font-bold text-slate-500 uppercase tracking-wider">
                Phase 3 &bull; Signal Incident Evolution
              </span>
              <div className={`border p-3 flex flex-col gap-2.5 ${isDark ? "bg-[#0F1520] border-[#1E293B]" : "bg-white border-slate-200"}`}>
                <span className="font-bold text-amber-500 block font-mono uppercase tracking-wide">CHRONOLOGICAL SIGNAL TIMELINE</span>
                <div className={`flex flex-col gap-3 font-mono text-xs mt-1 select-none ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  {pipeline.events.map((evt, idx) => (
                    <div key={idx} className={`flex gap-2.5 items-start border-l-2 pl-2.5 ml-1 relative ${isDark ? "border-[#1E293B]" : "border-slate-200"}`}>
                      <span className={`absolute -left-[5px] top-1 h-2 w-2 rounded-full border-2 ${isDark ? "bg-slate-950 border-slate-800" : "bg-white border-slate-300"}`} />
                      <span className="text-amber-500 font-bold shrink-0 text-[10px]">{evt.time.split(' ')[0]}</span>
                      <div>
                        <span className={`font-bold block leading-none ${isDark ? "text-slate-100" : "text-slate-900"}`}>{evt.label}</span>
                        <p className={`mt-1 font-sans leading-relaxed ${isDark ? "text-slate-400" : "text-slate-500"}`}>{evt.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Expandable Raw Signal Telemetry */}
        <details className={`group border text-[9px] font-mono cursor-pointer select-none ${isDark ? "border-[#1E293B] bg-[#0F1520]" : "bg-white border-slate-200"}`}>
          <summary className={`p-2 flex items-center justify-between transition-colors ${isDark ? "hover:bg-slate-800/40" : "hover:bg-slate-50"}`}>
            <span className="font-bold tracking-wider uppercase flex items-center gap-1.5 text-slate-400">
              <Terminal className="h-3.5 w-3.5 text-[#86BC25]" />
              Expand Raw Signal Telemetry Source
            </span>
            <ChevronDown className="h-3 w-3 text-slate-400 group-open:rotate-180 transition-transform" />
          </summary>
          <div className={`p-2.5 border-t leading-relaxed select-text font-mono break-all max-h-36 overflow-y-auto ${isDark ? "border-[#1E293B] bg-slate-950 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-600"}`}>
            <span className="text-slate-400 font-sans block mb-1">Raw payload scanned by Agent crawler:</span>
            {row.sourceData}
          </div>
        </details>
      </div>
    );
  };

  const renderFeedbackSuite = (row) => {
    return (
      <div className={`border p-4 flex flex-col gap-3 ${isDark ? "border-[#1E293B] bg-[#0A0D14]" : "border-slate-200 bg-slate-50"}`}>
        <div>
          <h4 className={`text-[10px] font-bold uppercase tracking-wider font-mono flex items-center gap-1.5 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
            <Sparkles className="h-4 w-4 text-[#86BC25]" />
            Playbook Governance Feedback
          </h4>
          <p className={`text-[9px] mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Submit assessment feedback to align autonomous agent weights.
          </p>
        </div>

        {feedbackSubmitted ? (
          <div className={`border p-3 text-center flex flex-col items-center justify-center gap-2 animate-fade-in select-none ${isDark ? "bg-[#86BC25]/5 border-[#86BC25]/20" : "bg-[#86BC25]/10 border-[#86BC25]/30"}`}>
            <CheckCircle className="h-6 w-6 text-[#86BC25] animate-bounce" />
            <div className="text-[10px] font-mono font-bold text-[#86BC25] uppercase tracking-wider">
              FEEDBACK COMMITTED SUCCESSFULLY
            </div>
            <p className={`text-[9px] max-w-xs leading-relaxed font-sans mt-0.5 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
              Operational logs and rating model weights successfully routed to AI Agent tuning queue. Thank you.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Interactive Stars Rating */}
            <div className={`flex items-center gap-1.5 select-none justify-between border-b pb-2 ${isDark ? "border-[#1E293B]" : "border-slate-200"}`}>
              <span className="text-[9px] font-mono text-slate-500 uppercase">Strategic Accuracy:</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setFeedbackRating(star)}
                    className="cursor-pointer transition-transform duration-75 hover:scale-110"
                  >
                    <Star
                      className={`h-4.5 w-4.5 ${
                        star <= feedbackRating
                          ? "fill-[#86BC25] text-[#86BC25]"
                          : isDark ? "text-slate-700 hover:text-slate-500" : "text-slate-300 hover:text-slate-400"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Tactical Feasibility Options */}
            <div className="flex gap-2">
              <button
                onClick={() => setFeedbackOption("Accurate")}
                className={`flex-1 cursor-pointer font-mono text-[9px] font-bold uppercase py-1 border flex items-center justify-center gap-1 transition-all duration-75 select-none ${
                  feedbackOption === "Accurate"
                    ? "bg-[#86BC25] border-[#86BC25] text-black"
                    : isDark
                      ? "bg-slate-950 border-[#1E293B] hover:border-slate-700 text-slate-400"
                      : "bg-white border-slate-200 hover:border-slate-400 text-slate-600"
                }`}
              >
                <ThumbsUp className="h-3 w-3" />
                Accurate
              </button>
              <button
                onClick={() => setFeedbackOption("Refinement")}
                className={`flex-1 cursor-pointer font-mono text-[9px] font-bold uppercase py-1 border flex items-center justify-center gap-1 transition-all duration-75 select-none ${
                  feedbackOption === "Refinement"
                    ? "bg-amber-500 border-amber-500 text-black"
                    : isDark
                      ? "bg-slate-950 border-[#1E293B] hover:border-slate-700 text-slate-400"
                      : "bg-white border-slate-200 hover:border-slate-400 text-slate-600"
                }`}
              >
                <ThumbsDown className="h-3 w-3" />
                Needs Audit
              </button>
            </div>

            {/* Commentary Input */}
            <textarea
              value={feedbackComment}
              onChange={(e) => setFeedbackComment(e.target.value)}
              placeholder="Provide operational context (e.g., 'Primary composite rail line strike confirmed resolved')..."
              className={`w-full p-2 text-[10px] placeholder-slate-500 rounded-none focus:outline-none font-sans leading-normal resize-none h-14 ${
                isDark 
                  ? "bg-slate-950 border border-[#1E293B] text-slate-200 focus:border-slate-700" 
                  : "bg-white border border-slate-200 text-slate-700 focus:border-slate-400"
              }`}
            />

            {/* Submit CTA */}
            <button
              onClick={() => {
                if (feedbackRating === 0 && !feedbackOption && !feedbackComment) return;
                setFeedbackSubmitted(true);
                if (onHumanFeedback) {
                  onHumanFeedback({
                    threatId: row.id,
                    facility: row.facility,
                    rating: feedbackRating,
                    option: feedbackOption,
                    comment: feedbackComment,
                    timestamp: new Date().toISOString()
                  });
                }
              }}
              disabled={feedbackRating === 0 && !feedbackOption && !feedbackComment}
              className={`w-full cursor-pointer font-mono text-[9px] font-bold uppercase py-2 border select-none transition-all duration-75 ${
                feedbackRating === 0 && !feedbackOption && !feedbackComment
                  ? isDark 
                    ? "bg-[#0E1726] border-[#1E293B] text-slate-600 cursor-not-allowed"
                    : "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                  : isDark
                    ? "bg-[#86BC25] border-[#86BC25] text-black hover:bg-[#97cf2b]"
                    : "bg-slate-900 border-slate-900 text-white hover:bg-[#86BC25] hover:border-[#86BC25] hover:text-black"
              }`}
            >
              🚀 Submit To Agent Tuner
            </button>
          </div>
        )}
      </div>
    );
  };

  const handleClosePanel = () => {
    setInspectedRow(null);
    setPlaybookGenerated(false);
    setIsGenerating(false);
    setLoadingLines([]);
  };

  return (
    <div
      id="slot-table"
      className={`relative rounded-none p-4 border shadow-none font-sans transition-colors duration-300 ${
        isDark ? "bg-[#0F1520] border-[#1E293B]" : "bg-white border-slate-200"
      }`}
    >
      {/* ── Title and Table Settings Header ── */}
      <div className={`mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b pb-3 ${isDark ? "border-[#1E293B]" : "border-slate-100"}`}>
        <div>
          <h2 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 font-sans ${isDark ? "text-slate-200" : "text-slate-800"}`}>
            <span className="h-1.5 w-1.5 bg-[#86BC25]" />
            Network Node Threat Registry
          </h2>
          <p className={`text-[10px] mt-0.5 font-mono ${isDark ? "text-slate-500" : "text-slate-500"}`}>
            OPERATIONAL THREAT MATRIX — SECURE REAL-TIME DATA STREAM
          </p>
        </div>

        {/* Dense Filters Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {selectedCategories && selectedCategories.length > 0 && (
            <div className="flex flex-wrap gap-1.5 items-center">
              {selectedCategories.map(cat => (
                <div key={cat} className={`flex items-center gap-1.5 border font-mono text-[9px] px-2 py-0.5 select-none font-bold uppercase animate-fade-in ${isDark ? "bg-slate-950 border-slate-800 text-[#86BC25]" : "bg-slate-900 border-slate-800 text-[#86BC25]"}`}>
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#86BC25] opacity-75"></span>
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#86BC25]"></span>
                  </span>
                  Focus: {cat}
                  <button 
                    onClick={() => onSelectCategories(prev => prev.filter(c => c !== cat))}
                    className={`hover:text-white cursor-pointer ml-1.5 font-bold font-mono text-[9px] ${isDark ? "text-slate-400" : ""}`}
                  >
                    [X]
                  </button>
                </div>
              ))}
              <button 
                onClick={() => onSelectCategories([])}
                className={`text-[9px] font-mono font-bold hover:underline uppercase ${isDark ? "text-slate-600 hover:text-slate-400" : "text-slate-500 hover:text-slate-800"}`}
              >
                Clear All
              </button>
            </div>
          )}

          {/* Tier Filter Toggle */}
          <div className={`flex border font-mono text-[9px] select-none ${isDark ? "border-[#1E293B] bg-[#0A0D14]" : "border-slate-300 bg-white"}`}>
            {["ALL", "Tier 0", "Tier 1", "Tier 2"].map((tier) => (
              <button
                key={tier}
                onClick={() => setSelectedTier(tier)}
                className={`px-2.5 py-0.5 border-r last:border-0 cursor-pointer uppercase transition-colors duration-75 ${
                  isDark ? "border-[#1E293B]" : "border-slate-300"
                } ${
                  selectedTier === tier 
                    ? (isDark ? "bg-slate-800 text-white font-bold" : "bg-slate-800 text-white font-bold") 
                    : isDark 
                      ? "bg-[#0A0D14] text-slate-400 hover:bg-[#151C2C] hover:text-white"
                      : "bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {tier}
              </button>
            ))}
          </div>

          <button
            id="table-date-filter"
            className={`flex cursor-pointer items-center gap-1 rounded-none border px-2.5 py-0.5 text-[9px] font-mono font-medium select-none transition-colors duration-150 ${
              isDark 
                ? "border-[#1E293B] bg-[#0A0D14] text-slate-400 hover:border-slate-600 hover:text-white"
                : "border-slate-300 bg-white text-slate-700 hover:border-slate-500 hover:bg-slate-50"
            }`}
          >
            <Calendar className={`h-3 w-3 ${isDark ? "text-slate-600" : "text-slate-400"}`} />
            Q2 2026
            <ChevronDown className={`h-3 w-3 ${isDark ? "text-slate-600" : "text-slate-400"}`} />
          </button>
        </div>
      </div>

      {/* ── Boardroom Terminal Registry Table ── */}
      <div className="overflow-x-auto">
        <table id="health-monitor-table" className="w-full text-left border-collapse">
          <thead>
            <tr className={`border-b-2 font-mono text-[9px] uppercase tracking-wider select-none ${
              isDark ? "border-[#1E293B] bg-[#0A0D14] text-slate-500" : "border-slate-300 bg-slate-50 text-slate-500"
            }`}>
              <th className="py-2 px-3 w-6 text-left">
                <input
                  type="checkbox"
                  className="h-3 w-3 rounded-none border-slate-300 accent-[#86BC25] cursor-pointer"
                />
              </th>
              <th 
                onClick={() => requestSort("id")}
                className={`py-2 px-3 w-20 text-left font-bold cursor-pointer transition-colors duration-75 select-none ${isDark ? "hover:bg-slate-800 hover:text-slate-100" : "hover:bg-slate-100 hover:text-slate-800"}`}
              >
                Node ID {renderSortIndicator("id")}
              </th>
              <th 
                onClick={() => requestSort("facility")}
                className={`py-2 px-3 w-52 text-left font-bold cursor-pointer transition-colors duration-75 select-none ${isDark ? "hover:bg-slate-800 hover:text-slate-100" : "hover:bg-slate-100 hover:text-slate-800"}`}
              >
                Facility / Region {renderSortIndicator("facility")}
              </th>
              <th className="py-2 px-3 text-left font-bold">Disruption Signal</th>
              <th 
                onClick={() => requestSort("severity")}
                className={`py-2 px-3 w-36 text-right font-bold font-mono cursor-pointer transition-colors duration-75 select-none ${isDark ? "hover:bg-slate-800 hover:text-slate-100" : "hover:bg-slate-100 hover:text-slate-800"}`}
              >
                Risk Severity {renderSortIndicator("severity")}
              </th>
              <th 
                onClick={() => requestSort("likelihood")}
                className={`py-2 px-3 w-32 text-right font-bold font-mono cursor-pointer transition-colors duration-75 select-none ${isDark ? "hover:bg-slate-800 hover:text-slate-100" : "hover:bg-slate-100 hover:text-slate-800"}`}
              >
                Likelihood {renderSortIndicator("likelihood")}
              </th>
              <th 
                onClick={() => requestSort("timeToHit")}
                className={`py-2 px-3 w-28 text-right font-bold font-mono cursor-pointer transition-colors duration-75 select-none ${isDark ? "hover:bg-slate-800 hover:text-slate-100" : "hover:bg-slate-100 hover:text-slate-800"}`}
              >
                Time-to-hit {renderSortIndicator("timeToHit")}
              </th>
              <th className="py-2 px-3 w-20 text-right font-bold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              /* Inline Table Loading Spinner */
              <tr>
                <td colSpan="8" className="py-10 text-center font-mono text-[10px] text-slate-400 select-none">
                  <RefreshCw className="h-4 w-4 animate-spin text-[#86BC25] inline-block mr-2 align-middle" />
                  LOADING THREAT REGISTRY DATA MATRIX...
                </td>
              </tr>
            ) : (
              sortedRows.map((row) => {
                const isHighlighted = row.ingestedAt && (Date.now() - row.ingestedAt) < 4000;
                return (
                  <tr
                    key={row.id}
                    onClick={() => setInspectedRow(row)}
                    className={`group transition-all duration-300 ease-out font-sans text-xs border-l-2 cursor-pointer ${
                      isHighlighted 
                        ? "bg-[#86BC25]/15 border-l-[#86BC25]" 
                        : isDark
                          ? "border-l-transparent text-slate-300 hover:bg-[#151C2C] even:bg-[#0D1119]"
                          : "border-l-transparent text-slate-800 even:bg-[#F8FAFC] hover:bg-slate-100/75"
                    }`}
                  >
                  {/* Checkbox */}
                  <td className="py-1.5 px-3 align-middle" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      id={`row-checkbox-${row.id}`}
                      className="h-3 w-3 rounded-none border-slate-300 accent-[#86BC25] cursor-pointer"
                    />
                  </td>
                  
                  {/* Node ID */}
                  <td className={`py-1.5 px-3 align-middle font-mono text-[10px] font-semibold ${isDark ? "text-slate-500" : "text-slate-500"}`}>
                    {row.id}
                  </td>

                  {/* Facility / Location */}
                  <td className="py-1.5 px-3 align-middle">
                    <div className={`font-semibold leading-tight ${isDark ? "text-slate-100" : "text-slate-900"}`}>{row.facility}</div>
                    <div className="text-[9px] text-slate-400 font-mono mt-0.5">{row.location} &bull; Tier {row.tier}</div>
                  </td>

                  {/* Disruption Description */}
                  <td className={`py-1.5 px-3 align-middle max-w-sm overflow-hidden text-ellipsis leading-tight font-sans ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className={`inline-block font-mono text-[8px] px-1.5 py-0.5 border select-none leading-none rounded-none uppercase font-bold tracking-wider ${
                        getTaxonomy(row.id) === "Logistics & Transit" 
                          ? isDark ? "bg-red-950/40 text-red-400 border-red-900/50" : "bg-red-50 text-red-600 border-red-200"
                          : getTaxonomy(row.id) === "Operations & Capacity" 
                            ? isDark ? "bg-amber-950/40 text-amber-400 border-amber-900/50" : "bg-amber-50 text-amber-600 border-amber-200"
                            : getTaxonomy(row.id) === "Regulatory & Quality" 
                              ? isDark ? "bg-sky-950/40 text-sky-400 border-sky-900/50" : "bg-sky-50 text-sky-600 border-sky-200"
                              : isDark ? "bg-[#86BC25]/10 text-[#86BC25] border-[#86BC25]/30" : "bg-[#86BC25]/10 text-[#86BC25] border-[#86BC25]/20"
                      }`}>
                        {getTaxonomy(row.id)}
                      </span>
                      <span>{row.disruption}</span>
                    </div>
                  </td>

                  {/* Risk Severity Badge (Right-aligned numeric) */}
                  <td className="py-1.5 px-3 align-middle text-right">
                    <span
                      className={`inline-block border rounded-none px-2 py-0.5 text-[9px] font-mono font-bold tracking-wider ${getSeverityColor(row.severity)}`}
                    >
                      {getSeverityLabel(row.severity)}
                    </span>
                  </td>

                  {/* Likelihood Badge (Right-aligned numeric) */}
                  <td className="py-1.5 px-3 align-middle text-right">
                    <span
                      className={`inline-block border rounded-none px-2 py-0.5 text-[9px] font-mono font-bold tracking-wider ${getLikelihoodColor(row.likelihood)}`}
                    >
                      {getLikelihoodLabel(row.likelihood)}
                    </span>
                  </td>

                  {/* Time to hit (Right-aligned numeric/text) */}
                  <td className={`py-1.5 px-3 align-middle text-right font-mono text-[10px] font-semibold ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    {formatTimeToHit(row.timeToHit)}
                  </td>

                  {/* Action inspect button with tactile hit fill state */}
                  <td className="py-1.5 px-3 align-middle text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setInspectedRow(row)}
                      className="cursor-pointer border border-[#86BC25] bg-transparent text-[#86BC25] px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase rounded-none hover:bg-[#86BC25] hover:text-black transition-colors duration-75"
                    >
                      INSPECT
                    </button>
                  </td>
                </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Detail Drawer Overlay ── */}
      {inspectedRow && (
        <>
          {/* Backdrop */}
          <div 
            onClick={handleClosePanel}
            className="fixed inset-0 z-[9990] bg-black/35 backdrop-blur-[1px] transition-opacity duration-150"
          />

          {/* Drawer Panel */}
          <div
            id="threat-drawer"
            className={`fixed top-0 right-0 bottom-0 z-[9995] border-l shadow-2xl p-6 overflow-y-auto flex flex-col font-sans transition-all duration-500 ease-in-out ${
              playbookGenerated 
                ? "w-full md:w-[780px] lg:w-[1000px] xl:w-[1100px]" 
                : "w-full sm:w-[520px]"
            } ${
              isDark ? "bg-[#0A0D14] border-[#1E293B] text-slate-200" : "bg-white border-slate-200 text-slate-800"
            }`}
          >
            {/* Header */}
            <div className={`flex items-center justify-between border-b pb-4 mb-4 select-none ${isDark ? "border-[#1E293B]" : "border-slate-200"}`}>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 bg-[#D32F2F]" />
                <span className={`font-mono text-[10px] font-bold tracking-wider uppercase ${isDark ? "text-slate-500" : "text-slate-500"}`}>
                  THREAT CLASSIFICATION INSPECTOR
                </span>
              </div>
              <button
                onClick={handleClosePanel}
                className={`flex items-center gap-1 border px-2 py-0.5 text-[9px] font-mono cursor-pointer transition-colors duration-75 ${
                  isDark 
                    ? "border-[#1E293B] bg-[#0F1520] text-slate-500 hover:text-slate-200 hover:border-slate-600"
                    : "border-slate-200 bg-slate-50 text-slate-500 hover:text-slate-900 hover:border-slate-400"
                }`}
              >
                <X className="h-3 w-3" />
                CLOSE [ESC]
              </button>
            </div>

            {/* Core Info */}
            <div className="flex flex-col gap-1 mb-4 select-none">
              <div className="flex items-center justify-between">
                <div>
                  <span className={`text-2xl font-bold font-sans tracking-tight ${isDark ? "text-slate-100" : "text-slate-900"}`}>{inspectedRow.id}</span>
                  <span className="ml-2 text-[10px] font-mono text-[#86BC25] uppercase tracking-wider font-bold border border-[#86BC25]/30 bg-[#86BC25]/5 px-2 py-0.5">TIER {inspectedRow.tier} NODE</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {playbookGenerated ? (
                    <>
                      <span className="h-1.5 w-1.5 rounded-full bg-[#86BC25] animate-ping" />
                      <span className="text-[9px] font-mono text-[#86BC25] uppercase tracking-wider font-bold">PLAYBOOK ACTIVE</span>
                    </>
                  ) : (
                    <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">RISK INSPECTOR</span>
                  )}
                </div>
              </div>
              <p className={`text-base font-semibold mt-1 ${isDark ? "text-slate-100" : "text-slate-800"}`}>{inspectedRow.facility}</p>
              <p className={`text-xs font-mono ${isDark ? "text-slate-400" : "text-slate-500"}`}>{inspectedRow.location} &bull; {inspectedRow.disruption}</p>
            </div>

            {/* Quick-Glance Risk KPIs — always visible */}
            <div className={`grid grid-cols-4 gap-2 mb-5 select-none font-mono text-[10px] border-b pb-5 ${isDark ? "border-[#1E293B]" : "border-slate-200"}`}>
              <div className={`border p-2.5 flex flex-col justify-between ${isDark ? "border-[#1E293B] bg-[#0F1520]" : "border-slate-200 bg-slate-50"}`}>
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[8px]">SEVERITY</span>
                <span className={`font-bold text-[11px] mt-1 ${getSeverityColor(inspectedRow.severity).split(' ')[0]}`}>{getSeverityLabel(inspectedRow.severity).split(" ")[0]}</span>
              </div>
              <div className={`border p-2.5 flex flex-col justify-between ${isDark ? "border-[#1E293B] bg-[#0F1520]" : "border-slate-200 bg-slate-50"}`}>
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[8px]">LIKELIHOOD</span>
                <span className={`font-bold text-[11px] mt-1 ${getLikelihoodColor(inspectedRow.likelihood).split(' ')[0]}`}>{getLikelihoodLabel(inspectedRow.likelihood).split(" ")[0]}</span>
              </div>
              <div className={`border p-2.5 flex flex-col justify-between ${isDark ? "border-[#1E293B] bg-[#0F1520]" : "border-slate-200 bg-slate-50"}`}>
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[8px]">TIME TO HIT</span>
                <span className={`font-bold text-[11px] mt-1 ${isDark ? "text-slate-200" : "text-slate-800"}`}>{formatTimeToHit(inspectedRow.timeToHit)}</span>
              </div>
              <div className={`border p-2.5 flex flex-col justify-between ${isDark ? "border-[#1E293B] bg-[#0F1520]" : "border-slate-200 bg-slate-50"}`}>
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[8px]">TAXONOMY</span>
                <span className="text-[#86BC25] font-bold text-[9px] mt-1 leading-tight">{getTaxonomy(inspectedRow.id)}</span>
              </div>
            </div>

            {/* ── PRE-PLAYBOOK VIEW ── */}
            {!playbookGenerated && (
              <div className="flex flex-col gap-5">
                {/* Full Risk Description & Executive Briefing */}
                <div className={`border p-4 flex flex-col gap-3.5 ${isDark ? "border-[#1E293B] bg-[#0A0D14]" : "border-slate-200 bg-slate-50"}`}>
                  <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#86BC25] font-mono mb-1.5 flex items-center gap-1.5">
                      <MessageSquare className="h-3.5 w-3.5" />
                      Executive Governance & Risk Briefing
                    </h3>
                    <p className={`text-xs leading-relaxed font-sans ${isDark ? "text-slate-200" : "text-slate-700"}`}>{inspectedRow.fullDescription}</p>
                  </div>

                  {/* C-Suite Strategic Insights Overlay */}
                  <div className={`grid grid-cols-1 md:grid-cols-2 gap-3 border-t pt-3.5 font-sans text-[11px] ${isDark ? "border-[#1E293B]" : "border-slate-200"}`}>
                    <div className="flex flex-col gap-1">
                      <span className="font-mono text-[9px] font-bold text-amber-500 uppercase tracking-wider">
                        Downstream Business Impact
                      </span>
                      <p className={`${isDark ? "text-slate-300" : "text-slate-600"} leading-relaxed`}>
                        Threatens core SLA commitments and operational run-rates at primary integration hubs. Direct exposure includes potential line halts, contract liquidation penalties, and customer delivery buffer depletion.
                      </p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="font-mono text-[9px] font-bold text-sky-500 uppercase tracking-wider">
                        Mitigation Objective
                      </span>
                      <p className={`${isDark ? "text-slate-300" : "text-slate-600"} leading-relaxed`}>
                        Establish immediate redundant routing profiles, secure spot-market raw precursor supplies, and activate pre-audited storage buffer releases to protect final product delivery schedules.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Signal Pipeline */}
                {renderPipeline(inspectedRow)}

                {/* Generate CTA */}
                <div className={`mt-auto border-t pt-4 flex flex-col gap-3 ${isDark ? "border-[#1E293B]" : "border-slate-200"}`}>
                  {!isGenerating && (
                    <button
                      onClick={() => handleGeneratePlaybook()}
                      className="w-full cursor-pointer border border-[#86BC25] bg-[#86BC25] text-black font-bold uppercase tracking-wider text-[10px] py-2.5 rounded-none hover:bg-slate-950 hover:text-white hover:border-[#86BC25] transition-colors duration-75"
                    >
                      ⚡ Generate Mitigation Playbook
                    </button>
                  )}

                  {/* Loading Progress State */}
                  {isGenerating && (
                    <div className={`w-full border p-6 flex flex-col items-center justify-center gap-4 rounded-none transition-all duration-300 ${
                      isDark ? "bg-[#090D16] border-[#1E293B]" : "bg-slate-50 border-slate-200"
                    }`}>
                      <div className="relative flex items-center justify-center h-12 w-12">
                        {/* Outer rotating ring */}
                        <div className="absolute inset-0 rounded-full border-[3px] border-[#86BC25]/10 border-t-[#86BC25] animate-spin" />
                        {/* Inner reverse-rotating ring */}
                        <div className="absolute h-8 w-8 rounded-full border-2 border-[#86BC25]/5 border-b-[#86BC25]/40 animate-spin [animation-direction:reverse] [animation-duration:1s]" />
                        {/* Center core pulse */}
                        <div className="h-3 w-3 rounded-full bg-[#86BC25] animate-pulse" />
                      </div>
                      <div className="flex flex-col items-center gap-1 text-center select-none">
                        <span className={`text-[10px] font-mono font-bold tracking-widest uppercase ${
                          isDark ? "text-slate-200" : "text-slate-800"
                        }`}>
                          Compiling Risk Playbook
                        </span>
                        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider animate-pulse">
                          Deloitte AI engine generating mitigations...
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── PLAYBOOK VIEW ── */}
            {playbookGenerated && (
              <div className={`w-full flex flex-col gap-6 animate-fade-in ${isDark ? "text-slate-200" : "text-slate-700"}`}>

                  {/* C-Suite Executive Telemetry Dashboard */}
                  {cSuiteEnrichment && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {/* KPI Card 1: Revenue at Risk */}
                      <div className={`border p-4 flex flex-col justify-between rounded-none relative overflow-hidden group select-none ${isDark ? "border-[#1E293B] bg-[#0A0D14]" : "border-slate-200 bg-slate-50"}`}>
                        <div className={`flex items-center justify-between border-b pb-1.5 mb-1.5 ${isDark ? "border-[#1E293B]" : "border-slate-200"}`}>
                          <span className={`text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                            <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                            Revenue Exposure
                          </span>
                          <span className={`text-xs font-mono border px-1.5 py-0.5 ${isDark ? "text-red-400 bg-red-950/40 border-red-900/30" : "text-red-600 bg-red-50 border-red-100"}`}>
                            -{(((totalFinancialAtRisk - mitigatedTotalExposure) / Math.max(1, totalFinancialAtRisk)) * 100).toFixed(0)}% Risk
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between mt-2 gap-2">
                          <div className="flex-1">
                            <span className={`text-[10px] font-mono block uppercase ${isDark ? "text-slate-400" : "text-slate-500"}`}>Unmitigated</span>
                            <span className={`text-sm font-bold font-mono ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                              ${(totalFinancialAtRisk / 1000000).toFixed(1)}M
                            </span>
                          </div>
                          
                          <ArrowRight className="h-4 w-4 text-slate-400 shrink-0 self-center" />
                          
                          <div className="text-right flex-1">
                            <span className="text-xs font-mono text-[#86BC25] block uppercase font-bold">Mitigated Target</span>
                            <span className={`text-lg font-black font-mono ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                              ${(mitigatedTotalExposure / 1000000).toFixed(1)}M
                            </span>
                          </div>
                        </div>

                        <div className={`mt-3 border-t pt-2 flex justify-between items-center text-xs font-mono ${isDark ? "border-[#1E293B]/80 text-slate-400" : "border-slate-200/80 text-slate-500"}`}>
                          <span>EXPOSURE AVOIDED:</span>
                          <span className="text-[#86BC25] font-bold">
                            -${((totalFinancialAtRisk - mitigatedTotalExposure) / 1000000).toFixed(1)}M
                          </span>
                        </div>
                      </div>

                      {/* KPI Card 2: Total Mitigation CapEx */}
                      <div className={`border p-4 flex flex-col justify-between rounded-none relative overflow-hidden group select-none ${isDark ? "border-[#1E293B] bg-[#0A0D14]" : "border-slate-200 bg-slate-50"}`}>
                        <div className={`flex items-center justify-between border-b pb-1.5 mb-1.5 ${isDark ? "border-[#1E293B]" : "border-slate-200"}`}>
                          <span className={`text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                            <DollarSign className="h-3.5 w-3.5 text-[#86BC25]" />
                            Mitigation CapEx
                          </span>
                          <span className={`text-xs font-mono border px-1.5 py-0.5 ${isDark ? "text-sky-400 bg-sky-950/20 border-sky-900/30" : "text-sky-600 bg-sky-50 border-sky-100"}`}>
                            Clearance Checked
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between mt-2 gap-2">
                          <div className="flex-1">
                            <span className={`text-[10px] font-mono block uppercase ${isDark ? "text-slate-400" : "text-slate-500"}`}>Base Cost</span>
                            <span className={`text-sm font-bold font-mono ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                              ${(cSuiteEnrichment.baseWorkaroundCost / 1000).toFixed(0)}K
                            </span>
                          </div>
                          
                          <ArrowRight className="h-4 w-4 text-slate-400 shrink-0 self-center" />
                          
                          <div className="text-right flex-1">
                            <span className="text-xs font-mono text-sky-400 block uppercase font-bold">Final Cost</span>
                            <span className={`text-lg font-black font-mono ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                              ${(mitigatedWorkaroundCost / 1000).toFixed(0)}K
                            </span>
                          </div>
                        </div>

                        <div className={`mt-3 border-t pt-2 flex justify-between items-center text-xs font-mono ${isDark ? "border-[#1E293B]/80 text-slate-400" : "border-slate-200/80 text-slate-500"}`}>
                          <span>CAPEX PREMIUM:</span>
                          <span className="text-sky-400 font-bold">
                            +${((mitigatedWorkaroundCost - cSuiteEnrichment.baseWorkaroundCost) / 1000).toFixed(0)}K
                          </span>
                        </div>
                      </div>

                      {/* KPI Card 3: Est. Recovery Timeline */}
                      <div className={`border p-4 flex flex-col justify-between rounded-none relative overflow-hidden group select-none ${isDark ? "border-[#1E293B] bg-[#0A0D14]" : "border-slate-200 bg-slate-50"}`}>
                        <div className={`flex items-center justify-between border-b pb-1.5 mb-1.5 ${isDark ? "border-[#1E293B]" : "border-slate-200"}`}>
                          <span className={`text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                            <Clock className="h-3.5 w-3.5 text-sky-400" />
                            Recovery Timeline
                          </span>
                          <span className={`text-xs font-mono border px-1.5 py-0.5 ${isDark ? "text-[#86BC25] bg-[#86BC25]/10 border-[#86BC25]/20" : "text-[#86BC25] bg-[#86BC25]/10 border-[#86BC25]/20"}`}>
                            Time Saved
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between mt-2 gap-2">
                          <div className="flex-1">
                            <span className={`text-[10px] font-mono block uppercase ${isDark ? "text-slate-400" : "text-slate-500"}`}>Base Cycle</span>
                            <span className={`text-sm font-bold font-mono ${isDark ? "text-slate-300" : "text-slate-300"}`}>
                              {cSuiteEnrichment.baseTimelineDays} Days
                            </span>
                          </div>
                          
                          <ArrowRight className="h-4 w-4 text-slate-400 shrink-0 self-center" />
                          
                          <div className="text-right flex-1">
                            <span className="text-xs font-mono text-sky-400 block uppercase font-bold">Optimal Run</span>
                            <span className={`text-lg font-black font-mono ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                              {mitigatedTimelineDays.toFixed(1)} Days
                            </span>
                          </div>
                        </div>

                        <div className={`mt-3 border-t pt-2 flex justify-between items-center text-xs font-mono ${isDark ? "border-[#1E293B]/80 text-slate-400" : "border-slate-200/80 text-slate-500"}`}>
                          <span>SPEED IMPROVEMENT:</span>
                          <span className="text-[#86BC25] font-bold">
                            -{(cSuiteEnrichment.baseTimelineDays - mitigatedTimelineDays).toFixed(1)} Days
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Net Financial Risk Avoided Alert Banner */}
                  {cSuiteEnrichment && financialSaved > 0 && (
                    <div className="border border-[#86BC25]/20 bg-[#86BC25]/5 p-3 flex items-center justify-between rounded-none select-none">
                      <div className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-[#86BC25]" />
                        <div>
                          <div className="text-[10px] font-mono font-bold text-[#86BC25] uppercase tracking-wider">
                            NET FINANCIAL RISK AVOIDANCE (PLAYBOOK DEPLOYED ROI)
                          </div>
                          <div className="text-[9px] text-slate-500 mt-0.5 font-sans leading-normal">
                            Decisive deployment of response options avoids major supply chain interruption losses.
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold font-mono text-[#86BC25] block">
                          +${(financialSaved / 1000000).toFixed(2)}M
                        </span>
                        <span className="text-[8px] font-mono text-slate-500 uppercase">CAPITAL PROTECTED</span>
                      </div>
                    </div>
                  )}

                  {/* Main Grid: Action Plan on Left, Narrative & Governance on Right */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* LEFT COLUMN: ACTION PLAN & PIPELINE (lg:col-span-7) */}
                    <div className="lg:col-span-7 flex flex-col gap-6">
                      
                      {/* Active Supply Chain Risk Statement */}
                      <div className={`border p-4 flex flex-col gap-3 ${isDark ? "border-red-900/40 bg-red-950/15" : "border-red-200 bg-red-50/50"}`}>
                        <div className="flex items-center gap-2 select-none">
                          <AlertCircle className="h-4.5 w-4.5 text-red-500" />
                          <h4 className="text-xs font-bold uppercase tracking-wider text-red-500 font-mono">
                            Active Supply Chain Risk Restatement
                          </h4>
                        </div>
                        <div className="text-xs flex flex-col gap-1.5 font-sans leading-relaxed">
                          <p className={`font-semibold ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                            Disruption Incident: <span className="underline decoration-red-500">{inspectedRow.disruption}</span>
                          </p>
                          <p className={isDark ? "text-slate-300" : "text-slate-600"}>
                            <strong>Downstream Operation Impact:</strong> {inspectedRow.fullDescription}
                          </p>
                          <div className={`p-2.5 border font-mono text-xs select-none ${isDark ? "bg-slate-950/40 border-red-900/30 text-red-400" : "bg-white border-red-100 text-red-700"}`}>
                            <strong>CRITICAL CORRIDOR THREAT:</strong> This node represents a vital supply bottleneck. Failure to enact the playbook within the target buffer window escalates the risk parameter directly to severe contract penalties.
                          </div>
                        </div>
                      </div>

                      {/* Strategic Action Plan (Immediate, Tactical, Policy) */}
                      <div className={`border p-4 flex flex-col gap-4 ${isDark ? "border-[#1E293B] bg-[#0A0D14]" : "border-slate-200 bg-slate-50"}`}>
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-[#86BC25] font-mono flex items-center gap-1.5">
                            <FileText className="h-4 w-4" />
                            Prioritized Strategic Action Plan
                          </h4>
                          <p className={`text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                            Standard Operating Procedures (SOP) mapped across time horizons to secure the node.
                          </p>
                        </div>

                        {cSuiteEnrichment && (
                          <div className="flex flex-col gap-4 font-sans text-xs">
                            {/* Phase 1 */}
                            <div className="flex gap-3 border-l-2 border-[#86BC25] pl-3 py-1">
                              <div className="flex-1 flex flex-col gap-2">
                                <span className="font-mono text-xs font-bold text-[#86BC25] uppercase tracking-wider">
                                  PHASE 1 &bull; IMMEDIATE CONTAINMENT (0 - 48 HOURS)
                                </span>
                                <p className={`leading-relaxed font-sans text-xs ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                                  {cSuiteEnrichment.strategicPhases.immediate}
                                </p>
                                <div className={`p-3 border flex flex-col gap-1.5 font-mono text-[10px] leading-relaxed ${isDark ? "bg-slate-950/40 border-[#1E293B] text-slate-300" : "bg-slate-100/50 border-slate-200 text-slate-600"}`}>
                                  <span className="font-bold text-amber-500 uppercase">Immediate Tasks & Protocols:</span>
                                  <ul className="list-disc pl-4 flex flex-col gap-1">
                                    <li>Flag internal quality inspectors to trace affected batch footprints.</li>
                                    <li>Assess safety stock levels held in regional storage warehouses.</li>
                                    <li>Notify on-call engineering supervisors to start physical line checks.</li>
                                  </ul>
                                </div>
                              </div>
                            </div>

                            {/* Phase 2 */}
                            <div className="flex gap-3 border-l-2 border-sky-500 pl-3 py-1">
                              <div className="flex-1 flex flex-col gap-2">
                                <span className="font-mono text-xs font-bold text-sky-500 uppercase tracking-wider">
                                  PHASE 2 &bull; ALTERNATE ROUTING & RE-SOURCING (48H - 2 WEEKS)
                                </span>
                                <p className={`leading-relaxed font-sans text-xs ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                                  {cSuiteEnrichment.strategicPhases.tactical}
                                </p>
                                <div className={`p-3 border flex flex-col gap-1.5 font-mono text-[10px] leading-relaxed ${isDark ? "bg-slate-950/40 border-[#1E293B] text-slate-300" : "bg-slate-100/50 border-slate-200 text-slate-600"}`}>
                                  <span className="font-bold text-sky-500 uppercase">Alternate Logistics Protocols:</span>
                                  <ul className="list-disc pl-4 flex flex-col gap-1">
                                    <li>Deploy dedicated flatbed courier fleets under pre-file DOT permits.</li>
                                    <li>Re-allocate inbound shipments to pre-approved secondary sea-port bays.</li>
                                    <li>Coordinate receiving crane and storage bay schedules with regional leads.</li>
                                  </ul>
                                </div>
                              </div>
                            </div>

                            {/* Phase 3 */}
                            <div className="flex gap-3 border-l-2 border-slate-400 pl-3 py-1">
                              <div className="flex-1 flex flex-col gap-2">
                                <span className="font-mono text-xs font-bold text-slate-400 uppercase tracking-wider">
                                  PHASE 3 &bull; CAPITAL POLICY & RESILIENCY ADJUSTMENT
                                </span>
                                <p className={`leading-relaxed font-sans text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                                  {cSuiteEnrichment.strategicPhases.structural}
                                </p>
                                <div className={`p-3 border flex flex-col gap-1.5 font-mono text-[10px] leading-relaxed ${isDark ? "bg-slate-950/40 border-[#1E293B] text-slate-300" : "bg-slate-100/50 border-slate-200 text-slate-600"}`}>
                                  <span className="font-bold text-slate-400 uppercase">Resiliency Policy Adjustments:</span>
                                  <ul className="list-disc pl-4 flex flex-col gap-1">
                                    <li>Re-balance process workloads to alternate autoclaves or lines.</li>
                                    <li>Postpone secondary general maintenance runs to maximize capacity limits.</li>
                                    <li>Update inventory buffer safety stock rules in ERP tracking databases.</li>
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Signal Origin & Ingestion Pipeline Flow */}
                      {renderPipeline(inspectedRow)}
                    </div>

                    {/* RIGHT COLUMN: GOVERNANCE & CONTACTS (lg:col-span-5) */}
                    <div className="lg:col-span-5 flex flex-col gap-6">
                      
                      {/* Executive Governance & SLA Compliance tracker */}
                      {cSuiteEnrichment && (() => {
                        const nodeSignOffs = signOffs[inspectedRow.id] || { cfo: false, coo: false, board: false };
                        const isFullyAuthorized = nodeSignOffs.cfo && nodeSignOffs.coo && nodeSignOffs.board;
                        
                        return (
                          <div className={`border transition-all duration-300 p-4 flex flex-col gap-4 ${
                            isFullyAuthorized 
                              ? isDark
                                ? "border-[#86BC25] bg-[#86BC25]/5 shadow-[0_0_15px_rgba(134,188,37,0.15)]"
                                : "border-[#86BC25] bg-[#86BC25]/5 shadow-[0_0_15px_rgba(134,188,37,0.08)]" 
                              : isDark
                                ? "border-[#1E293B] bg-[#0A0D14]"
                                : "border-slate-200 bg-slate-50"
                          }`}>
                            <div>
                              <div className="flex items-center justify-between">
                                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                                  Executive Governance & SLA Compliance
                                </h4>
                                <span className={`text-[8px] font-mono px-1.5 py-0.5 border ${
                                  isFullyAuthorized
                                    ? "bg-[#86BC25]/15 text-[#86BC25] border-[#86BC25]/30 animate-pulse font-bold"
                                    : isDark
                                      ? "bg-slate-950 text-slate-400 border-[#1E293B]"
                                      : "bg-slate-100 text-slate-500 border-slate-200"
                                }`}>
                                  {isFullyAuthorized ? "FULL BOARD CLEARANCE" : "PENDING CLEARANCE"}
                                </span>
                              </div>
                              <p className={`text-[9px] mt-0.5 font-sans leading-normal ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                                Board-level compliance tracking and C-suite deployment sign-off clearance.
                              </p>
                            </div>
                            
                            <div className="flex flex-col gap-3.5 text-xs">
                              {/* SLA & Contractual Exposure */}
                              <div className={`flex flex-col gap-1 border-b pb-2.5 ${isDark ? "border-[#1E293B]" : "border-slate-200"}`}>
                                <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">SLA & Contractual Exposure</span>
                                <p className={`leading-snug font-sans text-[10px] ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                                  {cSuiteEnrichment.slaRisk}
                                </p>
                              </div>

                              {/* Evidence-Based Risk Foundation */}
                              <div className={`flex flex-col gap-1 border-b pb-2.5 ${isDark ? "border-[#1E293B]" : "border-slate-200"}`}>
                                <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">Evidence-Based Risk Foundation</span>
                                <p className={`leading-snug font-sans text-[10px] ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                                  {cSuiteEnrichment.evidenceBase}
                                </p>
                              </div>

                              {/* Compliance & Capital Threshold Check */}
                              <div className={`flex flex-col gap-2 border-b pb-2.5 ${isDark ? "border-[#1E293B]" : "border-slate-200"}`}>
                                <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">Compliance & Capital Threshold Check</span>
                                <div className={`grid grid-cols-2 gap-2 border p-2 font-mono text-[9px] select-none ${isDark ? "bg-[#0F1520] border-[#1E293B]" : "bg-white border-slate-200"}`}>
                                  <div>
                                    <span className="text-slate-400 block text-[8px] uppercase">Expedited CapEx Limit</span>
                                    <span className={`font-bold ${isDark ? "text-slate-200" : "text-slate-800"}`}>$1,000,000</span>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-slate-400 block text-[8px] uppercase">Projected Run Cost</span>
                                    <span className={`font-bold ${mitigatedWorkaroundCost > 1000000 ? "text-red-500 animate-pulse" : "text-[#86BC25]"}`}>
                                      ${mitigatedWorkaroundCost.toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                                <div className={`flex items-center gap-2 border p-2 font-mono text-[9px] ${isDark ? "border-[#1E293B] bg-slate-950/40" : "border-slate-200 bg-slate-100/50"}`}>
                                  <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                                    mitigatedWorkaroundCost > 1000000 ? "bg-red-500 animate-ping" : "bg-[#86BC25]"
                                  }`} />
                                  <span className={`leading-normal font-sans ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                                    {mitigatedWorkaroundCost > 1000000 
                                      ? "⚠️ EXCEEDED: Board CapEx Threshold Exceeded. Financial Committee clearance required." 
                                      : "✅ COMPLIANT: Under Board expedited CapEx threshold."}
                                  </span>
                                </div>
                              </div>

                              {/* C-Suite Sign-Off Tracker */}
                              <div className="flex flex-col gap-2.5 pt-1">
                                <span className="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-wider">
                                  Boardroom Sign-Off Flow
                                </span>
                                <p className={`text-[9px] leading-normal font-sans ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                                  C-suite members must sign off on this playbook to authorize containment deployment.
                                </p>
                                
                                <div className="flex flex-col gap-2">
                                  {/* CFO Sign-Off */}
                                  <div 
                                    onClick={() => handleSignOffToggle(inspectedRow.id, "cfo")}
                                    className={`border p-2.5 flex items-center justify-between cursor-pointer select-none transition-colors ${
                                      nodeSignOffs.cfo 
                                        ? "bg-[#86BC25]/10 border-[#86BC25] text-slate-900" 
                                        : isDark 
                                          ? "bg-slate-950 border-[#1E293B] text-slate-400 hover:border-slate-700 hover:bg-slate-900/40"
                                          : "bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50"
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <input 
                                        type="checkbox" 
                                        checked={nodeSignOffs.cfo} 
                                        onChange={() => {}} // controlled in parent onClick
                                        className="h-3.5 w-3.5 rounded-none accent-[#86BC25] cursor-pointer"
                                      />
                                      <div className="text-[10px]">
                                        <span className={`font-bold block ${isDark ? "text-slate-200" : "text-slate-800"}`}>1. CFO Financial CapEx Clearance</span>
                                        <span className={`text-[9px] font-sans ${isDark ? "text-slate-400" : "text-slate-500"}`}>Authorizes workaround budgets and premium charges.</span>
                                      </div>
                                    </div>
                                    <span className={`text-[8px] font-mono uppercase font-bold tracking-wider ${
                                      nodeSignOffs.cfo ? "text-[#86BC25]" : "text-slate-400"
                                    }`}>
                                      {nodeSignOffs.cfo ? "APPROVED" : "PENDING"}
                                    </span>
                                  </div>

                                  {/* COO Sign-Off */}
                                  <div 
                                    onClick={() => handleSignOffToggle(inspectedRow.id, "coo")}
                                    className={`border p-2.5 flex items-center justify-between cursor-pointer select-none transition-colors ${
                                      nodeSignOffs.coo 
                                        ? "bg-[#86BC25]/10 border-[#86BC25] text-slate-900" 
                                        : isDark
                                          ? "bg-slate-950 border-[#1E293B] text-slate-400 hover:border-slate-700 hover:bg-slate-900/40"
                                          : "bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50"
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <input 
                                        type="checkbox" 
                                        checked={nodeSignOffs.coo} 
                                        onChange={() => {}} 
                                        className="h-3.5 w-3.5 rounded-none accent-[#86BC25] cursor-pointer"
                                      />
                                      <div className="text-[10px]">
                                        <span className={`font-bold block ${isDark ? "text-slate-200" : "text-slate-800"}`}>2. COO Operational Divert Clearance</span>
                                        <span className={`text-[9px] font-sans ${isDark ? "text-slate-400" : "text-slate-500"}`}>Approves shipping diversions and line schedule shifts.</span>
                                      </div>
                                    </div>
                                    <span className={`text-[8px] font-mono uppercase font-bold tracking-wider ${
                                      nodeSignOffs.coo ? "text-[#86BC25]" : "text-slate-400"
                                    }`}>
                                      {nodeSignOffs.coo ? "APPROVED" : "PENDING"}
                                    </span>
                                  </div>

                                  {/* CRO / Board Sign-Off */}
                                  <div 
                                    onClick={() => handleSignOffToggle(inspectedRow.id, "board")}
                                    className={`border p-2.5 flex items-center justify-between cursor-pointer select-none transition-colors ${
                                      nodeSignOffs.board 
                                        ? "bg-[#86BC25]/10 border-[#86BC25] text-slate-900" 
                                        : isDark
                                          ? "bg-slate-950 border-[#1E293B] text-slate-400 hover:border-slate-700 hover:bg-slate-900/40"
                                          : "bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50"
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <input 
                                        type="checkbox" 
                                        checked={nodeSignOffs.board} 
                                        onChange={() => {}} 
                                        className="h-3.5 w-3.5 rounded-none accent-[#86BC25] cursor-pointer"
                                      />
                                      <div className="text-[10px]">
                                        <span className={`font-bold block ${isDark ? "text-slate-200" : "text-slate-800"}`}>3. Board Final Deployment Clearance</span>
                                        <span className={`text-[9px] font-sans ${isDark ? "text-slate-400" : "text-slate-500"}`}>Gives ultimate authorization to execute tactical options.</span>
                                      </div>
                                    </div>
                                    <span className={`text-[8px] font-mono uppercase font-bold tracking-wider ${
                                      nodeSignOffs.board ? "text-[#86BC25]" : "text-slate-400"
                                    }`}>
                                      {nodeSignOffs.board ? "APPROVED" : "PENDING"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Crisis Task Force stakeholder escalation */}
                      <div className={`border p-4 flex flex-col gap-3 ${isDark ? "border-[#1E293B] bg-[#0A0D14]" : "border-slate-200 bg-slate-50"}`}>
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono flex items-center gap-1.5 select-none">
                          <Users className="h-4 w-4 text-[#86BC25]" />
                          Crisis Task Force Escalation
                        </h4>
                        
                        <div className="flex flex-col gap-2">
                          {inspectedRow.playbook.contacts.map((contact, idx) => (
                            <div key={idx} className={`border p-3 text-[10px] leading-tight flex flex-col gap-2 ${isDark ? "bg-[#0F1520] border-[#1E293B]" : "bg-white border-slate-200"}`}>
                              <div className="flex items-start justify-between">
                                <div>
                                  <div className={`font-bold font-sans text-xs ${isDark ? "text-slate-200" : "text-slate-800"}`}>{contact.name}</div>
                                  <div className="text-slate-500 text-[9px] font-sans mt-0.5">{contact.role}</div>
                                </div>
                                <span className="text-[8px] font-mono text-[#86BC25] border border-[#86BC25]/20 bg-[#86BC25]/5 px-1.5 py-0.5 tracking-wider uppercase font-semibold select-none">
                                  ACTIVE RESPONDER
                                </span>
                              </div>
                              
                              <div className={`border-t pt-2 flex items-center justify-between font-mono text-[9px] text-[#86BC25] ${isDark ? "border-slate-900" : "border-slate-100"}`}>
                                <span>{contact.email}</span>
                                <span className="text-slate-300 select-none">&bull;</span>
                                <span>{contact.phone}</span>
                              </div>

                              <div className="flex gap-1.5 mt-1 select-none">
                                <a 
                                  href={`mailto:${contact.email}?subject=ESCALATION - Urgent Decision Support Required for ${inspectedRow.id}`}
                                  className={`flex-1 text-center font-mono text-[8px] font-bold uppercase py-1 border transition-colors duration-75 ${
                                    isDark 
                                      ? "border-slate-800 bg-transparent text-slate-400 hover:bg-slate-900 hover:text-slate-200" 
                                      : "border-slate-300 bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                  }`}
                                >
                                  📧 Email Alert
                                </a>
                                <button
                                  onClick={() => alert(`Direct MS Teams ping dispatched to ${contact.name} regarding urgent crisis resolution.`)}
                                  className="flex-1 text-center font-mono text-[8px] font-bold uppercase py-1 border border-[#86BC25] bg-[#86BC25] text-black hover:bg-slate-900 hover:text-white hover:border-[#86BC25] transition-colors duration-75 cursor-pointer"
                                >
                                  💬 Teams Escalation
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Playbook Feedback Suite */}
                      {renderFeedbackSuite(inspectedRow)}

                      {/* Source Telemetry Reference */}
                      <div className={`border p-3 flex flex-col gap-1.5 select-none font-mono text-[8px] ${isDark ? "border-[#1E293B] bg-[#0A0D14]" : "border-slate-200 bg-slate-50"}`}>
                        <span className="text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1">
                          <Terminal className="h-3.5 w-3.5 text-slate-500" />
                          Raw Telemetry Source Ingestion
                        </span>
                        <div className={`border p-2 break-all leading-normal select-text ${isDark ? "bg-[#0F1520] border-[#1E293B] text-slate-300" : "bg-white border-slate-200 text-slate-600"}`}>
                          {inspectedRow.sourceData}
                        </div>
                      </div>

                    </div>
                  </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
