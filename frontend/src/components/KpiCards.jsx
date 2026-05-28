import { TrendingUp, ArrowUpRight } from "lucide-react";

const cards = [
  {
    id: "kpi-signals",
    label: "# Signals",
    value: "109",
    action: "See all >",
    gradient: "from-[#6c5ce7]/5 to-[#a29bfe]/5",
    accent: "#6c5ce7",
  },
  {
    id: "kpi-health",
    label: "Health Score",
    value: "82%",
    action: "See more >",
    gradient: "from-[#00d2d3]/5 to-[#48dbfb]/5",
    accent: "#00d2d3",
  },
];

export default function KpiCards() {
  return (
    <div id="kpi-cards" className="flex flex-col gap-4 h-full">
      {cards.map((card) => (
        <div
          key={card.id}
          id={card.id}
          className={`group relative flex flex-1 flex-col items-center justify-center
                      rounded-2xl bg-gradient-to-br ${card.gradient} bg-white p-6
                      shadow-sm ring-1 ring-black/[0.04] transition-all duration-300
                      hover:shadow-md hover:-translate-y-0.5`}
        >
          {/* Decorative corner icon */}
          <div
            className="absolute top-4 right-4 flex h-7 w-7 items-center justify-center
                       rounded-full opacity-0 transition-opacity duration-300
                       group-hover:opacity-100"
            style={{ backgroundColor: `${card.accent}15` }}
          >
            <ArrowUpRight className="h-3.5 w-3.5" style={{ color: card.accent }} />
          </div>

          <span className="mb-1 text-sm font-medium text-[#6b7280]">
            {card.label}
          </span>
          <span
            className="text-5xl font-extrabold tracking-tight"
            style={{ color: card.accent }}
          >
            {card.value}
          </span>
          <button
            className="mt-3 cursor-pointer text-xs font-medium text-[#6b7280] transition-colors
                       duration-200 hover:text-[#1a1a2e]"
          >
            {card.action}
          </button>
        </div>
      ))}
    </div>
  );
}
