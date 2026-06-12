import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';
import { Search, FileText, Plus, ArrowUpRight, Clock } from 'lucide-react';
import { useState } from 'react';

export default function Candidates() {
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['analysisHistory'],
    queryFn: async () => {
      const res = await api.get('/analysis/history/');
      return res.data.data || [];
    },
  });

  const filtered = data?.filter(c =>
    !search ||
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.job_role?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="page-header">
          <h1>Analysis History</h1>
          <p>Browse and review all previously analyzed resumes</p>
        </div>
        <Link to="/upload" className="btn-primary flex-shrink-0">
          <Plus className="w-4 h-4" />
          Analyze Resume
        </Link>
      </div>

      {/* Table card */}
      <div className="glass-panel overflow-hidden">

        {/* Search bar */}
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="relative max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or role..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 transition-all"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th className="pl-6 pr-3 rounded-tl-xl">Candidate</th>
                <th>Target Role</th>
                <th>Score</th>
                <th>Date</th>
                <th className="text-right pr-6 rounded-tr-xl">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [1, 2, 3, 4, 5].map(i => (
                  <tr key={i}>
                    <td colSpan="5" className="px-6 py-3">
                      <Skeleton className="h-10 w-full" />
                    </td>
                  </tr>
                ))
              ) : !filtered?.length ? (
                <tr>
                  <td colSpan="5" className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                        <FileText className="w-7 h-7 text-slate-400" />
                      </div>
                      <p className="text-sm font-semibold text-slate-600">
                        {search ? 'No results match your search' : 'No resumes analyzed yet'}
                      </p>
                      {!search && (
                        <Link to="/upload" className="btn-primary text-sm mt-1">
                          <Plus className="w-3.5 h-3.5" /> Upload your first resume
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map(c => (
                  <tr key={c.id}>
                    {/* Candidate */}
                    <td className="pl-6 pr-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-100 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="font-semibold text-slate-800 truncate max-w-[180px]">
                          {c.name || '—'}
                        </span>
                      </div>
                    </td>

                    {/* Role */}
                    <td>
                      <span className="inline-block max-w-[160px] truncate text-slate-600 text-sm">
                        {c.job_role || '—'}
                      </span>
                    </td>

                    {/* Score */}
                    <td>
                      <Badge variant={c.score >= 70 ? 'green' : c.score >= 50 ? 'amber' : 'red'}>
                        {c.score}%
                      </Badge>
                    </td>

                    {/* Date */}
                    <td>
                      <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                        <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="whitespace-nowrap">
                          {new Date(c.added_at).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric',
                          })}
                        </span>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="text-right pr-6">
                      <Link
                        to={`/analysis/${c.analysis_id}`}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3.5 py-1.5 rounded-xl transition-all"
                      >
                        View Report <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer count */}
        {filtered?.length > 0 && (
          <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50">
            <p className="text-xs font-medium text-slate-400">
              Showing <span className="text-slate-600 font-semibold">{filtered.length}</span> {filtered.length === 1 ? 'result' : 'results'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
