import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { FileText, FileSearch, TrendingUp, Zap, ArrowUpRight, Plus } from 'lucide-react';
import Skeleton from '../components/ui/Skeleton';
import Badge from '../components/ui/Badge';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const { data: candidates, isLoading } = useQuery({
    queryKey: ['analysisHistory'],
    queryFn: async () => {
      const res = await api.get('/analysis/history/');
      return res.data.data || [];
    },
  });

  const total      = candidates?.length || 0;
  const avgScore   = total > 0 ? Math.round(candidates.reduce((s, c) => s + c.score, 0) / total) : 0;
  const highScores = candidates?.filter(c => c.score >= 80).length || 0;
  const needsWork  = candidates?.filter(c => c.score < 50).length  || 0;

  const kpis = [
    {
      label: 'Total Analyzed', value: total, icon: FileText,
      gradient: 'from-blue-500 to-blue-600',
      bg: 'kpi-card-blue', iconBg: 'bg-blue-100', iconColor: 'text-blue-600',
      trend: '+12% this week',
    },
    {
      label: 'Average Score', value: `${avgScore}%`, icon: TrendingUp,
      gradient: 'from-violet-500 to-violet-600',
      bg: 'kpi-card-violet', iconBg: 'bg-violet-100', iconColor: 'text-violet-600',
      trend: 'Overall quality',
    },
    {
      label: 'High Scores (80+)', value: highScores, icon: Zap,
      gradient: 'from-amber-500 to-amber-600',
      bg: 'kpi-card-amber', iconBg: 'bg-amber-100', iconColor: 'text-amber-600',
      trend: 'Top candidates',
    },
    {
      label: 'Needs Improvement', value: needsWork, icon: FileSearch,
      gradient: 'from-rose-500 to-rose-600',
      bg: 'kpi-card-rose', iconBg: 'bg-rose-100', iconColor: 'text-rose-600',
      trend: 'Score below 50',
    },
  ];

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.07 } },
  };
  const item = {
    hidden: { opacity: 0, y: 16 },
    show:   { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">

      {/* ── Header ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="page-header">
          <h1>Dashboard</h1>
          <p>Welcome back — here's your hiring intelligence overview.</p>
        </div>
        <Link to="/upload" className="btn-primary flex-shrink-0">
          <Plus className="w-4 h-4" />
          Analyze Resume
        </Link>
      </div>

      {/* ── KPI Cards ──────────────────────────────── */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {kpis.map((k) => (
          <motion.div
            key={k.label}
            variants={item}
            className={`${k.bg} rounded-2xl p-5 card-hover relative overflow-hidden`}
          >
            {/* Subtle corner glow */}
            <div className={`absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br ${k.gradient} opacity-10 rounded-full blur-2xl`} />
            <div className="flex items-start justify-between mb-4">
              <div className={`p-2.5 rounded-xl ${k.iconBg}`}>
                <k.icon className={`w-5 h-5 ${k.iconColor}`} />
              </div>
              <span className="text-[11px] font-semibold text-slate-400 leading-tight text-right max-w-[90px]">
                {k.trend}
              </span>
            </div>
            <div>
              {isLoading
                ? <Skeleton className="h-9 w-20 mb-1" />
                : <p className="text-3xl font-bold text-slate-900 leading-none mb-1">{k.value}</p>
              }
              <p className="text-[13px] font-semibold text-slate-600">{k.label}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Recent Analyses ─────────────────────────── */}
      <div className="glass-panel overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recent Analyses</h2>
            <p className="text-sm text-slate-500 mt-0.5">Your latest AI-processed resumes</p>
          </div>
          <Link
            to="/history"
            className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            View all <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {isLoading ? (
            [1, 2, 3, 4].map(i => (
              <div key={i} className="px-6 py-4 flex items-center gap-4">
                <Skeleton className="w-10 h-10 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-7 w-20 rounded-full" />
              </div>
            ))
          ) : !candidates?.length ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                <FileSearch className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-base font-semibold text-slate-700 mb-1">No resumes analyzed yet</h3>
              <p className="text-sm text-slate-500 mb-5 max-w-sm">
                Upload your first resume to get AI-powered insights, ATS scoring, and interview prep.
              </p>
              <Link to="/upload" className="btn-primary text-sm">
                <Plus className="w-4 h-4" />
                Upload Resume
              </Link>
            </div>
          ) : (
            candidates.slice(0, 8).map((c, idx) => (
              <Link
                key={c.id}
                to={`/analysis/${c.analysis_id}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/80 transition-colors group"
              >
                {/* Rank indicator */}
                <div className="w-7 text-center flex-shrink-0">
                  <span className="text-xs font-bold text-slate-300">#{idx + 1}</span>
                </div>

                {/* File icon */}
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-100 flex items-center justify-center flex-shrink-0 group-hover:shadow-md transition-shadow">
                  <FileText className="w-[18px] h-[18px] text-blue-600" />
                </div>

                {/* Name + role */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-blue-700 transition-colors">
                    {c.name}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">
                    {c.job_role} &nbsp;·&nbsp; {new Date(c.added_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>

                {/* Score badge */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <Badge
                    variant={c.score >= 70 ? 'green' : c.score >= 50 ? 'amber' : 'red'}
                    className="text-xs px-3 py-1"
                  >
                    {c.score}% Match
                  </Badge>
                  <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
