import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import api, { getApiErrorMessage } from '../../services/api.js';
import HotelCard from '../components/HotelCard.jsx';
import Loader from '../components/Loader.jsx';
import { resolveEntityId } from '../utils/hotel.js';

export default function Hotels() {
  const [loading, setLoading] = useState(true);
  const [hotels, setHotels] = useState([]);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search.trim().toLowerCase());

  useEffect(() => {
    let active = true;

    const loadHotels = async () => {
      setLoading(true);
      setError('');

      try {
        const { data } = await api.get('/hotels', { params: { limit: 100 } });
        if (active) {
          setHotels(data.hotels || []);
        }
      } catch (requestError) {
        if (active) {
          setError(getApiErrorMessage(requestError, 'Unable to load hotel inventory.'));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadHotels();

    return () => {
      active = false;
    };
  }, []);

  const filteredHotels = useMemo(() => {
    if (!deferredSearch) {
      return hotels;
    }

    return hotels.filter((hotel) => {
      const haystack = [hotel.name, hotel.city, hotel.state, ...(hotel.amenities || [])]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(deferredSearch);
    });
  }, [deferredSearch, hotels]);

  if (loading) {
    return <div className="flex justify-center px-4 py-20"><Loader label="Loading hotels..." /></div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.34em] text-amber-200">Collection</p>
          <h1 className="mt-3 text-4xl font-['Playfair_Display'] font-bold text-white sm:text-5xl">All Hotels & Suites</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
            Every card below is populated from backend hotel data, including price, rating, amenities, and location.
          </p>
        </div>
        <label className="w-full max-w-md space-y-2 text-sm text-slate-200">
          <span>Search hotels, cities, or amenities</span>
          <input
            className="w-full rounded-xl border border-white/[0.15] bg-black/[0.45] px-4 py-3 text-white outline-none transition focus:border-gold/50"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Try Mumbai, spa, pool..."
            type="text"
            value={search}
          />
        </label>
      </div>

      {error && (
        <div className="mb-6 rounded-[1.75rem] border border-red-300/25 bg-red-300/10 p-5 text-red-100">
          {error}
        </div>
      )}

      <div className="mb-6 text-sm text-slate-400">
        Showing {filteredHotels.length} of {hotels.length} hotels
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredHotels.map((hotel) => <HotelCard hotel={hotel} key={resolveEntityId(hotel)} />)}
      </div>

      {!filteredHotels.length && (
        <div className="mt-8 rounded-[1.75rem] border border-white/10 bg-white/5 p-8 text-center text-slate-300">
          No hotels matched your search. Try another city or amenity.
        </div>
      )}
    </div>
  );
}
