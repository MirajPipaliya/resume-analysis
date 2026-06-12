import { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, CheckCircle2, Cpu, SlidersHorizontal } from 'lucide-react';
import Button from '../components/ui/Button';

function Toggle({ enabled, onChange }) {
  return (
    <button
      onClick={onChange}
      role="switch"
      aria-checked={enabled}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex-shrink-0 ${
        enabled ? 'bg-blue-600' : 'bg-gray-200'
      }`}
    >
      <motion.span
        className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm"
        animate={{ x: enabled ? 20 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
      />
    </button>
  );
}

function SettingRow({ label, description, enabled, onChange }) {
  return (
    <div className="flex items-start justify-between gap-6 py-4 border-b border-gray-100 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{description}</p>
      </div>
      <div className="pt-0.5">
        <Toggle enabled={enabled} onChange={onChange} />
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, children, iconColor = 'text-blue-600', iconBg = 'bg-blue-50' }) {
  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
        <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}>
          <Icon size={16} className={iconColor} />
        </div>
        <h3>{title}</h3>
      </div>
      {children}
    </div>
  );
}

export default function Settings() {
  const [strict,    setStrict]    = useState(false);
  const [autoQ,     setAutoQ]     = useState(true);
  const [darkMode,  setDarkMode]  = useState(false);
  const [saved,     setSaved]     = useState(false);

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 3000); };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="mb-1">
        <h1 className="mb-1">Settings</h1>
        <p className="text-sm text-gray-500">Manage AI behavior and display preferences</p>
      </div>

      <Section icon={Cpu} title="AI Preferences">
        <SettingRow
          label="Strict Match Scoring"
          description="Penalize candidates more heavily for each missing required skill. Recommended for specialized roles."
          enabled={strict}
          onChange={() => setStrict(v => !v)}
        />
        <SettingRow
          label="Auto-Generate Interview Questions"
          description="Automatically trigger question generation after resume parsing completes, without manual action."
          enabled={autoQ}
          onChange={() => setAutoQ(v => !v)}
        />
      </Section>

      <Section icon={SlidersHorizontal} title="Appearance" iconColor="text-violet-600" iconBg="bg-violet-50">
        <SettingRow
          label="Dark Mode"
          description="Switch to a dark color palette. Coming in the next release."
          enabled={darkMode}
          onChange={() => setDarkMode(v => !v)}
        />
      </Section>

      {/* Save bar */}
      <div className="card px-5 py-4 flex items-center justify-between">
        <div className="text-sm">
          {saved
            ? (
              <motion.span
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-1.5 text-green-600 font-semibold"
              >
                <CheckCircle2 size={15} /> Saved successfully
              </motion.span>
            )
            : <span className="text-gray-400">Unsaved changes will be lost on reload.</span>
          }
        </div>
        <Button onClick={save}>
          <Save size={15} /> Save Settings
        </Button>
      </div>
    </div>
  );
}
