'use client';

import { useState } from 'react';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, you would send this to your newsletter service
    console.log('Subscribing email:', email);
    setSubscribed(true);
    setEmail('');
  };

  return (
    <section className="py-12 px-4 md:px-8 lg:px-16 max-w-screen-md mx-auto bg-[#111111] rounded-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-medium text-white">Newsletter</h2>
        <p className="text-sm text-gray-500 mt-1">300+ Readers</p>
      </div>
      
      <div className="mb-4">
        <div className="relative">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jane@framer.com"
            required
            className="w-full px-4 py-3 bg-transparent border border-gray-800 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-700 text-white text-sm"
          />
          <button
            type="submit"
            onClick={handleSubmit}
            className="absolute right-1 top-1 px-4 py-2 text-sm text-white rounded-md flex items-center gap-1 bg-transparent hover:bg-gray-800 transition-colors"
          >
            Subscribe <span className="inline-block">→</span>
          </button>
        </div>
      </div>
      
      <p className="text-sm text-gray-400">
        Love design, tech, and random thoughts? Subscribe to my newsletter — it's like a good chat, in your inbox!
      </p>
    </section>
  );
} 