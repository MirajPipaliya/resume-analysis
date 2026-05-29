import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../store/authStore';
import api from '../services/api';
import {
  User, Lock, Mail, Eye, EyeOff, Loader2,
  CheckCircle2, Sparkles, ArrowRight, X,
  Brain, BarChart3, Kanban, MessageSquare, KeyRound, UserPlus
} from 'lucide-react';

// ── Animated typing prompt ──────────────────────────────────────────────────
const PHRASES = [
  'Hire smarter with AI-powered resume analysis.',
  'Score candidates in seconds, not hours.',
  'Surface the best talent from any resume.',
  'Turn raw PDFs into actionable hiring insights.',
  'Your intelligent hiring co-pilot is ready.',
];

function TypingPrompt() {
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const phrase = PHRASES[phraseIdx];

    if (paused) {
      const t = setTimeout(() => { setPaused(false); setDeleting(true); }, 2200);
      return () => clearTimeout(t);
    }

    if (!deleting) {
      if (displayed.length < phrase.length) {
        const t = setTimeout(() => setDisplayed(phrase.slice(0, displayed.length + 1)), 40);
        return () => clearTimeout(t);
      } else {
        setPaused(true);
      }
    } else {
      if (displayed.length > 0) {
        const t = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 18);
        return () => clearTimeout(t);
      } else {
        setDeleting(false);
        setPhraseIdx((i) => (i + 1) % PHRASES.length);
      }
    }
  }, [displayed, deleting, paused, phraseIdx]);

  return (
    <p className="text-blue-200 text-lg font-light min-h-[2rem] leading-snug tracking-wide">
      {displayed}
      <span className="inline-block w-0.5 h-5 bg-blue-300 ml-0.5 align-middle animate-pulse" />
    </p>
  );
}

// ── Reusable input ──────────────────────────────────────────────────────────
function Field({ label, icon: Icon, type = 'text', value, onChange, placeholder, required }) {
  const [show, setShow] = useState(false);
  const isPass = type === 'password';
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-4 w-4 text-slate-400" />
        </div>
        <input
          type={isPass && show ? 'text' : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className="block w-full pl-9 pr-9 py-2.5 border border-slate-200 rounded-xl
                     focus:ring-2 focus:ring-accent/40 focus:border-accent
                     bg-white/70 backdrop-blur-sm text-sm transition-all"
        />
        {isPass && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
    </div>
  );
}


// ── Main Component ──────────────────────────────────────────────────────────
export default function Login() {
  const [tab, setTab] = useState('login'); // 'login' | 'register'

  // Login state
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

  // Register state
  const [regForm, setRegForm] = useState({ full_name: '', email: '', username: '', password: '', confirm: '' });
  const [regError, setRegError] = useState('');
  
  // OTP state
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');

  const [loading, setLoading] = useState(false);
  const login = useAuthStore(state => state.login);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoading(true);
    try {
      await login(loginForm.username, loginForm.password);
      navigate('/');
    } catch {
      setLoginError('Invalid username or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegError('');
    if (regForm.password !== regForm.confirm) {
      setRegError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/register/', {
        full_name: regForm.full_name,
        email: regForm.email,
        username: regForm.username,
        password: regForm.password
      });
      setTab('otp'); // Move to OTP step
    } catch (err) {
      const data = err?.response?.data;
      setRegError(data?.message || 'Registration failed. Username or email may already be taken.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setOtpError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/verify-otp/', {
        email: regForm.email,
        otp: otpCode
      });
      // Set token and user in zustand store
      useAuthStore.getState().setAuth(
        res.data.data.user,
        res.data.data.access,
        res.data.data.refresh
      );
      navigate('/');
    } catch (err) {
      const data = err?.response?.data;
      setOtpError(data?.message || 'Invalid or expired OTP.');
    } finally {
      setLoading(false);
    }
  };

  const tabVariants = {
    initial: (dir) => ({ opacity: 0, x: dir === 'right' ? 40 : -40 }),
    animate: { opacity: 1, x: 0 },
    exit:    (dir) => ({ opacity: 0, x: dir === 'right' ? -40 : 40 }),
  };

  return (
    <div className="min-h-screen flex bg-surface overflow-hidden">
      {/* ── Left Hero Panel ── */}
      <motion.div
        initial={{ opacity: 0, x: -60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="hidden lg:flex w-1/2 relative flex-col justify-between p-14 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #1d4ed8 100%)' }}
      >
        {/* Ambient orbs */}
        <div className="absolute top-[-80px] right-[-80px] w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-60px] left-[-60px] w-72 h-72 bg-indigo-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[80px] pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 border border-slate-600 flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-2xl">B</span>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-display font-black text-white leading-none tracking-tight">BYTE</span>
              <span className="text-slate-400 text-[11px] mt-0.5 font-light tracking-[0.25em]">SOLUTIONS</span>
            </div>
          </div>
          <div className="h-px w-16 bg-blue-400/40 mb-8" />
          <TypingPrompt />
        </div>

        {/* Feature cards */}
        <div className="relative z-10 space-y-3">
          {[
            { Icon: Brain,          text: 'Gemini AI extracts structured data from any resume format' },
            { Icon: BarChart3,       text: 'Smart scoring with skill match, experience, and culture fit' },
            { Icon: Kanban,          text: 'Drag-and-drop Kanban pipeline to track every candidate' },
            { Icon: MessageSquare,   text: 'Auto-generated, personalized interview question kits' },
          ].map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="flex items-start gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm"
            >
              <div className="p-1.5 rounded-lg bg-blue-500/20 flex-shrink-0 mt-0.5">
                <f.Icon className="w-4 h-4 text-blue-300" />
              </div>
              <p className="text-sm text-blue-100/80 leading-snug">{f.text}</p>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <p className="relative z-10 text-xs text-blue-300/50 mt-4">
          © 2026 HR AI System · All rights reserved
        </p>
      </motion.div>

      {/* ── Right Auth Panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-md"
        >
          {/* Tab switcher */}
          <div className="flex bg-slate-100 rounded-2xl p-1 mb-8 shadow-inner">
            <button
              onClick={() => { setTab('login'); setLoginError(''); setRegError(''); setOtpError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 ${
                tab === 'login' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <KeyRound className="w-4 h-4" /> Sign In
            </button>
            <button
              onClick={() => { setTab('register'); setLoginError(''); setRegError(''); setOtpError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 ${
                (tab === 'register' || tab === 'otp') ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <UserPlus className="w-4 h-4" /> Create Account
            </button>
          </div>

          <AnimatePresence mode="wait" custom={tab === 'login' ? 'left' : 'right'}>
            {/* ── LOGIN FORM ── */}
            {tab === 'login' && (
              <motion.div
                key="login"
                custom="left"
                variants={tabVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.28, ease: 'easeInOut' }}
              >
                <div className="mb-7">
                  <h2 className="text-2xl font-display font-bold text-slate-900">Welcome back</h2>
                  <p className="text-slate-500 text-sm mt-1">Sign in to your HR dashboard</p>
                </div>

                {loginError && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-sm flex items-center gap-2"
                  >
                    <X className="w-4 h-4 flex-shrink-0" /> {loginError}
                  </motion.div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                  <Field
                    label="Username"
                    icon={User}
                    value={loginForm.username}
                    onChange={e => setLoginForm({ ...loginForm, username: e.target.value })}
                    placeholder="e.g. admin"
                    required
                  />
                  <Field
                    label="Password"
                    icon={Lock}
                    type="password"
                    value={loginForm.password}
                    onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                    placeholder="••••••••"
                    required
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-accent to-blue-700 text-white font-semibold
                               rounded-xl hover:opacity-90 active:scale-[0.98] transition-all shadow-lg
                               shadow-accent/25 flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                      <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>
                </form>

                <p className="text-center text-sm text-slate-500 mt-6">
                  Don't have an account?{' '}
                  <button onClick={() => setTab('register')} className="text-accent font-semibold hover:underline">
                    Create one
                  </button>
                </p>
              </motion.div>
            )}

            {/* ── REGISTER FORM ── */}
            {tab === 'register' && (
              <motion.div
                key="register"
                custom="right"
                variants={tabVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.28, ease: 'easeInOut' }}
              >
                <div className="mb-7">
                  <h2 className="text-2xl font-display font-bold text-slate-900">Create your account</h2>
                  <p className="text-slate-500 text-sm mt-1">Join the platform as a candidate or recruiter</p>
                </div>

                {regError && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-sm flex items-center gap-2"
                  >
                    <X className="w-4 h-4 flex-shrink-0" /> {regError}
                  </motion.div>
                )}

                <form onSubmit={handleRegister} className="space-y-4">
                  <Field
                    label="Full Name"
                    icon={User}
                    value={regForm.full_name}
                    onChange={e => setRegForm({ ...regForm, full_name: e.target.value })}
                    placeholder="Jane Doe"
                    required
                  />
                  <Field
                    label="Email Address"
                    icon={Mail}
                    type="email"
                    value={regForm.email}
                    onChange={e => setRegForm({ ...regForm, email: e.target.value })}
                    placeholder="jane@example.com"
                    required
                  />
                  <Field
                    label="Username"
                    icon={User}
                    value={regForm.username}
                    onChange={e => setRegForm({ ...regForm, username: e.target.value })}
                    placeholder="janedoe"
                    required
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Field
                      label="Password"
                      icon={Lock}
                      type="password"
                      value={regForm.password}
                      onChange={e => setRegForm({ ...regForm, password: e.target.value })}
                      placeholder="••••••••"
                      required
                    />
                    <Field
                      label="Confirm"
                      icon={Lock}
                      type="password"
                      value={regForm.confirm}
                      onChange={e => setRegForm({ ...regForm, confirm: e.target.value })}
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-accent to-blue-700 text-white font-semibold
                               rounded-xl hover:opacity-90 active:scale-[0.98] transition-all shadow-lg
                               shadow-accent/25 flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                      <><Sparkles className="w-4 h-4" /><span>Continue</span></>
                    )}
                  </button>
                </form>

                <p className="text-center text-sm text-slate-500 mt-6">
                  Already have an account?{' '}
                  <button onClick={() => setTab('login')} className="text-accent font-semibold hover:underline">
                    Sign in
                  </button>
                </p>
              </motion.div>
            )}

            {/* ── OTP VERIFICATION FORM ── */}
            {tab === 'otp' && (
              <motion.div
                key="otp"
                custom="right"
                variants={tabVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.28, ease: 'easeInOut' }}
              >
                <div className="mb-7">
                  <h2 className="text-2xl font-display font-bold text-slate-900">Verify your email</h2>
                  <p className="text-slate-500 text-sm mt-1">We sent a 6-digit code to <span className="font-semibold text-slate-700">{regForm.email}</span></p>
                </div>

                {otpError && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-sm flex items-center gap-2"
                  >
                    <X className="w-4 h-4 flex-shrink-0" /> {otpError}
                  </motion.div>
                )}

                <form onSubmit={handleVerifyOTP} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Verification Code</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="123456"
                      required
                      className="block w-full text-center tracking-[0.5em] font-mono text-2xl py-3 border border-slate-200 rounded-xl
                                 focus:ring-2 focus:ring-accent/40 focus:border-accent
                                 bg-white/70 backdrop-blur-sm transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otpCode.length < 6}
                    className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-accent to-blue-700 text-white font-semibold
                               rounded-xl hover:opacity-90 active:scale-[0.98] transition-all shadow-lg
                               shadow-accent/25 flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                      <><CheckCircle2 className="w-4 h-4" /><span>Verify & Create Account</span></>
                    )}
                  </button>
                </form>

                <p className="text-center text-sm text-slate-500 mt-6">
                  Didn't receive it?{' '}
                  <button onClick={() => setTab('register')} className="text-accent font-semibold hover:underline">
                    Go back
                  </button>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
