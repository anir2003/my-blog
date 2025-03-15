'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

type Post = {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  excerpt?: string;
  coverImage?: string;
};

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [sort, setSort] = useState<'newest' | 'oldest' | 'title'>('newest');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  
  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/posts');
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }
      
      const data: Post[] = await response.json();
      setPosts(data);
    } catch (err) {
      setError('Error loading posts');
      toast.error('Failed to load posts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);
  
  const deletePost = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/posts/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete post');
      }
      
      setPosts(posts.filter(post => post.id !== id));
      setConfirmDelete(null);
      toast.success('Post deleted successfully');
    } catch (err) {
      toast.error('Error deleting post');
      console.error(err);
    }
  };
  
  const toggleFeatured = async (id: string, featured: boolean) => {
    try {
      const response = await fetch(`/api/admin/posts/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ featured: !featured }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update post');
      }
      
      setPosts(
        posts.map(post => 
          post.id === id ? { ...post, featured: !featured } : post
        )
      );
      
      toast.success(`Post ${!featured ? 'marked as featured' : 'removed from featured'}`);
    } catch (err) {
      toast.error('Error updating post');
      console.error(err);
    }
  };
  
  const togglePublished = async (id: string, published: boolean) => {
    try {
      const response = await fetch(`/api/admin/posts/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ published: !published }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update post');
      }
      
      setPosts(
        posts.map(post => 
          post.id === id ? { ...post, published: !published } : post
        )
      );
      
      toast.success(`Post ${!published ? 'published' : 'unpublished'}`);
    } catch (err) {
      toast.error('Error updating post');
      console.error(err);
    }
  };
  
  // Filter and sort posts
  const filteredPosts = posts
    .filter(post => {
      // Apply text search
      const matchesSearch = 
        search === '' || 
        post.title.toLowerCase().includes(search.toLowerCase()) ||
        (post.excerpt && post.excerpt.toLowerCase().includes(search.toLowerCase()));
      
      // Apply status filter
      const matchesFilter = 
        filter === 'all' || 
        (filter === 'published' && post.published) || 
        (filter === 'draft' && !post.published);
        
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      // Apply sorting
      if (sort === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sort === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else {
        return a.title.localeCompare(b.title);
      }
    });
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mb-4"></div>
        <p className="text-gray-400">Loading posts...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-900/30 text-red-300 border border-red-700 p-4 rounded-lg">
        <h2 className="text-xl font-bold mb-2">Error</h2>
        <p>{error}</p>
        <button 
          onClick={() => fetchPosts()}
          className="mt-4 px-4 py-2 bg-red-800 hover:bg-red-700 rounded text-white"
        >
          Retry
        </button>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Posts</h1>
          <p className="text-gray-400">Manage your blog posts</p>
        </div>
        <Link
          href="/admin/create-post"
          className="py-2 px-4 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition duration-200 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Create New Post
        </Link>
      </div>
      
      <div className="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden mb-6">
        <div className="p-4 border-b border-zinc-800 flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search posts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-white"
            />
            <div className="absolute left-3 top-2.5 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
          </div>
          
          <div className="flex gap-3">
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'published' | 'draft')}
              className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-white"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
            
            <select 
              value={sort}
              onChange={(e) => setSort(e.target.value as 'newest' | 'oldest' | 'title')}
              className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-white"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">By Title</option>
            </select>
          </div>
        </div>
        
        {posts.length === 0 ? (
          <div className="p-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16 mx-auto text-gray-600 mb-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <p className="text-gray-400 mb-4">No posts created yet.</p>
            <Link
              href="/admin/create-post"
              className="inline-block py-2 px-4 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded transition duration-200"
            >
              Create Your First Post
            </Link>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="p-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16 mx-auto text-gray-600 mb-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <p className="text-gray-400 mb-2">No posts match your search criteria.</p>
            <button 
              onClick={() => {
                setSearch('');
                setFilter('all');
              }}
              className="text-blue-400 hover:text-blue-300"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-zinc-800/70">
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Title</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider hidden lg:table-cell">Slug</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider hidden md:table-cell">Featured</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {filteredPosts.map(post => (
                    <tr key={post.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {post.coverImage && (
                            <div className="w-10 h-10 rounded overflow-hidden mr-3 flex-shrink-0 bg-zinc-800">
                              <img 
                                src={post.coverImage} 
                                alt="" 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            </div>
                          )}
                          <Link href={`/admin/posts/${post.id}`} className="text-blue-400 hover:text-blue-300 hover:underline font-medium truncate block max-w-xs">
                            {post.title}
                          </Link>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-300 truncate max-w-xs hidden lg:table-cell">{post.slug}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => togglePublished(post.id, post.published)}
                          className={`px-2 py-1 text-xs rounded-full ${
                            post.published
                              ? 'bg-green-900/30 text-green-400 border border-green-800 hover:bg-green-900/50'
                              : 'bg-yellow-900/30 text-yellow-400 border border-yellow-800 hover:bg-yellow-900/50'
                          } transition-colors`}
                          title={post.published ? "Click to unpublish" : "Click to publish"}
                        >
                          {post.published ? 'Published' : 'Draft'}
                        </button>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <button
                          onClick={() => toggleFeatured(post.id, post.featured)}
                          className={`px-2 py-1 text-xs rounded-full ${
                            post.featured
                              ? 'bg-purple-900/30 text-purple-400 border border-purple-800 hover:bg-purple-900/50'
                              : 'bg-zinc-800 text-gray-400 border border-zinc-700 hover:bg-zinc-700'
                          } transition-colors`}
                          title={post.featured ? "Remove from featured" : "Mark as featured"}
                        >
                          {post.featured ? 'Featured' : 'Normal'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-gray-300 whitespace-nowrap">
                        <span title={new Date(post.createdAt).toLocaleString()}>
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex space-x-3 justify-end">
                          <Link
                            href={`/admin/posts/${post.id}`}
                            className="text-blue-500 hover:text-blue-400 transition-colors"
                            title="Edit"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                            </svg>
                          </Link>
                          <Link
                            href={`/posts/${post.slug}`}
                            target="_blank"
                            className="text-green-500 hover:text-green-400 transition-colors"
                            title="View"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </Link>
                          {confirmDelete === post.id ? (
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => deletePost(post.id)}
                                className="text-red-500 hover:text-red-400 transition-colors bg-red-900/20 rounded-md p-1"
                                title="Confirm delete"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                              </button>
                              <button
                                onClick={() => setConfirmDelete(null)}
                                className="text-gray-400 hover:text-gray-300 transition-colors bg-zinc-800 rounded-md p-1"
                                title="Cancel"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDelete(post.id)}
                              className="text-red-500 hover:text-red-400 transition-colors"
                              title="Delete"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-zinc-800 flex justify-between items-center text-sm text-gray-400">
              <div>
                Showing {filteredPosts.length} of {posts.length} posts
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 