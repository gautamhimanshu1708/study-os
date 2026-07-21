import { useState } from 'react';
import { Play, Pause, RotateCcw, SkipForward, Clock, Settings2, Flame, BarChart2, CheckCircle2 } from 'lucide-react';
import { useTimer } from '../../context/TimerContext';

export default function FocusTimerPage() {
  const {
    mode,
    MODES,
    isStudyPhase,
    isActive,
    timeLeft,
    totalDuration,
    customStudy,
    customBreak,
    stats,
    streak,
    toggleTimer,
    resetTimer,
    skipPhase,
    changeMode,
    updateCustomSettings,
    formatTime,
  } = useTimer();

  const [showSettings, setShowSettings] = useState(false);
  const [tempStudy, setTempStudy] = useState(customStudy);
  const [tempBreak, setTempBreak] = useState(customBreak);

  const handleApplySettings = () => {
    updateCustomSettings(tempStudy, tempBreak);
    changeMode('Custom');
    setShowSettings(false);
  };

  const progress = totalDuration > 0 ? ((totalDuration - timeLeft) / totalDuration) : 0;
  const circumference = 2 * Math.PI * 120;
  const dashOffset = circumference * (1 - progress);

  const formatHours = (h) => {
    if (h === undefined || h === null) return '0m';
    const totalMins = Math.round(h * 60);
    if (totalMins <= 0) return '0m';
    const hrs = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    return hrs > 0 ? (mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`) : `${mins}m`;
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1440px] mx-auto space-y-6 pb-24 md:pb-12 animate-fade-in">
      <div className="grid lg:grid-cols-3 gap-6">

        {/* ── Main Timer Card ────────────────────────────────────── */}
        <div className="lg:col-span-2 glass-card p-8 flex flex-col items-center animate-fade-in-up">

          {/* Mode Selector */}
          <div className="flex gap-2 p-1 bg-surface-secondary rounded-full mb-8 border border-border">
            {Object.keys(MODES).map(m => (
              <button
                key={m}
                onClick={() => changeMode(m)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  mode === m
                    ? 'bg-primary-500 text-white shadow-glow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {MODES[m].label}
              </button>
            ))}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="px-3 py-2 text-text-muted hover:text-text-primary transition-colors"
              title="Timer Settings"
            >
              <Settings2 size={18} />
            </button>
          </div>

          {/* Custom Settings */}
          {showSettings && (
            <div className="w-full max-w-xs mb-8 p-4 bg-surface-secondary rounded-2xl border border-border animate-fade-in">
              <h3 className="text-sm font-medium text-text-primary mb-4">Custom Timer Settings</h3>
              <div className="flex gap-4 mb-3">
                <div className="flex-1">
                  <label className="text-xs text-text-muted mb-1 block">Study (min)</label>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={tempStudy}
                    onChange={(e) => setTempStudy(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-surface-primary border border-border rounded-xl px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-text-muted mb-1 block">Break (min)</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={tempBreak}
                    onChange={(e) => setTempBreak(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full bg-surface-primary border border-border rounded-xl px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>
              <button
                onClick={handleApplySettings}
                className="w-full py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-sm font-medium transition-colors"
              >
                Apply Custom Timer
              </button>
            </div>
          )}

          {/* Circular Timer */}
          <div className="relative w-64 h-64 md:w-72 md:h-72 mb-8 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 256 256">
              <circle cx="128" cy="128" r="120" className="fill-none stroke-surface-secondary" strokeWidth="8" />
              <circle
                cx="128" cy="128" r="120"
                className={`fill-none transition-all duration-1000 ease-linear ${isStudyPhase ? 'stroke-primary-500' : 'stroke-emerald-500'}`}
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                style={{ filter: `drop-shadow(0 0 12px ${isStudyPhase ? 'rgba(99,102,241,0.4)' : 'rgba(34,197,94,0.4)'})` }}
              />
            </svg>
            <div className="flex flex-col items-center z-10">
              <span className="text-5xl md:text-6xl font-extralight text-text-primary tracking-widest font-mono">
                {formatTime(timeLeft)}
              </span>
              <span className={`text-xs font-semibold uppercase tracking-[0.25em] mt-2 ${isStudyPhase ? 'text-primary-400' : 'text-emerald-400'}`}>
                {isStudyPhase ? 'Focus' : 'Break'}
              </span>
              <span className="text-[11px] text-text-muted mt-1">{MODES[mode]?.label}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-6">
            <button
              onClick={resetTimer}
              className="p-3 text-text-muted hover:text-text-primary hover:bg-surface-hover rounded-full transition-all"
              title="Reset"
            >
              <RotateCcw size={24} />
            </button>

            <button
              onClick={toggleTimer}
              className={`p-5 rounded-full shadow-glow transition-all duration-300 transform hover:scale-105 ${
                isActive
                  ? 'bg-surface-secondary text-primary-400 border border-primary-500/30'
                  : 'bg-primary-600 text-white hover:bg-primary-500'
              }`}
              title={isActive ? 'Pause' : 'Start'}
            >
              {isActive ? <Pause size={32} className="fill-current" /> : <Play size={32} className="fill-current ml-1" />}
            </button>

            <button
              onClick={skipPhase}
              className="p-3 text-text-muted hover:text-text-primary hover:bg-surface-hover rounded-full transition-all"
              title="Skip"
            >
              <SkipForward size={24} />
            </button>
          </div>
        </div>

        {/* ── Side Stats ─────────────────────────────────────────── */}
        <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
          {/* Today's Stats */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2 mb-4">
              <Clock size={16} className="text-primary-400" /> Today's Progress
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-text-muted">Study Time</span>
                <span className="text-sm font-bold text-text-primary">{formatHours(stats?.todayStudyHours)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-text-muted">Sessions</span>
                <span className="text-sm font-bold text-text-primary">{stats?.totalSessionsCompleted || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-text-muted">Deep Work</span>
                <span className="text-sm font-bold text-primary-400">{formatHours(stats?.totalDeepWorkHours)}</span>
              </div>
            </div>
          </div>

          {/* Weekly Stats */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2 mb-4">
              <BarChart2 size={16} className="text-accent-500" /> Weekly Summary
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-text-muted">This Week</span>
                <span className="text-sm font-bold text-text-primary">{formatHours(stats?.weeklyStudyHours)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-text-muted">This Month</span>
                <span className="text-sm font-bold text-text-primary">{formatHours(stats?.monthlyStudyHours)}</span>
              </div>
              <div className="w-full bg-surface-secondary rounded-full h-2 mt-2">
                <div className="bg-gradient-brand h-2 rounded-full transition-all" style={{ width: `${Math.min(100, ((stats?.weeklyStudyHours || 0) / 28) * 100)}%` }} />
              </div>
              <p className="text-[10px] text-text-muted text-right">{formatHours(stats?.weeklyStudyHours)} / 28h target</p>
            </div>
          </div>

          {/* Streak */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2 mb-4">
              <Flame size={16} className="text-orange-400" /> Study Streak
            </h3>
            <div className="flex gap-4">
              <div className="flex-1 text-center bg-surface-secondary rounded-xl p-3 border border-border">
                <p className="text-2xl font-bold text-orange-400">{streak.current}</p>
                <p className="text-[10px] text-text-muted">Current</p>
              </div>
              <div className="flex-1 text-center bg-surface-secondary rounded-xl p-3 border border-border">
                <p className="text-2xl font-bold text-amber-400">{streak.best}</p>
                <p className="text-[10px] text-text-muted">Best</p>
              </div>
            </div>
          </div>

          {/* XP */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2 mb-3">
              <CheckCircle2 size={16} className="text-emerald-400" /> XP Earned
            </h3>
            <p className="text-3xl font-bold text-gradient">
              {Math.round(((stats?.todayStudyHours || 0) * 60 / 25) * 50 + ((stats?.monthlyStudyHours || 0) * 60 / 25) * 2)} XP
            </p>
            <p className="text-[10px] text-text-muted mt-1">25 min = 50 XP</p>
          </div>
        </div>
      </div>
    </div>
  );
}
