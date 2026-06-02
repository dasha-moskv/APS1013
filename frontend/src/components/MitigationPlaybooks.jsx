import { useState, useEffect, useRef } from "react";
import { 
  Activity, 
  DollarSign, 
  BookOpen, 
  ArrowRight,
  Award,
  Layers,
  Globe,
  Info,
  CheckSquare,
  AlertOctagon,
  Clock,
  Send,
  Terminal as TerminalIcon,
  RefreshCw,
  Mail
} from "lucide-react";

export default function MitigationPlaybooks({ 
  isDark, 
  threatRows = [], 
  onApprovePlaybook,
  knowledgeGraph,
  playbookData
}) {
  const [selectedThreatId, setSelectedThreatId] = useState("");
  const [selectedThreat, setSelectedThreat] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  
  // Custom interactive state triggers
  const [selectedScenarioId, setSelectedScenarioId] = useState("SCENARIO_A");
  const [customMailBody, setCustomMailBody] = useState("");
  const [isMailEditing, setIsMailEditing] = useState(false);
  const [mailSentStatus, setMailSentStatus] = useState("IDLE"); // IDLE, SENDING, SENT
  const [erpDispatchStatus, setErpDispatchStatus] = useState("IDLE"); // IDLE, DISPATCHING, SUCCESS
  const [erpLogs, setErpLogs] = useState([]);
  const erpLogsEndRef = useRef(null);

  // FAA compliance checks states
  const [complianceChecks, setComplianceChecks] = useState({
    typeCertificate: false,
    aslVerified: false,
    faiQueued: false
  });

  const [approvedList, setApprovedList] = useState({});

  // Set default threat selection when the threat list loads.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (threatRows && threatRows.length > 0) {
      const defaultThreat = threatRows.find(t => t.severity >= 7.0) || threatRows[0];
      setSelectedThreatId(defaultThreat.id);
    }
  }, [threatRows]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Sync all derived threat panel state when the selected threat ID changes.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (selectedThreatId && threatRows) {
      const threat = threatRows.find(t => t.id === selectedThreatId);
      setSelectedThreat(threat);
      setComplianceChecks({
        typeCertificate: false,
        aslVerified: false,
        faiQueued: false
      });
      // Reset scenario and actions states
      setSelectedScenarioId("SCENARIO_A");
      setMailSentStatus("IDLE");
      setErpDispatchStatus("IDLE");
      setErpLogs([]);
      setIsMailEditing(false);
    }
  }, [selectedThreatId, threatRows]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Sync custom mail template when threat or scenario changes
  const activeDetails = playbookData?.threatDetails?.[selectedThreatId];
  const activeScenario = activeDetails?.mitigationScenarios?.find(s => s.scenarioId === selectedScenarioId) || activeDetails?.mitigationScenarios?.[0];
  const activeMailTemplate = activeDetails?.automatedComms?.[0];

  // Sync custom mail body when the active mail template changes.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (activeMailTemplate) {
      setCustomMailBody(activeMailTemplate.messageBodyTemplate);
    } else {
      setCustomMailBody("");
    }
  }, [selectedThreatId, selectedScenarioId, activeMailTemplate]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Scroll ERP terminal logs to bottom automatically
  useEffect(() => {
    if (erpLogsEndRef.current) {
      erpLogsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [erpLogs]);

  const handleToggleCompliance = (key) => {
    setComplianceChecks(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleExecuteApproval = () => {
    if (!complianceChecks.typeCertificate || !complianceChecks.aslVerified || !complianceChecks.faiQueued) {
      alert("FAA REGULATORY NOTICE: All compliance requirements must be signed off prior to execution.");
      return;
    }

    setApprovedList(prev => ({
      ...prev,
      [selectedThreat.id]: true
    }));

    if (onApprovePlaybook) {
      onApprovePlaybook(selectedThreat.id);
    }
  };

  // Automated communication script trigger simulation
  const handleSendComms = () => {
    setMailSentStatus("SENDING");
    setTimeout(() => {
      setMailSentStatus("SENT");
    }, 1800);
  };

  // ERP Webhook dispatch simulation
  const handleDispatchErp = () => {
    setErpDispatchStatus("DISPATCHING");
    setErpLogs([]);

    const logMessages = [
      "⚡ INITIATING ERP API INTEGRATION HANDSHAKE...",
      "🔗 ESTABLISHING TRUSTED WEBHOOK CONNECTION TO SAP ECC / S4HANA...",
      `📦 RETRIEVING DOWNSTREAM MATERIAL RECORD: ${activeScenario?.erpUpdates?.adjust_safety_stock?.material_id || "MAT-N/A"}`,
      `🏢 IDENTIFIED PRODUCTION PLANT BOUNDARY: ${activeScenario?.erpUpdates?.adjust_safety_stock?.plant_id || "PLANT-N/A"}`,
      `🔧 UPDATING MATERIAL REQUIREMENT PLANNING (MRP) SAFETY BUFFER...`,
      `   -> Original safety stock: 1 operational baseline unit`,
      `   -> Revised target buffer: ${activeScenario?.erpUpdates?.adjust_safety_stock?.new_safety_stock_level || 6} units`,
      "✅ MRP DATABASE RECORD UPDATED SUCCESSFULLY.",
      "📝 GENERATING EXPEDITED CONTINGENCY PURCHASE ORDER...",
      `   -> Connected Vendor ID: ${activeScenario?.erpUpdates?.trigger_expedited_po?.vendor_id || "VEND-N/A"}`,
      `   -> Overriding purchase order: ${activeScenario?.erpUpdates?.trigger_expedited_po?.original_po_id || "PO-N/A"}`,
      `   -> Carrier code allocated: ${activeScenario?.erpUpdates?.trigger_expedited_po?.logistics_carrier_code || "CARR-N/A"}`,
      `   -> Premium billing allocation: ${activeScenario?.erpUpdates?.trigger_expedited_po?.freight_billing_code || "PREM-N/A"}`,
      "🚀 TRANSMITTING PURCHASING OVERRIDE ENVELOPE TO PARTNER EDI...",
      "🎉 ERP WEBHOOK WORKFLOW FULLY EXECUTED! NOMINAL VELOCITY TRIGGERED."
    ];

    logMessages.forEach((msg, idx) => {
      setTimeout(() => {
        setErpLogs(prev => [...prev, `[${new Date().toISOString().split("T")[1].slice(0, 8)}] ${msg}`]);
        if (idx === logMessages.length - 1) {
          setErpDispatchStatus("SUCCESS");
        }
      }, idx * 250);
    });
  };

  const dailyExposure = selectedThreat
    ? selectedThreat.id === "FAC-001" ? 14500000 : selectedThreat.id === "SUP-001A" ? 8800000 : 4500000
    : 4500000;
  
  const isApproved = selectedThreat ? approvedList[selectedThreat.id] || false : false;

  // Dynamic Graph BOM Mapping
  let bom = [];
  if (selectedThreat && knowledgeGraph) {
    const currentNode = knowledgeGraph.nodes.find(n => n.id === selectedThreat.id);
    if (currentNode) {
      const currentTier = currentNode.tier;
      bom = [
        { tier: `Tier ${currentTier}`, part: currentNode.label, status: "STARVED" }
      ];

      const upstreamLinks = knowledgeGraph.links.filter(l => l.target === selectedThreat.id);
      upstreamLinks.forEach((link, idx) => {
        const sourceNode = knowledgeGraph.nodes.find(n => n.id === link.source);
        if (sourceNode) {
          bom.push({
            tier: `Tier ${sourceNode.tier}`,
            part: `${sourceNode.label} (${link.dependency})`,
            status: idx === 0 ? "DELAYED" : "NOMINAL"
          });
        }
      });

      if (bom.length < 3) {
        bom.push(
          { tier: "Tier 3", part: "Wichita central transit reserves", status: "BUFFER" },
          { tier: "Tier 4", part: "Apex titanium feedstock reserves", status: "NOMINAL" }
        );
      }
    }
  }

  // SVG Coordinates Mapping for clean tree column distribution
  const tierXMapping = { 3: 50, 2: 210, 1: 370, 0: 530 };

  const getSvgCoordinates = (nodeId) => {
    if (!knowledgeGraph) return { x: 0, y: 0 };
    const node = knowledgeGraph.nodes.find(n => n.id === nodeId);
    if (!node) return { x: 0, y: 0 };

    const tier = node.tier;
    const x = tierXMapping[tier] || 50;

    const tierGroups = {
      0: ["FAC-001", "FAC-003"],
      1: ["SUP-001A", "SUP-404R", "SUP-512S", "SUP-212H", "SUP-502A"],
      2: ["SUP-109B", "SUP-302B"],
      3: ["SUP-771A", "SUP-8472"]
    };

    const list = tierGroups[tier] || [];
    const index = list.indexOf(nodeId);
    const count = list.length || 1;

    const spacing = 240 / (count + 1);
    const y = spacing * (index + 1) + 25;

    return { x, y };
  };

  const isCriticalThreat = (nodeId) => {
    const matchedThreat = threatRows.find(r => r.id === nodeId);
    if (!matchedThreat) return false;
    return matchedThreat.severity >= 9.0;
  };

  // Math for dynamic scenario mitigation overlays
  const ttrReduction = activeScenario?.ttrReductionDays || 0;
  const initialTtr = activeDetails?.vulnerabilityTimeline?.timeToRecovery || selectedThreat?.timeToHit || 15;
  const mitigatedTtr = Math.max(1, initialTtr - ttrReduction);
  const ttsValue = activeDetails?.vulnerabilityTimeline?.timeToSurvive || 8;
  const netDeficit = ttsValue - mitigatedTtr;
  const isDeficitResolved = netDeficit >= 0;

  return (
    <div className={`flex flex-1 flex-col gap-3 p-3 animate-fade-in font-sans text-xs ${
      isDark ? "text-slate-300" : "text-slate-700"
    }`}>
      {/* Page Header */}
      <div className="flex flex-col gap-1 border-b pb-2 select-none border-slate-700/50">
        <h1 className="text-base font-bold uppercase tracking-wider text-[#86BC25] font-mono flex items-center gap-1.5">
          <Activity className="h-4 w-4 text-[#86BC25]" />
          Mitigation Playbooks Workbench
        </h1>
        <p className={`text-[10px] leading-relaxed ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          Enterprise decision support console. Traverses Graph-RAG dependency paths and structures pre-certified Approved Supplier List (ASL) mitigation playbooks.
        </p>
      </div>

      {/* ── N-TIER STRUCTURAL DEPENDENCY GRAPH (Retained from base) ── */}
      {knowledgeGraph && (
        <div className={`border p-4 rounded-none transition-colors duration-300 relative ${
          isDark ? "bg-[#0D111A] border-[#1E293B]" : "bg-white border-slate-200"
        }`}>
          <div className="flex items-center justify-between mb-2.5 select-none">
            <h2 className={`text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 ${
              isDark ? "text-slate-300" : "text-slate-700"
            }`}>
              <Globe className="h-4 w-4 text-slate-400" />
              N-Tier Structural Dependency Explorer
            </h2>
            <span className="text-[8px] font-mono border border-slate-700/60 px-2 py-0.5 text-slate-500">
              GRAPH COGNITIVE QUERY
            </span>
          </div>

          <div className="grid grid-cols-12 gap-3.5">
            {/* Left: SVG Canvas (8 columns) */}
            <div className="col-span-12 lg:col-span-8 border border-slate-800 bg-[#070A11] relative overflow-hidden h-[250px] flex items-center justify-center">
              {/* Columns Header Titles */}
              <div className="absolute top-2 left-0 right-0 grid grid-cols-4 text-center font-mono text-[8px] font-bold text-slate-600 tracking-wider pointer-events-none select-none border-b border-slate-900 pb-1">
                <span>TIER 3: RAW</span>
                <span>TIER 2: FORGING</span>
                <span>TIER 1: SYSTEMS BASE</span>
                <span>TIER 0: ASSEMBLY</span>
              </div>

              {/* Clean Vector SVG Graph */}
              <svg className="w-full h-full pt-6 select-none" viewBox="0 0 580 250">
                {/* DRAW LINKS / EDGES */}
                {knowledgeGraph.links.map((link, idx) => {
                  const sourcePos = getSvgCoordinates(link.source);
                  const targetPos = getSvgCoordinates(link.target);
                  const isBlastRadius = selectedThreatId === link.source || selectedThreatId === link.target;
                  const linkColor = isBlastRadius ? "#EF4444" : "#1E293B";

                  return (
                    <g key={idx}>
                      <path
                        d={`M ${sourcePos.x} ${sourcePos.y} C ${(sourcePos.x + targetPos.x) / 2} ${sourcePos.y}, ${(sourcePos.x + targetPos.x) / 2} ${targetPos.y}, ${targetPos.x} ${targetPos.y}`}
                        fill="none"
                        stroke={linkColor}
                        strokeWidth={isBlastRadius ? "1.5" : "1"}
                        strokeDasharray={isBlastRadius ? "2 2" : "none"}
                        className="transition-all duration-300"
                      />
                    </g>
                  );
                })}

                {/* DRAW NODES */}
                {knowledgeGraph.nodes.map(node => {
                  const { x, y } = getSvgCoordinates(node.id);
                  const isSelected = selectedThreatId === node.id;
                  const critical = isCriticalThreat(node.id);
                  
                  return (
                    <g 
                      key={node.id} 
                      transform={`translate(${x}, ${y})`}
                      className="cursor-pointer group"
                      onClick={() => setSelectedThreatId(node.id)}
                      onMouseEnter={() => setHoveredNode(node)}
                      onMouseLeave={() => setHoveredNode(null)}
                    >
                      {/* Clean Slate Node circle */}
                      <circle
                        r="8"
                        fill="#070A11"
                        stroke={isSelected ? "#86BC25" : critical ? "#EF4444" : "#1E293B"}
                        strokeWidth={isSelected ? "2.5" : "1"}
                        className="transition-all duration-150 group-hover:stroke-slate-400"
                      />

                      {/* Small Center Indicator Dot (Muted Red ONLY for Critical delays) */}
                      {critical && (
                        <circle
                          r="3"
                          fill="#EF4444"
                          className="animate-ping"
                        />
                      )}

                      {/* ID Label */}
                      <text
                        y="-12"
                        textAnchor="middle"
                        fill={isSelected ? "#86BC25" : critical ? "#EF4444" : "#475569"}
                        className="font-mono text-[8px] font-bold tracking-wider pointer-events-none select-none uppercase"
                      >
                        {node.id}
                      </text>

                      {/* Hover text label */}
                      <text
                        y="16"
                        textAnchor="middle"
                        fill={isSelected ? "#F1F5F9" : "#334155"}
                        className="font-sans text-[7px] font-semibold tracking-wide pointer-events-none select-none group-hover:fill-slate-400"
                      >
                        {node.label.split(" ")[0]}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Right: Ontological Details Panel */}
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-2.5">
              {hoveredNode || selectedThreat ? (
                <div className={`border p-3.5 flex flex-col gap-3 h-full font-mono text-[9px] ${
                  isDark ? "bg-[#070A11] border-slate-800 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-600"
                }`}>
                  <div>
                    <span className="text-slate-500 block uppercase text-[8px] tracking-wider font-bold">Node Ontology</span>
                    <h3 className={`text-xs font-sans font-bold leading-normal mt-0.5 ${isDark ? "text-white" : "text-slate-800"}`}>
                      {(hoveredNode || selectedThreat).label}
                    </h3>
                  </div>

                  <div className="flex flex-col gap-2 border-t border-b border-slate-800/40 py-2.5 my-0.5">
                    <div className="flex justify-between">
                      <span className="text-slate-500 uppercase text-[8px]">Role</span>
                      <span className={`font-bold font-sans ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                        {(hoveredNode || selectedThreat).type || "Tier Node"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 uppercase text-[8px]">Supply Tier</span>
                      <span className="font-bold">Tier {(hoveredNode || selectedThreat).tier}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 uppercase text-[8px]">Daily Exposure</span>
                      <span className="font-bold">
                        ${((hoveredNode || selectedThreat).dailyExposure || dailyExposure).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 uppercase text-[8px]">Safety Stock</span>
                      <span className="font-bold">{(hoveredNode || selectedThreat).bufferInventoryLevel || "Active stock (8 Days)"}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-500 block uppercase text-[8px] tracking-wider mb-0.5">Coordinates</span>
                    <span className="text-slate-400 select-all font-mono leading-none">
                      {(hoveredNode || selectedThreat).coordinates ? (hoveredNode || selectedThreat).coordinates.join(", ") : "Coordinates unavailable"}
                    </span>
                  </div>
                </div>
              ) : (
                <div className={`border p-8 text-center flex flex-col justify-center items-center h-full select-none ${
                  isDark ? "bg-[#070A11] border-slate-800 text-slate-500" : "bg-slate-50 border-slate-200 text-slate-400"
                }`}>
                  <Info className="h-5 w-5 text-slate-600 mb-1" />
                  <p className="font-bold uppercase tracking-wider text-[10px]">Diagnostics Standby</p>
                  <p className="text-[9px] mt-1">Hover over any node in the grid to inspect details.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── MAIN WORKBENCH GRID ── */}
      <div className="grid grid-cols-12 gap-3">
        
        {/* ==========================================
            LEFT COLUMN: CONTROLS & EXPOSURE (5 Cols)
            ========================================== */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-3">
          
          {/* Threat Selector Card */}
          <div className={`border p-4 rounded-none transition-colors duration-300 ${
            isDark ? "bg-[#0D111A] border-[#1E293B]" : "bg-white border-slate-200"
          }`}>
            <label className={`block text-[10px] font-mono font-bold uppercase tracking-wider mb-2 ${
              isDark ? "text-slate-400" : "text-slate-600"
            }`}>
              Select Disruption Card
            </label>
            <div className="relative">
              <select
                value={selectedThreatId}
                onChange={(e) => setSelectedThreatId(e.target.value)}
                className={`w-full h-9 rounded-none border px-3 text-xs font-sans font-medium focus:ring-1 focus:ring-[#86BC25] focus:outline-none focus:border-[#86BC25] select-none ${
                  isDark ? "border-slate-800 bg-[#161B26] text-white" : "border-slate-200 bg-slate-50 text-slate-800"
                }`}
              >
                {threatRows.map(row => (
                  <option key={row.id} value={row.id}>
                    [{row.id}] {row.facility} — Severity {row.severity}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quantified Financial Exposure Dashboard */}
          {selectedThreat && (
            <div className={`border p-4 rounded-none transition-colors duration-300 ${
              isDark ? "bg-[#0D111A] border-[#1E293B]" : "bg-white border-slate-200"
            }`}>
              <h2 className={`text-xs font-mono font-bold uppercase tracking-wider mb-3.5 flex items-center gap-1.5 ${
                isDark ? "text-slate-300" : "text-slate-700"
              }`}>
                <DollarSign className="h-4 w-4 text-[#86BC25]" />
                Quantified Financial Exposure Dashboard
              </h2>

              <div className="flex flex-col gap-3 font-mono text-xs select-none">
                {/* Impacted Program Indicator */}
                <div className={`border p-2.5 flex items-center justify-between ${
                  isDark ? "bg-[#111520] border-slate-800 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-700"
                }`}>
                  <span className="text-[8px] uppercase text-slate-500 font-bold">Impacted Program</span>
                  <span className="font-sans font-bold text-[#86BC25] uppercase tracking-wide">
                    {activeDetails?.financialExposure?.impactedProgram || "Everett Widebody Assembly"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className={`border p-3 flex flex-col gap-1 ${isDark ? "bg-[#111520] border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                    <span className="text-[8px] text-slate-500 uppercase tracking-wider">Daily Stop Cost</span>
                    <span className="text-sm font-bold text-red-500">
                      ${((activeDetails?.financialExposure?.dailyStopLineCost || dailyExposure) / 1000000).toFixed(2)}M / Day
                    </span>
                  </div>

                  <div className={`border p-3 flex flex-col gap-1 ${isDark ? "bg-[#111520] border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                    <span className="text-[8px] text-slate-500 uppercase tracking-wider">SLA Penalty Risk</span>
                    <span className="text-sm font-bold text-amber-500">
                      ${((activeDetails?.financialExposure?.contractualSlaPenaltyRisk || 850000) / 1000).toFixed(0)}K / Day
                    </span>
                  </div>
                </div>

                {/* Unmitigated Total Exposure Gauge */}
                <div className={`border p-3 flex flex-col gap-2 relative overflow-hidden ${
                  isDark ? "bg-red-950/10 border-red-950/50" : "bg-red-50/50 border-red-100"
                }`}>
                  <div className="flex justify-between items-center z-10">
                    <span className="text-[8px] text-red-400 uppercase tracking-wider font-bold">Unmitigated Exposure (Proj. Stop)</span>
                    <span className="text-[9px] text-red-400 font-bold">
                      Triggers on Day {activeDetails?.financialExposure?.daysToSlaTrigger || 10}
                    </span>
                  </div>
                  <span className="text-lg font-bold text-red-500 z-10">
                    ${((activeDetails?.financialExposure?.totalUnmitigatedExposure || 105600000) / 1000000).toFixed(1)}M
                  </span>
                  <div className="absolute right-3 bottom-1.5 text-slate-800 opacity-20 pointer-events-none select-none">
                    <AlertOctagon className="h-10 w-10 text-red-500" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Interactive Vulnerability Timeline Analysis */}
          {activeDetails && (
            <div className={`border p-4 rounded-none transition-colors duration-300 ${
              isDark ? "bg-[#0D111A] border-[#1E293B]" : "bg-white border-slate-200"
            }`}>
              <h2 className={`text-xs font-mono font-bold uppercase tracking-wider mb-3.5 flex items-center gap-1.5 ${
                isDark ? "text-slate-300" : "text-slate-700"
              }`}>
                <Clock className="h-4 w-4 text-[#86BC25]" />
                Vulnerability Timeline Analysis
              </h2>

              <div className="flex flex-col gap-3 font-mono text-xs select-none">
                {/* Horizontal Timeline Bar */}
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between text-[9px] font-bold text-slate-500">
                    <span>TIMELINE STATUS</span>
                    <span className={`px-2 py-0.5 border text-[8px] font-mono font-bold ${
                      isDeficitResolved 
                        ? "text-[#86BC25] border-[#86BC25]/20 bg-[#86BC25]/5" 
                        : "text-red-500 border-red-950/20 bg-red-950/5 animate-pulse"
                    }`}>
                      {isDeficitResolved ? "MITIGATION SECURED" : "BUFFER DEFICIT"}
                    </span>
                  </div>
                  <div className={`overflow-hidden h-2.5 text-xs flex rounded-none ${isDark ? "bg-slate-800" : "bg-slate-100"}`}>
                    <div 
                      style={{ width: `${Math.min(100, (ttsValue / (initialTtr + 5)) * 100)}%` }} 
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-[#86BC25]"
                      title={`Time-to-Survive: ${ttsValue} Days`}
                    />
                    <div 
                      style={{ width: `${Math.max(10, Math.min(100, ((mitigatedTtr - ttsValue) / (initialTtr + 5)) * 100))}%` }} 
                      className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                        isDeficitResolved ? "bg-sky-500" : "bg-red-500 animate-pulse"
                      }`}
                      title={`Mitigated TTR: ${mitigatedTtr} Days`}
                    />
                  </div>
                  <div className="flex justify-between text-[7px] text-slate-500 font-bold mt-1.5">
                    <span>Day 0</span>
                    <span>Day {ttsValue} (TTS - Safety Buffer)</span>
                    <span>Day {mitigatedTtr} (Mitigated TTR)</span>
                    <span>Day {initialTtr} (Raw TTR)</span>
                  </div>
                </div>

                {/* Quantitative Metric Callouts */}
                <div className="grid grid-cols-3 gap-2 border-t border-slate-800/40 pt-2.5 mt-1 text-center">
                  <div className="flex flex-col">
                    <span className="text-[7px] text-slate-500 uppercase font-bold">Time-to-Survive</span>
                    <span className="text-xs font-bold text-[#86BC25]">{ttsValue} Days</span>
                  </div>
                  <div className="flex flex-col border-l border-r border-slate-800/40">
                    <span className="text-[7px] text-slate-500 uppercase font-bold">Mitigated TTR</span>
                    <span className={`text-xs font-bold ${isDeficitResolved ? "text-sky-400" : "text-red-500"}`}>
                      {mitigatedTtr} Days
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[7px] text-slate-500 uppercase font-bold">Net Buffer Gap</span>
                    <span className={`text-xs font-bold ${isDeficitResolved ? "text-[#86BC25]" : "text-red-500 animate-pulse"}`}>
                      {netDeficit > 0 ? `+${netDeficit}` : netDeficit} Days
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Regulatory Compliance & Action Approval Panel */}
          {selectedThreat && (
            <div className={`border p-4 rounded-none transition-colors duration-300 ${
              isApproved 
                ? "border-[#86BC25] bg-[#86BC25]/5" 
                : isDark 
                  ? "bg-[#0D111A] border-[#1E293B]" 
                  : "bg-white border-slate-200"
            }`}>
              <div className="flex items-center justify-between mb-3 border-b pb-2 select-none border-slate-700/30">
                <h2 className={`text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                  isApproved ? "text-[#86BC25]" : isDark ? "text-slate-300" : "text-slate-700"
                }`}>
                  <Award className="h-4 w-4" />
                  FAA Safety & Regulatory compliance
                </h2>
                {isApproved && (
                  <span className="text-[8px] border border-[#86BC25] bg-[#86BC25]/10 px-2 py-0.5 text-[#86BC25] font-mono font-bold uppercase animate-pulse">
                    PLAYBOOK APPROVED
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-3">
                {/* Warning Alert */}
                <div className={`border p-2.5 text-[10px] font-sans leading-relaxed select-none ${
                  isDark ? "bg-[#111520] border-slate-800 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-600"
                }`}>
                  <p className="font-bold uppercase font-mono text-[9px] flex items-center gap-1 mb-1 text-amber-500">
                    <CheckSquare className="h-3.5 w-3.5 text-amber-500" />
                    FAA Type Certificate Constraint Notice
                  </p>
                  <span className="text-[9px] leading-relaxed">
                    {activeDetails?.regulatoryCheckpoints?.notes || "Aerospace parts are bound strictly by legally locked Type Certificate recipes. Sourcing adjustments must operate strictly within pre-certified ASL networks."}
                  </span>
                </div>

                {/* Checklist Boxes */}
                <div className="flex flex-col gap-2 font-mono text-[10px] text-slate-400">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={complianceChecks.typeCertificate}
                      onChange={() => handleToggleCompliance("typeCertificate")}
                      disabled={isApproved}
                      className="mt-0.5 h-3.5 w-3.5 accent-[#86BC25]"
                    />
                    <div>
                      <span className={complianceChecks.typeCertificate ? "text-slate-200 font-bold" : "text-slate-400"}>
                        Verify FAA Type Certificate Integrity (Verified: {activeDetails?.regulatoryCheckpoints?.typeCertificateVerified ? "PASS" : "N/A"})
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={complianceChecks.aslVerified}
                      onChange={() => handleToggleCompliance("aslVerified")}
                      disabled={isApproved}
                      className="mt-0.5 h-3.5 w-3.5 accent-[#86BC25]"
                    />
                    <div>
                      <span className={complianceChecks.aslVerified ? "text-slate-200 font-bold" : "text-slate-400"}>
                        Cross-Reference Approved Supplier List (ASL Alignment: {activeDetails?.regulatoryCheckpoints?.aslVerified ? "PASS" : "N/A"})
                      </span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={complianceChecks.faiQueued}
                      onChange={() => handleToggleCompliance("faiQueued")}
                      disabled={isApproved}
                      className="mt-0.5 h-3.5 w-3.5 accent-[#86BC25]"
                    />
                    <div>
                      <span className={complianceChecks.faiQueued ? "text-slate-200 font-bold" : "text-slate-400"}>
                        Queue FAI Calibration Worksheets ({activeDetails?.regulatoryCheckpoints?.faiRequired ? `Required: ${activeDetails?.regulatoryCheckpoints?.faiWorkflowId}` : "Not required"})
                      </span>
                    </div>
                  </label>
                </div>

                {/* Approve Button */}
                <div className="border-t border-slate-700/30 pt-3 select-none flex items-center justify-end mt-1">
                  <button
                    onClick={handleExecuteApproval}
                    disabled={isApproved}
                    className={`flex items-center gap-1.5 border px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-wider rounded-none cursor-pointer transition-all duration-150 ${
                      isApproved
                        ? "border-[#86BC25] bg-[#86BC25]/15 text-[#86BC25] cursor-not-allowed"
                        : complianceChecks.typeCertificate && complianceChecks.aslVerified && complianceChecks.faiQueued
                          ? "border-[#86BC25] bg-[#86BC25]/10 text-[#86BC25] hover:bg-[#86BC25] hover:text-black hover:scale-[1.02]"
                          : "border-slate-800 bg-slate-900/50 text-slate-500 cursor-not-allowed"
                    }`}
                  >
                    <ArrowRight className="h-3.5 w-3.5" />
                    {isApproved ? "Playbook Approved" : "Sign Off & Approve Playbook Plan"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ==========================================
            RIGHT COLUMN: SCENARIOS & AUTOMATION (7 Cols)
            ========================================== */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-3">
          
          {/* Scenario Configuration Switcher */}
          {activeDetails && (
            <div className={`border p-4 rounded-none transition-colors duration-300 ${
              isDark ? "bg-[#0D111A] border-[#1E293B]" : "bg-white border-slate-200"
            }`}>
              <div className="flex items-center justify-between mb-4 select-none">
                <h2 className={`text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                  isDark ? "text-slate-300" : "text-slate-700"
                }`}>
                  <BookOpen className="h-4 w-4 text-[#86BC25]" />
                  Multi-Scenario Mitigation plays Switcher
                </h2>
                <span className="text-[8px] font-mono border border-slate-700/60 px-2 py-0.5 text-slate-500">
                  MCKINSEY RISK MATRIX
                </span>
              </div>

              {/* Scenario selector tabs */}
              <div className="flex gap-2.5 mb-3.5 select-none">
                {activeDetails.mitigationScenarios.map((scen) => (
                  <button
                    key={scen.scenarioId}
                    onClick={() => {
                      setSelectedScenarioId(scen.scenarioId);
                      setErpDispatchStatus("IDLE");
                      setErpLogs([]);
                    }}
                    className={`flex-1 border p-3 flex flex-col gap-1 text-left rounded-none cursor-pointer transition-all duration-150 ${
                      selectedScenarioId === scen.scenarioId 
                        ? "border-[#86BC25] bg-[#86BC25]/5" 
                        : isDark 
                          ? "border-slate-800 bg-[#111520] hover:bg-[#161B26]" 
                          : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                    }`}
                  >
                    <span className="text-[7px] text-slate-500 uppercase font-bold tracking-wider font-mono">
                      {scen.operationalPlayType}
                    </span>
                    <span className={`text-xs font-bold font-sans ${isDark ? "text-white" : "text-slate-800"}`}>
                      {scen.label}
                    </span>
                    <div className="flex items-center justify-between text-[8px] font-mono text-slate-500 mt-1 border-t border-slate-800/20 pt-1">
                      <span>Cost: <span className="font-bold text-[#86BC25]">${(scen.workaroundCost / 1000).toFixed(0)}K</span></span>
                      <span>Days Saved: <span className="font-bold text-sky-400">{scen.ttrReductionDays}d</span></span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Selected Scenario Playbook Panel */}
              {activeScenario && (
                <div className="flex flex-col gap-3 font-sans text-xs border-t border-slate-800/40 pt-3">
                  <div className={`p-3 border flex flex-col gap-1 leading-normal ${
                    isDark ? "bg-[#111520] border-slate-800 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-600"
                  }`}>
                    <span className="text-slate-500 uppercase text-[8px] font-bold font-mono">Operational Play Summary</span>
                    <p className="text-[10px] leading-relaxed mt-0.5">{activeScenario.operationalSummary}</p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="text-slate-500 uppercase font-mono text-[8px] font-bold">Autonomous Playbook Execution Steps</span>
                    <div className="flex flex-col gap-1.5">
                      {activeScenario.executionSteps.map((step, idx) => (
                        <div key={idx} className={`border p-2.5 flex items-start gap-2.5 ${
                          isDark ? "bg-[#111520] border-slate-800" : "bg-slate-50 border-slate-200"
                        }`}>
                          <span className="h-4.5 w-4.5 rounded-full border border-slate-800 bg-[#070A11] flex items-center justify-center font-mono text-[8px] font-bold text-slate-500 shrink-0 select-none">
                            {idx + 1}
                          </span>
                          <p className={`text-[10px] leading-relaxed ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                            {step}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Deep-tier BOM Hierarchy (Retained from base) */}
          {bom.length > 0 && (
            <div className={`border p-4 rounded-none transition-colors duration-300 ${
              isDark ? "bg-[#0D111A] border-[#1E293B]" : "bg-white border-slate-200"
            }`}>
              <h2 className={`text-xs font-mono font-bold uppercase tracking-wider mb-2.5 flex items-center gap-1.5 ${
                isDark ? "text-slate-300" : "text-slate-700"
              }`}>
                <Layers className="h-4 w-4 text-[#86BC25]" />
                Deep-Tier BOM Hierarchy
              </h2>
              <div className="flex flex-col gap-1.5 font-mono text-[9px] select-none">
                {bom.map((b, i) => (
                  <div key={i} className={`border p-2 flex items-center justify-between ${
                    isDark ? "bg-[#111520] border-slate-800 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-600"
                  }`}>
                    <div className="flex flex-col">
                      <span className="text-slate-500 font-bold uppercase text-[7px] tracking-wide">
                        {b.tier}
                      </span>
                      <span className={`font-sans font-bold text-[10px] mt-0.5 ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                        {b.part}
                      </span>
                    </div>
                    <span className={`px-1.5 py-0.5 text-[8px] font-bold border uppercase ${
                      b.status === "STARVED" ? "text-red-500 border-red-950/20 bg-red-950/10" :
                      b.status === "DELAYED" ? "text-amber-500 border-amber-950/20 bg-amber-950/10" :
                      b.status === "BUFFER" ? "text-[#86BC25] border-[#86BC25]/20 bg-[#86BC25]/10" :
                      "text-slate-500 border-slate-800 bg-slate-900/10"
                    }`}>
                      {b.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Closed-Loop Automated Communication Portal */}
          {activeMailTemplate && (
            <div className={`border p-4 rounded-none transition-colors duration-300 ${
              isDark ? "bg-[#0D111A] border-[#1E293B]" : "bg-white border-slate-200"
            }`}>
              <h2 className={`text-xs font-mono font-bold uppercase tracking-wider mb-3.5 flex items-center gap-1.5 ${
                isDark ? "text-slate-300" : "text-slate-700"
              }`}>
                <Mail className="h-4 w-4 text-[#86BC25]" />
                Closed-Loop Automated Communication Portal
              </h2>

              <div className="flex flex-col gap-2.5 font-mono text-[9px] select-none">
                <div className={`border p-3 flex flex-col gap-2 ${
                  isDark ? "bg-[#111520] border-slate-800" : "bg-slate-50 border-slate-200"
                }`}>
                  <div className="flex justify-between items-center text-[8px] text-slate-500 border-b border-slate-800/40 pb-2 mb-1">
                    <span className="font-bold uppercase">CRM-EDI Message Dispatch Draft</span>
                    <span className={`px-2 py-0.5 border text-[7px] font-bold ${
                      mailSentStatus === "SENT" ? "text-[#86BC25] border-[#86BC25]/20 bg-[#86BC25]/5" :
                      mailSentStatus === "SENDING" ? "text-sky-400 border-sky-400/20 bg-sky-400/5 animate-pulse" :
                      "text-slate-500 border-slate-800 bg-slate-950"
                    }`}>
                      {mailSentStatus === "SENT" ? "TRANSMITTED TO PARTNER VIA SCRM-EDI" : mailSentStatus === "SENDING" ? "SENDING..." : "STANDBY"}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 text-[9px] text-slate-400 leading-normal">
                    <span><span className="text-slate-600 font-bold uppercase mr-1">Recipient:</span> {activeMailTemplate.recipientRole} ({activeMailTemplate.recipientEmail})</span>
                    <span><span className="text-slate-600 font-bold uppercase mr-1">EDI Channel:</span> {activeMailTemplate.channel} Protocol</span>
                    <span><span className="text-slate-600 font-bold uppercase mr-1">Subject:</span> <span className="text-sky-400">{activeMailTemplate.messageSubject}</span></span>
                  </div>

                  {isMailEditing ? (
                    <textarea
                      value={customMailBody}
                      onChange={(e) => setCustomMailBody(e.target.value)}
                      className={`w-full p-2.5 border rounded-none font-mono text-[9.5px] leading-relaxed min-h-[110px] focus:ring-1 focus:ring-[#86BC25] focus:outline-none select-text ${
                        isDark ? "bg-slate-950 border-slate-800 text-slate-300" : "bg-white border-slate-200 text-slate-700"
                      }`}
                    />
                  ) : (
                    <div className={`p-2.5 border font-mono text-[9.5px] leading-relaxed break-words whitespace-pre-wrap select-text max-h-[140px] overflow-y-auto ${
                      isDark ? "bg-[#070A11] border-slate-900 text-slate-400" : "bg-slate-100 border-slate-300 text-slate-600"
                    }`}>
                      {customMailBody}
                    </div>
                  )}

                  <div className="flex items-center justify-between border-t border-slate-800/40 pt-2 select-none">
                    <button
                      onClick={() => setIsMailEditing(prev => !prev)}
                      className={`border px-2.5 py-1 font-mono text-[8px] uppercase tracking-wider rounded-none cursor-pointer transition-colors duration-150 ${
                        isMailEditing 
                          ? "border-[#86BC25] text-[#86BC25] bg-[#86BC25]/5" 
                          : "border-slate-800 hover:border-slate-500 text-slate-400"
                      }`}
                    >
                      {isMailEditing ? "Save Edits" : "Edit Message Script"}
                    </button>

                    <button
                      onClick={handleSendComms}
                      disabled={mailSentStatus !== "IDLE" || isApproved}
                      className={`flex items-center gap-1.5 border px-3.5 py-1.5 font-mono text-[9px] font-bold uppercase tracking-wider rounded-none cursor-pointer transition-all duration-150 ${
                        mailSentStatus === "SENT"
                          ? "border-[#86BC25] bg-[#86BC25]/10 text-[#86BC25]"
                          : mailSentStatus === "SENDING"
                            ? "border-sky-400 bg-sky-400/10 text-sky-400 cursor-not-allowed"
                            : "border-sky-500/50 text-sky-400 hover:bg-sky-500/10 hover:scale-[1.02]"
                      }`}
                    >
                      <Send className="h-3 w-3" />
                      {mailSentStatus === "SENT" ? "Dispatch Complete" : mailSentStatus === "SENDING" ? "Transmitting..." : "Automate Sourcing Request"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Interactive ERP Execution Console */}
          {activeScenario?.erpUpdates && (
            <div className={`border p-4 rounded-none transition-colors duration-300 ${
              isDark ? "bg-[#0D111A] border-[#1E293B]" : "bg-white border-slate-200"
            }`}>
              <h2 className={`text-xs font-mono font-bold uppercase tracking-wider mb-3.5 flex items-center gap-1.5 ${
                isDark ? "text-slate-300" : "text-slate-700"
              }`}>
                <TerminalIcon className="h-4 w-4 text-[#86BC25]" />
                ERP Webhook / MES Dispatch Console
              </h2>

              <div className="grid grid-cols-12 gap-3">
                {/* Left: JSON Code Block Payload (7 columns) */}
                <div className="col-span-12 lg:col-span-7 flex flex-col gap-2">
                  <div className="flex justify-between items-center font-mono text-[8px] text-slate-500 select-none">
                    <span>SAP S4HANA JSON WEBHOOK PAYLOAD</span>
                    <span className="text-slate-600 font-bold">API v4.2</span>
                  </div>
                  <pre className={`p-3 border font-mono text-[8.5px] leading-relaxed overflow-x-auto select-text rounded-none ${
                    isDark ? "bg-[#070A11] border-slate-900 text-sky-400" : "bg-slate-50 border-slate-200 text-sky-700"
                  }`}>
                    {JSON.stringify({
                      action: "TRIGGER_MITIGATION_WORKFLOW",
                      disruption_id: selectedThreatId,
                      approved_scenario: selectedScenarioId,
                      erp_updates: activeScenario.erpUpdates
                    }, null, 2)}
                  </pre>
                  
                  <div className="select-none flex justify-end">
                    <button
                      onClick={handleDispatchErp}
                      disabled={erpDispatchStatus !== "IDLE" || !complianceChecks.typeCertificate || !complianceChecks.aslVerified || !complianceChecks.faiQueued}
                      className={`flex items-center gap-1.5 border px-4 py-2 font-mono text-[9px] font-bold uppercase tracking-wider rounded-none cursor-pointer transition-all duration-150 ${
                        erpDispatchStatus === "SUCCESS"
                          ? "border-[#86BC25] bg-[#86BC25]/15 text-[#86BC25]"
                          : erpDispatchStatus === "DISPATCHING"
                            ? "border-sky-400 bg-sky-400/10 text-sky-400 cursor-not-allowed"
                            : complianceChecks.typeCertificate && complianceChecks.aslVerified && complianceChecks.faiQueued
                              ? "border-[#86BC25] bg-[#86BC25]/10 text-[#86BC25] hover:bg-[#86BC25] hover:text-black hover:scale-[1.02]"
                              : "border-slate-800 bg-slate-900/50 text-slate-500 cursor-not-allowed"
                      }`}
                    >
                      <RefreshCw className={`h-3 w-3 ${erpDispatchStatus === "DISPATCHING" ? "animate-spin" : ""}`} />
                      {erpDispatchStatus === "SUCCESS" ? "SAP Webhook Dispatched" : erpDispatchStatus === "DISPATCHING" ? "Connecting SAP..." : "Dispatch Webhook to SAP ERP"}
                    </button>
                  </div>
                </div>

                {/* Right: Simulated Real-time Logging terminal feed (5 columns) */}
                <div className="col-span-12 lg:col-span-5 flex flex-col gap-2">
                  <div className="flex justify-between items-center font-mono text-[8px] text-slate-500 select-none">
                    <span>LIVE CONNECTION LOGS</span>
                    <span className="text-slate-600 font-bold">115200 BAUD</span>
                  </div>

                  <div className="border border-slate-900 bg-[#04060A] p-2.5 font-mono text-[7.5px] text-[#86BC25] select-text flex flex-col gap-1 min-h-[160px] max-h-[180px] overflow-y-auto">
                    {erpLogs.length === 0 ? (
                      <div className="flex flex-1 items-center justify-center text-slate-600 text-center select-none py-12">
                        [SAP PORT LISTENER STANDBY - WAITING FOR WEBHOOK SIGN-OFF]
                      </div>
                    ) : (
                      <div className="flex flex-col gap-0.5">
                        {erpLogs.map((log, index) => (
                          <div key={index} className="leading-tight break-words font-mono">
                            {log}
                          </div>
                        ))}
                        {erpDispatchStatus === "DISPATCHING" && (
                          <div className="flex items-center gap-1.5 text-sky-400 font-mono select-none mt-1 animate-pulse">
                            <span>⚡ PROCESSING API PACKET BOUNDARY</span>
                            <span className="animate-ping font-bold">...</span>
                          </div>
                        )}
                        <div ref={erpLogsEndRef} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
