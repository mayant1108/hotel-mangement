import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api, { getApiErrorMessage } from '../../services/api.js';
import Loader from '../components/Loader.jsx';
import {
  buildBookingDates,
  formatCurrency,
  getHotelImage,
  getRoomImage,
  toTitleCase,
} from '../../utils/helpers.js';

export default function HotelDetails() {
  const { id } = useParams();
  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roomLoading, setRoomLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    ...buildBookingDates(),
    guests: 1,
  });

  useEffect(() => {
    const loadPage = async () => {
      setLoading(true);
      setError('');

      try {
        const [{ data: hotelData }, { data: roomData }] = await Promise.all([
          api.get(`/hotels/${id}`),
          api.get('/rooms', { params: { hotelId: id, limit: 50 } }),
        ]);

        setHotel(hotelData);
        setRooms(roomData.rooms || []);
      } catch (loadError) {
        setError(getApiErrorMessage(loadError, 'Unable to load hotel details.'));
      } finally {
        setLoading(false);
      }
    };

    loadPage();
  }, [id]);

  const handleAvailabilitySearch = async (event) => {
    event.preventDefault();
    setRoomLoading(true);

    try {
      const { data } = await api.get('/rooms', {
        params: {
          hotelId: id,
          checkIn: filters.checkInDate,
          checkOut: filters.checkOutDate,
          limit: 50,
        },
      });

      setRooms(
        (data.rooms || []).filter((room) => room.capacity >= Number(filters.guests || 1)),
      );
    } catch (loadError) {
      setError(getApiErrorMessage(loadError, 'Unable to check room availability.'));
    } finally {
      setRoomLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <Loader label="Loading hotel details..." />
      </div>
    );
  }

  if (error) {
    return (
      <section className="mx-auto w-full max-w-5xl px-4">
        <div className="rounded-[2rem] border border-red-300/20 bg-red-300/10 p-6 text-sm text-red-100">
          {error}
        </div>
      </section>
    );
  }

  if (!hotel) {
    return null;
  }

  return (
    <section className="mx-auto w-full max-w-7xl space-y-8 px-4">
      <div className="overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5 shadow-2xl shadow-black/20 backdrop-blur">
        <div className="relative h-[360px] overflow-hidden">
          <img alt={hotel.name} className="h-full w-full object-cover" src={getHotelImage(hotel)} />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-8">
            <p className="text-xs uppercase tracking-[0.3em] text-teal-200">{hotel.city}, {hotel.state}</p>
            <h1 className="mt-3 text-4xl font-semibold text-white md:text-5xl" style={{ fontFamily: 'Sora, sans-serif' }}>
              {hotel.name}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-200">{hotel.description || 'A comfortable place to stay.'}</p>
          </div>
        </div>

        <div className="grid gap-6 p-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                ['Address', hotel.address],
                ['Zip', hotel.zip],
                ['Rating', `${hotel.rating || 0} / 5`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[1.5rem] border border-white/10 bg-slate-950/45 p-5">
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-400">{label}</p>
                  <p className="mt-3 text-base font-semibold text-white">{value}</p>
                </div>
              ))}
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/45 p-6">
              <h2 className="text-xl font-semibold text-white" style={{ fontFamily: 'Sora, sans-serif' }}>
                Amenities
              </h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {(hotel.amenities || []).map((amenity) => (
                  <span
                    key={amenity}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.22em] text-slate-200"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <form
            className="rounded-[1.75rem] border border-teal-300/15 bg-teal-300/10 p-6"
            onSubmit={handleAvailabilitySearch}
          >
            <p className="text-xs uppercase tracking-[0.32em] text-teal-100">Availability</p>
            <h2 className="mt-2 text-2xl font-semibold text-white" style={{ fontFamily: 'Sora, sans-serif' }}>
              Check your dates
            </h2>
            <div className="mt-6 space-y-4">
              <label className="block space-y-2 text-sm text-white">
                <span>Check-in</span>
                <input
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none focus:border-teal-300/60"
                  min={new Date().toISOString().slice(0, 10)}
                  onChange={(event) => setFilters((current) => ({ ...current, checkInDate: event.target.value }))}
                  type="date"
                  value={filters.checkInDate}
                />
              </label>
              <label className="block space-y-2 text-sm text-white">
                <span>Check-out</span>
                <input
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none focus:border-teal-300/60"
                  min={filters.checkInDate}
                  onChange={(event) => setFilters((current) => ({ ...current, checkOutDate: event.target.value }))}
                  type="date"
                  value={filters.checkOutDate}
                />
              </label>
              <label className="block space-y-2 text-sm text-white">
                <span>Guests</span>
                <input
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none focus:border-teal-300/60"
                  min="1"
                  onChange={(event) => setFilters((current) => ({ ...current, guests: event.target.value }))}
                  type="number"
                  value={filters.guests}
                />
              </label>
            </div>
            <button
              className="mt-6 w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={roomLoading}
              type="submit"
            >
              {roomLoading ? 'Checking availability...' : 'Refresh available rooms'}
            </button>
          </form>
        </div>
      </div>

      <div className="space-y-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-teal-200">Rooms</p>
            <h2 className="mt-2 text-3xl font-semibold text-white" style={{ fontFamily: 'Sora, sans-serif' }}>
              Available room types
            </h2>
          </div>
          <p className="text-sm text-slate-300">
            Showing {rooms.length} room option{rooms.length === 1 ? '' : 's'}
          </p>
        </div>

        {rooms.length === 0 ? (
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center text-slate-300">
            No rooms matched the selected dates or guest count.
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {rooms.map((room) => (
              <article
                className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-xl shadow-black/20"
                key={room._id}
              >
                <div className="h-48 overflow-hidden">
                  <img alt={room.type} className="h-full w-full object-cover" src={getRoomImage(room)} />
                </div>
                <div className="space-y-4 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Room {room.roomNumber}</p>
                      <h3 className="mt-2 text-2xl font-semibold text-white" style={{ fontFamily: 'Sora, sans-serif' }}>
                        {toTitleCase(room.type)}
                      </h3>
                    </div>
                    <p className="text-lg font-semibold text-teal-200">{formatCurrency(room.pricePerNight)}</p>
                  </div>

                  <p className="text-sm text-slate-300">Capacity: {room.capacity} guest{room.capacity === 1 ? '' : 's'}</p>

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

                  <Link
                    className="inline-flex rounded-full bg-teal-300 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-teal-200"
                    to={`/bookings?roomId=${room._id}&hotelId=${hotel._id}`}
                  >
                    Book this room
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
