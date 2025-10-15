import React, { useEffect, useMemo, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchDesignationsFlow, selectDesignationsFlow, selectDesignationsFlowError, selectDesignationsFlowLoading } from '../../Redux/Public/designationSlice'
import { Activity, Layers, GitBranch, CheckCircle2, Ban } from 'lucide-react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useEdgesState,
  useNodesState,
  MarkerType,
  Position,
  addEdge,
  Handle
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

export default function DesignationsListPage() {
  const dispatch = useDispatch()
  const flow = useSelector(selectDesignationsFlow)
  const loading = useSelector(selectDesignationsFlowLoading)
  const error = useSelector(selectDesignationsFlowError)

  useEffect(() => {
    dispatch(fetchDesignationsFlow())
  }, [dispatch])

  // Build React Flow graph from API tree response
  const { rfNodes, rfEdges } = useMemo(() => buildGraphFromTree(flow?.tree || []), [flow])
  const [nodes, setNodes, onNodesChange] = useNodesState(rfNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(rfEdges)
  const rfInstanceRef = useRef(null)

  // Keep React Flow state in sync when API data changes
  useEffect(() => {
    setNodes(rfNodes)
  }, [rfNodes, setNodes])

  useEffect(() => {
    setEdges(rfEdges)
  }, [rfEdges, setEdges])

  // Refit view when graph updates so MiniMap and viewport align to current data
  useEffect(() => {
    if (nodes.length > 0 && rfInstanceRef.current) {
      const t = setTimeout(() => rfInstanceRef.current?.fitView({ padding: 0.2 }), 0)
      return () => clearTimeout(t)
    }
  }, [nodes.length, edges.length])

  if (loading === 'loading') {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <h1 className="text-lg font-semibold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">Designations</h1>
        <div className="rounded-xl border border-orange-500/20 bg-white p-4 text-xs text-neutral-600 animate-pulse">Loading architecture…</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <h1 className="text-lg font-semibold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">Designations</h1>
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">Designations</h1>
        {flow?.metrics && (
          <div className="flex items-center gap-3 text-xs text-neutral-600">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
              <Layers size={14} /> {flow.metrics.total} total
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-neutral-50 text-neutral-700 border border-neutral-200">
              <GitBranch size={14} /> depth {flow.metrics.maxDepth}
            </span>
          </div>
        )}
      </div>

      {/* Smart cards grid for nodes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {(flow?.nodes || []).map(n => (
          <div key={n.id} className="group bg-white border border-orange-500/20 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-base font-semibold text-neutral-900">{n.title}</div>
                <div className="text-sm text-neutral-500 mt-1 line-clamp-2">{n.description || '—'}</div>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${n.isActive ? 'bg-neutral-900 text-white' : 'bg-neutral-200 text-neutral-700'}`}>{n.isActive ? 'Active' : 'Inactive'}</span>
            </div>
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <span className="text-xs px-2 py-1 rounded-full bg-neutral-100 text-neutral-700 border border-neutral-200">Level {n.level ?? '-'}</span>
              {(n.enabledRoutes || []).map(r => (
                <span key={r} className="text-xs px-2 py-1 rounded-full bg-neutral-100 text-neutral-700 border border-neutral-200">{r}</span>
              ))}
            </div>
            <div className="mt-3 text-xs text-neutral-500">{n.breadcrumb || (n.pathLabels || []).join(' > ')}</div>
          </div>
        ))}
      </div>

      {/* React Flow org chart */}
      <div className="bg-white border border-orange-500/20 rounded-2xl p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-neutral-800 mb-3">
          <Activity size={16} className="text-orange-600" /> Architecture
        </div>
        <div style={{ height: 520 }} className="rounded-xl overflow-hidden border border-orange-500/10 rf-dark">
          {/* Scoped dark styles for React Flow Controls */}
          <style>{`
            .rf-dark .react-flow__controls {
              background: transparent;
              border: 1px solid rgba(17,24,39,0.12);
              box-shadow: none;
            }
            .rf-dark .react-flow__controls button {
              background-color: #111827; /* neutral-900 */
              color: #ffffff;
              border-color: #0f172a; /* slate-900 */
            }
            .rf-dark .react-flow__controls button:hover {
              background-color: #0b1220; /* slightly darker */
              border-color: #0b1220;
            }
            .rf-dark .react-flow__controls button:focus {
              outline: none;
              box-shadow: 0 0 0 2px rgba(255,255,255,0.08), 0 0 0 4px rgba(17,24,39,0.35);
            }
          `}</style>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onInit={(instance) => { rfInstanceRef.current = instance }}
            onConnect={(params) =>
              setEdges((eds) =>
                addEdge(
                  {
                    ...params,
                    type: 'smoothstep',
                    markerEnd: { type: MarkerType.ArrowClosed },
                    style: { stroke: 'rgba(234,88,12,0.55)' },
                  },
                  eds,
                ),
              )
            }
            connectionLineType="smoothstep"
            connectionLineStyle={{ stroke: '#111827', strokeWidth: 2 }}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            proOptions={{ hideAttribution: true }}
            defaultEdgeOptions={{
              type: 'smoothstep',
              markerEnd: { type: MarkerType.ArrowClosed },
              style: { stroke: 'rgba(234,88,12,0.45)' },
            }}
            nodeTypes={{ designation: NodeCard }}
          >
            <MiniMap
              maskColor="#fafafa"
              nodeBorderRadius={10}
              nodeStrokeColor={(n) => (n?.data?.isActive ? '#ea580c' : '#9ca3af')}
              nodeColor={(n) => (n?.data?.isActive ? '#fff7ed' : '#f3f4f6')}
            />
            <Controls position="bottom-right" />
            <Background gap={18} size={1} color="#f1f5f9" />
          </ReactFlow>
        </div>
      </div>
    </div>
  )
}

// --- React Flow custom node ---
function NodeCard({ data }) {
  const { label, description, isActive, level, enabledRoutes } = data || {}
  const ActiveIcon = isActive ? CheckCircle2 : Ban
  return (
    <div className="relative w-[240px] min-h-[68px] group cursor-pointer">
      <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-neutral-900 !border !border-slate-900" />
      {/* subtle grid background inside node */}
      <div
        className="absolute inset-0 rounded-xl z-0"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(234,88,12,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(234,88,12,0.06) 1px, transparent 1px)',
          backgroundSize: '12px 12px',
          backgroundColor: '#ffffff',
        }}
      />
      {/* dark hover overlay over background */}
      <div className="pointer-events-none absolute inset-0 rounded-xl bg-neutral-900/60 opacity-0 group-hover:opacity-100 transition-opacity z-10" />
      {/* card content */}
      <div className="relative z-20 rounded-xl border bg-white px-3 py-2 shadow-sm hover:shadow-md transition-shadow"
           style={{ borderColor: isActive ? 'rgba(234,88,12,0.55)' : 'rgba(0,0,0,0.08)' }}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[13px] font-semibold text-neutral-900 truncate" title={label}>{label}</div>
            {description ? (
              <div className="text-[11px] text-neutral-500 mt-0.5 line-clamp-2">{description}</div>
            ) : null}
          </div>
          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${isActive ? 'bg-neutral-900 text-white' : 'bg-neutral-200 text-neutral-700'}`}>
            <ActiveIcon size={12} /> {isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
        <div className="mt-2 flex items-center gap-1.5 flex-wrap">
          <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-neutral-100 text-neutral-700 border border-neutral-200">
            <Layers size={12} /> Level {typeof level === 'number' ? level : '-'}
          </span>
          {Array.isArray(enabledRoutes) && enabledRoutes.slice(0, 3).map((r) => (
            <span key={r} className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-neutral-100 text-neutral-700 border border-neutral-200">
              <GitBranch size={12} /> {r}
            </span>
          ))}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-neutral-900 !border !border-slate-900" />
    </div>
  )
}

// --- Utilities ---
function buildGraphFromTree(forest) {
  const nodes = []
  const edges = []
  const NODE_W = 240
  const NODE_H = 64
  const H_SPACING = 260
  const V_SPACING = 140

  // stable ID map for nodes without explicit IDs
  const idMap = new Map()
  let idCounter = 0
  const getId = (obj) => {
    const raw = obj && obj.id != null ? String(obj.id) : null
    if (raw) return raw
    if (idMap.has(obj)) return idMap.get(obj)
    const gen = `n_${idCounter++}`
    idMap.set(obj, gen)
    return gen
  }

  // First pass: compute x positions using a simple tidy layout based on leaf order
  let leafIndex = 0

  function assignPositions(node, depth = 0) {
    const hasChildren = Array.isArray(node.children) && node.children.length > 0
    let x
    if (!hasChildren) {
      x = leafIndex * H_SPACING
      leafIndex += 1
    } else {
      const childXs = node.children.map(ch => assignPositions(ch, depth + 1))
      x = (Math.min(...childXs) + Math.max(...childXs)) / 2
    }

    const y = depth * V_SPACING
    addNode(node, x, y)
    if (hasChildren) {
      for (const ch of node.children) {
        const sourceId = getId(node)
        const targetId = getId(ch)
        edges.push({
          id: `${sourceId}-${targetId}`,
          source: sourceId,
          target: targetId,
          markerEnd: { type: MarkerType.ArrowClosed, color: 'rgb(234,88,12)' },
          style: { stroke: 'rgba(234,88,12,0.45)' },
        })
      }
    }
    return x
  }

  function addNode(n, x, y) {
    const isActive = !!n.isActive
    const id = getId(n)
    nodes.push({
      id,
      position: { x, y },
      width: NODE_W,
      height: NODE_H,
      data: { label: n.title || id, description: n.description, isActive, level: n.level, enabledRoutes: n.enabledRoutes || [] },
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
      type: 'designation',
      style: {
        width: NODE_W,
        border: 'none',
        background: 'transparent',
        boxShadow: 'none',
      },
    })
  }

  if (!Array.isArray(forest) || forest.length === 0) {
    return { rfNodes: [], rfEdges: [] }
  }
  for (const root of forest) assignPositions(root, 0)

  // Center the graph around x=0 for nicer fitView
  if (nodes.length > 0) {
    const minX = Math.min(...nodes.map(n => n.position.x))
    const maxX = Math.max(...nodes.map(n => n.position.x))
    const offset = (minX + maxX) / 2
    for (const n of nodes) n.position.x -= offset
  }

  return { rfNodes: nodes, rfEdges: edges }
}
