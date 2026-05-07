import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';
import { getApiErrorMessage } from '../../services/api.js';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });
      navigate('/', { replace: true });
    } catch (submitError) {
      setError(getApiErrorMessage(submitError, 'Unable to create your account.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto flex min-h-[70vh] w-full max-w-7xl items-center justify-center px-4">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5 shadow-2xl shadow-black/20 backdrop-blur lg:grid-cols-[1.02fr_0.98fr]">
        <form className="p-8 md:p-10" onSubmit={handleSubmit}>
          <p className="text-xs uppercase tracking-[0.34em] text-slate-400">Create account</p>
          <h1 className="mt-3 text-3xl font-semibold text-white" style={{ fontFamily: 'Sora, sans-serif' }}>
            Join and start booking smarter
          </h1>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            Create your guest account now. Admin accounts can also be created from the dashboard when bootstrapping the platform.
          </p>

          {error && (
            <div className="mt-5 rounded-2xl border border-red-300/20 bg-red-300/10 p-4 text-sm text-red-100">
              {error}
            </div>
          )}

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-200 md:col-span-2">
              <span>Full name</span>
              <input
                className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none focus:border-teal-300/60"
                onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))}
                placeholder="Aarav Sharma"
                type="text"
                value={formData.name}
              />
            </label>

            <label className="space-y-2 text-sm text-slate-200">
              <span>Email</span>
              <input
                className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none focus:border-teal-300/60"
                onChange={(event) => setFormData((current) => ({ ...current, email: event.target.value }))}
                placeholder="guest@example.com"
                type="email"
                value={formData.email}
              />
            </label>

            <label className="space-y-2 text-sm text-slate-200">
              <span>Phone</span>
              <input
                className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none focus:border-teal-300/60"
                onChange={(event) => setFormData((current) => ({ ...current, phone: event.target.value }))}
                placeholder="+91 98765 43210"
                type="tel"
                value={formData.phone}
              />
            </label>

            <label className="space-y-2 text-sm text-slate-200">
              <span>Password</span>
              <input
                className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none focus:border-teal-300/60"
                onChange={(event) => setFormData((current) => ({ ...current, password: event.target.value }))}
                placeholder="At least 6 characters"
                type="password"
                value={formData.password}
              />
            </label>

            <label className="space-y-2 text-sm text-slate-200">
              <span>Confirm password</span>
              <input
                className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none focus:border-teal-300/60"
                onChange={(event) => setFormData((current) => ({ ...current, confirmPassword: event.target.value }))}
                placeholder="Repeat your password"
                type="password"
                value={formData.confirmPassword}
              />
            </label>
          </div>

          <button
            className="mt-6 w-full rounded-2xl bg-teal-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-teal-200 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading}
            type="submit"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>

          <p className="mt-6 text-sm text-slate-300">
            Already have an account?{' '}
            <Link className="font-semibold text-teal-200 transition hover:text-white" to="/login">
              Login
            </Link>
          </p>
        </form>

        <div className="hidden bg-gradient-to-br from-amber-200/20 via-white/5 to-transparent p-10 lg:block">
          <p className="text-xs uppercase tracking-[0.34em] text-amber-100">Why sign up?</p>
          <div className="mt-5 space-y-4">
            {[
              'Track booking requests and cancellations from one place.',
              'Move from browsing hotels to booking without losing progress.',
              'Use the same credentials for guest flows and, if authorized, admin access.',
            ].map((point) => (
              <div key={point} className="rounded-[1.5rem] border border-white/10 bg-slate-950/35 p-5 text-sm leading-7 text-slate-200">
                {point}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
