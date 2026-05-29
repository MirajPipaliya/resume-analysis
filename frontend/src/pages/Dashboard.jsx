import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { FileText, FileSearch, TrendingUp, Zap } from 'lucide-react';
import Skeleton from '../components/ui/Skeleton';
import Badge from '../components/ui/Badge';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { data: candidates, isLoading } = useQuery({
    queryKey: ['analysisHistory'],
    queryFn: async () => {
      const res = await api.get('/analysis/history/');
      return res.data.data || [];
    },
  });

  const total = candidates?.length || 0;
  const avgScore = total > 0 
    ? Math.round(candidates.reduce((sum, c) => sum + c.score, 0) / total)
    : 0;
  const highScores = candidates?.filter(c => c.score >= 80).length || 0;
  const needsWork = candidates?.filter(c => c.score < 50).length || 0;

  const kpis = [
    { label: 'Total Analyzed',   value: total,     icon: FileText,   color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-100' },
    { label: 'Average Score',    value: `${avgScore}%`, icon: TrendingUp, color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100' },
    { label: 'High Scores (80+)',value: highScores,icon: Zap,        color: 'text-amber-600',  bg: 'bg-amber-50',  border: 'border-amber-100' },
    { label: 'Needs Optimization',value: needsWork,icon: FileSearch, color: 'text-rose-600',   bg: 'bg-rose-50',   border: 'border-rose-100' },
  ];

  return (
    <div className="space-y-7 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Overview of your resume analysis results</p>
        </div>
        <Link to="/upload" className="btn-primary">
          Analyze New Resume
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k, i) => (
          <div key={i} className={`glass-panel p-5 card-hover border ${k.border}`}>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${k.bg}`}>
                <k.icon className={`w-5 h-5 ${k.color}`} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{k.label}</p>
                {isLoading
                  ? <Skeleton className="h-7 w-12 mt-1" />
                  : <p className="text-2xl font-bold text-slate-900 mt-0.5">{k.value}</p>
                }
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="glass-panel p-6">
        <h2 className="text-base font-display font-bold text-slate-800 mb-1">Recent Analyses</h2>
        <p className="text-xs text-slate-400 mb-5">Your latest processed resumes</p>

        <div className="space-y-3">
          {isLoading ? (
            [1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)
          ) : !candidates?.length ? (
            <div className="flex flex-col items-center justify-center h-48 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
              <FileSearch className="w-10 h-10 text-slate-300 mb-3" />
              <p className="text-slate-500 font-medium">No resumes analyzed yet.</p>
              <p className="text-sm text-slate-400 mb-4 mt-1">Upload a resume to see AI insights and ATS optimization tips.</p>
              <Link to="/upload" className="btn-primary text-sm px-4 py-2">
                Upload Resume
              </Link>
            </div>
          ) : (
            candidates.slice(0, 10).map(c => (
              <Link
                key={c.id}
                to={`/analysis/${c.analysis_id}`}
                className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-white hover:shadow-sm hover:border-blue-100 transition-all duration-200 group bg-slate-50/50"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-blue-600 shadow-sm flex-shrink-0 group-hover:scale-105 transition-transform">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-blue-700 transition-colors">
                      {c.name}
                    </p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">Target: {c.job_role}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-right hidden sm:block">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Analyzed</p>
                    <p className="text-xs text-slate-600 font-medium">{new Date(c.added_at).toLocaleDateString()}</p>
                  </div>
                  <Badge variant={c.score >= 70 ? 'green' : c.score >= 50 ? 'amber' : 'red'} className="text-sm px-2.5 py-1">
                    {c.score}% Match
                  </Badge>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
