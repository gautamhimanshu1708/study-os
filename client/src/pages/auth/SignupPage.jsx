import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Zap, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const passwordStrength = (pwd) => {
  let score = 0;
  if (pwd.length >= 6)  score++;
  if (pwd.length >= 10) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return score; // 0–5
};

const strengthLabel = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
const strengthColor = ['', 'bg-danger', 'bg-warning', 'bg-amber-400', 'bg-success', 'bg-emerald-400'];

const SignupPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm]       = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);

  const pwdScore = passwordStrength(form.password);

  const validate = () => {
    const errs = {};
    if (!form.name.trim())          errs.name    = 'Name is required';
    else if (form.name.trim().length < 2) errs.name = 'Name must be at least 2 characters';
    if (!form.email)                errs.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.password)             errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (!form.confirmPassword)      errs.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);

    setLoading(true);
    try {
      await register(form.name.trim(), form.email, form.password);
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
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-glow pointer-events-none" />
      <div className="absolute top-1/3 -right-32 w-96 h-96 bg-accent-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 -left-32 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md animate-fade-in-up relative z-10">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow">
            <Zap size={20} className="text-white" />
          </div>
          <span className="text-2xl font-bold text-gradient">StudyOS</span>
        </div>

        <div className="auth-card border-gradient">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-text-primary mb-1.5">
              Create your account
            </h1>
            <p className="text-sm text-text-secondary">
              Start your learning journey today — it&apos;s free
            </p>
          </div>

          {/* Benefits */}
          <div className="flex flex-col gap-1.5 mb-6 p-3 rounded-xl bg-primary-500/8 border border-primary-500/15">
            {['Track your study progress', 'Earn XP & climb leaderboards', 'Set goals & build streaks'].map(b => (
              <div key={b} className="flex items-center gap-2 text-xs text-text-secondary">
                <CheckCircle size={13} className="text-primary-400 shrink-0" />
                {b}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <Input
              id="signup-name"
              name="name"
              type="text"
              label="Full name"
              placeholder="Alex Johnson"
              value={form.name}
              onChange={handleChange}
              error={errors.name}
              leftIcon={<User size={16} />}
              required
              autoComplete="name"
            />

            <Input
              id="signup-email"
              name="email"
              type="email"
              label="Email address"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
              leftIcon={<Mail size={16} />}
              required
              autoComplete="email"
            />

            <div>
              <Input
                id="signup-password"
                name="password"
                type="password"
                label="Password"
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={handleChange}
                error={errors.password}
                leftIcon={<Lock size={16} />}
                required
                autoComplete="new-password"
              />
              {/* Password strength bar */}
              {form.password && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(i => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          i <= pwdScore ? strengthColor[pwdScore] : 'bg-base-400'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-text-muted">
                    Strength: <span className="font-medium text-text-secondary">{strengthLabel[pwdScore]}</span>
                  </p>
                </div>
              )}
            </div>

            <Input
              id="signup-confirm-password"
              name="confirmPassword"
              type="password"
              label="Confirm password"
              placeholder="Re-enter your password"
              value={form.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              leftIcon={<Lock size={16} />}
              required
              autoComplete="new-password"
            />

            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={loading}
              className="mt-2"
            >
              Create Account
            </Button>
          </form>

          <div className="divider-text my-6">or</div>

          <p className="text-center text-sm text-text-secondary">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-primary-400 hover:text-primary-300 font-semibold transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-text-muted">
          By signing up, you agree to our{' '}
          <span className="text-primary-400 cursor-pointer hover:underline">Terms</span>
          {' '}&amp;{' '}
          <span className="text-primary-400 cursor-pointer hover:underline">Privacy Policy</span>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
