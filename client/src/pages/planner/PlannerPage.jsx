import { useState, useEffect, useCallback } from 'react';
import {
  CheckSquare, Layers, Plus, Search, Filter, Calendar, AlertCircle,
  CheckCircle2, Circle, Trash2, Edit, BookOpen, ChevronDown, ChevronUp,
  Sparkles, Trophy, TrendingUp, RefreshCw, AlertTriangle, Tag, Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  toggleTaskStatus,
  toggleSubtopicStatus,
  getPlannerStats,
} from '../../api/plannerApi';
import PlannerModal from './PlannerModal';

// Priority styling badges
const PRIORITY_CONFIG = {
  critical: { label: 'Critical', bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30' },
  high:     { label: 'High',     bg: 'bg-danger/15',  text: 'text-danger',   border: 'border-danger/30' },
  medium:   { label: 'Medium',   bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' },
  low:      { label: 'Low',      bg: 'bg-success/15', text: 'text-success', border: 'border-success/30' },
};

// Category badge colors
const CATEGORY_COLORS = {
  Assignment: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  Lecture:    'bg-purple-500/15 text-purple-400 border-purple-500/30',
  Project:    'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  Revision:   'bg-amber-500/15 text-amber-400 border-amber-500/30',
  Exam:       'bg-rose-500/15 text-rose-400 border-rose-500/30',
  General:    'bg-base-500/60 text-text-muted border-border',
};

const PlannerPage = () => {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'normal' | 'topic' | 'pending' | 'completed'
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Accordion state for topic tasks
  const [expandedTasks, setExpandedTasks] = useState({});

  const fetchPlannerData = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (activeTab === 'normal') params.type = 'normal';
      if (activeTab === 'topic') params.type = 'topic';
      if (activeTab === 'pending') params.isCompleted = 'false';
      if (activeTab === 'completed') params.isCompleted = 'true';
      if (priorityFilter !== 'all') params.priority = priorityFilter;
      if (subjectFilter !== 'all') params.subject = subjectFilter;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const [tasksRes, statsRes] = await Promise.all([
        getTasks(params),
        getPlannerStats(),
      ]);

      setTasks(tasksRes.data || []);
      setStats(statsRes.data || null);

      // Auto-expand all topic tasks by default
      const expMap = {};
      (tasksRes.data || []).forEach((t) => {
        if (t.type === 'topic') expMap[t._id] = true;
      });
      setExpandedTasks((prev) => ({ ...expMap, ...prev }));
    } catch (err) {
      console.error('Failed to fetch planner data:', err);
      toast.error('Failed to load study planner data');
    } finally {
      setLoading(false);
    }
  }, [activeTab, priorityFilter, subjectFilter, searchQuery]);

  useEffect(() => {
    fetchPlannerData();
  }, [fetchPlannerData]);

  // Handle Save Task (Create or Update)
  const handleSaveTask = async (formData) => {
    try {
      if (editingTask) {
        await updateTask(editingTask._id, formData);
        toast.success('Task updated successfully');
      } else {
        await createTask(formData);
        toast.success('New task added to study planner!');
      }
      fetchPlannerData();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to save task');
    }
  };

  // Delete Task
  const handleDeleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await deleteTask(id);
      toast.success('Task deleted');
      fetchPlannerData();
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  // Toggle overall task completion
  const handleToggleTask = async (id) => {
    try {
      await toggleTaskStatus(id);
      fetchPlannerData();
    } catch (err) {
      toast.error('Failed to update task status');
    }
  };

  // Toggle subtopic completion inside topic task
  const handleToggleSubtopic = async (taskId, subtopicId) => {
    try {
      await toggleSubtopicStatus(taskId, subtopicId);
      fetchPlannerData();
    } catch (err) {
      toast.error('Failed to update subtopic');
    }
  };

  const toggleAccordion = (taskId) => {
    setExpandedTasks((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  // Deadline formatting helper
  const formatDeadline = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { label: 'Overdue', color: 'bg-red-500/20 text-red-400 border-red-500/30' };
    if (diffDays === 0) return { label: 'Due Today', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30 font-bold' };
    if (diffDays === 1) return { label: 'Due Tomorrow', color: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25' };
    return { label: `Due in ${diffDays} days`, color: 'bg-base-500/60 text-text-muted border-border' };
  };

  // Extract unique subjects from stats or tasks for filter
  const subjectsList = stats?.subjectStats?.map((s) => s.subject) || [];

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1440px] mx-auto space-y-6 pb-24 md:pb-12 animate-fade-in">
      {/* ═══════════════════════════════════════════════════════════════════════════
          HEADER BAR
      ═══════════════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight flex items-center gap-2.5">
            <span className="p-2 rounded-2xl bg-primary-500/15 border border-primary-500/30 text-primary-400">
              <CheckSquare size={24} />
            </span>
            Study Planner
          </h1>
          <p className="text-xs md:text-sm text-text-secondary mt-1">
            Organize normal study tasks & topic-based subject hierarchies with LeetCode progress tracking.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingTask(null);
            setIsModalOpen(true);
          }}
          className="btn-primary py-2.5 px-4 rounded-xl text-xs md:text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20 hover:scale-[1.02] transition-transform"
        >
          <Plus size={16} /> Add Task
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════════
          LEETCODE-STYLE HERO METRICS HEADER
      ═══════════════════════════════════════════════════════════════════════════ */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Overall Progress Card */}
          <div className="glass-card p-5 flex items-center gap-5 border border-border shadow-card">
            {/* SVG Progress Ring */}
            <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-base-600"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-400 stroke-current transition-all duration-1000 ease-out"
                  strokeWidth="3.5"
                  strokeDasharray={`${stats.overallPercentage}, 100`}
                  strokeLinecap="round"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-xl font-black text-text-primary leading-none">
                  {stats.overallPercentage}%
                </span>
                <span className="text-[9px] uppercase font-bold text-text-muted mt-0.5">Done</span>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 mb-1">
                <Trophy size={14} /> Overall Syllabus Progress
              </div>
              <p className="text-sm font-bold text-text-primary">
                {stats.completedTasks} / {stats.totalTasks} Tasks Completed
              </p>
              <div className="flex items-center gap-3 mt-3 text-[11px] text-text-muted">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-primary-400" />
                  {stats.normalCount} Normal
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-accent-400" />
                  {stats.topicCount} Topic-Based
                </span>
              </div>
            </div>
          </div>

          {/* LeetCode Subject Progress Cards */}
          <div className="lg:col-span-2 glass-card p-5 border border-border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
                <BookOpen size={14} className="text-primary-400" /> Subject Completion Progress (LeetCode Style)
              </h3>
              <span className="text-[10px] text-text-muted">Auto-calculated</span>
            </div>

            {stats.subjectStats.length === 0 ? (
              <p className="text-xs text-text-muted py-2">No subject data yet. Add a task to see progress!</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-32 overflow-y-auto custom-scroll pr-1">
                {stats.subjectStats.map((sub) => (
                  <div
                    key={sub.subject}
                    className="p-2.5 rounded-xl bg-base-600/50 border border-border/60 hover:border-primary-500/30 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-text-primary truncate">{sub.subject}</span>
                      <span className="text-[11px] font-bold text-emerald-400">{sub.percentage}%</span>
                    </div>

                    {/* LeetCode Green Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-base-700 overflow-hidden relative">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-accent-400 rounded-full transition-all duration-700"
                        style={{ width: `${sub.percentage}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between mt-1 text-[10px] text-text-muted">
                      <span>{sub.chaptersCount} Chapters</span>
                      <span>
                        {sub.totalSubtopics > 0
                          ? `${sub.completedSubtopics}/${sub.totalSubtopics} Subtopics`
                          : `${sub.completedTasks}/${sub.totalTasks} Tasks`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════
          SEARCH & FILTER TOOLBAR
      ═══════════════════════════════════════════════════════════════════════════ */}
      <div className="glass-card p-3 md:p-4 space-y-3 border border-border">
        {/* Tab Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scroll">
          {[
            { id: 'all', label: 'All Tasks', icon: CheckSquare },
            { id: 'normal', label: 'Normal Tasks', icon: CheckSquare },
            { id: 'topic', label: 'Topic-Based Tasks', icon: Layers },
            { id: 'pending', label: 'Pending', icon: Circle },
            { id: 'completed', label: 'Completed', icon: CheckCircle2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 flex items-center gap-1.5 transition-all
                  ${isActive
                    ? 'bg-gradient-brand text-white shadow-sm'
                    : 'bg-base-600/50 text-text-muted hover:text-text-primary hover:bg-base-500'
                  }
                `}
              >
                <Icon size={13} /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* Dropdowns & Search */}
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search by title, subject, chapter, or subtopic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-base-600/60 border border-border focus:border-primary-500 text-text-primary text-xs focus:outline-none transition-colors"
            />
          </div>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="w-full md:w-40 px-3 py-2 rounded-xl bg-base-600/60 border border-border text-text-primary text-xs focus:outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Subject Filter */}
          {subjectsList.length > 0 && (
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="w-full md:w-40 px-3 py-2 rounded-xl bg-base-600/60 border border-border text-text-primary text-xs focus:outline-none"
            >
              <option value="all">All Subjects</option>
              {subjectsList.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════════
          TASKS LIST VIEW
      ═══════════════════════════════════════════════════════════════════════════ */}
      {loading ? (
        <div className="py-16 text-center text-text-muted text-xs flex items-center justify-center gap-2">
          <RefreshCw size={16} className="animate-spin text-primary-400" /> Loading study planner tasks...
        </div>
      ) : tasks.length === 0 ? (
        <div className="py-16 text-center glass-card border border-dashed border-border rounded-2xl p-8">
          <div className="w-12 h-12 rounded-2xl bg-base-500 flex items-center justify-center mx-auto mb-3 text-text-muted">
            <Layers size={24} />
          </div>
          <h3 className="text-base font-bold text-text-primary mb-1">No tasks found</h3>
          <p className="text-xs text-text-muted mb-4 max-w-sm mx-auto">
            Get started by adding your first Normal Task or Topic-Based Subject Task.
          </p>
          <button
            onClick={() => {
              setEditingTask(null);
              setIsModalOpen(true);
            }}
            className="btn-primary px-4 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-2"
          >
            <Plus size={14} /> Create Task
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => {
            const isTopic = task.type === 'topic';
            const pCfg = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
            const deadlineInfo = formatDeadline(task.deadline);
            const isExpanded = expandedTasks[task._id];

            return (
              <div
                key={task._id}
                className={`
                  glass-card p-4 md:p-5 border transition-all duration-200 group
                  ${task.isCompleted ? 'opacity-70 border-border/50 bg-base-800/30' : 'border-border hover:border-primary-500/40'}
                `}
              >
                {/* Task Top Row Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Completion Checkbox */}
                    <button
                      onClick={() => handleToggleTask(task._id)}
                      className={`mt-0.5 shrink-0 transition-transform ${task.isCompleted ? 'text-success' : 'text-text-muted hover:text-primary-400 hover:scale-110'}`}
                      title={task.isCompleted ? 'Mark as pending' : 'Mark as complete'}
                    >
                      {task.isCompleted ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                    </button>

                    <div className="flex-1 min-w-0">
                      {/* Normal vs Topic Title & Breadcrumbs */}
                      {isTopic ? (
                        <div>
                          {/* Breadcrumb: Subject -> Chapter */}
                          <div className="flex items-center gap-1.5 text-xs text-text-muted font-medium mb-0.5">
                            <span className="px-2 py-0.5 rounded-md bg-primary-500/10 text-primary-300 font-bold border border-primary-500/20">
                              {task.subject}
                            </span>
                            <span>➔</span>
                            <span className="font-semibold text-text-secondary">{task.chapter}</span>
                          </div>
                          <h4 className={`text-base font-bold truncate ${task.isCompleted ? 'line-through text-text-muted' : 'text-text-primary'}`}>
                            {task.chapter}
                          </h4>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${CATEGORY_COLORS[task.category] || CATEGORY_COLORS.General}`}>
                              {task.category}
                            </span>
                            {task.subject && task.subject !== 'General' && (
                              <span className="text-xs text-text-muted font-medium">
                                • {task.subject}
                              </span>
                            )}
                          </div>
                          <h4 className={`text-base font-bold truncate ${task.isCompleted ? 'line-through text-text-muted' : 'text-text-primary'}`}>
                            {task.title}
                          </h4>
                        </div>
                      )}

                      {/* Notes snippet */}
                      {task.notes && (
                        <p className="text-xs text-text-secondary mt-1 line-clamp-1 italic">
                          &quot;{task.notes}&quot;
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Priority & Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase border ${pCfg.bg} ${pCfg.text} ${pCfg.border}`}>
                      {pCfg.label}
                    </span>

                    {deadlineInfo && (
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-medium border ${deadlineInfo.color}`}>
                        {deadlineInfo.label}
                      </span>
                    )}

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditingTask(task);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-text-muted hover:text-primary-400 hover:bg-base-500 transition-colors"
                        title="Edit task"
                      >
                        <Edit size={15} />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task._id)}
                        className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-base-500 transition-colors"
                        title="Delete task"
                      >
                        <Trash2 size={15} />
                      </button>

                      {isTopic && (
                        <button
                          onClick={() => toggleAccordion(task._id)}
                          className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-base-500 transition-colors"
                        >
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* ═══════════════════════════════════════════════════════════════════════════
                    TOPIC-BASED TASK SUBTOPICS & LEETCODE PROGRESS BAR
                ═══════════════════════════════════════════════════════════════════════════ */}
                {isTopic && (
                  <div className="mt-3 pt-3 border-t border-border/60">
                    {/* LeetCode Progress Bar */}
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
                        <Layers size={13} className="text-emerald-400" /> Subtopic Completion
                      </span>
                      <span className="text-xs font-bold text-emerald-400">
                        {task.subtopics?.filter((s) => s.isCompleted).length || 0} / {task.subtopics?.length || 0} ({task.progressPercentage}%)
                      </span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-base-700 overflow-hidden relative mb-3">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-accent-400 rounded-full transition-all duration-500"
                        style={{ width: `${task.progressPercentage}%` }}
                      />
                    </div>

                    {/* Subtopics Checklist Accordion */}
                    {isExpanded && (
                      <div className="space-y-1.5 pl-2 mt-2">
                        {task.subtopics.map((st) => (
                          <div
                            key={st._id}
                            onClick={() => handleToggleSubtopic(task._id, st._id)}
                            className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-base-600/50 cursor-pointer transition-colors"
                          >
                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${st.isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-border bg-base-700'}`}>
                              {st.isCompleted && <Check size={11} strokeWidth={3} />}
                            </div>
                            <span className={`text-xs font-medium ${st.isCompleted ? 'line-through text-text-muted' : 'text-text-secondary'}`}>
                              {st.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Planner Task Modal */}
      <PlannerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        initialData={editingTask}
      />
    </div>
  );
};

export default PlannerPage;
