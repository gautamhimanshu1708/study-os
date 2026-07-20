import { useState, useEffect, useMemo } from 'react';
import { 
  Search, Plus, Pin, Trash2, Edit3, X, FileText, Folder, BookOpen, Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    id: null,
    title: '',
    subject: '',
    description: '',
    isPinned: false,
  });

  // Load notes from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('studyos_notes');
    if (saved) {
      try {
        setNotes(JSON.parse(saved));
      } catch (err) {
        console.error('Error parsing notes from local storage', err);
      }
    }
  }, []);

  // Save notes to local storage whenever they change
  useEffect(() => {
    localStorage.setItem('studyos_notes', JSON.stringify(notes));
  }, [notes]);

  const subjects = ['All', ...new Set(notes.map(n => n.subject).filter(Boolean))];

  const filteredNotes = useMemo(() => {
    let filtered = notes;
    if (selectedSubject !== 'All') {
      filtered = filtered.filter(n => n.subject === selectedSubject);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(q) || 
        n.description.toLowerCase().includes(q) ||
        n.subject.toLowerCase().includes(q)
      );
    }
    // Sort: Pinned first, then by last updated
    return filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.updatedAt - a.updatedAt;
    });
  }, [notes, searchQuery, selectedSubject]);

  const handleOpenModal = (note = null) => {
    if (note) {
      setFormData(note);
    } else {
      setFormData({
        id: null,
        title: '',
        subject: '',
        description: '',
        isPinned: false,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Note title is required');
      return;
    }
    
    const now = Date.now();
    
    if (formData.id) {
      setNotes(prev => prev.map(n => n.id === formData.id ? { ...formData, updatedAt: now } : n));
      toast.success('Note updated');
    } else {
      const newNote = {
        ...formData,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      };
      setNotes(prev => [...prev, newNote]);
      toast.success('Note created');
    }
    handleCloseModal();
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this note?')) {
      setNotes(prev => prev.filter(n => n.id !== id));
      toast.success('Note deleted');
    }
  };

  const togglePin = (id, e) => {
    e.stopPropagation();
    setNotes(prev => prev.map(n => n.id === id ? { ...n, isPinned: !n.isPinned, updatedAt: Date.now() } : n));
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1440px] mx-auto space-y-6 pb-24 md:pb-12 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in-up">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary flex items-center gap-2">
            <FileText size={28} className="text-primary-400" /> My Notes
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Capture ideas and concepts. Stored securely on your device.
          </p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="btn-primary py-2 px-4 rounded-xl flex items-center gap-2 font-semibold shadow-glow-sm hover:shadow-glow transition-all"
        >
          <Plus size={18} /> New Note
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-3 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input 
            type="text" 
            placeholder="Search notes..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-base-800 border border-border rounded-xl text-sm text-text-primary focus:border-primary-500 focus:outline-none transition-colors"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 custom-scroll sm:pb-0 sm:flex-wrap">
          {subjects.map(sub => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors border ${
                selectedSubject === sub 
                  ? 'bg-primary-500/20 text-primary-300 border-primary-500/30' 
                  : 'bg-base-800 text-text-secondary border-border hover:bg-base-700'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-border rounded-2xl animate-fade-in-up">
          <div className="w-16 h-16 rounded-2xl bg-base-800 border border-border flex items-center justify-center mx-auto mb-4">
            <FileText size={24} className="text-text-muted" />
          </div>
          <p className="text-sm font-medium text-text-primary mb-1">No notes found</p>
          <p className="text-xs text-text-muted">Create a new note to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          {filteredNotes.map(note => (
            <div 
              key={note.id}
              onClick={() => handleOpenModal(note)}
              className="glass-card bg-base-800/60 p-5 rounded-2xl border border-border hover:border-primary-500/40 transition-all duration-300 cursor-pointer group flex flex-col h-64"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0 pr-2">
                  <h3 className="text-sm font-bold text-text-primary truncate">{note.title}</h3>
                  {note.subject && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-base-700 border border-border text-[9px] font-semibold text-text-secondary mt-1.5">
                      <Folder size={10} /> {note.subject}
                    </span>
                  )}
                </div>
                <button 
                  onClick={(e) => togglePin(note.id, e)}
                  className={`p-1.5 rounded-lg shrink-0 transition-colors ${note.isPinned ? 'text-amber-400 bg-amber-400/10' : 'text-text-muted hover:bg-base-600 hover:text-text-primary'}`}
                >
                  <Pin size={14} className={note.isPinned ? 'fill-current' : ''} />
                </button>
              </div>
              
              <div className="flex-1 overflow-hidden relative">
                <p className="text-xs text-text-secondary leading-relaxed whitespace-pre-wrap">
                  {note.description}
                </p>
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-base-800/60 to-transparent pointer-events-none" />
              </div>
              
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
                <div className="flex items-center gap-1.5 text-[10px] text-text-muted">
                  <Clock size={12} /> {new Date(note.updatedAt).toLocaleDateString()}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleOpenModal(note); }}
                    className="p-1.5 text-text-muted hover:text-primary-400 hover:bg-primary-500/10 rounded-md transition-colors"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button 
                    onClick={(e) => handleDelete(note.id, e)}
                    className="p-1.5 text-text-muted hover:text-danger hover:bg-danger/10 rounded-md transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-2xl bg-base-900 border border-white/10 shadow-2xl rounded-2xl overflow-hidden animate-scale-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-base-800/50">
              <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
                <BookOpen size={18} className="text-primary-400" />
                {formData.id ? 'Edit Note' : 'Create Note'}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => setFormData(prev => ({...prev, isPinned: !prev.isPinned}))}
                  className={`p-2 rounded-lg transition-colors ${formData.isPinned ? 'text-amber-400 bg-amber-400/10' : 'text-text-muted hover:bg-base-700'}`}
                >
                  <Pin size={16} className={formData.isPinned ? 'fill-current' : ''} />
                </button>
                <button onClick={handleCloseModal} className="p-2 text-text-muted hover:text-white hover:bg-base-700 rounded-lg transition-colors">
                  <X size={16} />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSave} className="p-6">
              <div className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="Note Title"
                    value={formData.title}
                    onChange={e => setFormData(prev => ({...prev, title: e.target.value}))}
                    className="w-full bg-transparent text-xl font-bold text-text-primary placeholder:text-text-muted/50 border-none focus:outline-none focus:ring-0 px-0"
                    autoFocus
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Subject or Category (e.g., DSA, Java, General)"
                    value={formData.subject}
                    onChange={e => setFormData(prev => ({...prev, subject: e.target.value}))}
                    className="w-full bg-base-800/50 border border-border rounded-xl px-4 py-2 text-sm text-text-primary focus:border-primary-500 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <textarea
                    placeholder="Start typing your note here..."
                    value={formData.description}
                    onChange={e => setFormData(prev => ({...prev, description: e.target.value}))}
                    className="w-full h-64 bg-transparent border-none text-sm text-text-secondary placeholder:text-text-muted/50 focus:outline-none focus:ring-0 resize-none px-0 custom-scroll"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-sm font-medium text-text-muted hover:text-text-primary transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary py-2 px-6 rounded-xl text-sm font-semibold shadow-glow-sm hover:shadow-glow transition-all"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
