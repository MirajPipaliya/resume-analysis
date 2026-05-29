import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../services/api';
import { FileEdit, Clipboard, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import Button from '../components/ui/Button';

export default function CoverLetter() {
  const [selectedAnalysis, setSelectedAnalysis] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  // Fetch analyzed resumes history
  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ['analysisHistory'],
    queryFn: async () => {
      const res = await api.get('/analysis/history/');
      return res.data.data || [];
    }
  });

  // Mutation to generate cover letter
  const generateLetter = useMutation({
    mutationFn: async () => {
      const res = await api.post('/analysis/cover-letter/', {
        analysis_id: selectedAnalysis,
        job_description: jobDescription
      });
      return res.data.data.cover_letter;
    },
    onSuccess: (data) => {
      setCoverLetter(data);
    }
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(coverLetter);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const isFormValid = selectedAnalysis && jobDescription.trim().length > 50;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-slate-900 flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
            <FileEdit className="w-6 h-6" />
          </div>
          AI Cover Letter Generator
        </h1>
        <p className="text-slate-500 mt-1">Generate a professional, highly-tailored cover letter based on your resume and target job.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Input Panel (40%) */}
        <div className="lg:col-span-2 glass-panel p-6 space-y-6 h-fit">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Select Resume
            </label>
            {historyLoading ? (
              <div className="h-10 bg-slate-100 animate-pulse rounded-lg" />
            ) : history?.length === 0 ? (
              <div className="p-3 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 text-xs flex gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>You must analyze a resume first in the "Analyze New" page.</span>
              </div>
            ) : (
              <select
                value={selectedAnalysis}
                onChange={(e) => setSelectedAnalysis(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-accent focus:border-accent"
              >
                <option value="">-- Choose a Resume --</option>
                {history?.map((item) => (
                  <option key={item.id} value={item.analysis_id}>
                    {item.name} - {item.job_role} ({item.score}% Match)
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Job Description
            </label>
            <textarea
              rows="10"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description or requirements here (minimum 50 characters)..."
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-accent focus:border-accent resize-none"
            />
          </div>

          <Button
            onClick={() => generateLetter.mutate()}
            disabled={!isFormValid || generateLetter.isPending}
            className="w-full shadow-sm flex items-center justify-center gap-2"
          >
            {generateLetter.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Cover Letter
              </>
            )}
          </Button>
        </div>

        {/* Output Panel (60%) */}
        <div className="lg:col-span-3 glass-panel p-6 flex flex-col min-h-[500px]">
          {coverLetter ? (
            <div className="flex-1 flex flex-col">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                <h3 className="font-bold text-slate-800">Generated Cover Letter</h3>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Clipboard className="w-3.5 h-3.5" />
                  {copySuccess ? 'Copied!' : 'Copy to Clipboard'}
                </button>
              </div>
              <div className="flex-1 whitespace-pre-wrap text-sm text-slate-700 leading-relaxed font-sans bg-slate-50/50 p-5 rounded-xl border border-slate-100 overflow-y-auto max-h-[550px] custom-scrollbar">
                {coverLetter}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400">
              <FileEdit className="w-12 h-12 text-slate-300 mb-3" />
              <p className="font-semibold text-slate-500">No cover letter generated yet</p>
              <p className="text-xs max-w-sm mt-1">Select one of your resumes, paste the target job description, and hit generate to draft a highly personalized letter.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
