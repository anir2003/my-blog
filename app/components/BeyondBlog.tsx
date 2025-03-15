'use client';

import Link from 'next/link';

export default function BeyondBlog() {
  return (
    <section className="py-12 px-4 md:px-8 lg:px-16 max-w-screen-md mx-auto">
      <h2 className="text-2xl font-medium text-white mb-6">Beyond the Blog</h2>
      <p className="text-gray-400 mb-6 max-w-2xl text-base">
        Looking for more? Explore my <Link href="/portfolio" className="text-white hover:text-gray-300 underline">portfolio</Link>, <Link href="/collaborations" className="text-white hover:text-gray-300 underline">past collaborations</Link>, and <Link href="/projects" className="text-white hover:text-gray-300 underline">side projects</Link>. Whether it's design, tech, or creative experiments, there's always something exciting to share.
      </p>
    </section>
  );
} 