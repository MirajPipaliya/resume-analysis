import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../services/api';
import { MessagesSquare, Sparkles, Loader2, Award, CheckCircle2, AlertCircle } from 'lucide-react';
import Button from '../components/ui/Button';

export default function InterviewPrep() {
  const [selectedAnalysis, setSelectedAnalysis] = useState('');
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);

  // Fetch analyzed resumes history
  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ['analysisHistory'],
    queryFn: async () => {
      const res = await api.get('/analysis/history/');
      return res.data.data || [];
    }
  });

  // Fetch the detailed analysis including interview questions
  const { data: analysisDetail, isLoading: detailLoading } = useQuery({
    queryKey: ['analysisDetail', selectedAnalysis],
    queryFn: async () => {
      if (!selectedAnalysis) return null;
      const res = await api.get(`/analysis/${selectedAnalysis}/`);
      return res.data.data;
    },
    enabled: !!selectedAnalysis
  });

  // Mutation to evaluate candidate response
  const evaluateAnswer = useMutation({
    mutationFn: async () => {
      const res = await api.post('/analysis/interview-feedback/', {
        analysis_id: selectedAnalysis,
        question: activeQuestion.question,
        answer: answer
      });
      return res.data.data;
    },
    onSuccess: (data) => {
      setFeedback(data);
    }
  });

  const handleSelectQuestion = (q) => {
    setActiveQuestion(q);
    setAnswer('');
    setFeedback(null);
  };

  const handleBackToQuestions = () => {
    setActiveQuestion(null);
    setAnswer('');
    setFeedback(null);
  };

  const questions = analysisDetail?.interview_questions || {};
  const hasQuestions = Object.values(questions).some(arr => arr && arr.length > 0);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-slate-900 flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
            <MessagesSquare className="w-6 h-6" />
          </div>
          Mock Interview Playground
        </h1>
        <p className="text-slate-500 mt-1">Practice answering AI-tailored interview questions and receive instant STAR-based feedback.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Side: Resume selector and Question list (40%) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-panel p-5">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Select Resume Profile
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
                onChange={(e) => {
                  setSelectedAnalysis(e.target.value);
                  setActiveQuestion(null);
                  setFeedback(null);
                }}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-accent focus:border-accent"
              >
                <option value="">-- Choose a Profile --</option>
                {history?.map((item) => (
                  <option key={item.id} value={item.analysis_id}>
                    {item.name} - {item.job_role}
                  </option>
                ))}
              </select>
            )}
          </div>

          {selectedAnalysis && (
            <div className="glass-panel p-5 overflow-hidden max-h-[500px] flex flex-col">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-3">Interview Questions</h3>
              {detailLoading ? (
                <div className="space-y-2 flex-1">
                  {[1, 2, 3].map(i => <div key={i} className="h-12 bg-slate-100 animate-pulse rounded-lg" />)}
                </div>
              ) : !hasQuestions ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  No interview questions generated yet. Make sure you generated questions on the analysis page for this resume first!
                </div>
              ) : (
                <div className="space-y-4 overflow-y-auto flex-1 custom-scrollbar pr-1">
                  {Object.entries(questions).map(([type, qs]) => (
                    <div key={type} className="space-y-1.5">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{type}</h4>
                      {qs.map((q, i) => (
                        <button
                          key={i}
                          onClick={() => handleSelectQuestion({ ...q, type })}
                          className={`w-full text-left p-3 rounded-lg text-xs font-semibold border transition-all duration-200 ${
                            activeQuestion?.question === q.question
                              ? 'bg-purple-50 border-purple-200 text-purple-800 shadow-sm'
                              : 'bg-white border-slate-100 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {q.question}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Side: Playground and feedback (60%) */}
        <div className="lg:col-span-3 glass-panel p-6 min-h-[450px] flex flex-col justify-between">
          {activeQuestion ? (
            <div className="flex-1 flex flex-col justify-between space-y-6">
              <div>
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                    {activeQuestion.type} Question
                  </span>
                  <button onClick={handleBackToQuestions} className="text-xs text-slate-400 hover:text-slate-600">
                    Back
                  </button>
                </div>
                <h3 className="font-bold text-slate-800 text-lg mt-4 mb-2">{activeQuestion.question}</h3>
                {activeQuestion.look_for && (
                  <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="font-semibold text-slate-700">Mock Tip:</span> Look to highlight: {activeQuestion.look_for}
                  </p>
                )}
              </div>

              {!feedback ? (
                <div className="space-y-4 flex-1 flex flex-col justify-end">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Your Response
                  </label>
                  <textarea
                    rows="8"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Type your mock interview response here... Try using the STAR format (Situation, Task, Action, Result)."
                    className="w-full p-4 bg-white border border-slate-200 rounded-xl text-sm focus:ring-accent focus:border-accent resize-none flex-1"
                  />
                  <Button
                    onClick={() => evaluateAnswer.mutate()}
                    disabled={answer.trim().length < 20 || evaluateAnswer.isPending}
                    className="w-full flex justify-center items-center gap-2 shadow-sm"
                  >
                    {evaluateAnswer.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Analyzing Answer...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Submit Answer & Get Critique
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-6 overflow-y-auto max-h-[500px] custom-scrollbar">
                  <div className="bg-gradient-to-br from-purple-50 to-indigo-50/50 p-5 rounded-2xl border border-purple-100 flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0 text-xl font-bold">
                      {feedback.star_score}/10
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">STAR Format Alignment</h4>
                      <p className="text-xs text-slate-600 mt-1">{feedback.star_feedback}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">Overall Critique</h4>
                    <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100 leading-relaxed">{feedback.overall_critique}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                      <h4 className="font-bold text-emerald-800 text-sm mb-2 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Key Strengths
                      </h4>
                      <ul className="space-y-1.5">
                        {feedback.strengths?.map((s, i) => (
                          <li key={i} className="text-xs text-slate-600 flex items-start">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 mr-2 flex-shrink-0"></span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-100">
                      <h4 className="font-bold text-rose-800 text-sm mb-2 flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-rose-500" /> Improvement Areas
                      </h4>
                      <ul className="space-y-1.5">
                        {feedback.improvements?.map((s, i) => (
                          <li key={i} className="text-xs text-slate-600 flex items-start">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 mr-2 flex-shrink-0"></span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <Button onClick={() => setFeedback(null)} className="w-full btn-outline mt-4">
                    Try Again
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400">
              <MessagesSquare className="w-12 h-12 text-slate-300 mb-3" />
              <p className="font-semibold text-slate-500">Practice Arena</p>
              <p className="text-xs max-w-sm mt-1">Select a resume profile on the left, click on a question, and draft your answer to get graded by AI.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
