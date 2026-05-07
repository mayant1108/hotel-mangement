import { BrowserRouter, Route, Routes } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';
import Footer from './components/Footer.jsx';
import Loader from './components/Loader.jsx';
import Navbar from './components/Navbar.jsx';
import Booking from './pages/Booking.jsx';
import Home from './pages/Home.jsx';
import HotelDetails from './pages/HotelDetails.jsx';
import Hotels from './pages/Hotels.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';

function NotFound() {
  return (
    <section className="mx-auto flex min-h-[60vh] w-full max-w-3xl items-center justify-center px-4 py-20">
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-10 text-center shadow-2xl shadow-black/20 backdrop-blur">
        <p className="mb-3 text-sm uppercase tracking-[0.35em] text-teal-300">404</p>
        <h1 className="mb-3 text-3xl font-semibold text-white" style={{ fontFamily: 'Sora, sans-serif' }}>
          Page not found
        </h1>
        <p className="text-slate-300">
          The page you are looking for does not exist. Use the navigation above to continue exploring.
        </p>
      </div>
    </section>
  );
}

export default function App() {
  const { authReady } = useAuth();

  if (!authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Loader label="Restoring your session..." />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-transparent text-slate-100">
        <Navbar />
        <main className="pb-16 pt-24">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/hotels" element={<Hotels />} />
            <Route path="/hotels/:id" element={<HotelDetails />} />
            <Route path="/bookings" element={<Booking />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
