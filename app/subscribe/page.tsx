'use client';

import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Subscribe() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Subscribing email:', email);
    // In a real app, you would send this to your newsletter service
    setSubscribed(true);
    setEmail('');
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <main className="py-12 px-4 md:px-8 lg:px-16">
        <h1 className="text-3xl font-bold text-white mb-4">Subscribe to my Newsletter</h1>
        <p className="text-sm text-gray-500 mb-4">300+ Readers</p>
        
        <div className="max-w-xl">
          <div className="mb-8">
            <p className="text-gray-300 mb-4">
              Join my newsletter for updates, cool stories, and random thoughts. 
              I promise to keep things interesting and relevant.
            </p>
            <p className="text-gray-300 mb-4">
              What you'll get:
            </p>
            <ul className="list-disc list-inside text-gray-400 space-y-2 mb-6 pl-4">
              <li>Weekly updates on new blog posts</li>
              <li>Behind-the-scenes insights and thoughts</li>
              <li>Exclusive content not published on the blog</li>
              <li>Resources and recommendations I find valuable</li>
            </ul>
            <p className="text-gray-500 text-sm mb-8">
              I send emails approximately once a week. You can unsubscribe at any time.
            </p>
          </div>
          
          {subscribed ? (
            <div className="bg-gray-800 rounded-md p-6 text-white">
              <h3 className="font-bold text-xl mb-2">Thank you for subscribing!</h3>
              <p>Check your inbox to confirm your subscription.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-gray-800 rounded-md p-6">
              <h3 className="font-bold text-xl mb-4">Subscribe</h3>
              <div className="mb-6">
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 text-white"
                />
              </div>
              <button
                type="submit"
                className="w-full px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-md text-white transition-colors"
              >
                Subscribe
              </button>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
} 