import { useState, useEffect } from "react";
import * as Icons from "lucide-react";

const iconMap = {
  Building: Icons.Building,
  ShieldAlert: Icons.ShieldAlert,
  CheckCircle: Icons.CheckCircle,
  Clock: Icons.Clock,
  DollarSign: Icons.DollarSign,
};

export default function KpiCards({ kpiData = [], loading = true, isDark }) {
  const bg = isDark ? "bg-[#0F1520] border-[#1E293B]" : "bg-white border-slate-200";
  const headerBg = isDark ? "bg-[#0A0D14] border-[#1E293B]" : "bg-slate-50 border-slate-200";
  const cardBg = isDark ? "bg-[#0F1520] hover:bg-[#151C2C]" : "bg-white hover:bg-slate-50";
  const divider = isDark ? "divide-[#1E293B]" : "divide-slate-200";
  const headerText = isDark ? "text-slate-400" : "text-slate-500";
  const labelText = isDark ? "text-slate-400" : "text-slate-500";
  const subText = isDark ? "text-slate-500" : "text-slate-500";

  if (loading) {
    return (
      <div className={`flex flex-col h-full border rounded-none p-4 justify-center items-center font-mono text-[10px] select-none transition-colors duration-300 ${bg} ${headerText}`}>
        <Icons.RefreshCw className={`h-4 w-4 animate-spin mb-2 ${headerText}`} />
        LOADING PERFORMANCE TELETRAF...
      </div>
    );
  }

  return (
    <div
      id="kpi-cards-panel"
      className={`flex flex-col h-full border rounded-none shadow-none ${divider} divide-y transition-colors duration-300 ${isDark ? "bg-[#0F1520] border-[#1E293B]" : "bg-white border-slate-200"}`}
    >
      {/* Container Header */}
      <div className={`px-4 py-2 border-b flex items-center justify-between select-none transition-colors duration-300 ${headerBg}`}>
        <span className={`font-mono text-[9px] font-bold uppercase tracking-wider ${headerText}`}>
          OPERATIONAL PERFORMANCE TELEMETRY
        </span>
        <span className="h-1.5 w-1.5 rounded-full bg-[#86BC25]" />
      </div>

      {/* KPI Items */}
      {kpiData.map((kpi) => {
        const IconComponent = iconMap[kpi.icon] || Icons.HelpCircle;

        return (
          <div
            key={kpi.id}
            id={kpi.id}
            className={`flex flex-col justify-between p-4 rounded-none shadow-none ${kpi.borderColor} transition-colors duration-300 ${cardBg}`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-[9px] font-bold uppercase tracking-wider font-sans ${labelText}`}>
                {kpi.label}
              </span>
              <IconComponent className={`h-3.5 w-3.5 ${isDark ? "text-slate-600" : "text-slate-400"}`} strokeWidth={1.5} />
            </div>

            <div className="mt-1 flex items-baseline gap-2">
              <span className={`text-2xl font-bold font-mono tracking-tight ${kpi.valueColor}`}>
                {kpi.value}
              </span>
            </div>

            <div className={`mt-0.5 flex items-center justify-between text-[10px] font-mono ${subText}`}>
              <span>{kpi.subtext}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
