import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import { FileText, Search, Plus, ExternalLink, Clock } from 'lucide-react';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';

function ScoreBadge({ score }) {
  if (score >= 70) return <Badge variant="green">{score}%</Badge>;
  if (score >= 50) return <Badge variant="amber">{score}%</Badge>;
  return <Badge variant="red">{score}%</Badge>;
}

export default function Candidates() {
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['analysisHistory'],
    queryFn: async () => {
      const res = await api.get('/analysis/history/');
      return res.data.data || [];
    },
  });

  const rows = data?.filter(c =>
    !search.trim() ||
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.job_role?.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="mb-1">Analysis History</h1>
          <p className="text-gray-500 text-sm">All previously analyzed resumes and scores</p>
        </div>
        <Link to="/upload" className="btn btn-primary">
          <Plus size={15} strokeWidth={2.5} />
          Analyze Resume
        </Link>
      </div>

      {/* Card */}
      <motion.div
        className="card overflow-hidden"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        {/* Search bar */}
        <div className="px-4 py-3.5 border-b border-gray-100" style={{ background: '#fafafa' }}>
          <div className="relative max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or role…"
              className="input pl-9 py-2 text-sm"
              style={{ fontSize: '0.875rem', padding: '0.5rem 0.75rem 0.5rem 2.25rem' }}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ paddingLeft: '1.5rem' }}>#</th>
                <th>Candidate</th>
                <th>Target Role</th>
                <th>Score</th>
                <th>Date Analyzed</th>
                <th style={{ textAlign: 'right', paddingRight: '1.5rem' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [1,2,3,4,5].map(i => (
                  <tr key={i}>
                    <td colSpan={6} style={{ padding: '0.75rem 1.5rem' }}>
                      <Skeleton className="h-9 w-full rounded-lg" />
                    </td>
                  </tr>
                ))
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state">
                      <div className="empty-icon"><FileText size={22} /></div>
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-1">
                          {search ? 'No results found' : 'No resumes yet'}
                        </p>
                        <p className="text-sm text-gray-400">
                          {search ? 'Try a different search term.' : 'Analyze your first resume to see it here.'}
                        </p>
                      </div>
                      {!search && (
                        <Link to="/upload" className="btn btn-primary btn-sm mt-1">
                          <Plus size={13} /> Get started
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                rows.map((c, idx) => (
                  <tr key={c.id}>
                    <td style={{ paddingLeft: '1.5rem', color: '#9ca3af', fontWeight: 600, fontSize: '0.75rem', width: 40 }}>
                      {idx + 1}
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: '#eff6ff', border: '1px solid #dbeafe' }}
                        >
                          <FileText size={14} className="text-blue-600" />
                        </div>
                        <span className="font-semibold text-gray-900 truncate max-w-[160px]">
                          {c.name || '—'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="truncate block max-w-[180px] text-gray-600">
                        {c.job_role || '—'}
                      </span>
                    </td>
                    <td><ScoreBadge score={c.score} /></td>
                    <td>
                      <div className="flex items-center gap-1.5 text-gray-500 text-xs font-medium">
                        <Clock size={13} className="flex-shrink-0" />
                        {new Date(c.added_at).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric',
                        })}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right', paddingRight: '1.5rem' }}>
                      <Link
                        to={`/analysis/${c.analysis_id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        View Report <ExternalLink size={12} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {rows.length > 0 && (
          <div
            className="px-6 py-3 text-xs text-gray-400 font-medium"
            style={{ borderTop: '1px solid #f3f4f6', background: '#fafafa' }}
          >
            {rows.length} {rows.length === 1 ? 'record' : 'records'}
          </div>
        )}
      </motion.div>
    </div>
  );
}
