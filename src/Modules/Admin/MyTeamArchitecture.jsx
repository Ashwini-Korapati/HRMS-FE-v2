import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
 import { toAssetUrl } from "../../config/config";
import {
  fetchDesignationsFlow,
  selectDesignationsFlow,
  selectDesignationsFlowLoading,
  selectDesignationsFlowError,
} from "../../Redux/Public/designationSlice";
import { httpGetService } from "../../config/httphandler";
import SmartTransition from "../../components/Prop/SmartTransition";
import SmartToster from "../../components/Prop/SmartToster";
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
import {
  Users,
  Search,
  Clock,
  Mail,
  Briefcase,
  ListChecks,
  CheckCircle2,
  Timer,
  UserCircle2,
    ListTodo,
    Loader2,
    Eye,
    XCircle,
} from "lucide-react";

export default function MyTeamArchitecture() {
  const { companyUuid } = useParams();
  const dispatch = useDispatch();
  const flow = useSelector(selectDesignationsFlow);
  const flowLoading = useSelector(selectDesignationsFlowLoading);
  const flowError = useSelector(selectDesignationsFlowError);

  const [query, setQuery] = React.useState("");
  const [selected, setSelected] = React.useState(null); // designation id (auto-selected)
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [toastMsg, setToastMsg] = React.useState("");

  React.useEffect(() => {
    if (!flow && flowLoading !== "loading") dispatch(fetchDesignationsFlow());
  }, [dispatch, flow, flowLoading]);

  // Auto-pick a root designation from architecture flow tree once available
  React.useEffect(() => {
    if (!selected && flow?.tree?.length) {
      // Pick the first root designation id
      const root = flow.tree[0];
      if (root?.id) setSelected(root.id);
    }
  }, [flow, selected]);

  React.useEffect(() => {
    let active = true;
    async function load() {
      if (!selected) {
        setData(null);
        setError(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      const res = await httpGetService(
        `${companyUuid}/designations/${selected}/team/architecture-flow`
      );
      if (!active) return;
      if (res.status >= 200 && res.status < 300) {
        const payload = res.data?.data || res.data;
        setData(payload);
        setError(null);
        // Prepare toast about rendering with metrics
        const members = payload?.metrics?.totalMembers ?? 0;
        const ts = payload?.timestamp ? new Date(payload.timestamp) : new Date();
        const hh = ts.getHours().toString().padStart(2, '0');
        const mm = ts.getMinutes().toString().padStart(2, '0');
        setToastMsg(`Rendered ${members} members at ${hh}:${mm}`);
      } else {
        setError(res.data?.message || "Failed to load architecture flow");
        setData(null);
      }
      setLoading(false);
    }
    load();
    return () => {
      active = false;
    };
  }, [companyUuid, selected]);

  const { rfNodes, rfEdges, usersList } = React.useMemo(() => buildUserGraph(data), [data]);
  const [nodes, setNodes, onNodesChange] = useNodesState(rfNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(rfEdges);

  React.useEffect(() => setNodes(rfNodes), [rfNodes, setNodes]);
  React.useEffect(() => setEdges(rfEdges), [rfEdges, setEdges]);

  const contentKey = `${selected || "none"}-${nodes.length}-${edges.length}`;

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden bg-gradient-to-br from-white via-neutral-50 to-orange-50">
      <SmartToster message={toastMsg} duration={2500} onClose={() => setToastMsg("")} />
      {/* Left: Team members list (no designations) */}
      <aside className="relative w-72 md:w-80 border-r border-orange-200 bg-white/80 backdrop-blur-sm flex flex-col">
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-orange-100 px-3 py-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-orange-700 flex items-center gap-2">
              <Users size={16} /> Team Members
            </h2>
            <span className="text-[11px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
              {usersList.length}
            </span>
          </div>
          <div className="mt-2 relative">
            <input
              className="w-full rounded-lg border border-orange-200 bg-white px-8 py-1.5 text-sm outline-none focus:ring-2 focus:ring-orange-300"
              placeholder="Search name or email…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-neutral-400" />
          </div>
        </header>
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5 scrollbar-thin scrollbar-thumb-orange-300 hover:scrollbar-thumb-orange-400">
          {flowLoading === "loading" && (
            <div className="text-xs text-neutral-500">Initializing…</div>
          )}
          {flowError && (
            <div className="text-xs text-rose-600">{flowError}</div>
          )}
          {usersList
            .filter((u) => {
              const q = query.trim().toLowerCase();
              if (!q) return true;
              return (
                u.name?.toLowerCase().includes(q) ||
                u.email?.toLowerCase().includes(q)
              );
            })
            .map((u) => (
              <div key={u.id} className="group bg-white border border-orange-500/10 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-2.5">
                <div className="flex items-center gap-3">
                  <Avatar src={toAssetUrl(u.avatar)} name={u.name} />
                  <div className="min-w-0">
                    <div className="text-[13px] font-semibold text-neutral-800 truncate">{u.name}</div>
                    <div className="text-[11px] text-neutral-500 truncate flex items-center gap-1">
                      <Mail size={12} className="text-neutral-400" /> {u.email}
                    </div>
                  </div>
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 border border-neutral-200 text-neutral-700">L{u.level ?? "-"}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-50 border border-orange-200 text-orange-700 inline-flex items-center gap-1">
                    <Briefcase size={12} /> {u.projectsCount ?? 0}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-50 border border-neutral-200 text-neutral-600 inline-flex items-center gap-1">
                    <ListChecks size={12} /> {u.tasks?.totalAssigned ?? 0}
                  </span>
                </div>
              </div>
            ))}
        </div>
        <footer className="sticky bottom-0 z-10 bg-white/90 backdrop-blur-sm border-t border-orange-100 px-3 py-2 flex items-center justify-between text-[11px] text-neutral-600">
          <div className="flex items-center gap-1.5">
            <Clock size={12} className="text-orange-500" />
            <span>Updated just now</span>
          </div>
          <button className="text-orange-700 hover:text-orange-900 font-medium" onClick={() => dispatch(fetchDesignationsFlow())}>
            Refresh
          </button>
        </footer>
      </aside>

      {/* Right: User Architecture flow (no designation nodes) */}
      <main className="flex-1 p-4 md:p-6 overflow-hidden">
        <SmartTransition transitionKey={contentKey} duration={250}>
          {!selected ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-md mx-auto">
                <div className="mx-auto w-12 h-12 rounded-2xl bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-700 mb-3">
                  <Users size={20} />
                </div>
                <h2 className="text-lg font-semibold text-neutral-900">Loading user architecture…</h2>
                <p className="text-sm text-neutral-500 mt-1">We’ll fetch members and render their structure once data is ready.</p>
              </div>
            </div>
          ) : (
            <div className="border border-orange-200 rounded-2xl overflow-hidden bg-white/80 backdrop-blur-sm">
              <div className="px-4 py-3 border-b border-orange-100 bg-white/60 flex items-center justify-between">
                <div className="flex items-center gap-2 text-neutral-900">
                  <Users size={16} className="text-orange-600" />
                  <span className="text-sm font-semibold">User Architecture</span>
                </div>
                {data?.metrics && (
                  <div className="flex gap-2 text-xs text-neutral-600">
                    <span className="px-2 py-1 bg-neutral-50 border border-neutral-200 rounded-full flex items-center gap-1">
                      <Users size={14} /> {data.metrics.totalMembers} members
                    </span>
                  </div>
                )}
              </div>
              <div className="h-[calc(100vh-200px)] rounded-xl overflow-hidden rf-dark">
                {loading ? (
                  <div className="h-full w-full grid place-items-center text-neutral-500">Loading flow…</div>
                ) : error ? (
                  <div className="h-full w-full grid place-items-center text-rose-600 text-sm">{error}</div>
                ) : (
                  <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    connectionLineType="smoothstep"
                    fitView
                    fitViewOptions={{ padding: 0.2 }}
                    proOptions={{ hideAttribution: true }}
                    defaultEdgeOptions={{
                      type: "smoothstep",
                      markerEnd: { type: MarkerType.ArrowClosed, color: "rgb(234,88,12)" },
                      style: { stroke: "rgba(234,88,12,0.45)" },
                    }}
                    nodeTypes={{ user: UserNode }}
                  >
                    <MiniMap
                      maskColor="#fafafa"
                      nodeBorderRadius={10}
                      nodeStrokeColor={(n) => "#9ca3af"}
                      nodeColor={(n) => "#f3f4f6"}
                    />
                    <Controls position="bottom-right" />
                    <Background gap={18} size={1} color="#f1f5f9" />
                  </ReactFlow>
                )}
              </div>
            </div>
          )}
        </SmartTransition>
      </main>
    </div>
  );
}

function UserNode({ data }) {
  const { name, email, designationTitle, level, projectsCount, avatar, tasks, projects } = data || {};
  return (
    <div className="relative w-[220px] group">
      <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-neutral-900 !border !border-slate-900" />
      <div className="relative z-20 rounded-xl border bg-white px-3 py-2 shadow-sm hover:shadow-md transition-shadow" style={{ borderColor: "rgba(0,0,0,0.12)" }}>
        <div className="flex items-start gap-2">
          <Avatar src={toAssetUrl(avatar)} name={name} />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="text-[12px] font-semibold text-neutral-900 truncate">{name}</div>
                <div className="text-[10px] text-neutral-500 truncate flex items-center gap-1"><Mail size={12} className="text-neutral-400" /> {email}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[10px] px-1.5 py-0.5 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-700 inline-block">{designationTitle || "—"}</div>
                <div className="text-[9px] text-neutral-400 mt-1">L{level ?? "-"} • <Briefcase size={10} className="inline mr-0.5" /> {projectsCount ?? 0}</div>
              </div>
            </div>
            <div className="mt-1 flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-50 border border-neutral-200 text-neutral-600 inline-flex items-center gap-1">
                <ListChecks size={12} /> {tasks?.totalAssigned ?? 0}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-50 border border-green-200 text-green-700 inline-flex items-center gap-1">
                <CheckCircle2 size={12} /> {tasks?.byStatus?.COMPLETED ?? 0}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-50 border border-neutral-200 text-neutral-600 inline-flex items-center gap-1">
                <Timer size={12} /> {tasks?.totalEstimatedHours ?? 0}h / {tasks?.totalActualHours ?? 0}h
              </span>
            </div>
            {/* Projects (top 2) */}
            {Array.isArray(projects) && projects.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {projects.slice(0, 2).map((p) => (
                  <span key={p.id} className="text-[10px] px-1.5 py-0.5 rounded bg-orange-50 border border-orange-200 text-orange-700 inline-flex items-center gap-1">
                    <Briefcase size={12} /> {p.name}
                  </span>
                ))}
                {projects.length > 2 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 border border-neutral-200 text-neutral-600">+{projects.length - 2} more</span>
                )}
              </div>
            )}
            {/* Tasks by status */}
            <div className="mt-1 flex items-center gap-1.5 flex-wrap text-[10px]">
              <Chip icon={<ListTodo size={11} />} label={tasks?.byStatus?.TODO ?? 0} />
              <Chip icon={<Loader2 size={11} />} label={tasks?.byStatus?.IN_PROGRESS ?? 0} />
              <Chip icon={<Eye size={11} />} label={tasks?.byStatus?.IN_REVIEW ?? 0} />
              <Chip icon={<CheckCircle2 size={11} />} label={tasks?.byStatus?.COMPLETED ?? 0} />
              <Chip icon={<XCircle size={11} />} label={tasks?.byStatus?.CANCELLED ?? 0} />
            </div>
          </div>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-neutral-900 !border !border-slate-900" />
    </div>
  );
}
// Avatar helper
  function Avatar({ src, name }) {
  const initials = (name || "?")
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  if (src) {
    return (
      <img src={src} alt={name} className="h-8 w-8 rounded-full object-cover border border-neutral-200" />
    );
  }
  return (
    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-500 to-neutral-900 text-white flex items-center justify-center text-[11px] font-semibold shadow-sm">
      {initials || <UserCircle2 size={14} />}
    </div>
  );
}

// Build a user-only layout grouped by designation level
function buildUserGraph(payload) {
  if (!payload?.nodes) return { rfNodes: [], rfEdges: [], usersList: [] };
  const nodeById = new Map(payload.nodes.map((n) => [n.id, n]));
  const users = payload.nodes.filter((n) => n.type === "user");
  const usersList = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    avatar: u.avatar,
    level: u.designation?.level,
    projectsCount: Array.isArray(u.projects) ? u.projects.length : 0,
    projects: Array.isArray(u.projects) ? u.projects : [],
    tasks: u.tasks || {
      totalAssigned: 0,
      byStatus: {},
      totalEstimatedHours: 0,
      totalActualHours: 0,
    },
  }));

  const rfNodes = [];
  const rfEdges = [];
  const layout = payload.suggestedLayout || {};
  const orientation = (layout.orientation || 'TB').toUpperCase(); // 'TB' or 'LR'
  // Compute spacing using card size + provided gaps to avoid overlap while honoring suggestedLayout
  const NODE_WIDTH = 220;
  const NODE_HEIGHT = 110;
  const nodeGap = typeof layout.nodeSpacing === 'number' ? layout.nodeSpacing : 80; // gap between siblings in same level
  const levelGap = typeof layout.levelSpacing === 'number' ? layout.levelSpacing : 140; // gap between levels
  // Main/cross axis step sizes depend on orientation
  const STEP_X = orientation === 'LR' ? NODE_WIDTH + levelGap : NODE_WIDTH + nodeGap;
  const STEP_Y = orientation === 'LR' ? NODE_HEIGHT + nodeGap : NODE_HEIGHT + levelGap;

  // compute min designation level to anchor rows
  const designLevels = payload.nodes
    .filter((n) => n.type === 'designation' && typeof n.level === 'number')
    .map((n) => n.level);
  const minLevel = designLevels.length ? Math.min(...designLevels) : 0;

  const placed = new Set();
  let leafIndex = 0;

  function placeUser(u) {
    if (!u || placed.has(u.id)) return;
    const row = Math.max(0, (u.designation?.level ?? minLevel) - minLevel);
    const col = leafIndex;
  const tbX = col * STEP_X;
  const tbY = row * STEP_Y;
    // small offset to reduce visual overlap when cards are dense
    const offset = 0;
    const x = orientation === 'LR' ? row * STEP_X + offset : tbX + offset;
    const y = orientation === 'LR' ? col * STEP_Y : tbY;
    rfNodes.push({
      id: u.id,
      position: { x, y },
      data: {
        name: u.name,
        email: u.email,
        avatar: u.avatar,
        designationTitle: u.designation?.title,
        level: u.designation?.level,
        projectsCount: Array.isArray(u.projects) ? u.projects.length : 0,
        projects: Array.isArray(u.projects) ? u.projects : [],
        tasks: u.tasks,
      },
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
      type: "user",
    });
    placed.add(u.id);
    leafIndex += 1;
  }

  function walkTree(des) {
    if (!des) return;
    // place members of this designation first (keeps tree order)
    if (Array.isArray(des.members)) {
      des.members.forEach((m) => placeUser(m));
    }
    // then process children designations
    if (Array.isArray(des.children)) {
      des.children.forEach((ch) => walkTree(ch));
    }
  }

  if (payload.tree && payload.tree.type === 'designation') {
    walkTree(payload.tree);
    // fallback for any users not present in tree.members due to API variance
    users.forEach((u) => placeUser(u));
  } else {
    // Fallback: group by level in ascending order
    const groups = new Map();
    users.forEach((u) => {
      const lvl = u.designation?.level ?? minLevel;
      if (!groups.has(lvl)) groups.set(lvl, []);
      groups.get(lvl).push(u);
    });
    const levels = Array.from(groups.keys()).sort((a, b) => a - b);
    levels.forEach((lvl) => {
      (groups.get(lvl) || []).forEach((u) => placeUser({ ...u, designation: { ...u.designation, level: lvl } }));
    });
  }

  // Build designation parent mapping from payload edges (designation -> designation)
  const designationParent = new Map();
  if (Array.isArray(payload.edges)) {
    for (const e of payload.edges) {
      const src = nodeById.get(e.source);
      const tgt = nodeById.get(e.target);
      if (src?.type === "designation" && tgt?.type === "designation") {
        designationParent.set(tgt.id, src.id);
      }
    }
  }

  // Map users by their parent designation (user.parentNode)
  const usersByDesignation = new Map();
  for (const u of users) {
    const d = u.parentNode; // e.g., 'd:...'
    if (!usersByDesignation.has(d)) usersByDesignation.set(d, []);
    usersByDesignation.get(d).push(u);
  }

  // For each user, connect from all users at the immediate parent designation to this user
  const existingNodeIds = new Set(rfNodes.map((n) => n.id));
  for (const u of users) {
    const childUserId = u.id;
    const parentDes = designationParent.get(u.parentNode);
    if (!parentDes) continue;
    const managers = usersByDesignation.get(parentDes) || [];
    for (const m of managers) {
      const managerUserId = m.id;
      if (!existingNodeIds.has(managerUserId) || !existingNodeIds.has(childUserId)) continue;
      rfEdges.push({
        id: `${managerUserId}->${childUserId}`,
        source: managerUserId,
        target: childUserId,
        markerEnd: { type: MarkerType.ArrowClosed, color: "rgb(234,88,12)" },
        style: { stroke: "rgba(234,88,12,0.45)", strokeDasharray: "4 3" },
        type: "smoothstep",
      });
    }
  }

  // Center according to orientation using node sizes
  if (rfNodes.length) {
    if (orientation === 'LR') {
      const minY = Math.min(...rfNodes.map((n) => n.position.y));
      const maxY = Math.max(...rfNodes.map((n) => n.position.y + NODE_HEIGHT));
      const centerY = (minY + maxY) / 2;
      for (const n of rfNodes) n.position.y -= centerY;
    } else {
      const minX = Math.min(...rfNodes.map((n) => n.position.x));
      const maxX = Math.max(...rfNodes.map((n) => n.position.x + NODE_WIDTH));
      const centerX = (minX + maxX) / 2;
      for (const n of rfNodes) n.position.x -= centerX;
    }
  }

  return { rfNodes, rfEdges, usersList };
}

// Tiny chip component
function Chip({ icon, label }) {
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-neutral-50 border border-neutral-200 text-neutral-600">
      {icon} {label}
    </span>
  );
}
