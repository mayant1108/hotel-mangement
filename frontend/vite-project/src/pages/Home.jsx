import { startTransition, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getApiErrorMessage } from '../../services/api.js';
import HotelCard from '../components/HotelCard.jsx';
import Loader from '../components/Loader.jsx';
import {
  buildHotelLocation,
  formatCurrency,
  getPrimaryImage,
  resolveEntityId,
} from '../utils/hotel.js';

const amenityIconMap = [
  { keyword: 'pool', icon: 'fas fa-swimming-pool' },
  { keyword: 'spa', icon: 'fas fa-spa' },
  { keyword: 'wifi', icon: 'fas fa-wifi' },
  { keyword: 'gym', icon: 'fas fa-dumbbell' },
  { keyword: 'fitness', icon: 'fas fa-dumbbell' },
  { keyword: 'dining', icon: 'fas fa-utensils' },
  { keyword: 'restaurant', icon: 'fas fa-utensils' },
  { keyword: 'parking', icon: 'fas fa-car' },
  { keyword: 'bar', icon: 'fas fa-glass-martini-alt' },
];

const defaultCatalog = {
  featuredHotel: null,
  featuredHotels: [],
  hotelOptions: [],
  roomTypes: [],
  uniqueAmenities: [],
  galleryImages: [],
  stats: {
    hotelsCount: 0,
    roomsCount: 0,
    citiesCount: 0,
    lowestStartingPrice: 0,
  },
};

const defaultSearchForm = {
  hotelId: '',
  checkIn: '',
  checkOut: '',
  guests: 2,
  type: '',
};

const getAmenityIcon = (amenity) => (
  amenityIconMap.find(({ keyword }) => amenity.toLowerCase().includes(keyword))?.icon || 'fas fa-concierge-bell'
);

export default function Home() {
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [catalog, setCatalog] = useState(defaultCatalog);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState('');
  const [availabilityResults, setAvailabilityResults] = useState([]);
  const [searchForm, setSearchForm] = useState(defaultSearchForm);

  useEffect(() => {
    let active = true;

    const loadPageData = async () => {
      setPageLoading(true);
      setPageError('');

      try {
        const { data } = await api.get('/hotels/catalog', {
          params: {
            hotelLimit: 6,
            featuredLimit: 3,
          },
        });

        if (!active) {
          return;
        }

        startTransition(() => {
          setCatalog({
            featuredHotel: data.featuredHotel || null,
            featuredHotels: data.featuredHotels || [],
            hotelOptions: data.hotelOptions || [],
            roomTypes: data.roomTypes || [],
            uniqueAmenities: data.uniqueAmenities || [],
            galleryImages: data.galleryImages || [],
            stats: {
              hotelsCount: data.stats?.hotelsCount || 0,
              roomsCount: data.stats?.roomsCount || 0,
              citiesCount: data.stats?.citiesCount || 0,
              lowestStartingPrice: data.stats?.lowestStartingPrice || 0,
            },
          });
        });
      } catch (requestError) {
        if (active) {
          setPageError(getApiErrorMessage(requestError, 'Unable to load hotel data right now.'));
        }
      } finally {
        if (active) {
          setPageLoading(false);
        }
      }
    };

    loadPageData();

    return () => {
      active = false;
    };
  }, []);

  const {
    featuredHotel,
    featuredHotels,
    galleryImages,
    hotelOptions,
    roomTypes,
    stats,
    uniqueAmenities,
  } = catalog;
  const heroImage = getPrimaryImage(featuredHotel);
  const statsCards = [
    { label: 'Hotels', value: stats.hotelsCount || 0 },
    { label: 'Rooms', value: stats.roomsCount || 0 },
    { label: 'Cities', value: stats.citiesCount || 0 },
    {
      label: 'Rates from',
      value: stats.lowestStartingPrice ? formatCurrency(stats.lowestStartingPrice) : 'On request',
    },
  ];

  const handleAvailabilitySearch = async (event) => {
    event.preventDefault();
    setAvailabilityLoading(true);
    setAvailabilityError('');

    try {
      const { data } = await api.get('/rooms', {
        params: {
          hotelId: searchForm.hotelId || undefined,
          checkIn: searchForm.checkIn,
          checkOut: searchForm.checkOut,
          guests: searchForm.guests,
          type: searchForm.type || undefined,
          limit: 6,
        },
      });
      setAvailabilityResults(data.rooms || []);
    } catch (requestError) {
      setAvailabilityError(getApiErrorMessage(requestError, 'Unable to check room availability.'));
      setAvailabilityResults([]);
    } finally {
      setAvailabilityLoading(false);
    }
  };

  const buildAvailabilityLink = (room) => {
    const hotelId = resolveEntityId(room.hotelId);
    const params = new URLSearchParams({
      room: resolveEntityId(room),
      checkIn: searchForm.checkIn,
      checkOut: searchForm.checkOut,
      guests: String(searchForm.guests),
      ...(searchForm.type ? { type: searchForm.type } : {}),
    });

    return `/hotels/${hotelId}?${params.toString()}`;
  };

  return (
    <div className="bg-black">
      <section className="relative overflow-hidden px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <div className="absolute inset-0">
          {heroImage ? (
            <img alt={featuredHotel?.name || 'Hotel collection'} className="h-full w-full object-cover opacity-30" src={heroImage} />
          ) : (
            <div className="h-full w-full bg-[radial-gradient(circle_at_top,_rgba(200,169,107,0.28),_transparent_32%),linear-gradient(135deg,_#101010,_#020202_55%,_#1f1a12)]" />
          )}
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,_rgba(0,0,0,0.42),_rgba(0,0,0,0.82))]" />
        <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end lg:gap-16">
          <div className="pt-16 sm:pt-24">
            <p className="section-kicker">Discover your next stay</p>
            <h1 className="mt-4 max-w-4xl text-4xl font-extrabold leading-[1.05] text-white sm:text-5xl lg:text-7xl section-heading">
              {featuredHotel ? `Stay at ${featuredHotel.name}` : 'Luxury stays with live availability'}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-200/90 sm:text-lg">
              {featuredHotel?.description
                || 'Discover premium hotels, real-time room availability, and a seamless reservation experience.'}
            </p>
            {featuredHotel && (
              <p className="mt-4 text-sm uppercase tracking-[0.28em] text-slate-300">
                {buildHotelLocation(featuredHotel)}
              </p>
            )}
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link className="inline-flex items-center justify-center rounded-full bg-gold px-7 py-3 font-semibold text-black transition hover:bg-gold/90" to="/hotels">
                Explore Hotels
              </Link>
              <a className="inline-flex items-center justify-center rounded-full border border-white/20 px-7 py-3 font-semibold text-white transition hover:bg-white/5" href="#availability">
                Check availability
              </a>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {statsCards.map((stat) => (
                <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-4 backdrop-blur" key={stat.label}>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{stat.label}</p>
                  <p className="mt-3 text-2xl font-semibold text-white">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          <form
            className="rounded-[2rem] border border-white/10 bg-black/[0.45] p-5 shadow-2xl shadow-black/20 backdrop-blur sm:p-6"
            id="availability"
            onSubmit={handleAvailabilitySearch}
          >
            <p className="text-sm uppercase tracking-[0.32em] text-amber-200">Availability</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">Search live room inventory</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-200 sm:col-span-2">
                <span>Hotel</span>
                <select
                  className="w-full rounded-xl border border-white/[0.15] bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-gold/50"
                  onChange={(event) => setSearchForm((current) => ({ ...current, hotelId: event.target.value }))}
                  value={searchForm.hotelId}
                >
                  <option value="">All hotels</option>
                  {hotelOptions.map((hotel) => (
                    <option key={hotel._id} value={hotel._id}>{hotel.name}</option>
                  ))}
                </select>
              </label>
              <label className="space-y-2 text-sm text-slate-200">
                <span>Check-in</span>
                <input
                  className="w-full rounded-xl border border-white/[0.15] bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-gold/50"
                  onChange={(event) => setSearchForm((current) => ({ ...current, checkIn: event.target.value }))}
                  required
                  type="date"
                  value={searchForm.checkIn}
                />
              </label>
              <label className="space-y-2 text-sm text-slate-200">
                <span>Check-out</span>
                <input
                  className="w-full rounded-xl border border-white/[0.15] bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-gold/50"
                  onChange={(event) => setSearchForm((current) => ({ ...current, checkOut: event.target.value }))}
                  required
                  type="date"
                  value={searchForm.checkOut}
                />
              </label>
              <label className="space-y-2 text-sm text-slate-200">
                <span>Guests</span>
                <input
                  className="w-full rounded-xl border border-white/[0.15] bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-gold/50"
                  min="1"
                  onChange={(event) => setSearchForm((current) => ({ ...current, guests: Number(event.target.value) || 1 }))}
                  type="number"
                  value={searchForm.guests}
                />
              </label>
              <label className="space-y-2 text-sm text-slate-200">
                <span>Room type</span>
                <select
                  className="w-full rounded-xl border border-white/[0.15] bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-gold/50"
                  onChange={(event) => setSearchForm((current) => ({ ...current, type: event.target.value }))}
                  value={searchForm.type}
                >
                  <option value="">Any type</option>
                  {roomTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </label>
            </div>
            <button
              className="mt-6 w-full rounded-full bg-gold py-3 font-semibold text-black transition hover:bg-gold/90 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={availabilityLoading || pageLoading}
              type="submit"
            >
              {availabilityLoading ? 'Checking availability...' : 'Search rooms'}
            </button>
            {availabilityError && (
              <div className="mt-4 rounded-2xl border border-red-300/25 bg-red-300/10 px-4 py-3 text-sm text-red-100">
                {availabilityError}
              </div>
            )}
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="section-kicker">Featured stays</p>
            <h2 className="mt-3 text-3xl font-['Playfair_Display'] font-bold text-white sm:text-5xl section-heading">Curated hotels and suites</h2>
          </div>

          <Link className="text-sm font-semibold uppercase tracking-[0.24em] text-gold" to="/hotels">
            View all hotels
          </Link>
        </div>

        {pageLoading ? (
          <div className="flex justify-center py-20">
            <Loader label="Loading featured stays..." />
          </div>
        ) : pageError ? (
          <div className="rounded-[1.75rem] border border-red-300/25 bg-red-300/10 p-6 text-red-100">{pageError}</div>
        ) : featuredHotels.length ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {featuredHotels.map((hotel) => <HotelCard hotel={hotel} key={resolveEntityId(hotel)} />)}
          </div>
        ) : (
          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-8 text-center text-slate-300">
            <p className="mx-auto max-w-2xl text-sm leading-7">
              Our featured collection is being updated. Please check back soon for newly listed stays.
            </p>
            <div className="mt-6 grid gap-5 md:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5"
                >
                  <div className="h-24 rounded-[1.2rem] bg-white/5" />
                  <div className="mt-4 h-4 w-4/5 rounded bg-white/10" />
                  <div className="mt-2 h-3 w-2/3 rounded bg-white/10" />
                  <div className="mt-4 h-10 rounded-full bg-white/5" />
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="bg-white/5 py-16" id="amenities">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm uppercase tracking-[0.34em] text-amber-200">Amenities</p>
            <h2 className="mt-3 text-3xl font-['Playfair_Display'] font-bold text-white sm:text-5xl">Signature amenities</h2>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
            {uniqueAmenities.map((amenity) => (
              <div className="rounded-[1.5rem] border border-white/10 bg-black/30 p-5 text-center" key={amenity}>
                <i className={`${getAmenityIcon(amenity)} text-3xl text-gold`}></i>
                <p className="mt-4 text-sm uppercase tracking-[0.2em] text-slate-200">{amenity}</p>
              </div>
            ))}
          </div>
          {!uniqueAmenities.length && (
            <p className="mt-8 text-center text-sm text-slate-400">
              Amenities will appear here as properties are updated.
            </p>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8" id="gallery">
        <div className="mb-12 text-center">
          <p className="text-sm uppercase tracking-[0.34em] text-amber-200">Gallery</p>
          <h2 className="mt-3 text-3xl font-['Playfair_Display'] font-bold text-white sm:text-5xl">Property gallery</h2>
        </div>
        {galleryImages.length ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {galleryImages.map((image, index) => (
              <div className="overflow-hidden rounded-[1.5rem]" key={`${image}-${index}`}>
                <img alt={`Hotel gallery ${index + 1}`} className="h-72 w-full object-cover transition duration-500 hover:scale-105" src={image} />
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-8 text-center text-slate-300">
            <p className="text-sm leading-7">
              Property imagery will appear here as soon as it is published.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="overflow-hidden rounded-[1.5rem]">
                  <div className="h-72 w-full bg-white/5" />
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="bg-white/5 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-[2rem] border border-white/10 bg-black/30 p-6">
              <p className="text-sm uppercase tracking-[0.34em] text-amber-200">Snapshot</p>
              <h2 className="mt-3 text-3xl font-['Playfair_Display'] font-bold text-white">Property highlights</h2>
              <div className="mt-8 space-y-4">
                {featuredHotels.length ? featuredHotels.map((hotel) => (
                  <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4" key={resolveEntityId(hotel)}>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{hotel.name}</h3>
                        <p className="mt-1 text-sm text-slate-400">{buildHotelLocation(hotel)}</p>
                      </div>
                      <p className="text-sm font-semibold text-gold">
                        {hotel.startingPrice ? formatCurrency(hotel.startingPrice) : 'Price pending'}
                      </p>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-300">{hotel.description || 'More details for this stay will be available soon.'}</p>
                  </div>
                )) : (
                  <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                    Highlights will appear here once featured properties are available.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-black/30 p-6">
              <p className="text-sm uppercase tracking-[0.34em] text-amber-200">Availability results</p>
              <h2 className="mt-3 text-3xl font-['Playfair_Display'] font-bold text-white">Rooms matching your search</h2>
              <div className="mt-8 grid gap-4">
                {availabilityLoading && <Loader label="Checking rooms..." />}
                {!availabilityLoading && availabilityResults.map((room) => (
                  <article className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5" key={resolveEntityId(room)}>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-white">
                          Room {room.roomNumber} - {room.type}
                        </h3>
                        <p className="mt-2 text-sm text-slate-300">
                          {room.hotelId?.name || 'Hotel'} - {room.hotelId?.city || 'City details coming soon'} - Capacity {room.capacity}
                        </p>
                        <p className="mt-2 text-sm text-slate-400">
                          {(room.amenities || []).slice(0, 4).join(', ') || 'Amenities will be shared soon'}
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-2xl font-bold text-gold">{formatCurrency(room.pricePerNight)}</p>
                        <Link
                          className="mt-3 inline-flex items-center justify-center rounded-full border border-gold/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold transition hover:bg-gold/10"
                          to={buildAvailabilityLink(room)}
                        >
                          Continue booking
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
                {!availabilityLoading && !availabilityResults.length && (
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-6 text-sm text-slate-300">
                    Search by dates above to view available rooms.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
