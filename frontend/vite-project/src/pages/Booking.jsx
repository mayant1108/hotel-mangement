import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';
import api, { getApiErrorMessage } from '../../services/api.js';
import Loader from '../components/Loader.jsx';
import { formatCurrency, formatDate } from '../utils/hotel.js';

export default function Booking() {
  const { authReady, isAuthenticated } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authReady) {
      return undefined;
    }

    if (!isAuthenticated) {
      setLoading(false);
      setBookings([]);
      return undefined;
    }

    let active = true;

    const loadBookings = async () => {
      setLoading(true);
      setError('');

      try {
        const { data } = await api.get('/bookings/mybookings');
        if (active) {
          setBookings(data || []);
        }
      } catch (requestError) {
        if (active) {
          setError(getApiErrorMessage(requestError, 'Unable to load your bookings.'));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadBookings();

    return () => {
      active = false;
    };
  }, [authReady, isAuthenticated]);

  const handleCancel = async (bookingId) => {
    setActionLoading(bookingId);
    setError('');

    try {
      await api.put(`/bookings/${bookingId}/cancel`, {});
      setBookings((current) => current.map((booking) => (
        booking._id === bookingId ? { ...booking, status: 'cancelled' } : booking
      )));
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Unable to cancel this booking.'));
    } finally {
      setActionLoading('');
    }
  };

  if (!authReady || loading) {
    return (
      <div className="flex justify-center px-4 py-20">
        <Loader label="Loading your bookings..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <h1 className="mb-4 text-4xl font-['Playfair_Display'] font-bold text-gold">My Bookings</h1>
        <p className="mx-auto max-w-2xl text-white/70">
          Sign in to view your reservations, booking status, and stay details.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <Link className="rounded-full bg-gold px-6 py-3 font-semibold text-black transition hover:bg-gold/90" to="/login">
            Sign In
          </Link>
          <Link className="rounded-full border border-gold/40 px-6 py-3 font-semibold text-gold transition hover:bg-gold/10" to="/hotels">
            Explore Hotels
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.32em] text-amber-200">Account</p>
          <h1 className="mt-3 text-4xl font-['Playfair_Display'] font-bold text-gold">My Bookings</h1>
        </div>
        <Link className="inline-flex items-center justify-center rounded-full border border-gold/40 px-5 py-2.5 text-sm font-semibold text-gold transition hover:bg-gold/10" to="/hotels">
          Book another stay
        </Link>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-300/25 bg-red-300/10 px-4 py-3 text-sm text-red-100">
          {error}
        </div>
      )}

      <div className="grid gap-5">
        {bookings.map((booking) => {
          const canCancel = ['pending', 'confirmed'].includes(booking.status);

          return (
            <article className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 backdrop-blur sm:p-6" key={booking._id}>
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-2xl font-semibold text-white">{booking.hotelId?.name || 'Hotel booking'}</h2>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] ${
                      booking.status === 'cancelled'
                        ? 'bg-red-300/15 text-red-100'
                        : booking.status === 'completed'
                          ? 'bg-blue-300/15 text-blue-100'
                          : booking.status === 'confirmed'
                            ? 'bg-emerald-300/15 text-emerald-100'
                            : 'bg-amber-200/15 text-amber-50'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300">
                    Room {booking.roomId?.roomNumber || '--'} • {booking.roomId?.type || 'Room'} • {formatCurrency(booking.roomId?.pricePerNight || booking.totalPrice)}
                  </p>
                  <div className="grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
                    <p><span className="text-slate-500">Check-in:</span> {formatDate(booking.checkInDate)}</p>
                    <p><span className="text-slate-500">Check-out:</span> {formatDate(booking.checkOutDate)}</p>
                    <p><span className="text-slate-500">Guests:</span> {booking.guests}</p>
                    <p><span className="text-slate-500">Total:</span> {formatCurrency(booking.totalPrice)}</p>
                  </div>
                </div>

                {canCancel && (
                  <button
                    className="rounded-full border border-red-300/35 px-5 py-2.5 text-sm font-semibold text-red-100 transition hover:bg-red-300/10 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={actionLoading === booking._id}
                    onClick={() => handleCancel(booking._id)}
                    type="button"
                  >
                    {actionLoading === booking._id ? 'Cancelling...' : 'Cancel booking'}
                  </button>
                )}
              </div>
            </article>
          );
        })}

        {!bookings.length && (
          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-8 text-center">
            <p className="text-lg text-white">No bookings yet.</p>
            <p className="mt-2 text-sm text-slate-400">Once you reserve a room, your booking history will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
