import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

// Initialize Prisma Client
const prisma = new PrismaClient();

/**
 * Script to migrate data from SQLite to Supabase PostgreSQL
 * 
 * Usage:
 * 1. Update your .env file with your Supabase PostgreSQL URL
 * 2. Run: npx ts-node scripts/migrate-to-supabase.ts
 */
async function main() {
  try {
    console.log('Starting migration to Supabase...');
    
    // Run migrations
    console.log('Setting up Supabase database schema...');
    // This will create all the tables based on your Prisma schema
    
    // Option 1: Migrate existing users
    console.log('Migrating users...');
    const users = await prisma.user.findMany();
    
    if (users.length > 0) {
      console.log(`Found ${users.length} users to migrate`);
      
      // Re-create users (you might need to handle this differently if you have many users)
      for (const user of users) {
        await prisma.user.create({
          data: {
            id: user.id,
            name: user.name, 
            email: user.email,
            password: user.password, // The password is already hashed
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
        });
      }
      console.log('Users migrated successfully');
    } else {
      console.log('No users found to migrate');
    }
    
    // Option 2: Migrate posts
    console.log('Migrating posts...');
    const posts = await prisma.post.findMany({
      include: {
        author: true,
      },
    });
    
    if (posts.length > 0) {
      console.log(`Found ${posts.length} posts to migrate`);
      
      for (const post of posts) {
        await prisma.post.create({
          data: {
            id: post.id,
            title: post.title,
            slug: post.slug,
            content: post.content,
            excerpt: post.excerpt || '',
            coverImage: post.coverImage || '',
            featured: post.featured || false,
            published: post.published || false,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
            authorId: post.authorId,
          },
        });
      }
      console.log('Posts migrated successfully');
    } else {
      console.log('No posts found to migrate');
    }
    
    // Option 3: Migrate media
    console.log('Migrating media...');
    const media = await prisma.media.findMany();
    
    if (media.length > 0) {
      console.log(`Found ${media.length} media items to migrate`);
      
      for (const item of media) {
        await prisma.media.create({
          data: {
            id: item.id,
            url: item.url,
            filename: item.filename,
            mimeType: item.mimeType,
            size: item.size,
            postId: item.postId,
            createdAt: item.createdAt,
          },
        });
      }
      console.log('Media migrated successfully');
    } else {
      console.log('No media found to migrate');
    }
    
    console.log('Migration completed successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 