import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';
import { getApiErrorMessage } from '../../services/api.js';

export default function Register() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
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
      await register({ ...form, role: 'customer' });
      navigate(redirectTo, { replace: true });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Unable to create your account.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-14 sm:px-6 sm:py-20">
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-sm sm:p-8">
        <h1 className="mb-3 text-center text-3xl font-['Playfair_Display'] font-bold text-gold">Create Account</h1>
        <p className="text-center text-sm leading-6 text-slate-300">
          Register once to manage bookings and reserve rooms directly from the site.
        </p>
        {error && (
          <div className="mt-5 rounded-2xl border border-red-300/25 bg-red-300/10 px-4 py-3 text-sm text-red-100">
            {error}
          </div>
        )}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            className="ui-field mt-6"
            onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))}
            placeholder="Full Name"
            required
            type="text"
            value={form.name}
          />
          <input
            className="ui-field"
            onChange={(e) => setForm((current) => ({ ...current, phone: e.target.value }))}
            placeholder="Phone Number"
            type="tel"
            value={form.phone}
          />
          <input
            className="ui-field"
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

            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-white/50">
          Already have an account? <Link className="text-gold" to="/login">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
