import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api.js';

export default function Footer() {
  const [featuredHotel, setFeaturedHotel] = useState(null);

  useEffect(() => {
    let active = true;

    const loadHotel = async () => {
      try {
        const { data } = await api.get('/hotels', { params: { limit: 1 } });
        if (active) {
          setFeaturedHotel(data.hotels?.[0] || null);
        }
      } catch {
        if (active) {
          setFeaturedHotel(null);
        }
      }
    };

    loadHotel();

    return () => {
      active = false;
    };
  }, []);

  return (
    <footer className="border-t border-white/10 bg-black/50 px-4 py-12">
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-4">
        <div>
          <h3 className="text-2xl font-['Playfair_Display'] font-bold text-gold">EliteHaven</h3>
          <p className="mt-2 text-sm text-white/50">
            Refined stays, seamless reservations, and a polished booking experience across every screen.
          </p>
        </div>
        <div>
          <h4 className="mb-3 font-semibold text-white/80">Quick Links</h4>
          <ul className="space-y-2 text-sm text-white/50">
            <li><a className="hover:text-gold" href="/#home">Home</a></li>
            <li><Link className="hover:text-gold" to="/hotels">Hotels</Link></li>
            <li><a className="hover:text-gold" href="/#amenities">Amenities</a></li>
            <li><Link className="hover:text-gold" to="/bookings">My Bookings</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-semibold text-white/80">Contact</h4>
          {featuredHotel ? (
            <>
              <p className="text-sm text-white/50">{featuredHotel.address}</p>
              <p className="text-sm text-white/50">{featuredHotel.city}, {featuredHotel.state}</p>
              <p className="text-sm text-white/50">{featuredHotel.contactPhone || 'Phone unavailable'}</p>
              <p className="text-sm text-white/50">{featuredHotel.contactEmail || 'Email unavailable'}</p>
            </>
          ) : (
            <p className="text-sm text-white/50">Hotel contact details will appear here as soon as they are published.</p>
          )}
        </div>
        <div>
          <h4 className="mb-3 font-semibold text-white/80">Follow Us</h4>
          <div className="flex gap-4 text-xl text-gold">
            <i className="fab fa-instagram cursor-pointer transition hover:scale-110"></i>
            <i className="fab fa-facebook cursor-pointer transition hover:scale-110"></i>
            <i className="fab fa-twitter cursor-pointer transition hover:scale-110"></i>
          </div>
        </div>
      </div>
      <div className="mt-10 text-center text-xs text-white/30">
        Copyright 2026 EliteHaven. All rights reserved.
      </div>
    </footer>
  );
}
