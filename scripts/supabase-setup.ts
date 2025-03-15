import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';

// Replace with your Supabase credentials
const supabaseUrl = 'https://bhzxlrmgrxyrrvijieki.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJoenhscm1ncnh5cnJ2aWppZWtpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3ODMxNTcsImV4cCI6MjA1NzM1OTE1N30.UBL9lQXWqhENKFgfDcfzZhpK0wyiX5b3ieVQ1ManzXQ';

// Admin user credentials
const adminEmail = 'admin@example.com';
const adminPassword = 'admin123';
const adminName = 'Admin User';

// Initialize clients
const prisma = new PrismaClient();
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  try {
    console.log('Starting Supabase setup...');

    // 1. Push the Prisma schema to the database
    console.log('Running Prisma DB push to create tables...');
    // Note: This will work if DATABASE_URL in .env is set correctly
    // In a production setup, you'll likely need to run this separately
    
    // Create a storage bucket for images if it doesn't exist
    console.log('Creating blog-images storage bucket...');
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      const blogBucket = buckets?.find(bucket => bucket.name === 'blog-images');
      
      if (!blogBucket) {
        const { error } = await supabase.storage.createBucket('blog-images', {
          public: true, // Make files publicly accessible
        });
        
        if (error) {
          console.error('Error creating bucket:', error);
        } else {
          console.log('Successfully created blog-images bucket');
        }
      } else {
        console.log('blog-images bucket already exists');
      }
    } catch (error) {
      console.error('Error setting up storage bucket:', error);
    }
    
    // Create an admin user if one doesn't exist
    console.log('Creating admin user...');
    try {
      // Check if we already have an admin user
      const adminUser = await prisma.user.findUnique({
        where: { email: adminEmail }
      });
      
      if (!adminUser) {
        // Create a new admin user
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        
        await prisma.user.create({
          data: {
            email: adminEmail,
            name: adminName,
            password: hashedPassword,
            role: 'ADMIN',
          }
        });
        
        console.log('Admin user created in the database');
      } else {
        console.log('Admin user already exists in the database');
      }
    } catch (error) {
      console.error('Error creating admin user:', error);
    }
    
    // Create a sample blog post if none exist
    console.log('Creating sample blog post...');
    try {
      const postsCount = await prisma.post.count();
      
      if (postsCount === 0) {
        // Get the admin user
        const admin = await prisma.user.findUnique({
          where: { email: adminEmail }
        });
        
        if (admin) {
          await prisma.post.create({
            data: {
              title: 'Welcome to My Blog',
              slug: 'welcome-to-my-blog',
              content: '<h1>Welcome to My Blog!</h1><p>This is a sample blog post created by the setup script.</p><p>Edit or delete this post and start creating your own content!</p>',
              excerpt: 'This is a sample blog post created during setup.',
              coverImage: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d',
              published: true,
              featured: true,
              authorId: admin.id,
            }
          });
          
          console.log('Sample blog post created');
        }
      } else {
        console.log(`${postsCount} posts already exist, skipping sample post creation`);
      }
    } catch (error) {
      console.error('Error creating sample post:', error);
    }
    
    console.log('Supabase setup completed!');
    
  } catch (error) {
    console.error('Error during setup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch(console.error); 