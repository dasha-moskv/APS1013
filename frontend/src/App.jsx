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
import AIJudgeGovernance from "./components/AIJudgeGovernance";



export default function App() {
  const [activeTab, setActiveTab] = useState("radar");
  const [threatRows, setThreatRows] = useState([]);
  const [kpiData, setKpiData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(false);
  
  // Decoupled Decoded API States
  const [knowledgeGraph, setKnowledgeGraph] = useState(null);
  const [signals, setsignals] = useState([]);
  const [droppedSignals, setDroppedSignals] = useState([]);
  const [playbookData, setPlaybookData] = useState(null);
  const [cSuiteData, setCSuiteData] = useState({});
  const [pipelineData, setPipelineData] = useState({});

  // Phase 2/3 States
  const [, setApprovedPlaybooks] = useState({});
  const [feedbackHistory, setFeedbackHistory] = useState([]);

  const toggleDark = () => setIsDark(prev => !prev);
  
  const [demoIndex, setDemoIndex] = useState(0);
  const [isStreaming, setIsStreaming] = useState(false);
  const [toast, setToast] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);

  // Auto-ingest signals when streaming mode is active at randomized time intervals
  useEffect(() => {
    if (!isStreaming) return;

    if (demoIndex >= signals.length) {
      setIsStreaming(false);
      return;
    }

    let timeoutId;
    const triggerNext = () => {
      handleTriggerDemoSignal();
    };

    // Random interval between 3 and 6 seconds
    const randomDelay = Math.floor(Math.random() * 3000) + 3000;
    timeoutId = setTimeout(triggerNext, randomDelay);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isStreaming, demoIndex, signals]);

  // Parallel Ingestion of all 9 decoupled JSON databases
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
      fetch("/data/signals.json").then((res) => {
        if (!res.ok) throw new Error("Failed to fetch signals");
        return res.json();
      }),
      fetch("/data/droppedSignals.json").then((res) => {
        if (!res.ok) throw new Error("Failed to fetch dropped signals");
        return res.json();
      }),
      fetch("/data/playbookRecommendations.json").then((res) => {
        if (!res.ok) throw new Error("Failed to fetch playbook recommendations");
        return res.json();
      }),
      fetch("/data/cSuiteData.json").then((res) => {
        if (!res.ok) throw new Error("Failed to fetch C-Suite telemetry");
        return res.json();
      }),
      fetch("/data/pipelineData.json").then((res) => {
        if (!res.ok) throw new Error("Failed to fetch pipeline telemetry");
        return res.json();
      })
    ])
      .then(([threats, kpis, graph, signal, droppedSig, playbooks, csuite, pipeline]) => {
        const mappedThreats = threats.map(t => ({ ...t, ingestedAt: 0 }));
        setThreatRows(mappedThreats);
        setKpiData(kpis);
        setKnowledgeGraph(graph);
        setsignals(signal);
        setDroppedSignals(droppedSig);
        setPlaybookData(playbooks);
        setCSuiteData(csuite);
        setPipelineData(pipeline);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading unified telemetry databases:", err);
        setLoading(false);
      });
  }, []);

  // Callback from Phase 1 GeoJSON Ingest to populate new sub-tier threat logs
  const handleSupplyBaseInitialized = (programName, _nodeCount) => {
    // Append a specialized Tier-2 shock matching the loaded program
    if (programName.includes("Renton")) {
      const parsedSignal = {
        id: "SUP-001A",
        facility: "Spirit AeroSystems, Inc.",
        location: "KS, US",
        disruption: "Renton fuselage transport logistics rail strike",
        severity: 8.5,
        likelihood: 85,
        timeToHit: "1-2 weeks",
        tier: 1,
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
        title: "BASE INITIALIZED:",
        msg: `Ingested B737 MAX Renton Supply Grid. New sub-tier risk registered: ${parsedSignal.facility}`,
        color: "#86BC25"
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
    
    setToast({
      id: "PLAYBOOK_APPROVED",
      title: "PLAYBOOK APPROVED:",
      msg: `Active recovery strategy initiated for Node ${threatId}.`,
      color: "#3B82F6"
    });

    setTimeout(() => setToast(null), 5000);
  };

  const handleDeleteSignal = (id) => {
    setThreatRows(prev => prev.filter(t => t.id !== id));
    setToast({
      id: "SIGNAL_DELETED",
      title: "SIGNAL PURGED:",
      msg: `Successfully removed disruption signal ${id} from active threat registry.`,
      color: "#EF4444"
    });
    setTimeout(() => setToast(null), 4000);
  };

  // Callback from Home Threat Table feedback forms to dynamically log human reviews
  const handleHumanFeedback = (feedback) => {
    setFeedbackHistory(prev => [feedback, ...prev]);

    setToast({
      id: "GOVERNANCE",
      title: "GOVERNANCE REVIEW REGISTERED:",
      msg: `Analyst review received for ${feedback.facility}.`,
      color: "#A855F7"
    });

    setTimeout(() => setToast(null), 5000);
  };

  // Simulates live satellite threat signals coming in and updates central state
  const handleTriggerDemoSignal = () => {
    if (demoIndex >= signals.length) {
      setIsStreaming(false);
      return;
    }

    const baseSignal = signals[demoIndex];
    const signal = { 
      ...baseSignal, 
      ingestedAt: Date.now(),
      coordinates: baseSignal.coordinates || baseSignal.mapPosition?.coordinates
    };
    setDemoIndex(prev => prev + 1);

    // 1. Append new signal to the front of threat registry
    setThreatRows(prev => [signal, ...prev]);

    // 2. Parse and recalculate KPI scorecards reactively (boardroom math updates)
    setKpiData(prevKpi =>
      prevKpi.map(kpi => {
        if (kpi.id === "monitored-nodes") {
          const exposures = { "SUP-404R": 34.5, "SUP-512S": 22.4, "SUP-771A": 12.8, "SUP-212H": 18.2 };
          const addition = exposures[signal.id] || 15.0;
          return { 
            ...kpi, 
            value: kpi.value + addition,
            subtext: `+$${addition.toFixed(1)}M added from new disruption`
          };
        }
        if (kpi.id === "active-risks") {
          const criticals = threatRows.filter(r => r.severity >= 9.0 || (r.id === signal.id && signal.severity >= 9.0)).length + 1;
          const elevateds = (threatRows.length + 1) - criticals;
          return { 
            ...kpi, 
            value: kpi.value + 1,
            criticalCount: criticals,
            elevatedCount: elevateds,
            subtext: `${criticals} Critical | ${elevateds} Elevated`
          };
        }
        if (kpi.id === "network-health") {
          const nextVal = Math.max(45, kpi.value - 1.8);
          return { 
            ...kpi, 
            value: nextVal,
            subtext: `SLA warning threshold: 90.0%`
          };
        }
        return kpi;
      })
    );

    // 3. Render high-fidelity alert toast banner
    setToast({
      id: signal.id,
      title: "NEW RADAR SIGNAL DETECTED:",
      msg: `${signal.facility} (${signal.location}) — ${signal.disruption}`,
      color: "#EAB308"
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
        <div 
          style={{ borderColor: toast.color || "#86BC25" }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 border bg-[#0C1220] px-4 py-2.5 font-mono text-[10px] text-white shadow-2xl rounded-none select-none animate-fade-in"
        >
          <span className="relative flex h-2 w-2">
            <span 
              style={{ backgroundColor: toast.color || "#86BC25" }}
              className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
            />
            <span 
              style={{ backgroundColor: toast.color || "#86BC25" }}
              className="relative inline-flex h-2 w-2 rounded-full"
            />
          </span>
          <span 
            style={{ color: toast.color || "#86BC25" }}
            className="font-bold tracking-wider uppercase"
          >
            {toast.title || "ALERT DETECTED:"}
          </span>
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
          signalsLeft={signals.length - demoIndex}
          isDark={isDark}
          isStreaming={isStreaming}
          onToggleStreaming={() => setIsStreaming(!isStreaming)}
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
                  onDeleteSignal={handleDeleteSignal}
                  cSuiteData={cSuiteData}
                  pipelineData={pipelineData}
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
              playbookData={playbookData}
            />
          )}



          {activeTab === "governance" && (
            <AIJudgeGovernance 
              isDark={isDark} 
              feedbackHistory={feedbackHistory}
              droppedSignals={droppedSignals}
            />
          )}

        </main>
      </div>
    </div>
  );
}
