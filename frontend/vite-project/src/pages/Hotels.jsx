import { useEffect, useState } from 'react';
import api, { getApiErrorMessage } from '../../services/api.js';
import HotelCard from '../components/HotelCard.jsx';
import Loader from '../components/Loader.jsx';

const initialFilters = {
  city: '',
  state: '',
  minRating: '',
};

export default function Hotels() {
  const [filters, setFilters] = useState(initialFilters);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });

  useEffect(() => {
    let ignore = false;

    const loadInitialHotels = async () => {
      try {
        const { data } = await api.get('/hotels', {
          params: {
            page: 1,
            limit: 6,
            ...initialFilters,
          },
        });

        if (ignore) {
          return;
        }

        setHotels(data.hotels || []);
        setPagination({
          totalPages: Number(data.totalPages || 1),
          total: Number(data.total || 0),
        });
        setPage(Number(data.currentPage || 1));
      } catch (loadError) {
        if (!ignore) {
          setError(getApiErrorMessage(loadError, 'Unable to load hotels.'));
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadInitialHotels();

    return () => {
      ignore = true;
    };
  }, []);

  const loadHotels = async (nextPage = page) => {
    setLoading(true);
    setError('');

    try {
      const { data } = await api.get('/hotels', {
        params: {
          page: nextPage,
          limit: 6,
          ...filters,
        },
      });

      setHotels(data.hotels || []);
      setPagination({
        totalPages: Number(data.totalPages || 1),
        total: Number(data.total || 0),
      });
      setPage(Number(data.currentPage || nextPage));
    } catch (loadError) {
      setError(getApiErrorMessage(loadError, 'Unable to load hotels.'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await loadHotels(1);
  };

  return (
    <section className="mx-auto w-full max-w-7xl space-y-8 px-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-teal-200">Hotel discovery</p>
          <h1 className="mt-2 text-4xl font-semibold text-white" style={{ fontFamily: 'Sora, sans-serif' }}>
            Find the right stay for your trip
          </h1>
        </div>
        <p className="text-sm text-slate-300">
          Showing {pagination.total} result{pagination.total === 1 ? '' : 's'}
        </p>
      </div>

      <form
        className="grid gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur lg:grid-cols-[1.4fr_1.4fr_0.8fr_auto]"
        onSubmit={handleSubmit}
      >
        <label className="space-y-2 text-sm text-slate-200">
          <span>City</span>
          <input
            className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none transition focus:border-teal-300/60"
            name="city"
            onChange={(event) => setFilters((current) => ({ ...current, city: event.target.value }))}
            placeholder="Jaipur"
            value={filters.city}
          />
        </label>

        <label className="space-y-2 text-sm text-slate-200">
          <span>State</span>
          <input
            className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none transition focus:border-teal-300/60"
            name="state"
            onChange={(event) => setFilters((current) => ({ ...current, state: event.target.value }))}
            placeholder="Rajasthan"
            value={filters.state}
          />
        </label>

        <label className="space-y-2 text-sm text-slate-200">
          <span>Minimum rating</span>
          <select
            className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none transition focus:border-teal-300/60"
            name="minRating"
            onChange={(event) => setFilters((current) => ({ ...current, minRating: event.target.value }))}
            value={filters.minRating}
          >
            <option value="">Any</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
            <option value="4.5">4.5+</option>
          </select>
        </label>

        <button
          className="rounded-2xl bg-teal-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-teal-200"
          type="submit"
        >
          Search
        </button>
      </form>

      {loading ? (
        <div className="flex min-h-[280px] items-center justify-center rounded-[2rem] border border-white/10 bg-white/5">
          <Loader label="Loading hotels..." />
        </div>
      ) : error ? (
        <div className="rounded-[2rem] border border-red-300/20 bg-red-300/10 p-6 text-sm text-red-100">
          {error}
        </div>
      ) : hotels.length === 0 ? (
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center text-slate-300">
          No hotels matched these filters. Try a broader city or lower minimum rating.
        </div>
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {hotels.map((hotel) => (
              <HotelCard hotel={hotel} key={hotel._id} />
            ))}
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              className="rounded-full border border-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={page <= 1}
              onClick={() => loadHotels(page - 1)}
              type="button"
            >
              Previous
            </button>
            <span className="rounded-full bg-white/5 px-4 py-2 text-sm text-slate-200">
              Page {page} of {pagination.totalPages}
            </span>
            <button
              className="rounded-full border border-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={page >= pagination.totalPages}
              onClick={() => loadHotels(page + 1)}
              type="button"
            >
              Next
            </button>
          </div>
        </>
      )}
    </section>
  );
}
