import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';
import api, { getApiErrorMessage } from '../../services/api.js';
import Loader from '../components/Loader.jsx';
import {
  buildBookingDates,
  formatCurrency,
  formatDate,
  getRoomImage,
  toTitleCase,
} from '../../utils/helpers.js';

export default function Booking() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, user } = useAuth();
  const roomId = searchParams.get('roomId');

  const [room, setRoom] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(Boolean(roomId));
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingsLoading, setBookingsLoading] = useState(Boolean(isAuthenticated));
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    ...buildBookingDates(),
    guests: 1,
    specialRequests: '',
  });

  const loadBookings = async () => {
    if (!isAuthenticated) {
      setBookings([]);
      setBookingsLoading(false);
      return;
    }

    setBookingsLoading(true);
    try {
      const { data } = await api.get('/bookings/mybookings');
      setBookings(data || []);
    } catch (loadError) {
      setError(getApiErrorMessage(loadError, 'Unable to load your bookings.'));
    } finally {
      setBookingsLoading(false);
    }
  };

  useEffect(() => {
    if (!roomId) return undefined;

    const loadRoom = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/rooms/${roomId}`);
        setRoom(data);
      } catch (loadError) {
        setError(getApiErrorMessage(loadError, 'Unable to load the selected room.'));
      } finally {
        setLoading(false);
      }
    };

    loadRoom();

    return undefined;
  }, [roomId]);

  useEffect(() => {
    if (!isAuthenticated) {
      return undefined;
    }

    let ignore = false;

    const syncBookings = async () => {
      setBookingsLoading(true);
      try {
        const { data } = await api.get('/bookings/mybookings');
        if (!ignore) {
          setBookings(data || []);
        }
      } catch (loadError) {
        if (!ignore) {
          setError(getApiErrorMessage(loadError, 'Unable to load your bookings.'));
        }
      } finally {
        if (!ignore) {
          setBookingsLoading(false);
        }
      }
    };

    syncBookings();

    return () => {
      ignore = true;
    };
  }, [isAuthenticated]);

  const handleCreateBooking = async (event) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/bookings${roomId ? `?roomId=${roomId}` : ''}` } });
      return;
    }

    if (!roomId) {
      setError('Please choose a room before creating a booking.');
      return;
    }

    setBookingLoading(true);

    try {
      await api.post('/bookings', {
        roomId,
        checkInDate: formData.checkInDate,
        checkOutDate: formData.checkOutDate,
        guests: Number(formData.guests),
        specialRequests: formData.specialRequests,
      });

      setSuccessMessage('Booking created successfully. You can track it below.');
      setFormData({
        ...buildBookingDates(),
        guests: 1,
        specialRequests: '',
      });
      await loadBookings();
    } catch (submitError) {
      setError(getApiErrorMessage(submitError, 'Booking could not be created.'));
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      await api.put(`/bookings/${bookingId}/cancel`);
      await loadBookings();
    } catch (cancelError) {
      setError(getApiErrorMessage(cancelError, 'Unable to cancel this booking.'));
    }
  };

  return (
    <section className="mx-auto grid w-full max-w-7xl gap-8 px-4 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-teal-200">Booking desk</p>
          <h1 className="mt-2 text-4xl font-semibold text-white" style={{ fontFamily: 'Sora, sans-serif' }}>
            Finalize your stay
          </h1>
          <p className="mt-3 max-w-xl text-base leading-7 text-slate-300">
            Choose dates, confirm the guest count, and keep an eye on your booking history from the same page.
          </p>
        </div>

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center rounded-[2rem] border border-white/10 bg-white/5">
            <Loader label="Loading room details..." />
          </div>
        ) : roomId && room ? (
          <article className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-xl shadow-black/20">
            <div className="h-52 overflow-hidden">
              <img alt={room.type} className="h-full w-full object-cover" src={getRoomImage(room)} />
            </div>
            <div className="space-y-4 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
                    {room.hotelId?.name || 'Selected hotel'}
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-white" style={{ fontFamily: 'Sora, sans-serif' }}>
                    {toTitleCase(room.type)} room
                  </h2>
                </div>
                <span className="rounded-full border border-teal-300/20 bg-teal-300/10 px-3 py-1 text-sm font-semibold text-teal-100">
                  {formatCurrency(room.pricePerNight)} / night
                </span>
              </div>
              <p className="text-sm text-slate-300">Room {room.roomNumber} • Capacity {room.capacity} guest{room.capacity === 1 ? '' : 's'}</p>
              <div className="flex flex-wrap gap-2">
                {(room.amenities || []).map((amenity) => (
                  <span
                    className="rounded-full border border-white/10 bg-slate-900/70 px-3 py-1 text-xs uppercase tracking-[0.22em] text-slate-300"
                    key={amenity}
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          </article>
        ) : (
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 text-slate-300">
            Select a room from a hotel detail page first. You can browse current options from the
            {' '}
            <Link className="font-semibold text-teal-200" to="/hotels">hotels page</Link>.
          </div>
        )}

        {!isAuthenticated && (
          <div className="rounded-[2rem] border border-amber-200/20 bg-amber-200/10 p-6 text-amber-50">
            <p className="text-sm leading-7">
              You need to sign in before completing a booking. Your room selection will stay in the URL so you can continue after login.
            </p>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <form className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur" onSubmit={handleCreateBooking}>
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Create booking</p>
              <h2 className="text-2xl font-semibold text-white" style={{ fontFamily: 'Sora, sans-serif' }}>
                Stay request form
              </h2>
            </div>
            <p className="text-sm text-slate-300">{user ? `Booking as ${user.name}` : 'Guest sign-in required'}</p>
          </div>

          {(error || successMessage) && (
            <div
              className={`mt-5 rounded-2xl border p-4 text-sm ${
                error
                  ? 'border-red-300/20 bg-red-300/10 text-red-100'
                  : 'border-emerald-300/20 bg-emerald-300/10 text-emerald-100'
              }`}
            >
              {error || successMessage}
            </div>
          )}

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-200">
              <span>Check-in</span>
              <input
                className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none focus:border-teal-300/60"
                min={new Date().toISOString().slice(0, 10)}
                onChange={(event) => setFormData((current) => ({ ...current, checkInDate: event.target.value }))}
                type="date"
                value={formData.checkInDate}
              />
            </label>

            <label className="space-y-2 text-sm text-slate-200">
              <span>Check-out</span>
              <input
                className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none focus:border-teal-300/60"
                min={formData.checkInDate}
                onChange={(event) => setFormData((current) => ({ ...current, checkOutDate: event.target.value }))}
                type="date"
                value={formData.checkOutDate}
              />
            </label>

            <label className="space-y-2 text-sm text-slate-200 md:col-span-2">
              <span>Guests</span>
              <input
                className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none focus:border-teal-300/60"
                min="1"
                onChange={(event) => setFormData((current) => ({ ...current, guests: event.target.value }))}
                type="number"
                value={formData.guests}
              />
            </label>

            <label className="space-y-2 text-sm text-slate-200 md:col-span-2">
              <span>Special requests</span>
              <textarea
                className="min-h-28 w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none focus:border-teal-300/60"
                onChange={(event) => setFormData((current) => ({ ...current, specialRequests: event.target.value }))}
                placeholder="Late check-in, high floor, quiet room..."
                value={formData.specialRequests}
              />
            </label>
          </div>

          <button
            className="mt-6 w-full rounded-2xl bg-teal-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-teal-200 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={bookingLoading}
            type="submit"
          >
            {bookingLoading ? 'Creating booking...' : 'Confirm booking request'}
          </button>
        </form>

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">History</p>
              <h2 className="text-2xl font-semibold text-white" style={{ fontFamily: 'Sora, sans-serif' }}>
                My bookings
              </h2>
            </div>
            {isAuthenticated && <p className="text-sm text-slate-300">{bookings.length} booking record{bookings.length === 1 ? '' : 's'}</p>}
          </div>

          {!isAuthenticated ? (
            <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-slate-950/40 p-5 text-sm text-slate-300">
              Sign in to view booking history and cancellations.
            </div>
          ) : bookingsLoading ? (
            <div className="mt-6 flex min-h-[180px] items-center justify-center">
              <Loader label="Loading your bookings..." />
            </div>
          ) : bookings.length === 0 ? (
            <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-slate-950/40 p-5 text-sm text-slate-300">
              You have not created any bookings yet.
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {bookings.map((booking) => (
                <article
                  className="rounded-[1.5rem] border border-white/10 bg-slate-950/40 p-5"
                  key={booking._id}
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
                        {booking.hotelId?.name || 'Hotel booking'}
                      </p>
                      <h3 className="mt-2 text-xl font-semibold text-white" style={{ fontFamily: 'Sora, sans-serif' }}>
                        {toTitleCase(booking.roomId?.type || 'room')}
                      </h3>
                      <p className="mt-2 text-sm text-slate-300">
                        {formatDate(booking.checkInDate)} to {formatDate(booking.checkOutDate)} • {booking.guests} guest{booking.guests === 1 ? '' : 's'}
                      </p>
                    </div>

                    <div className="flex flex-col items-start gap-3 md:items-end">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] ${
                          booking.status === 'confirmed'
                            ? 'bg-emerald-300/15 text-emerald-100'
                            : booking.status === 'cancelled'
                              ? 'bg-red-300/15 text-red-100'
                              : 'bg-amber-200/15 text-amber-50'
                        }`}
                      >
                        {booking.status}
                      </span>
                      <p className="text-lg font-semibold text-white">{formatCurrency(booking.totalPrice)}</p>
                      {booking.status !== 'cancelled' && (
                        <button
                          className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-white/5"
                          onClick={() => handleCancelBooking(booking._id)}
                          type="button"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
