import Link from 'next/link';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <main className="py-12 px-4 md:px-8 lg:px-16 flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-6">Page Not Found</h2>
        <p className="text-gray-400 mb-8 max-w-md">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link 
          href="/"
          className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-md text-white transition-colors"
        >
          Return Home
        </Link>
      </main>
      <Footer />
    </div>
  );
} 