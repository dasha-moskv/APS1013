import { MapPin } from "lucide-react";

export default function MapPlaceholder() {
  return (
    <div
      id="slot-map"
      className="relative flex h-full min-h-[320px] flex-col overflow-hidden rounded-2xl
                 bg-white shadow-sm ring-1 ring-black/[0.04]"
    >
      {/* Map image */}
      <div className="relative flex-1 overflow-hidden rounded-2xl bg-[#f8f9fb]">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/World_map_blank_without_borders.svg/1280px-World_map_blank_without_borders.svg.png"
          alt="World map"
          className="h-full w-full object-cover opacity-60"
        />

        {/* Decorative pins */}
        {[
          { top: "30%", left: "22%", color: "#ff6b6b" },
          { top: "25%", left: "30%", color: "#00d2d3" },
          { top: "38%", left: "26%", color: "#ff6b6b" },
          { top: "32%", left: "28%", color: "#00d2d3" },
          { top: "35%", left: "32%", color: "#00d2d3" },
          { top: "22%", left: "48%", color: "#ff6b6b" },
          { top: "28%", left: "50%", color: "#00d2d3" },
          { top: "20%", left: "52%", color: "#ff6b6b" },
          { top: "45%", left: "60%", color: "#00d2d3" },
          { top: "50%", left: "55%", color: "#feca57" },
          { top: "70%", left: "78%", color: "#feca57" },
        ].map((pin, i) => (
          <div
            key={i}
            className="absolute flex items-center justify-center"
            style={{ top: pin.top, left: pin.left }}
          >
            <MapPin
              className="h-5 w-5 drop-shadow-md"
              style={{ color: pin.color }}
              fill={pin.color}
              strokeWidth={1.5}
            />
            <span
              className="absolute h-3 w-3 animate-ping rounded-full opacity-30"
              style={{ backgroundColor: pin.color }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
