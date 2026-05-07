import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api, { getApiErrorMessage } from '../../services/api.js';
import HotelCard from '../components/HotelCard.jsx';
import Loader from '../components/Loader.jsx';

export default function Home() {
  const [featuredHotels, setFeaturedHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadFeaturedHotels = async () => {
      try {
        const { data } = await api.get('/hotels', { params: { limit: 3 } });
        setFeaturedHotels(data.hotels || []);
      } catch (loadError) {
        setError(getApiErrorMessage(loadError, 'Unable to load featured hotels right now.'));
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedHotels();
  }, []);

  return (
    <div className="space-y-20">
      <section className="mx-auto grid w-full max-w-7xl gap-10 px-4 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-8">
          <div className="inline-flex rounded-full border border-teal-300/20 bg-teal-300/10 px-4 py-2 text-xs uppercase tracking-[0.35em] text-teal-200">
            Hotel booking made cleaner
          </div>
          <div className="space-y-5">
            <h1 className="max-w-3xl text-5xl font-semibold leading-tight text-white md:text-6xl" style={{ fontFamily: 'Sora, sans-serif' }}>
              Discover trusted stays and book your next room in a few clicks.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-300">
              Explore curated hotels, compare room types, and manage bookings from one streamlined app for guests and admins.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link
              className="rounded-full bg-teal-300 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-teal-200"
              to="/hotels"
            >
              Browse hotels
            </Link>
            <Link
              className="rounded-full border border-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/5"
              to="/register"
            >
              Create account
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ['Guest login', 'Personal booking history with live status'],
              ['Hotel discovery', 'Search by city, rating, and room availability'],
              ['Admin ready', 'Dedicated dashboard powered by the same backend'],
            ].map(([title, description]) => (
              <div key={title} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 backdrop-blur">
                <h2 className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-white">{title}</h2>
                <p className="text-sm leading-6 text-slate-300">{description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2.25rem] border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur">
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { label: 'Flexible stays', value: '100+' },
              { label: 'Booking flow', value: 'Live API' },
              { label: 'Room filters', value: 'Smart' },
              { label: 'User session', value: 'Secure' },
            ].map((item) => (
              <div key={item.label} className="rounded-[1.5rem] border border-white/10 bg-slate-950/40 p-5">
                <p className="text-sm uppercase tracking-[0.28em] text-slate-400">{item.label}</p>
                <p className="mt-3 text-3xl font-semibold text-white" style={{ fontFamily: 'Sora, sans-serif' }}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-[1.75rem] border border-amber-200/20 bg-amber-200/10 p-5 text-amber-50">
            <p className="text-xs uppercase tracking-[0.3em] text-amber-100/80">Quick note</p>
            <p className="mt-3 text-sm leading-7">
              If you create the very first account from the admin dashboard and choose the admin role, it bootstraps the platform for hotel management.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-teal-200">Featured hotels</p>
            <h2 className="mt-2 text-3xl font-semibold text-white" style={{ fontFamily: 'Sora, sans-serif' }}>
              Places guests can start with
            </h2>
          </div>
          <Link className="text-sm font-semibold text-teal-200 transition hover:text-white" to="/hotels">
            View all hotels
          </Link>
        </div>

        {loading ? (
          <div className="flex min-h-[240px] items-center justify-center rounded-[2rem] border border-white/10 bg-white/5">
            <Loader label="Loading featured hotels..." />
          </div>
        ) : error ? (
          <div className="rounded-[2rem] border border-red-300/20 bg-red-300/10 p-6 text-sm text-red-100">
            {error}
          </div>
        ) : featuredHotels.length === 0 ? (
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center text-slate-300">
            No hotels are available yet. Add some from the admin panel and they will appear here.
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {featuredHotels.map((hotel) => (
              <HotelCard hotel={hotel} key={hotel._id} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
