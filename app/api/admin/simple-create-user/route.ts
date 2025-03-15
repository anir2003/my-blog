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
    
    console.log("Creating admin user with email:", email);
    
    // Create user without the role field
    const hashedPassword = await bcrypt.hash('SahilGh@1908', 10);
    
    // Try to find if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      console.log("User already exists:", existingUser.id);
      return NextResponse.json({
        success: true,
        message: 'Admin user already exists',
        user: {
          id: existingUser.id,
          email: existingUser.email,
          name: existingUser.name
        }
      });
    }
    
    // Create user - without the role field
    const user = await prisma.user.create({
      data: {
        name: 'Anirdipta Ghosh',
        email: email,
        password: hashedPassword
      }
    });
    
    console.log("Admin user created successfully:", user.id);
    
    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error("Create user error:", error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to create admin user',
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
} 