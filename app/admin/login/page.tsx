'use client';

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState('');
  const router = useRouter();
  const { data: session, status } = useSession();
  
  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/admin/dashboard');
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setInfo('Attempting to log in...');
      
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });
      
      if (result?.error) {
        setError('Invalid credentials. Please check your email and password.');
        setInfo('');
        console.error('Login error:', result.error);
      } else {
        setInfo('Login successful! Redirecting...');
        router.push('/admin/dashboard');
      }
    } catch (error) {
      setError('An error occurred during login. Please try again.');
      console.error('Login exception:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Display loading while checking session status
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="bg-zinc-900 p-8 rounded-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-white mb-6">Admin Login</h1>
        
        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-700 text-red-200 rounded">
            {error}
          </div>
        )}
        
        {info && (
          <div className="mb-6 p-4 bg-blue-900/50 border border-blue-700 text-blue-200 rounded">
            {info}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-300 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="admin@example.com"
              disabled={loading}
              autoComplete="email"
            />
          </div>
          
          <div>
            <label className="block text-gray-300 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              disabled={loading}
              autoComplete="current-password"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded font-medium text-white ${
              loading 
                ? 'bg-orange-700 cursor-not-allowed' 
                : 'bg-orange-600 hover:bg-orange-700 transition'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></span>
                Logging in...
              </span>
            ) : (
              'Login'
            )}
          </button>
        </form>
        
        <div className="mt-8 text-center text-sm text-gray-400">
          <p>For Supabase Authentication:</p>
          <p>Create a user in your Supabase Auth dashboard</p>
          <p>or use the admin credentials:</p>
          <p>Email: admin@example.com</p>
          <p>Password: admin123</p>
        </div>
      </div>
    </div>
  );
} 