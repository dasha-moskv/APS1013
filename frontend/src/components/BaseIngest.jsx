import { useState, useRef } from "react";
import { 
  Upload, 
  CheckCircle2, 
  Loader2, 
  Map, 
  Globe, 
  Terminal, 
  Layers, 
  AlertTriangle,
  PlayCircle
} from "lucide-react";

const PRESETS = {
  "renton": {
    "name": "B737 MAX Renton Program Network",
    "file": "b737_max_renton_base.geojson",
    "nodesCount": 42,
    "coordinates": [-122.2172, 47.4797],
    "desc": "N-Tier structural sub-network for Renton assembly floor. Maps Wichita fuselage assembly channels, aluminum smelting nodes, and cabin integration corridors.",
    "logOutput": [
      "⚡ INGESTION COMMAND RECEIVED: LOAD PRESET [B737 MAX Renton Network]",
      "🔍 READING FILE: b737_max_renton_base.geojson (1.42 MB)",
      "📊 PARSING GEOJSON SCHEMA FORMAT...",
      "📍 EXTRACTED 42 NODES WITH GEOMETRY DETAILS:",
      "   -> Wichita, KS [Tier 1]: Spirit AeroSystems Fuselage Forgings (-97.2798, 37.6436)",
      "   -> Pinjarra, AU [Tier 3]: Alcoa Raw Bauxite Refining (115.875, -32.628)",
      "   -> Portland, OR [Tier 2]: Precision Forging Mills (-122.5694, 45.4243)",
      "✅ SYNTACTIC INTEGRITY: 100% VALID (FeatureCollection matches RFC 7946)",
      "🛡️ RUNNING REGULATORY COMPLIANCE VERIFICATION...",
      "   -> FAA Approved Supplier List (ASL) status: VERIFIED",
      "🌐 INITIALIZING TARGET SUPPLY BASE FOR RENTON ASSEMBLY FLOOR...",
      "📡 CONNECTING PUBLIC SIGNAL COLLECTORS (C1 News Ingestion, C2 SCADA Streams)...",
      "🎉 SUPPLY BASE BASELINE LOADED SUCCESSFULLY! MONITORING IS ACTIVE."
    ]
  },
  "everett": {
    "name": "B777/B767 Everett Widebody Network",
    "file": "everett_widebody_base.geojson",
    "nodesCount": 58,
    "coordinates": [-122.2731, 47.9218],
    "desc": "Advanced avionics and structural composites network for Everett assembly line. Integrates composite autoclaves, titanium casting mills, and primary turbine suppliers.",
    "logOutput": [
      "⚡ INGESTION COMMAND RECEIVED: LOAD PRESET [Everett Widebody Network]",
      "🔍 READING FILE: everett_widebody_base.geojson (2.89 MB)",
      "📊 PARSING GEOJSON SCHEMA FORMAT...",
      "📍 EXTRACTED 58 NODES WITH GEOMETRY DETAILS:",
      "   -> Derby, GB [Tier 1]: Rolls-Royce Turbofan Castings (-1.4552, 52.8931)",
      "   -> Phoenix, AZ [Tier 1]: Honeywell APU Integration Assemblies (-112.000, 33.435)",
      "   -> Ehime, JP [Tier 2]: Toray Carbon Fiber Synthetics (133.0906, 33.8569)",
      "✅ SYNTACTIC INTEGRITY: 100% VALID (FeatureCollection matches RFC 7946)",
      "🛡️ RUNNING REGULATORY COMPLIANCE VERIFICATION...",
      "   -> FAA Approved Supplier List (ASL) status: VERIFIED",
      "🌐 INITIALIZING TARGET SUPPLY BASE FOR EVERETT ASSEMBLY FLOOR...",
      "📡 CONNECTING PUBLIC SIGNAL COLLECTORS (C1 News Ingestion, C2 SCADA Streams)...",
      "🎉 SUPPLY BASE BASELINE LOADED SUCCESSFULLY! MONITORING IS ACTIVE."
    ]
  },
  "charleston": {
    "name": "B787 Charleston Integration Network",
    "file": "b787_charleston_base.geojson",
    "nodesCount": 31,
    "coordinates": [-80.0403, 32.8943],
    "desc": "Global system supplier network for Giga Charleston. Maps landing gear systems, hydraulic valve matrices, and cabin climate modules.",
    "logOutput": [
      "⚡ INGESTION COMMAND RECEIVED: LOAD PRESET [B787 Charleston Network]",
      "🔍 READING FILE: b787_charleston_base.geojson (942 KB)",
      "📊 PARSING GEOJSON SCHEMA FORMAT...",
      "📍 EXTRACTED 31 NODES WITH GEOMETRY DETAILS:",
      "   -> Bidos, FR [Tier 1]: Safran Landing Gear Assemblies (-0.605, 43.181)",
      "   -> Veldhoven, NL [Tier 2]: ASML High-Precision Optics (5.3700, 51.4200)",
      "   -> Puurs, BE [Tier 1]: Pfizer Autoclave Formulations (4.2774, 51.0772)",
      "✅ SYNTACTIC INTEGRITY: 100% VALID (FeatureCollection matches RFC 7946)",
      "🛡️ RUNNING REGULATORY COMPLIANCE VERIFICATION...",
      "   -> FAA Approved Supplier List (ASL) status: VERIFIED",
      "🌐 INITIALIZING TARGET SUPPLY BASE FOR CHARLESTON ASSEMBLY FLOOR...",
      "📡 CONNECTING PUBLIC SIGNAL COLLECTORS (C1 News Ingestion, C2 SCADA Streams)...",
      "🎉 SUPPLY BASE BASELINE LOADED SUCCESSFULLY! MONITORING IS ACTIVE."
    ]
  }
};

export default function BaseIngest({ isDark, onSupplyBaseInitialized }) {
  const activePresets = PRESETS;
  const [dragActive, setDragActive] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(null);
  
  // Validation stepper state
  const [activeStep, setActiveStep] = useState(0); // 0: Idle, 1: Parsing, 2: Initializing, 3: Connecting Collectors, 4: Done
  const [consoleLogs, setConsoleLogs] = useState([]);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef(null);

  const simulateIngestion = (presetKey, displayName) => {
    const config = activePresets[presetKey] || {
      name: displayName,
      file: displayName,
      nodesCount: 15,
      coordinates: [-122.27, 47.92],
      logOutput: [
        `⚡ INGESTION COMMAND RECEIVED: LOAD CUSTOM FILE [${displayName}]`,
        "🔍 SCANNING GEOJSON SCHEMAS...",
        "📊 PARSING 15 FEATURE FIELDS...",
        "✅ SYNTACTIC INTEGRITY: 100% VALID",
        "🌐 INITIALIZING TARGET SUPPLY BASE NETWORK...",
        "📡 RUNNING SIGNAL CRAWLERS...",
        "🎉 SYSTEM BASELINE INGESTED AND MONITORING RUNNING NOW."
      ]
    };

    setFileName(config.file);
    setActiveStep(1);
    setConsoleLogs([]);

    // Step 1: Parse & Validate
    addLog(config.logOutput[0]);
    addLog(config.logOutput[1]);
    addLog(config.logOutput[2]);
    addLog(config.logOutput[3]);

    setTimeout(() => {
      setActiveStep(2);
      addLog(config.logOutput[4]);
      addLog(config.logOutput[5]);
      addLog(config.logOutput[6]);
      if (config.logOutput[7]) addLog(config.logOutput[7]);
      if (config.logOutput[8]) addLog(config.logOutput[8]);
      if (config.logOutput[9]) addLog(config.logOutput[9]);
    }, 1200);

    setTimeout(() => {
      setActiveStep(3);
      addLog(config.logOutput[10] || "📡 CONNECTING SIGNAL COLLECTORS...");
      addLog(config.logOutput[11] || "📊 SPINNING UP NEWS SCRAPERS...");
    }, 2400);

    setTimeout(() => {
      setActiveStep(4);
      addLog(config.logOutput[12] || "🎉 SUCCESS!");
      if (config.logOutput[13]) addLog(config.logOutput[13]);
      if (onSupplyBaseInitialized) {
        onSupplyBaseInitialized(config.name, config.nodesCount);
      }
    }, 3600);
  };

  const addLog = (msg) => {
    setConsoleLogs(prev => [...prev, `[${new Date().toISOString().split("T")[1].slice(0, 8)}] ${msg}`]);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith(".geojson") || file.name.endsWith(".json")) {
        simulateIngestion("custom", file.name);
      } else {
        alert("Invalid file format. Please upload a GeoJSON file (.geojson).");
      }
    }
  };

  const onButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      simulateIngestion("custom", e.target.files[0].name);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-3 p-3">
      {/* Page Header */}
      <div className="flex flex-col gap-1 border-b pb-2 select-none border-slate-700/50">
        <h1 className="text-base font-bold uppercase tracking-wider text-[#86BC25] font-mono flex items-center gap-1.5">
          <Layers className="h-4 w-4 text-[#86BC25]" />
          Phase 1: Supply Base Ingestion & Validation
        </h1>
        <p className={`text-[10px] leading-relaxed ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          Ingest program geometries and GeoJSON supply base files. Automated syntactical parsing initializes deep-tier supplier coordinates and boots the public signal crawlers.
        </p>
      </div>

      <div className="grid grid-cols-12 gap-3">
        {/* Left: Uploader and Presets (7 columns) */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-3">
          {/* Preset Programs Section */}
          <div className={`border p-4 rounded-none transition-colors duration-300 ${
            isDark ? "bg-[#0D111A] border-[#1E293B]" : "bg-white border-slate-200"
          }`}>
            <h2 className={`text-xs font-mono font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5 ${
              isDark ? "text-slate-300" : "text-slate-700"
            }`}>
              <Globe className="h-4 w-4 text-[#86BC25]" />
              Select Boeing Program Baseline Preset
            </h2>
            <div className="flex flex-col gap-2.5">
              {Object.entries(activePresets).map(([key, p]) => (
                <div 
                  key={key}
                  onClick={() => {
                    setSelectedPreset(key);
                    simulateIngestion(key, p.file);
                  }}
                  className={`border p-3 cursor-pointer transition-all duration-150 relative select-none flex flex-col gap-1 ${
                    selectedPreset === key 
                      ? "border-[#86BC25] bg-[#86BC25]/5" 
                      : isDark 
                        ? "border-[#1E293B] bg-[#111520] hover:bg-[#161B26] hover:border-slate-500" 
                        : "border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-400"
                  }`}
                >
                  {selectedPreset === key && (
                    <span className="absolute top-2 right-3 text-[9px] font-mono text-[#86BC25] font-bold">
                      ACTIVE PROGRAM BASELINE
                    </span>
                  )}
                  <span className={`text-xs font-bold font-sans ${isDark ? "text-white" : "text-slate-800"}`}>
                    {p.name}
                  </span>
                  <div className="flex items-center gap-3 text-[9px] font-mono text-slate-500 mt-1">
                    <span>File: <span className="text-[#86BC25]">{p.file}</span></span>
                    <span>•</span>
                    <span>Nodes Mapped: <span className="text-sky-500 font-bold">{p.nodesCount} Nodes</span></span>
                  </div>
                  <p className={`text-[10px] leading-relaxed mt-1 font-sans ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    {p.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* GeoJSON File Drag and Drop */}
          <div 
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`border border-dashed p-6 rounded-none text-center select-none cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-3 ${
              dragActive 
                ? "border-[#86BC25] bg-[#86BC25]/5" 
                : isDark 
                  ? "border-slate-800 bg-[#0D111A] hover:bg-[#111520] hover:border-[#86BC25]" 
                  : "border-slate-300 bg-white hover:bg-slate-50 hover:border-[#86BC25]"
            }`}
            onClick={onButtonClick}
          >
            <input 
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".geojson,.json"
              onChange={handleFileChange}
            />
            <div className={`p-2.5 rounded-none border ${isDark ? "bg-[#111520] border-[#1E293B]" : "bg-slate-50 border-slate-200"}`}>
              <Upload className="h-6 w-6 text-[#86BC25] animate-pulse" />
            </div>
            <div>
              <p className={`text-xs font-sans font-bold ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                Drag and Drop supply base GeoJSON here
              </p>
              <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase">
                supports standard .geojson and .json files up to 15MB
              </p>
            </div>
            <button className="border border-slate-700 hover:border-[#86BC25] px-3 py-1 font-mono text-[9px] text-[#86BC25] bg-transparent uppercase tracking-wider cursor-pointer hover:bg-[#86BC25]/10">
              Browse Local System files
            </button>
          </div>
        </div>

        {/* Right: Validation Stepper and Terminal (5 columns) */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-3">
          {/* Validation Progress Stepper */}
          <div className={`border p-4 rounded-none transition-colors duration-300 ${
            isDark ? "bg-[#0D111A] border-[#1E293B]" : "bg-white border-slate-200"
          }`}>
            <h2 className={`text-xs font-mono font-bold uppercase tracking-wider mb-4 flex items-center gap-1.5 ${
              isDark ? "text-slate-300" : "text-slate-700"
            }`}>
              <Map className="h-4 w-4 text-[#86BC25]" />
              Supply Base Validation Pipeline
            </h2>

            {activeStep === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500 select-none">
                <AlertTriangle className="h-8 w-8 text-amber-500 mb-2 animate-bounce" />
                <p className="text-xs font-mono uppercase font-bold text-amber-500">Pipeline Inactive</p>
                <p className="text-[10px] mt-1 max-w-[240px]">Select a basline preset or drag and drop a GeoJSON supply grid to begin validation.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4 font-sans text-xs">
                {/* Step 1: Parse */}
                <div className="flex gap-3 relative">
                  <div className={`absolute left-[9px] top-6 bottom-0 w-[1.5px] ${
                    activeStep > 1 ? "bg-[#86BC25]" : "bg-slate-700 border-dashed"
                  }`} />
                  <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[9px] font-bold select-none ${
                    activeStep > 1 
                      ? "bg-[#86BC25]/20 border-[#86BC25] text-[#86BC25]" 
                      : activeStep === 1 
                        ? "bg-sky-500/10 border-sky-400 text-sky-400 animate-spin" 
                        : "bg-slate-800 border-slate-700 text-slate-500"
                  }`}>
                    {activeStep > 1 ? "✓" : activeStep === 1 ? <Loader2 className="h-3 w-3" /> : "1"}
                  </div>
                  <div>
                    <span className={`font-bold block uppercase tracking-wide ${
                      activeStep === 1 ? "text-sky-400 animate-pulse" : activeStep > 1 ? "text-slate-300" : "text-slate-500"
                    }`}>
                      1. Syntactic JSON Parsing & Verification
                    </span>
                    <p className={`text-[10px] mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      Validating RFC 7946 properties and coordinate integrity arrays.
                    </p>
                  </div>
                </div>

                {/* Step 2: Initialize */}
                <div className="flex gap-3 relative">
                  <div className={`absolute left-[9px] top-6 bottom-0 w-[1.5px] ${
                    activeStep > 2 ? "bg-[#86BC25]" : "bg-slate-700 border-dashed"
                  }`} />
                  <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[9px] font-bold select-none ${
                    activeStep > 2 
                      ? "bg-[#86BC25]/20 border-[#86BC25] text-[#86BC25]" 
                      : activeStep === 2 
                        ? "bg-sky-500/10 border-sky-400 text-sky-400 animate-spin" 
                        : "bg-slate-800 border-slate-700 text-slate-500"
                  }`}>
                    {activeStep > 2 ? "✓" : activeStep === 2 ? <Loader2 className="h-3 w-3" /> : "2"}
                  </div>
                  <div>
                    <span className={`font-bold block uppercase tracking-wide ${
                      activeStep === 2 ? "text-sky-400 animate-pulse" : activeStep > 2 ? "text-slate-300" : "text-slate-500"
                    }`}>
                      2. Target Supply Base Initialization
                    </span>
                    <p className={`text-[10px] mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      Registering Tier-1 to Tier-4 facilities in the Project Radar database.
                    </p>
                  </div>
                </div>

                {/* Step 3: Collectors */}
                <div className="flex gap-3 relative">
                  <div className={`absolute left-[9px] top-6 bottom-0 w-[1.5px] ${
                    activeStep > 3 ? "bg-[#86BC25]" : "bg-slate-700 border-dashed"
                  }`} />
                  <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[9px] font-bold select-none ${
                    activeStep > 3 
                      ? "bg-[#86BC25]/20 border-[#86BC25] text-[#86BC25]" 
                      : activeStep === 3 
                        ? "bg-sky-500/10 border-sky-400 text-sky-400 animate-spin" 
                        : "bg-slate-800 border-slate-700 text-slate-500"
                  }`}>
                    {activeStep > 3 ? "✓" : activeStep === 3 ? <Loader2 className="h-3 w-3" /> : "3"}
                  </div>
                  <div>
                    <span className={`font-bold block uppercase tracking-wide ${
                      activeStep === 3 ? "text-sky-400 animate-pulse" : activeStep > 3 ? "text-slate-300" : "text-slate-500"
                    }`}>
                      3. Public Signal Collectors Booting
                    </span>
                    <p className={`text-[10px] mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      Connecting crawler microservices to start scanning global OSINT streams.
                    </p>
                  </div>
                </div>

                {/* Completed Banner */}
                {activeStep === 4 && (
                  <div className="border border-[#86BC25] bg-[#86BC25]/10 p-3 flex items-start gap-2.5 mt-2 select-none">
                    <CheckCircle2 className="h-5 w-5 text-[#86BC25] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold text-[#86BC25] uppercase tracking-wider font-mono">baseline loaded successfully!</span>
                      <p className={`text-[10px] mt-1 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                        Supply grid <span className="font-mono text-sky-400 font-bold">{fileName}</span> is now active. Real-time anomaly filters are intercepting sub-tier signals.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Console / Terminal Output */}
          <div className="border border-slate-800 bg-[#070A11] p-3 font-mono text-[9px] text-[#86BC25] select-text flex flex-col gap-2 min-h-[220px]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 select-none">
              <span className="font-bold tracking-wider uppercase text-slate-500 flex items-center gap-1.5">
                <Terminal className="h-3.5 w-3.5 text-[#86BC25]" />
                RADAR INGEST CONSOLE FEED
              </span>
              <span className="text-slate-600 font-bold">115200 BAUD</span>
            </div>
            
            {consoleLogs.length === 0 ? (
              <div className="flex flex-1 items-center justify-center text-slate-600 select-none py-12">
                [TERMINAL STANDBY - WAITING FOR GEOSPATIAL LOGS]
              </div>
            ) : (
              <div className="flex flex-col gap-1 max-h-[260px] overflow-y-auto pr-1">
                {consoleLogs.map((log, index) => (
                  <div key={index} className="leading-relaxed break-words font-mono">
                    {log}
                  </div>
                ))}
                {activeStep > 0 && activeStep < 4 && (
                  <div className="flex items-center gap-1.5 text-sky-400 font-mono select-none mt-1 animate-pulse">
                    <span>⚡ INITIALIZING COMPONENT STAGES</span>
                    <span className="animate-ping font-bold">...</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
