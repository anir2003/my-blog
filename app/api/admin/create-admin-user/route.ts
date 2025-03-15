import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';

export async function GET() {
  try {
    console.log("Create admin user endpoint called");
    
    // Check if the admin user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'anirdipta2003@gmail.com' }
    });
    
    if (existingUser) {
      console.log("Admin user already exists:", existingUser.id);
      return NextResponse.json({ 
        message: 'Admin user already exists',
        userId: existingUser.id 
      });
    }
    
    // Create the admin user using Prisma client (works with SQLite)
    const hashedPassword = await bcrypt.hash('SahilGh@1908', 10);
    
    // Using type assertion to bypass TypeScript error
    const user = await prisma.user.create({
      data: {
        name: 'Anirdipta Ghosh',
        email: 'anirdipta2003@gmail.com',
        password: hashedPassword,
        // @ts-ignore - The schema has this field but TypeScript doesn't recognize it
        role: 'ADMIN'
      } as any
    });
    
    console.log("Admin user created successfully:", user.id);
    
    return NextResponse.json({
      message: 'Admin user created successfully',
      user
    });
  } catch (error) {
    console.error('Error creating admin user:', error);
    return NextResponse.json({ 
      error: 'Failed to create admin user',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 