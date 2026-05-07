import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';

const navLinkClass = ({ isActive }) => (
  `rounded-full px-4 py-2 text-sm font-medium transition ${
    isActive
      ? 'bg-white/10 text-white'
      : 'text-slate-300 hover:bg-white/5 hover:text-white'
  }`
);

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAdmin, isAuthenticated, logout, user } = useAuth();
  const adminUrl = import.meta.env.VITE_ADMIN_URL || 'http://localhost:3000';

  const links = [
    { to: '/', label: 'Home' },
    { to: '/hotels', label: 'Hotels' },
    { to: '/bookings', label: 'My Bookings' },
  ];

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-slate-950/75 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4">
        <Link className="flex items-center gap-3" to="/">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-teal-300 to-amber-200 text-lg font-black text-slate-950">
            H
          </span>
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-slate-400">Stay smarter</p>
            <p className="text-lg font-semibold text-white" style={{ fontFamily: 'Sora, sans-serif' }}>
              Hotel Haven
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {links.map((link) => (
            <NavLink key={link.to} className={navLinkClass} to={link.to}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <>
              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-right">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Signed in</p>
                <p className="text-sm font-semibold text-white">{user?.name}</p>
              </div>
              {isAdmin && (
                <a
                  className="rounded-full border border-amber-200/30 bg-amber-200/15 px-4 py-2 text-sm font-semibold text-amber-100 transition hover:bg-amber-200/25"
                  href={adminUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  Admin Panel
                </a>
              )}
              <button
                className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/5"
                onClick={logout}
                type="button"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink className={navLinkClass} to="/login">
                Login
              </NavLink>
              <NavLink
                className="rounded-full bg-teal-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-teal-200"
                to="/register"
              >
                Create account
              </NavLink>
            </>
          )}
        </div>

        <button
          className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 md:hidden"
          onClick={() => setMenuOpen((current) => !current)}
          type="button"
        >
          Menu
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-white/10 bg-slate-950/95 md:hidden">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-4">
            {links.map((link) => (
              <NavLink
                key={link.to}
                className={navLinkClass}
                onClick={() => setMenuOpen(false)}
                to={link.to}
              >
                {link.label}
              </NavLink>
            ))}

            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <a
                    className="rounded-full border border-amber-200/30 bg-amber-200/15 px-4 py-2 text-sm font-semibold text-amber-100"
                    href={adminUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Open admin panel
                  </a>
                )}
                <button
                  className="rounded-full border border-white/10 px-4 py-2 text-left text-sm font-semibold text-white"
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                  }}
                  type="button"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink className={navLinkClass} onClick={() => setMenuOpen(false)} to="/login">
                  Login
                </NavLink>
                <NavLink
                  className="rounded-full bg-teal-300 px-4 py-2 text-sm font-semibold text-slate-950"
                  onClick={() => setMenuOpen(false)}
                  to="/register"
                >
                  Create account
                </NavLink>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
