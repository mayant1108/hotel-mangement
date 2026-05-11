import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth.js';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };

  const navItems = [
    { name: 'Home', path: '/', type: 'route' },
    { name: 'Hotels', path: '/hotels', type: 'route' },
    { name: 'Amenities', path: '/#amenities', type: 'anchor' },
    { name: 'Gallery', path: '/#gallery', type: 'anchor' },
    { name: 'Bookings', path: '/bookings', type: 'route' },
  ];

  const renderNavLink = (item, mobile = false) => {
    const className = mobile
      ? 'text-sm uppercase tracking-[0.28em] text-white/80 transition hover:text-gold'
      : 'text-sm uppercase tracking-[0.24em] text-white/80 transition hover:text-gold';

    if (item.type === 'anchor') {
      return (
        <a
          className={className}
          href={item.path}
          key={item.name}
          onClick={() => setIsOpen(false)}
        >
          {item.name}
        </a>
      );
    }

    return (
      <Link
        className={className}
        key={item.name}
        onClick={() => setIsOpen(false)}
        to={item.path}
      >
        {item.name}
      </Link>
    );
  };

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-gold/[0.18] bg-black/70 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative flex min-h-16 items-center justify-between gap-4 py-3">
          <div className="pointer-events-none absolute inset-x-0 -top-8 h-16 bg-[radial-gradient(ellipse_at_center,rgba(200,169,107,0.20),transparent_60%)]" />

          <Link
            to="/"
            className="relative text-xl font-['Playfair_Display'] font-bold tracking-wide text-gold sm:text-2xl"
          >
            EliteHaven
          </Link>


          <div className="hidden items-center gap-6 md:flex">
            {navItems.map((item) => renderNavLink(item))}
            {isAuthenticated && (
              <span className="max-w-32 truncate text-sm text-slate-300">{user?.name}</span>
            )}
            {!isAuthenticated ? (
              <Link
                className="rounded-full bg-gold px-5 py-2 text-sm font-semibold text-black transition hover:bg-gold/90"
                to="/login"
              >
                Sign In
              </Link>
            ) : (
              <button
                className="rounded-full border border-gold/40 px-5 py-2 text-sm font-semibold text-gold transition hover:bg-gold/10"
                onClick={handleLogout}
                type="button"
              >
                Logout
              </button>
            )}
          </div>

          <button
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            className="rounded-full border border-white/10 p-2 text-xl text-white transition hover:bg-white/5 md:hidden"
            onClick={() => setIsOpen((current) => !current)}
            type="button"
          >
            <i className={`fas ${isOpen ? 'fa-times' : 'fa-bars'}`}></i>
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="border-t border-gold/[0.15] bg-black/95 px-4 py-4 backdrop-blur-xl md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-4">
            {isAuthenticated && (
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                Signed in as {user?.name || 'Guest'}
              </div>
            )}
            <div className="flex flex-col gap-4">
              {navItems.map((item) => renderNavLink(item, true))}
            </div>
            {!isAuthenticated ? (
              <Link
                className="rounded-full bg-gold px-6 py-3 text-center text-sm font-semibold text-black"
                onClick={() => setIsOpen(false)}
                to="/login"
              >
                Sign In
              </Link>
            ) : (
              <button
                className="rounded-full border border-gold/40 px-6 py-3 text-sm font-semibold text-gold"
                onClick={handleLogout}
                type="button"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
