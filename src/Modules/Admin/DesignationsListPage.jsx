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
    <div className="flex h-[calc(100vh-80px)] overflow-hidden bg-white dark:bg-black border border-orange-500/20 dark:border-orange-500/40 rounded-2xl shadow-sm">
      {/* 🧠 Smart Left Sidebar */}
      <aside className="designation-sidebar relative w-72 md:w-80 border-r border-orange-500/20 dark:border-orange-500/40 backdrop-blur-sm flex flex-col">
        {/* Sticky Header */}
        <header className="designation-sidebar sticky top-0 z-10 backdrop-blur-sm border-b border-orange-500/20 dark:border-orange-500/40 px-3 py-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-orange-600 dark:text-orange-400 flex items-center gap-2">
            <Layers size={16} /> Departments
          </h2>
          <span className="text-[11px] bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded-full font-medium">
            {flow?.nodes?.length || 0}
          </span>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2 scrollbar-thin scrollbar-thumb-orange-400 hover:scrollbar-thumb-orange-500">
          {(flow?.nodes || []).map((n) => (
            <div
              key={n.id}
              className="designation-card group backdrop-blur-sm border border-orange-500/30 dark:border-orange-500/50 rounded-xl shadow-sm hover:shadow-md hover:shadow-orange-500/20 transition-all duration-200 p-2.5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="designation-title text-[13px] font-semibold truncate">
                    {n.title}
                  </div>
                  <div className="designation-description text-[11px] truncate">
                    {n.description?.length > 20
                      ? n.description.slice(0, 20) + "…"
                      : n.description || "—"}
                  </div>
                </div>
                <span
                  className={`px-1.5 py-0.5 text-[10px] font-semibold rounded-full ${
                    n.isActive
                      ? "bg-orange-500 text-white"
                      : "bg-neutral-300 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300"
                  }`}
                >
                  {n.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap gap-1">
                <span className="designation-badge-level text-[10px] px-1.5 py-0.5 rounded border">
                  Lvl {n.level ?? "-"}
                </span>
                {(n.enabledRoutes || []).slice(0, 2).map((r) => (
                  <span
                    key={r}
                    className="designation-badge-route text-[10px] px-1.5 py-0.5 rounded border inline-flex items-center gap-0.5"
                  >
                    {r}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Sticky Footer */}
        <footer className="designation-sidebar sticky bottom-0 z-10 backdrop-blur-sm border-t border-orange-500/20 dark:border-orange-500/40 px-3 py-2 flex items-center justify-between text-[11px] text-neutral-600 dark:text-neutral-400">
          <div className="flex items-center gap-1.5">
            <Clock size={12} className="text-orange-500 dark:text-orange-400" />
            <span>Updated just now</span>
          </div>
          <button className="text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-300 font-medium">
            Refresh
          </button>
        </footer>
      </aside>

      {/* 🌐 Main React Flow Area */}
      <main className="flex-1 p-4 md:p-6 overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-semibold text-orange-600 dark:text-orange-400 flex items-center gap-2">
            <Activity size={18} /> Designation Architecture
          </h1>
          {flow?.metrics && (
            <div className="flex gap-2 text-xs text-neutral-700 dark:text-neutral-300">
              <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 border border-orange-300 dark:border-orange-500/50 rounded-full flex items-center gap-1">
                <Layers size={14} /> {flow.metrics.total} total
              </span>
              <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 border border-orange-300 dark:border-orange-500/50 rounded-full flex items-center gap-1">
                <GitBranch size={14} /> depth {flow.metrics.maxDepth}
              </span>
            </div>
          )}
        </div>

        <div className="border border-orange-500/30 dark:border-orange-500/50 rounded-2xl overflow-hidden bg-white/80 dark:bg-black/80 backdrop-blur-sm">
          <div className="designation-canvas h-[calc(100vh-180px)] rounded-xl overflow-hidden">
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
                markerEnd: { type: MarkerType.ArrowClosed, color: "#f97316" },
                style: { stroke: "rgba(249,115,22,0.6)", strokeWidth: 2 },
              }}
              nodeTypes={{ designation: NodeCard }}
            >
              <MiniMap
                nodeBorderRadius={10}
                nodeStrokeColor={(n) => n?.data?.isActive ? "#f97316" : "#9ca3af"}
                nodeColor={(n) => n?.data?.isActive ? "#fed7aa" : "#e5e7eb"}
              />
              <Controls position="bottom-right" />
              <Background gap={18} size={1} />
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
        className="!w-2 !h-2 !bg-orange-500 dark:!bg-orange-400 !border-2 !border-orange-600 dark:!border-orange-500"
      />
      <div
        className="designation-node relative z-20 rounded-xl border backdrop-blur-sm px-3 py-2 shadow-sm hover:shadow-md hover:shadow-orange-500/20 transition-all"
        style={{
          borderColor: isActive ? "rgba(249,115,22,0.6)" : "rgba(249,115,22,0.3)",
        }}
      >
        <div className="flex items-start justify-between gap-1.5">
          <div className="min-w-0">
            <div className="designation-title text-[12px] font-semibold truncate">
              {label}
            </div>
            {description && (
              <div className="designation-description text-[10px] truncate">
                {description}
              </div>
            )}
          </div>
          <span
            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-semibold ${
              isActive
                ? "bg-orange-500 text-white"
                : "bg-neutral-300 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300"
            }`}
          >
            <ActiveIcon size={10} /> {isActive ? "Active" : "Inactive"}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-1 flex-wrap">
          <span className="designation-badge-level inline-flex items-center text-[9px] px-1.5 py-0.5 rounded-full border">
            <Layers size={10} /> L{level ?? "-"}
          </span>
          {(enabledRoutes || []).slice(0, 2).map((r) => (
            <span
              key={r}
              className="designation-badge-route inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full border"
            >
              <GitBranch size={9} /> {r}
            </span>
          ))}
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2 !h-2 !bg-orange-500 dark:!bg-orange-400 !border-2 !border-orange-600 dark:!border-orange-500"
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
