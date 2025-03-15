import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/options';
import { prisma } from '@/lib/prisma.js';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  // Check authentication
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const { id } = params;
    
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        images: true,
      },
    });
    
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    
    return NextResponse.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  // Check authentication
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const { id } = params;
    const data = await request.json();
    
    // Check if the post exists and belongs to the user
    const post = await prisma.post.findUnique({
      where: { id },
      include: { author: true },
    });
    
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    
    // If slug is being updated, check if the new slug is already in use
    if (data.slug && data.slug !== post.slug) {
      const existingPost = await prisma.post.findUnique({
        where: { slug: data.slug },
      });
      
      if (existingPost && existingPost.id !== id) {
        return NextResponse.json(
          { error: 'A post with this slug already exists' },
          { status: 400 }
        );
      }
    }
    
    // Update the post
    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        title: data.title !== undefined ? data.title : undefined,
        slug: data.slug !== undefined ? data.slug : undefined,
        content: data.content !== undefined ? data.content : undefined,
        excerpt: data.excerpt !== undefined ? data.excerpt : undefined,
        coverImage: data.coverImage !== undefined ? data.coverImage : undefined,
        featured: data.featured !== undefined ? data.featured : undefined,
        published: data.published !== undefined ? data.published : undefined,
      },
    });
    
    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  // Check authentication
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const { id } = params;
    
    // Check if the post exists
    const post = await prisma.post.findUnique({
      where: { id },
      include: { author: true },
    });
    
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    
    // Delete related media
    await prisma.media.deleteMany({
      where: { postId: id },
    });
    
    // Delete the post
    await prisma.post.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    );
  }
} 