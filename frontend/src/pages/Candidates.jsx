import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';
import { Search, FileText } from 'lucide-react';

export default function Candidates() {
  const { data, isLoading } = useQuery({
    queryKey: ['analysisHistory'],
    queryFn: async () => {
      const res = await api.get('/analysis/history/');
      return res.data.data || [];
    }
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">Analysis History</h1>
          <p className="text-slate-500 mt-1">Review all your previously analyzed resumes</p>
        </div>
        <Link to="/upload" className="btn-primary">
          Analyze New Resume
        </Link>
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Search by name or role..." className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-accent focus:border-accent" />
          </div>
        </div>
        
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50/80 text-slate-500 uppercase text-xs font-semibold border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Target Role</th>
              <th className="px-6 py-4">Overall Score</th>
              <th className="px-6 py-4">Date Analyzed</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr><td colSpan="5" className="p-4"><Skeleton className="h-10 w-full" /></td></tr>
            ) : data?.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                  <FileText className="w-8 h-8 mx-auto mb-3 text-slate-300" />
                  No resumes analyzed yet
                </td>
              </tr>
            ) : (
              data?.map(c => (
                <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{c.name}</td>
                  <td className="px-6 py-4 text-slate-700">{c.job_role}</td>
                  <td className="px-6 py-4">
                    <Badge variant={c.score >= 70 ? 'green' : c.score >= 50 ? 'amber' : 'red'}>{c.score}%</Badge>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{new Date(c.added_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <Link to={`/analysis/${c.analysis_id}`} className="text-accent hover:text-blue-700 font-medium text-xs bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                      View Report
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
