export default function Loader({ label = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="w-10 h-10 border-4 border-gold/20 border-t-gold rounded-full animate-spin"></div>
      <p className="text-slate-300 text-sm">{label}</p>
    </div>
  );
}