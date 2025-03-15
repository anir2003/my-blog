'use client';

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Post {
  id: string;
  title: string;
  content: string;
  coverImage: string | null;
  createdAt: string;
  author: {
    name: string;
  };
}

export default function PostPage() {
  // Use the useParams hook instead of props
  const params = useParams();
  const slug = params.slug as string;
  
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPost() {
      try {
        const response = await fetch(`/api/posts/${slug}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            notFound();
          }
          throw new Error('Failed to fetch post');
        }
        
        const data = await response.json();
        setPost(data);
      } catch (err) {
        setError('Error loading post');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <main className="py-12 px-4 md:px-8 lg:px-16 max-w-screen-md mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-zinc-800 rounded w-3/4 mb-8"></div>
            <div className="h-4 bg-zinc-800 rounded w-1/4 mb-12"></div>
            <div className="space-y-4">
              <div className="h-4 bg-zinc-800 rounded w-full"></div>
              <div className="h-4 bg-zinc-800 rounded w-full"></div>
              <div className="h-4 bg-zinc-800 rounded w-3/4"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <main className="py-12 px-4 md:px-8 lg:px-16 max-w-screen-md mx-auto">
          <div className="p-4 bg-red-900/50 border border-red-700 text-red-200 rounded">
            {error || 'Post not found'}
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
        <article>
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">{post.title}</h1>
            <div className="text-gray-400 text-sm">
              {new Date(post.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })} • By {post.author.name}
            </div>
          </header>
          
          {post.coverImage && (
            <div className="mb-8">
              <img 
                src={post.coverImage} 
                alt={post.title} 
                className="w-full h-auto rounded-lg"
              />
            </div>
          )}
          
          <div 
            className="prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>
        
        <div className="mt-12 pt-6 border-t border-zinc-800">
          <Link 
            href="/"
            className="text-gray-400 hover:text-white transition-colors flex items-center"
          >
            <svg className="mr-2 w-4 h-4 rotate-180" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Back to home</span>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
} 