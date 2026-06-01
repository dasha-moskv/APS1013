import { useState, useEffect } from "react";
import { 
  Activity, 
  DollarSign, 
  BookOpen, 
  ArrowRight,
  UserCheck,
  Award,
  Layers,
  Globe,
  Info,
  CheckSquare
} from "lucide-react";

export default function MitigationPlaybooks({ 
  isDark, 
  threatRows = [], 
  onApprovePlaybook,
  knowledgeGraph,
  playbookData
}) {
  const activeFallbackBom = playbookData?.fallbackBom || [];
  const activeRecommendationsMap = playbookData?.playbookRecommendations || {};
  const activeDefaultRecommendations = playbookData?.defaultRecommendations || [];
  const [selectedThreatId, setSelectedThreatId] = useState("");
  const [selectedThreat, setSelectedThreat] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  
  // FAA compliance checks states
  const [complianceChecks, setComplianceChecks] = useState({
    typeCertificate: false,
    aslVerified: false,
    faiQueued: false
  });

  const [approvedList, setApprovedList] = useState({});

  useEffect(() => {
    if (threatRows && threatRows.length > 0) {
      const defaultThreat = threatRows.find(t => t.severity >= 7.0) || threatRows[0];
      setSelectedThreatId(defaultThreat.id);
    }
  }, [threatRows]);

  useEffect(() => {
    if (selectedThreatId && threatRows) {
      const threat = threatRows.find(t => t.id === selectedThreatId);
      setSelectedThreat(threat);
      setComplianceChecks({
        typeCertificate: false,
        aslVerified: false,
        faiQueued: false
      });
    }
  }, [selectedThreatId, threatRows]);

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

  const dailyExposure = selectedThreat
    ? selectedThreat.id === "FAC-001" ? 14500000 : selectedThreat.id === "SUP-001A" ? 8800000 : 4500000
    : 4500000;
  
  const isApproved = selectedThreat ? approvedList[selectedThreat.id] || false : false;

  // Dynamic Graph BOM Mapping: Traversing Decoupled Knowledge Graph
  let bom = activeFallbackBom;
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



  const recommendations = selectedThreat ? (activeRecommendationsMap[selectedThreat.id] || activeDefaultRecommendations) : activeDefaultRecommendations;

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

      {/* ---------------------------------------------------------------
          ── HIGH-PRECISION MINIMALIST N-TIER DEPENDENCY GRAPH ──
          --------------------------------------------------------------- */}
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
            <div className="col-span-12 lg:col-span-8 border border-slate-800 bg-[#070A11] relative overflow-hidden h-[290px] flex items-center justify-center">
              {/* Columns Header Titles */}
              <div className="absolute top-2 left-0 right-0 grid grid-cols-4 text-center font-mono text-[8px] font-bold text-slate-600 tracking-wider pointer-events-none select-none border-b border-slate-900 pb-1">
                <span>TIER 3: RAW</span>
                <span>TIER 2: FORGING</span>
                <span>TIER 1: SYSTEMS BASE</span>
                <span>TIER 0: ASSEMBLY</span>
              </div>

              {/* Clean Vector SVG Graph */}
              <svg className="w-full h-full pt-6 select-none" viewBox="0 0 580 290">
                {/* DRAW LINKS / EDGES */}
                {knowledgeGraph.links.map((link, idx) => {
                  const sourcePos = getSvgCoordinates(link.source);
                  const targetPos = getSvgCoordinates(link.target);

                  const isBlastRadius = selectedThreatId === link.source || selectedThreatId === link.target;
                  const linkColor = isBlastRadius ? "#334155" : "#1E293B";

                  return (
                    <g key={idx}>
                      <path
                        d={`M ${sourcePos.x} ${sourcePos.y} C ${(sourcePos.x + targetPos.x) / 2} ${sourcePos.y}, ${(sourcePos.x + targetPos.x) / 2} ${targetPos.y}, ${targetPos.x} ${targetPos.y}`}
                        fill="none"
                        stroke={linkColor}
                        strokeWidth="1"
                        strokeDasharray={isBlastRadius ? "2 2" : "none"}
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
                        r="7"
                        fill="#070A11"
                        stroke={isSelected ? "#86BC25" : "#1E293B"}
                        strokeWidth={isSelected ? "2" : "1"}
                        className="transition-all duration-150 group-hover:stroke-slate-400"
                      />

                      {/* Small Center Indicator Dot (Muted Red ONLY for Critical delays) */}
                      {critical && (
                        <circle
                          r="2.5"
                          fill="#EF4444"
                        />
                      )}

                      {/* ID Label */}
                      <text
                        y="-11"
                        textAnchor="middle"
                        fill={isSelected ? "#86BC25" : "#475569"}
                        className="font-mono text-[8px] font-bold tracking-wider pointer-events-none select-none uppercase"
                      >
                        {node.id}
                      </text>

                      {/* Hover text label */}
                      <text
                        y="15"
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

            {/* Right: Ontological Details Panel (4 columns) */}
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
                        {(hoveredNode || selectedThreat).type}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 uppercase text-[8px]">Supply Tier</span>
                      <span className="font-bold">Tier {(hoveredNode || selectedThreat).tier}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 uppercase text-[8px]">Exposure</span>
                      <span className="font-bold">${((hoveredNode || selectedThreat).dailyExposure || dailyExposure).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 uppercase text-[8px]">Safety Stock</span>
                      <span className="font-bold">{(hoveredNode || selectedThreat).bufferInventoryLevel || "Active stock"}</span>
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

      <div className="grid grid-cols-12 gap-3">
        {/* Left Control Panel: Select Threat and Business Context (4 columns) */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-3">
          {/* Active Threat Selector Dropdown */}
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
                    [{row.id}] {row.facility}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Business Context & SLA Damages */}
          {selectedThreat && (
            <div className={`border p-4 rounded-none transition-colors duration-300 ${
              isDark ? "bg-[#0D111A] border-[#1E293B]" : "bg-white border-slate-200"
            }`}>
              <h2 className={`text-xs font-mono font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5 ${
                isDark ? "text-slate-300" : "text-slate-700"
              }`}>
                <DollarSign className="h-4 w-4 text-[#86BC25]" />
                Financial Impact Metrics
              </h2>
              
              <div className="flex flex-col gap-3 font-mono text-xs select-none">
                <div className={`border p-3 flex flex-col gap-1 ${isDark ? "bg-[#111520] border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider font-mono">Daily Exposure Stop cost</span>
                  <span className="text-sm font-bold">
                    ${(dailyExposure / 1000000).toFixed(2)}M / Day
                  </span>
                </div>

                <div className="flex flex-col gap-1 text-[10px]">
                  <span className="text-slate-500 uppercase text-[9px] tracking-wider font-bold">Contractual SLA Penalty Risk</span>
                  <p className={`font-sans leading-relaxed ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    {selectedThreat.id === "FAC-001" 
                      ? "Everett line damages trigger at Day 12 ($1.5M daily penalty)."
                      : selectedThreat.id === "SUP-001A"
                        ? "Renton line halts on Day 10. Direct delivery delay is $850K/day."
                        : "SLA Warning threshold active. Alternate sourcing pre-certified shifts permitted."
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Mapped Stakeholder Contacts */}
          {selectedThreat && (
            <div className={`border p-4 rounded-none transition-colors duration-300 ${
              isDark ? "bg-[#0D111A] border-[#1E293B]" : "bg-white border-slate-200"
            }`}>
              <h2 className={`text-xs font-mono font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5 ${
                isDark ? "text-slate-300" : "text-slate-700"
              }`}>
                <UserCheck className="h-4 w-4 text-[#86BC25]" />
                Stakeholders & Comms Contacts
              </h2>
              
              <div className="flex flex-col gap-2">
                {selectedThreat.playbook.contacts.map((contact, i) => (
                  <div key={i} className={`border p-2.5 flex flex-col gap-1 text-xs ${
                    isDark ? "bg-[#111520] border-slate-800" : "bg-slate-50 border-slate-200"
                  }`}>
                    <span className={`font-bold font-sans ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                      {contact.name}
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono uppercase font-bold tracking-wider leading-none">
                      {contact.role}
                    </span>
                    <div className="text-[9px] font-mono text-slate-500 mt-1 select-all flex flex-col gap-0.5 leading-normal">
                      <span>Email: {contact.email}</span>
                      <span>Phone: {contact.phone}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Center/Right Panel: Deep-tier BOM, Historical Precedent & Decision Matrix (8 columns) */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-3">
          
          {/* G6: Tailored Mitigation Playbook Draft */}
          {selectedThreat && (
            <div className={`border p-4 rounded-none transition-colors duration-300 ${
              isDark ? "bg-[#0D111A] border-[#1E293B]" : "bg-white border-slate-200"
            }`}>
              <h2 className={`text-xs font-mono font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5 ${
                isDark ? "text-slate-300" : "text-slate-700"
              }`}>
                <BookOpen className="h-4 w-4 text-[#86BC25]" />
                Tailored Mitigation Playbook Draft (AI-Drafted G6)
              </h2>
              
              <div className="flex flex-col gap-3 font-mono text-[10px]">
                <div className={`p-3 border flex flex-col gap-1 ${
                  isDark ? "bg-[#111520] border-slate-800 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-600"
                }`}>
                  <span className="text-slate-500 uppercase text-[8px] font-bold">Estimated Recovery Timeline</span>
                  <span className={`font-sans font-bold text-xs ${isDark ? "text-white" : "text-slate-800"}`}>
                    {selectedThreat.playbook.timeline}
                  </span>
                </div>

                <div className="flex flex-col gap-2 font-sans text-xs">
                  <span className="text-slate-500 uppercase font-mono text-[8px] font-bold">AI Recommended Operational Plays</span>
                  <div className="flex flex-col gap-2">
                    {selectedThreat.playbook.steps.map((step, idx) => (
                      <div key={idx} className={`border p-2.5 flex items-start gap-2.5 ${
                        isDark ? "bg-[#111520] border-slate-800" : "bg-slate-50 border-slate-200"
                      }`}>
                        <span className="h-4 w-4 rounded-full border border-slate-800 bg-[#070A11] flex items-center justify-center font-mono text-[8px] font-bold text-slate-500 shrink-0 select-none">
                          {idx + 1}
                        </span>
                        <p className={`text-[10px] leading-relaxed ${isDark ? "text-slate-300" : "text-slate-750"}`}>
                          {step}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Deep-tier Bill of Materials (BOM) */}
          <div className={`border p-4 rounded-none transition-colors duration-300 ${
            isDark ? "bg-[#0D111A] border-[#1E293B]" : "bg-white border-slate-200"
          }`}>
            <h2 className={`text-xs font-mono font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5 ${
              isDark ? "text-slate-300" : "text-slate-700"
            }`}>
              <Layers className="h-4 w-4 text-[#86BC25]" />
              Deep-Tier BOM Hierarchy
            </h2>
            <div className="flex flex-col gap-1.5 font-mono text-[10px] select-none">
              {bom.map((b, i) => (
                <div key={i} className={`border p-2 flex items-center justify-between ${
                  isDark ? "bg-[#111520] border-slate-800 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-600"
                }`}>
                  <div className="flex flex-col">
                    <span className="text-slate-500 font-bold uppercase text-[8px] tracking-wide">
                      {typeof b.tier === 'number' ? `Tier ${b.tier}` : b.tier}
                    </span>
                    <span className={`font-sans font-bold text-xs mt-0.5 ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                      {b.part}
                    </span>
                  </div>
                  <span className="px-1.5 py-0.5 text-[8px] font-bold border uppercase border-slate-800 bg-slate-900/10">
                    {b.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Cost-Time-Risk Decision Matrix */}
          <div className={`border p-4 rounded-none transition-colors duration-300 ${
            isDark ? "bg-[#0D111A] border-[#1E293B]" : "bg-white border-slate-200"
          }`}>
            <h2 className={`text-xs font-mono font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5 ${
              isDark ? "text-slate-300" : "text-slate-700"
            }`}>
              <Activity className="h-4 w-4 text-[#86BC25]" />
              Mitigation Plays & Decision Matrix
            </h2>
            
            <div className="flex flex-col gap-2">
              <div className="overflow-x-auto select-none border border-slate-800/40">
                <table className="w-full text-left font-mono text-[10px]">
                  <thead className={`border-b ${isDark ? "bg-[#111520] border-slate-800 text-slate-400" : "bg-slate-100 border-slate-200 text-slate-600"}`}>
                    <tr>
                      <th className="p-2 uppercase tracking-wide">Mitigation Play</th>
                      <th className="p-2 uppercase tracking-wide">Workaround Cost</th>
                      <th className="p-2 uppercase tracking-wide">Time Saved (TTR)</th>
                      <th className="p-2 uppercase tracking-wide">Residual Risk</th>
                      <th className="p-2 uppercase tracking-wide">Operational Summary</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? "divide-slate-800 text-slate-300" : "divide-slate-200 text-slate-600"}`}>
                    {recommendations.map((rec, i) => (
                      <tr key={i} className={isDark ? "hover:bg-slate-900/20" : "hover:bg-slate-50"}>
                        <td className="p-2 font-bold font-sans text-xs">{rec.label}</td>
                        <td className="p-2 font-bold">${rec.cost ? rec.cost.toLocaleString() : "0"}</td>
                        <td className="p-2 font-bold">{rec.ttrDays} Days Saved</td>
                        <td className="p-2 font-bold">
                          <span className="border border-slate-800 bg-slate-900/5 px-1.5 py-0.5 text-slate-400">
                            {rec.risk}
                          </span>
                        </td>
                        <td className="p-2 font-sans text-[10px] leading-tight text-slate-500 max-w-[200px]">{rec.desc}</td>
                      </tr>
                    ))}
                    {/* Default reallocate row */}
                    <tr className={isDark ? "hover:bg-slate-900/20" : "hover:bg-slate-50"}>
                      <td className="p-2 font-bold font-sans text-xs">Standard ASL Buffer Stocking</td>
                      <td className="p-2 font-bold">$120,000</td>
                      <td className="p-2 font-bold">3 Days Saved</td>
                      <td className="p-2 font-bold">
                        <span className="border border-slate-800 bg-slate-900/5 px-1.5 py-0.5 text-slate-400">Low</span>
                      </td>
                      <td className="p-2 font-sans text-[10px] leading-tight text-slate-500 max-w-[200px]">
                        Utilize standard pre-certified buffers at Wichita depot locations.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>


          {/* Regulatory Compliance & Action Approval Panel */}
          {selectedThreat && (
            <div className={`border p-4 rounded-none transition-colors duration-300 ${
              isApproved 
                ? "border-[#86BC25] bg-[#86BC25]/5" 
                : isDark 
                  ? "bg-[#0D111A] border-slate-800" 
                  : "bg-white border-slate-200"
            }`}>
              <div className="flex items-center justify-between mb-3 border-b pb-2 select-none border-slate-700/30">
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 text-slate-300">
                  <Award className="h-4 w-4 text-slate-405" />
                  FAA Safety & Regulatory Compliance Sign-off
                </h2>
                {isApproved && (
                  <span className="text-[8px] border border-[#86BC25] bg-[#86BC25]/10 px-2 py-0.5 text-[#86BC25] font-mono font-bold uppercase animate-pulse">
                    PLAYBOOK APPROVED
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-3">
                {/* Warning Alert */}
                <div className={`border p-3 text-[10px] font-sans leading-relaxed select-none ${
                  isDark ? "bg-[#111520] border-slate-800 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-600"
                }`}>
                  <p className="font-bold uppercase font-mono text-[9px] flex items-center gap-1 mb-1">
                    <CheckSquare className="h-3.5 w-3.5 text-slate-400" />
                    FAA Type Certificate Constraint Notice
                  </p>
                  <span>
                    Aerospace parts are bound strictly by legally locked Type Certificate recipes. Sourcing adjustments must operate strictly within pre-certified ASL certified partner networks.
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
                        Verify FAA Type Certificate Integrity (No unapproved material substitutions recommended)
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
                        Cross-Reference Approved Supplier List (Sourcing capacity shifts strictly inside pre-certified ASL)
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
                        Queue First Article Inspection (FAI) Document Prep (Required to accelerate tooling shifts)
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
      </div>
    </div>
  );
}
