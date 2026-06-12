import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../services/api';
import { FileEdit, ClipboardCopy, Loader2, Sparkles, AlertCircle, CheckCircle2, ChevronDown } from 'lucide-react';
import Button from '../components/ui/Button';

export default function CoverLetter() {
  const [selectedAnalysis, setSelectedAnalysis] = useState('');
  const [jobDescription,   setJobDescription]   = useState('');
  const [coverLetter,      setCoverLetter]       = useState('');
  const [copySuccess,      setCopySuccess]       = useState(false);

  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ['analysisHistory'],
    queryFn: async () => {
      const res = await api.get('/analysis/history/');
      return res.data.data || [];
    },
  });

  const generateLetter = useMutation({
    mutationFn: async () => {
      const res = await api.post('/analysis/cover-letter/', {
        analysis_id:     selectedAnalysis,
        job_description: jobDescription,
      });
      return res.data.data.cover_letter;
    },
    onSuccess: data => setCoverLetter(data),
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(coverLetter);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const isFormValid = selectedAnalysis && jobDescription.trim().length > 50;

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/25 flex-shrink-0">
          <FileEdit className="w-5 h-5 text-white" />
        </div>
        <div className="page-header">
          <h1>AI Cover Letter</h1>
          <p>Generate a professional, tailored cover letter using Gemini AI in seconds.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* ── Input Panel ── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Resume selector */}
          <div className="glass-panel p-5">
            <label className="block text-sm font-bold text-slate-700 mb-2.5">
              Select Resume
            </label>

            {historyLoading ? (
              <div className="h-11 bg-slate-100 animate-pulse rounded-xl" />
            ) : !history?.length ? (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm flex gap-2.5 items-start">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>Analyze a resume first on the <strong>Analyze Resume</strong> page.</span>
              </div>
            ) : (
              <div className="relative">
                <select
                  value={selectedAnalysis}
                  onChange={e => setSelectedAnalysis(e.target.value)}
                  className="w-full appearance-none px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 transition-all pr-9"
                >
                  <option value="">— Choose a resume —</option>
                  {history.map(item => (
                    <option key={item.id} value={item.analysis_id}>
                      {item.name} · {item.job_role} ({item.score}%)
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            )}
          </div>

          {/* Job Description */}
          <div className="glass-panel p-5">
            <label className="block text-sm font-bold text-slate-700 mb-2.5">
              Job Description
              <span className="ml-2 text-xs font-normal text-slate-400">(min. 50 chars)</span>
            </label>
            <textarea
              rows={10}
              value={jobDescription}
              onChange={e => setJobDescription(e.target.value)}
              placeholder="Paste the full job description or key requirements here..."
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 transition-all resize-none leading-relaxed"
            />
            <p className="text-xs text-slate-400 mt-2 text-right">
              {jobDescription.length} characters
            </p>
          </div>

          <Button
            onClick={() => generateLetter.mutate()}
            disabled={!isFormValid || generateLetter.isPending}
            className="w-full"
            size="lg"
          >
            {generateLetter.isPending ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</>
            ) : (
              <><Sparkles className="w-4 h-4" /> Generate Cover Letter</>
            )}
          </Button>
        </div>

        {/* ── Output Panel ── */}
        <div className="lg:col-span-3 glass-panel p-6 flex flex-col min-h-[520px]">
          {coverLetter ? (
            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <h3 className="text-base font-bold text-slate-800">Generated Cover Letter</h3>
                </div>
                <button
                  onClick={handleCopy}
                  className={`flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-xl transition-all ${
                    copySuccess
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                      : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100'
                  }`}
                >
                  <ClipboardCopy className="w-3.5 h-3.5" />
                  {copySuccess ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="flex-1 whitespace-pre-wrap text-sm text-slate-700 leading-[1.85] bg-slate-50/60 p-5 rounded-xl border border-slate-100 overflow-y-auto max-h-[620px] custom-scrollbar">
                {coverLetter}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-violet-50 border border-blue-100 flex items-center justify-center">
                <FileEdit className="w-7 h-7 text-blue-400" />
              </div>
              <div>
                <p className="text-base font-semibold text-slate-600 mb-1">No cover letter yet</p>
                <p className="text-sm text-slate-400 max-w-xs leading-relaxed">
                  Select a resume, paste the job description, and click Generate to create a personalized cover letter.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
