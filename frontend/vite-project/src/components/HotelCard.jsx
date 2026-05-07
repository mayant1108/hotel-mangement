import { Link } from 'react-router-dom';
import {
  formatCurrency,
  getHotelImage,
  shorten,
} from '../../utils/helpers.js';

export default function HotelCard({ hotel }) {
  return (
    <article className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-xl shadow-black/20 backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-teal-300/30">
      <div className="relative h-56 overflow-hidden">
        <img
          alt={hotel.name}
          className="h-full w-full object-cover"
          src={getHotelImage(hotel)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/10 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-teal-200">{hotel.city}, {hotel.state}</p>
            <h3 className="text-2xl font-semibold text-white" style={{ fontFamily: 'Sora, sans-serif' }}>
              {hotel.name}
            </h3>
          </div>
          <span className="rounded-full border border-amber-300/30 bg-amber-300/15 px-3 py-1 text-sm font-semibold text-amber-100">
            {hotel.rating?.toFixed?.(1) || '0.0'} / 5
          </span>
        </div>
      </div>

      <div className="space-y-5 p-6">
        <p className="text-sm leading-7 text-slate-300">{shorten(hotel.description)}</p>

        <div className="flex flex-wrap gap-2">
          {(hotel.amenities?.slice(0, 4) || []).map((amenity) => (
            <span
              key={amenity}
              className="rounded-full border border-white/10 bg-slate-900/70 px-3 py-1 text-xs uppercase tracking-[0.22em] text-slate-300"
            >
              {amenity}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-white/10 pt-5">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Starting From</p>
            <p className="text-lg font-semibold text-white">
              {formatCurrency(hotel.startingPrice || hotel.minPrice || 0)}
            </p>
          </div>

          <Link
            className="rounded-full bg-teal-300 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-teal-200"
            to={`/hotels/${hotel._id}`}
          >
            View details
          </Link>
        </div>
      </div>
    </article>
  );
}
