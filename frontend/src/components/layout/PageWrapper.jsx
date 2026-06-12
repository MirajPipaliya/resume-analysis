import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, BellDot, Calendar } from 'lucide-react';

export default function PageWrapper() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #f8f6ff 100%)' }}>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 z-40 md:hidden backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div className={`fixed md:sticky top-0 left-0 h-screen z-50 transform transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0`}>
        <Sidebar onClose={() => setIsMobileMenuOpen(false)} />
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto h-screen w-full min-w-0">
        {/* Top bar */}
        <div
          className="sticky top-0 z-30 px-5 md:px-8 py-3.5 flex items-center justify-between"
          style={{
            background: 'rgba(240,244,255,0.88)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderBottom: '1px solid rgba(226,232,240,0.55)',
          }}
        >
          {/* Left side */}
          <div className="flex items-center gap-3">
            <button
              className="md:hidden w-9 h-9 flex items-center justify-center text-slate-600 hover:bg-slate-200/80 rounded-xl transition-all"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-slate-400">
              <Calendar className="w-3.5 h-3.5" />
              <span className="text-xs font-medium tracking-wide">{today}</span>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-700">All systems live</span>
            </div>
            <button className="relative w-9 h-9 flex items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-white/80 rounded-xl transition-all border border-transparent hover:border-slate-200">
              <BellDot className="w-4.5 h-4.5 w-[18px] h-[18px]" />
            </button>
          </div>
        </div>

        {/* Page content */}
        <div className="p-5 md:p-8 pb-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
