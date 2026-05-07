export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-slate-950/40">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-medium text-slate-200" style={{ fontFamily: 'Sora, sans-serif' }}>
            Hotel Haven
          </p>
          <p>Search, compare, and book comfortable stays with one clean flow.</p>
        </div>
        <p>Built for guests and admins using the same live backend API.</p>
      </div>
    </footer>
  );
}
