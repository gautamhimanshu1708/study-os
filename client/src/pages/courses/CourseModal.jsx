import { useState, useEffect } from 'react';
import { X, BookOpen, Globe, User, ExternalLink, Sliders, CheckCircle2, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

const PLATFORMS = ['Udemy', 'Coursera', 'YouTube', 'edX', 'NPTEL', 'Pluralsight', 'LinkedIn Learning', 'Custom'];
const STATUSES = ['Not Started', 'In Progress', 'Completed'];

const CourseModal = ({ isOpen, onClose, onSave, initialData = null }) => {
  const [formData, setFormData] = useState({
    courseName: '',
    platform: 'Udemy',
    courseLink: '',
    instructorName: '',
    progressPercentage: 0,
    status: 'In Progress',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        courseName: initialData.courseName || '',
        platform: initialData.platform || 'Udemy',
        courseLink: initialData.courseLink || '',
        instructorName: initialData.instructorName || '',
        progressPercentage: initialData.progressPercentage || 0,
        status: initialData.status || 'In Progress',
        notes: initialData.notes || '',
      });
    } else {
      setFormData({
        courseName: '',
        platform: 'Udemy',
        courseLink: '',
        instructorName: '',
        progressPercentage: 0,
        status: 'In Progress',
        notes: '',
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      // Auto-sync status and progressPercentage
      if (name === 'progressPercentage') {
        const pct = Number(value);
        if (pct >= 100) updated.status = 'Completed';
        else if (pct === 0 && prev.status === 'Completed') updated.status = 'Not Started';
        else if (pct > 0 && pct < 100 && prev.status === 'Not Started') updated.status = 'In Progress';
      }

      if (name === 'status') {
        if (value === 'Completed') updated.progressPercentage = 100;
        else if (value === 'Not Started') updated.progressPercentage = 0;
        else if (value === 'In Progress' && prev.progressPercentage === 100) updated.progressPercentage = 50;
      }

      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.courseName.trim()) {
      toast.error('Course Name is required');
      return;
    }

    if (formData.courseLink && !formData.courseLink.startsWith('http://') && !formData.courseLink.startsWith('https://')) {
      toast.error('Course link must start with http:// or https://');
      return;
    }

    setIsSubmitting(true);

    try {
      await onSave({
        ...formData,
        progressPercentage: Number(formData.progressPercentage),
      });
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to save course');
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
              <BookOpen size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary">
                {initialData ? 'Edit Course' : 'Enroll New Course'}
              </h3>
              <p className="text-[11px] text-text-muted">
                Save enrolled course details, platform link, and track progress percentage.
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

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scroll">
          {/* Course Name */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5 flex items-center gap-1.5">
              <BookOpen size={14} className="text-primary-400" /> Course Name <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              name="courseName"
              value={formData.courseName}
              onChange={handleChange}
              placeholder="e.g. Advanced React & Next.js Masterclass"
              className="w-full px-3.5 py-2.5 rounded-xl bg-base-600/60 border border-border focus:border-primary-500 text-text-primary text-sm focus:outline-none transition-colors"
              required
            />
          </div>

          {/* Platform & Instructor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5 flex items-center gap-1.5">
                <Globe size={13} className="text-accent-500" /> Platform
              </label>
              <select
                name="platform"
                value={formData.platform}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl bg-base-600/60 border border-border focus:border-primary-500 text-text-primary text-xs focus:outline-none transition-colors"
              >
                {PLATFORMS.map((plat) => (
                  <option key={plat} value={plat}>
                    {plat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5 flex items-center gap-1.5">
                <User size={13} className="text-violet-400" /> Instructor Name
              </label>
              <input
                type="text"
                name="instructorName"
                value={formData.instructorName}
                onChange={handleChange}
                placeholder="e.g. Dr. Angela Yu, Colt Steele"
                className="w-full px-3 py-2 rounded-xl bg-base-600/60 border border-border focus:border-primary-500 text-text-primary text-xs focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Course URL / Link */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5 flex items-center gap-1.5">
              <ExternalLink size={14} className="text-emerald-400" /> Course Website Link
            </label>
            <input
              type="url"
              name="courseLink"
              value={formData.courseLink}
              onChange={handleChange}
              placeholder="https://www.udemy.com/course/your-course-link"
              className="w-full px-3.5 py-2.5 rounded-xl bg-base-600/60 border border-border focus:border-primary-500 text-text-primary text-xs focus:outline-none transition-colors"
            />
          </div>

          {/* Progress Slider & Status Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-base-600/40 border border-border">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
                  <Sliders size={13} className="text-emerald-400" /> Completion Progress
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
                <CheckCircle2 size={13} className="text-amber-400" /> Status
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
              <FileText size={14} className="text-text-muted" /> Additional Notes
            </label>
            <textarea
              name="notes"
              rows={2}
              value={formData.notes}
              onChange={handleChange}
              placeholder="e.g. Completed module 4 on Hooks, next up state management"
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
                'Enroll Course'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseModal;
