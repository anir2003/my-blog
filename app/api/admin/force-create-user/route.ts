import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/options';

export async function GET() {
  try {
    // Get current session to use its email if available
    const session = await getServerSession(authOptions);
    const email = session?.user?.email || 'anirdipta2003@gmail.com';
    
    console.log("Force-creating admin user with email:", email);
    
    // Force-create admin user
    const hashedPassword = await bcrypt.hash('SahilGh@1908', 10);
    
    // First delete any existing user with this email to avoid constraints
    try {
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });
      
      if (existingUser) {
        // Delete existing user's posts first to avoid foreign key constraint issues
        await prisma.post.deleteMany({
          where: { authorId: existingUser.id }
        });
        
        // Then delete the user
        await prisma.user.delete({
          where: { id: existingUser.id }
        });
        
        console.log("Deleted existing user:", existingUser.id);
      }
    } catch (deleteError) {
      console.error("Error deleting existing user:", deleteError);
    }
    
    // Create fresh user
    const user = await prisma.user.create({
      data: {
        name: 'Anirdipta Ghosh',
        email: email,
        password: hashedPassword,
        role: 'ADMIN'
      } as any // Using type assertion to bypass TypeScript error
    });
    
    console.log("Admin user force-created successfully:", user.id);
    
    return NextResponse.json({
      success: true,
      message: 'Admin user force-created successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error("Force create user error:", error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to force-create admin user',
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
} 