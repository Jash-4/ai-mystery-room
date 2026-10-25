import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Terminal, 
  Sparkles, 
  Cpu, 
  Layers, 
  AlertCircle, 
  ArrowRight
} from 'lucide-react';
import { createCase } from '../services/api';

const PRESETS = [
  {
    title: 'Stolen Neural Weights',
    premise: 'A multi-billion dollar frontier AI model weights artifact was exfiltrated from an air-gapped quantum research cleanroom in Zurich during a simulated network failure.',
    difficulty: 'medium',
  },
  {
    title: 'Autonomous Grid Sabotage',
    premise: 'The automated hydroelectric power grid governing New Chicago was hijacked by a logic bomb. Three senior network engineers were present with administrative override tokens.',
    difficulty: 'hard',
  },
  {
    title: 'Corporate Insider Breach',
    premise: 'An unreleased biometric encryption algorithm was leaked onto a darknet mirror. The security audit narrows down access to the lead cryptographer, security chief, and operations officer.',
    difficulty: 'easy',
  },
  {
    title: 'Venetian Masquerade Heist',
    premise: 'An antique diamond necklace was replaced with a synthetic replica during a private masquerade ball at Palazzo Bellini.',
    difficulty: 'easy',
  },
];

const SCANNING_STEPS = [
  'INITIALIZING QUANTUM ENCRYPTION TUNNEL...',
  'CONNECTING TO GOOGLE GEMINI NEURAL SUBSYSTEM...',
  'FABRICATING SUSPECT DOSSIERS & TIMELINE ALIBIS...',
  'SYNTHESIZING CRYPTOGRAPHIC CLUES & CORRUPTED LOGS...',
  'CONSTRUCTING PROGRESSIVE DECRYPTION HINTS...',
  'SEALING CONFIDENTIAL CULPRIT TELEMETRY AT SERVER...',
  'DISPATCHING FORENSIC INVESTIGATOR TO INCIDENT SCENE...',
];

export default function CreateCase() {
  const navigate = useNavigate();
  const [premise, setPremise] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [isGenerating, setIsGenerating] = useState(false);
  const [scanStepIndex, setScanStepIndex] = useState(0);
  const [error, setError] = useState(null);

  // Cycling terminal animation steps during generation
  useEffect(() => {
    let timer;
    if (isGenerating) {
      timer = setInterval(() => {
        setScanStepIndex((prev) => (prev + 1) % SCANNING_STEPS.length);
      }, 2400);
    }
    return () => clearInterval(timer);
  }, [isGenerating]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!premise.trim()) {
      setError('Please provide an incident premise or choose a quick-start preset.');
      return;
    }

    try {
      setError(null);
      setIsGenerating(true);
      const data = await createCase(premise.trim(), difficulty);

      if (data.success && data.case) {
        const caseId = data.case._id || data.case.id;
        navigate(`/case/${caseId}`);
      } else {
        throw new Error(data.error || 'Failed to generate mystery case.');
      }
    } catch (err) {
      console.error('Case generation error:', err);
      setError(err.response?.data?.error || err.message || 'Server error generating case.');
      setIsGenerating(false);
    }
  };

  const applyPreset = (preset) => {
    setPremise(preset.premise);
    setDifficulty(preset.difficulty);
    setError(null);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] cyber-grid scanline py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Terminal Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-500/30 text-cyan-400">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-mono font-bold text-slate-100 uppercase tracking-wider">
              Commission New Incident
            </h1>
            <p className="text-xs sm:text-sm font-mono text-slate-400">
              SYNTHESIZE PROCEDURAL FORENSIC CASE VIA GEMINI ENGINE
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 mb-6 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-sm font-mono flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold">SYSTEM ERROR:</span> {error}
            </div>
          </div>
        )}

        {isGenerating ? (
          /* Active Synthesis Loader Terminal */
          <div className="p-8 sm:p-12 rounded-2xl bg-slate-900/90 border border-cyan-500/40 glow-cyan backdrop-blur-xl">
            <div className="flex flex-col items-center justify-center text-center max-w-lg mx-auto">
              
              <div className="relative mb-8">
                <div className="w-20 h-20 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                  <Cpu className="w-10 h-10 animate-pulse text-cyan-400" />
                </div>
                <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-cyan-500"></span>
                </span>
              </div>

              <h2 className="text-xl font-mono font-bold text-slate-100 tracking-wider mb-2">
                SYNTHESIZING DIGITAL EVIDENCE
              </h2>
              
              <p className="text-sm font-mono text-cyan-400 h-6 mb-6">
                &gt; {SCANNING_STEPS[scanStepIndex]}
              </p>

              {/* Progress Bar simulation */}
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800 mb-6">
                <div 
                  className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(95, ((scanStepIndex + 1) / SCANNING_STEPS.length) * 100)}%` }}
                />
              </div>

              <p className="text-xs font-mono text-slate-500">
                Please remain on this frequency. Gemini is creating an airtight logic chain, suspect alibis, and forensic clues.
              </p>
            </div>
          </div>
        ) : (
          /* Form Setup */
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Quickstart Presets */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
              <div className="flex items-center space-x-2 mb-3">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                  Preset Incident Vectors (Quick Start)
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => applyPreset(p)}
                    className="p-3 text-left rounded-xl bg-slate-950/70 border border-slate-800 hover:border-cyan-500/40 hover:bg-slate-950 transition-all group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono font-bold text-slate-200 group-hover:text-cyan-300">
                        {p.title}
                      </span>
                      <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                        {p.difficulty}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2">
                      {p.premise}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Premise */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
              <label 
                htmlFor="premise"
                className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-2"
              >
                Incident Brief / Custom Crime Premise
              </label>
              <textarea
                id="premise"
                rows={4}
                value={premise}
                onChange={(e) => setPremise(e.target.value)}
                placeholder="Enter any crime scenario: e.g., 'An autonomous drone fleet carrying confidential payload crashes in Tokyo bay with evidence of GPS spoofing...'"
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700/80 text-slate-100 placeholder-slate-500 font-mono text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all resize-none"
              />
              <span className="text-[11px] font-mono text-slate-500 mt-2 block">
                The Gemini engine will tailor all suspects, alibis, clues, and solution logic to this narrative.
              </span>
            </div>

            {/* Difficulty Selector */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
              <div className="flex items-center space-x-2 mb-4">
                <Layers className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                  Select Investigation Protocol (Difficulty)
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Easy */}
                <div
                  onClick={() => setDifficulty('easy')}
                  className={`p-4 rounded-xl cursor-pointer border transition-all ${
                    difficulty === 'easy'
                      ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300 glow-emerald'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm font-bold uppercase text-slate-100">
                      Standard Audit (Easy)
                    </span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/30 text-emerald-400">
                      100 PTS
                    </span>
                  </div>
                  <ul className="text-xs font-mono space-y-1 text-slate-400">
                    <li>• 3 Prime Suspects</li>
                    <li>• 5 Forensic Clues</li>
                    <li>• 2 Decryption Hints</li>
                  </ul>
                </div>

                {/* Medium */}
                <div
                  onClick={() => setDifficulty('medium')}
                  className={`p-4 rounded-xl cursor-pointer border transition-all ${
                    difficulty === 'medium'
                      ? 'bg-cyan-950/40 border-cyan-500 text-cyan-300 glow-cyan'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm font-bold uppercase text-slate-100">
                      Deep Threat (Medium)
                    </span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/30 text-cyan-400">
                      150 PTS
                    </span>
                  </div>
                  <ul className="text-xs font-mono space-y-1 text-slate-400">
                    <li>• 4 Prime Suspects</li>
                    <li>• 7 Forensic Clues</li>
                    <li>• 3 Decryption Hints</li>
                  </ul>
                </div>

                {/* Hard */}
                <div
                  onClick={() => setDifficulty('hard')}
                  className={`p-4 rounded-xl cursor-pointer border transition-all ${
                    difficulty === 'hard'
                      ? 'bg-rose-950/40 border-rose-500 text-rose-300 glow-rose'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm font-bold uppercase text-slate-100">
                      Blackout Protocol (Hard)
                    </span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-rose-950 border border-rose-500/30 text-rose-400">
                      200 PTS
                    </span>
                  </div>
                  <ul className="text-xs font-mono space-y-1 text-slate-400">
                    <li>• 5 Prime Suspects</li>
                    <li>• 9 Forensic Clues</li>
                    <li>• 3 Decryption Hints</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <div className="flex items-center justify-end">
              <button
                type="submit"
                disabled={isGenerating}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-sm tracking-widest uppercase transition-all glow-cyan flex items-center justify-center space-x-2 transform hover:-translate-y-0.5 disabled:opacity-50"
              >
                <span>COMMISSION INCIDENT</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
