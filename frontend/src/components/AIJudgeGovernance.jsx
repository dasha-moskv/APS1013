import { useState } from "react";
import { 
  ShieldAlert, 
  BarChart3, 
  Activity, 
  Star,
  UserCheck
} from "lucide-react";

export default function AIJudgeGovernance({ isDark, feedbackHistory = [], droppedSignals }) {
  const activeDroppedSignals = droppedSignals || [];
  
  // Dynamic calculations based on live review history submitted by risk managers
  const feedbackCount = feedbackHistory.length;
  const rawSignalsCount = 1240 + feedbackCount;
  
  // High ratings (4 or 5 stars) indicate Accurate classification
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
          Monitor AI Judge validation audit trails, review Dropped Signals (Noise filtering logs), and view human analyst review overrides.
        </p>
      </div>

      <div className="grid grid-cols-12 gap-3">
        {/* Left Column: Metrics & Analyst Reviews (6 columns) */}
        <div className="col-span-12 lg:col-span-6 flex flex-col gap-3">
          
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

            <div className="grid grid-cols-2 gap-3 select-none font-mono">
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
                <span className="text-[8px] text-slate-500 leading-none mt-0.5">Total open OSINT signals</span>
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

          {/* Human-in-the-Loop Analyst Reviews Log */}
          <div className={`border p-4 rounded-none transition-colors duration-300 ${
            isDark ? "bg-[#0D111A] border-[#1E293B]" : "bg-white border-slate-200"
          }`}>
            <h2 className={`text-xs font-mono font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5 ${
              isDark ? "text-slate-300" : "text-slate-700"
            }`}>
              <UserCheck className="h-4 w-4 text-[#86BC25]" />
              Human Analyst Reviews Log
            </h2>

            {feedbackHistory.length === 0 ? (
              <div className={`border border-dashed p-6 text-center select-none ${
                isDark ? "border-slate-800 text-slate-500" : "border-slate-300 text-slate-400"
              }`}>
                <p className="text-xs font-sans font-bold">No active analyst overrides logged</p>
                <p className="text-[9px] font-mono mt-1 leading-normal max-w-sm mx-auto uppercase">
                  To log overrides, navigate to the Risk Radar tab, inspect a disruption card, and submit a boardroom review override.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5 font-mono text-[9px] max-h-[300px] overflow-y-auto pr-1">
                {feedbackHistory.map((fb, idx) => (
                  <div key={idx} className={`border p-3 flex flex-col gap-1.5 relative ${
                    isDark ? "bg-[#111520] border-slate-800 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-700"
                  }`}>
                    <div className="flex justify-between items-center select-none">
                      <span className="font-bold text-[#86BC25] uppercase tracking-wide">
                        [REVIEW-{1000 + idx}] {fb.facility}
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
        </div>

        {/* Right Column: Dropped Signals Noise Feed (6 columns) */}
        <div className="col-span-12 lg:col-span-6 flex flex-col gap-3">
          
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

            <div className="flex flex-col gap-2 font-mono text-[9px] select-none max-h-[460px] overflow-y-auto pr-1">
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
      </div>
    </div>
  );
}
