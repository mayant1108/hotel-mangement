import { Link } from 'react-router-dom';
import {
  buildHotelLocation,
  formatCurrency,
  getPrimaryImage,
  resolveEntityId,
} from '../utils/hotel.js';

export default function HotelCard({ hotel }) {
  const image = getPrimaryImage(hotel);
  const rating = Number(hotel?.rating || 0);
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;
  const hotelId = resolveEntityId(hotel);
  const location = buildHotelLocation(hotel) || 'Location updating soon';
  const price = hotel?.startingPrice ? formatCurrency(hotel.startingPrice) : 'Contact for pricing';

  return (
    <article className="group overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5 transition-all duration-300 hover:-translate-y-1 hover:border-gold/25 hover:shadow-2xl hover:shadow-black/15">
      <div className="relative h-56 overflow-hidden sm:h-64">

        {image ? (
          <img
            alt={hotel.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            src={image}
          />
        ) : (
          <div className="flex h-full w-full flex-col justify-end bg-[radial-gradient(circle_at_top,_rgba(200,169,107,0.5),_transparent_45%),linear-gradient(135deg,_#171717,_#090909)] p-6">
            <p className="text-xs uppercase tracking-[0.35em] text-amber-200/80">Elite collection</p>
            <h3 className="mt-3 text-2xl font-semibold text-white">{hotel.name}</h3>
            <p className="mt-2 text-sm text-slate-300">{location}</p>
          </div>
        )}
        <div className="absolute right-3 top-3 rounded-full bg-black/50 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
          <i className="fas fa-star mr-1 text-gold"></i>
          {rating ? rating.toFixed(1) : 'New'}
        </div>
        <div className="absolute left-3 top-3 rounded-full border border-white/10 bg-black/[0.40] px-3 py-1 text-xs uppercase tracking-[0.25em] text-white/70 backdrop-blur">
          {hotel.roomsCount || 0} rooms
        </div>

      </div>
      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-xl font-bold text-white">{hotel.name}</h3>
            <p className="mt-1 text-sm text-slate-400">
              <i className="fas fa-map-pin mr-1 text-gold"></i>
              {location}
            </p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-2xl font-bold text-gold">{price}</p>
            <p className="text-xs text-slate-500">starting per night</p>
          </div>
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          {hotel.description || 'Comfort-focused rooms, thoughtful amenities, and a stay designed around convenience.'}
        </p>
        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-0.5">
            {[...Array(fullStars)].map((_, i) => <i key={i} className="fas fa-star text-gold text-xs"></i>)}
            {hasHalf && <i className="fas fa-star-half-alt text-gold text-xs"></i>}
          </div>
          <Link
            className="inline-flex items-center justify-center rounded-full border border-gold/30 bg-gold/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold transition hover:bg-gold/20"
            to={`/hotels/${hotelId}`}
          >
            View Details
          </Link>
        </div>
      </div>
    </article>
  );
}
