import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <main className="relative z-20 grid min-h-full place-items-center px-6 text-center text-ivory">
      <div className="glass-dark rounded-3xl px-8 py-10">
        <div className="eyebrow text-champagne-soft">404 · Off course</div>
        <h1 className="font-display mt-2 text-3xl font-semibold">This corridor doesn’t exist.</h1>
        <Link to="/" className="mt-6 inline-block rounded-full bg-electric px-5 py-2.5 text-sm font-medium text-white">
          Return to the vertiport
        </Link>
      </div>
    </main>
  );
}
