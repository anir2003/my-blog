import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/options';
import prisma from '@/lib/prisma';

export async function GET() {
  // Check authentication
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    // Get total post count
    const postCount = await prisma.post.count();
    
    // Get published post count
    const publishedPostCount = await prisma.post.count({
      where: {
        published: true,
      },
    });
    
    // Get draft post count
    const draftPostCount = await prisma.post.count({
      where: {
        published: false,
      },
    });
    
    // Get media count
    const mediaCount = await prisma.media.count();
    
    return NextResponse.json({
      postCount,
      publishedPostCount,
      draftPostCount,
      mediaCount,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
} 