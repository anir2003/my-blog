import { NextResponse } from 'next/server';
import { prisma as prisma } from '@/lib/prisma-export';
import bcrypt from 'bcrypt';

export async function GET() {
  try {
    console.log("Setup endpoint called");
    
    // First, check database connection by counting users
    const userCount = await prisma.user.count();
    console.log("Current user count:", userCount);
    
    // Check if admin user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'anirdipta2003@gmail.com' },
    });
    
    if (existingUser) {
      console.log("Admin user already exists with ID:", existingUser.id);
      return NextResponse.json({
        success: true,
        message: "Admin user already exists",
        userId: existingUser.id,
      });
    }
    
    // Create admin user
    console.log("Creating admin user...");
    const hashedPassword = await bcrypt.hash('SahilGh@1908', 10);
    
    const adminUser = await prisma.$transaction(async (tx) => {
      // Use the transaction client
      return tx.user.create({
        data: {
          name: 'Anirdipta Ghosh',
          email: 'anirdipta2003@gmail.com',
          password: hashedPassword,
          role: 'ADMIN',
        } as any, // Type assertion to bypass TypeScript error
      });
    });
    
    console.log("Admin user created successfully:", adminUser.id);
    
    return NextResponse.json({
      success: true,
      message: "Setup completed successfully",
      adminUser: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
      },
    });
  } catch (error) {
    console.error("Setup error:", error);
    
    return NextResponse.json({
      success: false,
      message: "Setup failed",
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
} 