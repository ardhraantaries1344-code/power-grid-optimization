import { GridNode, GridEdge } from '../types/grid'

export const INITIAL_NODES: GridNode[] = [
  // Power Stations
  { id:'PS_NER',  name:'Neriamangalam Hydro Plant',         category:'powerstation', lat:10.051, lng:76.785, topoX:10.35, topoY:76.75, voltage:220, mw:77,   status:'Active' },
  { id:'PS_BHT',  name:'Bhoothathankettu Hydro Station',    category:'powerstation', lat:10.133, lng:76.663, topoX:10.45, topoY:76.65, voltage:110, mw:24,   status:'Active' },
  { id:'PS_CIAL', name:'CIAL Nedumbassery Solar Park',      category:'powerstation', lat:10.155, lng:76.388, topoX:10.45, topoY:76.35, voltage:110, mw:40,   status:'Active' },
  { id:'PS_BRH',  name:'Brahmapuram Solar & Generation',    category:'powerstation', lat:9.991,  lng:76.368, topoX:10.05, topoY:76.35, voltage:220, mw:100,  status:'Active' },
  // Substations
  { id:'SS_KLM',  name:'Kalamassery 400kV/220kV Hub',       category:'substation',   lat:10.052, lng:76.331, topoX:10.25, topoY:76.30, voltage:400, mw:0,    status:'Active' },
  { id:'SS_KLR',  name:'Kaloor 220kV Substation (Kochi)',   category:'substation',   lat:9.995,  lng:76.298, topoX:10.05, topoY:76.25, voltage:220, mw:0,    status:'Active' },
  { id:'SS_PTC',  name:'Puthencruz 220kV Hub (MITS Node)',  category:'substation',   lat:9.965,  lng:76.415, topoX:9.85,  topoY:76.45, voltage:220, mw:0,    status:'Active' },
  { id:'SS_ALV',  name:'Aluva 110kV Substation',            category:'substation',   lat:10.108, lng:76.353, topoX:10.35, topoY:76.30, voltage:110, mw:0,    status:'Active' },
  { id:'SS_KTM',  name:'Kothamangalam 110kV Substation',    category:'substation',   lat:10.065, lng:76.625, topoX:10.25, topoY:76.65, voltage:110, mw:0,    status:'Active' },
  { id:'SS_PVR',  name:'Perumbavoor 110kV Substation',      category:'substation',   lat:10.115, lng:76.475, topoX:10.35, topoY:76.50, voltage:110, mw:0,    status:'Active' },
  // Cities / Load Centers
  { id:'CT_MET',  name:'Kochi Metro & Ernakulam CBD',       category:'city',         lat:9.970,  lng:76.285, topoX:9.75,  topoY:76.20, voltage:110, mw:-320, status:'Active' },
  { id:'CT_BPCL', name:'BPCL Kochi Refinery (Ambalamugal)', category:'city',         lat:9.955,  lng:76.362, topoX:9.65,  topoY:76.35, voltage:220, mw:-280, status:'Active' },
  { id:'CT_INF',  name:'Kakkanad Infopark & SmartCity',     category:'city',         lat:10.010, lng:76.360, topoX:10.15, topoY:76.40, voltage:110, mw:-160, status:'Active' },
  { id:'CT_PRT',  name:'Willingdon Island / Cochin Port',   category:'city',         lat:9.940,  lng:76.270, topoX:9.55,  topoY:76.20, voltage:110, mw:-110, status:'Active' },
  { id:'CT_ANG',  name:'Angamaly Industrial Corridor',      category:'city',         lat:10.190, lng:76.385, topoX:10.55, topoY:76.40, voltage:110, mw:-90,  status:'Active' },
]

export const INITIAL_EDGES: Omit<GridEdge, 'straightKm'|'actualKm'|'cost'>[] = [
  { id:'TL_NER_KTM',  u:'PS_NER',  v:'SS_KTM',  voltage:220, capacity:400, loadMW:77,  tripped:false },
  { id:'TL_BHT_KTM',  u:'PS_BHT',  v:'SS_KTM',  voltage:110, capacity:150, loadMW:24,  tripped:false },
  { id:'TL_KTM_PVR',  u:'SS_KTM',  v:'SS_PVR',  voltage:110, capacity:250, loadMW:80,  tripped:false },
  { id:'TL_KTM_PTC',  u:'SS_KTM',  v:'SS_PTC',  voltage:220, capacity:450, loadMW:180, tripped:false },
  { id:'TL_PVR_ALV',  u:'SS_PVR',  v:'SS_ALV',  voltage:110, capacity:250, loadMW:90,  tripped:false },
  { id:'TL_CIAL_ALV', u:'PS_CIAL', v:'SS_ALV',  voltage:110, capacity:150, loadMW:40,  tripped:false },
  { id:'TL_ALV_ANG',  u:'SS_ALV',  v:'CT_ANG',  voltage:110, capacity:200, loadMW:90,  tripped:false },
  { id:'TL_ALV_KLM',  u:'SS_ALV',  v:'SS_KLM',  voltage:110, capacity:250, loadMW:130, tripped:false },
  { id:'TL_KLM_KLR',  u:'SS_KLM',  v:'SS_KLR',  voltage:220, capacity:600, loadMW:320, tripped:false },
  { id:'TL_KLM_BRH',  u:'SS_KLM',  v:'PS_BRH',  voltage:220, capacity:600, loadMW:260, tripped:false },
  { id:'TL_BRH_INF',  u:'PS_BRH',  v:'CT_INF',  voltage:110, capacity:300, loadMW:160, tripped:false },
  { id:'TL_BRH_PTC',  u:'PS_BRH',  v:'SS_PTC',  voltage:220, capacity:500, loadMW:140, tripped:false },
  { id:'TL_PTC_BPCL', u:'SS_PTC',  v:'CT_BPCL', voltage:220, capacity:500, loadMW:280, tripped:false },
  { id:'TL_KLR_MET',  u:'SS_KLR',  v:'CT_MET',  voltage:110, capacity:400, loadMW:240, tripped:false },
  { id:'TL_INF_MET',  u:'CT_INF',  v:'CT_MET',  voltage:110, capacity:200, loadMW:80,  tripped:false },
  { id:'TL_MET_PRT',  u:'CT_MET',  v:'CT_PRT',  voltage:110, capacity:200, loadMW:110, tripped:false },
  { id:'TL_BPCL_PRT', u:'CT_BPCL', v:'CT_PRT',  voltage:110, capacity:180, loadMW:40,  tripped:false },
]

export const COST_TABLE: Record<number, number> = { 400: 150, 220: 85, 110: 45 }
export const ROUTE_MULTIPLIER = 1.18
