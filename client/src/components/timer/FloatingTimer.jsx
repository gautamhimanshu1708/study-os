import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Play, Pause, RotateCcw, SkipForward, Maximize2, ChevronDown, ChevronUp, Timer } from 'lucide-react';
import { useTimer } from '../../context/TimerContext';

const FloatingTimer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const {
    mode,
    MODES,
    isStudyPhase,
    isActive,
    timeLeft,
    totalDuration,
    toggleTimer,
    resetTimer,
    skipPhase,
    formatTime,
  } = useTimer();

  // Hide floating timer if user is already on the dedicated /focus page
  if (location.pathname === '/focus') {
    return null;
  }

  const progress = totalDuration > 0 ? ((totalDuration - timeLeft) / totalDuration) * 100 : 0;
  const modeLabel = MODES[mode]?.label || mode;

  return (
    <div className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-40 animate-fade-in-up select-none">
      {isCollapsed ? (
        /* ── Minimalist Collapsed Floating Pill ──────────────────────────────── */
        <button
          onClick={() => setIsCollapsed(false)}
          className={`glass-card px-3.5 py-2.5 rounded-full border shadow-2xl flex items-center gap-2.5 transition-all duration-300 hover:scale-105 ${
            isActive
              ? 'border-primary-500/40 bg-surface-primary/95 text-text-primary'
              : 'border-border bg-surface-primary/90 text-text-secondary'
          }`}
          title="Expand Focus Timer"
        >
          <span className="relative flex h-2.5 w-2.5">
            {isActive && (
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isStudyPhase ? 'bg-primary-400' : 'bg-emerald-400'
              }`} />
            )}
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
              isActive
                ? (isStudyPhase ? 'bg-primary-500' : 'bg-emerald-500')
                : 'bg-text-muted'
            }`} />
          </span>

          <span className="text-xs font-extrabold tracking-wider font-mono text-text-primary">
            {formatTime(timeLeft)}
          </span>

          <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
            isStudyPhase ? 'bg-primary-500/15 text-primary-400' : 'bg-emerald-500/15 text-emerald-400'
          }`}>
            {isStudyPhase ? 'Focus' : 'Break'}
          </span>

          <ChevronUp size={14} className="text-text-muted hover:text-text-primary ml-0.5" />
        </button>
      ) : (
        /* ── Full Floating Mini Controller ──────────────────────────────────── */
        <div className="glass-card w-72 p-4 rounded-2xl border border-primary-500/20 shadow-2xl bg-surface-primary/95 backdrop-blur-xl space-y-3">
          
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-xl border ${
                isStudyPhase
                  ? 'bg-primary-500/15 text-primary-400 border-primary-500/30'
                  : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
              }`}>
                <Timer size={14} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                  {modeLabel}
                </p>
                <p className={`text-xs font-extrabold ${isStudyPhase ? 'text-primary-400' : 'text-emerald-400'}`}>
                  {isStudyPhase ? '⚡ Focus Mode' : '☕ Rest Break'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => navigate('/focus')}
                className="p-1.5 text-text-muted hover:text-text-primary hover:bg-surface-hover rounded-lg transition-colors"
                title="Open Focus Page"
              >
                <Maximize2 size={14} />
              </button>
              <button
                onClick={() => setIsCollapsed(true)}
                className="p-1.5 text-text-muted hover:text-text-primary hover:bg-surface-hover rounded-lg transition-colors"
                title="Collapse Timer"
              >
                <ChevronDown size={14} />
              </button>
            </div>
          </div>

          {/* Time Display & Progress Bar */}
          <div className="flex items-center justify-between bg-surface-secondary/80 p-3 rounded-xl border border-border/60">
            <div>
              <span className="text-2xl font-extrabold font-mono text-text-primary tracking-wider">
                {formatTime(timeLeft)}
              </span>
              <p className="text-[10px] text-text-muted font-medium">
                {isActive ? 'Session in progress' : 'Timer paused'}
              </p>
            </div>

            <button
              onClick={toggleTimer}
              className={`p-3 rounded-xl font-bold shadow-md transition-all transform hover:scale-105 ${
                isActive
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-primary-600 text-white hover:bg-primary-500 shadow-glow-sm'
              }`}
              title={isActive ? 'Pause Timer' : 'Start Timer'}
            >
              {isActive ? <Pause size={18} className="fill-current" /> : <Play size={18} className="fill-current ml-0.5" />}
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-surface-secondary h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isStudyPhase ? 'bg-primary-500' : 'bg-emerald-400'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-between pt-1 text-xs">
            <button
              onClick={resetTimer}
              className="flex items-center gap-1.5 text-text-muted hover:text-text-primary transition-colors py-1 px-2 rounded-lg hover:bg-surface-hover"
            >
              <RotateCcw size={12} /> Reset
            </button>

            <button
              onClick={skipPhase}
              className="flex items-center gap-1.5 text-text-muted hover:text-text-primary transition-colors py-1 px-2 rounded-lg hover:bg-surface-hover"
            >
              <SkipForward size={12} /> Skip {isStudyPhase ? 'Study' : 'Break'}
            </button>
          </div>

        </div>
      )}
    </div>
  );
};

export default FloatingTimer;
