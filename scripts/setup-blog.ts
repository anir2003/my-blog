import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const databaseUrl = process.env.DATABASE_URL;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_KEY must be set in .env file');
  process.exit(1);
}

if (!databaseUrl) {
  console.error('Error: DATABASE_URL must be set in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const prisma = new PrismaClient();

// Default admin credentials
const adminEmail = 'anirdipta2003@gmail.com';
const adminPassword = 'SahilGh@1908';
const adminName = 'Admin User';

async function setupStorage() {
  console.log('\n📦 Setting up Supabase storage...');

  try {
    // Check if the bucket already exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      throw listError;
    }

    const bucketName = 'blog-images';
    const bucketExists = buckets.some(bucket => bucket.name === bucketName);

    if (bucketExists) {
      console.log(`✅ Bucket '${bucketName}' already exists.`);
    } else {
      // Create the bucket
      const { data, error } = await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 10485760, // 10MB
      });

      if (error) {
        throw error;
      }

      console.log(`✅ Successfully created bucket: ${bucketName}`);
    }

    console.log('✅ Storage setup completed successfully!');
  } catch (error) {
    console.error('❌ Error setting up storage:', error);
    throw error;
  }
}

async function setupDatabase() {
  console.log('\n🗄️ Setting up database...');
  
  try {
    // Push the Prisma schema to the database
    console.log('Pushing Prisma schema to database...');
    await prisma.$executeRaw`SELECT 1`;
    console.log('✅ Database connection successful!');
    
    // Create tables using Prisma
    console.log('Creating database tables...');
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT NOT NULL,
        "name" TEXT,
        "email" TEXT NOT NULL,
        "password" TEXT NOT NULL,
        "role" TEXT NOT NULL DEFAULT 'USER',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        
        CONSTRAINT "User_pkey" PRIMARY KEY ("id")
      );
      
      CREATE TABLE IF NOT EXISTS "Post" (
        "id" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "slug" TEXT NOT NULL,
        "content" TEXT NOT NULL,
        "excerpt" TEXT,
        "coverImage" TEXT,
        "featured" BOOLEAN NOT NULL DEFAULT false,
        "published" BOOLEAN NOT NULL DEFAULT false,
        "authorId" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        
        CONSTRAINT "Post_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
      );
      
      CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
      CREATE UNIQUE INDEX IF NOT EXISTS "Post_slug_key" ON "Post"("slug");
    `);
    
    console.log('✅ Database tables created successfully!');
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    throw error;
  }
}

async function createAdminUser() {
  console.log('\n👤 Setting up admin user...');
  
  try {
    // Check if admin user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail }
    });
    
    if (existingUser) {
      console.log('✅ Admin user already exists.');
      return;
    }
    
    // Create admin user
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: adminName,
        password: hashedPassword,
        role: 'ADMIN'
      }
    });
    
    console.log('✅ Admin user created successfully!');
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    throw error;
  }
}

async function createSamplePost() {
  console.log('\n📝 Setting up sample blog post...');
  
  try {
    // Check if any posts exist
    const postCount = await prisma.post.count();
    
    if (postCount > 0) {
      console.log('✅ Blog posts already exist, skipping sample post creation.');
      return;
    }
    
    // Get the admin user
    const admin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });
    
    if (!admin) {
      throw new Error('Admin user not found. Please create an admin user first.');
    }
    
    // Create a sample post
    await prisma.post.create({
      data: {
        id: 'sample-' + Date.now().toString(),
        title: 'Welcome to My Blog',
        slug: 'welcome-to-my-blog',
        content: `
          <h1>Welcome to My Blog!</h1>
          <p>This is your first blog post. You can edit or delete it from the admin dashboard.</p>
          <p>Here are some things you can do next:</p>
          <ul>
            <li>Customize your blog's appearance</li>
            <li>Write more blog posts</li>
            <li>Set up your newsletter</li>
            <li>Share your blog on social media</li>
          </ul>
          <p>Happy blogging!</p>
        `,
        excerpt: 'Welcome to my blog! This is a sample post to help you get started.',
        coverImage: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=1920&auto=format&fit=crop',
        featured: true,
        published: true,
        authorId: admin.id,
      }
    });
    
    console.log('✅ Sample blog post created successfully!');
  } catch (error) {
    console.error('❌ Error creating sample post:', error);
    throw error;
  }
}

async function setupBlog() {
  console.log('🚀 Starting blog setup...');
  
  try {
    await setupDatabase();
    await setupStorage();
    await createAdminUser();
    await createSamplePost();
    
    console.log('\n✨ Blog setup completed successfully! ✨');
    console.log('\nYou can now:');
    console.log('1. Start the development server: npm run dev');
    console.log('2. Access your blog at: http://localhost:3004');
    console.log('3. Log in to the admin dashboard at: http://localhost:3004/admin/login');
    console.log('   - Email: admin@example.com');
    console.log('   - Password: admin123');
  } catch (error) {
    console.error('\n❌ Blog setup failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

setupBlog();