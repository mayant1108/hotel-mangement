import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';
import { getApiErrorMessage } from '../../services/api.js';

export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const redirectTo = location.state?.from || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(form);
      navigate(redirectTo, { replace: true });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Unable to sign in right now.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-14 sm:px-6 sm:py-20">
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-sm sm:p-8">
        <h1 className="mb-3 text-center text-3xl font-['Playfair_Display'] font-bold text-gold">Sign In</h1>
        <p className="text-center text-sm leading-6 text-slate-300">
          Use your account to view bookings and reserve rooms from live inventory.
        </p>
        {error && (
          <div className="mt-5 rounded-2xl border border-red-300/25 bg-red-300/10 px-4 py-3 text-sm text-red-100">
            {error}
          </div>
        )}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            className="ui-field mt-6"
            onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))}
            placeholder="Email"
            required
            type="email"
            value={form.email}
          />
          <input
            className="ui-field"
            onChange={(e) => setForm((current) => ({ ...current, password: e.target.value }))}
            placeholder="Password"
            required
            type="password"
            value={form.password}
          />
          <button
            className="ui-btn-primary w-full disabled:cursor-not-allowed disabled:opacity-70"
            disabled={loading}
            type="submit"
          >

            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-white/50">
          Don&apos;t have an account? <Link className="text-gold" to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}
