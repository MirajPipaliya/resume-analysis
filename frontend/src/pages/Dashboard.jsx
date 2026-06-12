import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import { FileText, TrendingUp, Award, AlertTriangle, ArrowRight, Plus, ExternalLink } from 'lucide-react';
import Skeleton from '../components/ui/Skeleton';
import Badge from '../components/ui/Badge';

/* ── KPI card ─────────────────────────────────────────── */
function KpiCard({ label, value, icon: Icon, color, loading, delay = 0 }) {
  const palette = {
    blue:   { icon: 'text-blue-600',   bg: 'bg-blue-50',   border: '#dbeafe', accent: '#2563eb' },
    violet: { icon: 'text-violet-600', bg: 'bg-violet-50', border: '#ede9fe', accent: '#7c3aed' },
    green:  { icon: 'text-green-600',  bg: 'bg-green-50',  border: '#dcfce7', accent: '#16a34a' },
    rose:   { icon: 'text-rose-600',   bg: 'bg-rose-50',   border: '#fee2e2', accent: '#e11d48'  },
  };
  const p = palette[color] ?? palette.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3, ease: 'easeOut' }}
      className="card p-5 card-lift"
      style={{ borderColor: p.border }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-9 h-9 rounded-xl ${p.bg} flex items-center justify-center flex-shrink-0`}>
          <Icon size={18} className={p.icon} />
        </div>
        <div className="w-1 h-6 rounded-full" style={{ background: p.accent, opacity: 0.25 }} />
      </div>

      {loading
        ? <Skeleton className="h-8 w-16 mb-1" />
        : <p className="stat-value mb-1">{value}</p>
      }
      <p className="text-sm text-gray-500 font-medium">{label}</p>
    </motion.div>
  );
}

/* ── Score pill ─────────────────────────────────────────── */
function ScorePill({ score }) {
  if (score >= 70) return <Badge variant="green">{score}%</Badge>;
  if (score >= 50) return <Badge variant="amber">{score}%</Badge>;
  return <Badge variant="red">{score}%</Badge>;
}

export default function Dashboard() {
  const { data: candidates, isLoading } = useQuery({
    queryKey: ['analysisHistory'],
    queryFn: async () => {
      const res = await api.get('/analysis/history/');
      return res.data.data || [];
    },
  });

  const total      = candidates?.length ?? 0;
  const avgScore   = total > 0 ? Math.round(candidates.reduce((s, c) => s + (c.score || 0), 0) / total) : 0;
  const highScores = candidates?.filter(c => c.score >= 80).length ?? 0;
  const needsWork  = candidates?.filter(c => c.score < 50).length  ?? 0;

  return (
    <div className="max-w-5xl mx-auto space-y-7">

      {/* ── Page header ────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="mb-1">Dashboard</h1>
          <p className="text-gray-500 text-sm">Your resume intelligence overview</p>
        </div>
        <Link to="/upload" className="btn btn-primary">
          <Plus size={15} strokeWidth={2.5} />
          Analyze Resume
        </Link>
      </div>

      {/* ── KPI row ────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Analyzed"        value={total}          icon={FileText}      color="blue"   loading={isLoading} delay={0}    />
        <KpiCard label="Average Score"   value={`${avgScore}%`} icon={TrendingUp}    color="violet" loading={isLoading} delay={0.05} />
        <KpiCard label="High Scores 80+" value={highScores}     icon={Award}         color="green"  loading={isLoading} delay={0.1}  />
        <KpiCard label="Needs Work"      value={needsWork}      icon={AlertTriangle} color="rose"   loading={isLoading} delay={0.15} />
      </div>

      {/* ── Recent analyses ─────────────────────────── */}
      <motion.div
        className="card overflow-hidden"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3, ease: 'easeOut' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="mb-0.5">Recent Analyses</h3>
            <p className="text-xs text-gray-400 font-medium">Latest AI-processed resumes</p>
          </div>
          <Link
            to="/history"
            className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {/* Rows */}
        {isLoading ? (
          <div className="divide-y divide-gray-100">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-center gap-4 px-6 py-4">
                <Skeleton className="w-9 h-9 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-40" />
                  <Skeleton className="h-3 w-28" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            ))}
          </div>
        ) : !candidates?.length ? (
          <div className="empty-state">
            <div className="empty-icon">
              <FileText size={22} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-1">No resumes yet</p>
              <p className="text-sm text-gray-400 max-w-xs mx-auto">
                Upload your first resume to get AI-powered scoring, ATS analysis, and interview preparation.
              </p>
            </div>
            <Link to="/upload" className="btn btn-primary btn-sm mt-1">
              <Plus size={13} strokeWidth={2.5} /> Get started
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {candidates.slice(0, 8).map((c, idx) => (
              <Link
                key={c.id}
                to={`/analysis/${c.analysis_id}`}
                className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50 transition-colors group"
              >
                {/* Index */}
                <span className="text-xs font-semibold text-gray-300 w-5 text-right flex-shrink-0">
                  {idx + 1}
                </span>

                {/* Avatar */}
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-blue-600"
                  style={{ background: '#eff6ff', border: '1px solid #dbeafe' }}
                >
                  <FileText size={16} />
                </div>

                {/* Meta */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-blue-700 transition-colors">
                    {c.name || 'Unnamed'}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">
                    {c.job_role} &middot;{' '}
                    {new Date(c.added_at).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })}
                  </p>
                </div>

                {/* Score + arrow */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <ScorePill score={c.score} />
                  <ExternalLink size={13} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
