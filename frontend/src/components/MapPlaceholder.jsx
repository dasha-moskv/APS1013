import { useState, useEffect, useRef } from "react";
import { Crosshair, Shield, Activity, MapPin, RefreshCw } from "lucide-react";

export default function MapPlaceholder({ threatRows = [], loading = true }) {
  const [selectedPin, setSelectedPin] = useState(null);
  const [tick, setTick] = useState(0);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  // Effect 1: Initialize interactive Leaflet map exactly once when loading is complete
  useEffect(() => {
    if (!mapContainerRef.current || loading) return;

    const L = window.L;
    if (!L) {
      console.warn("Leaflet library not found on window object.");
      return;
    }

    // Clean up previous map instance to prevent HMR leaks
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Initialize interactive Leaflet map centered globally
    const map = L.map(mapContainerRef.current, {
      center: [20.0, 10.0],
      zoom: 1.5,
      zoomControl: false, // Added in bottomright manually below
      attributionControl: false, // Clean corporate look
      minZoom: 1.5,
      maxZoom: 8,
      worldCopyJump: true
    });

    // Add standard zoom control at bottomright corner
    L.control.zoom({ position: "bottomright" }).addTo(map);

    // Load CartoDB Dark Matter tile layer
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 20
    }).addTo(map);

    mapInstanceRef.current = map;

    // Cleanup Leaflet instance on unmount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [loading]);

  // Effect 2: Set up a ticker timer that updates whenever there is a live pin under 6 seconds old
  useEffect(() => {
    const hasNewPins = threatRows.some(
      row => row.ingestedAt > 0 && Date.now() - row.ingestedAt < 6000
    );

    if (!hasNewPins) return;

    // Tick every 1 second to update elapsed times and transition pins smoothly
    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [threatRows, tick]);

  // Effect 3: Draw, update, and transition map markers reactively on the active map instance
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || loading) return;

    const L = window.L;
    if (!L) return;

    // Clean up existing markers to avoid cumulative leakages
    markersRef.current.forEach(marker => {
      marker.remove();
    });
    markersRef.current = [];

    // Loop over threat data and render custom telemetry markers
    const newMarkers = [];

    threatRows
      .filter(row => row.mapPosition && row.mapPosition.coordinates)
      .forEach(row => {
        const [lng, lat] = row.mapPosition.coordinates;
        const color = row.mapPosition.color || "#86BC25";

        // Check if this specific pin is within the 6-second ingestion window
        const isNew = row.ingestedAt > 0 && (Date.now() - row.ingestedAt < 6000);

        let customIcon;
        if (isNew) {
          // Dynamic supercharged radar beacon style: extra large pulsing, spin circles, and scale
          customIcon = L.divIcon({
            html: `
              <div class="relative flex items-center justify-center pointer-events-none" style="width: 32px; height: 32px;">
                <!-- Supercharged expanding radar ring 1 -->
                <span class="absolute h-10 w-10 rounded-full opacity-75 animate-ping pointer-events-none" style="background-color: ${color}; transform: scale(1.5);"></span>
                <!-- Supercharged expanding radar ring 2 (delayed offset) -->
                <span class="absolute h-7 w-7 rounded-full opacity-50 animate-ping pointer-events-none" style="background-color: ${color}; animation-delay: 0.3s;"></span>
                <!-- High-frequency telemetry rotation ring -->
                <span class="absolute h-8 w-8 rounded-full border border-dashed border-[#86BC25] animate-spin pointer-events-none" style="animation-duration: 2s;"></span>
                <!-- Deep center warning pulse -->
                <span class="absolute h-4 w-4 rounded-full opacity-60 pointer-events-none animate-pulse" style="background-color: ${color};"></span>
                <!-- Enlarged high-visibility Pin SVG -->
                <svg class="h-6 w-6 drop-shadow-2xl z-10 pointer-events-none transform scale-125 transition-transform duration-300" style="color: ${color}; fill: ${color};" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
            `,
            className: "bg-transparent border-0 outline-none flex items-center justify-center z-[500]",
            iconSize: [32, 32],
            iconAnchor: [16, 16]
          });
        } else {
          // Standard / nominal telemetry pin icon style
          customIcon = L.divIcon({
            html: `
              <div class="relative flex items-center justify-center pointer-events-none" style="width: 24px; height: 24px;">
                <!-- Telemetry coordinate circle -->
                <span class="absolute h-5 w-5 rounded-full border border-dashed border-white/20 animate-spin pointer-events-none" style="animation-duration: 10s;"></span>
                <!-- Glowing ring -->
                <span class="absolute h-3.5 w-3.5 rounded-full opacity-45 animate-ping pointer-events-none" style="background-color: ${color};"></span>
                <!-- Nominal Pin SVG -->
                <svg class="h-4.5 w-4.5 drop-shadow-md z-10 pointer-events-none" style="color: ${color}; fill: ${color};" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
            `,
            className: "bg-transparent border-0 outline-none flex items-center justify-center z-[100]",
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          });
        }

        const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

        marker.on("click", () => {
          setSelectedPin({
            id: row.id,
            name: row.facility,
            location: row.location,
            tier: row.tier,
            role: row.mapPosition.role,
            status: row.mapPosition.status,
            coordinates: row.mapPosition.coordinates,
            color
          });
        });

        newMarkers.push(marker);
      });

    markersRef.current = newMarkers;
  }, [threatRows, loading, tick]);

  const activePinsCount = threatRows.filter(
    row => row.mapPosition && row.mapPosition.coordinates
  ).length;

  return (
    <div
      id="slot-map"
      className="relative flex h-full min-h-[300px] flex-col overflow-hidden rounded-none
                 bg-[#090D16] border border-slate-800 font-sans text-white"
    >
      {/* ── Terminal Header Overlay ── */}
      <div className="absolute top-0 left-0 right-0 z-[1000] flex h-10 items-center justify-between border-b border-slate-800 bg-[#090D16]/95 px-4 select-none">
        <div className="flex items-center gap-2">
          <Crosshair className="h-3.5 w-3.5 text-[#86BC25] animate-pulse" />
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-300">
            GEOSPATIAL SUPPLY NETWORK TELEMETRY — INTERACTIVE MAP
          </span>
        </div>
        <div className="flex items-center gap-4 text-[9px] font-mono text-slate-500">
          <span>SECURE FEEDS: {loading ? "INITIALIZING..." : `${activePinsCount} TRACKED`}</span>
          <span className="h-1.5 w-1.5 rounded-full bg-[#86BC25] animate-ping" />
        </div>
      </div>

      {/* ── Main Map Area ── */}
      <div className="relative flex-1 overflow-hidden h-full w-full bg-[#090D16]">
        {loading ? (
          /* Terminal Loading Overlay */
          <div className="absolute inset-0 z-[1000] flex flex-col items-center justify-center font-mono text-[10px] bg-[#090D16] text-slate-400 select-none">
            <RefreshCw className="h-5 w-5 animate-spin text-[#86BC25] mb-2.5" />
            CONNECTING TO UNIFIED GEOSPATIAL FEEDS...
          </div>
        ) : (
          <div className="relative w-full h-full">
            {/* Leaflet DOM Anchor */}
            <div ref={mapContainerRef} className="w-full h-full z-0 bg-[#090D16]" />

            {/* Futurist Tech Grid Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(30,41,59,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(30,41,59,0.08)_1px,transparent_1px)] bg-[size:25px_25px] pointer-events-none z-10" />

            {/* ── Dynamic Pin Telemetry Card Overlay ── */}
            {selectedPin ? (
              <div className="absolute bottom-4 left-4 z-[1000] w-64 rounded-none border border-slate-700 bg-[#0C1220]/95 p-3 font-mono text-[10px] text-slate-300 shadow-xl pointer-events-auto">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-1.5">
                  <span className="font-bold text-[#86BC25]">{selectedPin.id}</span>
                  <button
                    onClick={() => setSelectedPin(null)}
                    className="text-slate-500 hover:text-white cursor-pointer"
                  >
                    [ESC]
                  </button>
                </div>
                <p className="text-white font-semibold">{selectedPin.name}</p>
                <p className="mt-1 text-slate-400 font-bold uppercase tracking-wider text-[8px] text-slate-500">{selectedPin.location}</p>
                <p className="mt-1 text-slate-400 font-medium">ROLE: {selectedPin.role}</p>
                <p className="text-slate-400">
                  GPS: {selectedPin.coordinates[1] >= 0 ? `${selectedPin.coordinates[1].toFixed(4)}°N` : `${Math.abs(selectedPin.coordinates[1]).toFixed(4)}°S`}, {selectedPin.coordinates[0] >= 0 ? `${selectedPin.coordinates[0].toFixed(4)}°E` : `${Math.abs(selectedPin.coordinates[0]).toFixed(4)}°W`}
                </p>
                <div className="mt-2 flex items-center gap-1.5 border-t border-slate-800 pt-1.5">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: selectedPin.color }}
                  />
                  <span className="uppercase font-bold text-white">
                    STATUS: {selectedPin.status}
                  </span>
                </div>
              </div>
            ) : (
              <div className="absolute bottom-4 left-4 z-[1000] rounded-none border border-slate-800 bg-[#0C1220]/80 p-2 font-mono text-[9px] text-slate-500 select-none pointer-events-none">
                [CLICK PIN TO INSPECT TELETRAF]
              </div>
            )}

            {/* ── Telemetry Stats Sidebar Overlay ── */}
            <div className="absolute right-4 top-14 z-[1000] flex flex-col gap-1 rounded-none border border-slate-800 bg-[#0C1220]/90 p-3 font-mono text-[9px] text-slate-400 max-w-[180px] select-none pointer-events-none">
              <span className="font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-1 mb-1">
                NETWORK LEGEND
              </span>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#86BC25]" />
                <span>Nominal (6 online)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#FFB300]" />
                <span>Elevated Risk (3 nodes)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#D32F2F]" />
                <span>Critical threat (3 nodes)</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
