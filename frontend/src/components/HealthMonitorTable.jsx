import { useState, useEffect } from "react";
import { ChevronDown, Calendar, X, ShieldAlert, CheckCircle, Clock, Building, MessageSquare, Terminal, RefreshCw, DollarSign, Activity, FileText, AlertTriangle, Users, Award, PlayCircle, Globe, MapPin, Cpu, Radio, ThumbsUp, ThumbsDown, Star, Sparkles, Box, AlertCircle } from "lucide-react";
import { getTaxonomy } from "./SignalTaxonomy";

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
    agentInsight: "NLP processor parsed factory logs and identified structural composite delays, projecting a 12+ day wider assembly threat corridor."
  },
  "SUP-001A": {
    crawlers: [
      { type: "News Crawler", icon: "Globe", detail: "Scanned 14 local Midwest freight labor blogs and Reuters labor RSS streams." },
      { type: "Geospatial Logs", icon: "MapPin", detail: "BNSF freight GPS logistics tracker coordinates reveal stationary cargo cars." }
    ],
    agentInsight: "Identified freight rail labor shutdown at key transit bottlenecks, calculating high Renton supply line starvation factor."
  },
  "SUP-701X": {
    crawlers: [
      { type: "SCADA Telemetry", icon: "Activity", detail: "TSMC Fab 12 seismic safety systems log automatic safety triggers at 0.12g." },
      { type: "News Crawler", icon: "Globe", detail: "Crawl Taiwan Weather Bureau feeds and local tech supply bulletins." }
    ],
    agentInsight: "SCADA webhook pushed direct lithography EUV calibration safety shutdown status; agent pre-allocated packaging redirect to Fab 15."
  },
  "SUP-401A": {
    crawlers: [
      { type: "Industrial IoT", icon: "Activity", detail: "SCADA Emerson exhaust valve sensor flags severe chemical bath pressure rupture." },
      { type: "Regulatory Code", icon: "FileText", detail: "Crawl EMA and FDA vaccine sterile products validation regulations loop criteria." }
    ],
    agentInsight: "NLP extractor compiled EMA sterilization validation time-delay coefficients based on history, drafting redundant line diversion plan."
  },
  "SUP-109B": {
    crawlers: [
      { type: "Logistics Manifest", icon: "Truck", detail: "DHL transatlantic Priority manifest backlog coordinates at Schiphol tarmac." },
      { type: "Financial Feeds", icon: "Coins", detail: "Crawl air-charter cold chain capacity indices and spot price indicators." }
    ],
    agentInsight: "Recognized Schiphol cargo bottle-neck early; calculated air-charter redirection options to Brussels and courier trucks."
  },
  "SUP-502A": {
    crawlers: [
      { type: "Regulatory Feeds", icon: "Globe", detail: "Lobby Shaanxi Provincial transit restrictions for chemical feedstocks." },
      { type: "Logistics Manifest", icon: "Truck", detail: "Samsung local Shaanxi chemical feedstock shipping registries." }
    ],
    agentInsight: "Parsed Shaanxi government transit warnings; estimated chemical gas stock decline rate, prompting Korea air bridge backup option."
  },
  "FAC-003": {
    crawlers: [
      { type: "Industrial IoT", icon: "Activity", detail: "Oven #4 thermocouple SCADA sensor records continuous 4.5% temperature drift." },
      { type: "Quality Records", icon: "FileText", detail: "Composite curing cycle quality assurance log registers variance warnings." }
    ],
    agentInsight: "Calibrated curing metrics against baseline; flagged sensor quality variance, triggering preventive maintenance reset window."
  },
  "FAC-010": {
    crawlers: [
      { type: "Geospatial Logs", icon: "MapPin", detail: "Panama Canal Authority vessel transit registration and bottleneck logs." },
      { type: "Logistics Manifest", icon: "Truck", detail: "Tesla supply logistics carrier status and 4680 cell deliveries tracker." }
    ],
    agentInsight: "Analyzed canal transit backlog forecasts; estimated local Austin inventory buffer burn rate, proposing Nevada cell diversion."
  },
  "SUP-302B": {
    crawlers: [
      { type: "Customs API", icon: "FileText", detail: "LAX/LGB customs clearance manifest databases for precision titanium." },
      { type: "Industrial News", icon: "Globe", detail: "Crawl West Coast port union strike warnings and customs audit guidelines." }
    ],
    agentInsight: "Extracted LA customs queue delays; pre-allocated Apex Materials secondary supply options to bypass port bottleneck."
  },
  "SUP-202C": {
    crawlers: [
      { type: "Industrial IoT", icon: "Activity", detail: "Ludwigshafen natural gas pipeline SCADA pressure sensors record 42 bar drop." },
      { type: "SCADA Pipeline", icon: "Truck", detail: "Nord-Flow pipeline supply metrics and chemical synthesis feedstocks." }
    ],
    agentInsight: "Detected gas inlet pressure threshold drop; activated Antwerp pre-cursor shift and local LNG vaporization array plans."
  },
  "FAC-008": {
    crawlers: [
      { type: "SCADA Power", icon: "Activity", detail: "PG&E high-voltage industrial grid surge sensors record 12% peak voltage spike." },
      { type: "Industrial IoT", icon: "Cpu", detail: "NVIDIA CA cooling rack system-monitoring telemetry logs automatic trip." }
    ],
    agentInsight: "Monitored server failover response logs; verified compute thread failover to Oregon cloud cluster with zero training downtime."
  },
  "SUP-8472": {
    crawlers: [
      { type: "SCADA Seismic", icon: "Activity", detail: "Japan Meteorological Agency local Ehime seismic vibration sensors record 3 on Shindo." },
      { type: "Industrial IoT", icon: "FileText", detail: "Toray Masaki-cho plant automated cleanroom particulate indicators." }
    ],
    agentInsight: "Verified automatic shutdown sensor response; parsed local inspection schedules to pre-stage NA Tacoma depot cargo release."
  }
};

export default function HealthMonitorTable({ rowData = [], loading = true, selectedCategory = null, onSelectCategory }) {
  const [selectedTier, setSelectedTier] = useState("ALL");
  const [inspectedRow, setInspectedRow] = useState(null);
  
  // Interactive mock playbook states
  const [isGenerating, setIsGenerating] = useState(false);
  const [playbookGenerated, setPlaybookGenerated] = useState(false);
  const [loadingLines, setLoadingLines] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);

  // Interactive C-suite feedback states
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackOption, setFeedbackOption] = useState(null);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Reset states upon inspection target change
  useEffect(() => {
    setSelectedOptions([]);
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
    : rowData.filter(row => row.tier === selectedTier);

  // Apply C-Suite category taxonomy filtering if active!
  const taxonomyFilteredRows = selectedCategory 
    ? filteredRows.filter(row => getTaxonomy(row.id) === selectedCategory)
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
      const aVal = parseFloat(a.severity.label) || 0;
      const bVal = parseFloat(b.severity.label) || 0;
      return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
    }

    if (sortConfig.key === "likelihood") {
      const aVal = parseInt(a.likelihood.label) || 0;
      const bVal = parseInt(b.likelihood.label) || 0;
      return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
    }

    if (sortConfig.key === "timeToHit") {
      const weights = { "Immediate": 4, "1-2 weeks": 3, "2-4 weeks": 2, "1-2 months": 1 };
      const aVal = weights[a.timeToHit] || 0;
      const bVal = weights[b.timeToHit] || 0;
      return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
    }

    return 0;
  });

  const renderSortIndicator = (key) => {
    if (sortConfig.key !== key) return <span className="text-slate-300 ml-1 select-none font-normal">⇅</span>;
    return sortConfig.direction === "asc" ? <span className="text-[#86BC25] ml-1 select-none font-bold">▲</span> : <span className="text-[#86BC25] ml-1 select-none font-bold">▼</span>;
  };

  // Triggers mock telemetry loading logs in terminal
  const handleGeneratePlaybook = (row) => {
    setIsGenerating(true);
    setLoadingLines([]);
    
    const logs = [
      "⚡ CONNECTING TO RADAR MITIGATION ENGINE...",
      "🔍 EXTRACTING RELEVANT DATA SCHEMA FOR " + row.id,
      "🤖 ANALYZING GEOSPATIAL SIGNAL FOOTPRINTS...",
      "🔄 CALCULATING OPTIMAL LOGISTICS WORKAROUNDS...",
      "📈 QUERYING DOMESTIC INVENTORY BUFFER CODES...",
      "✅ MITIGATION PLAYBOOK COMPILED SUCCESSFULLY!"
    ];

    logs.forEach((line, index) => {
      setTimeout(() => {
        setLoadingLines(prev => [...prev, line]);
        if (index === logs.length - 1) {
          setTimeout(() => {
            setIsGenerating(false);
            setPlaybookGenerated(true);
          }, 400);
        }
      }, (index + 1) * 350);
    });
  };

  const cSuiteEnrichment = inspectedRow ? nodeCSuiteData[inspectedRow.id] : null;

  // Simulator calculations
  let simulatedTimelineDays = cSuiteEnrichment ? cSuiteEnrichment.baseTimelineDays : 0;
  let simulatedWorkaroundCost = cSuiteEnrichment ? cSuiteEnrichment.baseWorkaroundCost : 0;

  if (cSuiteEnrichment) {
    selectedOptions.forEach(optId => {
      const option = cSuiteEnrichment.options.find(o => o.id === optId);
      if (option) {
        simulatedTimelineDays = Math.max(0.5, simulatedTimelineDays - option.daysSaved);
        simulatedWorkaroundCost += option.cost;
      }
    });
  }

  const simulatedTotalExposure = cSuiteEnrichment 
    ? simulatedTimelineDays * cSuiteEnrichment.baseDailyExposure 
    : 0;

  const totalFinancialAtRisk = cSuiteEnrichment 
    ? (cSuiteEnrichment.baseTimelineDays * cSuiteEnrichment.baseDailyExposure) 
    : 0;

  const financialSaved = Math.max(0, totalFinancialAtRisk - simulatedTotalExposure - (simulatedWorkaroundCost - (cSuiteEnrichment ? cSuiteEnrichment.baseWorkaroundCost : 0)));

  const renderPipeline = (row) => {
    const pipeline = nodePipelineData[row.id];
    if (!pipeline) return null;

    return (
      <div className="border border-slate-800 bg-[#121724] p-4 flex flex-col gap-4">
        <div>
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#86BC25] font-mono flex items-center gap-1.5">
            <Radio className="h-4 w-4 text-[#86BC25] animate-pulse" />
            📡 Agent Signal Ingestion Pipeline
          </h4>
          <p className="text-[9px] text-slate-400 mt-0.5">
            Real-time crawling and AI Agent extraction pipeline tracking.
          </p>
        </div>

        {/* Visual Pipeline Nodes */}
        <div className="flex flex-col gap-3 font-sans text-xs">
          {/* Phase 1: Active Crawlers */}
          <div className="relative flex gap-3 pl-1.5">
            {/* Visual connector line */}
            <div className="absolute left-[9px] top-6 bottom-0 w-[1px] border-l border-dashed border-[#86BC25]/40" />
            
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-none bg-[#86BC25]/10 border border-[#86BC25]/30">
              <Globe className="h-3 w-3 text-[#86BC25]" />
            </div>
            
            <div className="flex-1 flex flex-col gap-1.5">
              <span className="font-mono text-[8px] font-bold text-slate-400 uppercase tracking-wider">
                Phase 1: Active Crawler Ingestion Feeds
              </span>
              <div className="flex flex-col gap-2">
                {pipeline.crawlers.map((c, i) => {
                  return (
                    <div key={i} className="bg-[#161C2C] border border-[#1E293B] p-2 flex items-start gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#86BC25] mt-1.5 shrink-0 animate-ping" />
                      <div className="text-[10px]">
                        <span className="font-bold text-slate-200 block font-mono text-[9px] uppercase tracking-wide">{c.type}</span>
                        <p className="text-slate-400 mt-0.5 font-sans leading-relaxed text-[10px]">{c.detail}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Phase 2: Agent Parsing & Synthesis */}
          <div className="flex gap-3 pl-1.5">
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-none bg-sky-500/10 border border-sky-500/30">
              <Cpu className="h-3 w-3 text-sky-400 animate-spin animate-duration-1000" style={{ animationDuration: '4s' }} />
            </div>
            <div className="flex-1 flex flex-col gap-1.5">
              <span className="font-mono text-[8px] font-bold text-slate-400 uppercase tracking-wider">
                Phase 2: LLM Agent Semantic Synthesis
              </span>
              <div className="bg-[#161C2C] border border-[#1E293B] p-2 text-[10px] leading-relaxed">
                <span className="font-bold text-sky-400 block font-mono text-[9px] uppercase tracking-wide">NLP Synthesis Core</span>
                <p className="text-slate-300 mt-0.5 font-sans leading-relaxed text-[10px]">{pipeline.agentInsight}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderFeedbackSuite = (row) => {
    return (
      <div className="border border-slate-800 bg-[#121724] p-4 flex flex-col gap-3">
        <div>
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-[#86BC25]" />
            Playbook Governance Feedback
          </h4>
          <p className="text-[9px] text-slate-400 mt-0.5">
            Submit assessment feedback to align autonomous agent weights.
          </p>
        </div>

        {feedbackSubmitted ? (
          <div className="bg-[#86BC25]/10 border border-[#86BC25]/20 p-3 text-center flex flex-col items-center justify-center gap-2 animate-fade-in select-none">
            <CheckCircle className="h-6 w-6 text-[#86BC25] animate-bounce" />
            <div className="text-[10px] font-mono font-bold text-[#86BC25] uppercase tracking-wider">
              FEEDBACK COMMITTED SUCCESSFULLY
            </div>
            <p className="text-[9px] text-slate-300 max-w-xs leading-relaxed font-sans mt-0.5">
              Operational logs and rating model weights successfully routed to AI Agent tuning queue. Thank you.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Interactive Stars Rating */}
            <div className="flex items-center gap-1.5 select-none justify-between border-b border-[#1E293B] pb-2">
              <span className="text-[9px] font-mono text-slate-400 uppercase">Strategic Accuracy:</span>
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
                          : "text-slate-600 hover:text-slate-400"
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
                    ? "bg-[#86BC25] border-[#86BC25] text-black border-transparent"
                    : "bg-transparent border-slate-700 hover:border-slate-500 text-slate-300"
                }`}
              >
                <ThumbsUp className="h-3 w-3" />
                Accurate
              </button>
              <button
                onClick={() => setFeedbackOption("Refinement")}
                className={`flex-1 cursor-pointer font-mono text-[9px] font-bold uppercase py-1 border flex items-center justify-center gap-1 transition-all duration-75 select-none ${
                  feedbackOption === "Refinement"
                    ? "bg-amber-500 border-amber-500 text-black border-transparent"
                    : "bg-transparent border-slate-700 hover:border-slate-500 text-slate-300"
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
              className="w-full bg-[#0D111A] border border-slate-800 p-2 text-[10px] text-slate-200 placeholder-slate-600 rounded-none focus:outline-none focus:border-slate-600 font-sans leading-normal resize-none h-14"
            />

            {/* Submit CTA */}
            <button
              onClick={() => {
                if (feedbackRating === 0 && !feedbackOption && !feedbackComment) return;
                setFeedbackSubmitted(true);
              }}
              disabled={feedbackRating === 0 && !feedbackOption && !feedbackComment}
              className={`w-full cursor-pointer font-mono text-[9px] font-bold uppercase py-2 border select-none transition-all duration-75 ${
                feedbackRating === 0 && !feedbackOption && !feedbackComment
                  ? "bg-slate-800 border-slate-800 text-slate-600 cursor-not-allowed"
                  : "bg-white border-white text-black hover:bg-[#86BC25] hover:border-[#86BC25] hover:text-black"
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
      className="relative rounded-none bg-white p-4 border border-slate-200 shadow-none font-sans"
    >
      {/* ── Title and Table Settings Header ── */}
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5 font-sans">
            <span className="h-1.5 w-1.5 bg-[#86BC25]" />
            Network Node Threat Registry
          </h2>
          <p className="text-[10px] text-slate-500 mt-0.5 font-mono">
            OPERATIONAL THREAT MATRIX — SECURE REAL-TIME DATA STREAM
          </p>
        </div>

        {/* Dense Filters Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {selectedCategory && (
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 text-[#86BC25] font-mono text-[9px] px-2.5 py-0.5 select-none font-bold uppercase animate-fade-in">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#86BC25] opacity-75"></span>
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#86BC25]"></span>
              </span>
              Focus: {selectedCategory}
              <button 
                onClick={() => onSelectCategory(null)}
                className="hover:text-white cursor-pointer ml-1 font-bold font-mono text-[9px]"
              >
                [X]
              </button>
            </div>
          )}

          {/* Tier Filter Toggle */}
          <div className="flex border border-slate-300 font-mono text-[9px] bg-white select-none">
            {["ALL", "Tier 0", "Tier 1", "Tier 2"].map((tier) => (
              <button
                key={tier}
                onClick={() => setSelectedTier(tier)}
                className={`px-2.5 py-0.5 border-r border-slate-300 last:border-0 cursor-pointer uppercase transition-colors duration-75
                           ${selectedTier === tier 
                             ? "bg-slate-800 text-white font-bold" 
                             : "bg-white text-slate-600 hover:bg-slate-50"}`}
              >
                {tier}
              </button>
            ))}
          </div>

          <button
            id="table-date-filter"
            className="flex cursor-pointer items-center gap-1 rounded-none border border-slate-300
                       bg-white px-2.5 py-0.5 text-[9px] font-mono font-medium text-slate-700 hover:border-slate-500 hover:bg-slate-50 select-none"
          >
            <Calendar className="h-3 w-3 text-slate-400" />
            Q2 2026
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>
        </div>
      </div>

      {/* ── Boardroom Terminal Registry Table ── */}
      <div className="overflow-x-auto">
        <table id="health-monitor-table" className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-slate-300 bg-slate-50 font-mono text-[9px] uppercase tracking-wider text-slate-500 select-none">
              <th className="py-2 px-3 w-6 text-left">
                <input
                  type="checkbox"
                  className="h-3 w-3 rounded-none border-slate-300 accent-[#86BC25] cursor-pointer"
                />
              </th>
              <th 
                onClick={() => requestSort("id")}
                className="py-2 px-3 w-20 text-left font-bold cursor-pointer hover:bg-slate-100 hover:text-slate-800 transition-colors duration-75 select-none"
              >
                Node ID {renderSortIndicator("id")}
              </th>
              <th 
                onClick={() => requestSort("facility")}
                className="py-2 px-3 w-52 text-left font-bold cursor-pointer hover:bg-slate-100 hover:text-slate-800 transition-colors duration-75 select-none"
              >
                Facility / Region {renderSortIndicator("facility")}
              </th>
              <th className="py-2 px-3 text-left font-bold">Disruption Signal</th>
              <th 
                onClick={() => requestSort("severity")}
                className="py-2 px-3 w-36 text-right font-bold font-mono cursor-pointer hover:bg-slate-100 hover:text-slate-800 transition-colors duration-75 select-none"
              >
                Risk Severity {renderSortIndicator("severity")}
              </th>
              <th 
                onClick={() => requestSort("likelihood")}
                className="py-2 px-3 w-32 text-right font-bold font-mono cursor-pointer hover:bg-slate-100 hover:text-slate-800 transition-colors duration-75 select-none"
              >
                Likelihood {renderSortIndicator("likelihood")}
              </th>
              <th 
                onClick={() => requestSort("timeToHit")}
                className="py-2 px-3 w-28 text-right font-bold font-mono cursor-pointer hover:bg-slate-100 hover:text-slate-800 transition-colors duration-75 select-none"
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
                    className={`group transition-all duration-300 ease-out font-sans text-xs text-slate-800 border-l-2 cursor-pointer
                               ${isHighlighted 
                                 ? "bg-[#86BC25]/15 border-l-[#86BC25]" 
                                 : "border-l-transparent even:bg-[#F8FAFC] hover:bg-slate-100/75"}`}
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
                  <td className="py-1.5 px-3 align-middle font-mono text-[10px] text-slate-500 font-semibold">
                    {row.id}
                  </td>

                  {/* Facility / Location */}
                  <td className="py-1.5 px-3 align-middle">
                    <div className="font-semibold text-slate-900 leading-tight">{row.facility}</div>
                    <div className="text-[9px] text-slate-400 font-mono mt-0.5">{row.location} &bull; {row.tier}</div>
                  </td>

                  {/* Disruption Description */}
                  <td className="py-1.5 px-3 align-middle text-slate-600 max-w-sm overflow-hidden text-ellipsis leading-tight font-sans">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className={`inline-block font-mono text-[8px] px-1.5 py-0.5 border select-none leading-none rounded-none uppercase font-bold tracking-wider ${
                        getTaxonomy(row.id) === "Logistics & Transit" ? "bg-red-50 text-red-600 border-red-200" :
                        getTaxonomy(row.id) === "Operations & Capacity" ? "bg-amber-50 text-amber-600 border-amber-200" :
                        getTaxonomy(row.id) === "Regulatory & Quality" ? "bg-sky-50 text-sky-600 border-sky-200" :
                        "bg-[#86BC25]/10 text-[#86BC25] border-[#86BC25]/20"
                      }`}>
                        {getTaxonomy(row.id)}
                      </span>
                      <span>{row.disruption}</span>
                    </div>
                  </td>

                  {/* Risk Severity Badge (Right-aligned numeric) */}
                  <td className="py-1.5 px-3 align-middle text-right">
                    <span
                      className={`inline-block border rounded-none px-2 py-0.5 text-[9px] font-mono font-bold tracking-wider ${row.severity.color}`}
                    >
                      {row.severity.label}
                    </span>
                  </td>

                  {/* Likelihood Badge (Right-aligned numeric) */}
                  <td className="py-1.5 px-3 align-middle text-right">
                    <span
                      className={`inline-block border rounded-none px-2 py-0.5 text-[9px] font-mono font-bold tracking-wider ${row.likelihood.color}`}
                    >
                      {row.likelihood.label}
                    </span>
                  </td>

                  {/* Time to hit (Right-aligned numeric/text) */}
                  <td className="py-1.5 px-3 align-middle text-right font-mono text-[10px] font-semibold text-slate-600">
                    {row.timeToHit}
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

      {/* ── 5. Detail Drawer Overlay (Deloitte Dark Aesthetic Panel) ── */}
      {inspectedRow && (
        <>
          {/* Backdrop */}
          <div 
            onClick={handleClosePanel}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px] transition-opacity duration-150"
          />

          {/* Drawer Panel - Dynamically expands for playbook view */}
          <div
            id="threat-drawer"
            className={`fixed top-0 right-0 bottom-0 z-50 bg-[#0D111A] border-l border-[#1E293B] shadow-2xl p-6 overflow-y-auto text-white flex flex-col font-sans transition-all duration-500 ease-in-out ${
              playbookGenerated 
                ? "w-full md:w-[780px] lg:w-[1000px] xl:w-[1200px]" 
                : "w-full sm:w-[480px]"
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-4 mb-4 select-none">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 bg-[#D32F2F]" />
                <span className="font-mono text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  THREAT CLASSIFICATION INSPECTOR
                </span>
              </div>
              <button
                onClick={handleClosePanel}
                className="flex items-center gap-1 border border-slate-700 px-2 py-0.5 text-[9px] font-mono text-slate-400 hover:text-white hover:border-slate-500 cursor-pointer"
              >
                <X className="h-3 w-3" />
                CLOSE [ESC]
              </button>
            </div>

            {/* Core Info */}
            <div className="flex flex-col gap-1 mb-4 select-none">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold font-sans tracking-tight text-white">{inspectedRow.id}</span>
                <span className="text-[10px] font-mono text-[#86BC25] uppercase tracking-wider">{inspectedRow.tier} NODE</span>
              </div>
              <p className="text-base font-semibold text-slate-100">{inspectedRow.facility}</p>
              <p className="text-xs text-slate-400 font-mono">{inspectedRow.location}</p>
            </div>

            {/* Severity and Likelihood Grid (Only shown when not displaying playbook to reduce noise) */}
            {!playbookGenerated && (
              <div className="grid grid-cols-3 gap-2 mb-5 select-none font-mono text-[10px]">
                <div className="border border-slate-800 bg-[#111520] p-2.5 flex flex-col justify-between">
                  <span className="text-slate-500 font-bold uppercase tracking-wider">SEVERITY</span>
                  <span className="text-white font-bold text-[11px] mt-1">{inspectedRow.severity.label.split(" ")[0]}</span>
                </div>
                <div className="border border-slate-800 bg-[#111520] p-2.5 flex flex-col justify-between">
                  <span className="text-slate-500 font-bold uppercase tracking-wider">LIKELIHOOD</span>
                  <span className="text-white font-bold text-[11px] mt-1">{inspectedRow.likelihood.label.split(" ")[0]}</span>
                </div>
                <div className="border border-slate-800 bg-[#111520] p-2.5 flex flex-col justify-between">
                  <span className="text-slate-500 font-bold uppercase tracking-wider">TIME TO HIT</span>
                  <span className="text-white font-bold text-[11px] mt-1">{inspectedRow.timeToHit}</span>
                </div>
              </div>
            )}

            {/* Detailed Description (Only shown when not displaying playbook) */}
            {!playbookGenerated && (
              <div className="border-t border-[#1E293B] pt-4 mb-4">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#86BC25] font-mono mb-1.5 flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5" />
                  Full Risk Description
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">{inspectedRow.fullDescription}</p>
              </div>
            )}

            {/* Signal Origin Pipeline (Only shown when not displaying playbook) */}
            {!playbookGenerated && (
              <div className="border-t border-[#1E293B] pt-4 mb-4">
                {renderPipeline(inspectedRow)}
              </div>
            )}

            {/* ── Mitigation Playbook CTAs ── */}
            <div className={`flex flex-col gap-3 ${!playbookGenerated ? "mt-auto border-t border-[#1E293B] pt-4" : ""}`}>
              {!playbookGenerated && !isGenerating && (
                <button
                  onClick={() => handleGeneratePlaybook(inspectedRow)}
                  className="w-full cursor-pointer border border-[#86BC25] bg-[#86BC25] text-black font-bold uppercase tracking-wider text-[10px] py-2.5 rounded-none hover:bg-white hover:border-white transition-colors duration-75"
                >
                  Generate Mitigation Playbook
                </button>
              )}

              {/* ── LOADING TELEMETRY STATE ── */}
              {isGenerating && (
                <div className="w-full bg-[#111520] border border-slate-800 p-4 font-mono text-[9px] text-[#86BC25] flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="h-3 w-3 rounded-none border border-dashed border-[#86BC25] animate-spin" />
                    <span className="font-bold uppercase tracking-wider">AGENT PROCESSING RISK FEEDS...</span>
                  </div>
                  {loadingLines.map((line, i) => (
                    <div key={i} className="animate-fade-in leading-relaxed">
                      {line}
                    </div>
                  ))}
                </div>
              )}

              {/* ── PLAYBOOK VIEW RENDER ── */}
              {playbookGenerated && (
                <div className="w-full flex flex-col gap-6 animate-fade-in text-slate-300">
                  {/* Playbook Header Ribbon */}
                  <div className="flex flex-col gap-1 border-b border-slate-800 pb-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold text-[#86BC25] uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle className="h-4 w-4" />
                        ✅ BOARD-LEVEL DECISION SUPPORT ACTIVE
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 bg-[#161C2C] px-2 py-0.5 border border-slate-800">
                        REF: {inspectedRow.id}-STRATEGIC-PLAYBOOK-v5.0
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#86BC25] animate-ping" />
                      <p className="text-[10px] font-sans text-slate-400">
                        Authorized Executive Escalation Level: <span className="text-white font-semibold">Tier-1 (CEO & CFO Sign-Off Recommended)</span>
                      </p>
                    </div>
                  </div>

                  {/* C-Suite Executive Telemetry Dashboard */}
                  {cSuiteEnrichment && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {/* KPI Card 1: Revenue at Risk */}
                      <div className="border border-slate-800 bg-[#111520] p-4 flex flex-col justify-between rounded-none relative overflow-hidden group">
                        <div className="absolute right-0 top-0 translate-x-2 -translate-y-2 opacity-5 select-none text-red-500">
                          <DollarSign className="h-20 w-20" />
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[9px] font-bold uppercase tracking-wider">
                          <AlertTriangle className="h-3 w-3 text-red-500" />
                          Mitigated Revenue Risk
                        </div>
                        <div className="mt-2 text-2xl font-bold font-sans tracking-tight text-white">
                          ${(simulatedTotalExposure / 1000000).toFixed(1)}M
                        </div>
                        <div className="text-[9px] text-slate-400 font-sans mt-1">
                          Base Exposure: <span className="text-red-400 font-semibold font-mono">${(totalFinancialAtRisk / 1000000).toFixed(1)}M</span>
                        </div>
                      </div>

                      {/* KPI Card 2: Total Mitigation CapEx */}
                      <div className="border border-[#86BC25]/20 bg-[#111520] p-4 flex flex-col justify-between rounded-none relative overflow-hidden group">
                        <div className="absolute right-0 top-0 translate-x-2 -translate-y-2 opacity-5 select-none text-[#86BC25]">
                          <Activity className="h-20 w-20" />
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[9px] font-bold uppercase tracking-wider">
                          <DollarSign className="h-3 w-3 text-[#86BC25]" />
                          Mitigation CapEx
                        </div>
                        <div className="mt-2 text-2xl font-bold font-sans tracking-tight text-[#86BC25]">
                          ${(simulatedWorkaroundCost / 1000).toFixed(0)}K
                        </div>
                        <div className="text-[9px] text-slate-400 font-sans mt-1">
                          Base Cost: <span className="text-slate-300 font-semibold font-mono">${(cSuiteEnrichment.baseWorkaroundCost / 1000).toFixed(0)}K</span>
                        </div>
                      </div>

                      {/* KPI Card 3: Est. Recovery Timeline */}
                      <div className="border border-slate-800 bg-[#111520] p-4 flex flex-col justify-between rounded-none relative overflow-hidden group">
                        <div className="absolute right-0 top-0 translate-x-2 -translate-y-2 opacity-5 select-none text-slate-500">
                          <Clock className="h-20 w-20" />
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[9px] font-bold uppercase tracking-wider">
                          <Clock className="h-3 w-3 text-sky-400" />
                          Est. Recovery Cycle
                        </div>
                        <div className="mt-2 text-2xl font-bold font-sans tracking-tight text-white">
                          {simulatedTimelineDays.toFixed(1)} Days
                        </div>
                        <div className="text-[9px] text-slate-400 font-sans mt-1">
                          Base Cycle: <span className="text-slate-300 font-semibold font-mono">{cSuiteEnrichment.baseTimelineDays} Days</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Net Financial Risk Avoided Alert Banner */}
                  {cSuiteEnrichment && financialSaved > 0 && (
                    <div className="border border-[#86BC25]/30 bg-[#86BC25]/10 p-3 flex items-center justify-between rounded-none animate-pulse">
                      <div className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-[#86BC25]" />
                        <div>
                          <div className="text-[10px] font-mono font-bold text-[#86BC25] uppercase tracking-wider">
                            NET FINANCIAL RISK AVOIDANCE (SIMULATED ROI)
                          </div>
                          <div className="text-[9px] text-slate-300 mt-0.5">
                            Decisive deployment of response options avoids major supply chain interruption losses.
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold font-mono text-[#86BC25] block">
                          +${(financialSaved / 1000000).toFixed(2)}M
                        </span>
                        <span className="text-[8px] font-mono text-slate-400 uppercase">CAPITAL PROTECTED</span>
                      </div>
                    </div>
                  )}

                  {/* Main Grid: Options Simulator on Left, Narrative & Governance on Right */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* LEFT COLUMN: SIMULATOR & TIMELINE (lg:col-span-7) */}
                    <div className="lg:col-span-7 flex flex-col gap-6">
                      
                      {/* Playbook Scenario Simulator */}
                      {cSuiteEnrichment && (
                        <div className="border border-slate-800 bg-[#121724] p-4 flex flex-col gap-3">
                          <div>
                            <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#86BC25] font-mono flex items-center gap-1.5">
                              <PlayCircle className="h-4 w-4" />
                              Boardroom Response Scenario Simulator
                            </h4>
                            <p className="text-[9px] text-slate-400 mt-0.5">
                              Check mitigation tactics to model operational cost-benefit trade-offs in real-time.
                            </p>
                          </div>

                          <div className="flex flex-col gap-2 mt-1">
                            {cSuiteEnrichment.options.map(opt => {
                              const isSelected = selectedOptions.includes(opt.id);
                              return (
                                <div
                                  key={opt.id}
                                  onClick={() => {
                                    if (isSelected) {
                                      setSelectedOptions(prev => prev.filter(id => id !== opt.id));
                                    } else {
                                      setSelectedOptions(prev => [...prev, opt.id]);
                                    }
                                  }}
                                  className={`border p-3 flex items-start gap-3 cursor-pointer select-none transition-all duration-100 ${
                                    isSelected
                                      ? "bg-[#86BC25]/5 border-[#86BC25] text-white"
                                      : "bg-[#161C2C]/50 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-[#161C2C]"
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => {}} // Controlled in parent onClick
                                    className="mt-0.5 h-3.5 w-3.5 rounded-none border-slate-700 accent-[#86BC25] cursor-pointer"
                                  />
                                  <div className="flex-1 flex flex-col gap-0.5">
                                    <div className="flex items-center justify-between">
                                      <span className="font-semibold text-xs text-white leading-none">{opt.label}</span>
                                      <div className="flex gap-2 font-mono text-[9px] font-bold">
                                        <span className="text-[#86BC25]">-${opt.daysSaved} Days</span>
                                        <span className="text-slate-400">|</span>
                                        <span className="text-slate-300">+${(opt.cost / 1000).toFixed(0)}K CapEx</span>
                                      </div>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-1 leading-normal font-sans">{opt.desc}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Strategic Action Plan (Immediate, Tactical, Policy) */}
                      <div className="border border-slate-800 bg-[#121724] p-4 flex flex-col gap-4">
                        <div>
                          <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#86BC25] font-mono flex items-center gap-1.5">
                            <FileText className="h-4 w-4" />
                            Prioritized Strategic Action Plan
                          </h4>
                          <p className="text-[9px] text-slate-400 mt-0.5">
                            Standard Operating Procedures (SOP) mapped across time horizons to secure the node.
                          </p>
                        </div>

                        {cSuiteEnrichment && (
                          <div className="flex flex-col gap-4 font-sans text-xs">
                            {/* Phase 1 */}
                            <div className="flex gap-3 border-l-2 border-[#86BC25] pl-3 py-0.5">
                              <div className="flex-1 flex flex-col gap-1">
                                <span className="font-mono text-[9px] font-bold text-[#86BC25] uppercase tracking-wider">
                                  PHASE 1 &bull; IMMEDIATE CONTAINMENT (0 - 48 HOURS)
                                </span>
                                <p className="text-slate-200 leading-relaxed font-sans text-[11px]">
                                  {cSuiteEnrichment.strategicPhases.immediate}
                                </p>
                              </div>
                            </div>

                            {/* Phase 2 */}
                            <div className="flex gap-3 border-l-2 border-sky-500 pl-3 py-0.5">
                              <div className="flex-1 flex flex-col gap-1">
                                <span className="font-mono text-[9px] font-bold text-sky-400 uppercase tracking-wider">
                                  PHASE 2 &bull; ALTERNATE ROUTING & RE-SOURCING (48H - 2 WEEKS)
                                </span>
                                <p className="text-slate-200 leading-relaxed font-sans text-[11px]">
                                  {cSuiteEnrichment.strategicPhases.tactical}
                                </p>
                              </div>
                            </div>

                            {/* Phase 3 */}
                            <div className="flex gap-3 border-l-2 border-slate-700 pl-3 py-0.5">
                              <div className="flex-1 flex flex-col gap-1">
                                <span className="font-mono text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                                  PHASE 3 &bull; CAPITAL POLICY & RESILIENCY ADJUSTMENT
                                </span>
                                <p className="text-slate-300 leading-relaxed font-sans text-[11px]">
                                  {cSuiteEnrichment.strategicPhases.structural}
                                </p>
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
                      
                      {/* Executive Governance & SLA risk briefing */}
                      {cSuiteEnrichment && (
                        <div className="border border-slate-800 bg-[#121724] p-4 flex flex-col gap-3">
                          <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                            Executive Governance & Risk Briefing
                          </h4>
                          
                          <div className="flex flex-col gap-3 text-xs">
                            <div className="flex flex-col gap-1 border-b border-slate-800 pb-2">
                              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">SLA & Contractual Exposure</span>
                              <p className="text-slate-300 leading-snug font-sans text-[10px]">
                                {cSuiteEnrichment.slaRisk}
                              </p>
                            </div>

                            <div className="flex flex-col gap-1 border-b border-slate-800 pb-2">
                              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">Evidence-Based Risk Foundation</span>
                              <p className="text-slate-300 leading-snug font-sans text-[10px]">
                                {cSuiteEnrichment.evidenceBase}
                              </p>
                            </div>

                            <div className="flex flex-col gap-1.5 pt-1">
                              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">Compliance & Capital Threshold Check</span>
                              <div className="flex items-center justify-between bg-[#161C2C] border border-slate-800 p-2 font-mono text-[9px]">
                                <span className="text-slate-400">Expedited CapEx Limits:</span>
                                <span className="text-white font-bold">$1,000,000</span>
                              </div>
                              <div className="flex items-center justify-between bg-[#161C2C] border border-slate-800 p-2 font-mono text-[9px]">
                                <span className="text-slate-400">Projected Run Cost:</span>
                                <span className={`font-bold ${simulatedWorkaroundCost > 1000000 ? "text-red-400" : "text-[#86BC25]"}`}>
                                  ${simulatedWorkaroundCost.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 mt-1 border border-slate-800 p-2 bg-[#161C2C]/50 font-mono text-[9px]">
                                <span className={`h-2 w-2 rounded-full ${simulatedWorkaroundCost > 1000000 ? "bg-amber-500 animate-pulse" : "bg-[#86BC25]"}`} />
                                <span className="text-slate-300 leading-snug">
                                  {simulatedWorkaroundCost > 1000000 
                                    ? "⚠️ ALERT: Board CapEx Threshold Exceeded. Financial Committee notification sent." 
                                    : "✅ COMPLIANT: Under Board CapEx threshold."}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Crisis Task Force stakeholder escalation */}
                      <div className="border border-slate-800 bg-[#121724] p-4 flex flex-col gap-3">
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
                          <Users className="h-4 w-4 text-[#86BC25]" />
                          Crisis Task Force Escalation
                        </h4>
                        
                        <div className="flex flex-col gap-2">
                          {inspectedRow.playbook.contacts.map((contact, idx) => (
                            <div key={idx} className="border border-slate-800 bg-[#161C2C] p-3 text-[10px] leading-tight flex flex-col gap-2">
                              <div className="flex items-start justify-between">
                                <div>
                                  <div className="font-bold text-white font-sans text-xs">{contact.name}</div>
                                  <div className="text-slate-400 text-[9px] font-sans mt-0.5">{contact.role}</div>
                                </div>
                                <span className="text-[8px] font-mono text-[#86BC25] border border-[#86BC25]/20 bg-[#86BC25]/5 px-1.5 py-0.5 tracking-wider uppercase font-semibold">
                                  ACTIVE RESPONDER
                                </span>
                              </div>
                              
                              <div className="border-t border-slate-800 pt-2 flex items-center justify-between font-mono text-[9px] text-[#86BC25]">
                                <span>{contact.email}</span>
                                <span className="text-slate-500">&bull;</span>
                                <span>{contact.phone}</span>
                              </div>

                              <div className="flex gap-1.5 mt-1">
                                <a 
                                  href={`mailto:${contact.email}?subject=ESCALATION - Urgent Decision Support Required for ${inspectedRow.id}`}
                                  className="flex-1 text-center font-mono text-[8px] font-bold uppercase py-1 border border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white transition-colors duration-75"
                                >
                                  📧 Email Alert
                                </a>
                                <button
                                  onClick={() => alert(`Direct MS Teams ping dispatched to ${contact.name} regarding urgent crisis resolution.`)}
                                  className="flex-1 text-center font-mono text-[8px] font-bold uppercase py-1 border border-[#86BC25] bg-[#86BC25] text-black hover:bg-white hover:border-white transition-colors duration-75"
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
                      <div className="border border-slate-800 bg-[#121724] p-3 flex flex-col gap-1.5 select-none font-mono text-[8px]">
                        <span className="text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1">
                          <Terminal className="h-3.5 w-3.5" />
                          Raw Telemetry Source Ingestion
                        </span>
                        <div className="bg-[#0B0D14] border border-slate-900 p-2 text-[#86BC25] break-all leading-normal">
                          {inspectedRow.sourceData}
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
