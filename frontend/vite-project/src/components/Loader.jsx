export default function Loader({ label = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <span className="h-12 w-12 animate-spin rounded-full border-4 border-white/15 border-t-teal-300" />
      <p className="text-sm uppercase tracking-[0.3em] text-slate-300">{label}</p>
    </div>
  );
}
