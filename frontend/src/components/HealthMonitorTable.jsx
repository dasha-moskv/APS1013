import { useState, useEffect } from "react";
import { ChevronDown, Calendar, X, ShieldAlert, CheckCircle, Clock, Building, MessageSquare, Terminal, RefreshCw } from "lucide-react";

// Integrated boardroom-grade telemetry receiver for JSON streams

export default function HealthMonitorTable({ rowData = [], loading = true }) {
  const [selectedTier, setSelectedTier] = useState("ALL");
  const [inspectedRow, setInspectedRow] = useState(null);
  
  // Interactive mock playbook states
  const [isGenerating, setIsGenerating] = useState(false);
  const [playbookGenerated, setPlaybookGenerated] = useState(false);
  const [loadingLines, setLoadingLines] = useState([]);

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

  // Sorting algorithms for dynamic, interactive columns
  const sortedRows = [...filteredRows].sort((a, b) => {
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
                    className={`group transition-all duration-1000 ease-out font-sans text-xs text-slate-800 h-10 border-l-2
                               ${isHighlighted 
                                 ? "bg-[#86BC25]/15 border-l-[#86BC25]" 
                                 : "border-l-transparent even:bg-[#F8FAFC] hover:bg-slate-100/75"}`}
                  >
                  {/* Checkbox */}
                  <td className="py-1.5 px-3 align-middle">
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
                    {row.disruption}
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
                  <td className="py-1.5 px-3 align-middle text-right">
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

          {/* Drawer Panel */}
          <div
            id="threat-drawer"
            className="fixed top-0 right-0 bottom-0 z-50 w-full sm:w-[480px] bg-[#0D111A] border-l border-[#1E293B] shadow-2xl p-6 overflow-y-auto text-white flex flex-col font-sans"
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

            {/* Severity and Likelihood Grid */}
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

            {/* Detailed Description */}
            <div className="border-t border-[#1E293B] pt-4 mb-4">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#86BC25] font-mono mb-1.5 flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5" />
                Full Risk Description
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">{inspectedRow.fullDescription}</p>
            </div>

            {/* Source Data telemetry details */}
            <div className="border-t border-[#1E293B] pt-4 mb-6">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono mb-1.5 flex items-center gap-1.5">
                <Terminal className="h-3.5 w-3.5" />
                Telemetry Source Data
              </h3>
              <div className="bg-[#111520] border border-slate-800 p-2.5 font-mono text-[9px] text-[#86BC25] break-all leading-normal">
                {inspectedRow.sourceData}
              </div>
            </div>

            {/* ── Mitigation Playbook CTAs ── */}
            <div className="mt-auto border-t border-[#1E293B] pt-4 flex flex-col gap-3">
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
                <div className="w-full bg-[#111520] border border-slate-800 p-4 flex flex-col gap-3 animate-fade-in text-slate-300">
                  {/* Playbook Header */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                    <span className="font-mono text-[9px] font-bold text-[#86BC25] uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle className="h-3.5 w-3.5" />
                      Mitigation Playbook Active
                    </span>
                    <span className="text-[9px] font-mono text-slate-500">REF: {inspectedRow.id}-PLAYBOOK</span>
                  </div>

                  {/* Prioritized Steps */}
                  <div>
                    <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Prioritized Response Steps
                    </span>
                    <ol className="list-decimal pl-4 flex flex-col gap-1.5 text-[11px] font-sans text-slate-200">
                      {inspectedRow.playbook.steps.map((step, idx) => (
                        <li key={idx} className="leading-tight pl-0.5 font-sans">
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Contacts */}
                  <div>
                    <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Critical Stakeholders Contacts
                    </span>
                    <div className="flex flex-col gap-2">
                      {inspectedRow.playbook.contacts.map((contact, idx) => (
                        <div key={idx} className="border border-slate-800 bg-[#0C111D] p-2 text-[10px] leading-tight">
                          <div className="font-bold text-white font-sans">{contact.name}</div>
                          <div className="text-slate-400 text-[9px] font-sans">{contact.role}</div>
                          <div className="font-mono text-[9px] text-[#86BC25] mt-1">{contact.email} &bull; {contact.phone}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Estimated Recovery Timeline */}
                  <div className="border-l-4 border-l-[#86BC25] bg-[#86BC25]/10 p-2.5 flex flex-col justify-between">
                    <span className="text-[9px] font-mono font-bold text-[#86BC25] uppercase tracking-wider">
                      ESTIMATED RECOVERY TIMELINE
                    </span>
                    <span className="text-white font-sans text-[11px] font-bold mt-1">
                      {inspectedRow.playbook.timeline}
                    </span>
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
