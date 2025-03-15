import Navbar from './components/Navbar';
import Intro from './components/Intro';
import FeaturedPosts from './components/FeaturedPosts';
import NewPosts from './components/NewPosts';
import Footer from './components/Footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="pb-12">
        <Intro />
        <hr className="border-zinc-800 max-w-screen-md mx-auto" />
        <FeaturedPosts />
        <hr className="border-zinc-800 max-w-screen-md mx-auto" />
        <NewPosts />
        <Footer />
      </div>
    </main>
  );
}
