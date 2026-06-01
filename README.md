# 🛰️ Project Radar: Intelligent Supplier Disruption Radar & Decision Support Console

Project Radar is an enterprise-grade decision-support system designed to identify, analyze, and mitigate supply chain threats in real-time. Built specifically for **Boeing Commercial Airplanes** (supporting Rate 47 narrowbody/widebody assembly targets at Renton and Charleston), the platform bridges the gap between raw intelligence and closed-loop actions.

By combining advanced agentic AI pipelines with an interactive, highly responsive React cockpit, Project Radar enables procurement analysts and supply chain officers to ingest geo-coordinate records, query GraphRAG-enabled precedent databases, map complex N-tier supply ontologies, automate supplier outreach, and govern AI-generated assessments with custom human feedback loops.

---

## 🎥 Application Visuals & Architecture

### 📊 System-Wide Process Flow (Phases 1–3)
![System-Wide Process Flow](docs/uml-process.png)

### 🗺️ System Use Case Map
![Use Case Map](docs/uml-use-case.png)

### 💻 High-Fidelity Interface Preview
![High-Fidelity Interface Preview](docs/demo.gif)

---

## 📁 Monorepo Architecture & Directory Structure

Project Radar is managed as a unified monorepo divided into isolated services for the Python AI Agent Backend, system documentation, and the React + Vite frontend dashboard:

```text
/ (Repository Root)
├── backend/                    # Python AI Agent Core Service
│   ├── agents/                 # Agentic AI Processing Pipeline
│   │   ├── verify_supply_base.py                # Step 1: Supply base scope validation
│   │   ├── collect_signals.py                  # Step 2: Live news API feed collector
│   │   ├── analyze_signals.py                  # Step 3: LLM Disruption Card extractor
│   │   └── generate_mitigation_and_validation.py # Step 4: Playbook & response planner
│   ├── utils/                  # Command-Line Utility Pack
│   │   ├── display.py                          # Colorized console print helpers
│   │   └── save_output.py                      # Execution log storage handlers
│   ├── runs/                   # Directory containing archived backend session logs
│   ├── main.py                 # Core CLI entry point for the interactive agent
│   ├── newsapi.py              # Public intelligence gathering connector
│   ├── data-schema.json        # Data-contract JSON validation schemas
│   ├── pseudocode.txt          # Internal pseudocode for agent loops
│   ├── requirements.txt        # Python dependency manifest
│   └── .env                    # System-level API keys (OpenAI)
│
├── docs/                       # Process diagrams, study guides, and visual assets
│   ├── case-study.md           # Boeing supply chain business case analysis
│   ├── essential-performance.md # Critical system design metrics
│   ├── slide-outline.md        # Technical presentation deck storyboard
│   ├── uml-process.md          # UML sequence diagram description
│   └── uml-use-case.md         # UML actor/system use case map
│
├── frontend/                   # React + Vite Production-Ready UI
│   ├── src/
│   │   ├── components/         # Highly decoupled modular components
│   │   │   ├── Sidebar.jsx           # Fixed-side tab navigation rail
│   │   │   ├── Topbar.jsx            # User credentials & global active status bar
│   │   │   ├── KpiCards.jsx          # Live financial & threat scoreboard KPIs
│   │   │   ├── MapPlaceholder.jsx    # Interactive SVG geographic node mapper
│   │   │   ├── HealthMonitorTable.jsx # Threat Registry data grid with manual override
│   │   │   ├── BaseIngest.jsx        # Phase 1: GeoJSON validation & parser console
│   │   │   ├── MitigationPlaybooks.jsx # Phase 2: BOM, ASL finder, & SVG N-Tier ontology graph
│   │   │   ├── ActionOrchestration.jsx # Phase 3: Portal outreach simulator & SAP audit logger
│   │   │   ├── AIJudgeGovernance.jsx # Governance: TPR/FPR charts & dynamic weight sliders
│   │   │   └── SignalTaxonomy.jsx    # Taxonomic distribution and risk profile matrix
│   │   ├── App.jsx             # Shell framework, global states, & async DB loaders
│   │   ├── index.css           # Vanilla CSS variables & styling definitions
│   │   └── main.jsx            # Application mount point
│   ├── public/                 # Static files & local databases
│   │   └── data/               # Decoupled mock database sets (JSON format)
│   │       ├── threatRegistry.json      # Central active threats database
│   │       ├── knowledgeGraph.json      # N-tier structural node dependencies
│   │       ├── historicalPrecedents.json # Vector-style cosine similarity records
│   │       ├── erpSystems.json          # SAP-aligned Material Masters, BOMs & pre-qualified ASLs
│   │       └── kpiData.json             # Corporate scoreboard metric configurations
│   ├── package.json            # Node package configurations & developer scripts
│   ├── vite.config.js          # Vite build pack bundler configurations
│   └── eslint.config.js        # Linter code quality boundaries
│
├── .gitignore                  # Git tracking exclusion list
├── README.md                   # Corporate root documentation (this file)
└── dashboard-plan.md           # Visual design planning document
```

---

## 🎨 Professional Interface & Design Language

Project Radar strictly adheres to a premium, color-disciplined corporate aesthetic inspired by global management consulting standards:
- **Base Canvas**: Quiet, minimalist, slate-gray foundations (`#0F172A` / `#1E293B`) with frosted glass boundaries.
- **Accents**: Deloitte-green (`#86BC25`) is applied strategically for active tab indicators, primary submit buttons, and confirmation signals to draw user attention.
- **Warnings**: Red (`#EF4444`) is strictly reserved for the single selected active critical threat dot in the SVG Ontology Graph and critical status badges to prevent visual clutter.
- **Typography**: Modern typeface selection using Google Fonts (`Inter`, `System-UI`) for maximum scannability and clean layout structures.

---

## 💻 Tab-by-Tab Feature Breakdown

### 📊 1. Risk Radar (Overview Dashboard)
*   ** Boardroom Scorecard**: Tracking live, reactive stats including critical facility statuses, total unresolved threats, and mean time to resolution.
*   **Geospatial Tracker**: Visual SVG tracking map marking active supply nodes, shipping ports, and dynamic threat radius boundaries.
*   **Active Threat Registry**: A comprehensive data grid detailing active disruptions, category tags (e.g., Force Majeure, Logistics, Geopolitical), and severity tiers. Supports direct analyst override callbacks.

### 📥 2. Ingestion Pipeline (Phase 1)
*   **GeoJSON validator**: Drag-and-drop or select mock supply-base geo coordinate files.
*   **Strict Schema Validation**: Automatically parses geographic structures (validating FeatureCollection properties, coordinates arrays, and supplier metadata).
*   **Log Console**: A scrolling command line mock simulator outputting individual ingestion steps, parsing coordinate sets, and logging warnings or successful storage indexes.

### 🛠️ 3. Mitigation Workbench (Phase 2)
*   **Cosine Precedents Search**: Query the GraphRAG vector database to discover historical disruption similarities (retrieving precedent summaries, resolution costs, and confidence metrics).
*   **SAP/ERP BOM Mapping**: Matches disrupted components with their corresponding Boeing internal Material Masters (BOMs).
*   **ASL alternate matching**: Identifies alternate certified suppliers from the Approved Supplier List (ASL), calculating alternate unit costs and transition timelines.
*   **N-Tier Ontology Graph**: Interactive SVG rendering node relationships (e.g., 737 MAX fuselage assembly dependencies spanning *Tier-1 Suppliers* down to *Sub-Tier Raw Material Refineries*). Selecting a node highlights its dependencies and filters the workbench.
*   **FAA Regulatory Checklist**: Pre-configured verification steps to ensure replacement parts adhere strictly to FAA regulatory requirements.

### ⚡ 4. Action Orchestration (Phase 3)
*   **Supplier Portal Simulator**: Launches automated queries directly to suppliers to confirm material availability, shipping delays, and lead times.
*   **Supplier Closed Loop**: Supplier replies (e.g., confirmed alternative deliveries) automatically adjust the central threat registry's risk levels and corporate Boardroom KPI scores.
*   **SAP transactional logs**: Generates pre-formatted audit trails of automated alternate procurement orders ready for integration with client ERP services (e.g., SAP GUI transactions like `ME21N` PO Creation).

### ⚖️ 5. Governance Console (AI Judge)
*   **Model Validation Scorecard**: Visualizes live model telemetry parameters (True Positive Rate and False Positive Rate).
*   **Dropped Signal Feed**: Tracks low-risk signals filtered out by the AI Judge to prevent alert fatigue.
*   **Dynamic Weight Sliders**: Lets users adjust decision weights (e.g., Financial Risk weight, Delivery Impact weight) to tune the AI model's threat assessments.
*   **Human Closed Loop**: Human reviews and feedback directly affect validation scores, demonstrating model adjustment.

---

## ⚙️ Decoupled Database Engineering

To ensure the system is completely ready for enterprise backend API integrations, the frontend has been fully decoupled from static mock data. On app boot, parallel `fetch()` routines load data from `/public/data/`:
1.  **`threatRegistry.json`**: Central threat records with status metrics.
2.  **`knowledgeGraph.json`**: Dependency linkages, coordinates, and ontological categories.
3.  **`historicalPrecedents.json`**: Dense semantic records of historic supply interventions.
4.  **`erpSystems.json`**: Mock SAP databases aligning BOMs with certified replacement options.
5.  **`kpiData.json`**: Configuration boundaries for corporate boardroom scores.

---

## 🚀 Execution & Setup Guidelines

### 🎨 Frontend Setup
1.  Navigate into the `frontend` folder:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Launch the local dev server:
    ```bash
    npm run dev
    ```
4.  Open the web console in your browser at `http://localhost:5173`.

### 🐍 Backend Setup
1.  Navigate into the `backend` folder:
    ```bash
    cd backend
    ```
2.  Create and configure a virtual environment:
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```
3.  Install the required packages:
    ```bash
    pip install -r requirements.txt
    ```
4.  Setup environment variables (create a `.env` file):
    ```env
    OPENAI_API_KEY=your_openai_api_key_here
    ```
5.  Run the command-line agent:
    ```bash
    python main.py
    ```

---

## 🔒 Verification & Compliance
*   **Aesthetics**: Minimal color usage. No vibrant color gradients or random background decorations. Perfect for corporate presentation.
*   **Build Integrity**: The frontend code passes standard ES6 compilation steps cleanly and runs on a local dev environment using Vite.
*   **Data decopling**: The system contains absolutely no hardcoded business objects inside rendering files, making it completely API-ready.