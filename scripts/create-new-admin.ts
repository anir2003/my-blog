import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@example.com';
  const password = 'admin123'; // Simple password that's easy to remember
  const name = 'Admin User';
  
  try {
    // Delete any existing users with this email to ensure we can create it
    console.log(`Deleting any existing user with email: ${email}`);
    await prisma.user.deleteMany({
      where: { email },
    });
    
    // Create hashed password
    console.log('Creating hashed password...');
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log(`Password hashed successfully (length: ${hashedPassword.length})`);
    
    // Create the new admin user
    console.log(`Creating new admin user: ${email}`);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });
    
    console.log('-----------------------------------');
    console.log('🎉 Admin user created successfully!');
    console.log('-----------------------------------');
    console.log('Login with these credentials:');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log('-----------------------------------');
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 