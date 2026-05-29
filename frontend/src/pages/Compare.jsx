import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';
import { Users, X } from 'lucide-react';

export default function Compare() {
  const [selectedIds, setSelectedIds] = useState([]);
  
  const { data: candidates, isLoading: candidatesLoading } = useQuery({
    queryKey: ['candidatesList'],
    queryFn: async () => {
      const res = await api.get('/pipeline/');
      return Object.values(res.data.data).flat().sort((a, b) => b.score - a.score);
    }
  });

  const { data: comparisonData, isLoading: comparisonLoading } = useQuery({
    queryKey: ['compare', selectedIds.join(',')],
    queryFn: async () => {
      const res = await api.get(`/analysis/compare/?ids=${selectedIds.join(',')}`);
      return res.data.data;
    },
    enabled: selectedIds.length > 0
  });

  const toggleCandidate = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      if (selectedIds.length >= 3) return; // limit to 3
      setSelectedIds([...selectedIds, id]);
    }
  };

  const getRadarData = () => {
    if (!comparisonData || comparisonData.length === 0) return [];
    
    const subjects = ['Skills', 'Experience', 'Education', 'Culture'];
    const data = subjects.map(s => ({ subject: s, fullMark: 100 }));
    
    comparisonData.forEach((c, idx) => {
      const breakdown = c.analysis?.score_data?.breakdown || {};
      data[0][`Candidate${idx+1}`] = breakdown.skills_match?.score || 0;
      data[1][`Candidate${idx+1}`] = breakdown.experience_fit?.score || 0;
      data[2][`Candidate${idx+1}`] = breakdown.education_fit?.score || 0;
      data[3][`Candidate${idx+1}`] = breakdown.culture_indicators?.score || 0;
    });
    
    return data;
  };

  const colors = ['#2563EB', '#10B981', '#F59E0B'];
  const radarData = getRadarData();

  return (
    <div className="space-y-6 max-w-6xl mx-auto h-full flex flex-col">
      <div>
        <h1 className="text-3xl font-display font-bold text-slate-900">Compare Candidates</h1>
        <p className="text-slate-500 mt-1">Select up to 3 candidates for side-by-side evaluation</p>
      </div>

      <div className="flex gap-6 flex-1">
        {/* Selection sidebar */}
        <div className="w-1/3 glass-panel p-4 flex flex-col h-[calc(100vh-10rem)]">
          <h3 className="font-bold text-slate-800 mb-4 px-2">Select Candidates (Max 3)</h3>
          <div className="flex-1 overflow-y-auto custom-scrollbar px-2 space-y-2">
            {candidatesLoading ? <Skeleton className="h-40 w-full" /> : candidates?.map(c => (
              <div 
                key={c.id} 
                onClick={() => toggleCandidate(c.id)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedIds.includes(c.id) 
                  ? 'border-accent bg-accent/5 shadow-sm' 
                  : 'border-slate-200 hover:border-slate-300 bg-white'
                } ${selectedIds.length >= 3 && !selectedIds.includes(c.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex justify-between items-center">
                  <p className="font-medium text-slate-900">{c.name}</p>
                  <Badge variant={c.score >= 70 ? 'green' : 'amber'}>{c.score}%</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Comparison view */}
        <div className="w-2/3 glass-panel p-6 flex flex-col">
          {selectedIds.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <Users className="w-16 h-16 mb-4 text-slate-300" />
              <p>Select candidates from the left panel to compare</p>
            </div>
          ) : comparisonLoading ? (
            <Skeleton className="h-full w-full" />
          ) : (
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="h-72 mb-8">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    {comparisonData?.map((c, idx) => (
                      <Radar 
                        key={idx} 
                        name={c.candidate.name} 
                        dataKey={`Candidate${idx+1}`} 
                        stroke={colors[idx]} 
                        strokeWidth={2}
                        fill={colors[idx]} 
                        fillOpacity={0.2} 
                      />
                    ))}
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                {comparisonData?.map((c, idx) => (
                  <div key={idx} className="border border-slate-100 bg-slate-50 p-5 rounded-2xl">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-3 mb-4">
                      <h3 className="font-bold text-lg text-slate-900" style={{ color: colors[idx] }}>{c.candidate.name}</h3>
                      <span className="font-bold text-xl">{c.candidate.score}%</span>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-2">Top Strengths</h4>
                        <ul className="space-y-1">
                          {c.analysis?.score_data?.strengths?.slice(0, 3).map((s, i) => (
                            <li key={i} className="text-sm text-slate-700 truncate">• {s}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-2">Main Gaps</h4>
                        <ul className="space-y-1">
                          {c.analysis?.score_data?.gaps?.slice(0, 3).map((s, i) => (
                            <li key={i} className="text-sm text-rose-600 truncate">• {s}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
