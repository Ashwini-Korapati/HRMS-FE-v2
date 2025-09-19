import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { PlaceholderPanel } from './components';
import { fetchProjectsInsights, selectProjectsInsights, selectProjectsInsightsLoading, selectProjectsInsightsError } from '../../Redux/Public/projectsSlice';

function Metric({ label, value, suffix, loading }) {
  return (
    <div className="flex flex-col px-3 py-2 rounded-md bg-white/60 dark:bg-neutral-900/40 border border-orange-500/20 dark:border-orange-500/40 backdrop-blur min-w-[110px]">
      <span className="text-[10px] uppercase tracking-wide font-medium text-neutral-500 dark:text-neutral-400">{label}</span>
      <span className="mt-0.5 text-sm font-semibold text-neutral-700 dark:text-neutral-200">{loading ? '…' : (value ?? '—')}{!loading && suffix ? suffix : ''}</span>
    </div>
  )
}

const UserProject = () => {
  const dispatch = useDispatch();
  const insights = useSelector(selectProjectsInsights);
  const loading = useSelector(selectProjectsInsightsLoading) === 'loading';
  const error = useSelector(selectProjectsInsightsError);

  useEffect(() => { dispatch(fetchProjectsInsights()); }, [dispatch]);

  const total = insights?.total || insights?.summary?.total || insights?.pagination?.total;
  const active = insights?.active || insights?.summary?.active;
  const completed = insights?.completed || insights?.summary?.completed;
  const planning = insights?.planning || insights?.summary?.planning;
  const utilization = insights?.utilizationRate || insights?.utilization || insights?.summary?.utilization;

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">Project Insights</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <Metric label="Total" value={total} loading={loading} />
          <Metric label="Planning" value={planning} loading={loading} />
            <Metric label="Active" value={active} loading={loading} />
          <Metric label="Completed" value={completed} loading={loading} />
          <Metric label="Utilization" value={utilization} suffix={utilization!=null?'%':''} loading={loading} />
        </div>
        {error && <div className="mt-2 text-xs text-rose-500">{error}</div>}
        {insights && !(total||active||planning||completed||utilization) && (
          <div className="mt-2 text-[10px] font-mono p-2 rounded bg-neutral-100/60 dark:bg-neutral-900/60 border border-neutral-300/40 dark:border-neutral-700/40 max-h-48 overflow-auto">
            <pre className="whitespace-pre-wrap break-all">{JSON.stringify(insights, null, 2)}</pre>
          </div>
        )}
      </div>
      <PlaceholderPanel title="Utilization">Planned: allocation & workload insights.</PlaceholderPanel>
    </div>
  );
}

export default UserProject;
