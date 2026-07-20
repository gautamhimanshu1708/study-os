import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, SkipForward, X, Clock, Target, Settings2 } from 'lucide-react';
import api from '../../api/axiosInstance';
import toast from 'react-hot-toast';

const MODES = {
  Classic: { study: 25, break: 5 },
  'Deep Work': { study: 50, break: 10 },
  Custom: { study: 25, break: 5 },
};

export default function PomodoroTimer({ isOpen, onClose }) {
  const [mode, setMode] = useState('Classic');
  const [isStudyPhase, setIsStudyPhase] = useState(true);
  const [timeLeft, setTimeLeft] = useState(MODES.Classic.study * 60);
  const [isActive, setIsActive] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [customStudy, setCustomStudy] = useState(25);
  const [customBreak, setCustomBreak] = useState(5);
  
  const [sessionStartTime, setSessionStartTime] = useState(null);

  const timerRef = useRef(null);
  
  const totalTime = isStudyPhase 
    ? (mode === 'Custom' ? customStudy : MODES[mode].study) * 60
    : (mode === 'Custom' ? customBreak : MODES[mode].break) * 60;

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      handlePhaseComplete();
    }
    return () => clearInterval(timerRef.current);
  }, [isActive, timeLeft]);

  const handlePhaseComplete = async () => {
    clearInterval(timerRef.current);
    
    if (isStudyPhase) {
      // Study session completed
      const endTime = new Date();
      const startTime = sessionStartTime || new Date(endTime.getTime() - totalTime * 1000);
      const durationMins = Math.round(totalTime / 60);

      try {
        await api.post('/api/study-sessions', {
          duration: durationMins,
          studyStartTime: startTime.toISOString(),
          studyEndTime: endTime.toISOString(),
          pomodoroMode: mode,
          subject: 'General Study' // could be dynamic
        });
        toast.success(`Session Completed! You studied for ${durationMins} minutes.`, {
          // using default success icon
          style: { borderRadius: '10px', background: '#1e1e30', color: '#e2e8f0' }
        });
      } catch (err) {
        toast.error('Failed to log study session.');
      }
      
      setIsStudyPhase(false);
      setTimeLeft((mode === 'Custom' ? customBreak : MODES[mode].break) * 60);
      setIsActive(true); // auto-start break
    } else {
      // Break completed
      toast.success('Break time is over! Ready to focus?');
      setIsStudyPhase(true);
      setTimeLeft((mode === 'Custom' ? customStudy : MODES[mode].study) * 60);
      setIsActive(false); // wait for user to start next session
    }
  };

  const toggleTimer = () => {
    if (!isActive && isStudyPhase && timeLeft === totalTime) {
      setSessionStartTime(new Date());
    }
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsStudyPhase(true);
    setSessionStartTime(null);
    setTimeLeft((mode === 'Custom' ? customStudy : MODES[mode].study) * 60);
  };

  const skipPhase = () => {
    if (isStudyPhase) {
       // Skip study without logging (or ask for confirmation?)
       toast('Skipped study session.');
       setIsStudyPhase(false);
       setTimeLeft((mode === 'Custom' ? customBreak : MODES[mode].break) * 60);
       setIsActive(false);
    } else {
       toast('Skipped break.');
       setIsStudyPhase(true);
       setTimeLeft((mode === 'Custom' ? customStudy : MODES[mode].study) * 60);
       setIsActive(false);
    }
  };

  const changeMode = (newMode) => {
    setMode(newMode);
    setIsActive(false);
    setIsStudyPhase(true);
    setSessionStartTime(null);
    if (newMode === 'Custom') {
      setTimeLeft(customStudy * 60);
    } else {
      setTimeLeft(MODES[newMode].study * 60);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const strokeDashoffset = ((totalTime - timeLeft) / totalTime) * 283;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />
      
      {/* Timer Card - Glassmorphism */}
      <div className="relative w-full max-w-sm glass-card bg-base-800/80 p-6 rounded-3xl shadow-2xl border border-white/10 flex flex-col items-center animate-fade-in-up">
        
        {/* Header */}
        <div className="w-full flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Clock size={20} className="text-primary-400" />
            <h2 className="text-lg font-semibold text-white tracking-wide">Focus Timer</h2>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowSettings(!showSettings)} className="text-text-muted hover:text-white transition-colors">
              <Settings2 size={18} />
            </button>
            <button onClick={onClose} className="text-text-muted hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Mode Selector */}
        {!showSettings && (
          <div className="flex gap-2 p-1 bg-black/20 rounded-full mb-8 border border-white/5">
            {Object.keys(MODES).map((m) => (
              <button
                key={m}
                onClick={() => changeMode(m)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                  mode === m 
                    ? 'bg-primary-500/80 text-white shadow-glow-sm' 
                    : 'text-text-secondary hover:text-white'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        )}

        {/* Settings Panel */}
        {showSettings && (
          <div className="w-full mb-8 p-4 bg-black/20 rounded-2xl border border-white/5">
            <h3 className="text-sm font-medium text-white mb-4">Custom Mode Settings</h3>
            <div className="flex justify-between gap-4 mb-3">
              <div className="flex-1 flex flex-col gap-1">
                <label className="text-xs text-text-muted">Study (min)</label>
                <input 
                  type="number" 
                  value={customStudy}
                  onChange={(e) => {
                    const val = Math.max(1, parseInt(e.target.value) || 1);
                    setCustomStudy(val);
                    if (mode === 'Custom' && isStudyPhase) setTimeLeft(val * 60);
                  }}
                  className="bg-base-900 border border-border rounded-xl px-3 py-1.5 text-white text-sm focus:outline-none focus:border-primary-500"
                />
              </div>
              <div className="flex-1 flex flex-col gap-1">
                <label className="text-xs text-text-muted">Break (min)</label>
                <input 
                  type="number" 
                  value={customBreak}
                  onChange={(e) => {
                    const val = Math.max(1, parseInt(e.target.value) || 1);
                    setCustomBreak(val);
                    if (mode === 'Custom' && !isStudyPhase) setTimeLeft(val * 60);
                  }}
                  className="bg-base-900 border border-border rounded-xl px-3 py-1.5 text-white text-sm focus:outline-none focus:border-primary-500"
                />
              </div>
            </div>
            <button 
              onClick={() => { setShowSettings(false); changeMode('Custom'); }}
              className="w-full py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-sm font-medium transition-colors"
            >
              Apply Settings
            </button>
          </div>
        )}

        {/* Circular Timer */}
        {!showSettings && (
          <div className="relative w-48 h-48 mb-8 flex items-center justify-center">
            {/* SVG Ring */}
            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
              {/* Background Ring */}
              <circle
                cx="96" cy="96" r="45"
                className="stroke-base-700 fill-none"
                strokeWidth="6"
              />
              {/* Progress Ring */}
              <circle
                cx="96" cy="96" r="45"
                className={`fill-none transition-all duration-1000 ease-linear ${isStudyPhase ? 'stroke-primary-500' : 'stroke-success'}`}
                strokeWidth="6"
                strokeDasharray="283"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{
                  filter: `drop-shadow(0 0 8px ${isStudyPhase ? 'rgba(99,102,241,0.5)' : 'rgba(34,197,94,0.5)'})`
                }}
              />
            </svg>
            
            {/* Time Text */}
            <div className="flex flex-col items-center z-10">
              <span className="text-4xl font-light text-white tracking-wider mb-1">
                {formatTime(timeLeft)}
              </span>
              <span className={`text-xs font-medium uppercase tracking-widest ${isStudyPhase ? 'text-primary-400' : 'text-success'}`}>
                {isStudyPhase ? 'Focus' : 'Break'}
              </span>
            </div>
          </div>
        )}

        {/* Controls */}
        {!showSettings && (
          <div className="flex items-center gap-6">
            <button 
              onClick={resetTimer}
              className="p-3 text-text-muted hover:text-white hover:bg-white/10 rounded-full transition-all"
            >
              <RotateCcw size={22} />
            </button>
            
            <button 
              onClick={toggleTimer}
              className={`p-4 rounded-full shadow-glow-sm transition-all duration-300 transform hover:scale-105 ${
                isActive 
                  ? 'bg-base-600 text-primary-400 border border-primary-500/30' 
                  : 'bg-primary-600 text-white hover:bg-primary-500'
              }`}
            >
              {isActive ? <Pause size={28} className="fill-current" /> : <Play size={28} className="fill-current ml-1" />}
            </button>
            
            <button 
              onClick={skipPhase}
              className="p-3 text-text-muted hover:text-white hover:bg-white/10 rounded-full transition-all"
            >
              <SkipForward size={22} />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
