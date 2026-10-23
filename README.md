# ⚡ Ernakulam Power Grid Optimization Suite
### Graph Algorithms Workbench & Real-Time SCADA Engine | MITS Kochi

An interactive, industrial-grade power grid optimization and SCADA workbench for the **Ernakulam District 110 kV / 220 kV / 400 kV Transmission Network**, powered by a **Python FastAPI & NetworkX computational microservice** and a **React 18 + TypeScript GIS frontend**.

---

## 🏛️ System Architecture

```
┌──────────────────────────────────────────────┐        REST API & Telemetry        ┌──────────────────────────────────────────────┐
│         React + TypeScript Frontend          │ ◄────────────────────────────────► │          Python FastAPI Backend Engine       │
│  • Leaflet GIS Map with Google Hybrid Tiles  │   GET  /api/health                 │  • NetworkX 3.3 Computational Graph Solvers  │
│  • Interactive SCADA Telemetry HUD           │   GET  /api/telemetry/live         │  • Dijkstra (Distance / Cost Weighted)       │
│  • Visual Flow Corridors & Chart.js Loaded   │   POST /api/algorithms/dijkstra    │  • Kruskal's Minimum Spanning Tree (MST)     │
│  • Real-Time Line Tripping & Add Entity      │   POST /api/algorithms/kruskal     │  • Edmonds-Karp Maximum Flow (MW)            │
│  • Automatic Graceful Fallback Engine        │   POST /api/algorithms/tarjan      │  • Tarjan's Critical Bridges & Articulation  │
└──────────────────────────────────────────────┘   POST /api/scenarios/save         │  • Undirected Cycle Basis (Ring Bus)         │
                                                                                    │  • Max-Flow Min-Cut Theorem Solver           │
                                                                                    └──────────────────────────────────────────────┘
                                                                                                        ▲
                                                                                                        │
                                                                                    Interactive Swagger Docs: /docs
```

---

## 🚀 Quick Start

### Option A: One-Click Startup (Windows)
Double-click:
```bat
start_all.bat
```
*(Automatically starts both FastAPI and Vite servers and opens your browser).*

---

### Option B: Manual Command Line

**1. Launch the Python FastAPI Backend:**
```powershell
cd C:\Users\phili\.gemini\antigravity\scratch\ernakulam-grid
python -m uvicorn backend.main:app --port 8000 --reload
# API & Swagger UI: http://127.0.0.1:8000/docs
```

**2. Launch the React Frontend (in another terminal):**
```powershell
cd C:\Users\phili\.gemini\antigravity\scratch\ernakulam-grid
npm run dev
# Dashboard: http://localhost:5173
```

---

## ⚙️ Backend API Endpoints (Python FastAPI + NetworkX)

| Endpoint | Method | Engine / Algorithm | Output |
| :--- | :---: | :--- | :--- |
| `/api/health` | `GET` | System Health Monitor | API status & frequency check |
| `/api/telemetry/live` | `GET` | SCADA Telemetry Stream | Nominal 50.00 Hz live fluctuation & damping |
| `/api/algorithms/dijkstra` | `POST` | `nx.shortest_path` | Optimal path, hops, total km & CAPEX (₹ Lakhs) |
| `/api/algorithms/kruskal` | `POST` | `nx.minimum_spanning_tree` | Minimum Spanning Tree, saved budget & % |
| `/api/algorithms/maxflow` | `POST` | `nx.maximum_flow` | Edmonds-Karp maximum MW power throughput |
| `/api/algorithms/tarjan` | `POST` | `nx.bridges` & `nx.articulation_points` | N-1 vulnerable transmission single points of failure |
| `/api/algorithms/cycles` | `POST` | `nx.cycle_basis` | Ring bus loop redundancy verification |
| `/api/algorithms/mincut` | `POST` | `nx.minimum_cut` | Max-flow min-cut theorem bottleneck corridors |
| `/api/scenarios/save` | `POST` | Scenario Persistence Engine | Save blackout & grid simulation snapshots |

---

## 🛡️ Automatic Dual-Engine Fallback

The React UI features **seamless engine fallback**:
- **When FastAPI is running:** UI uses the high-performance Python NetworkX engine, displaying the pulsing **`PYTHON FASTAPI (ONLINE)`** status pill with one-click access to Swagger `/docs`.
- **When FastAPI is stopped:** UI automatically switches to the built-in browser TypeScript graph solver without failing or showing network errors.

---

## 🌍 UN Sustainable Development Goals (SDGs)

- **SDG 7:** Affordable & Clean Energy (Renewable solar & hydro integration: CIAL Solar, Neriamangalam Hydro).
- **SDG 9:** Industry, Innovation & Infrastructure (Algorithmic grid planning replacing legacy static SLDs).
- **SDG 11:** Sustainable Cities & Communities (Power security for Kochi Metro, Infopark, Cochin Port).
- **SDG 13:** Climate Action (Line loss minimization & low-carbon dispatch).
- **SDG 17:** Partnerships for the Goals (Open academic research tool by MITS Kochi for utility use).

---

*MITS Kochi | Department of Electrical & Computer Engineering*
