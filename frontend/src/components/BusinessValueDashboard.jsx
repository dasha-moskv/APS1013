import { 
  TrendingUp, 
  DollarSign, 
  Clock, 
  ShieldCheck, 
  ArrowDownRight, 
  AlertTriangle,
  FileText
} from "lucide-react";

export default function BusinessValueDashboard({ 
  isDark, 
  threatRows = [], 
  approvedPlaybooks = {} 
}) {
  // 1. Calculate active threats
  const activeThreats = threatRows.filter(t => t.mapPosition?.status !== "Nominal");
  
  // 2. Map processed threats
  const processedThreats = activeThreats.map(threat => {
    const dailyCost = threat.dailyExposure || 4500000;
    const timeline = 15; // default recovery timeline days
    const unmitigatedExposure = dailyCost * timeline;
    
    // Mitigated calculations
    const ttrReduction = Math.max(2, Math.floor(timeline * 0.4)); // 40% reduction
    const mitigatedTtr = timeline - ttrReduction;
    const isMitigated = approvedPlaybooks[threat.id] || false;
    
    const protectedExposure = dailyCost * ttrReduction;
    const expeditedSavings = isMitigated ? (dailyCost * 0.15 * mitigatedTtr) : 0; // 15% freight surcharge avoided
    
    return {
      ...threat,
      dailyCost,
      timeline,
      unmitigatedExposure,
      mitigatedTtr,
      ttrReduction,
      isMitigated,
      protectedExposure,
      expeditedSavings
    };
  });

  // Calculate aggregates cleanly to satisfy linter rule
  const totalUnmitigatedExposure = processedThreats.reduce((acc, t) => acc + (t.isMitigated ? 0 : t.unmitigatedExposure), 0);
  const totalSavingsRealized = processedThreats.reduce((acc, t) => acc + (t.isMitigated ? t.protectedExposure : 0), 0);
  const totalExpeditedFreightSavings = processedThreats.reduce((acc, t) => acc + (t.isMitigated ? t.expeditedSavings : 0), 0);
  const totalDailyStopLineProtected = processedThreats.reduce((acc, t) => acc + (t.isMitigated ? t.dailyCost : 0), 0);

  // 3. Operational Resilience Metrics
  const approvedCount = Object.keys(approvedPlaybooks).length;
  const totalCount = activeThreats.length || 1;
  const mitigationRate = (approvedCount / totalCount) * 100;

  // Perfect Order Projection: Base 92.4%, scales to 98.8% based on approved mitigations
  const perfectOrderRate = 92.4 + (mitigationRate * 0.064);
  
  // Average Time-to-Recover (TTR) compression
  const avgUnmitigatedTtr = 15.0;
  const avgMitigatedTtr = processedThreats.length > 0
    ? (processedThreats.reduce((acc, t) => acc + (t.isMitigated ? t.mitigatedTtr : t.timeline), 0) / processedThreats.length)
    : 15.0;

  return (
    <div className={`flex flex-1 flex-col gap-3 p-3 animate-fade-in font-sans text-xs ${
      isDark ? "text-slate-300" : "text-slate-700"
    }`}>
      {/* Page Header */}
      <div className="flex flex-col gap-1 border-b pb-2 select-none border-slate-700/50">
        <h1 className="text-base font-bold uppercase tracking-wider text-[#86BC25] font-mono flex items-center gap-1.5">
          <TrendingUp className="h-4 w-4 text-[#86BC25]" />
          Boeing Supply Chain Balanced Scorecard
        </h1>
        <p className={`text-[10px] leading-relaxed ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          Quantifies the financial and operational ROI of the Supplier Disruption Radar Agent. Computes traveled-work cost avoidance and lead-time compression.
        </p>
      </div>

      {/* ── SECTION 1: FINANCIAL SCORECARD CARDS ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 select-none">
        {/* Protected Revenue */}
        <div className={`border p-4 rounded-none transition-all flex flex-col gap-1.5 relative overflow-hidden ${
          isDark ? "bg-[#0D111A] border-[#1E293B]" : "bg-white border-slate-200"
        }`}>
          <div className="flex items-center justify-between text-slate-500 font-mono text-[8px] font-bold tracking-wider">
            <span>PROTECTED STOP-LINE REVENUE</span>
            <ShieldCheck className="h-4 w-4 text-[#86BC25]" />
          </div>
          <span className="text-lg font-bold text-[#86BC25] font-mono mt-1">
            ${(totalSavingsRealized / 1000000).toFixed(1)}M
          </span>
          <p className="text-[8.5px] text-slate-500 leading-normal">
            Traveled-work assembly cost saved via early alternate ASL sourcing.
          </p>
        </div>

        {/* Avoided Expedited Freight */}
        <div className={`border p-4 rounded-none transition-all flex flex-col gap-1.5 relative overflow-hidden ${
          isDark ? "bg-[#0D111A] border-[#1E293B]" : "bg-white border-slate-200"
        }`}>
          <div className="flex items-center justify-between text-slate-500 font-mono text-[8px] font-bold tracking-wider">
            <span>AVOIDED PREMIUM FREIGHT</span>
            <DollarSign className="h-4 w-4 text-sky-400" />
          </div>
          <span className="text-lg font-bold text-sky-400 font-mono mt-1">
            ${(totalExpeditedFreightSavings / 1000).toFixed(0)}K
          </span>
          <p className="text-[8.5px] text-slate-500 leading-normal">
            Avoided 15% dedicated air charter logistics premiums by early dispatch.
          </p>
        </div>

        {/* Unmitigated Exposure Dial */}
        <div className={`border p-4 rounded-none transition-all flex flex-col gap-1.5 relative overflow-hidden ${
          isDark ? "bg-red-950/10 border-red-950/30" : "bg-red-50/50 border-red-100"
        }`}>
          <div className="flex items-center justify-between text-red-400 font-mono text-[8px] font-bold tracking-wider">
            <span>UNMITIGATED ACTIVE RISK</span>
            <AlertTriangle className="h-4 w-4 text-red-500 animate-pulse" />
          </div>
          <span className="text-lg font-bold text-red-500 font-mono mt-1">
            ${(totalUnmitigatedExposure / 1000000).toFixed(1)}M
          </span>
          <p className="text-[8.5px] text-slate-500 leading-normal">
            Financial stop-line exposure of active disruptions awaiting approval.
          </p>
        </div>

        {/* Protected Daily Capacity */}
        <div className={`border p-4 rounded-none transition-all flex flex-col gap-1.5 relative overflow-hidden ${
          isDark ? "bg-[#0D111A] border-[#1E293B]" : "bg-white border-slate-200"
        }`}>
          <div className="flex items-center justify-between text-slate-500 font-mono text-[8px] font-bold tracking-wider">
            <span>PROTECTED DAILY CAPACITY</span>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </div>
          <span className="text-lg font-bold text-emerald-400 font-mono mt-1">
            ${(totalDailyStopLineProtected / 1000000).toFixed(1)}M / Day
          </span>
          <p className="text-[8.5px] text-slate-500 leading-normal">
            Sum exposure cost of active threats currently stabilized.
          </p>
        </div>
      </div>

      {/* ── SECTION 2: OPERATIONAL RESILIENCE METRICS ── */}
      <div className="grid grid-cols-12 gap-3">
        {/* Left: TTR and Performance Charts (7 cols) */}
        <div className={`col-span-12 lg:col-span-7 border p-4 rounded-none transition-all ${
          isDark ? "bg-[#0D111A] border-[#1E293B]" : "bg-white border-slate-200"
        }`}>
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-slate-400" />
            Time-to-Recover (TTR) Compression Curve
          </h2>
          
          <div className="flex flex-col gap-3 font-mono">
            {/* TTR Bar Chart comparison */}
            <div className="flex flex-col gap-2.5">
              <div>
                <div className="flex justify-between text-[9px] text-slate-500 mb-1">
                  <span>UNMITIGATED TTR (HISTORICAL MANUAL AVERAGE)</span>
                  <span className="font-bold">{avgUnmitigatedTtr.toFixed(1)} Days</span>
                </div>
                <div className={`h-3 w-full rounded-none ${isDark ? "bg-slate-800" : "bg-slate-100"}`}>
                  <div className="h-full bg-red-500/80" style={{ width: "100%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[9px] text-slate-500 mb-1">
                  <span>MITIGATED TTR (AGENT-ASSISTED WORKFLOW)</span>
                  <span className="font-bold text-[#86BC25]">{avgMitigatedTtr.toFixed(1)} Days</span>
                </div>
                <div className={`h-3 w-full rounded-none ${isDark ? "bg-slate-800" : "bg-slate-100"}`}>
                  <div 
                    className="h-full bg-[#86BC25]" 
                    style={{ width: `${(avgMitigatedTtr / avgUnmitigatedTtr) * 100}%` }} 
                  />
                </div>
              </div>
            </div>

            <div className={`border p-3.5 flex items-center justify-between text-[10px] mt-2 ${
              isDark ? "bg-[#111520] border-slate-800 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-600"
            }`}>
              <div className="flex flex-col gap-0.5">
                <span className="text-slate-500 font-bold uppercase text-[7px]">Average Lead-Time Compression</span>
                <span className="text-sm font-sans font-bold text-[#86BC25]">
                  {((avgUnmitigatedTtr - avgMitigatedTtr) / avgUnmitigatedTtr * 100).toFixed(0)}% Shorter Recovery Window
                </span>
              </div>
              <ArrowDownRight className="h-6 w-6 text-[#86BC25] shrink-0" />
            </div>
          </div>
        </div>

        {/* Right: Balance Scorecard KPIs (5 cols) */}
        <div className={`col-span-12 lg:col-span-5 border p-4 rounded-none transition-all ${
          isDark ? "bg-[#0D111A] border-[#1E293B]" : "bg-white border-slate-200"
        }`}>
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-slate-400" />
            BCA Program Resilience KPIs
          </h2>
          
          <div className="flex flex-col gap-3 font-mono text-xs select-none">
            {/* Perfect Order Rate */}
            <div className={`border p-2.5 flex items-center justify-between ${
              isDark ? "bg-[#111520] border-slate-800" : "bg-slate-50 border-slate-200"
            }`}>
              <span className="text-[8px] text-slate-500 font-bold">Projected Perfect Order %</span>
              <span className="font-sans font-bold text-sky-400 text-sm">
                {perfectOrderRate.toFixed(2)}%
              </span>
            </div>

            {/* Mitigation rate */}
            <div className={`border p-2.5 flex items-center justify-between ${
              isDark ? "bg-[#111520] border-slate-800" : "bg-slate-50 border-slate-200"
            }`}>
              <span className="text-[8px] text-slate-500 font-bold">Mitigation Activation Rate</span>
              <span className="font-sans font-bold text-[#86BC25] text-sm">
                {mitigationRate.toFixed(1)}% ({approvedCount}/{totalCount})
              </span>
            </div>

            {/* Inventory turns */}
            <div className={`border p-2.5 flex items-center justify-between ${
              isDark ? "bg-[#111520] border-slate-800" : "bg-slate-50 border-slate-200"
            }`}>
              <span className="text-[8px] text-slate-500 font-bold">Inventory Turn Buffer</span>
              <span className="font-sans font-bold text-slate-300 text-sm">
                {((approvedCount * 1.2) + 6.2).toFixed(1)} Turns
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 3: TRAVELED-WORK LABOR SAVINGS LOG ── */}
      <div className={`border p-4 rounded-none transition-all ${
        isDark ? "bg-[#0D111A] border-[#1E293B]" : "bg-white border-slate-200"
      }`}>
        <h2 className="text-xs font-mono font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5 select-none">
          <FileText className="h-4 w-4 text-slate-400" />
          Active Node Traveled-Work & Disruption Impact Logs
        </h2>
        
        <div className="overflow-x-auto select-none">
          <table className="w-full text-left font-mono border-collapse text-[10px]">
            <thead>
              <tr className={`border-b ${isDark ? "border-slate-800 text-slate-500" : "border-slate-200 text-slate-500"}`}>
                <th className="py-2 uppercase font-bold">ID</th>
                <th className="py-2 uppercase font-bold">Disrupted Node / Facility</th>
                <th className="py-2 uppercase font-bold">Downstream Dependency</th>
                <th className="py-2 uppercase font-bold">Daily Stop Cost</th>
                <th className="py-2 uppercase font-bold">Unmitigated Loss</th>
                <th className="py-2 uppercase font-bold">Mitigated Savings</th>
                <th className="py-2 uppercase font-bold text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {processedThreats.map((threat) => (
                <tr 
                  key={threat.id} 
                  className={`border-b transition-colors duration-150 ${
                    isDark ? "border-slate-900 hover:bg-[#131926]/40" : "border-slate-100 hover:bg-slate-50"
                  }`}
                >
                  <td className="py-2 font-bold">{threat.id}</td>
                  <td className={`py-2 font-sans font-semibold ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                    {threat.facility}
                  </td>
                  <td className="py-2 text-slate-400">
                    {threat.downstreamDependencies ? threat.downstreamDependencies.join(", ") : "Everett Assembly"}
                  </td>
                  <td className="py-2">${(threat.dailyCost / 1000000).toFixed(1)}M</td>
                  <td className="py-2 text-red-500">${(threat.unmitigatedExposure / 1000000).toFixed(1)}M</td>
                  <td className="py-2 text-[#86BC25] font-bold">
                    {threat.isMitigated ? `$${(threat.protectedExposure / 1000000).toFixed(1)}M` : "$0.0M"}
                  </td>
                  <td className="py-2 text-right">
                    <span className={`px-1.5 py-0.5 border text-[8px] font-bold ${
                      threat.isMitigated 
                        ? "text-[#86BC25] border-[#86BC25]/20 bg-[#86BC25]/5" 
                        : "text-amber-500 border-amber-500/20 bg-amber-500/5"
                    }`}>
                      {threat.isMitigated ? "SAVINGS REALIZED" : "AWAITING PLAYBOOK"}
                    </span>
                  </td>
                </tr>
              ))}
              {processedThreats.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-600">
                    [NO ACTIVE THREATS REGISTERED IN RADAR]
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
