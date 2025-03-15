'use client';

import Link from 'next/link';

export default function Intro() {
  return (
    <section className="py-12 px-4 md:px-8 lg:px-16 max-w-screen-md mx-auto">
      <h1 className="text-3xl font-medium text-white mb-6">Welcome ✍️</h1>
      <p className="text-gray-300 mb-12 leading-relaxed text-base">
        Hi, I'm Anir, a curious person with a passion for technology and creativity. I had a startup 
        called Blockverse Media, a marketing agency for Web3 companies, and now I am planning to pursue 
        an MBA. Here, I share my thoughts on design, creativity, AI, and the random sparks of 
        inspiration that keep me going.
      </p>

      <div className="mb-6">
        <h2 className="text-xl font-medium text-white mb-4">Links</h2>
        <ul className="space-y-2">
          <li>
            <Link href="https://x.com/AnirdiptaGhosh" className="text-gray-400 hover:text-white flex items-center gap-1 transition-colors" target="_blank" rel="noopener noreferrer">
              Twitter <span className="inline-block transform rotate-45">↗</span>
            </Link>
          </li>
          <li>
            <Link href="https://www.linkedin.com/in/anirdipta-ghosh-124a1b12a/" className="text-gray-400 hover:text-white flex items-center gap-1 transition-colors" target="_blank" rel="noopener noreferrer">
              LinkedIn <span className="inline-block transform rotate-45">↗</span>
            </Link>
          </li>
        </ul>
      </div>
    </section>
  );
} 