import { useState, useEffect } from 'react';
import { Plus, CalendarClock, Trash2, Edit3, CheckCircle2, Circle, Search, X, AlertTriangle } from 'lucide-react';
import { getDeadlines, createDeadline, updateDeadline, deleteDeadline, toggleDeadline } from '../../api/deadlineApi';
import toast from 'react-hot-toast';

const CATEGORIES = ['Exam', 'Assignment', 'Project', 'Placement', 'Internship', 'Personal'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

const PRIORITY_COLORS = {
  Low:      'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  Medium:   'text-amber-400 bg-amber-500/10 border-amber-500/20',
  High:     'text-orange-400 bg-orange-500/10 border-orange-500/20',
  Critical: 'text-red-400 bg-red-500/10 border-red-500/20',
};

const CATEGORY_COLORS = {
  Exam:       'text-rose-400 bg-rose-500/10',
  Assignment: 'text-blue-400 bg-blue-500/10',
  Project:    'text-violet-400 bg-violet-500/10',
  Placement:  'text-cyan-400 bg-cyan-500/10',
  Internship: 'text-emerald-400 bg-emerald-500/10',
  Personal:   'text-amber-400 bg-amber-500/10',
};

export default function DeadlinesPage() {
  const [deadlines, setDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const [form, setForm] = useState({
    title: '', description: '', deadlineDate: '', priority: 'Medium', category: 'Assignment',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter !== 'all') params.category = filter;
      const res = await getDeadlines(params);
      setDeadlines(res.data || []);
    } catch { toast.error('Failed to load deadlines'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [filter]);

  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setForm({
        title: item.title, description: item.description || '',
        deadlineDate: item.deadlineDate ? new Date(item.deadlineDate).toISOString().split('T')[0] : '',
        priority: item.priority, category: item.category,
      });
    } else {
      setEditingItem(null);
      setForm({ title: '', description: '', deadlineDate: '', priority: 'Medium', category: 'Assignment' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.deadlineDate) { toast.error('Title and date are required'); return; }
    try {
      if (editingItem) {
        await updateDeadline(editingItem._id, form);
        toast.success('Deadline updated');
      } else {
        await createDeadline(form);
        toast.success('Deadline created');
      }
      setIsModalOpen(false);
      fetchData();
    } catch { toast.error('Failed to save deadline'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this deadline?')) return;
    try { await deleteDeadline(id); toast.success('Deleted'); fetchData(); }
    catch { toast.error('Failed to delete'); }
  };

  const handleToggle = async (id) => {
    try { await toggleDeadline(id); fetchData(); }
    catch { toast.error('Failed to toggle'); }
  };

  const getDaysLeft = (date) => {
    const diff = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return 'Overdue';
    if (diff === 0) return 'Today';
    if (diff === 1) return '1 day';
    return `${diff} days`;
  };

  const filtered = deadlines.filter(d => {
    if (search.trim()) {
      const q = search.toLowerCase();
      return d.title.toLowerCase().includes(q) || d.description?.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1440px] mx-auto space-y-6 pb-24 md:pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in-up">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary flex items-center gap-2">
            <CalendarClock size={28} className="text-primary-400" /> Deadlines
          </h1>
          <p className="text-text-secondary text-sm mt-1">Track exams, assignments, projects, and more</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary py-2 px-4 rounded-xl flex items-center gap-2 font-semibold shadow-glow-sm">
          <Plus size={18} /> Add Deadline
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input type="text" placeholder="Search deadlines..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-surface-primary border border-border rounded-xl text-sm text-text-primary focus:border-primary-500 focus:outline-none transition-colors" />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 custom-scroll">
          {['all', ...CATEGORIES].map(c => (
            <button key={c} onClick={() => setFilter(c)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors border ${filter === c ? 'bg-primary-500/20 text-primary-300 border-primary-500/30' : 'bg-surface-primary text-text-secondary border-border hover:bg-surface-hover'}`}>
              {c === 'all' ? 'All' : c}
            </button>
          ))}
        </div>
      </div>

      {/* Deadlines Grid */}
      {loading ? (
        <div className="py-16 text-center text-text-muted text-xs">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-border rounded-2xl">
          <CalendarClock size={24} className="mx-auto mb-3 text-text-muted" />
          <p className="text-sm font-medium text-text-primary mb-1">No deadlines found</p>
          <p className="text-xs text-text-muted">Add a deadline to start tracking</p>
        </div>
      ) : (
        <div className="grid gap-3 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          {filtered.map(d => {
            const daysLeft = getDaysLeft(d.deadlineDate);
            const isOverdue = daysLeft === 'Overdue';
            return (
              <div key={d._id} className={`glass-card p-4 flex items-center gap-4 transition-all hover:border-primary-500/30 ${d.isCompleted ? 'opacity-60' : ''}`}>
                <button onClick={() => handleToggle(d._id)} className="shrink-0">
                  {d.isCompleted
                    ? <CheckCircle2 size={22} className="text-emerald-400" />
                    : <Circle size={22} className="text-text-muted hover:text-primary-400 transition-colors" />
                  }
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${d.isCompleted ? 'line-through text-text-muted' : 'text-text-primary'}`}>{d.title}</p>
                  {d.description && <p className="text-xs text-text-muted truncate mt-0.5">{d.description}</p>}
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${CATEGORY_COLORS[d.category] || ''}`}>{d.category}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${PRIORITY_COLORS[d.priority] || ''}`}>{d.priority}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-sm font-bold ${isOverdue ? 'text-red-400' : 'text-text-primary'}`}>{daysLeft}</p>
                  <p className="text-[10px] text-text-muted">{new Date(d.deadlineDate).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => openModal(d)} className="p-1.5 text-text-muted hover:text-primary-400 rounded-lg transition-colors"><Edit3 size={14} /></button>
                  <button onClick={() => handleDelete(d._id)} className="p-1.5 text-text-muted hover:text-red-400 rounded-lg transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-lg bg-surface-primary border border-border shadow-2xl rounded-2xl overflow-hidden animate-fade-in-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-base font-bold text-text-primary">{editingItem ? 'Edit Deadline' : 'Add Deadline'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-text-muted hover:text-text-primary rounded-lg"><X size={16} /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <input type="text" placeholder="Deadline title" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                className="w-full bg-surface-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary focus:border-primary-500 focus:outline-none" required />
              <textarea placeholder="Description (optional)" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2}
                className="w-full bg-surface-secondary border border-border rounded-xl px-4 py-2 text-sm text-text-primary focus:border-primary-500 focus:outline-none resize-none" />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-text-muted mb-1 block">Due Date</label>
                  <input type="date" value={form.deadlineDate} onChange={e => setForm(p => ({ ...p, deadlineDate: e.target.value }))}
                    className="w-full bg-surface-secondary border border-border rounded-xl px-3 py-2 text-sm text-text-primary focus:border-primary-500 focus:outline-none" required />
                </div>
                <div>
                  <label className="text-xs text-text-muted mb-1 block">Category</label>
                  <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                    className="w-full bg-surface-secondary border border-border rounded-xl px-3 py-2 text-sm text-text-primary focus:outline-none">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-text-muted mb-2 block">Priority</label>
                <div className="flex gap-2">
                  {PRIORITIES.map(p => (
                    <button key={p} type="button" onClick={() => setForm(prev => ({ ...prev, priority: p }))}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${form.priority === p ? PRIORITY_COLORS[p] : 'bg-surface-secondary border-border text-text-muted'}`}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-border">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-text-muted hover:text-text-primary">Cancel</button>
                <button type="submit" className="btn-primary py-2 px-6 rounded-xl text-sm font-semibold">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
