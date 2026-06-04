# Deployment Architecture Diagram (MVP vs. Enterprise Target)

This document describes the Deployment Architecture for the SCRM AI Platform (**Project Radar**). It showcases the physical deployment nodes, execution containers, network isolation layers, database subnets, and external enterprise integrations. 

To bridge the gap between development and production, the diagram maps out the current **Local MVP Development Environment** alongside the target **Boeing Secure Cloud Environment (VPC)**.

## Rendered Deployment Diagram

Once compiled using a PlantUML renderer, the deployment diagram will represent the physical server layout:

![SCRM Deployment Architecture Diagram](uml-deployment.png)

---

## Deployment Node Specifications

### 1. Client / Presentation Layer
* **User Workstation (Boeing Network)**: A standard corporate PC/laptop connected to the Boeing Intranet/VPN.
* **Web Browser**: Runs the client-side single page application (React + Vite). All rendering, UI state updates, Jaccard signal deduplication, and map rendering are handled client-side.
* **Web Distribution / CDN**: Static web assets (HTML, compiled JavaScript, and CSS bundles) are distributed globally via Nginx or a cloud CDN (e.g., AWS CloudFront) to minimize page load times.

### 2. Application & Orchestration Layer
* **Application Load Balancer (ALB)**: Acts as the secure HTTPS gateway to route client REST and Server-Sent Events (SSE) traffic from the browser into the containerized backend.
* **FastAPI Web Container (Uvicorn)**: The primary python API service running on Uvicorn. It exposes the REST interfaces, serves live news SSE streams, and handles file uploads (GeoJSON validation).
* **AI Processing Container**: An isolated task execution cluster (running on Amazon ECS or EKS) that hosts the Python agentic frameworks:
  * **Threat Validator Agent** (`verify_supply_base.py`, `collect_signals.py`)
  * **Impact Analyzer Agent** (`analyze_signals.py` and BOM graph mapping engine)
  * **Playbook Gen Agent** (`generate_mitigation_and_validation.py` for RAG-driven scenario planning)

### 3. Data & Storage Layer (VPC Private Subnet)
To ensure maximum security, the databases are isolated inside a private subnet inaccessible from the public internet:
* **Relational DB (PostgreSQL RDS)**: Stores transactional metadata, user roles, active/resolved disruption logs, audit trails, and playbook recommendation templates.
* **Neo4j Graph Database**: Tracks the structural N-tier supply chain network graph, indexing relationship linkages between direct (Tier-1) suppliers and sub-tier component manufacturers (Tier-2 to Tier-4) mapped to Boeing's assembly plants.
* **Vector Database (pgvector / Qdrant)**: Stores high-dimensional vector embeddings of contract documents, Service Level Agreements (SLAs), and historical playbook precedents for contextual RAG retrieval.

### 4. External Integrations & Intranet Connectors
* **OpenAI API**: Interfaced via secure HTTPS for executing RAG synthesis, intent parsing, and generating natural-language mitigation strategy playbooks.
* **OSINT Data Feeds**: Connects to public RSS data streams, news aggregators, and weather telemetry to continuously feed raw signals into the ingestion controller.
* **Boeing ERP/MRP (SAP / Oracle)**: Accessed via an intranet VPN gateway. It allows the platform to verify live inventory lead times, check certified suppliers against the Approved Supplier List (ASL), and dispatch procurement adjustments (e.g., ME21N PO updates) back to corporate records.
* **Supplier Communications Gateway**: Sends automated inquiries to suppliers via email/SMTP or the supplier portal, listening for response callbacks to automatically recalculate operational risk levels.

---

## Network Protocols & Ports

| Origin Node | Target Node | Protocol / Method | Destination Port | Purpose |
|:---|:---|:---|:---|:---|
| Web Browser | Web Distribution / CDN | HTTPS / GET | `443` | Fetches static React client application code. |
| Web Browser | Application Load Balancer | HTTPS / REST / SSE | `443` | User-driven actions and real-time streaming updates. |
| Load Balancer (ALB) | FastAPI Web Container | HTTP | `8000` | Proxies user commands to FastAPI/Uvicorn backend. |
| FastAPI Backend | PostgreSQL (RDS) | PostgreSQL / TCP | `5432` | Persists logs, app state, and configurations. |
| AI Agent | Neo4j Graph DB | Bolt Protocol / TCP | `7687` | Traverses N-tier supply chain graph networks. |
| AI Agent | Vector Database | HTTP / REST | `5432` / `6333` | RAG search over historical playbooks and contracts. |
| AI Agent | OpenAI Platform | HTTPS / POST | `443` | Dispatches prompts to GPT-4o for strategic playbook drafting. |
| Threat Agent | OSINT API Feeds | HTTPS / GET | `443` | Polls public feeds for disruption signals. |
| FastAPI Backend | Boeing ERP System | HTTPS / RFC API | Dynamic | Connects to SAP/Oracle ERP for PO updates and FAI queries. |
| FastAPI Backend | Supplier Systems | HTTPS / SMTP | `443` / `25` | Dispatches emails/portal notifications to external suppliers. |
| Supplier Portal | FastAPI Backend | HTTPS / Webhook | `443` | Receives updates regarding supplier capacity confirmations. |

---

## MVP vs. Enterprise Production Delta

The monorepo is currently configured to run in a decoupled MVP state to support offline demonstrations and zero-configuration setups:

1. **Database Layer Transition**:
   * *MVP State*: All relational tables, supply graphs, and precedents are saved as local JSON collections in `frontend/src/data/` (e.g. `knowledgeGraph.json`, `threatRegistry.json`).
   * *Enterprise Target*: Fully migrated to Amazon RDS (PostgreSQL), Neo4j Enterprise Cloud, and Qdrant/pgvector.
2. **Server Separation**:
   * *MVP State*: React runs via a Vite development server on `localhost:5173`; FastAPI runs on `localhost:8000`.
   * *Enterprise Target*: Compiled React client is served via Nginx/CloudFront CDN, connecting to containerized FastAPI servers running in an autoscaling ECS/EKS VPC.

---

## Diagram Source (PlantUML)

The diagram source code is stored in [uml-deployment.puml](file:///Users/epheriami/Downloads/Projects/aps1013/project/docs/uml-deployment.puml). To compile it, run:
```bash
plantuml docs/uml-deployment.puml
```

```plantuml
@startuml Boeing_Supplier_Disruption_Radar_Deployment
!theme plain
skinparam BackgroundColor #FFFFFF
skinparam RoundCorner 8
skinparam Shadowing false
skinparam DefaultFontName "Inter, system-ui, -apple-system, sans-serif"
skinparam DefaultFontSize 12

' Custom element styling
skinparam node {
    BackgroundColor #F8FAFC
    BorderColor #64748B
    FontColor #0F172A
    FontSize 12
    FontStyle bold
}

skinparam database {
    BackgroundColor #FEFBF0
    BorderColor #F59E0B
    FontColor #78350F
    FontSize 12
    FontStyle bold
}

skinparam artifact {
    BackgroundColor #EFF6FF
    BorderColor #3B82F6
    FontColor #1E3A8A
    FontSize 11
}

skinparam component {
    BackgroundColor #F0FDF4
    BorderColor #15803D
    FontColor #14532D
    FontSize 11
}

skinparam cloud {
    BackgroundColor #FAF5FF
    BorderColor #7C3AED
    FontColor #4C1D95
    FontSize 12
    FontStyle bold
}

' Connection line styles
skinparam ArrowColor #475569
skinparam ArrowThickness 1.5
skinparam ArrowFontSize 10
skinparam ArrowFontName "JetBrains Mono, system-ui, monospace"

header Project Radar - Deployment Architecture Diagram
footer Boeing SCRM AI Platform | Confidential & Proprietary

title Boeing Supplier Disruption Radar (Project Radar)\nDeployment Architecture (MVP vs. Enterprise Target)

' --- CLIENT LAYER ---

node "User Workstation (Boeing Network)" <<device>> as ClientWorkstation {
    node "Web Browser" <<execution environment>> as WebBrowser {
        artifact "React + Vite SPA\n(Supply Chain Cockpit)" as ReactSPA
    }
}

' --- AWS / BOEING SECURE PRIVATE CLOUD ---

cloud "Boeing Secure Cloud Environment (VPC)" as SecureCloud {
    
    node "Web Distribution Node / CDN\n(Nginx / CloudFront)" <<infrastructure>> as CDN {
        artifact "Compiled Static UI Assets\n(HTML, JS, CSS, JSON DBs)" as StaticAssets
    }

    node "Application Load Balancer\n(ALB)" <<infrastructure>> as ALB {
    }

    node "Backend App Service Cluster\n(Elastic Container Service - ECS)" <<execution environment>> as AppCluster {
        node "FastAPI Web Container" <<container>> as FastAPIContainer {
            component "FastAPI Gateway & Orchestrator\n(main.py / Uvicorn)" as API_Gateway
            component "Ingestion Pipeline Controller" as Ingest_Controller
        }
        
        node "AI Processing Container" <<container>> as AIAgentContainer {
            component "Multi-Agent Orchestrator" as Agent_Orchestrator
            component "Threat Validator AI\n(verify_supply_base.py / collect_signals.py)" as Threat_Agent
            component "Impact Analyzer AI\n(analyze_signals.py / BOM mapping)" as Impact_Agent
            component "Playbook Gen AI\n(generate_mitigation_and_validation.py)" as Playbook_Agent
        }
    }

    node "Database Subnet (Isolated VPC Private Subnet)" <<subnet>> as DBSubnet {
        database "PostgreSQL Instance\n(Amazon RDS)" <<database>> as PostgresDB {
            label "Supplier Profiles\nDisruption Logs\nMitigation Playbooks"
        }
        
        database "Neo4j Instance\n(Graph Database)" <<database>> as Neo4jDB {
            label "N-Tier Supply Web\nBill of Materials (BOM)"
        }
        
        database "Vector Database\n(pgvector / Qdrant)" <<database>> as VectorDB {
            label "Historical Precedents\nSLAs & Contracts"
        }
    }
}

' --- EXTERNAL SERVICES & LEGACY SYSTEMS ---

cloud "External APIs & Public Services" as ExtCloud {
    node "OpenAI Platform (SaaS)" as OpenAIAPI {
        component "GPT-4o API\n(RAG Reasoning)" as GPT
    }
    
    node "OSINT Data Feeds" as OSINTAPI {
        component "News & Weather API\nRSS & Public Streams" as NewsFeed
    }
}

cloud "Boeing Enterprise Network (Secure Intranet)" as EnterpriseNetwork {
    node "ERP/MRP Gateway" <<system>> as ERPGateway {
        component "SAP / Oracle ERP\n(Materials & Logistics)" as ERPSystem
    }
}

cloud "Supplier Systems" as SupplierCloud {
    node "Supplier Communications" <<system>> as SupplierSystems {
        component "Supplier Portal / Email\n(Interactive Outreach)" as SupplierPortal
    }
}

' --- DEVELOPMENT AND MVP HYBRID NOTES ---

note left of DBSubnet
  **MVP Database Configuration:**
  Currently decoupled as static JSON
  files located in:
  * `/frontend/src/data/`
  * `/frontend/public/data/`
  (e.g., `threatRegistry.json`, `knowledgeGraph.json`)
end note

note left of AppCluster
  **Local MVP Dev Environment:**
  - Frontend: Vite Dev Server on port 5173
  - Backend: FastAPI/Uvicorn on port 8000
  - Python scripts running locally in venv
end note

' --- NETWORK RELATIONSHIPS & PROTOCOLS ---

ReactSPA -down-> StaticAssets : 1. Download UI Assets\n(HTTP/HTTPS: 80/443)
ReactSPA -right-> ALB : 2. User Input & Requests\n(HTTPS / SSE: 443)
ALB -right-> API_Gateway : 3. Proxy Requests\n(HTTP: 8000)

API_Gateway <--> PostgresDB : Read/Write Logs & Metadata\n(PostgreSQL / TCP: 5432)
API_Gateway -down-> Agent_Orchestrator : Delegate Processing\n(Internal Python Execution)

Agent_Orchestrator -down-> Threat_Agent
Agent_Orchestrator -down-> Impact_Agent
Agent_Orchestrator -down-> Playbook_Agent

Threat_Agent -up-> OSINTAPI : Ingest Signals\n(HTTPS: 443)
Impact_Agent <--> Neo4jDB : Traverse N-Tier Supply Graph\n(Bolt Protocol / TCP: 7687)
Playbook_Agent <--> VectorDB : Query Precedent RAG Embeddings\n(Vector Query / TCP: 5432 / 6333)
Playbook_Agent <--> OpenAIAPI : Generate Strategy & Text\n(HTTPS: 443)

Impact_Agent -.-> ERPSystem : Pull Live Lead Times / Inventory\n(HTTPS / RFC API)
API_Gateway ===> ERPSystem : Dispatch Approved Purchase Orders\n(HTTPS / RFC API)
API_Gateway ===> SupplierSystems : Send Automatic Supplier Outreach\n(HTTPS / SMTP)
SupplierSystems -.-> API_Gateway : Supplier Response Callback\n(HTTPS Webhook / Port 443)

@enduml
```
