'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SetupPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Setting up admin user...');
  const [details, setDetails] = useState('');
  const [userId, setUserId] = useState('');

  useEffect(() => {
    async function setupAdmin() {
      try {
        // Using the simpler setup endpoint
        const response = await fetch('/api/setup');
        const data = await response.json();
        
        if (response.ok && data.success) {
          setStatus('success');
          setMessage(data.message || 'Admin user setup completed successfully');
          if (data.adminUser) {
            setUserId(data.adminUser.id);
            setDetails(`Admin user created with email: ${data.adminUser.email}`);
          } else if (data.userId) {
            setUserId(data.userId);
          }
        } else {
          setStatus('error');
          setMessage(data.message || 'Failed to set up admin user');
          if (data.error) {
            setDetails(data.error);
          }
        }
      } catch (error) {
        console.error('Error setting up admin:', error);
        setStatus('error');
        setMessage('An unexpected error occurred');
        setDetails(error instanceof Error ? error.message : 'Unknown error');
      }
    }

    setupAdmin();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-900 text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-zinc-800 p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">Admin Setup</h1>
        
        {status === 'loading' && (
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            <p className="text-zinc-300">{message}</p>
          </div>
        )}
        
        {status === 'success' && (
          <div className="text-center">
            <div className="bg-green-900/30 text-green-300 border border-green-700 p-4 rounded-lg mb-4">
              <p className="font-semibold mb-1">✅ {message}</p>
              {details && <p className="text-sm mt-2">{details}</p>}
              {userId && <p className="text-xs opacity-75 mt-2">User ID: {userId}</p>}
            </div>
            <div className="flex flex-col gap-3 mt-6">
              <Link 
                href="/admin/login" 
                className="bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded text-white transition"
              >
                Go to Login
              </Link>
              <Link 
                href="/admin/dashboard" 
                className="bg-zinc-700 hover:bg-zinc-600 px-4 py-2 rounded text-white transition"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        )}
        
        {status === 'error' && (
          <div className="text-center">
            <div className="bg-red-900/30 text-red-300 border border-red-700 p-4 rounded-lg mb-4">
              <p className="font-semibold">❌ {message}</p>
              {details && (
                <div className="mt-2 text-sm overflow-auto max-h-40 bg-red-950/50 p-2 rounded">
                  <pre className="whitespace-pre-wrap">{details}</pre>
                </div>
              )}
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="bg-zinc-700 hover:bg-zinc-600 px-4 py-2 rounded text-white transition mt-4"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 