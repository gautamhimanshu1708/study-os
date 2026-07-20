import { useState, useEffect } from 'react';
import { X, CheckSquare, Layers, BookOpen, AlertCircle, Calendar, Plus, Trash2, Tag, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = ['Assignment', 'Lecture', 'Project', 'Revision', 'Exam', 'General'];

const PRIORITIES = [
  { value: 'low', label: 'Low', color: 'bg-success/15 text-success border-success/30 hover:bg-success/25' },
  { value: 'medium', label: 'Medium', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/25' },
  { value: 'high', label: 'High', color: 'bg-danger/15 text-danger border-danger/30 hover:bg-danger/25' },
  { value: 'critical', label: 'Critical', color: 'bg-red-500/20 text-red-400 border-red-500/40 hover:bg-red-500/30 font-bold' },
];

const DEFAULT_SUBJECTS = ['Java', 'Python', 'Mathematics', 'Physics', 'Chemistry', 'Data Structures', 'Web Dev', 'English'];

const PlannerModal = ({ isOpen, onClose, onSave, initialData = null }) => {
  const [taskType, setTaskType] = useState('normal'); // 'normal' | 'topic'

  const [formData, setFormData] = useState({
    title: '',
    subject: 'Java',
    chapter: '',
    category: 'Assignment',
    priority: 'medium',
    deadline: '',
    notes: '',
  });

  // Subtopics array for topic-based tasks (e.g. Inheritance, Polymorphism, Abstraction)
  const [subtopicList, setSubtopicList] = useState(['Inheritance', 'Polymorphism', 'Abstraction']);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTaskType(initialData.type || 'normal');
      setFormData({
        title: initialData.title || '',
        subject: initialData.subject || 'Java',
        chapter: initialData.chapter || '',
        category: initialData.category || 'Assignment',
        priority: initialData.priority || 'medium',
        deadline: initialData.deadline ? new Date(initialData.deadline).toISOString().split('T')[0] : '',
        notes: initialData.notes || '',
      });

      if (initialData.type === 'topic' && Array.isArray(initialData.subtopics)) {
        setSubtopicList(initialData.subtopics.map((st) => (typeof st === 'string' ? st : st.name)));
      }
    } else {
      setTaskType('normal');
      setFormData({
        title: '',
        subject: 'Java',
        chapter: '',
        category: 'Assignment',
        priority: 'medium',
        deadline: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], // Default 2 days from now
        notes: '',
      });
      setSubtopicList(['Inheritance', 'Polymorphism', 'Abstraction']);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Subtopic List Handlers
  const handleAddSubtopic = () => {
    setSubtopicList((prev) => [...prev, '']);
  };

  const handleSubtopicChange = (index, value) => {
    setSubtopicList((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const handleRemoveSubtopic = (index) => {
    if (subtopicList.length <= 1) {
      toast.error('Topic task must have at least one subtopic');
      return;
    }
    setSubtopicList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (taskType === 'normal' && !formData.title.trim()) {
      toast.error('Task Title is required');
      return;
    }

    if (taskType === 'topic') {
      if (!formData.subject.trim()) {
        toast.error('Subject is required for Topic Task');
        return;
      }
      if (!formData.chapter.trim()) {
        toast.error('Chapter name is required for Topic Task');
        return;
      }
      const validSubtopics = subtopicList.filter((s) => s.trim().length > 0);
      if (validSubtopics.length === 0) {
        toast.error('Please add at least one subtopic');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const payload = {
        type: taskType,
        title: taskType === 'topic' ? `${formData.chapter}` : formData.title,
        subject: formData.subject || 'General',
        chapter: taskType === 'topic' ? formData.chapter : '',
        category: taskType === 'normal' ? formData.category : 'General',
        priority: formData.priority,
        deadline: formData.deadline || null,
        notes: formData.notes,
      };

      if (taskType === 'topic') {
        payload.subtopics = subtopicList
          .filter((s) => s.trim().length > 0)
          .map((s) => ({ name: s.trim(), isCompleted: false }));
      }

      await onSave(payload);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to save task');
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
              {taskType === 'normal' ? <CheckSquare size={18} /> : <Layers size={18} />}
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary">
                {initialData ? 'Edit Task' : 'Add New Task'}
              </h3>
              <p className="text-[11px] text-text-muted">
                Choose between Normal Task or Topic-Based Hierarchy (`Subject &rarr; Chapter &rarr; Subtopic`)
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

        {/* Task Type Switcher */}
        <div className="px-6 pt-4">
          <div className="grid grid-cols-2 gap-2 bg-base-600/50 p-1 rounded-xl border border-border">
            <button
              type="button"
              onClick={() => setTaskType('normal')}
              className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                taskType === 'normal'
                  ? 'bg-gradient-brand text-white shadow-sm'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              <CheckSquare size={14} /> Normal Task
            </button>
            <button
              type="button"
              onClick={() => setTaskType('topic')}
              className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                taskType === 'topic'
                  ? 'bg-gradient-brand text-white shadow-sm'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              <Layers size={14} /> Topic-Based Task
            </button>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scroll">
          
          {/* TYPE 1: NORMAL TASK FIELDS */}
          {taskType === 'normal' ? (
            <>
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1.5 flex items-center gap-1.5">
                  <CheckSquare size={14} className="text-primary-400" /> Task Title <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Complete Assignment, Watch Lecture, Submit Project"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-base-600/60 border border-border focus:border-primary-500 text-text-primary text-sm focus:outline-none transition-colors"
                  required
                />
              </div>

              {/* Category & Subject */}
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
                    <BookOpen size={13} className="text-violet-400" /> Subject (Optional)
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="e.g. Mathematics, CS"
                    className="w-full px-3 py-2 rounded-xl bg-base-600/60 border border-border focus:border-primary-500 text-text-primary text-xs focus:outline-none transition-colors"
                    list="subject-list"
                  />
                </div>
              </div>
            </>
          ) : (
            /* TYPE 2: TOPIC-BASED TASK FIELDS (Subject -> Chapter -> Subtopic) */
            <>
              <div className="p-3 rounded-xl bg-primary-500/10 border border-primary-500/25 text-xs text-primary-300">
                <span className="font-bold">Hierarchy Preview:</span> {formData.subject || 'Subject'} ➔ {formData.chapter || 'Chapter'} ➔ [{subtopicList.filter(s => s).join(', ') || 'Subtopics'}]
              </div>

              {/* Subject & Chapter */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1.5 flex items-center gap-1.5">
                    <BookOpen size={14} className="text-primary-400" /> Subject Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="e.g. Java, Physics, Data Structures"
                    className="w-full px-3 py-2.5 rounded-xl bg-base-600/60 border border-border focus:border-primary-500 text-text-primary text-xs focus:outline-none transition-colors"
                    list="subject-list"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1.5 flex items-center gap-1.5">
                    <Layers size={14} className="text-accent-500" /> Chapter Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="chapter"
                    value={formData.chapter}
                    onChange={handleChange}
                    placeholder="e.g. OOPS, Wave Optics, Trees"
                    className="w-full px-3 py-2.5 rounded-xl bg-base-600/60 border border-border focus:border-primary-500 text-text-primary text-xs focus:outline-none transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Subtopics Checklist Manager */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
                    <Tag size={14} className="text-emerald-400" /> Subtopics Checklist <span className="text-danger">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAddSubtopic}
                    className="text-[11px] text-primary-400 hover:text-primary-300 font-semibold flex items-center gap-1"
                  >
                    <Plus size={12} /> Add Subtopic
                  </button>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scroll">
                  {subtopicList.map((subtopic, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="text-xs font-bold text-text-muted w-5 shrink-0 text-right">{index + 1}.</span>
                      <input
                        type="text"
                        value={subtopic}
                        onChange={(e) => handleSubtopicChange(index, e.target.value)}
                        placeholder={`Subtopic ${index + 1} (e.g. Inheritance, Polymorphism)`}
                        className="flex-1 px-3 py-1.5 rounded-xl bg-base-600/60 border border-border focus:border-primary-500 text-text-primary text-xs focus:outline-none transition-colors"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSubtopic(index)}
                        className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-base-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <datalist id="subject-list">
            {DEFAULT_SUBJECTS.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>

          {/* Priority & Deadline Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5 flex items-center gap-1.5">
                <Calendar size={13} className="text-rose-400" /> Deadline Date
              </label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl bg-base-600/60 border border-border focus:border-primary-500 text-text-primary text-xs focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5 flex items-center gap-1.5">
                <AlertCircle size={13} className="text-amber-400" /> Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl bg-base-600/60 border border-border focus:border-primary-500 text-text-primary text-xs focus:outline-none transition-colors capitalize"
              >
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label} Priority
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
              placeholder="e.g. Reference textbook chapter 4, review past year questions"
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
                'Add Task'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlannerModal;
