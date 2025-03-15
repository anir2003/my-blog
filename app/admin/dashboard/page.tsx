'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

type Stats = {
  postCount: number;
  publishedPostCount: number;
  draftPostCount: number;
  mediaCount: number;
};

type RecentPost = {
  id: string;
  title: string;
  slug: string;
  createdAt: string;
  published: boolean;
};

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Fetch stats
        const statsResponse = await fetch('/api/admin/stats');
        if (!statsResponse.ok) {
          throw new Error('Failed to fetch stats');
        }
        
        const statsData = await statsResponse.json();
        setStats(statsData);
        
        // Fetch recent posts
        const postsResponse = await fetch('/api/admin/posts?limit=5');
        if (!postsResponse.ok) {
          throw new Error('Failed to fetch recent posts');
        }
        
        const postsData = await postsResponse.json();
        setRecentPosts(postsData.slice(0, 5)); // Ensure we only take up to 5 posts
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        setError('Failed to load dashboard data. Please refresh the page.');
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mb-4"></div>
        <p className="text-gray-400">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/30 text-red-300 border border-red-700 p-4 rounded-lg">
        <h2 className="text-xl font-bold mb-2">Error</h2>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-800 hover:bg-red-700 rounded text-white"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome to your Dashboard</h1>
        <p className="text-gray-400">Manage your blog content and monitor performance</p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <DashboardCard 
          title="Total Posts" 
          value={stats?.postCount || 0} 
          icon={<DocumentIcon />}
          color="bg-gradient-to-br from-orange-600/20 to-orange-800/20"
          borderColor="border-orange-600/30"
        />
        
        <DashboardCard 
          title="Published Posts" 
          value={stats?.publishedPostCount || 0} 
          icon={<PublishedIcon />}
          color="bg-gradient-to-br from-green-600/20 to-green-800/20"
          borderColor="border-green-600/30"
        />
        
        <DashboardCard 
          title="Draft Posts" 
          value={stats?.draftPostCount || 0} 
          icon={<DraftIcon />}
          color="bg-gradient-to-br from-yellow-600/20 to-yellow-800/20"
          borderColor="border-yellow-600/30"
        />
        
        <DashboardCard 
          title="Media Files" 
          value={stats?.mediaCount || 0} 
          icon={<MediaIcon />}
          color="bg-gradient-to-br from-blue-600/20 to-blue-800/20"
          borderColor="border-blue-600/30"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800 lg:col-span-2">
          <h2 className="text-xl font-bold mb-6 flex items-center">
            <span className="mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
              </svg>
            </span>
            Recent Posts
          </h2>
          
          {recentPosts.length === 0 ? (
            <div className="bg-zinc-800/50 rounded-lg p-8 text-center">
              <p className="text-gray-400 mb-4">You haven't created any posts yet.</p>
              <Link 
                href="/admin/create-post" 
                className="inline-flex items-center py-2 px-4 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded transition duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Create Your First Post
              </Link>
            </div>
          ) : (
            <div className="overflow-hidden">
              <div className="overflow-x-auto -mx-6 -mt-6">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-zinc-800/80 border-b border-zinc-700">
                      <th className="py-3 px-6 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Title</th>
                      <th className="py-3 px-6 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="py-3 px-6 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                      <th className="py-3 px-6 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {recentPosts.map((post) => (
                      <tr key={post.id} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="py-4 px-6 whitespace-nowrap text-sm">
                          <Link href={`/admin/posts/${post.id}`} className="text-blue-400 hover:text-blue-300 hover:underline font-medium">
                            {post.title}
                          </Link>
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              post.published
                                ? 'bg-green-900/30 text-green-400 border border-green-800'
                                : 'bg-yellow-900/30 text-yellow-400 border border-yellow-800'
                            }`}
                          >
                            {post.published ? 'Published' : 'Draft'}
                          </span>
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-400">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap text-right text-sm">
                          <div className="flex justify-end space-x-3">
                            <Link
                              href={`/admin/posts/${post.id}`}
                              className="text-blue-500 hover:text-blue-400"
                              title="Edit"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                              </svg>
                            </Link>
                            <Link
                              href={`/posts/${post.slug}`}
                              target="_blank"
                              className="text-green-500 hover:text-green-400"
                              title="View"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 text-right">
                <Link
                  href="/admin/posts"
                  className="text-sm text-blue-400 hover:text-blue-300 inline-flex items-center"
                >
                  View all posts
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 ml-1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </Link>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex flex-col gap-6">
          <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800 flex-1">
            <h2 className="text-xl font-bold mb-6 flex items-center">
              <span className="mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
              </span>
              Quick Actions
            </h2>
            <div className="space-y-3">
              <Link 
                href="/admin/create-post" 
                className="flex items-center w-full py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Create New Post
              </Link>
              
              <Link 
                href="/admin/posts" 
                className="flex items-center w-full py-3 px-4 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg transition duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
                </svg>
                Manage Posts
              </Link>
              
              <Link 
                href="/admin/media" 
                className="flex items-center w-full py-3 px-4 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg transition duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                Manage Media
              </Link>
            </div>
          </div>
          
          <div className="bg-zinc-900 p-6 rounded-lg border border-zinc-800 flex-1">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <span className="mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                </svg>
              </span>
              Tips & Guides
            </h2>
            <ul className="space-y-3 text-gray-300 text-sm">
              <li className="flex">
                <span className="text-orange-500 mr-2">•</span>
                <span>Use the rich text editor for formatting</span>
              </li>
              <li className="flex">
                <span className="text-orange-500 mr-2">•</span>
                <span>Upload or drag-and-drop images directly</span>
              </li>
              <li className="flex">
                <span className="text-orange-500 mr-2">•</span>
                <span>Create drafts before publishing your posts</span>
              </li>
              <li className="flex">
                <span className="text-orange-500 mr-2">•</span>
                <span>Add a cover image to make posts stand out</span>
              </li>
              <li className="flex">
                <span className="text-orange-500 mr-2">•</span>
                <span>Use descriptive titles for better SEO</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardCard({ title, value, icon, color, borderColor }: { 
  title: string, 
  value: number, 
  icon: React.ReactNode,
  color: string,
  borderColor: string
}) {
  return (
    <div className={`p-6 rounded-lg border ${borderColor} ${color}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-400 text-sm mb-1">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        <div className="p-2 bg-white/10 rounded-lg">
          {icon}
        </div>
      </div>
    </div>
  );
}

function DocumentIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-orange-500">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

function PublishedIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-green-500">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function DraftIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-yellow-500">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
    </svg>
  );
}

function MediaIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-500">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  );
} 