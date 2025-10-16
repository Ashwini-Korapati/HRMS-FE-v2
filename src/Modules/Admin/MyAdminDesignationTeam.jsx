import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams, Link } from "react-router-dom";
import { httpGetService } from "../../config/httphandler";
import {
  fetchDesignationsFlow,
  selectDesignationsFlow,
  selectDesignationsFlowLoading,
} from "../../Redux/Public/designationSlice";
import { Users, Layers, ChevronRight, Search, ArrowLeft } from "lucide-react";
import SmartTransition from "../../components/Prop/SmartTransition";

function Avatar({ name }) {
  const initials = (name || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-500 to-neutral-900 text-white flex items-center justify-center text-sm font-semibold shadow-sm" aria-hidden>
      {initials}
    </div>
  );
}

export default function MyAdminDesignationTeam() {
  const { companyUuid, designationId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const flow = useSelector(selectDesignationsFlow);
  const flowLoading = useSelector(selectDesignationsFlowLoading);

  const [query, setQuery] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [team, setTeam] = React.useState(null);

  React.useEffect(() => {
    if (!flow && flowLoading !== "loading") {
      dispatch(fetchDesignationsFlow());
    }
  }, [dispatch, flow, flowLoading]);

  React.useEffect(() => {
    let active = true;
    async function loadTeam() {
      if (!designationId) {
        setTeam(null);
        setError(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      const res = await httpGetService(
        `${companyUuid}/designations/${designationId}/team`
      );
      if (!active) return;
      if (res.status >= 200 && res.status < 300) {
        setTeam(res.data?.data || res.data);
        setError(null);
      } else {
        setError(res.data?.message || "Failed to load team");
        setTeam(null);
      }
      setLoading(false);
    }
    loadTeam();
    return () => {
      active = false;
    };
  }, [companyUuid, designationId]);

  const allDesignations = React.useMemo(() => {
    // Flatten from flow tree if available
    const map = new Map();
    function walk(node) {
      if (!node) return;
      map.set(node.id, node);
      (node.children || []).forEach(walk);
    }
    (flow?.tree || []).forEach(walk);
    return Array.from(map.values());
  }, [flow]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allDesignations;
    return allDesignations.filter(
      (d) => d.title?.toLowerCase().includes(q) || String(d.level ?? "").includes(q)
    );
  }, [allDesignations, query]);

  const contentKey = `${designationId || "root"}-${team?.designationId || "none"}`;

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden bg-gradient-to-br from-white via-neutral-50 to-orange-50">
      {/* Left: Designation picker */}
      <aside className="relative w-72 md:w-80 border-r border-orange-200 bg-white/80 backdrop-blur-sm flex flex-col">
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-orange-100 px-3 py-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-orange-700 flex items-center gap-2">
              <Layers size={16} /> Designations
            </h2>
            <span className="text-[11px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
              {allDesignations.length}
            </span>
          </div>
          <div className="mt-2 relative">
            <input
              className="w-full rounded-lg border border-orange-200 bg-white px-8 py-1.5 text-sm outline-none focus:ring-2 focus:ring-orange-300"
              placeholder="Search title or level…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-neutral-400" />
          </div>
        </header>
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5 scrollbar-thin scrollbar-thumb-orange-300 hover:scrollbar-thumb-orange-400">
          {flowLoading === "loading" && (
            <div className="text-xs text-neutral-500">Loading designations…</div>
          )}
          {filtered.map((d) => (
            <button
              key={d.id}
              onClick={() => navigate(`/${companyUuid}/projects/teams/${d.id}`)}
              className={`w-full text-left group bg-white border rounded-xl shadow-sm transition-all duration-200 p-2.5 hover:shadow-md ${
                String(d.id) === String(designationId)
                  ? "border-neutral-900"
                  : "border-orange-500/10"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold text-neutral-800 truncate">{d.title}</div>
                  {d.description && (
                    <div className="text-[11px] text-neutral-500 truncate">{d.description}</div>
                  )}
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-700">L{d.level ?? "-"}</span>
              </div>
            </button>
          ))}
        </div>
        <footer className="sticky bottom-0 z-10 bg-white/90 backdrop-blur-sm border-t border-orange-100 px-3 py-2 flex items-center justify-between text-[11px] text-neutral-600">
          <Link to={`/${companyUuid}/designations/list`} className="text-orange-700 hover:text-orange-900 font-medium">
            Open Architecture
          </Link>
          <button
            className="text-neutral-600 hover:text-neutral-900"
            onClick={() => dispatch(fetchDesignationsFlow())}
          >
            Refresh
          </button>
        </footer>
      </aside>

      {/* Right: Team view */}
      <main className="flex-1 p-4 md:p-6 overflow-hidden">
        <SmartTransition transitionKey={contentKey} duration={250}>
          {!designationId ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-md mx-auto">
                <div className="mx-auto w-12 h-12 rounded-2xl bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-700 mb-3">
                  <Users size={20} />
                </div>
                <h2 className="text-lg font-semibold text-neutral-900">Pick a designation</h2>
                <p className="text-sm text-neutral-500 mt-1">Search or select a designation on the left to view its team, children and member details.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <button
                  className="inline-flex items-center gap-1 text-sm text-neutral-600 hover:text-neutral-900"
                  onClick={() => navigate(`/${companyUuid}/projects/teams`)}
                >
                  <ArrowLeft size={16} /> Back
                </button>
                <div className="flex-1" />
                <span className="text-xs bg-orange-50 border border-orange-200 text-orange-700 px-2 py-1 rounded-full inline-flex items-center gap-1">
                  <Users size={14} /> {team?.totalMembers ?? 0} members
                </span>
              </div>

              <div className="border border-orange-200 rounded-2xl overflow-hidden bg-white/80 backdrop-blur-sm">
                <div className="px-4 py-3 border-b border-orange-100 bg-white/60">
                  {loading ? (
                    <div className="h-6 w-48 bg-neutral-100 rounded animate-pulse" />
                  ) : error ? (
                    <div className="text-sm text-rose-600">{error}</div>
                  ) : (
                    <div className="flex items-center gap-2 text-neutral-900">
                      <Layers size={16} className="text-orange-600" />
                      <span className="text-sm font-semibold">
                        {team?.designation?.title} <span className="text-neutral-400 font-normal">(L{team?.designation?.level ?? "-"})</span>
                      </span>
                      <ChevronRight size={16} className="text-neutral-300" />
                      <span className="text-xs text-neutral-500">ID: {team?.designationId}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-4">
                  {/* Members */}
                  <section className="lg:col-span-8 space-y-2">
                    <h3 className="text-sm font-semibold text-neutral-700">Members</h3>
                    {loading ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <div key={i} className="h-24 rounded-xl border border-neutral-100 bg-neutral-50 animate-pulse" />
                        ))}
                      </div>
                    ) : (team?.members?.length ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {team.members.map((m) => {
                          const name = `${m.firstName || ""} ${m.lastName || ""}`.trim() || m.email;
                          const projCount = Array.isArray(m.projectStatuses?.projects) ? m.projectStatuses.projects.length : 0;
                          return (
                            <div key={m.userId} className="group rounded-xl border border-neutral-200 bg-white p-3 hover:shadow-sm transition">
                              <div className="flex items-start gap-3">
                                <Avatar name={name} />
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between">
                                    <div className="text-[13px] font-semibold text-neutral-900 truncate">{name}</div>
                                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-700">{m.designation?.title || "—"}</span>
                                  </div>
                                  <div className="text-[11px] text-neutral-500 truncate">{m.email}</div>
                                  <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                                    {m.phone && (
                                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-50 border border-neutral-200 text-neutral-600">{m.phone}</span>
                                    )}
                                    {typeof m.designation?.level !== "undefined" && (
                                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-50 border border-neutral-200 text-neutral-600">L{m.designation.level}</span>
                                    )}
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-50 border border-orange-200 text-orange-700">{projCount} projects</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-sm text-neutral-500">No members for this designation.</div>
                    ))}
                  </section>

                  {/* Child designations */}
                  <aside className="lg:col-span-4 space-y-2">
                    <h3 className="text-sm font-semibold text-neutral-700">Child designations</h3>
                    {loading ? (
                      <div className="space-y-2">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <div key={i} className="h-10 rounded-lg border border-neutral-100 bg-neutral-50 animate-pulse" />
                        ))}
                      </div>
                    ) : (team?.childDesignations?.length ? (
                      <div className="space-y-2">
                        {team.childDesignations.map((cd) => (
                          <button
                            key={cd.id}
                            onClick={() => navigate(`/${companyUuid}/projects/teams/${cd.id}`)}
                            className="w-full text-left rounded-lg border border-neutral-200 bg-white px-3 py-2 hover:border-neutral-900 hover:shadow-sm transition"
                          >
                            <div className="flex items-center justify-between">
                              <div className="text-[13px] font-medium text-neutral-800 truncate">{cd.title}</div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 border border-neutral-200 text-neutral-700">L{cd.level ?? "-"}</span>
                                <ChevronRight size={14} className="text-neutral-400" />
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-neutral-500">No child designations.</div>
                    ))}
                  </aside>
                </div>
              </div>
            </div>
          )}
        </SmartTransition>
      </main>
    </div>
  );
}
