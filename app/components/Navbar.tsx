'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const [currentTime, setCurrentTime] = useState('');
  
  useEffect(() => {
    // Update time initially
    updateTime();
    
    // Set up interval to update time every minute
    const interval = setInterval(updateTime, 60000);
    
    // Clean up interval on unmount
    return () => clearInterval(interval);
  }, []);
  
  const updateTime = () => {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });
    setCurrentTime(timeString);
  };
  
  return (
    <nav className="py-6 px-4 md:px-8 lg:px-16 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center text-white font-medium">
          A
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-white">Anir</span>
          <span className="text-xs text-gray-400">{currentTime}</span>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <Link 
          href="/" 
          className={`text-sm ${pathname === '/' ? 'text-white' : 'text-gray-400 hover:text-white'} transition-colors`}
        >
          Home
        </Link>
        <Link 
          href="/all-posts" 
          className={`text-sm ${pathname === '/all-posts' ? 'text-white' : 'text-gray-400 hover:text-white'} transition-colors`}
        >
          All posts
        </Link>
      </div>
    </nav>
  );
} 