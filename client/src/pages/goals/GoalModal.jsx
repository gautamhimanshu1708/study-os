import { useState, useEffect } from 'react';
import { X, Target, Calendar, Tag, Sliders, CheckCircle2, Plus, Trash2, FileText, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = ['Academic', 'Coding', 'Skill', 'Career', 'Personal'];
const STATUSES = ['In Progress', 'Achieved', 'Not Started', 'Missed'];

const GoalModal = ({ isOpen, onClose, onSave, initialData = null }) => {
  const [goalType, setGoalType] = useState('Short Term'); // 'Short Term' | 'Long Term'

  const [formData, setFormData] = useState({
    title: '',
    category: 'Academic',
    targetDate: '',
    progressPercentage: 0,
    status: 'In Progress',
    notes: '',
  });

  // Milestones array for sub-targets
  const [milestonesList, setMilestonesList] = useState([]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setGoalType(initialData.goalType || 'Short Term');
      setFormData({
        title: initialData.title || '',
        category: initialData.category || 'Academic',
        targetDate: initialData.targetDate ? new Date(initialData.targetDate).toISOString().split('T')[0] : '',
        progressPercentage: initialData.progressPercentage || 0,
        status: initialData.status || 'In Progress',
        notes: initialData.notes || '',
      });

      if (Array.isArray(initialData.milestones)) {
        setMilestonesList(initialData.milestones.map((m) => (typeof m === 'string' ? { title: m } : { title: m.title })));
      } else {
        setMilestonesList([]);
      }
    } else {
      setGoalType('Short Term');
      setFormData({
        title: '',
        category: 'Academic',
        targetDate: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0], // Default 30 days deadline
        progressPercentage: 0,
        status: 'In Progress',
        notes: '',
      });
      setMilestonesList([
        { title: 'Arrays & Strings' },
        { title: 'Trees & Graphs' },
        { title: 'Dynamic Programming' },
      ]);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      if (name === 'progressPercentage') {
        const pct = Number(value);
        if (pct >= 100) updated.status = 'Achieved';
        else if (pct === 0 && prev.status === 'Achieved') updated.status = 'Not Started';
        else if (pct > 0 && pct < 100 && prev.status === 'Not Started') updated.status = 'In Progress';
      }

      if (name === 'status') {
        if (value === 'Achieved') updated.progressPercentage = 100;
        else if (value === 'Not Started') updated.progressPercentage = 0;
        else if (value === 'In Progress' && prev.progressPercentage === 100) updated.progressPercentage = 50;
      }

      return updated;
    });
  };

  // Milestone list handlers
  const handleAddMilestone = () => {
    setMilestonesList((prev) => [...prev, { title: '' }]);
  };

  const handleMilestoneChange = (index, value) => {
    setMilestonesList((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], title: value };
      return updated;
    });
  };

  const handleRemoveMilestone = (index) => {
    setMilestonesList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Goal Title is required');
      return;
    }

    if (!formData.targetDate) {
      toast.error('Target deadline date is required');
      return;
    }

    setIsSubmitting(true);

    try {
      const validMilestones = milestonesList
        .filter((m) => m.title.trim().length > 0)
        .map((m) => ({ title: m.title.trim(), isCompleted: false }));

      await onSave({
        ...formData,
        goalType,
        progressPercentage: Number(formData.progressPercentage),
        milestones: validMilestones,
      });
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to save goal');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-base-900/80 backdrop-blur-md animate-fade-in">
      <div
        className="glass-card w-full max-w-lg overflow-hidden border border-border shadow-card animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-base-800/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary-500/15 border border-primary-500/30 flex items-center justify-center text-primary-400">
              <Target size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary">
                {initialData ? 'Edit Goal' : 'Create New Goal'}
              </h3>
              <p className="text-[11px] text-text-muted">
                Track short term or long term academic, coding, and personal goals.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-base-500 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Goal Type Switcher */}
        <div className="px-6 pt-4">
          <div className="grid grid-cols-2 gap-2 bg-base-600/50 p-1 rounded-xl border border-border">
            <button
              type="button"
              onClick={() => setGoalType('Short Term')}
              className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                goalType === 'Short Term'
                  ? 'bg-gradient-brand text-white shadow-sm'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              Short Term Goal
            </button>
            <button
              type="button"
              onClick={() => setGoalType('Long Term')}
              className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                goalType === 'Long Term'
                  ? 'bg-gradient-brand text-white shadow-sm'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              Long Term Goal
            </button>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scroll">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5 flex items-center gap-1.5">
              <Target size={14} className="text-primary-400" /> Goal Title <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Complete DSA in 30 days, Finish Java, Achieve 9 CGPA"
              className="w-full px-3.5 py-2.5 rounded-xl bg-base-600/60 border border-border focus:border-primary-500 text-text-primary text-sm focus:outline-none transition-colors"
              required
            />
          </div>

          {/* Category & Target Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5 flex items-center gap-1.5">
                <Tag size={13} className="text-accent-500" /> Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl bg-base-600/60 border border-border focus:border-primary-500 text-text-primary text-xs focus:outline-none transition-colors"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5 flex items-center gap-1.5">
                <Calendar size={13} className="text-rose-400" /> Deadline Date <span className="text-danger">*</span>
              </label>
              <input
                type="date"
                name="targetDate"
                value={formData.targetDate}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl bg-base-600/60 border border-border focus:border-primary-500 text-text-primary text-xs focus:outline-none transition-colors"
                required
              />
            </div>
          </div>

          {/* Milestone Sub-targets Builder */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
                <Sparkles size={14} className="text-emerald-400" /> Milestone Checkpoints (Sub-goals)
              </label>
              <button
                type="button"
                onClick={handleAddMilestone}
                className="text-[11px] text-primary-400 hover:text-primary-300 font-semibold flex items-center gap-1"
              >
                <Plus size={12} /> Add Milestone
              </button>
            </div>

            {milestonesList.length === 0 ? (
              <p className="text-[11px] text-text-muted italic py-1">No milestones added yet. Add sub-goals for automatic progress calculation.</p>
            ) : (
              <div className="space-y-2 max-h-36 overflow-y-auto pr-1 custom-scroll">
                {milestonesList.map((m, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-xs font-bold text-text-muted w-5 shrink-0 text-right">{index + 1}.</span>
                    <input
                      type="text"
                      value={m.title}
                      onChange={(e) => handleMilestoneChange(index, e.target.value)}
                      placeholder={`Checkpoint ${index + 1} (e.g. Arrays & Strings)`}
                      className="flex-1 px-3 py-1.5 rounded-xl bg-base-600/60 border border-border focus:border-primary-500 text-text-primary text-xs focus:outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveMilestone(index)}
                      className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-base-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Progress Slider & Status Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-base-600/40 border border-border">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
                  <Sliders size={13} className="text-emerald-400" /> Progress
                </label>
                <span className="text-xs font-bold text-emerald-400">{formData.progressPercentage}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                name="progressPercentage"
                value={formData.progressPercentage}
                onChange={handleChange}
                className="w-full accent-emerald-400 bg-base-700 h-2 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5 flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-amber-400" /> Goal Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-1.5 rounded-xl bg-base-600/80 border border-border focus:border-primary-500 text-text-primary text-xs focus:outline-none transition-colors"
              >
                {STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5 flex items-center gap-1.5">
              <FileText size={14} className="text-text-muted" /> Additional Notes & Strategy
            </label>
            <textarea
              name="notes"
              rows={2}
              value={formData.notes}
              onChange={handleChange}
              placeholder="e.g. Practice 3 LeetCode problems daily, revise notes every weekend"
              className="w-full px-3.5 py-2 rounded-xl bg-base-600/60 border border-border focus:border-primary-500 text-text-primary text-xs focus:outline-none transition-colors"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-base-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary py-2 px-5 text-xs font-semibold rounded-xl flex items-center gap-2"
            >
              {isSubmitting ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : initialData ? (
                'Save Changes'
              ) : (
                'Set Goal'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GoalModal;
