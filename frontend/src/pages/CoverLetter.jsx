import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import api from '../services/api';
import { FileText, ClipboardCopy, Loader2, Sparkles, AlertCircle, CheckCircle2, ChevronDown } from 'lucide-react';
import Button from '../components/ui/Button';

export default function CoverLetter() {
  const [selectedAnalysis, setSelectedAnalysis] = useState('');
  const [jobDescription,   setJobDescription]   = useState('');
  const [coverLetter,      setCoverLetter]       = useState('');
  const [copied,           setCopied]            = useState(false);

  const { data: history, isLoading: hLoading } = useQuery({
    queryKey: ['analysisHistory'],
    queryFn: async () => {
      const res = await api.get('/analysis/history/');
      return res.data.data || [];
    },
  });

  const gen = useMutation({
    mutationFn: async () => {
      const r = await api.post('/analysis/cover-letter/', {
        analysis_id:     selectedAnalysis,
        job_description: jobDescription,
      });
      return r.data.data.cover_letter;
    },
    onSuccess: data => setCoverLetter(data),
  });

  const copy = () => {
    navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const valid = selectedAnalysis && jobDescription.trim().length > 50;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="mb-1">AI Cover Letter</h1>
        <p className="text-sm text-gray-500">
          Generate a tailored, professional cover letter using Gemini AI — matched to your resume and target job.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 items-start">

        {/* ── Inputs (2 cols) ─────────────────────── */}
        <motion.div
          className="lg:col-span-2 space-y-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* Resume select */}
          <div className="card p-5">
            <label className="label">Select Resume</label>
            {hLoading ? (
              <div className="h-10 bg-gray-100 animate-pulse rounded-lg" />
            ) : !history?.length ? (
              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5 text-amber-500" />
                <span>Analyze a resume first on the <strong>Analyze Resume</strong> page.</span>
              </div>
            ) : (
              <div className="relative">
                <select
                  value={selectedAnalysis}
                  onChange={e => setSelectedAnalysis(e.target.value)}
                  className="input appearance-none pr-9 text-sm"
                >
                  <option value="">— Choose a resume —</option>
                  {history.map(item => (
                    <option key={item.id} value={item.analysis_id}>
                      {item.name} · {item.job_role} ({item.score}%)
                    </option>
                  ))}
                </select>
                <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            )}
          </div>

          {/* Job description */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-1.5">
              <label className="label mb-0">Job Description</label>
              <span className="text-xs text-gray-400">{jobDescription.length} chars</span>
            </div>
            <p className="text-xs text-gray-400 mb-2.5">Paste the full job posting or key requirements (min 50 chars)</p>
            <textarea
              rows={9}
              value={jobDescription}
              onChange={e => setJobDescription(e.target.value)}
              placeholder="We are looking for a skilled Software Engineer who…"
              className="input textarea text-sm leading-relaxed"
              style={{ fontSize: '0.875rem' }}
            />
          </div>

          <Button
            onClick={() => gen.mutate()}
            disabled={!valid || gen.isPending}
            className="w-full"
            size="lg"
          >
            {gen.isPending
              ? <><Loader2 size={15} className="animate-spin" /> Generating…</>
              : <><Sparkles size={15} /> Generate Cover Letter</>
            }
          </Button>
        </motion.div>

        {/* ── Output (3 cols) ─────────────────────── */}
        <motion.div
          className="lg:col-span-3 card flex flex-col"
          style={{ minHeight: 520 }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.05 }}
        >
          {coverLetter ? (
            <>
              {/* Toolbar */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-green-500" />
                  <span className="text-sm font-semibold text-gray-800">Generated Cover Letter</span>
                </div>
                <button
                  onClick={copy}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                    copied
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <ClipboardCopy size={12} />
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 p-5 overflow-y-auto scroll-y">
                <p
                  className="text-sm text-gray-700 leading-[1.9] whitespace-pre-wrap"
                  style={{ fontFamily: 'Georgia, serif', fontSize: '0.9rem' }}
                >
                  {coverLetter}
                </p>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="empty-state">
                <div className="empty-icon">
                  <FileText size={22} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">No cover letter yet</p>
                  <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
                    Select a resume, paste the job description, then click Generate to create your personalized letter.
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
