"""
Ernakulam Power Grid Optimization - High Performance SCADA & Graph Algorithms Backend
Built with FastAPI, NetworkX, and Pydantic
MITS Kochi Grid Optimization Project
"""

import math
import random
from typing import List, Optional, Dict, Any, Literal
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import networkx as nx

app = FastAPI(
    title="Ernakulam Power Grid SCADA & Graph Solver API",
    description="Computational graph engine & real-time SCADA telemetry for Ernakulam District 110/220/400 kV Transmission Network.",
    version="2.0.0"
)

# Enable CORS for React frontend (Vite runs on http://localhost:5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==============================================================================
# PYDANTIC SCHEMAS (Matches TypeScript grid.ts 1:1)
# ==============================================================================

class GridNodeModel(BaseModel):
    id: str
    name: str
    category: Literal['powerstation', 'substation', 'city']
    lat: float
    lng: float
    topoX: Optional[float] = None
    topoY: Optional[float] = None
    voltage: int
    mw: float
    status: Literal['Active', 'Tripped'] = 'Active'

class GridEdgeModel(BaseModel):
    id: str
    u: str
    v: str
    voltage: int
    capacity: float
    loadMW: float
    tripped: bool = False
    straightKm: Optional[float] = 0.0
    actualKm: Optional[float] = 0.0
    cost: Optional[float] = 0.0

class GraphPayload(BaseModel):
    nodes: List[GridNodeModel]
    edges: List[GridEdgeModel]

class DijkstraRequest(BaseModel):
    nodes: List[GridNodeModel]
    edges: List[GridEdgeModel]
    source: str
    target: str
    weightKey: Literal['distance', 'cost'] = 'distance'

class FlowRequest(BaseModel):
    nodes: List[GridNodeModel]
    edges: List[GridEdgeModel]
    source: str
    target: str

class TraversalRequest(BaseModel):
    nodes: List[GridNodeModel]
    edges: List[GridEdgeModel]
    source: str
    mode: Literal['bfs', 'dfs'] = 'bfs'

# In-memory saved scenarios store
SAVED_SCENARIOS: Dict[str, Any] = {}

# ==============================================================================
# HELPER: BUILD NETWORKX GRAPH
# ==============================================================================

def build_nx_graph(nodes: List[GridNodeModel], edges: List[GridEdgeModel], directed: bool = False):
    G = nx.DiGraph() if directed else nx.Graph()
    
    active_node_ids = set()
    for n in nodes:
        if n.status != 'Tripped':
            G.add_node(n.id, name=n.name, category=n.category, voltage=n.voltage, mw=n.mw)
            active_node_ids.add(n.id)

    for e in edges:
        if not e.tripped and e.u in active_node_ids and e.v in active_node_ids:
            weight = e.actualKm if e.actualKm and e.actualKm > 0 else 1.0
            cost = e.cost if e.cost and e.cost > 0 else 1.0
            capacity = e.capacity if e.capacity and e.capacity > 0 else 100.0

            if directed:
                # Add bidirectional flow for transmission line
                G.add_edge(e.u, e.v, id=e.id, weight=weight, cost=cost, capacity=capacity, loadMW=e.loadMW)
                G.add_edge(e.v, e.u, id=e.id, weight=weight, cost=cost, capacity=capacity, loadMW=e.loadMW)
            else:
                G.add_edge(e.u, e.v, id=e.id, weight=weight, cost=cost, capacity=capacity, loadMW=e.loadMW)

    return G

# ==============================================================================
# ENDPOINTS
# ==============================================================================

@app.get("/")
def root():
    return {
        "system": "Ernakulam Power Grid Optimization API",
        "institution": "MITS Kochi",
        "docs_url": "/docs",
        "status": "ONLINE",
        "engine": "Python NetworkX 3.3"
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "backend": "FastAPI",
        "algorithms_ready": True,
        "frequency_hz": round(50.0 + random.uniform(-0.03, 0.03), 3)
    }

@app.get("/api/telemetry/live")
def get_live_telemetry():
    """
    Simulates high-precision real-time SCADA telemetry:
    Grid frequency (50.00 Hz nominal standard), dynamic phase angle, and fluctuating load.
    """
    freq_fluctuation = random.uniform(-0.025, 0.025)
    return {
        "frequency_hz": round(50.000 + freq_fluctuation, 3),
        "status_code": "NORMAL" if abs(freq_fluctuation) < 0.02 else "WARNING_DEVIATION",
        "grid_damping_ratio": 0.85,
        "scada_cycle_ms": 40,
        "timestamp": "LIVE_TELEMETRY"
    }

# ------------------------------------------------------------------------------
# 1. DIJKSTRA'S SHORTEST PATH (NetworkX)
# ------------------------------------------------------------------------------
@app.post("/api/algorithms/dijkstra")
def api_dijkstra(req: DijkstraRequest):
    if req.source == req.target:
        raise HTTPException(status_code=400, detail="Source and destination cannot be identical.")

    G = build_nx_graph(req.nodes, req.edges, directed=False)

    if req.source not in G or req.target not in G:
        raise HTTPException(status_code=404, detail="Source or target facility is offline/tripped.")

    weight_attr = "cost" if req.weightKey == "cost" else "weight"

    try:
        path = nx.shortest_path(G, source=req.source, target=req.target, weight=weight_attr)
        path_length = nx.shortest_path_length(G, source=req.source, target=req.target, weight=weight_attr)
    except nx.NetworkXNoPath:
        return {
            "type": "dijkstra",
            "selectedEdges": [],
            "selectedNodes": [],
            "error": f"No energized transmission corridor connects {req.source} to {req.target}."
        }

    # Extract edge IDs and calculate aggregates
    selected_edges = []
    total_cost = 0.0
    total_distance = 0.0

    for i in range(len(path) - 1):
        u, v = path[i], path[i+1]
        edge_data = G.get_edge_data(u, v)
        selected_edges.append(edge_data.get("id"))
        total_cost += edge_data.get("cost", 0.0)
        total_distance += edge_data.get("weight", 0.0)

    return {
        "type": "dijkstra",
        "solver": "NetworkX Dijkstra Single-Source",
        "selectedEdges": selected_edges,
        "selectedNodes": path,
        "totalCost": f"{total_cost:.1f}",
        "totalDistance": f"{total_distance:.1f}",
        "weightKey": req.weightKey,
        "explanation": f"NetworkX Dijkstra resolved optimal {len(selected_edges)}-hop route. Total: ₹{total_cost:.1f} Lakhs, {total_distance:.1f} km."
    }

# ------------------------------------------------------------------------------
# 2. KRUSKAL'S MINIMUM SPANNING TREE (NetworkX)
# ------------------------------------------------------------------------------
@app.post("/api/algorithms/kruskal")
def api_kruskal(req: GraphPayload):
    G = build_nx_graph(req.nodes, req.edges, directed=False)
    
    if len(G) == 0:
        return {"error": "No active nodes available in the network."}

    # Kruskal's algorithm via NetworkX
    mst_graph = nx.minimum_spanning_tree(G, weight="cost", algorithm="kruskal")
    
    mst_edge_ids = [data["id"] for _, _, data in mst_graph.edges(data=True)]
    total_cost_lakhs = sum(data.get("cost", 0.0) for _, _, data in mst_graph.edges(data=True))
    total_dist_km = sum(data.get("weight", 0.0) for _, _, data in mst_graph.edges(data=True))
    
    active_edges = [e for e in req.edges if not e.tripped]
    full_grid_cost = sum(e.cost or 0.0 for e in active_edges)
    saved_lakhs = full_grid_cost - total_cost_lakhs
    is_connected = nx.is_connected(G)

    return {
        "type": "mst",
        "solver": "NetworkX Kruskal Spanning Tree Engine",
        "selectedEdges": mst_edge_ids,
        "selectedNodes": list(mst_graph.nodes()),
        "totalCostLakhs": round(total_cost_lakhs, 1),
        "totalDistKm": f"{total_dist_km:.1f}",
        "fullGridCost": round(full_grid_cost, 1),
        "savedLakhs": round(saved_lakhs, 1),
        "edgeCount": len(mst_edge_ids),
        "isConnected": is_connected,
        "explanation": f"NetworkX Kruskal MST formed with {len(mst_edge_ids)} corridors. Minimal CAPEX: ₹{total_cost_lakhs:.1f} Lakhs (Saved ₹{saved_lakhs:.1f} Lakhs, {round((saved_lakhs/max(full_grid_cost,1))*100)}% budget reduction)."
    }

# ------------------------------------------------------------------------------
# 3. FORD-FULKERSON / EDMONDS-KARP MAX FLOW (NetworkX)
# ------------------------------------------------------------------------------
@app.post("/api/algorithms/maxflow")
def api_maxflow(req: FlowRequest):
    if req.source == req.target:
        raise HTTPException(status_code=400, detail="Source and sink must be distinct facilities.")

    G = build_nx_graph(req.nodes, req.edges, directed=True)

    if req.source not in G or req.target not in G:
        raise HTTPException(status_code=404, detail="Source or sink is inactive.")

    try:
        flow_value, flow_dict = nx.maximum_flow(G, req.source, req.target, capacity="capacity")
    except nx.NetworkXError as err:
        return {"type": "maxflow", "selectedEdges": [], "error": str(err)}

    active_lines = set()
    for u in flow_dict:
        for v, flow in flow_dict[u].items():
            if flow > 0:
                edge_data = G.get_edge_data(u, v)
                if edge_data and "id" in edge_data:
                    active_lines.add(edge_data["id"])

    return {
        "type": "maxflow",
        "solver": "NetworkX Edmonds-Karp Max Flow",
        "selectedEdges": list(active_lines),
        "selectedNodes": [],
        "maxFlowMW": flow_value,
        "explanation": f"NetworkX Maximum Flow: Safe transfer limit is {flow_value:,.0f} MW without thermal line violation."
    }

# ------------------------------------------------------------------------------
# 4. TARJAN'S BRIDGES & ARTICULATION POINTS (NetworkX)
# ------------------------------------------------------------------------------
@app.post("/api/algorithms/tarjan")
def api_tarjan(req: GraphPayload):
    G = build_nx_graph(req.nodes, req.edges, directed=False)
    
    bridges = list(nx.bridges(G))
    bridge_ids = []
    for u, v in bridges:
        data = G.get_edge_data(u, v)
        if data and "id" in data:
            bridge_ids.append(data["id"])

    articulation_points = list(nx.articulation_points(G))

    return {
        "type": "tarjan",
        "solver": "NetworkX DFS Biconnected Components",
        "selectedEdges": bridge_ids,
        "selectedNodes": articulation_points,
        "bridgeCount": len(bridge_ids),
        "apCount": len(articulation_points),
        "explanation": f"Tarjan's Analysis (Python): Detected {len(bridge_ids)} transmission bridges and {len(articulation_points)} articulation substations (N-1 critical bottlenecks)."
    }

# ------------------------------------------------------------------------------
# 5. CYCLE DETECTION (RING BUS) (NetworkX)
# ------------------------------------------------------------------------------
@app.post("/api/algorithms/cycles")
def api_cycles(req: GraphPayload):
    G = build_nx_graph(req.nodes, req.edges, directed=False)
    cycles = nx.cycle_basis(G)

    has_cycle = len(cycles) > 0
    cycle_edge_ids = []
    cycle_nodes = []

    if has_cycle:
        primary_cycle = cycles[0]
        cycle_nodes = primary_cycle
        for i in range(len(primary_cycle)):
            u = primary_cycle[i]
            v = primary_cycle[(i + 1) % len(primary_cycle)]
            data = G.get_edge_data(u, v)
            if data and "id" in data:
                cycle_edge_ids.append(data["id"])

    return {
        "type": "cycle",
        "solver": "NetworkX Cycle Basis",
        "hasCycle": has_cycle,
        "cycleCount": len(cycles),
        "selectedEdges": cycle_edge_ids,
        "selectedNodes": cycle_nodes,
        "explanation": f"Ring Bus Loop verified! Identified {len(cycles)} closed loops providing parallel backup transmission redundancy." if has_cycle else "Grid is strictly radial/tree structure with zero loop redundancy."
    }

# ------------------------------------------------------------------------------
# 6. MINIMUM CUT BOTTLENECK ANALYSIS (NetworkX)
# ------------------------------------------------------------------------------
@app.post("/api/algorithms/mincut")
def api_mincut(req: FlowRequest):
    G = build_nx_graph(req.nodes, req.edges, directed=True)

    if req.source not in G or req.target not in G:
        raise HTTPException(status_code=404, detail="Source or target node not reachable.")

    try:
        cut_value, partition = nx.minimum_cut(G, req.source, req.target, capacity="capacity")
        reachable, non_reachable = partition

        # Find edges crossing the cut
        cut_edges = []
        for u in reachable:
            for v in non_reachable:
                if G.has_edge(u, v):
                    cut_edges.append(G[u][v]["id"])

        return {
            "type": "mincut",
            "solver": "NetworkX Max-Flow Min-Cut Theorem",
            "cutCapacityMW": cut_value,
            "selectedEdges": list(set(cut_edges)),
            "selectedNodes": list(reachable),
            "explanation": f"Max-Flow Min-Cut confirmed: Minimum bottleneck capacity is {cut_value:,.0f} MW across critical cut corridors."
        }
    except Exception as e:
        return {"type": "mincut", "selectedEdges": [], "error": str(e)}

# ------------------------------------------------------------------------------
# 7. SCENARIO PERSISTENCE (SAVE / LOAD SIMULATIONS)
# ------------------------------------------------------------------------------
@app.post("/api/scenarios/save")
def save_scenario(name: str, payload: GraphPayload):
    SAVED_SCENARIOS[name] = {
        "nodes": [n.dict() for n in payload.nodes],
        "edges": [e.dict() for e in payload.edges],
        "count_nodes": len(payload.nodes),
        "count_edges": len(payload.edges)
    }
    return {"message": f"Scenario '{name}' saved successfully in SCADA memory."}

@app.get("/api/scenarios/list")
def list_scenarios():
    return {
        "scenarios": list(SAVED_SCENARIOS.keys()),
        "total": len(SAVED_SCENARIOS)
    }
