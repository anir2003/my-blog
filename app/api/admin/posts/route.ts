import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/options';
import { prisma } from '@/lib/prisma.js';
import bcrypt from 'bcrypt';

export async function GET() {
  // Check authentication
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    // Get all posts, ordered by creation date (newest first)
    const posts = await prisma.post.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        title: true,
        slug: true,
        published: true,
        featured: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  // Check authentication
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.title || !data.content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }
    
    // Create a slug from the title if not provided
    if (!data.slug) {
      data.slug = data.title
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '-');
    }
    
    // Get user email from session
    const userEmail = session.user?.email;
    if (!userEmail) {
      return NextResponse.json({
        error: 'User email not found in session. Please log out and log in again.',
      }, { status: 400 });
    }
    
    console.log("Looking for user with email:", userEmail);
    
    // Try to find the user with exact email matching
    const user = await prisma.user.findUnique({
      where: {
        email: userEmail
      },
    });
    
    // If user not found with case-insensitive search, try direct lookup
    if (!user) {
      console.error(`User not found for email: ${userEmail}`);
      
      // Direct link to fix the issue
      const fixUrl = `/admin/fix-account`;
      
      return NextResponse.json({
        error: `User not found. Please <a href="${fixUrl}" target="_blank">click here to create your admin account</a>`,
        fixUrl: fixUrl
      }, { status: 404 });
    }
    
    console.log("Found user:", user.id);
    
    // Create the post
    const post = await prisma.post.create({
      data: {
        title: data.title,
        slug: data.slug,
        content: data.content,
        excerpt: data.excerpt || '',
        coverImage: data.coverImage || '',
        featured: data.featured || false,
        published: data.published || false,
        authorId: user.id,
      },
    });
    
    return NextResponse.json(post);
  } catch (error: any) {
    console.error('Error creating post:', error);
    
    // Handle duplicate slug error
    if (error.code === 'P2002' && error.meta?.target?.includes('slug')) {
      return NextResponse.json(
        { error: 'A post with this slug already exists' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create post: ' + (error.message || String(error)) },
      { status: 500 }
    );
  }
} 