import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';
import { getApiErrorMessage } from '../../services/api.js';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const redirectTo = location.state?.from || '/';

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(formData);
      navigate(redirectTo, { replace: true });
    } catch (submitError) {
      setError(getApiErrorMessage(submitError, 'Unable to sign in.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto flex min-h-[70vh] w-full max-w-7xl items-center justify-center px-4">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5 shadow-2xl shadow-black/20 backdrop-blur lg:grid-cols-[0.95fr_1.05fr]">
        <div className="hidden bg-gradient-to-br from-teal-300/20 via-white/5 to-transparent p-10 lg:block">
          <p className="text-xs uppercase tracking-[0.34em] text-teal-200">Welcome back</p>
          <h1 className="mt-4 text-4xl font-semibold text-white" style={{ fontFamily: 'Sora, sans-serif' }}>
            Pick up your next trip exactly where you left it.
          </h1>
          <p className="mt-4 max-w-md text-base leading-7 text-slate-300">
            Sign in to manage current stays, check booking statuses, and open the admin dashboard if your account has access.
          </p>
        </div>

        <form className="p-8 md:p-10" onSubmit={handleSubmit}>
          <p className="text-xs uppercase tracking-[0.34em] text-slate-400">Account access</p>
          <h2 className="mt-3 text-3xl font-semibold text-white" style={{ fontFamily: 'Sora, sans-serif' }}>
            Login
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            Use your email and password to continue.
          </p>

          {error && (
            <div className="mt-5 rounded-2xl border border-red-300/20 bg-red-300/10 p-4 text-sm text-red-100">
              {error}
            </div>
          )}

          <div className="mt-6 space-y-4">
            <label className="block space-y-2 text-sm text-slate-200">
              <span>Email</span>
              <input
                className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none focus:border-teal-300/60"
                onChange={(event) => setFormData((current) => ({ ...current, email: event.target.value }))}
                placeholder="you@example.com"
                type="email"
                value={formData.email}
              />
            </label>

            <label className="block space-y-2 text-sm text-slate-200">
              <span>Password</span>
              <input
                className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none focus:border-teal-300/60"
                onChange={(event) => setFormData((current) => ({ ...current, password: event.target.value }))}
                placeholder="Enter your password"
                type="password"
                value={formData.password}
              />
            </label>
          </div>

          <button
            className="mt-6 w-full rounded-2xl bg-teal-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-teal-200 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading}
            type="submit"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          <p className="mt-6 text-sm text-slate-300">
            New here?{' '}
            <Link className="font-semibold text-teal-200 transition hover:text-white" to="/register">
              Create an account
            </Link>
          </p>
        </form>
      </div>
    </section>
  );
}
