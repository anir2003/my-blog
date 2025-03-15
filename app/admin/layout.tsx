'use client';

import { usePathname, redirect } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { Toaster } from 'react-hot-toast';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  
  // Don't redirect on login page
  if (pathname === '/admin/login') {
    return children;
  }
  
  // Handle loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (status === 'unauthenticated') {
    redirect('/admin/login');
  }
  
  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/admin/login' });
  };
  
  return (
    <div className="min-h-screen bg-black text-white flex flex-col md:flex-row">
      {/* Mobile header */}
      <div className="bg-zinc-900 p-4 md:hidden">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
          <button
            onClick={() => {
              const sidebar = document.getElementById('mobile-sidebar');
              if (sidebar) {
                sidebar.classList.toggle('hidden');
              }
            }}
            className="p-2 rounded hover:bg-zinc-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Sidebar */}
      <nav id="mobile-sidebar" className="w-full md:w-64 bg-zinc-900 p-4 hidden md:block">
        <div className="mb-8">
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-400 text-sm">Welcome, {session?.user?.name || session?.user?.email}</p>
        </div>
        
        <ul className="space-y-2">
          <li>
            <Link 
              href="/admin/dashboard" 
              className={`block py-2 px-4 rounded transition ${
                pathname === '/admin/dashboard' 
                  ? 'bg-zinc-800 text-orange-500' 
                  : 'hover:bg-zinc-800'
              }`}
            >
              Dashboard
            </Link>
          </li>
          
          <li>
            <Link 
              href="/admin/posts" 
              className={`block py-2 px-4 rounded transition ${
                pathname === '/admin/posts' 
                  ? 'bg-zinc-800 text-orange-500' 
                  : 'hover:bg-zinc-800'
              }`}
            >
              Posts
            </Link>
          </li>
          
          <li>
            <Link 
              href="/admin/create-post" 
              className={`block py-2 px-4 rounded transition ${
                pathname === '/admin/create-post' 
                  ? 'bg-zinc-800 text-orange-500' 
                  : 'hover:bg-zinc-800'
              }`}
            >
              Create Post
            </Link>
          </li>
        </ul>
        
        <div className="mt-8 pt-6 border-t border-zinc-800">
          <button
            onClick={handleLogout}
            className="w-full py-2 px-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Log Out
          </button>
          
          <Link
            href="/"
            className="mt-4 w-full py-2 px-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7m-7-7v14" />
            </svg>
            View Blog
          </Link>
        </div>
      </nav>
      
      {/* Main content */}
      <main className="flex-1 p-6 overflow-auto">
        {children}
        <Toaster position="top-right" />
      </main>
    </div>
  );
} 