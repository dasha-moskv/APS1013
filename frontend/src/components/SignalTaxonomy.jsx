import { useState } from "react";
import { FolderGit, Activity, ShieldCheck, Truck, Layers, HelpCircle, Terminal } from "lucide-react";

export const getTaxonomy = (id) => {
  if (id.startsWith("FAC-001") || id.startsWith("FAC-003") || id.startsWith("SUP-771A")) return "Operations & Capacity";
  if (id.startsWith("SUP-001A") || id.startsWith("SUP-109B") || id.startsWith("FAC-010") || id.startsWith("SUP-302B")) return "Logistics & Transit";
  if (id.startsWith("SUP-401A") || id.startsWith("SUP-502A") || id.startsWith("SUP-404R") || id.startsWith("SUP-512S") || id.startsWith("SUP-212H")) return "Regulatory & Quality";
  return "External Infrastructure";
};

const CATEGORIES = [
  { name: "Logistics & Transit", color: "bg-red-500", textColor: "text-red-500", borderColor: "border-red-500/20", icon: Truck },
  { name: "Operations & Capacity", color: "bg-amber-500", textColor: "text-amber-500", borderColor: "border-amber-500/20", icon: Layers },
  { name: "Regulatory & Quality", color: "bg-sky-500", textColor: "text-sky-500", borderColor: "border-sky-500/20", icon: ShieldCheck },
  { name: "External Infrastructure", color: "bg-[#86BC25]", textColor: "text-[#86BC25]", borderColor: "border-[#86BC25]/20", icon: Activity }
];

export default function SignalTaxonomy({ threatRows = [], selectedCategory = null, onSelectCategory }) {
  // Count matching signals for each category dynamically
  const total = threatRows.length;
  
  const categoryStats = CATEGORIES.map(cat => {
    const count = threatRows.filter(row => getTaxonomy(row.id) === cat.name).length;
    const percentage = total > 0 ? ((count / total) * 100).toFixed(0) : 0;
    return { ...cat, count, percentage: parseInt(percentage) };
  });

  return (
    <div
      id="signal-taxonomy-panel"
      className="flex flex-col bg-white border border-slate-200 rounded-none shadow-none mt-3"
    >
      {/* Container Header */}
      <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center justify-between select-none">
        <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-slate-500">
          RISK TAXONOMY DISTRIBUTION
        </span>
        <span className="text-[8px] font-mono text-slate-400 uppercase">
          {total} ACTIVE SIGNALS
        </span>
      </div>

      {/* Categories Grid */}
      <div className="p-4 flex flex-col gap-3">
        <p className="text-[10px] text-slate-500 font-sans leading-normal">
          Click any taxonomy category below to focus and filter the Network Threat Matrix.
        </p>

        <div className="flex flex-col gap-2.5">
          {categoryStats.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.name;
            return (
              <div
                key={cat.name}
                onClick={() => onSelectCategory(isSelected ? null : cat.name)}
                className={`group p-2.5 border transition-all duration-75 cursor-pointer flex flex-col gap-1.5 select-none rounded-none ${
                  isSelected
                    ? "bg-slate-900 border-slate-900 text-white"
                    : "bg-white border-slate-200 hover:bg-slate-50 text-slate-800"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${isSelected ? "text-white" : cat.textColor}`} />
                    <span className="text-[11px] font-bold font-sans tracking-tight">{cat.name}</span>
                  </div>
                  <div className="flex items-baseline gap-1.5 font-mono text-[10px] font-bold">
                    <span className={isSelected ? "text-white" : "text-slate-900"}>{cat.count}</span>
                    <span className="text-[9px] text-slate-400">({cat.percentage}%)</span>
                  </div>
                </div>

                {/* Progress bar container */}
                <div className="w-full bg-slate-100 h-1.5 rounded-none overflow-hidden mt-0.5">
                  <div
                    style={{ width: `${cat.percentage}%` }}
                    className={`h-full transition-all duration-500 rounded-none ${
                      isSelected ? "bg-[#86BC25]" : cat.color
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Clear Filter Control */}
        {selectedCategory && (
          <button
            onClick={() => onSelectCategory(null)}
            className="w-full cursor-pointer text-center font-mono text-[9px] font-bold uppercase py-1 border border-slate-300 hover:border-slate-800 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors duration-75 mt-1"
          >
            ❌ Clear Category Filter
          </button>
        )}
      </div>
    </div>
  );
}
