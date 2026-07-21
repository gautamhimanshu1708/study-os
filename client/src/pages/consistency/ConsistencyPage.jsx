import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Flame, Zap, Calendar, TrendingUp, Trophy, Clock, CheckSquare, BookOpen,
  RefreshCw, Plus, Info, ChevronRight, Award, BarChart2, Filter
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getConsistencyLogs, getConsistencyStats, logDailyActivity } from '../../api/consistencyApi';
import { useTimer } from '../../context/TimerContext';
import DailyLogModal from './DailyLogModal';

// GitHub Heatmap Color Mapping
const LEVEL_COLORS = {
  0: 'bg-base-700/60 border-base-600/40 hover:border-border-hover',
  1: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/40 hover:scale-125 hover:z-10',
  2: 'bg-emerald-800/80 text-emerald-200 border-emerald-600/50 hover:scale-125 hover:z-10',
  3: 'bg-emerald-500 text-white border-emerald-400 hover:scale-125 hover:z-10 shadow-sm shadow-emerald-500/20',
  4: 'bg-emerald-400 text-base-950 border-emerald-300 font-bold hover:scale-125 hover:z-10 shadow-md shadow-emerald-400/40 animate-pulse',
};

const ConsistencyPage = () => {
  const [logsMap, setLogsMap] = useState({});
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { fetchStats: refreshGlobalStats } = useTimer();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDateForModal, setSelectedDateForModal] = useState(null);
  const [editingLog, setEditingLog] = useState(null);

  // Active Tooltip State
  const [hoveredDay, setHoveredDay] = useState(null);

  const fetchConsistencyData = useCallback(async () => {
    try {
      setLoading(true);
      const [logsRes, statsRes] = await Promise.all([
        getConsistencyLogs(),
        getConsistencyStats(),
      ]);

      const map = {};
      (logsRes.data || []).forEach((log) => {
        map[log.date] = log;
      });

      setLogsMap(map);
      setStats(statsRes.data || null);
      // Refresh global timer stats for cross-page consistency
      refreshGlobalStats();
    } catch (err) {
      console.error('Failed to fetch consistency data:', err);
      toast.error('Failed to load consistency tracker');
    } finally {
      setLoading(false);
    }
  }, [refreshGlobalStats]);

  useEffect(() => {
    fetchConsistencyData();
  }, [fetchConsistencyData]);

  // Generate 52 weeks (364 days) grid leading up to today
  const heatmapWeeks = useMemo(() => {
    const weeks = [];
    const today = new Date();
    const currentDayOfWeek = today.getDay(); // 0 = Sun, 1 = Mon ...

    // Calculate end date (Saturday of current week)
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + (6 - currentDayOfWeek));

    // Generate 52 weeks (364 days) backward
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 52 * 7 + 1);

    const curr = new Date(startDate);

    for (let w = 0; w < 52; w++) {
      const weekDays = [];
      for (let d = 0; d < 7; d++) {
        const dateStr = curr.toISOString().split('T')[0];
        const log = logsMap[dateStr] || null;
        weekDays.push({
          dateStr,
          dateObj: new Date(curr),
          log,
          level: log ? log.activityLevel : 0,
          isFuture: curr > today,
        });
        curr.setDate(curr.getDate() + 1);
      }
      weeks.push(weekDays);
    }

    return weeks;
  }, [logsMap]);

  // Month headers logic for heatmap
  const monthHeaders = useMemo(() => {
    const headers = [];
    let currentMonth = -1;

    heatmapWeeks.forEach((week, weekIdx) => {
      const firstDayOfWeek = week[0].dateObj;
      const monthIdx = firstDayOfWeek.getMonth();

      if (monthIdx !== currentMonth) {
        currentMonth = monthIdx;
        const monthName = firstDayOfWeek.toLocaleString('default', { month: 'short' });
        headers.push({ name: monthName, colSpan: 1, weekIdx });
      } else if (headers.length > 0) {
        headers[headers.length - 1].colSpan += 1;
      }
    });

    return headers;
  }, [heatmapWeeks]);

  // Handle Save Log
  const handleSaveLog = async (formData) => {
    try {
      await logDailyActivity(formData);
      toast.success('Activity log saved successfully!');
      fetchConsistencyData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save log');
    }
  };

  const handleSquareClick = (dayObj) => {
    if (dayObj.isFuture) return;
    setSelectedDateForModal(dayObj.dateStr);
    setEditingLog(dayObj.log);
    setIsModalOpen(true);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1440px] mx-auto space-y-6 pb-24 md:pb-12 animate-fade-in">
      {/* ═══════════════════════════════════════════════════════════════════════════
          HEADER BAR
      ═══════════════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight flex items-center gap-2.5">
            <span className="p-2 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <Flame size={24} />
            </span>
            Consistency Tracker
          </h1>
          <p className="text-xs md:text-sm text-text-secondary mt-1">
            Build habits with GitHub-inspired study heatmaps, study streaks, and activity metrics.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedDateForModal(new Date().toISOString().split('T')[0]);
            setEditingLog(logsMap[new Date().toISOString().split('T')[0]] || null);
            setIsModalOpen(true);
          }}
          className="btn-primary py-2.5 px-4 rounded-xl text-xs md:text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20 hover:scale-[1.02] transition-transform"
        >
          <Plus size={16} /> Log Today&apos;s Study
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════════
          STREAK & CONSISTENCY METRICS CARDS
      ═══════════════════════════════════════════════════════════════════════════ */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
          {/* Current Streak */}
          <div className="glass-card p-4 border border-border flex items-center justify-between relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 text-amber-500/10 group-hover:text-amber-500/20 transition-colors">
              <Flame size={80} />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Current Streak</p>
              <h3 className="text-3xl font-bold text-text-primary flex items-center gap-2">
                <Flame size={28} className="text-orange-500" /> {stats.currentStreak} <span className="text-xs font-normal text-text-secondary">days</span>
              </h3>
              <p className="text-[10px] text-text-secondary mt-0.5">Consecutive active days</p>
            </div>
          </div>

          {/* Best Streak */}
          <div className="glass-card p-4 border border-border flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Best Streak</p>
              <p className="text-2xl md:text-3xl font-black text-violet-400 mt-1 flex items-center gap-1">
                ⚡ {stats.bestStreak} <span className="text-xs font-normal text-text-secondary">days</span>
              </p>
              <p className="text-[10px] text-text-secondary mt-0.5">All-time record</p>
            </div>
          </div>

          {/* Weekly Consistency */}
          <div className="glass-card p-4 border border-border flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Weekly</p>
              <p className="text-2xl md:text-3xl font-black text-emerald-400 mt-1">{stats.weeklyConsistency}%</p>
              <p className="text-[10px] text-text-secondary mt-0.5">Past 7 days active</p>
            </div>
          </div>

          {/* Monthly Consistency */}
          <div className="glass-card p-4 border border-border flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Monthly</p>
              <p className="text-2xl md:text-3xl font-black text-blue-400 mt-1">{stats.monthlyConsistency}%</p>
              <p className="text-[10px] text-text-secondary mt-0.5">Past 30 days active</p>
            </div>
          </div>

          {/* Productive Days */}
          <div className="glass-card p-4 border border-border flex items-center justify-between col-span-2 lg:col-span-1">
            <div>
              <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Productive Days</p>
              <p className="text-2xl md:text-3xl font-black text-rose-400 mt-1">{stats.totalProductiveDays}</p>
              <p className="text-[10px] text-text-secondary mt-0.5">{stats.totalStudyHours} hrs logged total</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Trophy size={20} />
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════
          GITHUB-INSPIRED STUDY HEATMAP
      ═══════════════════════════════════════════════════════════════════════════ */}
      <div className="glass-card p-5 border border-border space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
              <BarChart2 size={18} className="text-emerald-400" />
              365-Day Study Contribution Heatmap
            </h2>
            <p className="text-xs text-text-muted">
              Click any date block to log study hours, completed sessions, and finished tasks.
            </p>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <span>Less</span>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-base-700/60 border border-base-600/40 inline-block" />
              <span className="w-3 h-3 rounded-sm bg-emerald-950/80 border border-emerald-800/40 inline-block" />
              <span className="w-3 h-3 rounded-sm bg-emerald-800/80 border border-emerald-600/50 inline-block" />
              <span className="w-3 h-3 rounded-sm bg-emerald-500 border border-emerald-400 inline-block" />
              <span className="w-3 h-3 rounded-sm bg-emerald-400 border border-emerald-300 inline-block" />
            </div>
            <span>More</span>
          </div>
        </div>

        {/* Heatmap Grid Wrapper */}
        {loading ? (
          <div className="py-16 text-center text-text-muted text-xs flex items-center justify-center gap-2">
            <RefreshCw size={16} className="animate-spin text-emerald-400" /> Loading study heatmap...
          </div>
        ) : (
          <div className="overflow-x-auto pb-2 custom-scroll">
            <div className="min-w-[760px]">
              {/* Month Header Row */}
              <div className="flex text-[10px] text-text-muted mb-1 pl-6">
                {monthHeaders.map((mh, idx) => (
                  <div
                    key={idx}
                    style={{ width: `${mh.colSpan * 14}px` }}
                    className="truncate font-semibold text-text-secondary"
                  >
                    {mh.name}
                  </div>
                ))}
              </div>

              {/* Heatmap Matrix (7 Rows x 52 Cols) */}
              <div className="flex gap-1">
                {/* Day of week labels */}
                <div className="flex flex-col justify-between text-[9px] text-text-muted pr-1.5 py-0.5 select-none font-medium">
                  <span>Mon</span>
                  <span>Wed</span>
                  <span>Fri</span>
                </div>

                {/* Weeks Columns */}
                <div className="flex gap-1">
                  {heatmapWeeks.map((week, wIdx) => (
                    <div key={wIdx} className="flex flex-col gap-1">
                      {week.map((day, dIdx) => {
                        const levelClass = LEVEL_COLORS[day.level] || LEVEL_COLORS[0];
                        return (
                          <div
                            key={dIdx}
                            onClick={() => handleSquareClick(day)}
                            onMouseEnter={() => setHoveredDay(day)}
                            onMouseLeave={() => setHoveredDay(null)}
                            className={`
                              w-3 h-3 rounded-sm border cursor-pointer transition-all duration-150 relative group
                              ${day.isFuture ? 'opacity-20 cursor-not-allowed bg-base-800 border-transparent' : levelClass}
                            `}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hovered Day Tooltip Box */}
        <div className="min-h-12 bg-base-600/40 border border-border/80 rounded-xl p-3 flex items-center justify-between text-xs transition-all">
          {hoveredDay ? (
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-1.5 font-bold text-text-primary">
                <Calendar size={13} className="text-emerald-400" />
                {hoveredDay.dateStr}
              </div>
              <div className="flex items-center gap-1 text-amber-400 font-semibold">
                <Clock size={13} /> {hoveredDay.log?.studyHours || 0} hrs studied
              </div>
              <div className="flex items-center gap-1 text-primary-300 font-semibold">
                <BookOpen size={13} /> {hoveredDay.log?.sessionsCount || hoveredDay.log?.focusSessionsCompleted || 0} sessions
              </div>
              <div className="flex items-center gap-1 text-emerald-400 font-semibold">
                <CheckSquare size={13} /> {hoveredDay.log?.tasksCompleted || 0} tasks done
              </div>
              {hoveredDay.log?.notes && (
                <span className="text-[11px] text-text-muted italic truncate max-w-xs">
                  &quot;{hoveredDay.log.notes}&quot;
                </span>
              )}
            </div>
          ) : (
            <span className="text-text-muted text-[11px] flex items-center gap-1.5">
              <Info size={13} className="text-primary-400" />
              Hover over any square on the heatmap to view details, or click to log study activity.
            </span>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════════
          RECENT ACTIVITY LOG HISTORY TABLE
      ═══════════════════════════════════════════════════════════════════════════ */}
      <div className="glass-card p-5 border border-border space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
            <Clock size={18} className="text-amber-400" />
            Recent Activity Logs
          </h2>
          <span className="text-xs text-text-muted">
            {Object.keys(logsMap).length} days logged
          </span>
        </div>

        {Object.keys(logsMap).length === 0 ? (
          <div className="py-8 text-center border border-dashed border-border rounded-xl">
            <p className="text-xs text-text-muted mb-2">No activity logged yet</p>
            <button
              onClick={() => {
                setSelectedDateForModal(new Date().toISOString().split('T')[0]);
                setIsModalOpen(true);
              }}
              className="btn-primary py-1.5 px-3 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <Plus size={13} /> Log First Activity
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scroll">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-base-600/30 text-text-muted">
                  <th className="py-2.5 px-3 font-semibold">Date</th>
                  <th className="py-2.5 px-3 font-semibold">Study Hours</th>
                  <th className="py-2.5 px-3 font-semibold">Sessions</th>
                  <th className="py-2.5 px-3 font-semibold">Tasks Completed</th>
                  <th className="py-2.5 px-3 font-semibold">Intensity Level</th>
                  <th className="py-2.5 px-3 font-semibold">Notes</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {Object.values(logsMap)
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .slice(0, 10)
                  .map((log) => (
                    <tr key={log._id} className="hover:bg-base-600/30 transition-colors">
                      <td className="py-3 px-3 font-bold text-text-primary">{log.date}</td>
                      <td className="py-3 px-3 text-amber-400 font-semibold">{log.studyHours || 0} hrs</td>
                      <td className="py-3 px-3 text-text-secondary">{log.sessionsCount || log.focusSessionsCompleted || 0} sessions</td>
                      <td className="py-3 px-3 text-emerald-400 font-semibold">{log.tasksCompleted || 0} tasks</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${LEVEL_COLORS[log.activityLevel]}`}>
                          Level {log.activityLevel}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-text-muted italic max-w-xs truncate">{log.notes || '—'}</td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedDateForModal(log.date);
                            setEditingLog(log);
                            setIsModalOpen(true);
                          }}
                          className="text-[11px] text-primary-400 hover:text-primary-300 font-semibold"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Daily Log Modal */}
      <DailyLogModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveLog}
        initialData={editingLog}
        selectedDate={selectedDateForModal}
      />
    </div>
  );
};

export default ConsistencyPage;
