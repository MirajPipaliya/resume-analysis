import { useState } from 'react';
import Button from '../components/ui/Button';
import { motion } from 'framer-motion';
import { Save, CheckCircle2, Sliders, Palette, BrainCircuit } from 'lucide-react';

function Toggle({ enabled, onChange, id }) {
  return (
    <button
      id={id}
      role="switch"
      aria-checked={enabled}
      onClick={onChange}
      className={`w-12 h-6 rounded-full relative transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400/40 focus:ring-offset-1 ${
        enabled ? 'bg-gradient-to-r from-blue-500 to-indigo-500 shadow-md shadow-blue-500/30' : 'bg-slate-200'
      }`}
    >
      <motion.div
        initial={false}
        animate={{ x: enabled ? 24 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
      />
    </button>
  );
}

function SettingRow({ label, description, enabled, onChange, id }) {
  return (
    <div className="flex items-center justify-between gap-6 p-4 rounded-xl bg-white/70 border border-slate-100 hover:border-blue-100 hover:bg-white/90 transition-all group">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 leading-tight">{label}</p>
        <p className="text-sm text-slate-500 mt-1 leading-relaxed">{description}</p>
      </div>
      <div className="flex-shrink-0">
        <Toggle id={id} enabled={enabled} onChange={onChange} />
      </div>
    </div>
  );
}

function SectionHeader({ icon: Icon, label, color }) {
  return (
    <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-100">
      <div className={`p-2 rounded-xl ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <h3 className="text-base font-bold text-slate-800">{label}</h3>
    </div>
  );
}

export default function Settings() {
  const [strictScoring,     setStrictScoring]     = useState(false);
  const [autoGenQuestions,  setAutoGenQuestions]  = useState(true);
  const [darkTheme,         setDarkTheme]         = useState(false);
  const [saved,             setSaved]             = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Header */}
      <div className="page-header">
        <h1>Settings</h1>
        <p>Manage preferences, AI behavior, and display options</p>
      </div>

      {/* AI Preferences */}
      <div className="glass-panel p-6">
        <SectionHeader icon={BrainCircuit} label="AI Preferences" color="bg-blue-100 text-blue-600" />
        <div className="space-y-3">
          <SettingRow
            id="strict-scoring"
            label="Strict Match Scoring"
            description="Penalize candidates more heavily for missing required skills in the job description."
            enabled={strictScoring}
            onChange={() => setStrictScoring(!strictScoring)}
          />
          <SettingRow
            id="auto-gen-questions"
            label="Auto-Generate Interview Questions"
            description="Trigger question generation immediately after resume parsing completes, rather than manually."
            enabled={autoGenQuestions}
            onChange={() => setAutoGenQuestions(!autoGenQuestions)}
          />
        </div>
      </div>

      {/* Analysis Display */}
      <div className="glass-panel p-6">
        <SectionHeader icon={Sliders} label="Analysis Display" color="bg-violet-100 text-violet-600" />
        <div className="space-y-3">
          <SettingRow
            id="dark-theme"
            label="Dark Mode (Coming Soon)"
            description="Switch the entire dashboard to a dark color palette for reduced eye strain."
            enabled={darkTheme}
            onChange={() => setDarkTheme(!darkTheme)}
          />
        </div>
      </div>

      {/* Save */}
      <div className="glass-panel px-6 py-5 flex items-center justify-between">
        <div className="text-sm">
          {saved ? (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-1.5 text-emerald-600 font-semibold"
            >
              <CheckCircle2 className="w-4 h-4" />
              Preferences saved!
            </motion.span>
          ) : (
            <span className="text-slate-400 text-sm">Changes won't take effect until saved.</span>
          )}
        </div>
        <Button onClick={handleSave} size="md">
          <Save className="w-4 h-4" />
          Save Settings
        </Button>
      </div>
    </div>
  );
}
