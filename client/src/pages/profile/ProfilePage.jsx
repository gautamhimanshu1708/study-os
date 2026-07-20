import { useState } from 'react';
import { User, Mail, Calendar, Shield, Edit3, Check, X, Camera, Flame, BookOpen, Clock, Target, Award } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';
import { updateUserProfile } from '../../api/authApi';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const avatarColors = [
  'from-violet-500 to-indigo-500',
  'from-cyan-500 to-blue-500',
  'from-rose-500 to-pink-500',
  'from-amber-500 to-orange-500',
  'from-emerald-500 to-teal-500',
];

const getAvatarColor = (name = '') => {
  const idx = (name.charCodeAt(0) || 0) % avatarColors.length;
  return avatarColors[idx];
};

const getInitials = (name = '') =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';

// ── Info Row ──────────────────────────────────────────────────────────────────
const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-4 py-4 border-b border-border last:border-0">
    <div className="w-8 h-8 rounded-lg bg-primary-500/10 border border-primary-500/20 flex items-center justify-center shrink-0">
      <Icon size={15} className="text-primary-400" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-text-muted mb-0.5">{label}</p>
      <p className="text-sm font-medium text-text-primary truncate">{value}</p>
    </div>
  </div>
);

// ── Stat pill ─────────────────────────────────────────────────────────────────
const StatPill = ({ label, value, color }) => (
  <div className={`flex-1 glass-card p-4 text-center border ${color}`}>
    <p className="text-xl font-bold text-text-primary">{value}</p>
    <p className="text-xs text-text-secondary mt-0.5">{label}</p>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────

const ProfilePage = () => {
  const { user, updateUser } = useAuth();

  const [editing, setEditing]   = useState(false);
  const [name, setName]         = useState(user?.name || '');
  const [nameError, setNameError] = useState('');
  const [saving, setSaving]     = useState(false);

  const handleEdit = () => {
    setName(user?.name || '');
    setNameError('');
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    setNameError('');
  };

  const handleSave = async () => {
    if (!name.trim() || name.trim().length < 2) {
      setNameError('Name must be at least 2 characters');
      return;
    }
    setSaving(true);
    try {
      const data = await updateUserProfile({ name: name.trim() });
      updateUser(data.user);
      toast.success('Profile updated!');
      setEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'N/A';

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1440px] mx-auto space-y-6 pb-24 md:pb-12 animate-fade-in">

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="animate-fade-in-up">
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-1">My Profile</h1>
        <p className="text-text-secondary text-sm">Manage your personal information and preferences</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">

        {/* ── Left: Avatar + quick stats ─────────────────────────── */}
        <div className="space-y-5">
          {/* Avatar card */}
          <div className="glass-card p-6 text-center animate-fade-in-up">
            <div className="relative inline-block mb-4">
              <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${getAvatarColor(user?.name)} flex items-center justify-center text-white text-3xl font-bold shadow-glow mx-auto`}>
                {getInitials(user?.name)}
              </div>
              <button className="absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-full bg-base-500 border border-border flex items-center justify-center hover:bg-base-400 transition-colors">
                <Camera size={14} className="text-text-secondary" />
              </button>
            </div>

            {editing ? (
              <div className="space-y-3">
                <Input
                  id="profile-name"
                  value={name}
                  onChange={e => { setName(e.target.value); setNameError(''); }}
                  error={nameError}
                  placeholder="Your name"
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth
                    loading={saving}
                    onClick={handleSave}
                    leftIcon={<Check size={13} />}
                  >
                    Save
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    fullWidth
                    onClick={handleCancel}
                    leftIcon={<X size={13} />}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-lg font-bold text-text-primary mb-0.5">{user?.name}</h2>
                <p className="text-sm text-text-muted mb-4">{user?.email}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEdit}
                  leftIcon={<Edit3 size={13} />}
                >
                  Edit Profile
                </Button>
              </>
            )}
          </div>

          {/* Quick stats */}
          <div className="flex gap-3 animate-fade-in-up">
            <StatPill label="Streak"  value="12" icon={Flame} color="border-orange-500/20 text-orange-500" />
            <StatPill label="XP"      value="4.2k"  color="border-primary-500/20" />
            <StatPill label="Rank"    value="#142"  color="border-amber-500/20"  />
          </div>

          {/* Role badge */}
          <div className="glass-card p-4 flex items-center gap-3 animate-fade-in-up">
            <Shield size={16} className="text-primary-400 shrink-0" />
            <div>
              <p className="text-xs text-text-muted">Account type</p>
              <p className="text-sm font-semibold text-text-primary capitalize">{user?.role || 'User'}</p>
            </div>
            <span className="ml-auto badge-primary">Active</span>
          </div>
        </div>

        {/* ── Right: Info & account details ──────────────────────── */}
        <div className="md:col-span-2 space-y-5">

          {/* Account info */}
          <div className="glass-card p-5 animate-fade-in-up">
            <h3 className="text-sm font-semibold text-text-primary mb-1">Account Information</h3>
            <p className="text-xs text-text-muted mb-4">Your personal details and account data</p>

            <InfoRow icon={User}     label="Full Name"       value={user?.name || '—'} />
            <InfoRow icon={Mail}     label="Email Address"   value={user?.email || '—'} />
            <InfoRow icon={Calendar} label="Member Since"    value={joinDate} />
            <InfoRow icon={Shield}   label="Account Role"    value={user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'} />
          </div>

          {/* Study summary card */}
          <div className="glass-card p-5 animate-fade-in-up">
            <h3 className="text-sm font-semibold text-text-primary mb-1">Learning Summary</h3>
            <p className="text-xs text-text-muted mb-4">Your overall progress on StudyOS</p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Topics Completed', value: '38', icon: <BookOpen size={14} className="text-primary-400" /> },
                { label: 'Total Study Time', value: '127h', icon: <Clock size={14} className="text-amber-400" /> },
                { label: 'Problems Solved',  value: '214', icon: <Target size={14} className="text-emerald-400" /> },
                { label: 'Badges Earned',    value: '9',   icon: <Award size={14} className="text-purple-400" /> },
              ].map(({ label, value, icon }) => (
                <div key={label} className="bg-base-500/50 rounded-xl p-4 border border-border">
                  <p className="text-2xl mb-1">{icon}</p>
                  <p className="text-lg font-bold text-text-primary">{value}</p>
                  <p className="text-xs text-text-secondary">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Danger zone */}
          <div className="glass-card p-5 border border-danger/20 animate-fade-in-up">
            <h3 className="text-sm font-semibold text-danger mb-1">Danger Zone</h3>
            <p className="text-xs text-text-muted mb-4">Permanent and irreversible actions</p>
            <Button variant="danger" size="sm">
              Delete Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
