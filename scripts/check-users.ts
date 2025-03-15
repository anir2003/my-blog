import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Checking users in database...');
    
    const users = await prisma.user.findMany();
    
    if (users.length === 0) {
      console.log('No users found in the database!');
    } else {
      console.log(`Found ${users.length} users:`);
      users.forEach(user => {
        console.log(`- ID: ${user.id}`);
        console.log(`  Name: ${user.name}`);
        console.log(`  Email: ${user.email}`);
        console.log(`  Password hash length: ${user.password.length}`);
        console.log(`  Created at: ${user.createdAt}`);
      });
    }
  } catch (error) {
    console.error('Error checking users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  }); 