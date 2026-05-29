import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../services/api';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { CheckCircle2, XCircle, BrainCircuit, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';

const ScoreRing = ({ score }) => {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  const getColor = (s) => {
    if (s >= 70) return '#10b981'; // emerald
    if (s >= 50) return '#f59e0b'; // amber
    return '#ef4444'; // rose
  };
  
  return (
    <div className="relative w-40 h-40 mx-auto">
      <svg className="w-full h-full transform -rotate-90">
        <circle cx="80" cy="80" r={radius} stroke="#f1f5f9" strokeWidth="12" fill="transparent" />
        <circle 
          cx="80" cy="80" r={radius} 
          stroke={getColor(score)} 
          strokeWidth="12" 
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
        <span className="text-4xl font-display font-bold text-slate-900">{score}</span>
        <span className="text-sm text-slate-500 block">Match</span>
      </div>
    </div>
  );
};

export default function Analysis() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: analysis, isLoading, refetch } = useQuery({
    queryKey: ['analysis', id],
    queryFn: async () => {
      const res = await api.get(`/analysis/${id}/`);
      return res.data.data;
    },
    refetchInterval: (data) => (data?.interview_questions || data?.interview_questions_error ? false : 3000)
  });

  const genQuestions = useMutation({
    mutationFn: async () => {
      const cRes = await api.get('/analysis/history/');
      const cand = cRes.data.data.find(c => c.analysis_id === id);
      if (cand) {
        await api.post('/analysis/questions/', { candidate_id: cand.id });
        refetch();
      }
    }
  });

  if (isLoading) return <div className="p-8"><Skeleton className="h-96 w-full" /></div>;
  if (!analysis) return <div className="p-8 text-center">Analysis not found</div>;

  const scoreData = analysis.score_data || {};
  const parsedData = analysis.parsed_data || {};
  const breakdown = scoreData.breakdown || {};
  
  const radarData = [
    { subject: 'Skills', A: breakdown.skills_match?.score || 0, fullMark: 100 },
    { subject: 'Experience', A: breakdown.experience_fit?.score || 0, fullMark: 100 },
    { subject: 'Education', A: breakdown.education_fit?.score || 0, fullMark: 100 },
    { subject: 'Culture', A: breakdown.culture_indicators?.score || 0, fullMark: 100 },
  ];

  return (
    <div className="flex flex-col xl:flex-row gap-6 xl:h-[calc(100vh-4rem)]">
      {/* Left Panel: Parsed Data (40%) */}
      <div className="w-full xl:w-2/5 glass-panel flex flex-col h-[60vh] xl:h-full overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-white/50">
          <h2 className="text-2xl font-display font-bold text-slate-900">{parsedData.name || 'Unknown Candidate'}</h2>
          <p className="text-slate-500 mt-1">{parsedData.email} • {parsedData.phone}</p>
          <div className="flex gap-2 mt-5 overflow-x-auto pb-1">
            {['overview', 'experience', 'skills', 'education'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium rounded-lg capitalize transition-colors flex-shrink-0 ${activeTab === tab ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-slate-900 mb-2 uppercase text-xs tracking-wider">Summary</h3>
                <p className="text-slate-700 text-sm leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">{parsedData.summary}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <h3 className="font-semibold text-slate-900 mb-1 uppercase text-xs tracking-wider">Total Experience</h3>
                  <p className="text-slate-700 font-medium">{parsedData.experience_years} years</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <h3 className="font-semibold text-slate-900 mb-1 uppercase text-xs tracking-wider">Location</h3>
                  <p className="text-slate-700 font-medium">{parsedData.location}</p>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'experience' && (
            <div className="space-y-8">
              {parsedData.work_history?.map((work, i) => (
                <div key={i} className="relative pl-6 border-l-2 border-slate-200">
                  <div className="absolute w-4 h-4 bg-accent rounded-full -left-[9px] top-1 ring-4 ring-white shadow-sm"></div>
                  <h4 className="font-bold text-slate-900 text-lg">{work.title}</h4>
                  <p className="text-sm font-medium text-accent mb-3">{work.company} • {work.start} - {work.end}</p>
                  <ul className="space-y-2">
                    {work.highlights?.map((h, j) => (
                      <li key={j} className="text-sm text-slate-600 flex items-start leading-relaxed">
                        <ChevronRight className="w-4 h-4 text-slate-300 mt-0.5 mr-2 flex-shrink-0" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
          {activeTab === 'skills' && (
            <div className="flex flex-wrap gap-2.5">
              {parsedData.skills?.map((skill, i) => (
                <Badge key={i} variant={skill.level === 'expert' ? 'amber' : skill.level === 'advanced' ? 'blue' : 'gray'} className="px-3 py-1.5 text-sm">
                  {skill.name} <span className="opacity-70 ml-1">({skill.years}y)</span>
                </Badge>
              ))}
            </div>
          )}
          {activeTab === 'education' && (
            <div className="space-y-6">
              {parsedData.education?.map((edu, i) => (
                <div key={i} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <h4 className="font-bold text-slate-900">{edu.degree}</h4>
                  <p className="text-accent font-medium text-sm mt-1">{edu.field}</p>
                  <p className="text-sm text-slate-500 mt-2">{edu.institution} • {edu.year}</p>
                </div>
              ))}
              {parsedData.certifications?.length > 0 && (
                <div className="mt-8">
                  <h4 className="font-semibold text-slate-900 mb-3 uppercase text-xs tracking-wider">Certifications</h4>
                  <ul className="space-y-2">
                    {parsedData.certifications.map((c, i) => (
                      <li key={i} className="flex items-center text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel: AI Analysis (60%) */}
      <div className="w-full xl:w-3/5 space-y-6 xl:overflow-y-auto custom-scrollbar pr-2 pb-6">
        <div className="glass-panel p-8" id="analysis-report">
          <div className="flex justify-between items-start mb-8">
            <h2 className="text-2xl font-display font-bold flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg text-accent print:bg-transparent">
                <BrainCircuit className="w-6 h-6" />
              </div>
              AI Match Analysis
            </h2>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => window.print()}
                className="btn-outline text-sm py-1.5 px-3 print:hidden"
              >
                Export PDF
              </button>
              <Badge variant={
              scoreData.recommendation === 'strong_yes' ? 'green' :
              scoreData.recommendation === 'yes' ? 'blue' :
              scoreData.recommendation === 'maybe' ? 'amber' : 'red'
            } className="px-4 py-1.5 uppercase tracking-wider font-bold shadow-sm">
              {scoreData.recommendation?.replace('_', ' ')}
            </Badge>
          </div>
        </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-10">
            <ScoreRing score={scoreData.overall_score || 0} />
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 13, fontWeight: 500 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Candidate" dataKey="A" stroke="#2563EB" strokeWidth={2} fill="#3b82f6" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-2xl p-6 mb-8 border border-blue-100 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-3 text-lg">Executive Summary</h3>
            <p className="text-slate-700 text-sm leading-relaxed">{scoreData.summary}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100">
              <h3 className="font-bold text-emerald-800 mb-4 flex items-center gap-2 text-lg">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Strengths
              </h3>
              <ul className="space-y-3">
                {scoreData.strengths?.map((s, i) => (
                  <li key={i} className="text-sm text-slate-700 flex items-start leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 mr-3 flex-shrink-0"></span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-rose-50/50 p-6 rounded-2xl border border-rose-100">
              <h3 className="font-bold text-rose-800 mb-4 flex items-center gap-2 text-lg">
                <XCircle className="w-5 h-5 text-rose-500" /> Gaps & Concerns
              </h3>
              <ul className="space-y-3">
                {scoreData.gaps?.map((s, i) => (
                  <li key={i} className="text-sm text-slate-700 flex items-start leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 mr-3 flex-shrink-0"></span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ATS Optimization Section */}
          {scoreData.ats_optimization && (
            <div className="mt-8 bg-amber-50/50 p-6 rounded-2xl border border-amber-100">
              <h3 className="font-bold text-amber-800 mb-4 flex items-center gap-2 text-lg">
                <CheckCircle2 className="w-5 h-5 text-amber-500" /> ATS Optimization Tips
              </h3>
              
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-amber-900 mb-2">Missing Keywords to Add:</h4>
                <div className="flex flex-wrap gap-2">
                  {scoreData.ats_optimization.missing_keywords?.map((kw, i) => (
                    <span key={i} className="px-2.5 py-1 bg-white border border-amber-200 text-amber-700 text-xs rounded-md shadow-sm">
                      {kw}
                    </span>
                  ))}
                  {(!scoreData.ats_optimization.missing_keywords || scoreData.ats_optimization.missing_keywords.length === 0) && (
                    <span className="text-sm text-amber-700">None detected!</span>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-amber-900 mb-2">Actionable Advice:</h4>
                <ul className="space-y-2">
                  {scoreData.ats_optimization.actionable_tips?.map((tip, i) => (
                    <li key={i} className="text-sm text-amber-800 flex items-start">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 mr-2 flex-shrink-0"></span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Interview Questions Section */}
        <div className="glass-panel p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-display font-bold flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                <BrainCircuit className="w-6 h-6" />
              </div>
              Interview Guide
            </h3>
            {!analysis.interview_questions && (
              <Button onClick={() => genQuestions.mutate()} disabled={genQuestions.isPending} className="shadow-sm">
                {genQuestions.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin"/> Generating...</> : 'Generate Questions'}
              </Button>
            )}
          </div>
          
          {analysis.interview_questions ? (
            <div className="space-y-8">
              {Object.entries(analysis.interview_questions).map(([type, qs]) => (
                <div key={type} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                  <h4 className="font-bold text-slate-900 text-lg capitalize mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${type === 'technical' ? 'bg-blue-500' : type === 'behavioral' ? 'bg-purple-500' : 'bg-amber-500'}`}></span>
                    {type} Questions
                  </h4>
                  <div className="space-y-5">
                    {qs.map((q, i) => (
                      <div key={i} className="p-4 rounded-xl bg-slate-50/80 hover:bg-slate-50 transition-colors border border-slate-100">
                        <p className="font-bold text-slate-900 mb-3 text-base">{i+1}. {q.question}</p>
                        <div className="grid gap-2 pl-4 border-l-2 border-slate-200">
                          {q.why && <p className="text-sm"><span className="font-semibold text-slate-700">Why ask:</span> <span className="text-slate-600">{q.why}</span></p>}
                          {q.look_for && <p className="text-sm"><span className="font-semibold text-slate-700">Look for:</span> <span className="text-slate-600">{q.look_for}</span></p>}
                          {q.competency && <p className="text-sm"><span className="font-semibold text-slate-700">Competency:</span> <span className="text-slate-600">{q.competency}</span></p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : analysis.interview_questions_error ? (
            <div className="text-center py-12 text-slate-500 bg-rose-50/50 rounded-2xl border-2 border-dashed border-rose-200">
              <AlertCircle className="w-12 h-12 mx-auto text-rose-500 mb-4 animate-bounce" />
              <p className="max-w-md mx-auto text-rose-800 font-semibold">Failed to Generate Questions</p>
              <p className="max-w-md mx-auto text-slate-500 text-xs mt-1 px-4 leading-relaxed">
                {analysis.interview_questions_error.includes("ResourceExhausted") || analysis.interview_questions_error.includes("quota")
                  ? "Your Gemini API key has exceeded its daily free tier quota (20 requests per day per project). Please try again later or wait a minute."
                  : analysis.interview_questions_error}
              </p>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
              <BrainCircuit className="w-12 h-12 mx-auto text-slate-300 mb-4" />
              <p className="max-w-md mx-auto">Generate targeted interview questions based on the candidate's specific profile, strengths, and identified gaps.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
