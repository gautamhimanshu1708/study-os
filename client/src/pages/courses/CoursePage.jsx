import { useState, useEffect, useCallback } from 'react';
import {
  BookOpen, Plus, Search, ExternalLink, User, Clock, Award, 
  RefreshCw, Trash2, Edit, Sliders, TrendingUp, GraduationCap, 
  Monitor, PlayCircle, Landmark, Zap, Layers
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  updateCourseProgress,
  getCourseStats,
} from '../../api/courseApi';
import CourseModal from './CourseModal';

// Platform styling presets
const PLATFORM_PRESETS = {
  Udemy:             { color: 'text-purple-400 bg-purple-500/10 border-purple-500/20', icon: GraduationCap },
  Coursera:          { color: 'text-blue-400 bg-blue-500/10 border-blue-500/20', icon: Monitor },
  YouTube:           { color: 'text-red-400 bg-red-500/10 border-red-500/20', icon: PlayCircle },
  edX:               { color: 'text-rose-400 bg-rose-500/10 border-rose-500/20', icon: Landmark },
  NPTEL:             { color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', icon: BookOpen },
  Pluralsight:       { color: 'text-pink-400 bg-pink-500/10 border-pink-500/20', icon: Zap },
  'LinkedIn Learning': { color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20', icon: Layers },
  Custom:            { color: 'text-primary-400 bg-primary-500/10 border-primary-500/20', icon: BookOpen },
};

// Status styling presets
const STATUS_PRESETS = {
  'Not Started': { bg: 'bg-base-500/60 text-text-muted border-border' },
  'In Progress': { bg: 'bg-primary-500/15 text-primary-400 border-primary-500/30' },
  Completed:     { bg: 'bg-success/15 text-success border-success/30 font-bold' },
};

const CoursePage = () => {
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [activeStatusTab, setActiveStatusTab] = useState('all'); // 'all' | 'In Progress' | 'Completed' | 'Not Started'
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState('all');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  const fetchCourseData = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (activeStatusTab !== 'all') params.status = activeStatusTab;
      if (platformFilter !== 'all') params.platform = platformFilter;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const [coursesRes, statsRes] = await Promise.all([
        getCourses(params),
        getCourseStats(),
      ]);

      setCourses(coursesRes.data || []);
      setStats(statsRes.data || null);
    } catch (err) {
      console.error('Failed to fetch course data:', err);
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  }, [activeStatusTab, platformFilter, searchQuery]);

  useEffect(() => {
    fetchCourseData();
  }, [fetchCourseData]);

  // Handle Save (Create / Update)
  const handleSaveCourse = async (formData) => {
    try {
      if (editingCourse) {
        await updateCourse(editingCourse._id, formData);
        toast.success('Course updated successfully');
      } else {
        await createCourse(formData);
        toast.success('Enrolled course saved!');
      }
      fetchCourseData();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to save course');
    }
  };

  // Delete Course
  const handleDeleteCourse = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      await deleteCourse(id);
      toast.success('Course deleted');
      fetchCourseData();
    } catch (err) {
      toast.error('Failed to delete course');
    }
  };

  // Quick update progress percentage slider
  const handleProgressChange = async (id, newPct) => {
    try {
      await updateCourseProgress(id, newPct);
      fetchCourseData();
    } catch (err) {
      toast.error('Failed to update progress');
    }
  };

  // Direct open course link
  const handleOpenCourse = (url) => {
    if (!url) {
      toast.error('No course link saved for this course');
      return;
    }
    const targetUrl = url.startsWith('http') ? url : `https://${url}`;
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
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
              <BookOpen size={24} />
            </span>
            Course Manager
          </h1>
          <p className="text-xs md:text-sm text-text-secondary mt-1">
            Track your enrolled courses, save external platform links, and monitor your overall progress.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingCourse(null);
            setIsModalOpen(true);
          }}
          className="btn-primary py-2.5 px-4 rounded-xl text-xs md:text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20 hover:scale-[1.02] transition-transform"
        >
          <Plus size={16} /> Enroll Course
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════════
          COURSE STATISTICS HEADER CARDS
      ═══════════════════════════════════════════════════════════════════════════ */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <div className="glass-card p-4 md:p-5 border border-border flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Total Courses</p>
              <p className="text-2xl font-black text-text-primary mt-1">{stats.totalCourses}</p>
              <p className="text-[10px] text-text-secondary mt-0.5">Enrolled learning material</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-primary-500/15 border border-primary-500/30 flex items-center justify-center text-primary-400">
              <BookOpen size={20} />
            </div>
          </div>

          <div className="glass-card p-4 md:p-5 border border-border flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">In Progress</p>
              <p className="text-2xl font-black text-primary-400 mt-1">{stats.inProgressCourses}</p>
              <p className="text-[10px] text-text-secondary mt-0.5">Active ongoing courses</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-primary-500/15 border border-primary-500/30 flex items-center justify-center text-primary-400">
              <Clock size={20} />
            </div>
          </div>

          <div className="glass-card p-4 md:p-5 border border-border flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Completed</p>
              <p className="text-2xl font-black text-emerald-400 mt-1">{stats.completedCourses}</p>
              <p className="text-[10px] text-text-secondary mt-0.5">Finished courses</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Award size={20} />
            </div>
          </div>

          <div className="glass-card p-4 md:p-5 border border-border flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Avg Progress</p>
              <p className="text-2xl font-black text-accent-400 mt-1">{stats.averageProgress}%</p>
              <p className="text-[10px] text-text-secondary mt-0.5">Overall course completion</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-accent-500/15 border border-accent-500/30 flex items-center justify-center text-accent-400">
              <TrendingUp size={20} />
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════
          TOOLBAR (SEARCH & FILTERS)
      ═══════════════════════════════════════════════════════════════════════════ */}
      <div className="glass-card p-3 md:p-4 space-y-3 border border-border">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scroll">
          {[
            { id: 'all', label: 'All Courses' },
            { id: 'In Progress', label: 'In Progress' },
            { id: 'Completed', label: 'Completed' },
            { id: 'Not Started', label: 'Not Started' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveStatusTab(tab.id)}
              className={`
                px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all
                ${activeStatusTab === tab.id
                  ? 'bg-gradient-brand text-white shadow-sm'
                  : 'bg-base-600/50 text-text-muted hover:text-text-primary hover:bg-base-500'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Platform Filter Row */}
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search by course title or instructor name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-base-600/60 border border-border focus:border-primary-500 text-text-primary text-xs focus:outline-none transition-colors"
            />
          </div>

          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="w-full md:w-48 px-3 py-2 rounded-xl bg-base-600/60 border border-border text-text-primary text-xs focus:outline-none"
          >
            <option value="all">All Platforms</option>
            <option value="Udemy">Udemy</option>
            <option value="Coursera">Coursera</option>
            <option value="YouTube">YouTube</option>
            <option value="edX">edX</option>
            <option value="NPTEL">NPTEL</option>
            <option value="Pluralsight">Pluralsight</option>
            <option value="LinkedIn Learning">LinkedIn Learning</option>
            <option value="Custom">Custom</option>
          </select>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════════
          COURSES CARDS GRID
      ═══════════════════════════════════════════════════════════════════════════ */}
      {loading ? (
        <div className="py-16 text-center text-text-muted text-xs flex items-center justify-center gap-2">
          <RefreshCw size={16} className="animate-spin text-primary-400" /> Loading enrolled courses...
        </div>
      ) : courses.length === 0 ? (
        <div className="py-16 text-center glass-card border border-dashed border-border rounded-2xl p-8">
          <div className="w-12 h-12 rounded-2xl bg-base-500 flex items-center justify-center mx-auto mb-3 text-text-muted">
            <BookOpen size={24} />
          </div>
          <h3 className="text-base font-bold text-text-primary mb-1">No courses found</h3>
          <p className="text-xs text-text-muted mb-4 max-w-sm mx-auto">
            Enroll your first course to keep track of learning progress and save platform links.
          </p>
          <button
            onClick={() => {
              setEditingCourse(null);
              setIsModalOpen(true);
            }}
            className="btn-primary px-4 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-2"
          >
            <Plus size={14} /> Enroll Course
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => {
            const platformCfg = PLATFORM_PRESETS[course.platform] || PLATFORM_PRESETS.Custom;
            const statusCfg = STATUS_PRESETS[course.status] || STATUS_PRESETS['In Progress'];
            const PlatformIcon = platformCfg.icon;

            return (
              <div
                key={course._id}
                className="glass-card p-5 border border-border hover:border-primary-500/40 transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  {/* Top Bar: Platform & Status */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border flex items-center gap-1.5 ${platformCfg.color}`}>
                      <PlatformIcon size={14} /> {course.platform}
                    </span>

                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${statusCfg.bg}`}>
                      {course.status}
                    </span>
                  </div>

                  {/* Course Title */}
                  <h3 className="text-base font-bold text-text-primary leading-snug line-clamp-2 mb-1 group-hover:text-primary-400 transition-colors">
                    {course.courseName}
                  </h3>

                  {/* Instructor */}
                  {course.instructorName && (
                    <p className="text-xs text-text-muted flex items-center gap-1 mb-4">
                      <User size={13} className="text-text-muted" /> Instructor: <span className="text-text-secondary font-medium">{course.instructorName}</span>
                    </p>
                  )}

                  {/* Additional notes snippet */}
                  {course.notes && (
                    <p className="text-[11px] text-text-muted italic bg-base-600/30 p-2 rounded-lg mb-4 border border-border/40 line-clamp-2">
                      &quot;{course.notes}&quot;
                    </p>
                  )}
                </div>

                <div>
                  {/* Progress Bar & Slider */}
                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-text-secondary flex items-center gap-1">
                        <Sliders size={12} className="text-emerald-400" /> Progress
                      </span>
                      <span className="font-bold text-emerald-400">{course.progressPercentage}%</span>
                    </div>

                    {/* Progress Fill */}
                    <div className="w-full h-2 rounded-full bg-base-700 overflow-hidden relative">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-accent-400 rounded-full transition-all duration-300"
                        style={{ width: `${course.progressPercentage}%` }}
                      />
                    </div>

                    {/* Quick Interactive Slider */}
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={course.progressPercentage}
                      onChange={(e) => handleProgressChange(course._id, Number(e.target.value))}
                      className="w-full accent-emerald-400 bg-transparent h-1.5 cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
                    />
                  </div>

                  {/* Action Buttons Row */}
                  <div className="flex items-center justify-between gap-2 pt-3 border-t border-border/60">
                    {/* OPEN COURSE LINK BUTTON */}
                    <button
                      onClick={() => handleOpenCourse(course.courseLink)}
                      disabled={!course.courseLink}
                      className={`
                        flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all
                        ${course.courseLink
                          ? 'bg-primary-500/15 border border-primary-500/30 text-primary-300 hover:bg-primary-500/25 shadow-sm'
                          : 'bg-base-600/30 border border-border text-text-muted cursor-not-allowed opacity-50'
                        }
                      `}
                      title={course.courseLink ? 'Open external course link' : 'No link saved'}
                    >
                      <ExternalLink size={14} /> Open Course
                    </button>

                    {/* Edit & Delete */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingCourse(course);
                          setIsModalOpen(true);
                        }}
                        className="p-2 rounded-xl text-text-muted hover:text-primary-400 hover:bg-base-500 border border-transparent hover:border-border transition-colors"
                        title="Edit course"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(course._id)}
                        className="p-2 rounded-xl text-text-muted hover:text-danger hover:bg-base-500 border border-transparent hover:border-border transition-colors"
                        title="Delete course"
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

      {/* Course Modal Dialog */}
      <CourseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCourse}
        initialData={editingCourse}
      />
    </div>
  );
};

export default CoursePage;
