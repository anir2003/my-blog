import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/options';
import { prisma as prisma } from '@/lib/prisma-export';

export async function GET() {
  try {
    // Get current session
    const session = await getServerSession(authOptions);
    
    // Debug information
    const debugInfo = {
      session: session,
      hasSession: !!session,
      email: session?.user?.email,
      userId: session?.user?.id,
    };
    
    // Check if user exists in database
    let userExists = false;
    let userDetails = null;
    
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });
      
      userExists = !!user;
      if (user) {
        userDetails = {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      }
    }
    
    // Count total users in database
    const totalUsers = await prisma.user.count();
    
    return NextResponse.json({
      debugInfo,
      userExists,
      userDetails,
      totalUsers,
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Error debugging session',
      details: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
} 