import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Zap, ArrowRight, HelpCircle, ShieldCheck } from 'lucide-react';
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

const PRESET_SECURITY_QUESTIONS = [
  "What was the name of your first pet?",
  "What city were you born in?",
  "What was your mother's maiden name?",
  "What was the name of your first school?",
  "What is your favorite book or movie?",
];

const SignupPage = () => {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    securityQuestion: PRESET_SECURITY_QUESTIONS[0],
    securityAnswer: '',
  });

  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);

  const pwdScore = useMemo(() => getPasswordStrength(form.password), [form.password]);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) {
      errs.name = 'Full name is required';
    }
    if (!form.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errs.email = 'Please enter a valid email address';
    }
    if (!form.password) {
      errs.password = 'Password is required';
    } else if (form.password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }
    if (!form.confirmPassword) {
      errs.confirmPassword = 'Confirm your password';
    } else if (form.password !== form.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }
    if (!form.securityQuestion.trim()) {
      errs.securityQuestion = 'Please select a security question';
    }
    if (!form.securityAnswer.trim()) {
      errs.securityAnswer = 'Security answer is required for password recovery';
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
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        securityQuestion: form.securityQuestion,
        securityAnswer: form.securityAnswer.trim(),
      });
      toast.success('Account created successfully! Welcome to StudyOS');
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
      {/* Background Ambient Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-primary-600/15 to-violet-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md animate-fade-in relative z-10 my-auto py-6">
        {/* StudyOS Logo Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-3 group focus:outline-none">
            <div className="w-12 h-12 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-lg shadow-primary-500/25 group-hover:scale-105 transition-transform duration-300 border border-white/20">
              <Zap size={24} className="text-white fill-white" />
            </div>
            <span className="text-3xl font-black tracking-tight text-gradient">
              StudyOS
            </span>
          </Link>
        </div>

        {/* Glassmorphic Auth Card */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-2xl bg-base-900/75 transition-all">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">
              Create Account
            </h1>
            <p className="text-xs text-text-secondary mt-1.5">
              Set up your profile & security question to get started.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <Input
              id="signup-name"
              name="name"
              type="text"
              label="Full Name"
              placeholder="Alex Smith"
              value={form.name}
              onChange={handleChange}
              error={errors.name}
              leftIcon={<User size={16} />}
              required
              disabled={loading}
              autoComplete="name"
            />

            <Input
              id="signup-email"
              name="email"
              type="email"
              label="Email Address"
              placeholder="alex@example.com"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
              leftIcon={<Mail size={16} />}
              required
              disabled={loading}
              autoComplete="email"
            />

            <div>
              <Input
                id="signup-password"
                name="password"
                type="password"
                label="Password"
                placeholder="Minimum 6 characters"
                value={form.password}
                onChange={handleChange}
                error={errors.password}
                leftIcon={<Lock size={16} />}
                required
                disabled={loading}
                autoComplete="new-password"
              />

              {/* Password Strength Indicator */}
              {form.password && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1 h-1.5 w-full rounded-full bg-base-800 overflow-hidden">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`h-full flex-1 transition-all duration-300 ${
                          step <= pwdScore
                            ? STRENGTH_CONFIG[pwdScore - 1]?.color || 'bg-primary-500'
                            : 'bg-transparent'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-text-muted">
                    <span>Password Strength</span>
                    <span className="font-semibold text-text-secondary">
                      {pwdScore > 0 ? STRENGTH_CONFIG[pwdScore - 1]?.label : 'Too short'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <Input
              id="signup-confirm-password"
              name="confirmPassword"
              type="password"
              label="Confirm Password"
              placeholder="Re-enter your password"
              value={form.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              leftIcon={<Lock size={16} />}
              required
              disabled={loading}
              autoComplete="new-password"
            />

            {/* Security Question Field */}
            <div className="space-y-1.5 pt-1">
              <label htmlFor="signup-security-question" className="block text-xs font-semibold text-text-secondary">
                Security Question (for password recovery)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
                  <HelpCircle size={16} />
                </div>
                <select
                  id="signup-security-question"
                  name="securityQuestion"
                  value={form.securityQuestion}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-2.5 bg-base-950/80 border border-white/10 rounded-xl text-xs text-text-primary focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all appearance-none cursor-pointer"
                >
                  {PRESET_SECURITY_QUESTIONS.map((q, idx) => (
                    <option key={idx} value={q} className="bg-base-900 text-text-primary">
                      {q}
                    </option>
                  ))}
                </select>
              </div>
              {errors.securityQuestion && (
                <p className="text-[11px] text-danger mt-1">{errors.securityQuestion}</p>
              )}
            </div>

            {/* Security Answer Field */}
            <Input
              id="signup-security-answer"
              name="securityAnswer"
              type="text"
              label="Security Answer"
              placeholder="Your secret answer"
              value={form.securityAnswer}
              onChange={handleChange}
              error={errors.securityAnswer}
              leftIcon={<ShieldCheck size={16} />}
              required
              disabled={loading}
            />

            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              loading={loading}
              disabled={loading}
              className="mt-2 py-3 text-sm font-bold shadow-lg shadow-primary-500/25 rounded-xl hover:scale-[1.01] active:scale-[0.99] transition-all"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
              {!loading && <ArrowRight size={16} className="ml-2" />}
            </Button>
          </form>

          <div className="text-center mt-6 pt-5 border-t border-border/60">
            <p className="text-xs text-text-secondary">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-primary-400 hover:text-primary-300 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
