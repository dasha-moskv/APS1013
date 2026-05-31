import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import MapPlaceholder from "./components/MapPlaceholder";
import KpiCards from "./components/KpiCards";
import HealthMonitorTable from "./components/HealthMonitorTable";
import SignalTaxonomy from "./components/SignalTaxonomy";

// New Phase Components
import BaseIngest from "./components/BaseIngest";
import MitigationPlaybooks from "./components/MitigationPlaybooks";
import ActionOrchestration from "./components/ActionOrchestration";
import AIJudgeGovernance from "./components/AIJudgeGovernance";

// High-fidelity mock signals representing live incoming risk events
const MOCK_SIGNALS = [
  {
    id: "SUP-404R",
    facility: "Rolls-Royce plc",
    location: "Derby, GB",
    disruption: "Turbofan casing alloy defect identified in micro-CT scan",
    severity: { "label": "8.8/10 SEVERE", "color": "text-[#9A3412] bg-[#FFF7ED] border-[#FFEDD5]" },
    likelihood: { "label": "95% HIGH", "color": "text-[#991B1B] bg-[#FEF2F2] border-[#FEE2E2]" },
    timeToHit: "Immediate",
    tier: "Tier 1",
    fullDescription: "A micro-computed tomography (CT) scan at the Derby assembly plant detected a core density fluctuation in a batch of composite turbofan casing forgings. Assembly line operations for widebody engine components have been suspended to prevent structural casing fracture risk.",
    sourceData: "Nondestructive Inspection Feed: RR-DERBY-CT-901 & Quality Systems IoT Stream",
    mapPosition: {
      coordinates: [-1.4552, 52.8931],
      color: "#D32F2F",
      role: "Tier-1 / Turbofans",
      status: "Critical threat"
    },
    playbook: {
      steps: [
        "Quarantine affected turbine casing batch #RR-CT-8890.",
        "Reroute turbofan casing castings from secondary casting yard at Munich depot.",
        "Calibrate micro-CT imaging arrays with standard titanium benchmark controls."
      ],
      contacts: [
        { "name": "Sir Robert Vance", "role": "Chief Materials Officer", "email": "robert.vance@rolls-royce.com", "phone": "+44 1332-242424" },
        { "name": "Derby Quality Assurance Desk", "role": "Inspection Lead", "email": "qa.derby@rolls-royce.com", "phone": "+44 1332-240112" }
      ],
      timeline: "5 to 7 operational days for metallurgical recertification"
    }
  },
  {
    id: "SUP-512S",
    facility: "Safran Landing Systems",
    location: "Bidos, FR",
    disruption: "Hydraulic pressure testing valve seal failure in building 4",
    severity: { "label": "8.2/10 SEVERE", "color": "text-[#9A3412] bg-[#FFF7ED] border-[#FFEDD5]" },
    likelihood: { "label": "88% HIGH", "color": "text-[#9A3412] bg-[#FFF7ED] border-[#FFEDD5]" },
    timeToHit: "1-2 weeks",
    tier: "Tier 1",
    fullDescription: "High-pressure testing of main landing gear shock absorbers experienced a catastrophic valve seal failure, causing localized toxic hydraulic fluid spillage. Clean-up procedures are active, temporarily halting system testing runs in building 4.",
    sourceData: "SCADA Environmental Monitor Feed: SAFRAN-BIDOS-B4 & OEM Emerson Alerts",
    mapPosition: {
      coordinates: [-0.605, 43.181],
      color: "#D32F2F",
      role: "Tier-1 / Landing Gear",
      status: "Critical threat"
    },
    playbook: {
      steps: [
        "Deploy hazardous material cleanup shift to contain hydraulic spillage in building 4.",
        "Procure emergency shock absorber seal packs from storage backup stocks in Bordeaux.",
        "Authorize landing gear structural stress tests in parallel assembly building 6."
      ],
      contacts: [
        { "name": "Jean-Pierre Blanc", "role": "Bidos Safety Coordinator", "email": "jp.blanc@safrangroup.com", "phone": "+33 5-59-39-00-11" },
        { "name": "Hazmat Containment Desk", "role": "First Responder Desk", "email": "response@secourisme.fr", "phone": "+33 5-59-99-1122" }
      ],
      timeline: "48 to 72 hours for cleanroom validation and pressure test reset"
    }
  },
  {
    id: "SUP-771A",
    facility: "Alcoa of Australia Ltd",
    location: "Pinjarra, AU",
    disruption: "Bauxite conveyor belt structural snap, loading halted",
    severity: { "label": "6.0/10 ELEVATED", "color": "text-[#9A3412] bg-[#FFF7ED] border-[#FFEDD5]" },
    likelihood: { "label": "75% HIGH", "color": "text-[#9A3412] bg-[#FFF7ED] border-[#FFEDD5]" },
    timeToHit: "2-4 weeks",
    tier: "Tier 3",
    fullDescription: "Bauxite transport operations at the Pinjarra refinery have been suspended following a structural conveyor belt snap on the primary loading line. Raw aluminum refining output is throttled by 40% until belt splicing is complete.",
    sourceData: "Pinjarra IoT Mechanical Stress Feed: ALCOA-PINJ-CVY-08 & Local Maintenance Registry",
    mapPosition: {
      coordinates: [115.875, -32.628],
      color: "#FFB300",
      role: "Tier-3 / Raw Aluminum",
      status: "Elevated Risk"
    },
    playbook: {
      steps: [
        "Initiate emergency conveyor belt splicing contract with Fenner Dunlop Australia.",
        "Divert crude bauxite stocks to reserve stockpile yard B using heavy dumper fleets.",
        "Increase calcination heating runs on parallel kiln lines to mitigate process temperature drops."
      ],
      contacts: [
        { "name": "Garry Thorne", "role": "Pinjarra Refinery Maintenance Lead", "email": "g.thorne@alcoa.com.au", "phone": "+61 8-9531-2000" },
        { "name": "Fenner Dunlop Emergency Crew", "role": "Splicing Service Desk", "email": "emergency@fennerdunlop.com.au", "phone": "+61 1300-855-900" }
      ],
      timeline: "36 to 48 hours for vulcanized splicing and test runs"
    }
  },
  {
    id: "SUP-212H",
    facility: "Honeywell Aerospace",
    location: "Phoenix, AZ, US",
    disruption: "APU integration lines chemical bath contamination",
    severity: { "label": "7.9/10 SEVERE", "color": "text-[#9A3412] bg-[#FFF7ED] border-[#FFEDD5]" },
    likelihood: { "label": "70% HIGH", "color": "text-[#9A3412] bg-[#FFF7ED] border-[#FFEDD5]" },
    timeToHit: "Immediate",
    tier: "Tier 1",
    fullDescription: "A chemical bath used for coating auxiliary power unit (APU) turbine blades was flagged with an elevated contamination rating due to a leaking gasket. Turbine blade coating operations have been suspended to prevent structural delamination.",
    sourceData: "Honeywell Chemical Control System: PHX-CHEM-BATH-02 & Gasket Leak IoT Alert",
    mapPosition: {
      coordinates: [-112.0, 33.435],
      color: "#FFB300",
      role: "Tier-1 / APU Assemblies",
      status: "Elevated Risk"
    },
    playbook: {
      steps: [
        "Drain and flush chemical coating bath #2. Replace gasket seals on all chemical fluid lines.",
        "Divert APU turbine blade coating runs to reserve chemical array #4.",
        "Quarantine all turbine blades treated during the gasket leak timeline for ultrasound structural checks."
      ],
      contacts: [
        { "name": "Donna Vance", "role": "Phoenix Plant Integration Manager", "email": "donna.vance@honeywell.com", "phone": "+1 (602) 555-0988" },
        { "name": "Chemical Supply Hotline", "role": "Maintenance Partner Desk", "email": "facility-ops@honeywell.com", "phone": "+1 (602) 555-0900" }
      ],
      timeline: "48 hours for bath cleaning, seal replacement, and chemical validation"
    }
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState("radar");
  const [threatRows, setThreatRows] = useState([]);
  const [kpiData, setKpiData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(false);
  
  // Decoupled Decoded API States
  const [knowledgeGraph, setKnowledgeGraph] = useState(null);
  const [historicalPrecedents, setHistoricalPrecedents] = useState(null);
  const [erpSystems, setErpSystems] = useState(null);

  // Phase 2/3 States
  const [approvedPlaybooks, setApprovedPlaybooks] = useState({});
  const [feedbackHistory, setFeedbackHistory] = useState([]);

  const toggleDark = () => setIsDark(prev => !prev);
  
  const [demoIndex, setDemoIndex] = useState(0);
  const [toast, setToast] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);

  // Parallel Ingestion of threatRegistry, kpiData, and our three new decoupled core DBs
  useEffect(() => {
    Promise.all([
      fetch("/data/threatRegistry.json").then((res) => {
        if (!res.ok) throw new Error("Failed to fetch threat telemetry");
        return res.json();
      }),
      fetch("/data/kpiData.json").then((res) => {
        if (!res.ok) throw new Error("Failed to fetch KPI telemetry");
        return res.json();
      }),
      fetch("/data/knowledgeGraph.json").then((res) => {
        if (!res.ok) throw new Error("Failed to fetch knowledge graph");
        return res.json();
      }),
      fetch("/data/historicalPrecedents.json").then((res) => {
        if (!res.ok) throw new Error("Failed to fetch precedents");
        return res.json();
      }),
      fetch("/data/erpSystems.json").then((res) => {
        if (!res.ok) throw new Error("Failed to fetch ERP tables");
        return res.json();
      })
    ])
      .then(([threats, kpis, graph, precedents, erp]) => {
        const mappedThreats = threats.map(t => ({ ...t, ingestedAt: 0 }));
        setThreatRows(mappedThreats);
        setKpiData(kpis);
        setKnowledgeGraph(graph);
        setHistoricalPrecedents(precedents);
        setErpSystems(erp);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading unified telemetry databases:", err);
        setLoading(false);
      });
  }, []);

  // Callback from Phase 1 GeoJSON Ingest to populate new sub-tier threat logs
  const handleSupplyBaseInitialized = (programName, nodeCount) => {
    // Append a specialized Tier-2 shock matching the loaded program
    if (programName.includes("Renton")) {
      const parsedSignal = {
        id: "SUP-001A",
        facility: "Spirit AeroSystems, Inc.",
        location: "KS, US",
        disruption: "Renton fuselage transport logistics rail strike",
        severity: { "label": "8.5/10 SEVERE", "color": "text-[#9A3412] bg-[#FFF7ED] border-[#FFEDD5]" },
        likelihood: { "label": "85% HIGH", "color": "text-[#9A3412] bg-[#FFF7ED] border-[#FFEDD5]" },
        timeToHit: "1-2 weeks",
        tier: "Tier 1",
        fullDescription: "Fuselage assemblies rail transport is stalled within the Midwest corridor due to rail union strikes. Primary Renton assembly operations risk fuselage starvation in 10 operational days.",
        sourceData: "SCADA logistics webhook BNSF-KS-301 & Local labor RSS blogs",
        mapPosition: {
          coordinates: [-97.2798, 37.6436],
          color: "#D32F2F",
          role: "Tier-1 / Fuselage",
          status: "Critical threat"
        },
        playbook: {
          steps: [
            "Initiate emergency road oversize flatbed logistics carriers.",
            "Lobby KDOT and state governors for rapid oversized load highway corridor permits.",
            "Coordinate divided Renton assembly buffer allocations to preserve assembly cadence."
          ],
          contacts: [
            { "name": "Sarah Jenkins", "role": "Spirit Global Supply Lead", "email": "s.jenkins@spiritaero.com", "phone": "+1 (316) 555-0145" }
          ],
          timeline: "12 operational days for heavy haul permits and flatbed mobilization"
        },
        ingestedAt: Date.now()
      };

      setThreatRows(prev => {
        // Only append if it doesn't already exist in the frontend rows
        if (prev.some(t => t.id === parsedSignal.id)) return prev;
        return [parsedSignal, ...prev];
      });

      setToast({
        id: parsedSignal.id,
        msg: `BASE INITIALIZED: Ingested B737 MAX Renton Supply Grid. New sub-tier risk registered: ${parsedSignal.facility}`
      });

      setTimeout(() => setToast(null), 6000);
    }
  };

  // Callback from Phase 2 Workbench to register playbook approvals
  const handleApprovePlaybook = (threatId) => {
    setApprovedPlaybooks(prev => ({
      ...prev,
      [threatId]: true
    }));
    
    // Jump to the Action Orchestration screen immediately to execute!
    setTimeout(() => {
      setActiveTab("orchestration");
    }, 800);
  };

  // Callback from Home Threat Table feedback forms to dynamically log human reviews
  const handleHumanFeedback = (feedback) => {
    setFeedbackHistory(prev => [feedback, ...prev]);

    setToast({
      id: "GOVERNANCE",
      msg: `GOVERNANCE ACTION REGISTERED: Analyst feedback received for ${feedback.facility}. Real-aligning AI Judge scoring heuristics.`
    });

    setTimeout(() => setToast(null), 5000);
  };

  // Callback from Phase 3 Supplier Portal Simulator to trigger closed-loop score updates
  const handleSupplierResponse = (threatId, supplierStatus) => {
    setThreatRows(prevRows => 
      prevRows.map(row => {
        if (row.id === threatId) {
          if (supplierStatus === "mitigated") {
            return {
              ...row,
              disruption: `[RESOLVED BY WAREHOUSE BUFFER OVERRIDE] ${row.disruption}`,
              severity: { "label": "1.2/10 RESOLVED", "color": "text-[#16A34A] bg-[#F0FDF4] border-[#DCFCE7]" },
              likelihood: { "label": "0% NOMINAL", "color": "text-[#16A34A] bg-[#F0FDF4] border-[#DCFCE7]" },
              timeToHit: "Bypassed (0 Days)",
              mapPosition: {
                ...row.mapPosition,
                color: "#86BC25",
                status: "Nominal"
              }
            };
          } else if (supplierStatus === "partial") {
            return {
              ...row,
              disruption: `[PARTIALLY MITIGATED VIA HIGHWAY FLATS] ${row.disruption}`,
              severity: { "label": "4.5/10 ELEVATED", "color": "text-[#9A3412] bg-[#FFF7ED] border-[#FFEDD5]" },
              timeToHit: "3 Days Delay",
              mapPosition: {
                ...row.mapPosition,
                color: "#FFB300",
                status: "Elevated Risk"
              }
            };
          } else if (supplierStatus === "confirmed") {
            return {
              ...row,
              severity: { "label": "9.5/10 CRITICAL", "color": "text-[#991B1B] bg-[#FEF2F2] border-[#FEE2E2]" },
              mapPosition: {
                ...row.mapPosition,
                color: "#D32F2F",
                status: "Critical threat"
              }
            };
          }
        }
        return row;
      })
    );

    // Boardroom Math reactive update: Reduce at-risk metrics dynamically!
    setKpiData(prevKpi => 
      prevKpi.map(kpi => {
        if (kpi.id === "monitored-nodes") {
          const current = parseFloat(kpi.value.replace(/[^0-9.]/g, ""));
          const reduction = supplierStatus === "mitigated" ? 18.5 : supplierStatus === "partial" ? 12.0 : 0.0;
          return {
            ...kpi,
            value: `$${Math.max(4.5, current - reduction).toFixed(1)}M`,
            subtext: `-$${reduction.toFixed(1)}M liability offset from resolved supplier shock`
          };
        }
        if (kpi.id === "active-risks") {
          const current = parseInt(kpi.value);
          const reduction = supplierStatus === "mitigated" ? 1 : 0;
          return {
            ...kpi,
            value: `${Math.max(0, current - reduction)} Sites`,
            subtext: `Supplier portal confirmations matched and closed`
          };
        }
        if (kpi.id === "network-health") {
          const current = parseFloat(kpi.value.replace(/[^0-9.]/g, ""));
          const increment = supplierStatus === "mitigated" ? 4.8 : supplierStatus === "partial" ? 2.1 : -1.2;
          return {
            ...kpi,
            value: `${Math.min(99.8, current + increment).toFixed(1)}%`,
            subtext: `Realigned from closed-loop supplier portal response`
          };
        }
        return kpi;
      })
    );
  };

  // Simulates live satellite threat signals coming in and updates central state
  const handleTriggerDemoSignal = () => {
    if (demoIndex >= MOCK_SIGNALS.length) return;

    const signal = { ...MOCK_SIGNALS[demoIndex], ingestedAt: Date.now() };
    setDemoIndex(prev => prev + 1);

    // 1. Append new signal to the front of threat registry
    setThreatRows(prev => [signal, ...prev]);

    // 2. Parse and recalculate KPI scorecards reactively (boardroom math updates)
    setKpiData(prevKpi =>
      prevKpi.map(kpi => {
        if (kpi.id === "monitored-nodes") {
          const current = parseFloat(kpi.value.replace(/[^0-9.]/g, ""));
          const exposures = { "SUP-404R": 34.5, "SUP-512S": 22.4, "SUP-771A": 12.8, "SUP-212H": 18.2 };
          const addition = exposures[signal.id] || 15.0;
          return { 
            ...kpi, 
            value: `$${(current + addition).toFixed(1)}M`,
            subtext: `+$${addition.toFixed(1)}M added from new disruption`
          };
        }
        if (kpi.id === "active-risks") {
          const current = parseInt(kpi.value);
          const criticals = threatRows.filter(r => r.severity.label.includes("CRITICAL") || (r.id === signal.id && signal.severity.label.includes("CRITICAL"))).length + 1;
          const elevateds = (threatRows.length + 1) - criticals;
          return { 
            ...kpi, 
            value: `${current + 1} Sites`,
            subtext: `${criticals} Critical | ${elevateds} Elevated`
          };
        }
        if (kpi.id === "network-health") {
          const current = parseFloat(kpi.value.replace(/[^0-9.]/g, ""));
          const nextVal = Math.max(45, current - 1.8).toFixed(1);
          return { 
            ...kpi, 
            value: `${nextVal}%`,
            subtext: `SLA warning threshold: 90.0%`
          };
        }
        return kpi;
      })
    );

    // 3. Render high-fidelity alert toast banner
    setToast({
      id: signal.id,
      msg: `INGESTION SIGNAL DETECTED: ${signal.facility} (${signal.location}) — ${signal.disruption}`
    });

    // Auto dismiss toast after 6 seconds
    setTimeout(() => {
      setToast(null);
    }, 6000);
  };

  return (
    <div id="app-shell" className={`relative flex min-h-screen font-sans antialiased select-none transition-colors duration-300 ${
      isDark ? "bg-[#0A0D14] text-slate-200" : "bg-[#F3F4F6] text-[#0F172A]"
    }`}>
      
      {/* ── Dynamic Live Alert Ingestion Toast Banner ── */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 border border-[#86BC25] bg-[#0C1220] px-4 py-2.5 font-mono text-[10px] text-white shadow-2xl rounded-none select-none">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#86BC25] opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#86BC25]"></span>
          </span>
          <span className="font-bold text-[#86BC25] tracking-wider uppercase">NEW RADAR SIGNAL DETECTED:</span>
          <span>{toast.msg}</span>
          <button 
            onClick={() => setToast(null)} 
            className="text-slate-500 hover:text-white cursor-pointer ml-3 border border-slate-800 px-1 py-0.5 hover:border-slate-500 font-mono text-[9px]"
          >
            [ESC]
          </button>
        </div>
      )}

      {/* ── Sleek Vertical Navigation Rail ── */}
      <Sidebar 
        isDark={isDark} 
        toggleDark={toggleDark} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />

      {/* ── Main content area (Strictly attached to navigation rail) ── */}
      <div className="ml-16 flex flex-1 flex-col min-w-0">
        {/* ── Integrated Dark Corporate Header ── */}
        <Topbar 
          onTriggerDemoSignal={handleTriggerDemoSignal} 
          mockSignalsLeft={MOCK_SIGNALS.length - demoIndex}
          isDark={isDark}
        />

        {/* ── High-density Dashboard content ── */}
        <main id="dashboard-content" className="flex-1 p-3 flex flex-col gap-3">
          
          {/* TAB Conditionally Rendered Content Views */}
          {activeTab === "radar" && (
            <div className="flex flex-col gap-3">
              {/* Grid layout: Balanced 12-Column System (50/50) */}
              <div className="grid grid-cols-12 gap-3">
                {/* ── 6-Column Map Command Center ── */}
                <div className="col-span-12 lg:col-span-6">
                  <MapPlaceholder threatRows={threatRows} loading={loading} />
                </div>

                {/* ── 6-Column Consolidated KPI & Taxonomy Info Panel (Side-by-Side Grid) ── */}
                <div className="col-span-12 lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <KpiCards kpiData={kpiData} loading={loading} isDark={isDark} />
                  <SignalTaxonomy 
                    threatRows={threatRows} 
                    selectedCategories={selectedCategories} 
                    onSelectCategories={setSelectedCategories}
                    isDark={isDark}
                  />
                </div>
              </div>

              {/* ── Bottom: High-density threat registry table ── */}
              <div className="w-full">
                <HealthMonitorTable 
                  rowData={threatRows} 
                  loading={loading} 
                  selectedCategories={selectedCategories}
                  onSelectCategories={setSelectedCategories}
                  isDark={isDark}
                  onHumanFeedback={handleHumanFeedback}
                />
              </div>
            </div>
          )}

          {activeTab === "ingest" && (
            <BaseIngest 
              isDark={isDark} 
              onSupplyBaseInitialized={handleSupplyBaseInitialized} 
            />
          )}

          {activeTab === "playbooks" && (
            <MitigationPlaybooks 
              isDark={isDark} 
              threatRows={threatRows} 
              onApprovePlaybook={handleApprovePlaybook}
              knowledgeGraph={knowledgeGraph}
              historicalPrecedents={historicalPrecedents}
              erpSystems={erpSystems}
            />
          )}

          {activeTab === "orchestration" && (
            <ActionOrchestration 
              isDark={isDark} 
              threatRows={threatRows} 
              approvedPlaybooks={approvedPlaybooks} 
              onSupplierResponse={handleSupplierResponse}
              erpSystems={erpSystems}
            />
          )}

          {activeTab === "governance" && (
            <AIJudgeGovernance 
              isDark={isDark} 
              feedbackHistory={feedbackHistory}
            />
          )}

        </main>
      </div>
    </div>
  );
}
