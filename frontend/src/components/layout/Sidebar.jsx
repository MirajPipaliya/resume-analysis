import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, FileText,
  Settings, LogOut, Upload,
  Sparkles, ChevronRight, Shield,
  FileEdit, MessagesSquare, X
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

const NAV = [
  { name: 'Dashboard',   path: '/',          icon: LayoutDashboard, badge: null },
  { name: 'History',     path: '/history',   icon: FileText,        badge: null },
  { name: 'Analyze New', path: '/upload',    icon: Upload,          badge: 'New' },
  { name: 'Cover Letter',path: '/cover-letter', icon: FileEdit,     badge: null },
  { name: 'Interview Prep', path: '/interview-prep', icon: MessagesSquare, badge: null },
];

export default function Sidebar({ onClose }) {
  const logout = useAuthStore(s => s.logout);
  const user   = useAuthStore(s => s.user);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <motion.aside
      initial={{ x: -280, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="w-64 flex-shrink-0 flex flex-col h-screen sticky top-0 overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #0f172a 0%, #080d1a 100%)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Ambient glow */}
      <div className="absolute top-0 left-0 w-full h-40 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -left-10 w-60 h-60 bg-blue-600/20 rounded-full blur-3xl" />
        <div className="absolute -top-10 right-0 w-40 h-40 bg-violet-600/10 rounded-full blur-3xl" />
      </div>

      {/* Logo */}
      <div className="relative px-6 pt-7 pb-5 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 border border-slate-600 flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-xl">B</span>
            </div>
          </div>
          <div>
            <h1 className="text-white font-display font-black text-2xl leading-none tracking-tight">BYTE</h1>
            <p className="text-slate-400 text-[11px] mt-0.5 font-light tracking-[0.25em]">SOLUTIONS</p>
          </div>
        </div>
        <button className="md:hidden text-slate-400 hover:text-white" onClick={onClose}>
          <X className="w-6 h-6" />
        </button>
      </div>
      <div className="mx-6 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto custom-scrollbar mt-2">
        <p className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-600 px-4 mb-3">Main Menu</p>
        {NAV.map((item, i) => (
          <NavLink
            key={item.name}
            to={item.path}
            onClick={onClose}
            end={item.path === '/'}
            className={({ isActive }) =>
              `group flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600/20 to-violet-600/10 text-blue-300 shadow-sm'
                  : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg transition-all duration-200 ${
                    isActive ? 'bg-blue-500/20 text-blue-400' : 'text-slate-600 group-hover:text-slate-400'
                  }`}>
                    <item.icon className="w-4 h-4" />
                  </div>
                  <span>{item.name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {item.badge && (
                    <span className="text-[0.65rem] font-bold bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-blue-400 opacity-70" />}
                </div>
              </>
            )}
          </NavLink>
        ))}

        <div className="my-3 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <p className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-600 px-4 mb-3">System</p>

        <NavLink
          to="/settings"
          onClick={onClose}
          className={({ isActive }) =>
            `group flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              isActive ? 'bg-white/10 text-slate-200' : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'
            }`
          }
        >
          <div className="p-1.5 rounded-lg text-slate-600 group-hover:text-slate-400 transition-colors">
            <Settings className="w-4 h-4" />
          </div>
          Settings
        </NavLink>

        {user?.role === 'Admin' && (
          <NavLink
            to="/admin"
            onClick={onClose}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive ? 'bg-white/10 text-slate-200' : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'
              }`
            }
          >
            <div className="p-1.5 rounded-lg text-slate-600 group-hover:text-slate-400 transition-colors">
              <Shield className="w-4 h-4" />
            </div>
            Admin Panel
          </NavLink>
        )}
      </nav>

      {/* User Profile Card */}
      <div className="p-3 mt-auto">
        <div className="p-3 rounded-xl bg-white/5 border border-white/8 flex items-center gap-3">
          {/* Avatar */}
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {(user?.username?.[0] || 'A').toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-slate-200 text-sm font-semibold truncate">{user?.username || 'Admin'}</p>
            <p className="text-slate-500 text-xs">{user?.role || 'User'}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Log out"
            className="p-1.5 rounded-lg text-slate-600 hover:text-rose-400 hover:bg-rose-400/10 transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.aside>
  );
}
