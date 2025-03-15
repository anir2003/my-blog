'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import RichTextEditor from '@/app/components/RichTextEditor';
import Image from 'next/image';
import { useDropzone } from 'react-dropzone';
import { uploadFile } from '@/lib/upload';
import { use } from 'react';

type Post = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage: string;
  published: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
};

export default function EditPost({ params }: { params: Promise<{ id: string }> }) {
  // Properly unwrap params using React.use()
  const unwrappedParams = use(params);
  const postId = unwrappedParams.id;
  
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [published, setPublished] = useState(false);
  const [featured, setFeatured] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploading, setUploading] = useState(false);

  // Fetch post data
  useEffect(() => {
    async function fetchPost() {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/posts/${postId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch post');
        }
        
        const data = await response.json();
        setPost(data);
        setTitle(data.title);
        setSlug(data.slug);
        setContent(data.content || '');
        setExcerpt(data.excerpt || '');
        setCoverImage(data.coverImage || '');
        setPublished(data.published);
        setFeatured(data.featured);
      } catch (err) {
        console.error('Error fetching post:', err);
        setError('Failed to load post. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchPost();
  }, [postId]);

  const generateSlug = () => {
    if (!title) return;
    
    const generatedSlug = title
      .toLowerCase()
      .replace(/[^\w\s-]/gi, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    
    setSlug(generatedSlug);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !content) {
      setError('Title and content are required');
      return;
    }
    
    if (!slug) {
      generateSlug();
    }
    
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      const response = await fetch(`/api/admin/posts/${postId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          slug,
          content,
          excerpt,
          coverImage,
          featured,
          published,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update post');
      }
      
      setSuccess('Post updated successfully!');
      toast.success('Post updated successfully!');
      
      // Update local state
      setPost({
        ...post!,
        title,
        slug,
        content,
        excerpt,
        coverImage,
        featured,
        published,
        updatedAt: new Date().toISOString(),
      });
      
    } catch (err: any) {
      setError(err.message || 'An error occurred while updating the post');
      toast.error('Failed to update post');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Cover image upload
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed');
      return;
    }
    
    try {
      setUploading(true);
      setError('');
      
      const result = await uploadFile(file);
      setCoverImage(result.url);
      toast.success('Image uploaded successfully!');
      
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Failed to upload image. Please try again.');
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  }, []);
  
  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 1,
    disabled: uploading
  });

  // Show loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mb-4"></div>
        <p className="text-gray-400">Loading post...</p>
      </div>
    );
  }

  if (!post && !loading) {
    return (
      <div className="bg-red-900/30 text-red-300 border border-red-700 p-4 rounded-lg">
        <h2 className="text-xl font-bold mb-2">Post Not Found</h2>
        <p>The post you're trying to edit could not be found.</p>
        <button 
          onClick={() => router.push('/admin/posts')}
          className="mt-4 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded text-white"
        >
          Back to Posts
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Edit Post</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => router.push('/admin/posts')}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded text-white"
          >
            Cancel
          </button>
          <button
            onClick={() => router.push(`/posts/${slug}`)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
          >
            View Post
          </button>
        </div>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-900/30 border border-red-700 text-red-200 rounded-lg">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-6 p-4 bg-green-900/30 border border-green-700 text-green-200 rounded-lg">
          {success}
        </div>
      )}
      
      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div>
              <label className="block mb-2 text-gray-300 font-medium">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={generateSlug}
                className="w-full px-4 py-3 bg-zinc-800/80 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-white"
                placeholder="Post Title"
              />
            </div>
            
            <div>
              <label className="block mb-2 text-gray-300 font-medium">Slug</label>
              <div className="flex">
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="flex-1 px-4 py-3 bg-zinc-800/80 border border-zinc-700 rounded-l-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-white"
                  placeholder="post-slug"
                />
                <button
                  type="button"
                  onClick={generateSlug}
                  className="px-4 py-3 bg-zinc-700 border border-l-0 border-zinc-600 rounded-r-lg hover:bg-zinc-600 transition-colors text-white"
                >
                  Generate
                </button>
              </div>
            </div>
            
            <div>
              <label className="block mb-2 text-gray-300 font-medium">Excerpt</label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-800/80 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-white"
                placeholder="A short summary of your post (optional)"
                rows={3}
              />
            </div>
            
            <div>
              <label className="block mb-2 text-gray-300 font-medium">Cover Image</label>
              <div 
                {...getRootProps()} 
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${uploading ? 'bg-zinc-800/50 border-zinc-600' : 'bg-zinc-800/30 border-zinc-700 hover:bg-zinc-800/50 hover:border-zinc-600'}`}
              >
                <input {...getInputProps()} />
                {uploading ? (
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-orange-500 mb-3"></div>
                    <p className="text-gray-400">Uploading image...</p>
                  </div>
                ) : coverImage ? (
                  <div className="space-y-4">
                    <div className="relative w-full h-48 rounded-lg overflow-hidden">
                      <Image 
                        src={coverImage} 
                        alt="Cover preview" 
                        fill
                        style={{ objectFit: 'cover' }}
                        className="rounded-lg"
                      />
                    </div>
                    <p className="text-sm text-gray-400">Drag & drop a new image to replace</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-400">Drag & drop an image here, or click to select</p>
                    <p className="text-sm text-gray-500">Recommended: 1200 x 630 pixels</p>
                  </div>
                )}
              </div>
              {coverImage && (
                <div className="mt-2 flex">
                  <input
                    type="text"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    className="flex-1 px-4 py-2 text-sm bg-zinc-800 border border-zinc-700 rounded-l text-gray-300"
                    placeholder="Image URL"
                  />
                  <button
                    type="button"
                    onClick={() => setCoverImage('')}
                    className="px-4 py-2 bg-red-800 hover:bg-red-700 text-white rounded-r transition-colors"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block mb-2 text-gray-300 font-medium">Content</label>
              <div className="border border-zinc-700 rounded-lg overflow-hidden">
                <RichTextEditor
                  content={content}
                  onChange={setContent}
                  placeholder="Write your content here..."
                />
              </div>
            </div>
            
            <div className="flex flex-col space-y-4 mt-4">
              <div className="flex items-center bg-zinc-800/50 p-4 rounded-lg border border-zinc-700">
                <input
                  type="checkbox"
                  id="published"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="w-5 h-5 rounded border-zinc-600 text-orange-600 focus:ring-orange-500 focus:ring-offset-gray-900"
                />
                <div className="ml-3">
                  <label htmlFor="published" className="text-white font-medium">Published</label>
                  <p className="text-gray-400 text-sm">Make this post visible to readers</p>
                </div>
              </div>
              
              <div className="flex items-center bg-zinc-800/50 p-4 rounded-lg border border-zinc-700">
                <input
                  type="checkbox"
                  id="featured"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="w-5 h-5 rounded border-zinc-600 text-orange-600 focus:ring-orange-500 focus:ring-offset-gray-900"
                />
                <div className="ml-3">
                  <label htmlFor="featured" className="text-white font-medium">Featured</label>
                  <p className="text-gray-400 text-sm">Show this post in the featured section</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col space-y-2 text-sm text-gray-400 bg-zinc-800/30 p-4 rounded-lg">
              <p>Created: {post ? new Date(post.createdAt).toLocaleString() : 'Loading...'}</p>
              <p>Last updated: {post ? new Date(post.updatedAt).toLocaleString() : 'Loading...'}</p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-4 sticky bottom-0 bg-zinc-900/90 backdrop-blur-sm p-4 -mx-4 border-t border-zinc-800">
          <button
            type="button"
            onClick={() => router.push('/admin/posts')}
            className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-white transition-colors"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={saving}
            className={`px-6 py-3 bg-orange-600 hover:bg-orange-700 rounded-lg text-white font-medium transition-colors flex items-center ${
              saving ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {saving ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></span>
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 