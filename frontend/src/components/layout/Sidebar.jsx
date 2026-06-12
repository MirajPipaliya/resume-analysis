import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, History, Upload,
  Settings, FileEdit, MessagesSquare,
  ChevronRight, Sparkles, X, Zap
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

const NAV = [
  { name: 'Dashboard',      path: '/',               icon: LayoutDashboard, badge: null },
  { name: 'History',        path: '/history',        icon: History,         badge: null },
  { name: 'Analyze Resume', path: '/upload',         icon: Upload,          badge: 'New' },
  { name: 'Cover Letter',   path: '/cover-letter',   icon: FileEdit,        badge: null },
  { name: 'Interview Prep', path: '/interview-prep', icon: MessagesSquare,  badge: null },
];

export default function Sidebar({ onClose }) {
  const user = useAuthStore(s => s.user);

  return (
    <motion.aside
      initial={{ x: -280, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="w-[260px] flex-shrink-0 flex flex-col h-screen sticky top-0 overflow-hidden select-none"
      style={{
        background: 'linear-gradient(180deg, #08101f 0%, #050c18 100%)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -left-12 w-72 h-72 bg-blue-600/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-16 w-48 h-48 bg-violet-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-indigo-900/10 to-transparent" />
      </div>

      {/* ── Logo ────────────────────────────────── */}
      <div className="relative px-5 pt-6 pb-5 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#08101f]" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-none tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              ByteHire
            </h1>
            <p className="text-slate-500 text-[10px] mt-0.5 tracking-widest font-medium">AI PLATFORM</p>
          </div>
        </div>
        <button
          className="md:hidden w-8 h-8 flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 rounded-lg transition-all"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mx-5 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent mb-2" />

      {/* ── Navigation ──────────────────────────── */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto custom-scrollbar">
        <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-600 px-3 mb-2.5 mt-1">
          Main Menu
        </p>

        <div className="space-y-0.5">
          {NAV.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={onClose}
              end={item.path === '/'}
              className={({ isActive }) =>
                `group flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600/25 to-violet-600/15 text-white shadow-sm border border-white/8'
                    : 'text-slate-500 hover:bg-white/6 hover:text-slate-300 border border-transparent'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`flex-shrink-0 p-1.5 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-br from-blue-500/30 to-violet-500/20 text-blue-300'
                        : 'text-slate-600 group-hover:text-slate-400'
                    }`}>
                      <item.icon className="w-[15px] h-[15px]" />
                    </div>
                    <span className="truncate">{item.name}</span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {item.badge && (
                      <span className="text-[9px] font-bold bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full border border-emerald-500/20">
                        {item.badge}
                      </span>
                    )}
                    {isActive && <ChevronRight className="w-3 h-3 text-blue-400 opacity-60" />}
                  </div>
                </>
              )}
            </NavLink>
          ))}
        </div>

        <div className="my-4 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
        <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-600 px-3 mb-2.5">System</p>

        <NavLink
          to="/settings"
          onClick={onClose}
          className={({ isActive }) =>
            `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border ${
              isActive
                ? 'bg-white/8 text-slate-200 border-white/8'
                : 'text-slate-500 hover:bg-white/6 hover:text-slate-300 border-transparent'
            }`
          }
        >
          <div className="p-1.5 rounded-lg text-slate-600 group-hover:text-slate-400 transition-colors flex-shrink-0">
            <Settings className="w-[15px] h-[15px]" />
          </div>
          Settings
        </NavLink>

        {/* AI Badge */}
        <div className="mt-4 mx-1 p-3 rounded-xl bg-gradient-to-br from-blue-600/10 to-violet-600/10 border border-white/6">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[11px] font-semibold text-blue-300">Powered by Gemini AI</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed">
            Advanced resume analysis with intelligent scoring and insights.
          </p>
        </div>
      </nav>

      {/* ── User Profile Card ───────────────────── */}
      <div className="relative p-3 mt-auto">
        <div className="p-3 rounded-xl bg-white/5 border border-white/8 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-lg shadow-blue-500/25">
            {(user?.username?.[0] || 'D').toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-slate-200 text-sm font-semibold truncate leading-tight">
              {user?.username || 'demo_admin'}
            </p>
            <p className="text-slate-500 text-[11px] mt-0.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
              {user?.role || 'Admin'}
            </p>
          </div>
        </div>
      </div>
    </motion.aside>
  );
}
