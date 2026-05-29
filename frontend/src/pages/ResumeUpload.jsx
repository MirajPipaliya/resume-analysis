import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import api from '../services/api';
import {
  UploadCloud, FileType, CheckCircle2, Loader2,
  AlertCircle, X, Brain, ChevronDown, Briefcase, LayoutGrid
} from 'lucide-react';
import Button from '../components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

// ── Data ────────────────────────────────────────────────────────────────────
const JOB_FIELDS = [
  'Technology & Software',
  'Data Science & AI',
  'Design & Creative',
  'Finance & Banking',
  'Healthcare & Medical',
  'Marketing & Sales',
  'Engineering',
  'Education & Research',
  'Human Resources',
  'Legal & Compliance',
  'Operations & Management',
  'Consulting & Strategy',
  'Media & Communication',
  'Retail & E-Commerce',
  'Construction & Architecture',
];

const ROLES_BY_FIELD = {
  'Technology & Software': [
    'Software Engineer', 'Frontend Developer', 'Backend Developer',
    'Full Stack Developer', 'Mobile Developer', 'DevOps Engineer',
    'Cloud Architect', 'QA Engineer', 'Security Engineer', 'CTO',
  ],
  'Data Science & AI': [
    'Data Scientist', 'Data Analyst', 'Machine Learning Engineer',
    'AI Researcher', 'Business Intelligence Analyst', 'Data Engineer',
    'NLP Engineer', 'Computer Vision Engineer', 'Research Scientist',
  ],
  'Design & Creative': [
    'UI Designer', 'UX Designer', 'Product Designer', 'Graphic Designer',
    'Brand Designer', 'Motion Designer', 'Creative Director', 'Art Director',
  ],
  'Finance & Banking': [
    'Financial Analyst', 'Investment Banker', 'Accountant', 'CFO',
    'Risk Analyst', 'Portfolio Manager', 'Auditor', 'Credit Analyst',
    'Treasury Manager', 'Financial Controller',
  ],
  'Healthcare & Medical': [
    'Doctor / Physician', 'Nurse', 'Surgeon', 'Pharmacist',
    'Medical Researcher', 'Healthcare Administrator', 'Radiologist',
    'Physiotherapist', 'Psychologist', 'Dentist',
  ],
  'Marketing & Sales': [
    'Marketing Manager', 'Digital Marketing Specialist', 'SEO Specialist',
    'Content Strategist', 'Brand Manager', 'Sales Executive',
    'Account Manager', 'Growth Hacker', 'CMO', 'Product Marketing Manager',
  ],
  'Engineering': [
    'Mechanical Engineer', 'Civil Engineer', 'Electrical Engineer',
    'Chemical Engineer', 'Structural Engineer', 'Aerospace Engineer',
    'Embedded Systems Engineer', 'Manufacturing Engineer', 'CAD Designer',
  ],
  'Education & Research': [
    'Teacher / Lecturer', 'Professor', 'Curriculum Developer',
    'Research Analyst', 'Academic Advisor', 'Education Administrator',
    'Instructional Designer', 'School Principal',
  ],
  'Human Resources': [
    'HR Manager', 'HR Business Partner', 'Recruiter / Talent Acquisition',
    'L&D Specialist', 'Compensation & Benefits Analyst',
    'HR Generalist', 'CHRO', 'Payroll Specialist',
  ],
  'Legal & Compliance': [
    'Corporate Lawyer', 'Compliance Officer', 'Legal Counsel',
    'Paralegal', 'Intellectual Property Specialist',
    'Contract Manager', 'Regulatory Affairs Manager',
  ],
  'Operations & Management': [
    'Operations Manager', 'Project Manager', 'Program Manager',
    'Supply Chain Manager', 'Logistics Coordinator', 'COO',
    'Business Analyst', 'Process Improvement Manager',
  ],
  'Consulting & Strategy': [
    'Management Consultant', 'Strategy Analyst', 'Business Consultant',
    'IT Consultant', 'Change Management Consultant', 'Agile Coach',
  ],
  'Media & Communication': [
    'Journalist', 'Content Writer', 'Copywriter', 'Editor',
    'Public Relations Manager', 'Social Media Manager',
    'Broadcast Producer', 'Podcast Host',
  ],
  'Retail & E-Commerce': [
    'Retail Manager', 'E-Commerce Specialist', 'Category Manager',
    'Merchandiser', 'Customer Experience Manager', 'Store Manager',
  ],
  'Construction & Architecture': [
    'Architect', 'Urban Planner', 'Construction Manager',
    'Site Engineer', 'Interior Designer', 'Quantity Surveyor',
    'Project Estimator',
  ],
};

// ── Field selector card ──────────────────────────────────────────────────────
function FieldCard({ value, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-all duration-150 ${
        selected
          ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/25'
          : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50'
      }`}
    >
      {value}
    </button>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function ResumeUpload() {
  const [step, setStep]               = useState(1);           // 1=role, 2=upload
  const [jobField, setJobField]       = useState('');
  const [jobRole, setJobRole]         = useState('');
  const [customRole, setCustomRole]   = useState('');
  const [file, setFile]               = useState(null);
  const [uploadState, setUploadState] = useState('idle');
  const [resumeId, setResumeId]       = useState(null);
  const [error, setError]             = useState('');
  const navigate = useNavigate();

  const roles        = jobField ? (ROLES_BY_FIELD[jobField] || []) : [];
  const displayRole  = jobRole === '__custom' ? customRole : jobRole;
  const canProceed   = jobField && (jobRole && (jobRole !== '__custom' || customRole.trim()));

  const onDrop = useCallback(accepted => {
    if (accepted?.length > 0) { setFile(accepted[0]); setError(''); }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
  });

  const handleUpload = async () => {
    if (!file) { setError('Please attach a resume file.'); return; }
    setUploadState('uploading');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('job_role', displayRole);
    formData.append('job_field', jobField);

    try {
      const res = await api.post('/resumes/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResumeId(res.data.data.resume_id);
      setUploadState('parsing');
    } catch {
      setError('Upload failed. Please check your connection and try again.');
      setUploadState('idle');
    }
  };

  useEffect(() => {
    let interval;
    if (resumeId && !['done', 'idle', 'uploading'].includes(uploadState)) {
      interval = setInterval(async () => {
        try {
          const res    = await api.get(`/resumes/${resumeId}/`);
          const status = res.data.data.status;
          if (status === 'Parsing')     setUploadState('parsing');
          if (status === 'AI Analysis') setUploadState('analysis');
          if (status === 'Failed') {
            setError('AI analysis failed. ' + (res.data.data.error || 'Please try again.'));
            setUploadState('idle');
            clearInterval(interval);
          }
          if (status === 'Done') {
            setUploadState('done');
            clearInterval(interval);
            const cRes = await api.get('/pipeline/');
            const allC = Object.values(cRes.data.data).flat();
            const cand = allC.find(c => c.resume_id === resumeId);
            setTimeout(() => navigate(cand ? `/analysis/${cand.analysis_id}` : '/candidates'), 900);
          }
        } catch (e) { console.error(e); }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [resumeId, uploadState, navigate]);

  const stages = [
    { key: 'uploading', label: 'Uploading',   desc: 'Sending file securely'         },
    { key: 'parsing',   label: 'Extracting',  desc: 'Reading resume content'        },
    { key: 'analysis',  label: 'AI Analysis', desc: 'Gemini scoring the resume'     },
    { key: 'done',      label: 'Complete',    desc: 'Redirecting to report...'      },
  ];
  const currentIdx = stages.findIndex(s => s.key === uploadState);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-slate-900">Analyse a Resume</h1>
        <p className="text-slate-500 mt-1">
          Select a target role and field — Gemini AI will extract, score and generate interview questions automatically.
        </p>
      </div>

      {/* Step indicator */}
      {uploadState === 'idle' && (
        <div className="flex items-center gap-3">
          {[{ n: 1, label: 'Target Role' }, { n: 2, label: 'Upload Resume' }].map(({ n, label }) => (
            <div key={n} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                step === n   ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                : step > n   ? 'bg-emerald-500 text-white'
                : 'bg-slate-100 text-slate-400'
              }`}>
                {step > n ? <CheckCircle2 className="w-4 h-4" /> : n}
              </div>
              <span className={`text-sm font-semibold ${step === n ? 'text-slate-800' : 'text-slate-400'}`}>
                {label}
              </span>
              {n < 2 && <div className="w-8 h-px bg-slate-200 mx-1" />}
            </div>
          ))}
        </div>
      )}

      <div className="glass-panel p-7 space-y-6">
        <AnimatePresence mode="wait">

          {/* ── STEP 1: Field + Role ── */}
          {step === 1 && uploadState === 'idle' && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.22 }}
              className="space-y-6"
            >
              {/* Job Field */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-blue-100 rounded-lg">
                    <LayoutGrid className="w-4 h-4 text-blue-600" />
                  </div>
                  <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Select Job Field / Industry</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {JOB_FIELDS.map(f => (
                    <FieldCard
                      key={f}
                      value={f}
                      selected={jobField === f}
                      onClick={() => { setJobField(f); setJobRole(''); setCustomRole(''); }}
                    />
                  ))}
                </div>
              </div>

              {/* Job Role — appears after field selected */}
              <AnimatePresence>
                {jobField && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 bg-violet-100 rounded-lg">
                        <Briefcase className="w-4 h-4 text-violet-600" />
                      </div>
                      <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Select Job Role</h2>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {roles.map(r => (
                        <FieldCard
                          key={r}
                          value={r}
                          selected={jobRole === r}
                          onClick={() => { setJobRole(r); setCustomRole(''); }}
                        />
                      ))}
                      {/* Custom role option */}
                      <FieldCard
                        value="Other / Custom Role"
                        selected={jobRole === '__custom'}
                        onClick={() => setJobRole('__custom')}
                      />
                    </div>

                    {/* Custom role input */}
                    <AnimatePresence>
                      {jobRole === '__custom' && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3 overflow-hidden"
                        >
                          <input
                            type="text"
                            autoFocus
                            value={customRole}
                            onChange={e => setCustomRole(e.target.value)}
                            placeholder="e.g. Principal Product Manager"
                            className="w-full px-4 py-3 text-sm bg-white border border-slate-200 rounded-xl
                                       focus:outline-none focus:ring-2 focus:ring-blue-400/40 focus:border-blue-400
                                       transition-all"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Selection summary */}
              {canProceed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100"
                >
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Analysing as</p>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">
                      {displayRole} &nbsp;<span className="text-slate-400 font-normal">in</span>&nbsp; {jobField}
                    </p>
                  </div>
                  <Button onClick={() => setStep(2)}>
                    Continue
                    <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ── STEP 2: Upload ── */}
          {step === 2 && uploadState === 'idle' && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.22 }}
              className="space-y-5"
            >
              {/* Selected context pill */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-blue-100 rounded-lg">
                    <Briefcase className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Target role</p>
                    <p className="text-sm font-bold text-slate-800">{displayRole} · {jobField}</p>
                  </div>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="text-xs text-blue-600 font-semibold hover:underline"
                >
                  Change
                </button>
              </div>

              {/* Dropzone */}
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 ${
                  isDragActive
                    ? 'border-blue-500 bg-blue-50 scale-[1.01]'
                    : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50'
                }`}
              >
                <input {...getInputProps()} />
                <div className="flex justify-center mb-4">
                  <div className={`p-4 rounded-2xl transition-all duration-200 ${
                    isDragActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                      : 'bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-500'
                  }`}>
                    <UploadCloud className="w-9 h-9" />
                  </div>
                </div>
                <h3 className="text-base font-semibold text-slate-800 mb-1">
                  {isDragActive ? 'Drop the resume here' : 'Drag & drop resume here'}
                </h3>
                <p className="text-sm text-slate-400 mb-4">or click to browse</p>
                <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                  <span className="bg-slate-100 px-2.5 py-1 rounded-full font-medium">PDF</span>
                  <span className="bg-slate-100 px-2.5 py-1 rounded-full font-medium">DOCX</span>
                  <span className="text-slate-300">·</span>
                  <span>up to 10 MB</span>
                </div>

                {file && (
                  <div
                    className="mt-5 inline-flex items-center gap-2.5 px-4 py-2.5 bg-white border border-blue-200 shadow-sm rounded-xl"
                    onClick={e => e.stopPropagation()}
                  >
                    <FileType className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span className="text-sm font-medium text-slate-700 max-w-[200px] truncate">{file.name}</span>
                    <button
                      onClick={e => { e.stopPropagation(); setFile(null); }}
                      className="text-slate-300 hover:text-rose-500 transition-colors ml-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                </div>
              )}

              <div className="flex items-center justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors"
                >
                  ← Back
                </button>
                <Button onClick={handleUpload} disabled={!file} size="lg">
                  <Brain className="w-4 h-4 mr-1.5" />
                  Analyse with AI
                </Button>
              </div>
            </motion.div>
          )}

          {/* ── Progress stepper ── */}
          {uploadState !== 'idle' && (
            <motion.div
              key="progress"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-8 space-y-10"
            >
              <div className="text-center">
                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mb-4">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-semibold text-blue-700">{displayRole} · {jobField}</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Brain className="w-5 h-5 text-blue-600 animate-pulse" />
                  <p className="text-base font-semibold text-slate-700">
                    {stages[currentIdx]?.desc || 'Processing...'}
                  </p>
                </div>
              </div>

              <div className="relative max-w-md mx-auto">
                <div className="absolute top-6 left-0 w-full h-1 bg-slate-100 rounded-full" />
                <div
                  className="absolute top-6 left-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-700"
                  style={{ width: `${Math.max(0, (currentIdx / (stages.length - 1)) * 100)}%` }}
                />
                <div className="relative flex justify-between">
                  {stages.map((stage, idx) => {
                    const done    = currentIdx > idx;
                    const current = currentIdx === idx;
                    return (
                      <div key={stage.key} className="flex flex-col items-center">
                        <motion.div
                          animate={current ? { scale: [1, 1.1, 1] } : {}}
                          transition={{ repeat: Infinity, duration: 1.4 }}
                          className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                            done    ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/25'
                            : current ? 'bg-white border-blue-500 text-blue-600 shadow-md shadow-blue-400/20'
                            : 'bg-white border-slate-200 text-slate-300'
                          }`}
                        >
                          {done    ? <CheckCircle2 className="w-5 h-5" />
                          : current ? <Loader2 className="w-5 h-5 animate-spin" />
                          : <span className="text-sm font-bold">{idx + 1}</span>}
                        </motion.div>
                        <p className={`text-xs font-semibold mt-3 whitespace-nowrap ${done || current ? 'text-slate-700' : 'text-slate-400'}`}>
                          {stage.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
