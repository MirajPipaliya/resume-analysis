import { useState } from 'react';
import Button from '../components/ui/Button';
import { motion } from 'framer-motion';
import { Save, CheckCircle2 } from 'lucide-react';

function Toggle({ enabled, onChange }) {
  return (
    <div 
      onClick={onChange}
      className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors duration-300 ${enabled ? 'bg-blue-600' : 'bg-slate-300'}`}
    >
      <motion.div 
        initial={false}
        animate={{ x: enabled ? 24 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"
      />
    </div>
  );
}

export default function Settings() {
  const [strictScoring, setStrictScoring] = useState(false);
  const [autoGenQuestions, setAutoGenQuestions] = useState(true);
  const [darkTheme, setDarkTheme] = useState(false);
  
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // Simulate saving
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-1">Manage system preferences and configurations</p>
      </div>

      <div className="glass-panel p-8">
        <h3 className="text-lg font-bold mb-4 border-b border-slate-100 pb-3 text-slate-800">AI Preferences</h3>
        
        <div className="space-y-4 mb-10">
          <div className="flex justify-between items-center p-4 bg-slate-50/80 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
            <div>
              <p className="font-semibold text-slate-900">Strict Match Scoring</p>
              <p className="text-sm text-slate-500 mt-0.5">Penalize candidates more heavily for missing required skills</p>
            </div>
            <Toggle enabled={strictScoring} onChange={() => setStrictScoring(!strictScoring)} />
          </div>
          
          <div className="flex justify-between items-center p-4 bg-slate-50/80 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
            <div>
              <p className="font-semibold text-slate-900">Auto-Generate Interview Questions</p>
              <p className="text-sm text-slate-500 mt-0.5">Generate questions immediately after parsing instead of manual trigger</p>
            </div>
            <Toggle enabled={autoGenQuestions} onChange={() => setAutoGenQuestions(!autoGenQuestions)} />
          </div>
        </div>

        <h3 className="text-lg font-bold mb-4 border-b border-slate-100 pb-3 text-slate-800">Appearance</h3>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 bg-slate-50/80 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
            <div>
              <p className="font-semibold text-slate-900">Dark Mode (Coming Soon)</p>
              <p className="text-sm text-slate-500 mt-0.5">Switch the dashboard to a dark color palette</p>
            </div>
            <Toggle enabled={darkTheme} onChange={() => setDarkTheme(!darkTheme)} />
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-100 flex items-center justify-between">
          <div className="text-sm">
            {saved ? (
              <span className="flex items-center text-emerald-600 font-medium">
                <CheckCircle2 className="w-4 h-4 mr-1.5" /> Preferences saved successfully
              </span>
            ) : (
              <span className="text-slate-400">Unsaved changes will be lost</span>
            )}
          </div>
          <Button onClick={handleSave} className="shadow-sm">
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
