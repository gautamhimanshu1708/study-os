import { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  BarChart2, Clock, CheckSquare, Target, BookOpen, CalendarClock,
  TrendingUp, RefreshCw, PieChart as PieChartIcon
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getAnalyticsSummary } from '../../api/analyticsApi';
import { useTimer } from '../../context/TimerContext';

// Recharts Custom Dark Glassmorphic Tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-3 border border-border shadow-xl rounded-xl text-xs space-y-1 bg-surface-primary/95 backdrop-blur-md">
        <p className="font-bold text-text-primary border-b border-border/60 pb-1 mb-1">{label}</p>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center justify-between gap-3 text-text-secondary">
            <span className="flex items-center gap-1.5 font-medium" style={{ color: entry.color }}>
              <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: entry.color }} />
              {entry.name}:
            </span>
            <span className="font-bold text-text-primary">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const AnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { fetchStats } = useTimer();

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAnalyticsSummary();
      setData(res.data || null);
      // Also refresh global stats for consistency
      fetchStats();
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      toast.error('Failed to load analytics dashboard');
    } finally {
      setLoading(false);
    }
  }, [fetchStats]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 space-y-3">
        <RefreshCw size={28} className="animate-spin text-primary-400" />
        <p className="text-sm font-semibold text-text-secondary">Generating analytical visualizations...</p>
      </div>
    );
  }

  const {
    summary = {},
    dailyStudyHours = [],
    weeklyProgress = [],
    courseCompletionData = [],
    goalCompletionData = [],
    taskPriorityData = [],
    deadlineCompletionData = [],
  } = data || {};

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1440px] mx-auto space-y-6 pb-24 md:pb-12 animate-fade-in">
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight flex items-center gap-2.5">
            <span className="p-2 rounded-2xl bg-primary-500/15 border border-primary-500/30 text-primary-400">
              <BarChart2 size={24} />
            </span>
            Analytics Dashboard
          </h1>
          <p className="text-xs md:text-sm text-text-secondary mt-1">
            Real-time interactive visualizations powered by Recharts across all study modules.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="btn-secondary py-2.5 px-4 rounded-xl text-xs md:text-sm font-semibold flex items-center justify-center gap-2"
        >
          <RefreshCw size={15} /> Refresh Analytics
        </button>
      </div>

      {/* TOP PERFORMANCE SUMMARY CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
        {/* Total Hours Logged */}
        <div className="glass-card p-4 border border-border flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Total Study Hours</p>
            <p className="text-2xl md:text-3xl font-black text-amber-400 mt-1">{summary.totalHoursLogged || 0} <span className="text-xs font-normal text-text-secondary">hrs</span></p>
            <p className="text-[10px] text-text-secondary mt-0.5">Logged across focus sessions</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Clock size={20} />
          </div>
        </div>

        {/* Task Completion Rate */}
        <div className="glass-card p-4 border border-border flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Task Completion</p>
            <p className="text-2xl md:text-3xl font-black text-emerald-400 mt-1">{summary.taskCompletionRate || 0}%</p>
            <p className="text-[10px] text-text-secondary mt-0.5">Tasks completed</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckSquare size={20} />
          </div>
        </div>

        {/* Course Completion Rate */}
        <div className="glass-card p-4 border border-border flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Course Progress</p>
            <p className="text-2xl md:text-3xl font-black text-blue-400 mt-1">{summary.courseCompletionRate || 0}%</p>
            <p className="text-[10px] text-text-secondary mt-0.5">Courses finished</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <BookOpen size={20} />
          </div>
        </div>

        {/* Goal Achievement Rate */}
        <div className="glass-card p-4 border border-border flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Goal Achievement</p>
            <p className="text-2xl md:text-3xl font-black text-violet-400 mt-1">{summary.goalAchievementRate || 0}%</p>
            <p className="text-[10px] text-text-secondary mt-0.5">Target goals hit</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-400">
            <Target size={20} />
          </div>
        </div>

        {/* Deadline Rate */}
        <div className="glass-card p-4 border border-border flex items-center justify-between col-span-2 lg:col-span-1">
          <div>
            <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Deadline Completion</p>
            <p className="text-2xl md:text-3xl font-black text-rose-400 mt-1">{summary.deadlineCompletionRate || 0}%</p>
            <p className="text-[10px] text-text-secondary mt-0.5">Deadlines completed</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <CalendarClock size={20} />
          </div>
        </div>
      </div>

      {/* ROW 1: DAILY STUDY HOURS (BAR CHART) + WEEKLY PROGRESS (AREA CHART) */}
      <div className="grid lg:grid-cols-2 gap-4 md:gap-5">
        <div className="glass-card p-5 border border-border space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
              <Clock size={18} className="text-amber-400" />
              Daily Study Hours (Past 14 Days)
            </h2>
            <span className="text-xs text-text-muted">Bar Chart</span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyStudyHours} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="hoursGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#d97706" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" vertical={false} />
                <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="hours" name="Study Hours" fill="url(#hoursGrad)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-5 border border-border space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
              <TrendingUp size={18} className="text-emerald-400" />
              Weekly Progress Distribution
            </h2>
            <span className="text-xs text-text-muted">Area Chart</span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyProgress} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#059669" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" vertical={false} />
                <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="hours" name="Total Hours" stroke="#10b981" strokeWidth={2.5} fill="url(#areaGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ROW 2: COURSE COMPLETION + GOAL COMPLETION */}
      <div className="grid lg:grid-cols-2 gap-4 md:gap-5">
        <div className="glass-card p-5 border border-border space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
              <PieChartIcon size={18} className="text-blue-400" />
              Course Completion Breakdown
            </h2>
            <span className="text-xs text-text-muted">Donut Chart</span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {courseCompletionData.every((item) => item.value === 0) ? (
              <div className="text-center text-xs text-text-muted">No courses data available</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={courseCompletionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {courseCompletionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} stroke="var(--bg-surface-secondary)" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="glass-card p-5 border border-border space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
              <Target size={18} className="text-violet-400" />
              Goal Completion (Short vs Long Term)
            </h2>
            <span className="text-xs text-text-muted">Grouped Bar</span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={goalCompletionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                <Bar dataKey="achieved" name="Achieved Goals" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="total" name="Total Set Goals" fill="#334155" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ROW 3: TASK PRIORITY COMPLETION + DEADLINE STATUS */}
      <div className="grid lg:grid-cols-2 gap-4 md:gap-5">
        <div className="glass-card p-5 border border-border space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
              <CheckSquare size={18} className="text-emerald-400" />
              Task Completion by Priority Level
            </h2>
            <span className="text-xs text-text-muted">Stacked Bar</span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={taskPriorityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" vertical={false} />
                <XAxis dataKey="priority" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                <Bar dataKey="completed" name="Completed Tasks" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                <Bar dataKey="pending" name="Pending Tasks" stackId="a" fill="#f43f5e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-5 border border-border space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
              <CalendarClock size={18} className="text-rose-400" />
              Deadline Completion Status Rate
            </h2>
            <span className="text-xs text-text-muted">Donut Chart</span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {deadlineCompletionData.every((item) => item.count === 0) ? (
              <div className="text-center text-xs text-text-muted">No deadlines scheduled</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deadlineCompletionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="count"
                  >
                    {deadlineCompletionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} stroke="var(--bg-surface-secondary)" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
