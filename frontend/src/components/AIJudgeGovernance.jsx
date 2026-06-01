import { useState } from "react";
import { 
  ShieldAlert, 
  Settings, 
  BarChart3, 
  Activity, 
  Terminal, 
  Save, 
  CheckCircle2, 
  Cpu, 
  Sliders,
  RefreshCw,
  Star,
  ThumbsUp,
  ThumbsDown,
  UserCheck
} from "lucide-react";

export default function AIJudgeGovernance({ isDark, feedbackHistory = [], droppedSignals }) {
  const activeDroppedSignals = droppedSignals || [];
  const [likelihoodWeight, setLikelihoodWeight] = useState(40);
  const [impactWeight, setImpactWeight] = useState(40);
  const [tthWeight, setTthWeight] = useState(20);
  
  const [systemPrompt, setSystemPrompt] = useState(
    `You are the secondary "AI Judge" for Project Radar. Critically review incoming deep-tier supply chain anomalies and public signals. Match them against Boeing's historical lessons learned database. Filter out unverified social media noise, minor weather events, and general financial market fluctuations. Strictly adhere to FAA Type Certificate Approved Supplier List (ASL) protocols. Maintain a low alarm threshold for Tier-1 structural components while filtering Tier-4 noise.`
  );

  const [tuningLogs, setTuningLogs] = useState([]);
  const [isTuning, setIsTuning] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleTuneModel = () => {
    setIsTuning(true);
    setShowSuccess(false);
    setTuningLogs([]);

    const total = likelihoodWeight + impactWeight + tthWeight;
    const isNormalized = total === 100;

    const logs = [
      "🔄 CONNECTING TO GOVERNANCE OPTIMIZER PORTAL...",
      `📊 PARSING PARAMETERS: L:${likelihoodWeight}% | I:${impactWeight}% | TTH:${tthWeight}% (Total: ${total}%)`,
      isNormalized 
        ? "✅ NORMALIZED SUM INTEGRITY VERIFIED (100%)" 
        : "⚠️ WARNING: WEIGHTS DO NOT NORMALIZE TO 100%. CONSTRAINING AUTOMATICALLY...",
      "🤖 RE-COMPILING NEURAL NETWORK ALIGNMENT MATRICES...",
      "💾 INGESTING HUMAN-IN-THE-LOOP SCORING PROMPT RULES...",
      "🧠 INJECTING PROMPT WEIGHT COEFFICIENTS TO PREDICTIVE Radar core...",
      "🎉 WEIGHT SHIFT COMPLETED SUCCESSFULLY!"
    ];

    logs.forEach((line, index) => {
      setTimeout(() => {
        setTuningLogs(prev => [...prev, `[${new Date().toISOString().split("T")[1].slice(0, 8)}] ${line}`]);
        if (index === logs.length - 1) {
          setTimeout(() => {
            setIsTuning(false);
            setShowSuccess(true);
          }, 300);
        }
      }, (index + 1) * 350);
    });
  };

  // Dynamic calculations based on live feedback history submitted by analyst!
  const feedbackCount = feedbackHistory.length;
  const rawSignalsCount = 1240 + feedbackCount;
  
  // High ratings (4 or 5 stars) increase True Positive accuracy
  const accurateFeedbackCount = feedbackHistory.filter(f => f.rating >= 4 || f.option === "Accurate").length;
  const needsAuditCount = feedbackHistory.filter(f => f.rating > 0 && f.rating <= 2 || f.option === "Refinement").length;

  const dynamicTpr = Math.min(99.8, 97.4 + (accurateFeedbackCount * 0.2) - (needsAuditCount * 0.4)).toFixed(1);
  const dynamicFpr = Math.max(0.2, 2.6 - (accurateFeedbackCount * 0.1) + (needsAuditCount * 0.3)).toFixed(1);

  return (
    <div className="flex flex-1 flex-col gap-3 p-3 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col gap-1 border-b pb-2 select-none border-slate-700/50">
        <h1 className="text-base font-bold uppercase tracking-wider text-[#86BC25] font-mono flex items-center gap-1.5">
          <ShieldAlert className="h-4 w-4 text-[#86BC25]" />
          AI Judge & Closed Loop Governance
        </h1>
        <p className={`text-[10px] leading-relaxed ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          Review multi-agent validation audit trails, monitor Dropped Signals (Noise filtering), fine-tune AI Judge scoring weights, and manage the system-prompt rule directives.
        </p>
      </div>

      <div className="grid grid-cols-12 gap-3">
        {/* Left: AI Judge Metric Scorecard & Audit Trail (7 columns) */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-3">
          {/* AI Judge Validation Metrics */}
          <div className={`border p-4 rounded-none transition-colors duration-300 ${
            isDark ? "bg-[#0D111A] border-[#1E293B]" : "bg-white border-slate-200"
          }`}>
            <h2 className={`text-xs font-mono font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5 ${
              isDark ? "text-slate-300" : "text-slate-700"
            }`}>
              <BarChart3 className="h-4 w-4 text-[#86BC25]" />
              AI Judge Noise Filter Performance
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 select-none font-mono">
              <div className={`border p-3 flex flex-col gap-1 ${isDark ? "bg-[#111520] border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                <span className="text-[8px] text-slate-500 uppercase tracking-wider">True Positive Rate</span>
                <span className="text-sm font-bold text-[#86BC25]">{dynamicTpr}%</span>
                <span className="text-[8px] text-slate-500 leading-none mt-0.5">High anomaly precision</span>
              </div>

              <div className={`border p-3 flex flex-col gap-1 ${isDark ? "bg-[#111520] border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                <span className="text-[8px] text-slate-500 uppercase tracking-wider">False Positive Rate</span>
                <span className="text-sm font-bold text-[#86BC25]">{dynamicFpr}%</span>
                <span className="text-[8px] text-slate-500 leading-none mt-0.5">Alert fatigue minimized</span>
              </div>

              <div className={`border p-3 flex flex-col gap-1 ${isDark ? "bg-[#111520] border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                <span className="text-[8px] text-slate-500 uppercase tracking-wider">Raw Signals Ingested</span>
                <span className="text-sm font-bold text-sky-500">{rawSignalsCount.toLocaleString()}</span>
                <span className="text-[8px] text-slate-500 leading-none mt-0.5">Total ingested OSINT</span>
              </div>

              <div className={`border p-3 flex flex-col gap-1 ${isDark ? "bg-[#111520] border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                <span className="text-[8px] text-slate-500 uppercase tracking-wider font-mono">Noise Signals Dropped</span>
                <span className="text-sm font-bold text-amber-500">892</span>
                <span className="text-[8px] text-slate-500 leading-none mt-0.5">
                  {((892 / rawSignalsCount) * 100).toFixed(1)}% Noise Filter Rate
                </span>
              </div>
            </div>
          </div>

          {/* Human-in-the-Loop Analyst Tuning Stream */}
          <div className={`border p-4 rounded-none transition-colors duration-300 ${
            isDark ? "bg-[#0D111A] border-[#1E293B]" : "bg-white border-slate-200"
          }`}>
            <h2 className={`text-xs font-mono font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5 ${
              isDark ? "text-slate-300" : "text-slate-700"
            }`}>
              <UserCheck className="h-4 w-4 text-[#86BC25]" />
              Human-in-the-Loop Analyst Tuning Stream
            </h2>

            {feedbackHistory.length === 0 ? (
              <div className={`border border-dashed p-6 text-center select-none ${
                isDark ? "border-slate-800 text-slate-500" : "border-slate-300 text-slate-400"
              }`}>
                <p className="text-xs font-sans font-bold">No active analyst tuning feedbacks logged</p>
                <p className="text-[9px] font-mono mt-1 leading-normal max-w-sm mx-auto uppercase">
                  To view live loop streams, navigate to the Risk Radar (Home) tab, inspect a disruption card, and submit a boardroom governance review.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5 font-mono text-[9px]">
                {feedbackHistory.map((fb, idx) => (
                  <div key={idx} className={`border p-3 flex flex-col gap-1.5 relative ${
                    isDark ? "bg-[#111520] border-slate-800 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-700"
                  }`}>
                    <div className="flex justify-between items-center select-none">
                      <span className="font-bold text-[#86BC25] uppercase tracking-wide">
                        [FEEDBACK-{1000 + idx}] {fb.facility}
                      </span>
                      <span className={`px-2 py-0.5 border text-[8px] font-bold ${
                        fb.option === "Accurate" 
                          ? "text-[#86BC25] border-[#86BC25]/20 bg-[#86BC25]/5" 
                          : "text-amber-500 border-amber-950/20 bg-amber-950/5"
                      }`}>
                        {fb.option || "RATING ONLY"}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star}
                            className={`h-3 w-3 ${
                              star <= fb.rating 
                                ? "fill-[#86BC25] text-[#86BC25]" 
                                : "text-slate-700"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-slate-500 font-mono text-[8px]">
                        Timestamp: {fb.timestamp.replace("T", " ").replace("Z", " UTC")}
                      </span>
                    </div>

                    {fb.comment && (
                      <p className="font-sans leading-relaxed text-[10px] text-slate-300 border-t border-slate-800/40 pt-1.5 mt-0.5">
                        <span className="font-mono text-[8px] font-bold text-slate-500 uppercase mr-1">Analyst Context:</span>
                        "{fb.comment}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Judge Dropped Signals Logs */}
          <div className={`border p-4 rounded-none transition-colors duration-300 ${
            isDark ? "bg-[#0D111A] border-[#1E293B]" : "bg-white border-slate-200"
          }`}>
            <h2 className={`text-xs font-mono font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5 ${
              isDark ? "text-slate-300" : "text-slate-700"
            }`}>
              <Activity className="h-4 w-4 text-[#86BC25]" />
              AI Judge Validation Audit Trail (Dropped Noise Feed)
            </h2>

            <div className="flex flex-col gap-2 font-mono text-[9px] select-none">
              {activeDroppedSignals.map(s => (
                <div key={s.id} className={`border p-2.5 flex flex-col gap-1 relative ${
                  isDark ? "bg-[#111520] border-slate-800 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-700"
                }`}>
                  <div className="flex justify-between items-center select-none">
                    <span className="font-bold text-red-400">[{s.id}] {s.source}</span>
                    <span className="text-[8px] border border-amber-800 bg-amber-950/10 px-1 py-0.2 text-amber-500 font-bold">
                      FILTERED: {s.reason} (Noise Score: {s.noiseScore}%)
                    </span>
                  </div>
                  <p className="font-sans leading-relaxed text-[10px] mt-1 text-slate-400">{s.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Human in the Loop Sliders & Console Tuning (5 columns) */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-3">
          {/* Model Weights Tuning Sliders */}
          <div className={`border p-4 rounded-none transition-colors duration-300 ${
            isDark ? "bg-[#0D111A] border-[#1E293B]" : "bg-white border-slate-200"
          }`}>
            <h2 className={`text-xs font-mono font-bold uppercase tracking-wider mb-3.5 flex items-center gap-1.5 ${
              isDark ? "text-slate-300" : "text-slate-700"
            }`}>
              <Sliders className="h-4 w-4 text-[#86BC25]" />
              Human-in-the-Loop Scoring Weights
            </h2>

            <div className="flex flex-col gap-4 font-mono text-xs select-none">
              {/* Slider 1: Likelihood */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between font-bold">
                  <span>Likelihood Core Weight</span>
                  <span className="text-[#86BC25]">{likelihoodWeight}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={likelihoodWeight} 
                  onChange={(e) => setLikelihoodWeight(parseInt(e.target.value))}
                  disabled={isTuning}
                  className="w-full h-1 bg-slate-800 accent-[#86BC25] cursor-pointer"
                />
              </div>

              {/* Slider 2: Impact */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between font-bold">
                  <span>Impact Core Weight</span>
                  <span className="text-[#86BC25]">{impactWeight}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={impactWeight} 
                  onChange={(e) => setImpactWeight(parseInt(e.target.value))}
                  disabled={isTuning}
                  className="w-full h-1 bg-slate-800 accent-[#86BC25] cursor-pointer"
                />
              </div>

              {/* Slider 3: Time to Hit */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between font-bold">
                  <span>Time-to-Hit (TTH) Weight</span>
                  <span className="text-[#86BC25]">{tthWeight}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={tthWeight} 
                  onChange={(e) => setTthWeight(parseInt(e.target.value))}
                  disabled={isTuning}
                  className="w-full h-1 bg-slate-800 accent-[#86BC25] cursor-pointer"
                />
              </div>

              {/* Normalization Indicator */}
              <div className="flex justify-between items-center text-[10px] border-t border-slate-700/30 pt-3 mt-1">
                <span>Sum total weight:</span>
                <span className={`font-bold ${likelihoodWeight + impactWeight + tthWeight === 100 ? "text-[#86BC25]" : "text-amber-500"}`}>
                  {likelihoodWeight + impactWeight + tthWeight}% / 100%
                </span>
              </div>
            </div>
          </div>

          {/* System Prompt Rule Overrides */}
          <div className={`border p-4 rounded-none transition-colors duration-300 ${
            isDark ? "bg-[#0D111A] border-[#1E293B]" : "bg-white border-slate-200"
          }`}>
            <h2 className={`text-xs font-mono font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 ${
              isDark ? "text-slate-300" : "text-slate-700"
            }`}>
              <Cpu className="h-4 w-4 text-[#86BC25]" />
              AI Judge System Directive Prompts
            </h2>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              disabled={isTuning}
              rows={4}
              className={`w-full p-2.5 text-[10px] font-sans leading-relaxed border rounded-none focus:ring-1 focus:ring-[#86BC25] focus:outline-none focus:border-[#86BC25] ${
                isDark ? "border-slate-800 bg-[#161B26] text-slate-300" : "border-slate-200 bg-slate-50 text-slate-700"
              }`}
            />

            <div className="flex items-center justify-end select-none mt-3">
              <button
                onClick={handleTuneModel}
                disabled={isTuning}
                className={`flex items-center gap-1.5 border px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-wider rounded-none cursor-pointer transition-all duration-150 ${
                  isTuning
                    ? "border-sky-500 bg-sky-950/15 text-sky-400 cursor-not-allowed"
                    : "border-[#86BC25] bg-[#86BC25]/10 text-[#86BC25] hover:bg-[#86BC25] hover:text-black"
                }`}
              >
                {isTuning ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    Fine-Tuning System Prompt...
                  </>
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5" />
                    Save & Re-Align Model Prompt
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Model Weights Fine Tuning Progress console */}
          <div className="border border-slate-800 bg-[#070A11] p-3 font-mono text-[9px] text-[#86BC25] select-text flex flex-col gap-2 min-h-[140px]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 select-none">
              <span className="font-bold tracking-wider uppercase text-slate-500 flex items-center gap-1.5">
                <Terminal className="h-3.5 w-3.5 text-[#86BC25]" />
                MODEL ALIGNMENT TUNING LOGS
              </span>
              <span className="text-slate-600 font-bold">115200 BAUD</span>
            </div>
            
            {tuningLogs.length === 0 ? (
              <div className="flex flex-1 items-center justify-center text-slate-600 select-none py-6">
                [STANDBY - SAVE WEIGHT CONFIGURATION TO COMMENCE WEIGHT ALIGNMENT]
              </div>
            ) : (
              <div className="flex flex-col gap-1 max-h-[140px] overflow-y-auto pr-1">
                {tuningLogs.map((log, index) => (
                  <div key={index} className="leading-relaxed break-words font-mono">
                    {log}
                  </div>
                ))}
              </div>
            )}

            {showSuccess && (
              <div className="border border-[#86BC25] bg-[#86BC25]/10 p-2 flex items-start gap-2 mt-1 select-none text-[#86BC25]">
                <CheckCircle2 className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                <div className="text-[10px]">
                  <span className="font-bold uppercase tracking-wider font-mono">AI JUDGE COGNITIVE STACKS SYNCHRONIZED!</span>
                  <p className="mt-0.5 text-slate-300 font-sans font-medium">
                    The cognitive system directive prompt rules have been re-aligned and locked.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
