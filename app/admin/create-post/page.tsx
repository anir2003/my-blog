'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import RichTextEditor from '@/app/components/RichTextEditor';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

export default function CreatePost() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [published, setPublished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorLink, setErrorLink] = useState('');

  // Generate slug from title
  const generateSlug = () => {
    if (!title) return;
    
    setSlug(
      title
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '-')
    );
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !content) {
      toast.error('Title and content are required');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/admin/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          slug,
          content,
          excerpt,
          coverImage,
          published,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (data.error) {
          setError(data.error);
          if (data.fixUrl) {
            setErrorLink(data.fixUrl);
          }
        } else {
          setError('Failed to create post. Please try again.');
        }
        toast.error('Failed to create post');
        return;
      }
      
      toast.success('Post created successfully!');
      router.push('/admin/posts');
    } catch (err) {
      console.error('Error creating post:', err);
      setError('An unexpected error occurred. Please try again.');
      toast.error('Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Create New Post</h1>
      
      {error && (
        <div className="bg-red-900/30 text-red-300 border border-red-700 p-4 rounded-lg mb-6">
          {errorLink ? (
            <div dangerouslySetInnerHTML={{ __html: error }} />
          ) : (
            <p>{error}</p>
          )}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={generateSlug}
            className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-md"
            required
          />
        </div>
        
        <div>
          <label htmlFor="slug" className="block text-sm font-medium mb-1">
            Slug
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="flex-1 p-2 bg-zinc-800 border border-zinc-700 rounded-md"
              required
            />
            <button
              type="button"
              onClick={generateSlug}
              className="px-3 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-md text-sm"
            >
              Generate
            </button>
          </div>
        </div>
        
        <div>
          <label htmlFor="content" className="block text-sm font-medium mb-1">
            Content
          </label>
          <div className="min-h-[300px] bg-zinc-800 border border-zinc-700 rounded-md">
            <RichTextEditor 
              content={content} 
              onChange={setContent} 
              placeholder="Write your post content here..."
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="excerpt" className="block text-sm font-medium mb-1">
            Excerpt
          </label>
          <textarea
            id="excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-md h-24"
            placeholder="A short summary of your post (optional)"
          />
        </div>
        
        <div>
          <label htmlFor="coverImage" className="block text-sm font-medium mb-1">
            Cover Image URL
          </label>
          <input
            type="text"
            id="coverImage"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            className="w-full p-2 bg-zinc-800 border border-zinc-700 rounded-md"
            placeholder="https://example.com/image.jpg (optional)"
          />
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="published"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
            className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-zinc-700 rounded"
          />
          <label htmlFor="published" className="ml-2 block text-sm">
            Publish immediately
          </label>
        </div>
        
        <div className="flex gap-3">
          <button
            type="submit"
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Post'}
          </button>
          <Link
            href="/admin/posts"
            className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-md inline-block"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
} 