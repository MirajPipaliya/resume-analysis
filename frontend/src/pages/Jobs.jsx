import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { Plus, Briefcase, MapPin, Users } from 'lucide-react';
import Skeleton from '../components/ui/Skeleton';

export default function Jobs() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', department: '', location: '', type: 'Full-time', description: '', required_skills: '' });

  const { data: jobs, isLoading } = useQuery({
    queryKey: ['jobsList'],
    queryFn: async () => {
      const res = await api.get('/jobs/');
      return res.data.data;
    }
  });

  const createJob = useMutation({
    mutationFn: async (newJob) => {
      await api.post('/jobs/', newJob);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['jobsList']);
      setShowForm(false);
      setFormData({ title: '', department: '', location: '', type: 'Full-time', description: '', required_skills: '' });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createJob.mutate({
      ...formData,
      required_skills: formData.required_skills.split(',').map(s => s.trim())
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">Open Positions</h1>
          <p className="text-slate-500 mt-1">Manage job postings and requirements</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" /> New Job
        </Button>
      </div>

      {showForm && (
        <div className="glass-panel p-6 border-l-4 border-l-accent animate-in slide-in-from-top-4 duration-300">
          <h3 className="text-lg font-bold mb-4">Create New Position</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Job Title</label>
              <input required type="text" className="w-full p-2 border border-slate-300 rounded focus:ring-accent focus:border-accent" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
              <input required type="text" className="w-full p-2 border border-slate-300 rounded focus:ring-accent focus:border-accent" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
              <input required type="text" className="w-full p-2 border border-slate-300 rounded focus:ring-accent focus:border-accent" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
              <select className="w-full p-2 border border-slate-300 rounded focus:ring-accent focus:border-accent" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                <option>Full-time</option>
                <option>Contract</option>
                <option>Part-time</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Required Skills (comma separated)</label>
              <input required type="text" placeholder="e.g. React, Python, MongoDB" className="w-full p-2 border border-slate-300 rounded focus:ring-accent focus:border-accent" value={formData.required_skills} onChange={e => setFormData({...formData, required_skills: e.target.value})} />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea required rows="3" className="w-full p-2 border border-slate-300 rounded focus:ring-accent focus:border-accent" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
            </div>
            <div className="col-span-2 flex justify-end gap-2 mt-2">
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" disabled={createJob.isPending}>{createJob.isPending ? 'Saving...' : 'Save Job'}</Button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4">
        {isLoading ? (
          [1,2,3].map(i => <Skeleton key={i} className="h-28 w-full" />)
        ) : jobs?.length === 0 ? (
          <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <Briefcase className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>No job postings yet. Create one to get started.</p>
          </div>
        ) : (
          jobs?.map(job => (
            <div key={job.id} className="glass-panel p-5 card-hover flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{job.title}</h3>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-500">
                  <span className="flex items-center"><Briefcase className="w-4 h-4 mr-1.5 text-slate-400"/> {job.department}</span>
                  <span className="flex items-center"><MapPin className="w-4 h-4 mr-1.5 text-slate-400"/> {job.location}</span>
                  <span className="flex items-center bg-accent/10 text-accent px-2 py-0.5 rounded-full font-medium"><Users className="w-4 h-4 mr-1.5"/> {job.candidate_count || 0} Candidates</span>
                </div>
                <div className="flex gap-2 mt-4">
                  {job.required_skills?.slice(0, 5).map(s => <Badge key={s} variant="blue">{s}</Badge>)}
                  {job.required_skills?.length > 5 && <Badge>+{job.required_skills.length - 5} more</Badge>}
                </div>
              </div>
              <Button variant="secondary" className="shrink-0 mt-4 md:mt-0">View Details</Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
