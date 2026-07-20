import { useState, useEffect } from 'react';
import { X, Calendar, Clock, CheckSquare, Timer, RefreshCw, FileText, Flame } from 'lucide-react';
import toast from 'react-hot-toast';
import { autoSyncDailyActivity } from '../../api/consistencyApi';

const DailyLogModal = ({ isOpen, onClose, onSave, initialData = null, selectedDate = null }) => {
  const [date, setDate] = useState('');
  const [studyHours, setStudyHours] = useState(0);
  const [focusSessionsCompleted, setFocusSessionsCompleted] = useState(0);
  const [tasksCompleted, setTasksCompleted] = useState(0);
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const targetDateStr = selectedDate || (initialData?.date) || new Date().toISOString().split('T')[0];
    setDate(targetDateStr);

    if (initialData) {
      setStudyHours(initialData.studyHours || 0);
      setFocusSessionsCompleted(initialData.focusSessionsCompleted || initialData.timetableSessionsCompleted || 0);
      setTasksCompleted(initialData.tasksCompleted || 0);
      setNotes(initialData.notes || '');
    } else {
      setStudyHours(0);
      setFocusSessionsCompleted(0);
      setTasksCompleted(0);
      setNotes('');
    }
  }, [initialData, selectedDate, isOpen]);

  if (!isOpen) return null;

  const handleAutoSync = async () => {
    setIsSyncing(true);
    try {
      const res = await autoSyncDailyActivity(date);
      if (res.data) {
        setStudyHours(res.data.studyHours || 0);
        setFocusSessionsCompleted(res.data.focusSessionsCompleted || 0);
        setTasksCompleted(res.data.tasksCompleted || 0);
        toast.success('Synced completed tasks & focus sessions!');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to auto-sync activity');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!date) {
      toast.error('Date is required');
      return;
    }

    setIsSubmitting(true);

    try {
      await onSave({
        date,
        studyHours: Number(studyHours),
        focusSessionsCompleted: Number(focusSessionsCompleted),
        tasksCompleted: Number(tasksCompleted),
        notes,
      });
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to log daily activity');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-primary/80 backdrop-blur-md animate-fade-in">
      <div
        className="glass-card w-full max-w-md overflow-hidden border border-border shadow-card animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface-secondary/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Flame size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary">
                Log Daily Activity
              </h3>
              <p className="text-[11px] text-text-muted">
                Record your study hours, sessions, and tasks for {date}.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Auto Sync Banner */}
        <div className="px-6 pt-4">
          <button
            type="button"
            onClick={handleAutoSync}
            disabled={isSyncing}
            className="w-full py-2 px-3 rounded-xl bg-primary-500/10 border border-primary-500/30 text-primary-400 hover:bg-primary-500/20 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
          >
            <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
            {isSyncing ? 'Syncing...' : 'Auto-Sync Completed Tasks & Sessions'}
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scroll">
          {/* Date Picker */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5 flex items-center gap-1.5">
              <Calendar size={13} className="text-rose-400" /> Log Date <span className="text-danger">*</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-surface-secondary border border-border focus:border-primary-500 text-text-primary text-xs focus:outline-none transition-colors"
              required
            />
          </div>

          {/* Study Hours */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
                <Clock size={13} className="text-amber-400" /> Study Hours Logged
              </label>
              <span className="text-xs font-bold text-amber-400">{studyHours} hrs</span>
            </div>
            <input
              type="range"
              min="0"
              max="16"
              step="0.5"
              value={studyHours}
              onChange={(e) => setStudyHours(Number(e.target.value))}
              className="w-full accent-amber-400 bg-surface-secondary h-2 rounded-lg cursor-pointer"
            />
          </div>

          {/* Focus Sessions & Tasks Completed */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5 flex items-center gap-1.5">
                <Timer size={13} className="text-accent-500" /> Focus Sessions
              </label>
              <input
                type="number"
                min="0"
                value={focusSessionsCompleted}
                onChange={(e) => setFocusSessionsCompleted(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2 rounded-xl bg-surface-secondary border border-border focus:border-primary-500 text-text-primary text-xs focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5 flex items-center gap-1.5">
                <CheckSquare size={13} className="text-emerald-400" /> Tasks Completed
              </label>
              <input
                type="number"
                min="0"
                value={tasksCompleted}
                onChange={(e) => setTasksCompleted(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2 rounded-xl bg-surface-secondary border border-border focus:border-primary-500 text-text-primary text-xs focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5 flex items-center gap-1.5">
              <FileText size={13} className="text-text-muted" /> Daily Reflections / Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Completed 4 LeetCode medium questions, revised DBMS normalization"
              className="w-full px-3 py-2 rounded-xl bg-surface-secondary border border-border focus:border-primary-500 text-text-primary text-xs focus:outline-none transition-colors"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
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
              ) : (
                'Save Activity Log'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DailyLogModal;
