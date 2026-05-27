import { useDeferredValue, useEffect, useRef, useState } from 'react';
import api, { getApiErrorMessage } from '../../services/api.js';
import HotelCard from '../components/HotelCard.jsx';
import Loader from '../components/Loader.jsx';
import { resolveEntityId } from '../utils/hotel.js';

export default function Hotels() {
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [hotels, setHotels] = useState([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const hasLoadedRef = useRef(false);
  const deferredSearch = useDeferredValue(search.trim());

  useEffect(() => {
    let active = true;

    const loadHotels = async () => {
      if (hasLoadedRef.current) {
        setSearching(true);
      } else {
        setLoading(true);
      }

      setError('');

      try {
        const { data } = await api.get('/hotels', {
          params: {
            limit: 100,
            search: deferredSearch || undefined,
          },
        });

        if (active) {
          setHotels(data.hotels || []);
          setTotal(data.total || 0);
        }
      } catch (requestError) {
        if (active) {
          setError(getApiErrorMessage(requestError, 'Unable to load hotel inventory.'));
        }
      } finally {
        if (active) {
          hasLoadedRef.current = true;
          setLoading(false);
          setSearching(false);
        }
      }
    };

    loadHotels();

    return () => {
      active = false;
    };
  }, [deferredSearch]);

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
            Browse our full collection with live pricing, amenities, ratings, and location details.
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

      <div className="mb-6 flex flex-col gap-2 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
        <span>{deferredSearch ? `Found ${total} matching stays` : `Showing ${total} hotels`}</span>
        {searching && <span>Refreshing results...</span>}
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {hotels.map((hotel) => <HotelCard hotel={hotel} key={resolveEntityId(hotel)} />)}
      </div>

      {!hotels.length && (
        <div className="mt-8 rounded-[1.75rem] border border-white/10 bg-white/5 p-8 text-center text-slate-300">
          No stays matched your search. Try another city, hotel name, or amenity.
        </div>
      )}
    </div>
  );
}
