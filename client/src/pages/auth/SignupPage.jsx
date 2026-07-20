import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Zap, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

// Password Strength Calculator (0 - 4)
const getPasswordStrength = (pwd) => {
  if (!pwd) return 0;
  let score = 0;
  if (pwd.length >= 6) score++;
  if (pwd.length >= 10) score++;
  if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return score;
};

const STRENGTH_CONFIG = [
  { label: 'Weak', color: 'bg-danger' },
  { label: 'Fair', color: 'bg-amber-400' },
  { label: 'Good', color: 'bg-primary-400' },
  { label: 'Strong', color: 'bg-success' },
];

const SignupPage = () => {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);

  const pwdScore = useMemo(() => getPasswordStrength(form.password), [form.password]);

  const validate = () => {
    const errs = {};
    if (!form.firstName.trim()) {
      errs.firstName = 'First name is required';
    }
    if (!form.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errs.email = 'Please enter a valid email address';
    }
    if (!form.password) {
      errs.password = 'Password is required';
    } else if (form.password.length < 6) {
      errs.password = 'Must be at least 6 characters';
    }
    if (!form.confirmPassword) {
      errs.confirmPassword = 'Confirm your password';
    } else if (form.password !== form.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);

    setLoading(true);
    try {
      const fullName = `${form.firstName.trim()} ${form.lastName.trim()}`.trim();
      await register(fullName, form.email.trim(), form.password);
      toast.success('Account created! Welcome to StudyOS');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(msg);
      if (msg.toLowerCase().includes('email')) {
        setErrors({ email: msg });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 relative overflow-hidden bg-base-950 text-text-primary">
      {/* Background Orbs */}
      <div className="absolute top-1/4 right-1/2 translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-accent-600/15 to-primary-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-violet-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-xl animate-fade-in relative z-10 my-auto py-6">
        {/* StudyOS SaaS Header Logo */}
        <div className="flex flex-col items-center mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-3 group focus:outline-none mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-lg shadow-primary-500/25 group-hover:scale-105 transition-transform duration-300 border border-white/20">
              <Zap size={24} className="text-white fill-white" />
            </div>
            <span className="text-3xl font-black tracking-tight text-gradient">
              StudyOS
            </span>
          </Link>
          <p className="text-xs font-medium text-text-muted uppercase tracking-widest flex items-center gap-1.5">
            <ShieldCheck size={13} className="text-primary-400" /> Start Your Productivity Engine Free
          </p>
        </div>

        {/* Glassmorphic Auth Card */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-2xl bg-base-900/75 transition-all">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">
              Create your StudyOS Account
            </h1>
            <p className="text-xs text-text-secondary mt-1.5">
              Join thousands of students mastering their academic goals
            </p>
          </div>

          {/* Features Pill Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-6 p-3 rounded-2xl bg-base-800/40 border border-white/5">
            {[
              'Pomodoro Focus',
              'Goal & Course Tracking',
              'Productivity Analytics',
            ].map((feature) => (
              <div key={feature} className="flex items-center justify-center sm:justify-start gap-1.5 text-[11px] font-semibold text-text-secondary">
                <CheckCircle2 size={13} className="text-primary-400 shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Desktop Two-Column Grid for Names */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="signup-firstname"
                name="firstName"
                type="text"
                label="First name"
                placeholder="Alex"
                value={form.firstName}
                onChange={handleChange}
                error={errors.firstName}
                leftIcon={<User size={16} />}
                required
                disabled={loading}
                autoComplete="given-name"
              />
              <Input
                id="signup-lastname"
                name="lastName"
                type="text"
                label="Last name"
                placeholder="Johnson"
                value={form.lastName}
                onChange={handleChange}
                error={errors.lastName}
                leftIcon={<User size={16} />}
                disabled={loading}
                autoComplete="family-name"
              />
            </div>

            {/* Email Field */}
            <Input
              id="signup-email"
              name="email"
              type="email"
              label="Email address"
              placeholder="alex@university.edu"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
              leftIcon={<Mail size={16} />}
              required
              disabled={loading}
              autoComplete="email"
            />

            {/* Desktop Two-Column Grid for Passwords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Input
                  id="signup-password"
                  name="password"
                  type="password"
                  label="Password"
                  placeholder="Min. 6 chars"
                  value={form.password}
                  onChange={handleChange}
                  error={errors.password}
                  leftIcon={<Lock size={16} />}
                  required
                  disabled={loading}
                  autoComplete="new-password"
                />
                {/* Password Strength Meter */}
                {form.password && (
                  <div className="mt-2 space-y-1">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((step) => (
                        <div
                          key={step}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            step <= pwdScore
                              ? STRENGTH_CONFIG[pwdScore - 1]?.color || 'bg-primary-400'
                              : 'bg-base-700'
                          }`}
                        />
                      ))}
                    </div>
                    {pwdScore > 0 && (
                      <p className="text-[10px] text-text-muted">
                        Strength: <span className="font-semibold text-text-secondary">{STRENGTH_CONFIG[pwdScore - 1]?.label}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>

              <Input
                id="signup-confirmpassword"
                name="confirmPassword"
                type="password"
                label="Confirm password"
                placeholder="Re-enter password"
                value={form.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                leftIcon={<Lock size={16} />}
                required
                disabled={loading}
                autoComplete="new-password"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              loading={loading}
              disabled={loading}
              className="mt-4 py-3 text-sm font-bold shadow-lg shadow-primary-500/25 rounded-xl hover:scale-[1.01] active:scale-[0.99] transition-all"
              rightIcon={!loading ? <ArrowRight size={16} /> : null}
            >
              {loading ? 'Creating Account...' : 'Get Started Free'}
            </Button>
          </form>

          {/* SaaS Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/80" />
            </div>
            <span className="relative px-3 bg-base-900/90 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
              Already registered?
            </span>
          </div>

          {/* Footer Link */}
          <div className="text-center">
            <p className="text-xs text-text-secondary">
              Already have a StudyOS account?{' '}
              <Link
                to="/login"
                className="text-primary-400 hover:text-primary-300 font-bold transition-colors underline-offset-4 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Footer info */}
        <p className="mt-6 text-center text-[11px] text-text-muted">
          By signing up, you agree to the StudyOS{' '}
          <span className="text-text-secondary hover:text-primary-400 cursor-pointer transition-colors">
            Terms of Service
          </span>{' '}
          &amp;{' '}
          <span className="text-text-secondary hover:text-primary-400 cursor-pointer transition-colors">
            Privacy Policy
          </span>.
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
