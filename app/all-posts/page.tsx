'use client';

import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Link from 'next/link';

interface Post {
  id: string;
  title: string;
  slug: string;
  featured: boolean;
  createdAt: string;
}

export default function AllPosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await fetch('/api/posts?limit=100');
        
        if (!response.ok) {
          throw new Error('Failed to fetch posts');
        }
        
        const data = await response.json();
        setPosts(data);
      } catch (err) {
        setError('Error loading posts');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchPosts();
  }, []);

  const featuredPosts = posts.filter(post => post.featured);
  const allPosts = posts;

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <main className="py-12 px-4 md:px-8 lg:px-16 max-w-screen-md mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">All Posts</h1>
          
          <div className="mb-12">
            <h2 className="text-xl font-bold text-white mb-6">Featured</h2>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse flex justify-between items-center">
                  <div className="h-5 bg-zinc-800 rounded w-1/2"></div>
                  <div className="h-4 bg-zinc-800 rounded w-24"></div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-bold text-white mb-6">All Posts</h2>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="animate-pulse flex justify-between items-center">
                  <div className="h-5 bg-zinc-800 rounded w-1/2"></div>
                  <div className="h-4 bg-zinc-800 rounded w-24"></div>
                </div>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <main className="py-12 px-4 md:px-8 lg:px-16 max-w-screen-md mx-auto">
          <div className="p-4 bg-red-900/50 border border-red-700 text-red-200 rounded">
            {error}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <main className="py-12 px-4 md:px-8 lg:px-16 max-w-screen-md mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">All Posts</h1>
        
        {featuredPosts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-bold text-white mb-6">Featured</h2>
            <div className="space-y-4">
              {featuredPosts.map(post => (
                <div key={post.id} className="flex justify-between items-center">
                  <Link 
                    href={`/posts/${post.slug}`}
                    className="text-gray-300 hover:text-white transition-colors font-medium"
                  >
                    {post.title}
                  </Link>
                  <span className="text-gray-500 text-sm">
                    {new Date(post.createdAt).toLocaleDateString('en-US', {
                      month: 'numeric',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div>
          <h2 className="text-xl font-bold text-white mb-6">All Posts</h2>
          {posts.length > 0 ? (
            <div className="space-y-4">
              {allPosts.map(post => (
                <div key={post.id} className="flex justify-between items-center">
                  <Link 
                    href={`/posts/${post.slug}`}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {post.title}
                  </Link>
                  <span className="text-gray-500 text-sm">
                    {new Date(post.createdAt).toLocaleDateString('en-US', {
                      month: 'numeric',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No posts available yet.</p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
} 