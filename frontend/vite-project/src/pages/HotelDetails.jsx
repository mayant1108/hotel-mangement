import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';
import api, { getApiErrorMessage } from '../../services/api.js';
import Loader from '../components/Loader.jsx';
import {
  buildHotelLocation,
  formatCurrency,
  getPrimaryImage,
  resolveEntityId,
} from '../utils/hotel.js';

const defaultBookingForm = {
  roomId: '',
  checkInDate: '',
  checkOutDate: '',
  guests: 1,
  specialRequests: '',
};

export default function HotelDetails() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingState, setBookingState] = useState(defaultBookingForm);
  const [bookingMessage, setBookingMessage] = useState({ type: '', text: '' });
  const [bookingLoading, setBookingLoading] = useState(false);

  const preselectedRoomId = searchParams.get('room') || '';
  const requestedCheckIn = searchParams.get('checkIn') || '';
  const requestedCheckOut = searchParams.get('checkOut') || '';
  const requestedType = searchParams.get('type') || '';
  const requestedGuests = Number(searchParams.get('guests') || 0);
  const hasAvailabilityFilters = Boolean(
    requestedCheckIn || requestedCheckOut || requestedGuests || requestedType,
  );
  const returnPath = `/hotels/${id}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

  useEffect(() => {
    let active = true;

    const loadHotelDetails = async () => {
      setLoading(true);
      setError('');

      try {
        const { data } = await api.get(`/hotels/${id}`, {
          params: {
            includeRooms: 'true',
            roomLimit: 100,
            checkIn: requestedCheckIn || undefined,
            checkOut: requestedCheckOut || undefined,
            guests: requestedGuests || undefined,
            type: requestedType || undefined,
          },
        });

        if (!active) {
          return;
        }

        setHotel(data || null);
        setRooms(data.rooms || []);
      } catch (requestError) {
        if (active) {
          setError(getApiErrorMessage(requestError, 'Unable to load this hotel right now.'));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadHotelDetails();

    return () => {
      active = false;
    };
  }, [id, requestedCheckIn, requestedCheckOut, requestedGuests, requestedType]);

  useEffect(() => {
    setBookingState((current) => ({
      ...current,
      roomId: preselectedRoomId || current.roomId,
      checkInDate: requestedCheckIn || current.checkInDate,
      checkOutDate: requestedCheckOut || current.checkOutDate,
      guests: requestedGuests > 0 ? requestedGuests : current.guests,
    }));
  }, [preselectedRoomId, requestedCheckIn, requestedCheckOut, requestedGuests]);

  const selectedRoom = useMemo(
    () => rooms.find((room) => resolveEntityId(room) === bookingState.roomId) || null,
    [bookingState.roomId, rooms],
  );
  const hotelImage = getPrimaryImage(hotel);
  const fallbackRoomImage = getPrimaryImage(selectedRoom);
  const galleryImages = Array.from(
    new Set(
      [hotel, ...rooms]
        .map((item) => getPrimaryImage(item))
        .filter(Boolean),
    ),
  );

  const handleBookingSubmit = async (event) => {
    event.preventDefault();
    setBookingMessage({ type: '', text: '' });

    if (!isAuthenticated) {
      navigate('/login', { state: { from: returnPath } });
      return;
    }

    if (!bookingState.roomId) {
      setBookingMessage({
        type: 'error',
        text: 'Please select a room before sending your booking request.',
      });
      return;
    }

    if (selectedRoom && Number(bookingState.guests) > selectedRoom.capacity) {
      setBookingMessage({
        type: 'error',
        text: `This room allows up to ${selectedRoom.capacity} guests.`,
      });
      return;
    }

    setBookingLoading(true);

    try {
      await api.post('/bookings', {
        roomId: bookingState.roomId,
        checkInDate: bookingState.checkInDate,
        checkOutDate: bookingState.checkOutDate,
        guests: Number(bookingState.guests),
        specialRequests: bookingState.specialRequests,
      });

      setBookingMessage({
        type: 'success',
        text: 'Booking request submitted successfully. You can track it from My Bookings.',
      });
      setBookingState((current) => ({
        ...current,
        specialRequests: '',
      }));
    } catch (requestError) {
      setBookingMessage({
        type: 'error',
        text: getApiErrorMessage(requestError, 'Unable to create this booking.'),
      });
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center px-4 py-20">
        <Loader label="Loading hotel details..." />
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <div className="rounded-[2rem] border border-red-300/25 bg-red-300/10 p-8 text-red-100">
          {error || 'Hotel not found.'}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[2.25rem] border border-white/10 bg-white/5">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative min-h-[320px]">
            {hotelImage || fallbackRoomImage ? (
              <img
                alt={hotel.name}
                className="h-full w-full object-cover"
                src={hotelImage || fallbackRoomImage}
              />
            ) : (
              <div className="flex h-full min-h-[320px] items-end bg-[radial-gradient(circle_at_top,_rgba(200,169,107,0.45),_transparent_36%),linear-gradient(135deg,_#171717,_#060606_70%)] p-8">
                <div>
                  <p className="text-sm uppercase tracking-[0.32em] text-amber-200">Property details</p>
                  <h1 className="mt-3 text-4xl font-['Playfair_Display'] font-bold text-white">{hotel.name}</h1>
                </div>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
          </div>
          <div className="p-6 sm:p-8">
            <p className="text-sm uppercase tracking-[0.32em] text-amber-200">Hotel overview</p>
            <h1 className="mt-3 text-4xl font-['Playfair_Display'] font-bold text-gold">{hotel.name}</h1>
            <p className="mt-3 text-base leading-7 text-slate-300">{hotel.description || 'Thoughtful details for this property will be available soon.'}</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Location</p>
                <p className="mt-2 text-sm text-white">{buildHotelLocation(hotel) || 'Location details coming soon'}</p>
                <p className="mt-1 text-sm text-slate-400">{hotel.address}</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Starting price</p>
                <p className="mt-2 text-2xl font-semibold text-gold">
                  {hotel.startingPrice ? formatCurrency(hotel.startingPrice) : 'Contact us'}
                </p>
                <p className="mt-1 text-sm text-slate-400">{hotel.roomsCount || rooms.length} rooms available in inventory</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Contact</p>
                <p className="mt-2 text-sm text-white">{hotel.contactPhone || 'Phone details will be shared soon'}</p>
                <p className="mt-1 text-sm text-slate-400">{hotel.contactEmail || 'Email details will be shared soon'}</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Rating</p>
                <p className="mt-2 text-2xl font-semibold text-white">{Number(hotel.rating || 0).toFixed(1)}</p>
                <p className="mt-1 text-sm text-slate-400">Guest rating</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-12 grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div className="mb-6">
            <p className="text-sm uppercase tracking-[0.32em] text-amber-200">Available rooms</p>
            <h2 className="mt-3 text-3xl font-['Playfair_Display'] font-bold text-white">Choose your room or suite</h2>
          </div>
          <div className="grid gap-5">
            {rooms.map((room) => {
              const selected = bookingState.roomId === resolveEntityId(room);

              return (
                <article className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5" key={resolveEntityId(room)}>
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-2xl font-semibold text-white">
                          Room {room.roomNumber} - {room.type}
                        </h3>
                        <span className="rounded-full bg-emerald-300/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100">
                          {room.isAvailable ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                      <p className="mt-3 text-sm text-slate-300">
                        Capacity {room.capacity} - {formatCurrency(room.pricePerNight)} per night
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {(room.amenities || []).map((amenity) => (
                          <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300" key={amenity}>
                            {amenity}
                          </span>
                        ))}
                        {!room.amenities?.length && (
                          <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-400">
                            Amenities will be listed soon
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                        selected
                          ? 'bg-gold text-black'
                          : 'border border-gold/[0.35] text-gold hover:bg-gold/10'
                      }`}
                      onClick={() => setBookingState((current) => ({
                        ...current,
                        roomId: resolveEntityId(room),
                        guests: Math.min(Number(current.guests) || 1, room.capacity),
                      }))}
                      type="button"
                    >
                      {selected ? 'Selected' : 'Select room'}
                    </button>
                  </div>
                </article>
              );
            })}

            {!rooms.length && (
              <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-8 text-slate-300">
                {hasAvailabilityFilters
                  ? 'No rooms match the selected dates or guest count. Try another search.'
                  : 'Rooms for this property will appear here as soon as they are available.'}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <form className="rounded-[2rem] border border-white/10 bg-white/5 p-6" onSubmit={handleBookingSubmit}>
            <p className="text-sm uppercase tracking-[0.32em] text-amber-200">Reserve now</p>
            <h2 className="mt-3 text-3xl font-['Playfair_Display'] font-bold text-white">Book this hotel</h2>
            <div className="mt-6 space-y-4">
              <label className="space-y-2 text-sm text-slate-200">
                <span>Selected room</span>
                <select
                  className="w-full rounded-xl border border-white/[0.15] bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-gold/50"
                  onChange={(event) => setBookingState((current) => ({ ...current, roomId: event.target.value }))}
                  required
                  value={bookingState.roomId}
                >
                  <option value="">Choose a room</option>
                  {rooms.map((room) => (
                    <option key={resolveEntityId(room)} value={resolveEntityId(room)}>
                      Room {room.roomNumber} - {room.type} - {formatCurrency(room.pricePerNight)}
                    </option>
                  ))}
                </select>
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-200">
                  <span>Check-in</span>
                  <input
                    className="w-full rounded-xl border border-white/[0.15] bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-gold/50"
                    onChange={(event) => setBookingState((current) => ({ ...current, checkInDate: event.target.value }))}
                    required
                    type="date"
                    value={bookingState.checkInDate}
                  />
                </label>
                <label className="space-y-2 text-sm text-slate-200">
                  <span>Check-out</span>
                  <input
                    className="w-full rounded-xl border border-white/[0.15] bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-gold/50"
                    onChange={(event) => setBookingState((current) => ({ ...current, checkOutDate: event.target.value }))}
                    required
                    type="date"
                    value={bookingState.checkOutDate}
                  />
                </label>
              </div>
              <label className="space-y-2 text-sm text-slate-200">
                <span>Guests</span>
                <input
                  className="w-full rounded-xl border border-white/[0.15] bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-gold/50"
                  max={selectedRoom?.capacity || undefined}
                  min="1"
                  onChange={(event) => setBookingState((current) => ({ ...current, guests: Number(event.target.value) || 1 }))}
                  type="number"
                  value={bookingState.guests}
                />
              </label>
              <label className="space-y-2 text-sm text-slate-200">
                <span>Special requests</span>
                <textarea
                  className="min-h-28 w-full rounded-xl border border-white/[0.15] bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-gold/50"
                  onChange={(event) => setBookingState((current) => ({ ...current, specialRequests: event.target.value }))}
                  placeholder="Airport pickup, late check-in, extra pillows..."
                  value={bookingState.specialRequests}
                />
              </label>
            </div>
            <button
              className="mt-6 w-full rounded-full bg-gold py-3 font-semibold text-black transition hover:bg-gold/90 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={bookingLoading || !rooms.length}
              type="submit"
            >
              {bookingLoading ? 'Sending request...' : 'Send booking request'}
            </button>
            {bookingMessage.text && (
              <div className={`mt-4 rounded-2xl px-4 py-3 text-sm ${
                bookingMessage.type === 'success'
                  ? 'border border-emerald-300/20 bg-emerald-300/10 text-emerald-100'
                  : 'border border-red-300/25 bg-red-300/10 text-red-100'
              }`}>
                {bookingMessage.text}
              </div>
            )}
          </form>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <p className="text-sm uppercase tracking-[0.32em] text-amber-200">Gallery</p>
            <h2 className="mt-3 text-2xl font-['Playfair_Display'] font-bold text-white">Property visuals</h2>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {galleryImages.slice(0, 4).map((image, index) => (
                <div className="overflow-hidden rounded-[1.2rem]" key={`${image}-${index}`}>
                  <img alt={`Property visual ${index + 1}`} className="h-36 w-full object-cover" src={image} />
                </div>
              ))}
            </div>
            {!galleryImages.length && (
              <p className="mt-4 text-sm text-slate-400">
                Property images will appear here as soon as they are published.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
