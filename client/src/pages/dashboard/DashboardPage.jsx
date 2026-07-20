import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Clock, Target, CheckSquare, Flame, Award, Zap, Timer,
  ChevronRight, Play, Pause, RotateCcw, SkipForward, Plus,
  CalendarClock, BookOpen, BarChart2, CheckCircle2, Circle,
  Sparkles, ArrowUpRight, TrendingUp, Layers, Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';
import { getStudySessionStats, logStudySession, getStudySessions } from '../../api/studySessionApi';
import { getConsistencyStats } from '../../api/consistencyApi';
import { getTasks, toggleTaskStatus } from '../../api/plannerApi';
import { getGoals } from '../../api/goalApi';
import { getDeadlines } from '../../api/deadlineApi';
import { getCourses } from '../../api/courseApi';

// ═══════════════════════════════════════════════════════════════════════════════
// XP & HELPER UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════
const calculateXP = (studyMins = 0, tasksCompleted = 0, goalsAchieved = 0, deadlinesCompleted = 0, currentStreak = 0) => {
  let xp = 0;
  xp += Math.floor(studyMins / 25) * 50;   // 25 min = 50 XP
  xp += tasksCompleted * 20;                 // task = 20 XP
  xp += goalsAchieved * 50;                  // goal = 50 XP
  xp += deadlinesCompleted * 30;             // deadline = 30 XP
  if (currentStreak >= 30) xp += 500;
  else if (currentStreak >= 7) xp += 100;
  return xp;
};

const formatHours = (h) => {
  if (!h || h === 0) return '0h 0m';
  const hrs = Math.floor(h);
  const mins = Math.round((h - hrs) * 60);
  return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
};

const getDaysLeft = (dateStr) => {
  if (!dateStr) return { text: 'No date', isOverdue: false, isToday: false };
  const target = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diffTime = target - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return { text: 'Overdue', isOverdue: true, isToday: false };
  if (diffDays === 0) return { text: 'Today', isOverdue: false, isToday: true };
  return { text: `${diffDays}d left`, isOverdue: false, isToday: false };
};

const TIMER_MODES = {
  POMODORO: { name: '25/5 Classic', workMins: 25, breakMins: 5 },
  DEEP_WORK: { name: '50/10 Deep', workMins: 50, breakMins: 10 },
  CUSTOM:    { name: 'Custom',        workMins: 30, breakMins: 5 },
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN DASHBOARD COMPONENT (65 / 35 LAYOUT)
// ═══════════════════════════════════════════════════════════════════════════════
const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Core App Data States
  const [studyStats, setStudyStats] = useState(null);
  const [recentSessions, setRecentSessions] = useState([]);
  const [streakData, setStreakData] = useState({ currentStreak: 0, bestStreak: 0 });
  const [tasks, setTasks] = useState([]);
  const [goals, setGoals] = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Focus Timer States
  const [modeKey, setModeKey] = useState('POMODORO');
  const [customWork, setCustomWork] = useState(30);
  const [customBreak, setCustomBreak] = useState(5);
  const [isBreak, setIsBreak] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  // ── Fetch Dashboard Data ──────────────────────────────────────────────────
  const fetchDashboardData = useCallback(async () => {
    try {
      const [sessionRes, streakRes, taskRes, goalRes, deadlineRes, courseRes, allSessionsRes] = await Promise.allSettled([
        getStudySessionStats(),
        getConsistencyStats(),
        getTasks(),
        getGoals(),
        getDeadlines(),
        getCourses(),
        getStudySessions(),
      ]);

      if (sessionRes.status === 'fulfilled') setStudyStats(sessionRes.value.data);
      if (streakRes.status === 'fulfilled') setStreakData(streakRes.value.data || { currentStreak: 0, bestStreak: 0 });
      if (taskRes.status === 'fulfilled') setTasks(taskRes.value.data || []);
      if (goalRes.status === 'fulfilled') setGoals(goalRes.value.data || []);
      if (deadlineRes.status === 'fulfilled') setDeadlines(deadlineRes.value.data || []);
      if (courseRes.status === 'fulfilled') setCourses(courseRes.value.data || []);
      if (allSessionsRes.status === 'fulfilled') setRecentSessions(allSessionsRes.value.data || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // ── Focus Timer Controller Logic ──────────────────────────────────────────
  const currentWorkDuration = modeKey === 'CUSTOM' ? customWork : TIMER_MODES[modeKey].workMins;
  const currentBreakDuration = modeKey === 'CUSTOM' ? customBreak : TIMER_MODES[modeKey].breakMins;
  const totalPhaseSeconds = (isBreak ? currentBreakDuration : currentWorkDuration) * 60;

  // Reset timer on mode/phase change
  useEffect(() => {
    if (!isActive) {
      setSecondsLeft((isBreak ? currentBreakDuration : currentWorkDuration) * 60);
    }
  }, [modeKey, customWork, customBreak, isBreak, currentWorkDuration, currentBreakDuration, isActive]);

  // Save session to backend
  const handleSessionComplete = useCallback(async () => {
    if (!isBreak) {
      try {
        const todayStr = new Date().toISOString().split('T')[0];
        await logStudySession({
          duration: currentWorkDuration,
          sessionType: TIMER_MODES[modeKey]?.name || 'Pomodoro',
          startTime: startTimeRef.current || new Date().toISOString(),
          endTime: new Date().toISOString(),
          studyDate: todayStr,
        });
        toast.success(`🎉 Focused session of ${currentWorkDuration} mins completed! XP added.`);
        fetchDashboardData();
      } catch (err) {
        console.error('Failed to save study session:', err);
        toast.error('Session complete, but failed to sync online.');
      }
    } else {
      toast.success('☕ Break time over! Ready for another focus round?');
    }
    setIsBreak((prev) => !prev);
    setIsActive(false);
  }, [isBreak, currentWorkDuration, modeKey, fetchDashboardData]);

  useEffect(() => {
    if (isActive) {
      if (!startTimeRef.current) startTimeRef.current = new Date().toISOString();
      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isActive, handleSessionComplete]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    startTimeRef.current = null;
    setSecondsLeft((isBreak ? currentBreakDuration : currentWorkDuration) * 60);
  };

  const skipBreak = () => {
    setIsBreak(false);
    setIsActive(false);
    startTimeRef.current = null;
    setSecondsLeft(currentWorkDuration * 60);
  };

  // Toggle task status right from Dashboard
  const handleToggleTask = async (taskId) => {
    try {
      await toggleTaskStatus(taskId);
      toast.success('Task status updated');
      fetchDashboardData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update task');
    }
  };

  // ── Derived Metrics ──────────────────────────────────────────────────────
  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = user?.name?.split(' ')[0] || 'Learner';
  const pendingTasksList = tasks.filter((t) => !t.isCompleted);
  const completedTasksCount = tasks.filter((t) => t.isCompleted).length;
  const achievedGoalsCount = goals.filter((g) => g.status === 'Achieved').length;
  const completedDeadlinesCount = deadlines.filter((d) => d.isCompleted).length;
  const pendingDeadlinesList = deadlines.filter((d) => !d.isCompleted).slice(0, 4);
  const totalStudyMins = (studyStats?.monthlyStudyHours || 0) * 60;
  const xpEarned = calculateXP(totalStudyMins, completedTasksCount, achievedGoalsCount, completedDeadlinesCount, streakData.currentStreak);

  // Heatmap generation (past 28 days)
  const heatmapDays = Array.from({ length: 28 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (27 - i));
    const dateStr = d.toISOString().split('T')[0];
    const daySessions = recentSessions.filter((s) => s.studyDate === dateStr);
    const dayMins = daySessions.reduce((acc, s) => acc + (s.duration || 0), 0);
    let level = 0;
    if (dayMins >= 100) level = 4;
    else if (dayMins >= 50) level = 3;
    else if (dayMins >= 25) level = 2;
    else if (dayMins > 0) level = 1;
    return { dateStr, level, mins: dayMins };
  });

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const strokeDashoffset = (2 * Math.PI * 90) * (1 - secondsLeft / totalPhaseSeconds);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4">
        <div className="w-10 h-10 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-text-secondary">Loading Apple-inspired StudyOS space...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1440px] mx-auto space-y-6 pb-24 md:pb-12 animate-fade-in">

      {/* ═══════════════════════════════════════════════════════════════════════════
          HEADER BAR
      ═══════════════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </p>
          <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">
            {greeting()}, <span className="text-gradient">{firstName}</span>
          </h1>
        </div>

        {/* Level / XP Pill */}
        <div className="flex items-center gap-3">
          <div className="glass-card px-4 py-2 flex items-center gap-2.5 rounded-2xl border-primary-500/20">
            <div className="w-7 h-7 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center font-black text-xs">
              ⚡
            </div>
            <div>
              <p className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Level {Math.floor(xpEarned / 200) + 1}</p>
              <p className="text-xs font-extrabold text-text-primary">{xpEarned.toLocaleString()} XP</p>
            </div>
          </div>

          <Link
            to="/focus"
            className="btn-primary py-2.5 px-4 rounded-2xl text-xs font-semibold flex items-center gap-2 shadow-glow-sm hover:scale-[1.02] transition-transform"
          >
            <Timer size={16} /> Open Focus Mode
          </Link>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════════
          DESKTOP 65 / 35 MAIN LAYOUT
      ═══════════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* ═════════════════════════════════════════════════════════════════════════
            LEFT COLUMN (65% -> lg:col-span-8)
        ═════════════════════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-8 space-y-6">

          {/* ── 1. FOCUS TIMER (HERO CENTERPIECE) ──────────────────────────────── */}
          <div className="glass-card p-6 md:p-8 relative overflow-hidden border-primary-500/20 shadow-2xl bg-gradient-to-br from-surface-primary via-surface-secondary to-surface-primary">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-1/4 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-6">
              {/* Mode Selector Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-primary-500/15 border border-primary-500/30 flex items-center justify-center text-primary-400">
                    <Timer size={20} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
                      Focus Center <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary-500/15 text-primary-400 font-bold border border-primary-500/25">HERO</span>
                    </h2>
                    <p className="text-xs text-text-muted">Apple Vision & Raycast inspired centerpiece</p>
                  </div>
                </div>

                {/* Timer Mode Pills */}
                <div className="flex items-center gap-1.5 bg-surface-secondary p-1 rounded-2xl border border-border">
                  {Object.keys(TIMER_MODES).map((key) => (
                    <button
                      key={key}
                      onClick={() => {
                        setModeKey(key);
                        setIsActive(false);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        modeKey === key
                          ? 'bg-primary-500 text-white shadow-md shadow-primary-500/25'
                          : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                      }`}
                    >
                      {TIMER_MODES[key].name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Central Ring & Countdown */}
              <div className="flex flex-col items-center justify-center py-4 space-y-6">
                <div className="relative w-56 h-56 md:w-64 md:h-64 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
                    {/* Track */}
                    <circle
                      cx="100"
                      cy="100"
                      r="90"
                      className="fill-none stroke-surface-secondary"
                      strokeWidth="10"
                    />
                    {/* Progress Ring */}
                    <circle
                      cx="100"
                      cy="100"
                      r="90"
                      className={`fill-none transition-all duration-1000 ease-linear ${isBreak ? 'stroke-emerald-400' : 'stroke-primary-500'}`}
                      strokeWidth="10"
                      strokeDasharray={`${2 * Math.PI * 90}`}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                    />
                  </svg>

                  {/* Inner Timer Content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                    <span className={`text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-full mb-1 ${
                      isBreak ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-primary-500/15 text-primary-400 border border-primary-500/30'
                    }`}>
                      {isBreak ? '☕ Break Time' : isActive ? '⚡ In Focus' : 'Ready'}
                    </span>
                    <h3 className="text-4xl md:text-5xl font-extrabold text-text-primary tracking-wider font-mono my-1">
                      {formattedTime}
                    </h3>
                    <p className="text-xs text-text-muted font-medium">
                      {isBreak ? `${currentBreakDuration} min rest phase` : `${currentWorkDuration} min deep session`}
                    </p>
                  </div>
                </div>

                {/* Control Action Buttons */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={toggleTimer}
                    className={`py-3 px-8 rounded-2xl text-sm font-bold flex items-center gap-2.5 transition-all duration-200 ${
                      isActive
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                        : 'btn-primary shadow-glow hover:scale-[1.03]'
                    }`}
                  >
                    {isActive ? <Pause size={18} /> : <Play size={18} className="fill-current" />}
                    {isActive ? 'Pause Session' : 'Start Focus Session'}
                  </button>

                  <button
                    onClick={resetTimer}
                    className="p-3 rounded-2xl bg-surface-secondary border border-border text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
                    title="Reset Timer"
                  >
                    <RotateCcw size={18} />
                  </button>

                  {isBreak && (
                    <button
                      onClick={skipBreak}
                      className="px-3 py-3 rounded-2xl bg-surface-secondary border border-border text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors flex items-center gap-1.5"
                    >
                      <SkipForward size={16} /> Skip Break
                    </button>
                  )}
                </div>
              </div>

              {/* Bottom Stat Strip Inside Timer Hero */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border/60">
                <div className="bg-surface-secondary/70 p-3 rounded-2xl border border-border text-center">
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Today&apos;s Study Time</p>
                  <p className="text-sm md:text-base font-extrabold text-text-primary mt-0.5">
                    {formatHours(studyStats?.todayStudyHours)}
                  </p>
                </div>
                <div className="bg-surface-secondary/70 p-3 rounded-2xl border border-border text-center">
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Sessions Completed</p>
                  <p className="text-sm md:text-base font-extrabold text-primary-400 mt-0.5">
                    {studyStats?.totalSessionsCompleted || 0}
                  </p>
                </div>
                <div className="bg-surface-secondary/70 p-3 rounded-2xl border border-border text-center">
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Current Streak</p>
                  <p className="text-sm md:text-base font-extrabold text-orange-400 mt-0.5 flex items-center justify-center gap-1">
                    🔥 {streakData.currentStreak}d
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── 2. PENDING TASKS (LARGER SECTION) ──────────────────────────────── */}
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-accent-500">
                  <CheckSquare size={18} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-text-primary">Pending Tasks</h2>
                  <p className="text-xs text-text-muted">{pendingTasksList.length} task{pendingTasksList.length !== 1 ? 's' : ''} awaiting completion</p>
                </div>
              </div>

              <Link
                to="/planner"
                className="text-xs font-semibold text-primary-400 hover:text-primary-300 flex items-center gap-1"
              >
                View Full Planner <ChevronRight size={14} />
              </Link>
            </div>

            {pendingTasksList.length === 0 ? (
              <div className="py-10 text-center border border-dashed border-border rounded-2xl">
                <CheckCircle2 size={32} className="mx-auto text-emerald-400/50 mb-2" />
                <p className="text-xs font-semibold text-text-muted">All clear! No pending tasks right now.</p>
                <button
                  onClick={() => navigate('/planner')}
                  className="mt-3 btn-secondary py-1.5 px-3 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5"
                >
                  <Plus size={14} /> Add New Task
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingTasksList.slice(0, 5).map((task) => (
                  <div
                    key={task._id}
                    className="p-4 rounded-2xl bg-surface-secondary border border-border hover:border-primary-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <button
                        onClick={() => handleToggleTask(task._id)}
                        className="mt-0.5 text-text-muted hover:text-emerald-400 transition-colors"
                        title="Mark Complete"
                      >
                        <Circle size={20} />
                      </button>

                      <div className="space-y-1 min-w-0 flex-1">
                        <h4 className="text-sm font-semibold text-text-primary truncate group-hover:text-primary-400 transition-colors">
                          {task.title}
                        </h4>

                        <div className="flex items-center gap-2 flex-wrap text-xs">
                          {task.subject && (
                            <span className="px-2 py-0.5 rounded-lg bg-surface-hover text-text-secondary text-[11px] font-medium border border-border">
                              {task.subject}
                            </span>
                          )}

                          {task.priority && (
                            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold ${
                              task.priority === 'Critical' ? 'bg-red-500/15 text-red-400 border border-red-500/25' :
                              task.priority === 'High' ? 'bg-orange-500/15 text-orange-400 border border-orange-500/25' :
                              task.priority === 'Medium' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25' :
                              'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                            }`}>
                              {task.priority} Priority
                            </span>
                          )}

                          {task.deadlineDate && (
                            <span className="text-[11px] text-text-muted flex items-center gap-1">
                              <Calendar size={12} /> {task.deadlineDate}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Completion ratio / progress bar */}
                    {task.subTopics && task.subTopics.length > 0 && (
                      <div className="w-full sm:w-32 shrink-0 space-y-1">
                        <div className="flex justify-between text-[10px] font-semibold text-text-muted">
                          <span>Subtopics</span>
                          <span>{task.subTopics.filter(s => s.isCompleted).length}/{task.subTopics.length}</span>
                        </div>
                        <div className="w-full bg-surface-hover h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-primary-500 h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.round((task.subTopics.filter(s => s.isCompleted).length / task.subTopics.length) * 100)}%`
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── 3. QUICK ACTIONS REDESIGN ─────────────────────────────────────── */}
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-400">
                <Sparkles size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-text-primary">Quick Actions</h2>
                <p className="text-xs text-text-muted">Frosted glass controls for rapid entry</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { label: 'Start Study', icon: Play, to: '/focus', color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
                { label: 'Add Task', icon: Plus, to: '/planner', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
                { label: 'Add Goal', icon: Target, to: '/goals', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
                { label: 'Add Deadline', icon: CalendarClock, to: '/deadlines', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' },
                { label: 'Add Course', icon: BookOpen, to: '/courses', color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
              ].map((action) => (
                <Link
                  key={action.label}
                  to={action.to}
                  className={`p-3.5 rounded-2xl bg-surface-secondary border border-border hover:border-primary-500/30 flex flex-col items-center justify-center text-center space-y-2 hover:-translate-y-1 transition-all group shadow-sm`}
                >
                  <div className={`w-9 h-9 rounded-xl border ${action.bg} flex items-center justify-center ${action.color} group-hover:scale-110 transition-transform`}>
                    <action.icon size={18} />
                  </div>
                  <span className="text-xs font-bold text-text-primary">{action.label}</span>
                </Link>
              ))}
            </div>
          </div>

        </div>

        {/* ═════════════════════════════════════════════════════════════════════════
            RIGHT COLUMN (35% -> lg:col-span-4)
        ═════════════════════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-4 space-y-6">

          {/* ── 1. COMPACT STAT WIDGETS GRID ───────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-3.5">
            {/* Study Hours Widget */}
            <div className="stat-widget">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-primary-400 mb-2">
                <Clock size={16} />
              </div>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Today&apos;s Study</p>
              <h4 className="text-lg font-extrabold text-text-primary mt-0.5">{formatHours(studyStats?.todayStudyHours)}</h4>
              <div className="w-full bg-surface-hover h-1 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-primary-500 h-full rounded-full"
                  style={{ width: `${Math.min(100, ((studyStats?.todayStudyHours || 0) / 4) * 100)}%` }}
                />
              </div>
            </div>

            {/* Goal Progress Widget */}
            <div className="stat-widget">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-2">
                <Target size={16} />
              </div>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Goal Progress</p>
              <h4 className="text-lg font-extrabold text-emerald-400 mt-0.5">
                {goals.length > 0 ? Math.round((achievedGoalsCount / goals.length) * 100) : 0}%
              </h4>
              <div className="w-full bg-surface-hover h-1 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-emerald-400 h-full rounded-full"
                  style={{ width: `${goals.length > 0 ? Math.round((achievedGoalsCount / goals.length) * 100) : 0}%` }}
                />
              </div>
            </div>

            {/* Tasks Completed Widget */}
            <div className="stat-widget">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-2">
                <CheckSquare size={16} />
              </div>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Tasks Done</p>
              <h4 className="text-lg font-extrabold text-cyan-400 mt-0.5">{completedTasksCount}/{tasks.length}</h4>
              <div className="w-full bg-surface-hover h-1 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-cyan-400 h-full rounded-full"
                  style={{ width: `${tasks.length > 0 ? Math.round((completedTasksCount / tasks.length) * 100) : 0}%` }}
                />
              </div>
            </div>

            {/* XP Earned Widget */}
            <div className="stat-widget">
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-2">
                <Zap size={16} />
              </div>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">XP Earned</p>
              <h4 className="text-lg font-extrabold text-amber-400 mt-0.5">{xpEarned.toLocaleString()}</h4>
              <p className="text-[10px] text-text-muted mt-1 font-semibold">Level {Math.floor(xpEarned / 200) + 1}</p>
            </div>

            {/* Current Streak Widget */}
            <div className="stat-widget">
              <div className="w-8 h-8 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 mb-2">
                <Flame size={16} />
              </div>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Current Streak</p>
              <h4 className="text-lg font-extrabold text-orange-400 mt-0.5">{streakData.currentStreak} Days</h4>
              <p className="text-[10px] text-text-muted mt-1 font-semibold">Keep it up!</p>
            </div>

            {/* Best Streak Widget */}
            <div className="stat-widget">
              <div className="w-8 h-8 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-400 mb-2">
                <Award size={16} />
              </div>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Best Streak</p>
              <h4 className="text-lg font-extrabold text-violet-400 mt-0.5">{streakData.bestStreak} Days</h4>
              <p className="text-[10px] text-text-muted mt-1 font-semibold">All-time record</p>
            </div>
          </div>

          {/* ── 2. UPCOMING DEADLINES ─────────────────────────────────────────── */}
          <div className="glass-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarClock size={18} className="text-rose-400" />
                <h3 className="text-sm font-bold text-text-primary">Upcoming Deadlines</h3>
              </div>
              <Link to="/deadlines" className="text-[11px] font-semibold text-primary-400 hover:text-primary-300">
                View All
              </Link>
            </div>

            {pendingDeadlinesList.length === 0 ? (
              <div className="py-6 text-center border border-dashed border-border rounded-xl">
                <p className="text-xs text-text-muted">No upcoming deadlines</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {pendingDeadlinesList.map((d) => {
                  const { text: daysText, isOverdue } = getDaysLeft(d.deadlineDate);
                  return (
                    <div
                      key={d._id}
                      className="p-3 rounded-xl bg-surface-secondary border border-border flex items-center justify-between gap-3 hover:border-primary-500/20 transition-all"
                    >
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <h4 className="text-xs font-bold text-text-primary truncate">{d.title}</h4>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold ${
                            d.category === 'Exam' ? 'bg-rose-500/15 text-rose-400' :
                            d.category === 'Assignment' ? 'bg-blue-500/15 text-blue-400' :
                            'bg-violet-500/15 text-violet-400'
                          }`}>
                            {d.category}
                          </span>
                          <span className="text-[10px] text-text-muted font-medium">{d.priority} Priority</span>
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-extrabold block ${
                          isOverdue ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-surface-hover text-text-primary border border-border'
                        }`}>
                          {daysText}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── 3. WEEKLY PROGRESS ────────────────────────────────────────────── */}
          <div className="glass-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart2 size={18} className="text-emerald-400" />
                <h3 className="text-sm font-bold text-text-primary">Weekly Progress</h3>
              </div>
              <span className="text-xs font-extrabold text-emerald-400">
                {Math.round(((studyStats?.weeklyStudyHours || 0) / 28) * 100)}% Target
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium text-text-secondary">
                <span>Weekly Study Hours</span>
                <span className="font-bold text-text-primary">{formatHours(studyStats?.weeklyStudyHours)} / 28h</span>
              </div>

              <div className="w-full bg-surface-hover h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-brand h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, ((studyStats?.weeklyStudyHours || 0) / 28) * 100)}%` }}
                />
              </div>

              <p className="text-[10px] text-text-muted">Based on target goal of 4 hours daily study.</p>
            </div>
          </div>

          {/* ── 4. PRODUCTIVITY HEATMAP ────────────────────────────────────────── */}
          <div className="glass-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame size={18} className="text-amber-400" />
                <h3 className="text-sm font-bold text-text-primary">Productivity Heatmap</h3>
              </div>
              <span className="text-[10px] text-text-muted font-medium">Past 28 Days</span>
            </div>

            {/* 4x7 Matrix of past 28 days */}
            <div className="grid grid-cols-7 gap-1.5 pt-1">
              {heatmapDays.map((day, idx) => {
                const colorMap = {
                  0: 'bg-surface-secondary border-border/60',
                  1: 'bg-emerald-950/70 border-emerald-800/40 text-emerald-300',
                  2: 'bg-emerald-800/80 border-emerald-600/50 text-emerald-200',
                  3: 'bg-emerald-500 border-emerald-400 text-white',
                  4: 'bg-emerald-400 border-emerald-300 text-slate-950 font-bold',
                };
                return (
                  <div
                    key={idx}
                    title={`${day.dateStr}: ${day.mins} mins studied`}
                    className={`h-6 rounded-md border ${colorMap[day.level]} transition-transform hover:scale-125 cursor-pointer flex items-center justify-center text-[9px]`}
                  />
                );
              })}
            </div>

            <div className="flex items-center justify-between text-[10px] text-text-muted pt-1">
              <span>Less</span>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-surface-secondary border border-border" />
                <span className="w-2.5 h-2.5 rounded bg-emerald-950/70 border border-emerald-800/40" />
                <span className="w-2.5 h-2.5 rounded bg-emerald-800/80 border border-emerald-600/50" />
                <span className="w-2.5 h-2.5 rounded bg-emerald-500 border border-emerald-400" />
                <span className="w-2.5 h-2.5 rounded bg-emerald-400 border border-emerald-300" />
              </div>
              <span>More</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default DashboardPage;
