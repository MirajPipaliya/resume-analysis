import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Clock, Upload,
  FileText, MessageSquare, Settings,
  X, ChevronRight
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

const NAV_ITEMS = [
  { label: 'Dashboard',      to: '/',               icon: LayoutDashboard, exact: true,  tag: null  },
  { label: 'History',        to: '/history',        icon: Clock,           exact: false, tag: null  },
  { label: 'Analyze Resume', to: '/upload',         icon: Upload,          exact: false, tag: 'AI'  },
  { label: 'Cover Letter',   to: '/cover-letter',   icon: FileText,        exact: false, tag: null  },
  { label: 'Interview Prep', to: '/interview-prep', icon: MessageSquare,   exact: false, tag: null  },
];

/* ── Brain / AI Neural SVG Logo ───────────────────────────
   Custom-designed brain icon — no emoji, no external image
─────────────────────────────────────────────────────────── */
function BrainLogo({ size = 32 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Byte Solutions logo"
    >
      {/* Rounded background */}
      <rect width="36" height="36" rx="9" fill="#2563eb" />

      {/* Neural / brain paths — two symmetric lobes connected in the center */}
      {/* Left lobe */}
      <path
        d="M18 10 C14 10 10 13 10 17 C10 19.5 11.2 21.5 13 22.5 C12.5 24 13 25.5 14.5 26 C16 26.5 17 25.5 18 24.5"
        stroke="white"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Right lobe */}
      <path
        d="M18 10 C22 10 26 13 26 17 C26 19.5 24.8 21.5 23 22.5 C23.5 24 23 25.5 21.5 26 C20 26.5 19 25.5 18 24.5"
        stroke="white"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Center spine */}
      <line x1="18" y1="10" x2="18" y2="24.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
      {/* Neural nodes / synapses */}
      <circle cx="13.5" cy="15.5" r="1.3" fill="white" />
      <circle cx="22.5" cy="15.5" r="1.3" fill="white" />
      <circle cx="13"   cy="20"   r="1"   fill="rgba(255,255,255,0.65)" />
      <circle cx="23"   cy="20"   r="1"   fill="rgba(255,255,255,0.65)" />
      <circle cx="18"   cy="13"   r="1.1" fill="white" />
      {/* Connecting synapse lines */}
      <line x1="13.5" y1="15.5" x2="18"   y2="13"   stroke="rgba(255,255,255,0.45)" strokeWidth="0.9" />
      <line x1="22.5" y1="15.5" x2="18"   y2="13"   stroke="rgba(255,255,255,0.45)" strokeWidth="0.9" />
      <line x1="13.5" y1="15.5" x2="13"   y2="20"   stroke="rgba(255,255,255,0.45)" strokeWidth="0.9" />
      <line x1="22.5" y1="15.5" x2="23"   y2="20"   stroke="rgba(255,255,255,0.45)" strokeWidth="0.9" />
    </svg>
  );
}

export default function Sidebar({ onClose }) {
  const user = useAuthStore(s => s.user);

  return (
    <motion.aside
      initial={{ x: -224 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="w-56 h-screen flex flex-col flex-shrink-0"
      style={{
        background: '#0d1117',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* ── Logo / Brand ───────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-5">
        <div className="flex items-center gap-3 select-none min-w-0">
          {/* Brain icon with live indicator */}
          <div className="relative flex-shrink-0">
            <BrainLogo size={34} />
            <span
              className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2"
              style={{ borderColor: '#0d1117' }}
            />
          </div>
          {/* Wordmark */}
          <div className="min-w-0">
            <p
              className="text-white font-bold text-[15px] leading-tight tracking-tight truncate"
              style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
            >
              Byte Solutions
            </p>
            <p
              className="text-[10px] font-medium leading-tight mt-0.5 truncate"
              style={{ color: 'rgba(255,255,255,0.32)' }}
            >
              Resume Intelligence
            </p>
          </div>
        </div>

        {/* Mobile close button */}
        <button
          onClick={onClose}
          className="md:hidden w-7 h-7 flex items-center justify-center rounded-md transition-colors flex-shrink-0"
          style={{ color: 'rgba(255,255,255,0.35)' }}
        >
          <X size={15} />
        </button>
      </div>

      {/* ── Navigation ─────────────────────────────── */}
      <nav className="flex-1 px-2 py-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        <p
          className="px-3 mb-2 mt-1 text-[9px] font-bold uppercase tracking-[0.12em]"
          style={{ color: 'rgba(255,255,255,0.22)' }}
        >
          Navigation
        </p>

        <div className="space-y-0.5">
          {NAV_ITEMS.map(({ label, to, icon: Icon, exact, tag }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              onClick={onClose}
              className={({ isActive }) =>
                `group flex items-center justify-between px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 ${
                  isActive
                    ? 'text-blue-300'
                    : 'hover:bg-white/[0.05]'
                }`
              }
              style={({ isActive }) => ({
                background: isActive ? 'rgba(59,130,246,0.14)' : undefined,
                color: isActive ? '#93c5fd' : 'rgba(255,255,255,0.48)',
              })}
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      size={15}
                      className={`flex-shrink-0 transition-colors ${
                        isActive ? 'text-blue-400' : 'text-white/30 group-hover:text-white/55'
                      }`}
                    />
                    <span className="truncate">{label}</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {tag && (
                      <span
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                        style={{ background: 'rgba(59,130,246,0.22)', color: '#93c5fd' }}
                      >
                        {tag}
                      </span>
                    )}
                    {isActive && <ChevronRight size={11} className="text-blue-400/50" />}
                  </div>
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* Divider */}
        <div className="my-4 mx-1" style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

        <p
          className="px-3 mb-2 text-[9px] font-bold uppercase tracking-[0.12em]"
          style={{ color: 'rgba(255,255,255,0.22)' }}
        >
          System
        </p>

        <NavLink
          to="/settings"
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150`
          }
          style={({ isActive }) => ({
            background: isActive ? 'rgba(59,130,246,0.14)' : undefined,
            color: isActive ? '#93c5fd' : 'rgba(255,255,255,0.48)',
          })}
        >
          <Settings size={15} style={{ color: 'rgba(255,255,255,0.28)' }} />
          Settings
        </NavLink>

        {/* Gemini AI badge */}
        <div
          className="mx-1 mt-5 p-3 rounded-xl"
          style={{
            background: 'rgba(59,130,246,0.07)',
            border: '1px solid rgba(59,130,246,0.13)',
          }}
        >
          <div className="flex items-center gap-2 mb-1.5">
            {/* Small inline brain */}
            <BrainLogo size={16} />
            <span className="text-[11px] font-semibold" style={{ color: '#93c5fd' }}>
              Gemini AI
            </span>
          </div>
          <p className="text-[10px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.28)' }}>
            Intelligent resume scoring, insights &amp; interview prep.
          </p>
        </div>
      </nav>

      {/* ── User card ──────────────────────────────── */}
      <div className="p-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-3 px-2 py-2">
          {/* Avatar */}
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)' }}
          >
            {(user?.username?.[0] || 'D').toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p
              className="text-[13px] font-semibold truncate leading-tight"
              style={{ color: 'rgba(255,255,255,0.82)' }}
            >
              {user?.username || 'demo_admin'}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
              <p className="text-[10px] truncate" style={{ color: 'rgba(255,255,255,0.32)' }}>
                {user?.role || 'Admin'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.aside>
  );
}
