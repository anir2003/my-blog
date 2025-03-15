'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  createdAt: string;
}

export default function FeaturedPosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeaturedPosts() {
      try {
        const response = await fetch('/api/posts?featured=true&limit=3');
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error('Error fetching featured posts:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchFeaturedPosts();
  }, []);

  if (loading) {
    return (
      <section className="py-12 px-4 md:px-8 lg:px-16 max-w-screen-md mx-auto">
        <h2 className="text-2xl font-medium text-white mb-8">Featured posts</h2>
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex items-start justify-between">
              <div className="flex-1">
                <div className="h-5 bg-zinc-800 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-zinc-800 rounded w-1/2"></div>
              </div>
              <div className="ml-4 mt-1">
                <div className="w-6 h-6 bg-zinc-800 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 px-4 md:px-8 lg:px-16 max-w-screen-md mx-auto">
      <h2 className="text-2xl font-medium text-white mb-8">Featured posts</h2>
      <div className="space-y-6">
        {posts.length > 0 ? (
          posts.map((post) => (
            <div key={post.id} className="group flex items-start justify-between">
              <div className="flex-1">
                <Link 
                  href={`/posts/${post.slug}`}
                  className="block"
                >
                  <h3 className="text-base text-white font-medium mb-1 group-hover:text-white transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {post.excerpt || 'Read more...'}
                  </p>
                </Link>
              </div>
              <div className="ml-4 mt-1">
                <div className="w-6 h-6 border border-gray-700 rounded-full flex items-center justify-center group-hover:border-gray-500 transition-colors">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 6H10M10 6L7 3M10 6L7 9" stroke="#888888" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-400">No featured posts yet.</p>
        )}
      </div>
    </section>
  );
} 