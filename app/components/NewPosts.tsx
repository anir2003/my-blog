'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Post {
  id: string;
  title: string;
  slug: string;
  createdAt: string;
}

export default function NewPosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await fetch('/api/posts?limit=5');
        const data = await response.json();
        setPosts(data);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, []);

  if (loading) {
    return (
      <section className="py-12 px-4 md:px-8 lg:px-16 max-w-screen-md mx-auto">
        <h2 className="text-2xl font-medium text-white mb-8">New posts</h2>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse flex justify-between items-center">
              <div className="h-5 bg-zinc-800 rounded w-1/2"></div>
              <div className="h-4 bg-zinc-800 rounded w-24"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 px-4 md:px-8 lg:px-16 max-w-screen-md mx-auto">
      <h2 className="text-2xl font-medium text-white mb-8">New posts</h2>
      <div className="space-y-4">
        {posts.length > 0 ? (
          posts.map((post) => (
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
          ))
        ) : (
          <p className="text-gray-400">No posts yet.</p>
        )}
      </div>
      
      <div className="mt-8">
        <Link 
          href="/all-posts"
          className="text-gray-400 hover:text-white transition-colors flex items-center"
        >
          <span>View all posts</span>
          <svg className="ml-1 w-4 h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
      </div>
    </section>
  );
} 