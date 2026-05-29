import { useState, useEffect } from "react";
import * as Icons from "lucide-react";

const iconMap = {
  Building: Icons.Building,
  ShieldAlert: Icons.ShieldAlert,
  CheckCircle: Icons.CheckCircle,
  Clock: Icons.Clock,
};

export default function KpiCards({ kpiData = [], loading = true }) {

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-white border border-slate-200 rounded-none p-4 justify-center items-center font-mono text-[10px] text-slate-400 select-none">
        <Icons.RefreshCw className="h-4 w-4 animate-spin text-slate-400 mb-2" />
        LOADING PERFORMANCE TELETRAF...
      </div>
    );
  }

  return (
    <div
      id="kpi-cards-panel"
      className="flex flex-col h-full bg-white border border-slate-200 rounded-none shadow-none divide-y divide-slate-200"
    >
      {/* Container Header */}
      <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center justify-between select-none">
        <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-slate-500">
          OPERATIONAL PERFORMANCE TELEMETRY
        </span>
        <span className="h-1.5 w-1.5 rounded-full bg-[#86BC25]" />
      </div>

      {/* KPI Items */}
      {kpiData.map((kpi) => {
        // Resolve Lucide Icon dynamically
        const IconComponent = iconMap[kpi.icon] || Icons.HelpCircle;

        return (
          <div
            key={kpi.id}
            id={kpi.id}
            className={`flex flex-col justify-between p-4 bg-white rounded-none shadow-none ${kpi.borderColor} transition-colors duration-75 hover:bg-slate-50`}
          >
            {/* Header label */}
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 font-sans">
                {kpi.label}
              </span>
              <IconComponent className="h-3.5 w-3.5 text-slate-400" strokeWidth={1.5} />
            </div>

            {/* Value */}
            <div className="mt-1 flex items-baseline gap-2">
              <span className={`text-2xl font-bold font-mono tracking-tight ${kpi.valueColor}`}>
                {kpi.value}
              </span>
            </div>

            {/* Subtext metadata */}
            <div className="mt-0.5 flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span>{kpi.subtext}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
