import { useState, useEffect, useCallback } from 'react';
import {
  Target, Plus, Search, Calendar, Tag, CheckCircle2, Clock, Trophy,
  RefreshCw, Trash2, Edit, Sliders, Check, ChevronDown, ChevronUp, Zap,
  Rocket, TrendingUp, Sparkles, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  updateGoalProgress,
  toggleMilestoneStatus,
  getGoalStats,
} from '../../api/goalApi';
import GoalModal from './GoalModal';

const CATEGORY_PRESETS = {
  Academic: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  Coding:   'bg-purple-500/15 text-purple-400 border-purple-500/30',
  Skill:    'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  Career:   'bg-amber-500/15 text-amber-400 border-amber-500/30',
  Personal: 'bg-pink-500/15 text-pink-400 border-pink-500/30',
};

const STATUS_PRESETS = {
  'Not Started': { bg: 'bg-base-500/60 text-text-muted border-border' },
  'In Progress': { bg: 'bg-primary-500/15 text-primary-400 border-primary-500/30' },
  Achieved:      { bg: 'bg-success/15 text-success border-success/30 font-bold' },
  Missed:        { bg: 'bg-red-500/15 text-red-400 border-red-500/30' },
};

const GoalPage = () => {
  const [goals, setGoals] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'Short Term' | 'Long Term' | 'In Progress' | 'Achieved'
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  // Accordion state for milestones checklist
  const [expandedGoals, setExpandedGoals] = useState({});

  const fetchGoalData = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (activeTab === 'Short Term') params.goalType = 'Short Term';
      if (activeTab === 'Long Term') params.goalType = 'Long Term';
      if (activeTab === 'In Progress') params.status = 'In Progress';
      if (activeTab === 'Achieved') params.status = 'Achieved';
      if (categoryFilter !== 'all') params.category = categoryFilter;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const [goalsRes, statsRes] = await Promise.all([
        getGoals(params),
        getGoalStats(),
      ]);

      setGoals(goalsRes.data || []);
      setStats(statsRes.data || null);

      // Auto expand goals with milestones
      const expMap = {};
      (goalsRes.data || []).forEach((g) => {
        if (g.milestones && g.milestones.length > 0) expMap[g._id] = true;
      });
      setExpandedGoals((prev) => ({ ...expMap, ...prev }));
    } catch (err) {
      console.error('Failed to fetch goal data:', err);
      toast.error('Failed to load goals');
    } finally {
      setLoading(false);
    }
  }, [activeTab, categoryFilter, searchQuery]);

  useEffect(() => {
    fetchGoalData();
  }, [fetchGoalData]);

  // Handle Save (Create / Update)
  const handleSaveGoal = async (formData) => {
    try {
      if (editingGoal) {
        await updateGoal(editingGoal._id, formData);
        toast.success('Goal updated successfully');
      } else {
        await createGoal(formData);
        toast.success('New goal created!');
      }
      fetchGoalData();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to save goal');
    }
  };

  // Delete Goal
  const handleDeleteGoal = async (id) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) return;
    try {
      await deleteGoal(id);
      toast.success('Goal deleted');
      fetchGoalData();
    } catch (err) {
      toast.error('Failed to delete goal');
    }
  };

  // Quick progress slider update
  const handleProgressChange = async (id, newPct) => {
    try {
      await updateGoalProgress(id, newPct);
      fetchGoalData();
    } catch (err) {
      toast.error('Failed to update progress');
    }
  };

  // Toggle sub-milestone completion inside goal
  const handleToggleMilestone = async (goalId, milestoneId) => {
    try {
      await toggleMilestoneStatus(goalId, milestoneId);
      fetchGoalData();
    } catch (err) {
      toast.error('Failed to update milestone checkpoint');
    }
  };

  const toggleAccordion = (goalId) => {
    setExpandedGoals((prev) => ({ ...prev, [goalId]: !prev[goalId] }));
  };

  // Deadline calculation helper
  const formatDeadline = (dateStr, status) => {
    if (status === 'Achieved') return { label: 'Goal Achieved 🏆', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 font-bold' };
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { label: 'Deadline Missed', color: 'bg-red-500/20 text-red-400 border-red-500/30' };
    if (diffDays === 0) return { label: 'Target Today', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30 font-bold' };
    if (diffDays === 1) return { label: '1 day left', color: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25' };
    return { label: `${diffDays} days left`, color: 'bg-base-600/60 text-text-secondary border-border' };
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1440px] mx-auto space-y-6 pb-24 md:pb-12 animate-fade-in">
      {/* ═══════════════════════════════════════════════════════════════════════════
          HEADER BAR
      ═══════════════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight flex items-center gap-2.5">
            <span className="p-2 rounded-2xl bg-primary-500/15 border border-primary-500/30 text-primary-400">
              <Target size={24} />
            </span>
            Goal Manager
          </h1>
          <p className="text-xs md:text-sm text-text-secondary mt-1">
            Set and track short-term tactical goals and long-term academic & career milestones.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingGoal(null);
            setIsModalOpen(true);
          }}
          className="btn-primary py-2.5 px-4 rounded-xl text-xs md:text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20 hover:scale-[1.02] transition-transform"
        >
          <Plus size={16} /> Set Goal
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════════
          GOAL STATISTICS HEADER CARDS
      ═══════════════════════════════════════════════════════════════════════════ */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <div className="glass-card p-4 md:p-5 border border-border flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Total Goals</p>
              <p className="text-2xl font-black text-text-primary mt-1">{stats.totalGoals}</p>
              <p className="text-[10px] text-text-secondary mt-0.5">Academic & career targets</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-primary-500/15 border border-primary-500/30 flex items-center justify-center text-primary-400">
              <Target size={20} />
            </div>
          </div>

          <div className="glass-card p-4 md:p-5 border border-border flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Short Term</p>
              <p className="text-2xl font-black text-amber-400 mt-1">{stats.shortTermCount}</p>
              <p className="text-[10px] text-text-secondary mt-0.5">Tactical 30-day goals</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Zap size={20} />
            </div>
          </div>

          <div className="glass-card p-4 md:p-5 border border-border flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Long Term</p>
              <p className="text-2xl font-black text-violet-400 mt-1">{stats.longTermCount}</p>
              <p className="text-[10px] text-text-secondary mt-0.5">Strategic milestones</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <Rocket size={20} />
            </div>
          </div>

          <div className="glass-card p-4 md:p-5 border border-border flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Achieved Goals</p>
              <p className="text-2xl font-black text-emerald-400 mt-1">{stats.achievedCount}</p>
              <p className="text-[10px] text-text-secondary mt-0.5">Avg progress: {stats.averageProgress}%</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Trophy size={20} />
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════
          TOOLBAR (SEARCH & TABS)
      ═══════════════════════════════════════════════════════════════════════════ */}
      <div className="glass-card p-3 md:p-4 space-y-3 border border-border">
        {/* Tab Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scroll">
          {[
            { id: 'all', label: 'All Goals', icon: Target },
            { id: 'Short Term', label: 'Short Term', icon: Zap },
            { id: 'Long Term', label: 'Long Term', icon: Rocket },
            { id: 'In Progress', label: 'In Progress', icon: Clock },
            { id: 'Achieved', label: 'Achieved', icon: Trophy },
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

        {/* Search & Category Filter Row */}
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search by goal title, category, or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-base-600/60 border border-border focus:border-primary-500 text-text-primary text-xs focus:outline-none transition-colors"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full md:w-44 px-3 py-2 rounded-xl bg-base-600/60 border border-border text-text-primary text-xs focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="Academic">Academic</option>
            <option value="Coding">Coding</option>
            <option value="Skill">Skill</option>
            <option value="Career">Career</option>
            <option value="Personal">Personal</option>
          </select>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════════
          GOALS CARDS GRID
      ═══════════════════════════════════════════════════════════════════════════ */}
      {loading ? (
        <div className="py-16 text-center text-text-muted text-xs flex items-center justify-center gap-2">
          <RefreshCw size={16} className="animate-spin text-primary-400" /> Loading study goals...
        </div>
      ) : goals.length === 0 ? (
        <div className="py-16 text-center glass-card border border-dashed border-border rounded-2xl p-8">
          <div className="w-12 h-12 rounded-2xl bg-base-500 flex items-center justify-center mx-auto mb-3 text-text-muted">
            <Target size={24} />
          </div>
          <h3 className="text-base font-bold text-text-primary mb-1">No goals found</h3>
          <p className="text-xs text-text-muted mb-4 max-w-sm mx-auto">
            Set your first short-term or long-term academic goal (e.g. &quot;Complete DSA in 30 days&quot;).
          </p>
          <button
            onClick={() => {
              setEditingGoal(null);
              setIsModalOpen(true);
            }}
            className="btn-primary px-4 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-2"
          >
            <Plus size={14} /> Set Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((goal) => {
            const isShortTerm = goal.goalType === 'Short Term';
            const catBadge = CATEGORY_PRESETS[goal.category] || CATEGORY_PRESETS.Academic;
            const statusCfg = STATUS_PRESETS[goal.status] || STATUS_PRESETS['In Progress'];
            const deadlineInfo = formatDeadline(goal.targetDate, goal.status);
            const isExpanded = expandedGoals[goal._id];

            return (
              <div
                key={goal._id}
                className="glass-card p-5 border border-border hover:border-primary-500/40 transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  {/* Top Bar: Goal Type & Category */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider border flex items-center gap-1 ${
                        isShortTerm
                          ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                          : 'bg-violet-500/15 text-violet-400 border-violet-500/30'
                      }`}
                    >
                      {isShortTerm ? <Zap size={11} /> : <Rocket size={11} />}
                      {goal.goalType}
                    </span>

                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${catBadge}`}>
                      {goal.category}
                    </span>
                  </div>

                  {/* Goal Title */}
                  <h3 className="text-base font-bold text-text-primary leading-snug line-clamp-2 mb-2 group-hover:text-primary-400 transition-colors">
                    {goal.title}
                  </h3>

                  {/* Deadline & Status Row */}
                  <div className="flex items-center gap-2 mb-4 flex-wrap">
                    {deadlineInfo && (
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold border ${deadlineInfo.color}`}>
                        {deadlineInfo.label}
                      </span>
                    )}

                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${statusCfg.bg}`}>
                      {goal.status}
                    </span>
                  </div>

                  {/* Additional notes snippet */}
                  {goal.notes && (
                    <p className="text-[11px] text-text-muted italic bg-base-600/30 p-2 rounded-lg mb-4 border border-border/40 line-clamp-2">
                      &quot;{goal.notes}&quot;
                    </p>
                  )}
                </div>

                <div>
                  {/* Progress Bar & Slider */}
                  <div className="space-y-1.5 mb-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-text-secondary flex items-center gap-1">
                        <Sliders size={12} className="text-emerald-400" /> Completion Progress
                      </span>
                      <span className="font-bold text-emerald-400">{goal.progressPercentage}%</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-base-700 overflow-hidden relative">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-accent-400 rounded-full transition-all duration-300"
                        style={{ width: `${goal.progressPercentage}%` }}
                      />
                    </div>

                    {/* Slider */}
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={goal.progressPercentage}
                      onChange={(e) => handleProgressChange(goal._id, Number(e.target.value))}
                      className="w-full accent-emerald-400 bg-transparent h-1.5 cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
                    />
                  </div>

                  {/* Milestone Sub-checkpoints Accordion */}
                  {goal.milestones && goal.milestones.length > 0 && (
                    <div className="mb-3 pt-2 border-t border-border/40">
                      <button
                        onClick={() => toggleAccordion(goal._id)}
                        className="w-full flex items-center justify-between text-xs text-text-muted hover:text-text-primary transition-colors py-1"
                      >
                        <span className="font-medium flex items-center gap-1">
                          <Sparkles size={12} className="text-emerald-400" /> Checkpoints ({goal.milestones.filter(m => m.isCompleted).length}/{goal.milestones.length})
                        </span>
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>

                      {isExpanded && (
                        <div className="space-y-1 mt-2 pl-1 max-h-32 overflow-y-auto custom-scroll">
                          {goal.milestones.map((m) => (
                            <div
                              key={m._id}
                              onClick={() => handleToggleMilestone(goal._id, m._id)}
                              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-base-600/50 cursor-pointer transition-colors"
                            >
                              <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors ${m.isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-border bg-base-700'}`}>
                                {m.isCompleted && <Check size={10} strokeWidth={3} />}
                              </div>
                              <span className={`text-[11px] ${m.isCompleted ? 'line-through text-text-muted' : 'text-text-secondary'}`}>
                                {m.title}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Buttons Row */}
                  <div className="flex items-center justify-between gap-2 pt-3 border-t border-border/60">
                    <button
                      onClick={() => handleProgressChange(goal._id, 100)}
                      disabled={goal.status === 'Achieved'}
                      className={`
                        flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all
                        ${goal.status === 'Achieved'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-primary-500/15 border border-primary-500/30 text-primary-300 hover:bg-primary-500/25'
                        }
                      `}
                    >
                      <Trophy size={13} /> {goal.status === 'Achieved' ? 'Goal Achieved!' : 'Mark Achieved'}
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingGoal(goal);
                          setIsModalOpen(true);
                        }}
                        className="p-2 rounded-xl text-text-muted hover:text-primary-400 hover:bg-base-500 border border-transparent hover:border-border transition-colors"
                        title="Edit goal"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteGoal(goal._id)}
                        className="p-2 rounded-xl text-text-muted hover:text-danger hover:bg-base-500 border border-transparent hover:border-border transition-colors"
                        title="Delete goal"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Goal Modal Dialog */}
      <GoalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveGoal}
        initialData={editingGoal}
      />
    </div>
  );
};

export default GoalPage;
