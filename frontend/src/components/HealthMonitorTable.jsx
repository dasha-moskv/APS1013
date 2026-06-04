import { useState, useEffect, useMemo } from "react";
import { ChevronDown, Calendar, X, CheckCircle, Clock, MessageSquare, Terminal, RefreshCw, DollarSign, FileText, AlertTriangle, Users, Award, Globe, Cpu, Radio, ThumbsUp, ThumbsDown, Star, Sparkles, AlertCircle, ArrowRight, Info } from "lucide-react";
import { getTaxonomy, getSeverityLabel, getSeverityColor, getLikelihoodLabel, getLikelihoodColor, formatTimeToHit } from "../utils/riskHeuristics";
import { LinkIcon } from "lucide-react";

export default function HealthMonitorTable({ 
  rowData = [], 
  loading = true, 
  selectedCategories = [], 
  onSelectCategories, 
  isDark, 
  onHumanFeedback, 
  onDeleteSignal,
  cSuiteData = {},
  pipelineData = {}
}) {
  const [selectedTier, setSelectedTier] = useState("ALL");
  const [inspectedRow, setInspectedRow] = useState(null);
  const [deletingRow, setDeletingRow] = useState(null);
  
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

  //Drop downs
  const [showRubricAssessment, setShowRubricAssessment] = useState(false);
  const [showEvidenceSources, setShowEvidenceSources] = useState(false);

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

  // Reset feedback states when the inspected row changes.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setFeedbackRating(0);
    setFeedbackOption(null);
    setFeedbackComment("");
    setFeedbackSubmitted(false);
    setPlaybookGenerated(false);
    setIsGenerating(false);
  }, [inspectedRow]);
  /* eslint-enable react-hooks/set-state-in-effect */

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
  const [tick, setTick] = useState(0);

  // Capture a stable 'now' timestamp that updates every tick (250ms) to avoid calling
  // Date.now() directly inside JSX (react-hooks/purity violation).
  // eslint-disable-next-line react-hooks/purity
  const now = useMemo(() => Date.now(), [tick]); // eslint-disable-line react-hooks/exhaustive-deps

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
    ? filteredRows.filter(row => selectedCategories.includes(getTaxonomy(row)))
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

  let cSuiteEnrichment = inspectedRow ? cSuiteData[inspectedRow.id] : null;
  if (!cSuiteEnrichment && inspectedRow) {
    const dailyCost = inspectedRow.severity * 1000000 || 4500000;
    const timeline = inspectedRow.timeToHit ? parseInt(inspectedRow.timeToHit) || 10 : 10;
    const workaround = inspectedRow.severity * 50000 || 250000;
    cSuiteEnrichment = {
      baseDailyExposure: dailyCost,
      baseTimelineDays: timeline,
      baseWorkaroundCost: workaround,
      slaRisk: `ELEVATED: Downstream commitments at risk. Potential delay penalty active if mitigation is not deployed in ${timeline} days.`,
      evidenceBase: `Telemetry signals log active disruption at ${inspectedRow.facility}. Emergency mitigation plan proposed to secure the node.`,
      options: [
        { id: "expedite", label: "Premium Sourcing & Express Logistics", cost: workaround * 1.5, daysSaved: Math.max(1, Math.floor(timeline * 0.3)), desc: "Bypass standard channels by utilizing fast-tracked logistics and certified backup suppliers." },
        { id: "overtime", label: "Overtime & Shift Adjustments", cost: workaround * 0.6, daysSaved: Math.max(1, Math.floor(timeline * 0.15)), desc: "Authorize emergency overtime shifts for key technicians to accelerate recovery." }
      ],
      strategicPhases: {
        immediate: inspectedRow.playbook?.mitigationPlan?.steps?.[0] || "Initiate immediate redundant routing and alternative supplier contacts.",
        tactical: inspectedRow.playbook?.mitigationPlan?.steps?.[1] || "Verify customs clearance status and coordinate with regional logistics leads.",
        structural: inspectedRow.playbook?.mitigationPlan?.steps?.[2] || "Update system inventory buffers and pre-stage backup stock levels."
      }
    };
  }

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
    let pipeline = pipelineData[row.id];
    if (!pipeline && row) {
      pipeline = {
        crawlers: [
          { type: "Logistics Manifest Crawler", icon: "Truck", detail: `Ingesting active transit manifests, port coordinates, and shipping logs for ${row.facility}.` },
          { type: "Public RSS intelligence", icon: "Globe", detail: `Scanning regional transport updates, union RSS blogs, and supply bulletins for ${row.location}.` }
        ],
        agentInsight: row.playbook?.mitigationPlan?.steps?.[0]
          ? `Parsed real-time telemetry from ${row.facility}. Projected hit time is ${row.timeToHit ? row.timeToHit + ' days' : 'immediate'}.`
          : `Monitored active signal streams and initialized automatedSCR playbooks.`,
        timestamp: row.detectedAt || "2026-06-03T08:00:00Z",
        confidence: `${(92.0 + row.severity).toFixed(1)}%`,
        latency: `${Math.floor(120 + row.severity * 15)}ms`,
        dataSize: `${(row.severity * 6.4).toFixed(1)} KB`,
        events: [
          { time: "06:12:04 UTC", label: "Initial Sensor Match", desc: `Telemetry systems flag transit discrepancy or cargo delay at ${row.facility}.` },
          { time: "06:14:20 UTC", label: "Crawler Extraction", desc: `Active crawlers scrape local shipping indices and port logs.` },
          { time: "06:17:11 UTC", label: "NLP Synthesis Loop", desc: `LLM Agent correlates pipeline feeds with historic precedence logs.` },
          { time: "06:20:00 UTC", label: "Playbook Armed", desc: `Mitigation objectives drafted and safety checkpoints pre-staged.` }
        ]
      };
    }
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
            <span className={`block uppercase text-[9px] tracking-wider ${isDark ? "text-slate-400" : "text-slate-600 font-semibold"}`}>Confidence Score</span>
            <span className="text-[#86BC25] font-bold">{pipeline.confidence}</span>
          </div>
          <div>
            <span className="text-sky-400 block uppercase text-[9px] tracking-wider font-semibold">Crawl Latency</span>
            <span className="text-sky-500 font-bold">{pipeline.latency}</span>
          </div>
          <div>
            <span className={`block uppercase text-[9px] tracking-wider ${isDark ? "text-slate-400" : "text-slate-600 font-semibold"}`}>Ingested Size</span>
            <span className={`font-bold ${isDark ? "text-slate-200" : "text-slate-700"}`}>{pipeline.dataSize}</span>
          </div>
          <div>
            <span className="text-amber-500 block uppercase text-[9px] tracking-wider font-semibold">Signal Created</span>
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
              <span className={`font-mono text-xs font-bold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-600 font-semibold"}`}>
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
              <span className={`font-mono text-xs font-bold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-600 font-semibold"}`}>
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
              <span className={`font-mono text-xs font-bold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-600 font-semibold"}`}>
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
              <span className={`text-[9px] font-mono uppercase ${isDark ? "text-slate-400" : "text-slate-600 font-semibold"}`}>Strategic Accuracy:</span>
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
                className={`py-2 px-3 w-40 text-right font-bold font-mono cursor-pointer transition-colors duration-75 select-none ${isDark ? "hover:bg-slate-800 hover:text-slate-100" : "hover:bg-slate-100 hover:text-slate-800"}`}
              >
                <div className="flex items-center justify-end gap-1">
                  <div className="relative group cursor-help inline-block leading-none mr-1">
                    <Info className="h-3.5 w-3.5 text-slate-400 hover:text-slate-200" />
                    <div className={`pointer-events-none absolute top-6 right-0 z-[100] w-80 p-3.5 border text-left shadow-2xl opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-150 rounded-none font-sans normal-case ${
                      isDark 
                        ? "bg-[#0A0D14]/95 border-[#1E293B] text-slate-200 backdrop-blur-md" 
                        : "bg-white/95 border-slate-200 text-slate-800 shadow-slate-200/50 backdrop-blur-md"
                    }`}>
                      <div className="flex items-center gap-1.5 border-b pb-1.5 mb-2 border-slate-700/30">
                        <span className="h-2 w-2 bg-red-500 rounded-none" />
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-red-400">Risk Severity Metric</span>
                      </div>
                      <p className={`text-[10px] leading-relaxed mb-2 font-medium ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                        The estimated magnitude of impact of a disruption on the supply chain node (scale of 1.0 = Low to 10.0 = Critical).
                      </p>
                      <div className={`border-t pt-2 mt-2 font-mono text-[9px] ${isDark ? "border-slate-800 text-slate-400" : "border-slate-100 text-slate-500"}`}>
                        <span className="block font-bold uppercase text-[8px] text-[#86BC25] mb-1">Computation Model:</span>
                        Baseline score of 2.5 + NLP keyword heuristic weights on news headline/description (+4.5 for critical terms like 'halt'/'shutdown', +2.5 for major like 'strike'/'defect', +0.5 for minor).
                      </div>
                    </div>
                  </div>
                  <span>Risk Severity {renderSortIndicator("severity")}</span>
                </div>
              </th>
              <th 
                onClick={() => requestSort("likelihood")}
                className={`py-2 px-3 w-36 text-right font-bold font-mono cursor-pointer transition-colors duration-75 select-none ${isDark ? "hover:bg-slate-800 hover:text-slate-100" : "hover:bg-slate-100 hover:text-slate-800"}`}
              >
                <div className="flex items-center justify-end gap-1">
                  <div className="relative group cursor-help inline-block leading-none mr-1">
                    <Info className="h-3.5 w-3.5 text-slate-400 hover:text-slate-200" />
                    <div className={`pointer-events-none absolute top-6 right-0 z-[100] w-80 p-3.5 border text-left shadow-2xl opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-150 rounded-none font-sans normal-case ${
                      isDark 
                        ? "bg-[#0A0D14]/95 border-[#1E293B] text-slate-200 backdrop-blur-md" 
                        : "bg-white/95 border-slate-200 text-slate-800 shadow-slate-200/50 backdrop-blur-md"
                    }`}>
                      <div className="flex items-center gap-1.5 border-b pb-1.5 mb-2 border-slate-700/30">
                        <span className="h-2 w-2 bg-sky-500 rounded-none" />
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-sky-400">Likelihood Metric</span>
                      </div>
                      <p className={`text-[10px] leading-relaxed mb-2 font-medium ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                        The estimated probability (0% - 100%) of the disruption occurrence at the facility.
                      </p>
                      <div className={`border-t pt-2 mt-2 font-mono text-[9px] ${isDark ? "border-slate-800 text-slate-400" : "border-slate-100 text-slate-500"}`}>
                        <span className="block font-bold uppercase text-[8px] text-[#86BC25] mb-1">Computation Model:</span>
                        Estimated from category baseline probabilities defined in the supply chain risk taxonomy templates (e.g., Labor & Workforce: 90%, Quality & Safety: 85%, Logistics: 80%, Material Shortages: 75%).
                      </div>
                    </div>
                  </div>
                  <span>Likelihood {renderSortIndicator("likelihood")}</span>
                </div>
              </th>
              <th 
                onClick={() => requestSort("timeToHit")}
                className={`py-2 px-3 w-32 text-right font-bold font-mono cursor-pointer transition-colors duration-75 select-none ${isDark ? "hover:bg-slate-800 hover:text-slate-100" : "hover:bg-slate-100 hover:text-slate-800"}`}
              >
                <div className="flex items-center justify-end gap-1">
                  <div className="relative group cursor-help inline-block leading-none mr-1">
                    <Info className="h-3.5 w-3.5 text-slate-400 hover:text-slate-200" />
                    <div className={`pointer-events-none absolute top-6 right-0 z-[100] w-80 p-3.5 border text-left shadow-2xl opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-150 rounded-none font-sans normal-case ${
                      isDark 
                        ? "bg-[#0A0D14]/95 border-[#1E293B] text-slate-200 backdrop-blur-md" 
                        : "bg-white/95 border-slate-200 text-slate-800 shadow-slate-200/50 backdrop-blur-md"
                    }`}>
                      <div className="flex items-center gap-1.5 border-b pb-1.5 mb-2 border-slate-700/30">
                        <span className="h-2 w-2 bg-amber-500 rounded-none" />
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">Time-to-hit Metric</span>
                      </div>
                      <p className={`text-[10px] leading-relaxed mb-2 font-medium ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                        Logistical latency buffer representing the number of days before the threat disrupts Boeing operations.
                      </p>
                      <div className={`border-t pt-2 mt-2 font-mono text-[9px] ${isDark ? "border-slate-800 text-slate-400" : "border-slate-100 text-slate-500"}`}>
                        <span className="block font-bold uppercase text-[8px] text-[#86BC25] mb-1">Computation Model:</span>
                        Mapped from the risk taxonomy template based on typical operational latency profiles per risk type (e.g., 0 days for Natural Disasters, 5 days for Quality sweeps, 10 days for Logistics congestion, 14 days for Labor actions).
                      </div>
                    </div>
                  </div>
                  <span>Time-to-hit {renderSortIndicator("timeToHit")}</span>
                </div>
              </th>
              <th className="py-2 px-3 w-20 text-right font-bold">Action</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDark ? "divide-[#1E293B]" : "divide-slate-100"}`}>
            {loading ? (
              /* Inline Table Loading Spinner */
              <tr>
                <td colSpan="8" className="py-10 text-center font-mono text-[10px] text-slate-400 select-none">
                  <RefreshCw className="h-4 w-4 animate-spin text-[#86BC25] inline-block mr-2 align-middle" />
                  LOADING THREAT REGISTRY DATA MATRIX...
                </td>
              </tr>
            ) : (
              sortedRows.map((row, rowIndex) => {
                  const isHighlighted = row.ingestedAt && (now - row.ingestedAt) < 4000;
                return (
                  <tr
                    key={`${row.id}-${rowIndex}`}
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
                  <td className={`py-1.5 px-3 align-middle max-w-[400px] overflow-hidden font-sans ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    <div className="flex items-center gap-1.5 min-w-0 w-full overflow-hidden whitespace-nowrap">
                      <span className={`inline-block shrink-0 font-mono text-[8px] px-1.5 py-0.5 border select-none leading-none rounded-none uppercase font-bold tracking-wider ${
                        getTaxonomy(row) === "Logistics & Transit" 
                          ? isDark ? "bg-red-950/40 text-red-400 border-red-900/50" : "bg-red-50 text-red-600 border-red-200"
                          : getTaxonomy(row) === "Operations & Capacity" 
                            ? isDark ? "bg-amber-950/40 text-amber-400 border-amber-900/50" : "bg-amber-50 text-amber-600 border-amber-200"
                            : getTaxonomy(row) === "Regulatory & Quality" 
                              ? isDark ? "bg-sky-950/40 text-sky-400 border-sky-900/50" : "bg-sky-50 text-sky-600 border-sky-200"
                              : isDark ? "bg-[#86BC25]/10 text-[#86BC25] border-[#86BC25]/30" : "bg-[#86BC25]/10 text-[#86BC25] border-[#86BC25]/20"
                      }`}>
                        {getTaxonomy(row)}
                      </span>
                      <span className="truncate min-w-0 font-medium" title={row.disruption}>{row.disruption}</span>
                    </div>
                  </td>

                  {/* Risk Severity Badge (Right-aligned numeric) */}
                  <td className="py-1.5 px-3 align-middle text-right">
                    <span
                      className={`inline-block border rounded-none px-2 py-0.5 text-[9px] font-mono font-bold tracking-wider ${getSeverityColor(row.severity, isDark)}`}
                    >
                      {getSeverityLabel(row.severity)}
                    </span>
                  </td>

                  {/* Likelihood Badge (Right-aligned numeric) */}
                  <td className="py-1.5 px-3 align-middle text-right">
                    <span
                      className={`inline-block border rounded-none px-2 py-0.5 text-[9px] font-mono font-bold tracking-wider ${getLikelihoodColor(row.likelihood, isDark)}`}
                    >
                      {getLikelihoodLabel(row.likelihood)}
                    </span>
                  </td>

                  {/* Time to hit (Right-aligned numeric/text) */}
                  <td className={`py-1.5 px-3 align-middle text-right font-mono text-[10px] font-semibold ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    {formatTimeToHit(row.timeToHit)}
                  </td>

                  {/* Action inspect button with tactile hit fill state */}
                  <td className="py-1.5 px-3 align-middle text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setInspectedRow(row)}
                      className="cursor-pointer border border-[#86BC25] bg-transparent text-[#86BC25] px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase rounded-none hover:bg-[#86BC25] hover:text-black transition-colors duration-75"
                    >
                      INSPECT
                    </button>
                    <button
                      onClick={() => setDeletingRow(row)}
                      className="cursor-pointer border border-red-500 bg-transparent text-red-500 px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase rounded-none hover:bg-red-500 hover:text-white transition-colors duration-75 ml-1.5"
                    >
                      DELETE
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
                <span className={`font-mono text-[10px] font-bold tracking-wider uppercase ${isDark ? "text-slate-400" : "text-slate-600"}`}>
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
                <div className="flex items-center justify-between">
                  <span className={`font-bold uppercase tracking-wider text-[8px] ${isDark ? "text-slate-400" : "text-slate-600"}`}>SEVERITY</span>
                  <div className="relative group cursor-help inline-block leading-none">
                    <Info className="h-3 w-3 text-slate-400 hover:text-slate-250 cursor-pointer" />
                    <div className={`pointer-events-none absolute bottom-full right-0 mb-2 z-[100] w-64 p-3 border text-left shadow-2xl opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-150 rounded-none font-sans ${
                      isDark ? "bg-[#0A0D14]/98 border-[#1E293B] text-slate-200 backdrop-blur-md" : "bg-white/98 border-slate-200 text-slate-800 shadow-slate-200/50 backdrop-blur-md"
                    }`}>
                      <p className={`text-[10px] leading-relaxed font-medium mb-1.5 ${isDark ? "text-slate-350" : "text-slate-650"}`}>
                        <strong>What it is:</strong> An estimate of how damaging the disruption could be to operations, delivery timelines, costs, or supply continuity.
                      </p>
                      <p className={`text-[10px] leading-relaxed font-medium ${isDark ? "text-slate-350" : "text-slate-650"}`}>
                        <strong>How it is generated:</strong> The LLM agent assigns this rating using a severity rubric.
                      </p>
                    </div>
                  </div>
                </div>
                <span className={`font-bold text-[11px] mt-1 ${getSeverityColor(inspectedRow.severity, isDark).split(' ')[0]}`}>{getSeverityLabel(inspectedRow.severity).split(" ")[0]}</span>
              </div>

              <div className={`border p-2.5 flex flex-col justify-between ${isDark ? "border-[#1E293B] bg-[#0F1520]" : "border-slate-200 bg-slate-50"}`}>
                <div className="flex items-center justify-between">
                  <span className={`font-bold uppercase tracking-wider text-[8px] ${isDark ? "text-slate-400" : "text-slate-600"}`}>LIKELIHOOD</span>
                  <div className="relative group cursor-help inline-block leading-none">
                    <Info className="h-3 w-3 text-slate-400 hover:text-slate-250 cursor-pointer" />
                    <div className={`pointer-events-none absolute bottom-full right-0 mb-2 z-[100] w-64 p-3 border text-left shadow-2xl opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-150 rounded-none font-sans ${
                      isDark ? "bg-[#0A0D14]/98 border-[#1E293B] text-slate-200 backdrop-blur-md" : "bg-white/98 border-slate-200 text-slate-800 shadow-slate-200/50 backdrop-blur-md"
                    }`}>
                      <p className={`text-[10px] leading-relaxed font-medium mb-1.5 ${isDark ? "text-slate-350" : "text-slate-650"}`}>
                        <strong>What it is:</strong> An estimate of how probable it is that the disruption will materially affect the supply chain.
                      </p>
                      <p className={`text-[10px] leading-relaxed font-medium ${isDark ? "text-slate-350" : "text-slate-650"}`}>
                        <strong>How it is generated:</strong> The LLM agent assigns this rating using a likelihood rubric.
                      </p>
                    </div>
                  </div>
                </div>
                <span className={`font-bold text-[11px] mt-1 ${getLikelihoodColor(inspectedRow.likelihood, isDark).split(' ')[0]}`}>{getLikelihoodLabel(inspectedRow.likelihood).split(" ")[0]}</span>
              </div>

              <div className={`border p-2.5 flex flex-col justify-between ${isDark ? "border-[#1E293B] bg-[#0F1520]" : "border-slate-200 bg-slate-50"}`}>
                <div className="flex items-center justify-between">
                  <span className={`font-bold uppercase tracking-wider text-[8px] ${isDark ? "text-slate-400" : "text-slate-600"}`}>TIME TO HIT</span>
                  <div className="relative group cursor-help inline-block leading-none">
                    <Info className="h-3 w-3 text-slate-400 hover:text-slate-250 cursor-pointer" />
                    <div className={`pointer-events-none absolute bottom-full right-0 mb-2 z-[100] w-64 p-3 border text-left shadow-2xl opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-150 rounded-none font-sans ${
                      isDark ? "bg-[#0A0D14]/98 border-[#1E293B] text-slate-200 backdrop-blur-md" : "bg-white/98 border-slate-200 text-slate-800 shadow-slate-200/50 backdrop-blur-md"
                    }`}>
                      <p className={`text-[10px] leading-relaxed font-medium mb-1.5 ${isDark ? "text-slate-350" : "text-slate-650"}`}>
                        <strong>What it is:</strong> The estimated number of days before the disruption begins affecting operations or downstream supply availability.
                      </p>
                      <p className={`text-[10px] leading-relaxed font-medium ${isDark ? "text-slate-350" : "text-slate-650"}`}>
                        <strong>How it is generated:</strong> The LLM agent assigns this estimate using a timing rubric.
                      </p>
                    </div>
                  </div>
                </div>
                <span className={`font-bold text-[11px] mt-1 ${isDark ? "text-slate-200" : "text-slate-800"}`}>{formatTimeToHit(inspectedRow.timeToHit)}</span>
              </div>

              <div className={`border p-2.5 flex flex-col justify-between ${isDark ? "border-[#1E293B] bg-[#0F1520]" : "border-slate-200 bg-slate-50"}`}>
                <div className="flex items-center justify-between">
                  <span className={`font-bold uppercase tracking-wider text-[8px] ${isDark ? "text-slate-400" : "text-slate-600"}`}>TAXONOMY</span>
                  <div className="relative group cursor-help inline-block leading-none">
                    <Info className="h-3 w-3 text-slate-400 hover:text-slate-250 cursor-pointer" />
                    <div className={`pointer-events-none absolute bottom-full right-0 mb-2 z-[100] w-64 p-3 border text-left shadow-2xl opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-150 rounded-none font-sans ${
                      isDark ? "bg-[#0A0D14]/98 border-[#1E293B] text-slate-200 backdrop-blur-md" : "bg-white/98 border-slate-200 text-slate-800 shadow-slate-200/50 backdrop-blur-md"
                    }`}>
                      <p className={`text-[10px] leading-relaxed font-medium mb-1.5 ${isDark ? "text-slate-350" : "text-slate-650"}`}>
                        <strong>What it is:</strong> The disruption category used to classify the type of supply chain risk represented by the signal.
                      </p>
                      <p className={`text-[10px] leading-relaxed font-medium ${isDark ? "text-slate-350" : "text-slate-650"}`}>
                        <strong>How it is generated:</strong> The backend assigns this category using a taxonomy rubric, matching the signal text against disruption patterns.
                      </p>
                    </div>
                  </div>
                </div>
                <span className="text-[#86BC25] font-bold text-[9px] mt-1 leading-tight">{getTaxonomy(inspectedRow)}</span>
              </div>
            </div>
            {/* Detailed Rubric Assessment Dropdown */}
            <div className={`mb-5 border ${isDark ? "border-[#1E293B] bg-[#0A0D14]" : "border-slate-200 bg-white"}`}>
              <button
                type="button"
                onClick={() => setShowRubricAssessment(prev => !prev)}
                className={`w-full px-4 py-3 flex items-center justify-between text-left transition-colors ${
                  isDark ? "hover:bg-[#0F1520]" : "hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-[#86BC25]" />
                  <span className={`font-mono text-[10px] font-bold uppercase tracking-wider ${
                    isDark ? "text-slate-200" : "text-slate-800"
                  }`}>
                    Detailed Rubric Assessment
                  </span>
                </div>

                <ChevronDown
                  className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                    showRubricAssessment ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showRubricAssessment && (
                <div className={`border-t px-4 py-4 font-sans text-[11px] ${
                  isDark ? "border-[#1E293B] text-slate-300" : "border-slate-200 text-slate-700"
                }`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className={`border p-3 ${isDark ? "border-[#1E293B] bg-[#0F1520]" : "border-slate-200 bg-slate-50"}`}>
                      <p className="font-mono text-[9px] font-bold uppercase tracking-wider text-[#86BC25] mb-1">
                        Severity Score
                      </p>
                      <p>
                        The LLM assigned a severity of <strong>{inspectedRow.severity}</strong>: {inspectedRow.severity_justification}
                      </p>
                    </div>

                    <div className={`border p-3 ${isDark ? "border-[#1E293B] bg-[#0F1520]" : "border-slate-200 bg-slate-50"}`}>
                      <p className="font-mono text-[9px] font-bold uppercase tracking-wider text-[#86BC25] mb-1">
                        Likelihood Score
                      </p>
                      <p>
                        The LLM assigned a likelihood of <strong>{inspectedRow.likelihood}%</strong>: {inspectedRow.likelihood_justification}
                      </p>
                    </div>

                    <div className={`border p-3 ${isDark ? "border-[#1E293B] bg-[#0F1520]" : "border-slate-200 bg-slate-50"}`}>
                      <p className="font-mono text-[9px] font-bold uppercase tracking-wider text-[#86BC25] mb-1">
                        Time-to-Hit Estimate
                      </p>
                      <p>
                        The LLM estimated <strong>{formatTimeToHit(inspectedRow.timeToHit)}</strong>: {inspectedRow.timeToHit_justification}
                      </p>
                    </div>
                    <div className={`border p-3 ${isDark ? "border-[#1E293B] bg-[#0F1520]" : "border-slate-200 bg-slate-50"}`}>
                      <p className="font-mono text-[9px] font-bold uppercase tracking-wider text-[#86BC25] mb-1">
                        Taxonomy Classification
                      </p>
                      <p>
                        Our backend classification engine performed a keyword-based taxonomy analysis on the signal content and assigned it to <strong>{getTaxonomy(inspectedRow)}</strong>, the category with the highest keyword match frequency.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* Evidence Sources Dropdown */}
            <div className={`mb-5 border ${isDark ? "border-[#1E293B] bg-[#0A0D14]" : "border-slate-200 bg-white"}`}>
              <button
                type="button"
                onClick={() => setShowEvidenceSources(prev => !prev)}
                className={`w-full px-4 py-3 flex items-center justify-between text-left transition-colors ${
                  isDark ? "hover:bg-[#0F1520]" : "hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <LinkIcon className="h-3.5 w-3.5 text-[#86BC25]" />
                  <span className={`font-mono text-[10px] font-bold uppercase tracking-wider ${
                    isDark ? "text-slate-200" : "text-slate-800"
                  }`}>
                    Evidence Sources
                  </span>
                </div>

                <ChevronDown
                  className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                    showEvidenceSources ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showEvidenceSources && (
                <div className={`border-t px-4 py-4 ${
                  isDark ? "border-[#1E293B]" : "border-slate-200"
                }`}>
                  <div className="space-y-3">
                    {(inspectedRow.sources || []).map((source, index) => (
                      <div
                        key={`${source.title}-${index}`}
                        className={`border p-3 ${
                          isDark ? "border-[#1E293B] bg-[#0F1520]" : "border-slate-200 bg-slate-50"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-mono text-[9px] font-bold uppercase tracking-wider text-[#86BC25] mb-1">
                              Source {index + 1}
                            </p>

                            <p className={`text-[11px] font-bold leading-snug ${
                              isDark ? "text-slate-200" : "text-slate-800"
                            }`}>
                              {source.title}
                            </p>
                          </div>

                          {source.url && (
                            <a
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`shrink-0 font-mono text-[9px] uppercase tracking-wider underline underline-offset-2 ${
                                isDark ? "text-slate-400 hover:text-[#86BC25]" : "text-slate-600 hover:text-[#86BC25]"
                              }`}
                            >
                              Open
                            </a>
                          )}
                        </div>

                        <p className={`mt-2 text-[10px] leading-relaxed ${
                          isDark ? "text-slate-350" : "text-slate-650"
                        }`}>
                          {source.summary}
                        </p>
                      </div>
                    ))}

                    {(!inspectedRow.sources || inspectedRow.sources.length === 0) && (
                      <div className={`border p-3 ${
                        isDark ? "border-[#1E293B] bg-[#0F1520] text-slate-400" : "border-slate-200 bg-slate-50 text-slate-600"
                      }`}>
                        <p className="font-sans text-[11px]">
                          No source evidence has been attached to this signal yet.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            {/* ── PRE-PLAYBOOK VIEW ── */}
            {!playbookGenerated && (
              <div className="flex flex-col gap-5">
                {/* Full Risk Description & Executive Briefing */}
                <div className={`border p-4 flex flex-col gap-3.5 ${isDark ? "border-[#1E293B] bg-[#0A0D14]" : "border-slate-200 bg-slate-50"}`}>
                  <div>
                    <div className="flex items-center justify-between select-none">
                      <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#86BC25] font-mono mb-1.5 flex items-center gap-1.5">
                        <MessageSquare className="h-3.5 w-3.5" />
                        Executive Governance & Risk Briefing
                      </h3>
                      <div className="relative group cursor-help inline-block leading-none">
                        <Info className="h-3.5 w-3.5 text-slate-400 hover:text-slate-250 cursor-pointer" />
                        <div className={`pointer-events-none absolute bottom-full right-0 mb-2 z-[100] w-72 p-3.5 border text-left shadow-2xl opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-150 rounded-none font-sans ${
                          isDark 
                            ? "bg-[#0A0D14]/98 border-[#1E293B] text-slate-200 backdrop-blur-md" 
                            : "bg-white/98 border-slate-200 text-slate-800 shadow-slate-200/50 backdrop-blur-md"
                        }`}>
                          <div className="flex items-center gap-1.5 border-b pb-1.5 mb-2 border-slate-700/30">
                            <span className="h-2 w-2 bg-[#86BC25] rounded-none" />
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#86BC25]">Risk Briefing Generation</span>
                          </div>
                          <p className={`text-[10px] leading-relaxed font-medium mb-1.5 ${isDark ? "text-slate-350" : "text-slate-650"}`}>
                            <strong>What it is:</strong> A synthesized natural-language overview summarizing the active supply chain threat and affected nodes.
                          </p>
                          <p className={`text-[10px] leading-relaxed font-medium ${isDark ? "text-slate-350" : "text-slate-650"}`}>
                            <strong>How it is generated:</strong> Gathered via Public Signal Collectors (Global News/Social/Industry feeds) during Ingestion, parsed through the Ingestion & Taxonomy pipeline, filtered for noise by the Processing Engine, and finally validated as a genuine anomaly by the AI Judge (Phase 1: MVP - Core Detection).
                          </p>
                        </div>
                      </div>
                    </div>
                    <p className={`text-xs leading-relaxed font-sans ${isDark ? "text-slate-200" : "text-slate-700"}`}>{inspectedRow.fullDescription}</p>
                  </div>

                  {/* C-Suite Strategic Insights Overlay */}
                  <div className={`grid grid-cols-1 md:grid-cols-2 gap-3 border-t pt-3.5 font-sans text-[11px] ${isDark ? "border-[#1E293B]" : "border-slate-200"}`}>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between select-none">
                        <span className="font-mono text-[9px] font-bold text-amber-500 uppercase tracking-wider">
                          Downstream Business Impact
                        </span>
                        <div className="relative group cursor-help inline-block leading-none">
                          <Info className="h-3 w-3 text-slate-400 hover:text-slate-250 cursor-pointer" />
                          <div className={`pointer-events-none absolute bottom-full right-0 mb-2 z-[100] w-72 p-3.5 border text-left shadow-2xl opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-150 rounded-none font-sans ${
                            isDark 
                              ? "bg-[#0A0D14]/98 border-[#1E293B] text-slate-200 backdrop-blur-md" 
                              : "bg-white/98 border-slate-200 text-slate-800 shadow-slate-200/50 backdrop-blur-md"
                          }`}>
                            <div className="flex items-center gap-1.5 border-b pb-1.5 mb-2 border-slate-700/30">
                              <span className="h-2 w-2 bg-amber-500 rounded-none" />
                              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-500">Business Impact Analysis</span>
                            </div>
                            <p className={`text-[10px] leading-relaxed font-medium mb-1.5 ${isDark ? "text-slate-350" : "text-slate-650"}`}>
                              <strong>What it is:</strong> Projected operational/financial schedule disruption to Boeing's downstream assembly facilities.
                            </p>
                            <p className={`text-[10px] leading-relaxed font-medium ${isDark ? "text-slate-350" : "text-slate-650"}`}>
                              <strong>How it is generated:</strong> Formulated by the Processing Engine's scoring model (Likelihood, Impact, Time-to-Hit) mapping the validated anomaly's affected parts against the N-tier dependency linkages in the Knowledge Graph (Phase 1: MVP - Core Detection).
                            </p>
                          </div>
                        </div>
                      </div>
                      <p className={`${isDark ? "text-slate-300" : "text-slate-600"} leading-relaxed`}>
                        {inspectedRow.downstreamBusinessImpact || inspectedRow.mapPosition?.downstreamBusinessImpact || "Threatens core SLA commitments and operational run-rates at primary integration hubs."}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between select-none">
                        <span className="font-mono text-[9px] font-bold text-sky-500 uppercase tracking-wider">
                          Mitigation Objective
                        </span>
                        <div className="relative group cursor-help inline-block leading-none">
                          <Info className="h-3.5 w-3.5 text-slate-400 hover:text-slate-250 cursor-pointer" />
                          <div className={`pointer-events-none absolute bottom-full right-0 mb-2 z-[100] w-72 p-3.5 border text-left shadow-2xl opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-150 rounded-none font-sans ${
                            isDark 
                              ? "bg-[#0A0D14]/98 border-[#1E293B] text-slate-200 backdrop-blur-md" 
                              : "bg-white/98 border-slate-200 text-slate-800 shadow-slate-200/50 backdrop-blur-md"
                          }`}>
                            <div className="flex items-center gap-1.5 border-b pb-1.5 mb-2 border-slate-700/30">
                              <span className="h-2 w-2 bg-sky-500 rounded-none" />
                              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-sky-500">Mitigation Objective Formulation</span>
                            </div>
                            <p className={`text-[10px] leading-relaxed font-medium mb-1.5 ${isDark ? "text-slate-350" : "text-slate-650"}`}>
                              <strong>What it is:</strong> The primary target goal for stabilizing operations and securing the supply node.
                            </p>
                            <p className={`text-[10px] leading-relaxed font-medium ${isDark ? "text-slate-350" : "text-slate-650"}`}>
                              <strong>How it is generated:</strong> Formulated by the Mitigation & Decision Support Engine (Phase 2: Playbook & Scenarios) by analyzing supplier profile status, logistics/transit corridor delays, and industrial alternatives.
                            </p>
                          </div>
                        </div>
                      </div>
                      <p className={`${isDark ? "text-slate-300" : "text-slate-600"} leading-relaxed`}>
                        {inspectedRow.mitigationObjective || inspectedRow.mapPosition?.mitigationObjective || "Establish immediate redundant routing profiles and secure certified secondary supplies."}
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
            
            {playbookGenerated && (
              <div className={`w-full flex flex-col gap-6 animate-fade-in ${isDark ? "text-slate-200" : "text-slate-700"}`}>

                  {/* C-Suite Executive Telemetry Dashboard */}
                  {cSuiteEnrichment && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {/* KPI Card 1: Revenue at Risk */}
                      <div className={`border p-4 flex flex-col justify-between rounded-none relative overflow-hidden group select-none ${isDark ? "border-[#1E293B] bg-[#0A0D14]" : "border-slate-200 bg-slate-50"}`}>
                        <div className={`flex items-center justify-between border-b pb-1.5 mb-1.5 ${isDark ? "border-slate-800" : "border-slate-200"}`}>
                          <span className={`text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 ${isDark ? "text-slate-400" : "text-slate-700"}`}>
                            <AlertTriangle className={`h-3.5 w-3.5 ${isDark ? "text-slate-500" : "text-slate-600"}`} />
                            Revenue Exposure
                          </span>
                          <span className={`text-xs font-mono border px-1.5 py-0.5 ${isDark ? "text-red-400 bg-red-950/20 border-red-900/30" : "text-red-600 bg-red-50 border-red-100"}`}>
                            -{(((totalFinancialAtRisk - mitigatedTotalExposure) / Math.max(1, totalFinancialAtRisk)) * 100).toFixed(0)}% Risk
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between mt-2 gap-2">
                          <div className="flex-1">
                            <span className={`text-[10px] font-mono block uppercase ${isDark ? "text-slate-500" : "text-slate-600"}`}>Unmitigated</span>
                            <span className={`text-sm font-bold font-mono ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                              ${(totalFinancialAtRisk / 1000000).toFixed(1)}M
                            </span>
                          </div>
                          
                          <ArrowRight className="h-4 w-4 text-slate-500 shrink-0 self-center" />
                          
                          <div className="text-right flex-1">
                            <span className={`text-xs font-mono block uppercase font-bold ${isDark ? "text-slate-400" : "text-slate-600"}`}>Mitigated Target</span>
                            <span className={`text-lg font-black font-mono ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                              ${(mitigatedTotalExposure / 1000000).toFixed(1)}M
                            </span>
                          </div>
                        </div>

                        <div className={`mt-3 border-t pt-2 flex justify-between items-center text-xs font-mono ${isDark ? "border-slate-800/80 text-slate-500" : "border-slate-200/80 text-slate-500"}`}>
                          <span>EXPOSURE AVOIDED:</span>
                          <span className="text-[#86BC25] font-bold">
                            -${((totalFinancialAtRisk - mitigatedTotalExposure) / 1000000).toFixed(1)}M
                          </span>
                        </div>
                      </div>

                      {/* KPI Card 2: Total Mitigation CapEx */}
                      <div className={`border p-4 flex flex-col justify-between rounded-none relative overflow-hidden group select-none ${isDark ? "border-[#1E293B] bg-[#0A0D14]" : "border-slate-200 bg-slate-50"}`}>
                        <div className={`flex items-center justify-between border-b pb-1.5 mb-1.5 ${isDark ? "border-slate-800" : "border-slate-200"}`}>
                          <span className={`text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 ${isDark ? "text-slate-400" : "text-slate-700"}`}>
                            <DollarSign className={`h-3.5 w-3.5 ${isDark ? "text-slate-500" : "text-slate-600"}`} />
                            Mitigation CapEx
                          </span>
                          <span className={`text-xs font-mono border px-1.5 py-0.5 ${isDark ? "text-slate-400 border-slate-850 bg-slate-900" : "text-slate-500 border-slate-200 bg-slate-100/50"}`}>
                            Clearance Checked
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between mt-2 gap-2">
                          <div className="flex-1">
                            <span className={`text-[10px] font-mono block uppercase ${isDark ? "text-slate-500" : "text-slate-600"}`}>Base Cost</span>
                            <span className={`text-sm font-bold font-mono ${isDark ? "text-slate-300" : "text-slate-650"}`}>
                              ${(cSuiteEnrichment.baseWorkaroundCost / 1000).toFixed(0)}K
                            </span>
                          </div>
                          
                          <ArrowRight className="h-4 w-4 text-slate-500 shrink-0 self-center" />
                          
                          <div className="text-right flex-1">
                            <span className={`text-xs font-mono block uppercase font-bold ${isDark ? "text-slate-400" : "text-slate-600"}`}>Final Cost</span>
                            <span className={`text-lg font-black font-mono ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                              ${(mitigatedWorkaroundCost / 1000).toFixed(0)}K
                            </span>
                          </div>
                        </div>

                        <div className={`mt-3 border-t pt-2 flex justify-between items-center text-xs font-mono ${isDark ? "border-slate-800/80 text-slate-500" : "border-slate-200/80 text-slate-500"}`}>
                          <span>CAPEX PREMIUM:</span>
                          <span className="font-bold text-slate-400">
                            +${((mitigatedWorkaroundCost - cSuiteEnrichment.baseWorkaroundCost) / 1000).toFixed(0)}K
                          </span>
                        </div>
                      </div>

                      {/* KPI Card 3: Est. Recovery Timeline */}
                      <div className={`border p-4 flex flex-col justify-between rounded-none relative overflow-hidden group select-none ${isDark ? "border-[#1E293B] bg-[#0A0D14]" : "border-slate-200 bg-slate-50"}`}>
                        <div className={`flex items-center justify-between border-b pb-1.5 mb-1.5 ${isDark ? "border-slate-800" : "border-slate-200"}`}>
                          <span className={`text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 ${isDark ? "text-slate-400" : "text-slate-700"}`}>
                            <Clock className={`h-3.5 w-3.5 ${isDark ? "text-slate-500" : "text-slate-600"}`} />
                            Recovery Timeline
                          </span>
                          <span className={`text-xs font-mono border px-1.5 py-0.5 ${isDark ? "text-slate-400 border-slate-850 bg-slate-900" : "text-slate-500 border-slate-200 bg-slate-100/50"}`}>
                            Time Saved
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between mt-2 gap-2">
                          <div className="flex-1">
                            <span className={`text-[10px] font-mono block uppercase ${isDark ? "text-slate-500" : "text-slate-600"}`}>Base Cycle</span>
                            <span className={`text-sm font-bold font-mono ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                              {cSuiteEnrichment.baseTimelineDays} Days
                            </span>
                          </div>
                          
                          <ArrowRight className="h-4 w-4 text-slate-500 shrink-0 self-center" />
                          
                          <div className="text-right flex-1">
                            <span className={`text-xs font-mono block uppercase font-bold ${isDark ? "text-slate-400" : "text-slate-600"}`}>Optimal Run</span>
                            <span className={`text-lg font-black font-mono ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                              {mitigatedTimelineDays.toFixed(1)} Days
                            </span>
                          </div>
                        </div>

                        <div className={`mt-3 border-t pt-2 flex justify-between items-center text-xs font-mono ${isDark ? "border-slate-800/80 text-slate-500" : "border-slate-200/80 text-slate-500"}`}>
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
                    <div className={`border p-3 flex items-center justify-between rounded-none select-none ${
                      isDark ? "border-slate-800 bg-[#0E131F]" : "border-slate-200 bg-slate-50"
                    }`}>
                      <div className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-slate-400" />
                        <div>
                          <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
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
                      
                      {/* Active Supply Chain Risk Restatement */}
                      <div className={`border p-4 flex flex-col gap-3 border-l-4 border-l-red-500 ${
                        isDark ? "border-y-slate-800 border-r-slate-800 bg-[#160B0B]" : "border-y-slate-200 border-r-slate-200 bg-red-50/20"
                      }`}>
                        <div className="flex items-center gap-2 select-none">
                          <AlertCircle className="h-4.5 w-4.5 text-red-500" />
                          <h4 className="text-xs font-bold uppercase tracking-wider text-red-500 font-mono">
                            Active Supply Chain Risk Restatement
                          </h4>
                        </div>
                        <div className="text-xs flex flex-col gap-1.5 font-sans leading-relaxed">
                          <p className={`font-semibold ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                            Disruption Incident: <span className="underline decoration-red-500/40">{inspectedRow.disruption}</span>
                          </p>
                          <p className={isDark ? "text-slate-300" : "text-slate-600"}>
                            <strong>Downstream Operation Impact:</strong> {inspectedRow.fullDescription}
                          </p>
                          <div className={`p-2.5 border font-mono text-xs select-none ${isDark ? "bg-[#070A11] border-slate-800 text-red-400" : "bg-white border-slate-200 text-red-700"}`}>
                            <strong>CRITICAL CORRIDOR THREAT:</strong> This node represents a vital supply bottleneck. Failure to enact the playbook within the target buffer window escalates the risk parameter directly to severe contract penalties.
                          </div>
                        </div>
                      </div>

                      {/* Strategic Action Plan (Immediate, Tactical, Policy) */}
                      <div className={`border p-4 flex flex-col gap-4 ${isDark ? "border-[#1E293B] bg-[#0A0D14]" : "border-slate-200 bg-slate-50"}`}>
                        <div>
                          <h4 className={`text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 ${isDark ? "text-slate-300" : "text-slate-800"}`}>
                            <FileText className={`h-4 w-4 ${isDark ? "text-slate-500" : "text-slate-650"}`} />
                            Prioritized Strategic Action Plan
                          </h4>
                          <p className={`text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                            Standard Operating Procedures (SOP) mapped across time horizons to secure the node.
                          </p>
                        </div>

                        {cSuiteEnrichment && (
                          <div className="flex flex-col gap-4 font-sans text-xs">
                            {/* Phase 1 */}
                            <div className="flex gap-3 border-l-2 border-slate-700 pl-3 py-1">
                              <div className="flex-1 flex flex-col gap-2">
                                <span className={`font-mono text-xs font-bold uppercase tracking-wider ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                                  PHASE 1 &bull; IMMEDIATE CONTAINMENT (0 - 48 HOURS)
                                </span>
                                <p className={`leading-relaxed font-sans text-xs ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                                  {cSuiteEnrichment.strategicPhases.immediate}
                                </p>
                                <div className={`p-3 border flex flex-col gap-1.5 font-mono text-[10px] leading-relaxed ${isDark ? "bg-slate-950/40 border-[#1E293B] text-slate-400" : "bg-slate-100/50 border-slate-200 text-slate-500"}`}>
                                  <span className="font-bold uppercase text-slate-500">Immediate Tasks & Protocols:</span>
                                  <ul className="list-disc pl-4 flex flex-col gap-1">
                                    <li>Flag internal quality inspectors to trace affected batch footprints.</li>
                                    <li>Assess safety stock levels held in regional storage warehouses.</li>
                                    <li>Notify on-call engineering supervisors to start physical line checks.</li>
                                  </ul>
                                </div>
                              </div>
                            </div>

                            {/* Phase 2 */}
                            <div className="flex gap-3 border-l-2 border-slate-700 pl-3 py-1">
                              <div className="flex-1 flex flex-col gap-2">
                                <span className={`font-mono text-xs font-bold uppercase tracking-wider ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                                  PHASE 2 &bull; ALTERNATE ROUTING & RE-SOURCING (48H - 2 WEEKS)
                                </span>
                                <p className={`leading-relaxed font-sans text-xs ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                                  {cSuiteEnrichment.strategicPhases.tactical}
                                </p>
                                <div className={`p-3 border flex flex-col gap-1.5 font-mono text-[10px] leading-relaxed ${isDark ? "bg-slate-950/40 border-[#1E293B] text-slate-400" : "bg-slate-100/50 border-slate-200 text-slate-500"}`}>
                                  <span className="font-bold uppercase text-slate-500">Alternate Logistics Protocols:</span>
                                  <ul className="list-disc pl-4 flex flex-col gap-1">
                                    <li>Deploy dedicated flatbed courier fleets under pre-file DOT permits.</li>
                                    <li>Re-allocate inbound shipments to pre-approved secondary sea-port bays.</li>
                                    <li>Coordinate receiving crane and storage bay schedules with regional leads.</li>
                                  </ul>
                                </div>
                              </div>
                            </div>

                            {/* Phase 3 */}
                            <div className="flex gap-3 border-l-2 border-slate-700 pl-3 py-1">
                              <div className="flex-1 flex flex-col gap-2">
                                <span className={`font-mono text-xs font-bold uppercase tracking-wider ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                                  PHASE 3 &bull; CAPITAL POLICY & RESILIENCY ADJUSTMENT
                                </span>
                                <p className={`leading-relaxed font-sans text-xs ${isDark ? "text-slate-400" : "text-slate-650"}`}>
                                  {cSuiteEnrichment.strategicPhases.structural}
                                </p>
                                <div className={`p-3 border flex flex-col gap-1.5 font-mono text-[10px] leading-relaxed ${isDark ? "bg-slate-950/40 border-[#1E293B] text-slate-400" : "bg-slate-100/50 border-slate-200 text-slate-500"}`}>
                                  <span className="font-bold uppercase text-slate-500">Resiliency Policy Adjustments:</span>
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
                              ? "border-[#86BC25]/60 bg-[#86BC25]/5" 
                              : isDark
                                ? "border-[#1E293B] bg-[#0A0D14]"
                                : "border-slate-200 bg-slate-50"
                          }`}>
                            <div>
                              <div className="flex items-center justify-between">
                                <h4 className={`text-[10px] font-bold uppercase tracking-wider font-mono ${isDark ? "text-slate-400" : "text-slate-700"}`}>
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
                                <span className={`text-[9px] font-mono uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-600 font-semibold"}`}>SLA & Contractual Exposure</span>
                                <p className={`leading-snug font-sans text-[10px] ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                                  {cSuiteEnrichment.slaRisk}
                                </p>
                              </div>

                              {/* Evidence-Based Risk Foundation */}
                              <div className={`flex flex-col gap-1 border-b pb-2.5 ${isDark ? "border-[#1E293B]" : "border-slate-200"}`}>
                                <span className={`text-[9px] font-mono uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-600 font-semibold"}`}>Evidence-Based Risk Foundation</span>
                                <p className={`leading-snug font-sans text-[10px] ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                                  {cSuiteEnrichment.evidenceBase}
                                </p>
                              </div>

                              {/* Compliance & Capital Threshold Check */}
                              <div className={`flex flex-col gap-2 border-b pb-2.5 ${isDark ? "border-[#1E293B]" : "border-slate-200"}`}>
                                <span className={`text-[9px] font-mono uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-600 font-semibold"}`}>Compliance & Capital Threshold Check</span>
                                <div className={`grid grid-cols-2 gap-2 border p-2 font-mono text-[9px] select-none ${isDark ? "bg-[#0F1520] border-slate-800" : "bg-white border-slate-200"}`}>
                                  <div>
                                    <span className="text-slate-500 block text-[8px] uppercase">Expedited CapEx Limit</span>
                                    <span className={`font-bold ${isDark ? "text-slate-300" : "text-slate-800"}`}>$1,000,000</span>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-slate-500 block text-[8px] uppercase">Projected Run Cost</span>
                                    <span className={`font-bold ${mitigatedWorkaroundCost > 1000000 ? "text-red-500 animate-pulse" : "text-slate-300"}`}>
                                      ${mitigatedWorkaroundCost.toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                                <div className={`flex items-center gap-2 border p-2 font-mono text-[9px] ${isDark ? "border-slate-800 bg-slate-950/20" : "border-slate-200 bg-slate-100/50"}`}>
                                  <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                                    mitigatedWorkaroundCost > 1000000 ? "bg-red-500 animate-ping" : "bg-[#86BC25]"
                                  }`} />
                                  <span className={`leading-normal font-sans text-slate-400`}>
                                    {mitigatedWorkaroundCost > 1000000 
                                      ? "⚠️ EXCEEDED: Board CapEx Threshold Exceeded. Financial Committee clearance required." 
                                      : "COMPLIANT: Under Board expedited CapEx threshold."}
                                  </span>
                                </div>
                              </div>

                              {/* C-Suite Sign-Off Tracker */}
                              <div className="flex flex-col gap-2.5 pt-1">
                                <span className={`text-[9px] font-mono font-bold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-700"}`}>
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
                                        ? "bg-slate-800/60 border-[#86BC25] text-slate-200" 
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
                                        ? "bg-slate-800/60 border-[#86BC25] text-slate-200" 
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
                                        ? "bg-slate-800/60 border-[#86BC25] text-slate-200" 
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
                        <h4 className={`text-[10px] font-bold uppercase tracking-wider font-mono flex items-center gap-1.5 select-none ${isDark ? "text-slate-400" : "text-slate-700"}`}>
                          <Users className={`h-4 w-4 ${isDark ? "text-slate-400" : "text-slate-500"}`} />
                          Crisis Task Force Escalation
                        </h4>
                        
                        <div className="flex flex-col gap-2">
                          {(inspectedRow.playbook?.contacts || [
                            { name: "Sarah Jenkins", role: "Spirit Global Supply Lead", email: "s.jenkins@spiritaero.com", phone: "+1 (316) 555-0145" }
                          ]).map((contact, idx) => (
                            <div key={idx} className={`border p-3 text-[10px] leading-tight flex flex-col gap-2 ${isDark ? "bg-[#0F1520] border-slate-800" : "bg-white border-slate-200"}`}>
                              <div className="flex items-start justify-between">
                                <div>
                                  <div className={`font-bold font-sans text-xs ${isDark ? "text-slate-200" : "text-slate-800"}`}>{contact.name}</div>
                                  <div className="text-slate-500 text-[9px] font-sans mt-0.5">{contact.role}</div>
                                </div>
                                <span className={`text-[8px] font-mono border px-1.5 py-0.5 tracking-wider uppercase font-semibold select-none ${
                                  isDark ? "border-slate-800 bg-slate-900 text-slate-400" : "border-slate-200 bg-slate-100 text-slate-500"
                                }`}>
                                  ACTIVE RESPONDER
                                </span>
                              </div>
                              
                              <div className={`border-t pt-2 flex items-center justify-between font-mono text-[9px] ${isDark ? "border-slate-900 text-slate-400" : "border-slate-100 text-slate-600"}`}>
                                <span>{contact.email}</span>
                                <span className={`select-none ${isDark ? "text-slate-700" : "text-slate-300"}`}>&bull;</span>
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
                                  className={`flex-1 text-center font-mono text-[8px] font-bold uppercase py-1 border transition-colors duration-75 cursor-pointer ${
                                    isDark 
                                      ? "border-slate-800 bg-slate-900 hover:bg-slate-850 text-slate-200" 
                                      : "border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700"
                                  }`}
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
                        <span className={`font-bold uppercase tracking-wider flex items-center gap-1 ${isDark ? "text-slate-400" : "text-slate-700"}`}>
                          <Terminal className={`h-3.5 w-3.5 ${isDark ? "text-slate-500" : "text-slate-600"}`} />
                          Raw Telemetry Source Ingestion
                        </span>
                        <div className={`border p-2 break-all leading-normal select-text ${isDark ? "bg-[#0F1520] border-slate-900 text-slate-400" : "bg-white border-slate-200 text-slate-600"}`}>
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
      {/* ── Custom Deletion Confirmation Popup ── */}
      {deletingRow && (
        <>
          {/* Backdrop */}
          <div 
            onClick={() => setDeletingRow(null)}
            className="fixed inset-0 z-[9998] bg-black/45 backdrop-blur-[1.5px] transition-opacity duration-150"
          />
          {/* Modal Card */}
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] w-[90%] max-w-sm border shadow-2xl p-5 font-sans animate-fade-in select-none bg-[#0D121E] border-red-500/30 text-slate-200">
            <div className="flex flex-col gap-3.5">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                <AlertTriangle className="h-4.5 w-4.5 text-red-500 animate-pulse" />
                <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-red-400">
                  Confirm Signal Purge
                </h3>
              </div>

              <div className="text-xs leading-relaxed text-slate-400 font-sans">
                <p>
                  You are about to purge disruption signal <strong className="font-mono text-red-400 bg-red-950/20 px-1 border border-red-900/30">[{deletingRow.id}]</strong> from the active threat registry console:
                </p>
                <div className="mt-2.5 p-2 bg-slate-950 border border-slate-900 text-[10px] flex flex-col gap-0.5">
                  <span className="text-slate-500 uppercase text-[8px] font-mono">Target Node:</span>
                  <span className="font-bold text-slate-300 font-sans">{deletingRow.facility}</span>
                  <span className="text-slate-500 uppercase text-[8px] font-mono mt-1">Disruption:</span>
                  <span className="text-slate-300 font-sans">{deletingRow.disruption}</span>
                </div>
                <p className="mt-2.5 text-amber-500 font-mono text-[9px] uppercase tracking-wide">
                  ⚠️ This action deletes the signal from current memory.
                </p>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-800 pt-3 font-mono text-[9px] uppercase font-bold">
                <button
                  onClick={() => setDeletingRow(null)}
                  className="px-3.5 py-1.5 border border-slate-800 hover:border-slate-500 text-slate-400 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onDeleteSignal && onDeleteSignal(deletingRow.id);
                    setDeletingRow(null);
                  }}
                  className="px-3.5 py-1.5 bg-red-600 text-white border border-red-500 hover:bg-red-700 cursor-pointer ml-2"
                >
                  Confirm Purge
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
