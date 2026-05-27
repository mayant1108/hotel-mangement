import { useEffect, useState } from 'react';
import api, {
  clearStoredAdmin,
  getApiErrorMessage,
  getStoredAdmin,
  persistAdmin,
} from '../services/api';

const todayString = new Date().toISOString().slice(0, 10);

const formatCurrency = (value) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
}).format(Number(value || 0));

const formatDate = (value) => new Intl.DateTimeFormat('en-IN', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
}).format(new Date(value));

const parseList = (value) => value
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean);

const defaultLoginForm = {
  email: '',
  password: '',
};

const defaultBootstrapForm = {
  name: '',
  email: '',
  phone: '',
  password: '',
};

const defaultRegisterForm = {
  name: '',
  email: '',
  phone: '',
  password: '',
  role: 'staff',
};

const defaultHotelForm = {
  name: '',
  address: '',
  city: '',
  state: '',
  zip: '',
  description: '',
  amenities: '',
  images: '',
  rating: '',
  contactPhone: '',
  contactEmail: '',
};

const defaultRoomForm = {
  hotelId: '',
  roomNumber: '',
  type: 'single',
  pricePerNight: '',
  capacity: '',
  amenities: '',
  images: '',
};

function StatCard({ label, value, hint }) {
  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 shadow-xl shadow-black/10">
      <p className="text-xs uppercase tracking-[0.28em] text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-white" style={{ fontFamily: 'Sora, sans-serif' }}>
        {value}
      </p>
      <p className="mt-2 text-sm text-slate-300">{hint}</p>
    </div>
  );
}

export default function HotelManagement() {
  const [storedAdmin] = useState(() => getStoredAdmin());
  const [adminUser, setAdminUser] = useState(storedAdmin);
  const [bootLoading, setBootLoading] = useState(Boolean(storedAdmin?.token));
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [bootstrapLoading, setBootstrapLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState('');
  const [flash, setFlash] = useState({ type: '', text: '' });

  const [loginForm, setLoginForm] = useState(defaultLoginForm);
  const [bootstrapForm, setBootstrapForm] = useState(defaultBootstrapForm);
  const [registerForm, setRegisterForm] = useState(defaultRegisterForm);
  const [hotelForm, setHotelForm] = useState(defaultHotelForm);
  const [roomForm, setRoomForm] = useState(defaultRoomForm);

  const [dashboard, setDashboard] = useState({
    hotels: [],
    rooms: [],
    bookings: [],
  });

  useEffect(() => {
    if (adminUser) {
      persistAdmin(adminUser);
      return;
    }

    clearStoredAdmin();
  }, [adminUser]);

  const loadDashboard = async () => {
    setDashboardLoading(true);

    try {
      const [hotelResponse, roomResponse, bookingResponse] = await Promise.all([
        api.get('/hotels', { params: { limit: 100 } }),
        api.get('/rooms', { params: { limit: 100 } }),
        api.get('/bookings'),
      ]);

      setDashboard({
        hotels: hotelResponse.data.hotels || [],
        rooms: roomResponse.data.rooms || [],
        bookings: bookingResponse.data || [],
      });
    } catch (error) {
      setFlash({
        type: 'error',
        text: getApiErrorMessage(error, 'Unable to load dashboard data.'),
      });
    } finally {
      setDashboardLoading(false);
    }
  };

  useEffect(() => {
    if (!storedAdmin?.token) {
      setBootLoading(false);
      return;
    }

    const syncAdminSession = async () => {
      try {
        const { data } = await api.get('/auth/profile');
        if (data.role !== 'admin') {
          clearStoredAdmin();
          setAdminUser(null);
          setFlash({
            type: 'error',
            text: 'This dashboard only works with admin accounts.',
          });
          return;
        }

        const mergedUser = { ...storedAdmin, ...data, token: storedAdmin.token };
        persistAdmin(mergedUser);
        setAdminUser(mergedUser);
        await loadDashboard();
      } catch (error) {
        clearStoredAdmin();
        setAdminUser(null);
        setFlash({
          type: 'error',
          text: getApiErrorMessage(error, 'Your admin session has expired. Please sign in again.'),
        });
      } finally {
        setBootLoading(false);
      }
    };

    syncAdminSession();
  }, [storedAdmin]);

  const activeBookings = dashboard.bookings.filter((booking) => ['pending', 'confirmed'].includes(booking.status));
  const occupiedRoomIds = new Set(
    activeBookings.map((booking) => booking.roomId?._id || booking.roomId).filter(Boolean),
  );
  const todayCheckins = dashboard.bookings.filter(
    (booking) => booking.checkInDate?.slice(0, 10) === todayString,
  ).length;
  const revenue = dashboard.bookings
    .filter((booking) => booking.status !== 'cancelled')
    .reduce((total, booking) => total + Number(booking.totalPrice || 0), 0);
  const occupiedRooms = occupiedRoomIds.size;
  const totalRooms = dashboard.rooms.length;
  const stats = {
    totalHotels: dashboard.hotels.length,
    totalRooms,
    occupiedRooms,
    availableRooms: Math.max(totalRooms - occupiedRooms, 0),
    activeBookings: activeBookings.length,
    todayCheckins,
    revenue,
    occupancyRate: totalRooms ? Math.round((occupiedRooms / totalRooms) * 100) : 0,
  };

  const resetFlash = () => setFlash({ type: '', text: '' });

  const handleLogout = () => {
    setAdminUser(null);
    setDashboard({ hotels: [], rooms: [], bookings: [] });
    clearStoredAdmin();
    setFlash({ type: '', text: '' });
  };

  const handleAdminLogin = async (event) => {
    event.preventDefault();
    resetFlash();
    setLoginLoading(true);

    try {
      const { data } = await api.post('/auth/login', loginForm);
      if (data.role !== 'admin') {
        setFlash({
          type: 'error',
          text: 'This account does not have admin access.',
        });
        return;
      }

      persistAdmin(data);
      setAdminUser(data);
      setLoginForm(defaultLoginForm);
      await loadDashboard();
    } catch (error) {
      setFlash({
        type: 'error',
        text: getApiErrorMessage(error, 'Unable to sign in as admin.'),
      });
    } finally {
      setLoginLoading(false);
    }
  };

  const handleBootstrapAdmin = async (event) => {
    event.preventDefault();
    resetFlash();
    setBootstrapLoading(true);

    try {
      const { data } = await api.post('/auth/register', {
        ...bootstrapForm,
        role: 'admin',
      });

      if (data.role !== 'admin') {
        setFlash({
          type: 'error',
          text: 'An admin already exists. Sign in with an admin account to manage the dashboard.',
        });
        return;
      }

      persistAdmin(data);
      setAdminUser(data);
      setBootstrapForm(defaultBootstrapForm);
      await loadDashboard();
      setFlash({
        type: 'success',
        text: 'First admin account created successfully.',
      });
    } catch (error) {
      setFlash({
        type: 'error',
        text: getApiErrorMessage(error, 'Unable to create the first admin account.'),
      });
    } finally {
      setBootstrapLoading(false);
    }
  };

  const handleRegisterUser = async (event) => {
    event.preventDefault();
    resetFlash();
    setActionLoading('register-user');

    try {
      const { data } = await api.post('/auth/register', registerForm);
      setRegisterForm(defaultRegisterForm);
      setFlash({
        type: 'success',
        text: `${data.name} created successfully with ${data.role} access.`,
      });
    } catch (error) {
      setFlash({
        type: 'error',
        text: getApiErrorMessage(error, 'Unable to create the user.'),
      });
    } finally {
      setActionLoading('');
    }
  };

  const handleCreateHotel = async (event) => {
    event.preventDefault();
    resetFlash();
    setActionLoading('create-hotel');

    try {
      await api.post('/hotels', {
        ...hotelForm,
        rating: hotelForm.rating ? Number(hotelForm.rating) : 0,
        amenities: parseList(hotelForm.amenities),
        images: parseList(hotelForm.images),
      });

      setHotelForm(defaultHotelForm);
      await loadDashboard();
      setFlash({
        type: 'success',
        text: 'Hotel created successfully.',
      });
    } catch (error) {
      setFlash({
        type: 'error',
        text: getApiErrorMessage(error, 'Unable to create the hotel.'),
      });
    } finally {
      setActionLoading('');
    }
  };

  const handleCreateRoom = async (event) => {
    event.preventDefault();
    resetFlash();
    setActionLoading('create-room');

    try {
      await api.post('/rooms', {
        ...roomForm,
        pricePerNight: Number(roomForm.pricePerNight),
        capacity: Number(roomForm.capacity),
        amenities: parseList(roomForm.amenities),
        images: parseList(roomForm.images),
      });

      setRoomForm((current) => ({
        ...defaultRoomForm,
        hotelId: current.hotelId,
      }));
      await loadDashboard();
      setFlash({
        type: 'success',
        text: 'Room created successfully.',
      });
    } catch (error) {
      setFlash({
        type: 'error',
        text: getApiErrorMessage(error, 'Unable to create the room.'),
      });
    } finally {
      setActionLoading('');
    }
  };

  const handleBookingStatusUpdate = async (bookingId, status) => {
    resetFlash();
    setActionLoading(bookingId);

    try {
      await api.put(`/bookings/${bookingId}/status`, { status });
      await loadDashboard();
      setFlash({
        type: 'success',
        text: `Booking marked as ${status}.`,
      });
    } catch (error) {
      setFlash({
        type: 'error',
        text: getApiErrorMessage(error, 'Unable to update booking status.'),
      });
    } finally {
      setActionLoading('');
    }
  };

  if (bootLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-white/15 border-t-amber-300" />
          <p className="mt-4 text-sm uppercase tracking-[0.32em] text-slate-300">Loading admin session...</p>
        </div>
      </div>
    );
  }

  if (!adminUser) {
    return (
      <div className="min-h-screen px-4 py-10">
        <div className="mx-auto w-full max-w-6xl">
          <div className="mb-8 space-y-3">
            <p className="text-xs uppercase tracking-[0.34em] text-amber-200">Hotel Haven Admin</p>
            <h1 className="text-4xl font-semibold text-white md:text-5xl" style={{ fontFamily: 'Sora, sans-serif' }}>
              Live hotel operations in one dashboard
            </h1>
            <p className="max-w-3xl text-base leading-8 text-slate-300">
              Sign in with an admin account to manage hotels, rooms, and bookings. If this is the first time you are opening the dashboard, create the first admin account from the bootstrap form.
            </p>
          </div>

          {flash.text && (
            <div
              className={`mb-6 rounded-[1.75rem] border p-4 text-sm ${
                flash.type === 'success'
                  ? 'border-emerald-300/20 bg-emerald-300/10 text-emerald-100'
                  : 'border-red-300/20 bg-red-300/10 text-red-100'
              }`}
            >
              {flash.text}
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            <form className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/20 backdrop-blur" onSubmit={handleAdminLogin}>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Admin access</p>
              <h2 className="mt-3 text-3xl font-semibold text-white" style={{ fontFamily: 'Sora, sans-serif' }}>
                Sign in
              </h2>
              <div className="mt-6 space-y-4">
                <label className="block space-y-2 text-sm text-slate-200">
                  <span>Email</span>
                  <input
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none focus:border-amber-300/60"
                    onChange={(event) => setLoginForm((current) => ({ ...current, email: event.target.value }))}
                    type="email"
                    value={loginForm.email}
                  />
                </label>
                <label className="block space-y-2 text-sm text-slate-200">
                  <span>Password</span>
                  <input
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none focus:border-amber-300/60"
                    onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))}
                    type="password"
                    value={loginForm.password}
                  />
                </label>
              </div>
              <button
                className="mt-6 w-full rounded-2xl bg-amber-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={loginLoading}
                type="submit"
              >
                {loginLoading ? 'Signing in...' : 'Sign in as admin'}
              </button>
            </form>

            <form className="rounded-[2rem] border border-amber-200/20 bg-amber-200/10 p-8 shadow-2xl shadow-black/20" onSubmit={handleBootstrapAdmin}>
              <p className="text-xs uppercase tracking-[0.3em] text-amber-100">Bootstrap</p>
              <h2 className="mt-3 text-3xl font-semibold text-white" style={{ fontFamily: 'Sora, sans-serif' }}>
                Create first admin
              </h2>
              <p className="mt-3 text-sm leading-7 text-amber-50/90">
                This should only be used once. If an admin already exists, sign in with that account instead.
              </p>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm text-white md:col-span-2">
                  <span>Full name</span>
                  <input
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none focus:border-amber-100/60"
                    onChange={(event) => setBootstrapForm((current) => ({ ...current, name: event.target.value }))}
                    type="text"
                    value={bootstrapForm.name}
                  />
                </label>
                <label className="space-y-2 text-sm text-white">
                  <span>Email</span>
                  <input
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none focus:border-amber-100/60"
                    onChange={(event) => setBootstrapForm((current) => ({ ...current, email: event.target.value }))}
                    type="email"
                    value={bootstrapForm.email}
                  />
                </label>
                <label className="space-y-2 text-sm text-white">
                  <span>Phone</span>
                  <input
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none focus:border-amber-100/60"
                    onChange={(event) => setBootstrapForm((current) => ({ ...current, phone: event.target.value }))}
                    type="tel"
                    value={bootstrapForm.phone}
                  />
                </label>
                <label className="space-y-2 text-sm text-white md:col-span-2">
                  <span>Password</span>
                  <input
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none focus:border-amber-100/60"
                    onChange={(event) => setBootstrapForm((current) => ({ ...current, password: event.target.value }))}
                    type="password"
                    value={bootstrapForm.password}
                  />
                </label>
              </div>
              <button
                className="mt-6 w-full rounded-2xl border border-white/10 bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={bootstrapLoading}
                type="submit"
              >
                {bootstrapLoading ? 'Creating admin...' : 'Create first admin'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="mx-auto w-full max-w-7xl space-y-8">
        <header className="flex flex-col gap-5 rounded-[2.25rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.34em] text-amber-200">Hotel Haven Admin</p>
            <h1 className="mt-3 text-4xl font-semibold text-white" style={{ fontFamily: 'Sora, sans-serif' }}>
              Welcome back, {adminUser.name}
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-8 text-slate-300">
              Manage live inventory, add hotel data, register team members, and track booking operations from one place.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              className="rounded-full border border-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dashboardLoading}
              onClick={loadDashboard}
              type="button"
            >
              {dashboardLoading ? 'Refreshing...' : 'Refresh data'}
            </button>
            <button
              className="rounded-full bg-amber-300 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-amber-200"
              onClick={handleLogout}
              type="button"
            >
              Logout
            </button>
          </div>
        </header>

        {flash.text && (
          <div
            className={`rounded-[1.75rem] border p-4 text-sm ${
              flash.type === 'success'
                ? 'border-emerald-300/20 bg-emerald-300/10 text-emerald-100'
                : 'border-red-300/20 bg-red-300/10 text-red-100'
            }`}
          >
            {flash.text}
          </div>
        )}

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
          <StatCard label="Hotels" value={stats.totalHotels} hint="Active properties listed" />
          <StatCard label="Rooms" value={stats.totalRooms} hint={`${stats.availableRooms} currently available`} />
          <StatCard label="Occupancy" value={`${stats.occupancyRate}%`} hint={`${stats.occupiedRooms} rooms occupied`} />
          <StatCard label="Check-ins today" value={stats.todayCheckins} hint={`${stats.activeBookings} active bookings`} />
          <StatCard label="Revenue" value={formatCurrency(stats.revenue)} hint="Non-cancelled booking total" />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Recent bookings</p>
                <h2 className="mt-2 text-2xl font-semibold text-white" style={{ fontFamily: 'Sora, sans-serif' }}>
                  Live guest activity
                </h2>
              </div>
              <p className="text-sm text-slate-300">{dashboard.bookings.length} booking record{dashboard.bookings.length === 1 ? '' : 's'}</p>
            </div>

            <div className="space-y-4">
              {dashboard.bookings.slice(0, 6).map((booking) => (
                <article className="rounded-[1.5rem] border border-white/10 bg-slate-950/35 p-5" key={booking._id}>
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                        {booking.hotelId?.name || 'Hotel booking'}
                      </p>
                      <h3 className="mt-2 text-xl font-semibold text-white">
                        {booking.userId?.name || 'Guest'} • Room {booking.roomId?.roomNumber}
                      </h3>
                      <p className="mt-2 text-sm text-slate-300">
                        {formatDate(booking.checkInDate)} to {formatDate(booking.checkOutDate)} • {formatCurrency(booking.totalPrice)}
                      </p>
                      <p className="mt-1 text-sm text-slate-400">{booking.userId?.email}</p>
                    </div>

                    <div className="flex flex-col gap-3 md:items-end">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] ${
                          booking.status === 'confirmed'
                            ? 'bg-emerald-300/15 text-emerald-100'
                            : booking.status === 'cancelled'
                              ? 'bg-red-300/15 text-red-100'
                              : booking.status === 'completed'
                                ? 'bg-blue-300/15 text-blue-100'
                                : 'bg-amber-200/15 text-amber-50'
                        }`}
                      >
                        {booking.status}
                      </span>

                      <div className="flex flex-wrap gap-2">
                        {['confirmed', 'completed', 'cancelled'].map((status) => (
                          <button
                            className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
                            disabled={actionLoading === booking._id || booking.status === status}
                            key={status}
                            onClick={() => handleBookingStatusUpdate(booking._id, status)}
                            type="button"
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </article>
              ))}

              {!dashboard.bookings.length && (
                <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/35 p-5 text-sm text-slate-300">
                  No bookings have been created yet.
                </div>
              )}
            </div>
          </div>

          <form className="rounded-[2rem] border border-amber-200/20 bg-amber-200/10 p-6" onSubmit={handleRegisterUser}>
            <p className="text-xs uppercase tracking-[0.3em] text-amber-100">Team and guests</p>
            <h2 className="mt-2 text-2xl font-semibold text-white" style={{ fontFamily: 'Sora, sans-serif' }}>
              Register a new user
            </h2>
            <div className="mt-6 grid gap-4">
              <label className="space-y-2 text-sm text-white">
                <span>Full name</span>
                <input
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none focus:border-amber-100/60"
                  onChange={(event) => setRegisterForm((current) => ({ ...current, name: event.target.value }))}
                  type="text"
                  value={registerForm.name}
                />
              </label>
              <label className="space-y-2 text-sm text-white">
                <span>Email</span>
                <input
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none focus:border-amber-100/60"
                  onChange={(event) => setRegisterForm((current) => ({ ...current, email: event.target.value }))}
                  type="email"
                  value={registerForm.email}
                />
              </label>
              <label className="space-y-2 text-sm text-white">
                <span>Phone</span>
                <input
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none focus:border-amber-100/60"
                  onChange={(event) => setRegisterForm((current) => ({ ...current, phone: event.target.value }))}
                  type="tel"
                  value={registerForm.phone}
                />
              </label>
              <label className="space-y-2 text-sm text-white">
                <span>Password</span>
                <input
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none focus:border-amber-100/60"
                  onChange={(event) => setRegisterForm((current) => ({ ...current, password: event.target.value }))}
                  type="password"
                  value={registerForm.password}
                />
              </label>
              <label className="space-y-2 text-sm text-white">
                <span>Role</span>
                <select
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-white outline-none focus:border-amber-100/60"
                  onChange={(event) => setRegisterForm((current) => ({ ...current, role: event.target.value }))}
                  value={registerForm.role}
                >
                  <option value="staff">Staff</option>
                  <option value="customer">Customer</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
            </div>
            <button
              className="mt-6 w-full rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={actionLoading === 'register-user'}
              type="submit"
            >
              {actionLoading === 'register-user' ? 'Creating user...' : 'Create user'}
            </button>
          </form>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <form className="rounded-[2rem] border border-white/10 bg-white/5 p-6" onSubmit={handleCreateHotel}>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Inventory</p>
            <h2 className="mt-2 text-2xl font-semibold text-white" style={{ fontFamily: 'Sora, sans-serif' }}>
              Add hotel
            </h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-200 md:col-span-2">
                <span>Hotel name</span>
                <input
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3 text-white outline-none focus:border-white/30"
                  onChange={(event) => setHotelForm((current) => ({ ...current, name: event.target.value }))}
                  type="text"
                  value={hotelForm.name}
                />
              </label>
              <label className="space-y-2 text-sm text-slate-200 md:col-span-2">
                <span>Address</span>
                <input
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3 text-white outline-none focus:border-white/30"
                  onChange={(event) => setHotelForm((current) => ({ ...current, address: event.target.value }))}
                  type="text"
                  value={hotelForm.address}
                />
              </label>
              <label className="space-y-2 text-sm text-slate-200">
                <span>City</span>
                <input
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3 text-white outline-none focus:border-white/30"
                  onChange={(event) => setHotelForm((current) => ({ ...current, city: event.target.value }))}
                  type="text"
                  value={hotelForm.city}
                />
              </label>
              <label className="space-y-2 text-sm text-slate-200">
                <span>State</span>
                <input
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3 text-white outline-none focus:border-white/30"
                  onChange={(event) => setHotelForm((current) => ({ ...current, state: event.target.value }))}
                  type="text"
                  value={hotelForm.state}
                />
              </label>
              <label className="space-y-2 text-sm text-slate-200">
                <span>ZIP</span>
                <input
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3 text-white outline-none focus:border-white/30"
                  onChange={(event) => setHotelForm((current) => ({ ...current, zip: event.target.value }))}
                  type="text"
                  value={hotelForm.zip}
                />
              </label>
              <label className="space-y-2 text-sm text-slate-200">
                <span>Rating</span>
                <input
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3 text-white outline-none focus:border-white/30"
                  max="5"
                  min="0"
                  onChange={(event) => setHotelForm((current) => ({ ...current, rating: event.target.value }))}
                  step="0.1"
                  type="number"
                  value={hotelForm.rating}
                />
              </label>
              <label className="space-y-2 text-sm text-slate-200 md:col-span-2">
                <span>Description</span>
                <textarea
                  className="min-h-28 w-full rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3 text-white outline-none focus:border-white/30"
                  onChange={(event) => setHotelForm((current) => ({ ...current, description: event.target.value }))}
                  value={hotelForm.description}
                />
              </label>
              <label className="space-y-2 text-sm text-slate-200 md:col-span-2">
                <span>Amenities (comma separated)</span>
                <input
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3 text-white outline-none focus:border-white/30"
                  onChange={(event) => setHotelForm((current) => ({ ...current, amenities: event.target.value }))}
                  type="text"
                  value={hotelForm.amenities}
                />
              </label>
              <label className="space-y-2 text-sm text-slate-200 md:col-span-2">
                <span>Image URLs (comma separated)</span>
                <input
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3 text-white outline-none focus:border-white/30"
                  onChange={(event) => setHotelForm((current) => ({ ...current, images: event.target.value }))}
                  type="text"
                  value={hotelForm.images}
                />
              </label>
              <label className="space-y-2 text-sm text-slate-200">
                <span>Contact phone</span>
                <input
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3 text-white outline-none focus:border-white/30"
                  onChange={(event) => setHotelForm((current) => ({ ...current, contactPhone: event.target.value }))}
                  type="text"
                  value={hotelForm.contactPhone}
                />
              </label>
              <label className="space-y-2 text-sm text-slate-200">
                <span>Contact email</span>
                <input
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3 text-white outline-none focus:border-white/30"
                  onChange={(event) => setHotelForm((current) => ({ ...current, contactEmail: event.target.value }))}
                  type="email"
                  value={hotelForm.contactEmail}
                />
              </label>
            </div>
            <button
              className="mt-6 w-full rounded-2xl bg-amber-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={actionLoading === 'create-hotel'}
              type="submit"
            >
              {actionLoading === 'create-hotel' ? 'Creating hotel...' : 'Create hotel'}
            </button>
          </form>

          <form className="rounded-[2rem] border border-white/10 bg-white/5 p-6" onSubmit={handleCreateRoom}>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Inventory</p>
            <h2 className="mt-2 text-2xl font-semibold text-white" style={{ fontFamily: 'Sora, sans-serif' }}>
              Add room
            </h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-200 md:col-span-2">
                <span>Hotel</span>
                <select
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3 text-white outline-none focus:border-white/30"
                  onChange={(event) => setRoomForm((current) => ({ ...current, hotelId: event.target.value }))}
                  value={roomForm.hotelId}
                >
                  <option value="">Select hotel</option>
                  {dashboard.hotels.map((hotel) => (
                    <option key={hotel._id} value={hotel._id}>{hotel.name}</option>
                  ))}
                </select>
              </label>
              <label className="space-y-2 text-sm text-slate-200">
                <span>Room number</span>
                <input
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3 text-white outline-none focus:border-white/30"
                  onChange={(event) => setRoomForm((current) => ({ ...current, roomNumber: event.target.value }))}
                  type="text"
                  value={roomForm.roomNumber}
                />
              </label>
              <label className="space-y-2 text-sm text-slate-200">
                <span>Type</span>
                <select
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3 text-white outline-none focus:border-white/30"
                  onChange={(event) => setRoomForm((current) => ({ ...current, type: event.target.value }))}
                  value={roomForm.type}
                >
                  <option value="single">Single</option>
                  <option value="double">Double</option>
                  <option value="suite">Suite</option>
                  <option value="deluxe">Deluxe</option>
                </select>
              </label>
              <label className="space-y-2 text-sm text-slate-200">
                <span>Price per night</span>
                <input
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3 text-white outline-none focus:border-white/30"
                  min="0"
                  onChange={(event) => setRoomForm((current) => ({ ...current, pricePerNight: event.target.value }))}
                  type="number"
                  value={roomForm.pricePerNight}
                />
              </label>
              <label className="space-y-2 text-sm text-slate-200">
                <span>Capacity</span>
                <input
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3 text-white outline-none focus:border-white/30"
                  min="1"
                  onChange={(event) => setRoomForm((current) => ({ ...current, capacity: event.target.value }))}
                  type="number"
                  value={roomForm.capacity}
                />
              </label>
              <label className="space-y-2 text-sm text-slate-200 md:col-span-2">
                <span>Amenities (comma separated)</span>
                <input
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3 text-white outline-none focus:border-white/30"
                  onChange={(event) => setRoomForm((current) => ({ ...current, amenities: event.target.value }))}
                  type="text"
                  value={roomForm.amenities}
                />
              </label>
              <label className="space-y-2 text-sm text-slate-200 md:col-span-2">
                <span>Image URLs (comma separated)</span>
                <input
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3 text-white outline-none focus:border-white/30"
                  onChange={(event) => setRoomForm((current) => ({ ...current, images: event.target.value }))}
                  type="text"
                  value={roomForm.images}
                />
              </label>
            </div>
            <button
              className="mt-6 w-full rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={actionLoading === 'create-room'}
              type="submit"
            >
              {actionLoading === 'create-room' ? 'Creating room...' : 'Create room'}
            </button>
          </form>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Hotels</p>
                <h2 className="mt-2 text-2xl font-semibold text-white" style={{ fontFamily: 'Sora, sans-serif' }}>
                  Property list
                </h2>
              </div>
              <p className="text-sm text-slate-300">{dashboard.hotels.length} total</p>
            </div>
            <div className="space-y-4">
              {dashboard.hotels.map((hotel) => (
                <article className="rounded-[1.5rem] border border-white/10 bg-slate-950/35 p-5" key={hotel._id}>
                  <h3 className="text-lg font-semibold text-white">{hotel.name}</h3>
                  <p className="mt-2 text-sm text-slate-300">{hotel.city}, {hotel.state} • Rating {hotel.rating || 0}</p>
                  <p className="mt-2 text-sm text-slate-400">{hotel.address}</p>
                </article>
              ))}
              {!dashboard.hotels.length && (
                <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/35 p-5 text-sm text-slate-300">
                  No hotels have been added yet.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Rooms</p>
                <h2 className="mt-2 text-2xl font-semibold text-white" style={{ fontFamily: 'Sora, sans-serif' }}>
                  Inventory snapshot
                </h2>
              </div>
              <p className="text-sm text-slate-300">{dashboard.rooms.length} total</p>
            </div>
            <div className="space-y-4">
              {dashboard.rooms.map((room) => {
                const roomStatus = dashboard.bookings.some(
                  (booking) => ['pending', 'confirmed'].includes(booking.status)
                    && (booking.roomId?._id || booking.roomId) === room._id,
                )
                  ? 'Occupied'
                  : 'Available';

                return (
                  <article className="rounded-[1.5rem] border border-white/10 bg-slate-950/35 p-5" key={room._id}>
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          Room {room.roomNumber} • {room.type}
                        </h3>
                        <p className="mt-2 text-sm text-slate-300">
                          {room.hotelId?.name || 'Hotel'} • {formatCurrency(room.pricePerNight)} • Capacity {room.capacity}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] ${
                          roomStatus === 'Occupied'
                            ? 'bg-amber-200/15 text-amber-50'
                            : 'bg-emerald-300/15 text-emerald-100'
                        }`}
                      >
                        {roomStatus}
                      </span>
                    </div>
                  </article>
                );
              })}
              {!dashboard.rooms.length && (
                <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/35 p-5 text-sm text-slate-300">
                  No rooms have been added yet.
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
