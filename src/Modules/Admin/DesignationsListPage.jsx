import React, { useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDesignationsFlow,
  selectDesignationsFlow,
  selectDesignationsFlowError,
  selectDesignationsFlowLoading,
} from "../../Redux/Public/designationSlice";
import {
  Activity,
  Layers,
  GitBranch,
  CheckCircle2,
  Ban,
  Clock,
} from "lucide-react";

import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useEdgesState,
  useNodesState,
  MarkerType,
  Position,
  Handle,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

export default function DesignationsListPage() {
  const dispatch = useDispatch();
  const flow = useSelector(selectDesignationsFlow);
  const loading = useSelector(selectDesignationsFlowLoading);
  const error = useSelector(selectDesignationsFlowError);

  useEffect(() => {
    dispatch(fetchDesignationsFlow());
  }, [dispatch]);

  const { rfNodes, rfEdges } = useMemo(
    () => buildGraphFromTree(flow?.tree || []),
    [flow]
  );
  const [nodes, setNodes, onNodesChange] = useNodesState(rfNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(rfEdges);
  const rfInstanceRef = useRef(null);

  useEffect(() => setNodes(rfNodes), [rfNodes, setNodes]);
  useEffect(() => setEdges(rfEdges), [rfEdges, setEdges]);

  useEffect(() => {
    if (nodes.length > 0 && rfInstanceRef.current) {
      const t = setTimeout(
        () => rfInstanceRef.current?.fitView({ padding: 0.2 }),
        0
      );
      return () => clearTimeout(t);
    }
  }, [nodes.length, edges.length]);

  if (loading === "loading")
    return (
      <div className="p-4 md:p-6 text-neutral-600">Loading architecture…</div>
    );
  if (error)
    return <div className="p-4 md:p-6 text-rose-600">Error: {error}</div>;

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden bg-gradient-to-br from-white via-neutral-50 to-orange-50">
      {/* 🧠 Smart Left Sidebar */}
      <aside className="relative w-72 md:w-80 border-r border-orange-200 bg-white/80 backdrop-blur-sm flex flex-col">
        {/* Sticky Header */}
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-orange-100 px-3 py-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-orange-700 flex items-center gap-2">
            <Layers size={16} /> Departments
          </h2>
          <span className="text-[11px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
            {flow?.nodes?.length || 0}
          </span>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2 scrollbar-thin scrollbar-thumb-orange-300 hover:scrollbar-thumb-orange-400">
          {(flow?.nodes || []).map((n) => (
            <div
              key={n.id}
              className="group bg-white border border-orange-500/10 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-2.5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[13px] font-semibold text-neutral-800 truncate">
                    {n.title}
                  </div>
                  <div className="text-[11px] text-neutral-500 truncate">
                    {n.description?.length > 20
                      ? n.description.slice(0, 20) + "…"
                      : n.description || "—"}
                  </div>
                </div>
                <span
                  className={`px-1.5 py-0.5 text-[10px] font-semibold rounded-full ${
                    n.isActive
                      ? "bg-neutral-900 text-white"
                      : "bg-neutral-200 text-neutral-700"
                  }`}
                >
                  {n.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap gap-1">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 border border-neutral-200 text-neutral-700">
                  Lvl {n.level ?? "-"}
                </span>
                {(n.enabledRoutes || []).slice(0, 2).map((r) => (
                  <span
                    key={r}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 border border-neutral-200 text-neutral-700"
                  >
                    {r}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Sticky Footer */}
        <footer className="sticky bottom-0 z-10 bg-white/90 backdrop-blur-sm border-t border-orange-100 px-3 py-2 flex items-center justify-between text-[11px] text-neutral-600">
          <div className="flex items-center gap-1.5">
            <Clock size={12} className="text-orange-500" />
            <span>Updated just now</span>
          </div>
          <button className="text-orange-700 hover:text-orange-900 font-medium">
            Refresh
          </button>
        </footer>
      </aside>

      {/* 🌐 Main React Flow Area */}
      <main className="flex-1 p-4 md:p-6 overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-semibold bg-gradient-to-r from-orange-500 to-orange-700 bg-clip-text text-transparent flex items-center gap-2">
            <Activity size={18} /> Designation Architecture
          </h1>
          {flow?.metrics && (
            <div className="flex gap-2 text-xs text-neutral-600">
              <span className="px-2 py-1 bg-orange-50 border border-orange-200 rounded-full flex items-center gap-1">
                <Layers size={14} /> {flow.metrics.total} total
              </span>
              <span className="px-2 py-1 bg-neutral-50 border border-neutral-200 rounded-full flex items-center gap-1">
                <GitBranch size={14} /> depth {flow.metrics.maxDepth}
              </span>
            </div>
          )}
        </div>

        <div className="border border-orange-200 rounded-2xl overflow-hidden bg-white/80 backdrop-blur-sm">
          <div className="h-[calc(100vh-180px)] rounded-xl overflow-hidden rf-dark">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onInit={(instance) => (rfInstanceRef.current = instance)}
              connectionLineType="smoothstep"
              fitView
              fitViewOptions={{ padding: 0.2 }}
              proOptions={{ hideAttribution: true }}
              defaultEdgeOptions={{
                type: "smoothstep",
                markerEnd: { type: MarkerType.ArrowClosed },
                style: { stroke: "rgba(234,88,12,0.45)" },
              }}
              nodeTypes={{ designation: NodeCard }}
            >
              <MiniMap
                maskColor="#fafafa"
                nodeBorderRadius={10}
                nodeStrokeColor={(n) =>
                  n?.data?.isActive ? "#ea580c" : "#9ca3af"
                }
                nodeColor={(n) => (n?.data?.isActive ? "#fff7ed" : "#f3f4f6")}
              />
              <Controls position="bottom-right" />
              <Background gap={18} size={1} color="#f1f5f9" />
            </ReactFlow>
          </div>
        </div>
      </main>
    </div>
  );
}

/* === Node Card Component === */
function NodeCard({ data }) {
  const { label, description, isActive, level, enabledRoutes } = data || {};
  const ActiveIcon = isActive ? CheckCircle2 : Ban;
  return (
    <div className="relative w-[220px] group">
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2 !h-2 !bg-neutral-900 !border !border-slate-900"
      />
      <div
        className="relative z-20 rounded-xl border bg-white px-3 py-2 shadow-sm hover:shadow-md transition-shadow"
        style={{
          borderColor: isActive ? "rgba(234,88,12,0.55)" : "rgba(0,0,0,0.08)",
        }}
      >
        <div className="flex items-start justify-between gap-1.5">
          <div className="min-w-0">
            <div className="text-[12px] font-semibold text-neutral-900 truncate">
              {label}
            </div>
            {description && (
              <div className="text-[10px] text-neutral-500 truncate">
                {description}
              </div>
            )}
          </div>
          <span
            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-semibold ${
              isActive
                ? "bg-neutral-900 text-white"
                : "bg-neutral-200 text-neutral-700"
            }`}
          >
            <ActiveIcon size={10} /> {isActive ? "Active" : "Inactive"}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-1 flex-wrap">
          <span className="inline-flex items-center text-[9px] px-1.5 py-0.5 rounded-full bg-neutral-100 text-neutral-700 border border-neutral-200">
            <Layers size={10} /> L{level ?? "-"}
          </span>
          {(enabledRoutes || []).slice(0, 2).map((r) => (
            <span
              key={r}
              className="inline-flex items-center text-[9px] px-1.5 py-0.5 rounded-full bg-neutral-100 text-neutral-700 border border-neutral-200"
            >
              <GitBranch size={10} /> {r}
            </span>
          ))}
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2 !h-2 !bg-neutral-900 !border !border-slate-900"
      />
    </div>
  );
}

/* === Tree Graph Builder === */
function buildGraphFromTree(forest) {
  const nodes = [];
  const edges = [];
  const H_SPACING = 240;
  const V_SPACING = 120;
  const idMap = new Map();
  let idCounter = 0;
  const getId = (obj) => {
    if (obj?.id != null) return String(obj.id);
    if (idMap.has(obj)) return idMap.get(obj);
    const gen = `n_${idCounter++}`;
    idMap.set(obj, gen);
    return gen;
  };

  let leafIndex = 0;
  function assignPositions(node, depth = 0) {
    const hasChildren =
      Array.isArray(node.children) && node.children.length > 0;
    let x;
    if (!hasChildren) {
      x = leafIndex * H_SPACING;
      leafIndex += 1;
    } else {
      const childXs = node.children.map((ch) => assignPositions(ch, depth + 1));
      x = (Math.min(...childXs) + Math.max(...childXs)) / 2;
    }
    const y = depth * V_SPACING;
    nodes.push({
      id: getId(node),
      position: { x, y },
      data: {
        label: node.title,
        description: node.description,
        isActive: node.isActive,
        level: node.level,
        enabledRoutes: node.enabledRoutes,
      },
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
      type: "designation",
    });
    if (hasChildren) {
      for (const ch of node.children) {
        edges.push({
          id: `${getId(node)}-${getId(ch)}`,
          source: getId(node),
          target: getId(ch),
          markerEnd: { type: MarkerType.ArrowClosed, color: "rgb(234,88,12)" },
          style: { stroke: "rgba(234,88,12,0.45)" },
        });
      }
    }
    return x;
  }

  if (!forest.length) return { rfNodes: [], rfEdges: [] };
  forest.forEach((r) => assignPositions(r, 0));

  const minX = Math.min(...nodes.map((n) => n.position.x));
  const maxX = Math.max(...nodes.map((n) => n.position.x));
  const offset = (minX + maxX) / 2;
  for (const n of nodes) n.position.x -= offset;

  return { rfNodes: nodes, rfEdges: edges };
}
