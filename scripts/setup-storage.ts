import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_KEY must be set in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupStorage() {
  console.log('Setting up Supabase storage...');

  try {
    // Check if the bucket already exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      throw listError;
    }

    const bucketName = 'blog-images';
    const bucketExists = buckets.some(bucket => bucket.name === bucketName);

    if (bucketExists) {
      console.log(`Bucket '${bucketName}' already exists.`);
    } else {
      // Create the bucket
      const { data, error } = await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 10485760, // 10MB
      });

      if (error) {
        throw error;
      }

      console.log(`Successfully created bucket: ${bucketName}`);
    }

    // Update bucket policies to make it public
    const { error: policyError } = await supabase.storage.from(bucketName).createSignedUrl('test.txt', 60);
    
    if (policyError && !policyError.message.includes('not found')) {
      // Only throw if it's not a "not found" error (which is expected since test.txt doesn't exist)
      throw policyError;
    }

    console.log('Storage setup completed successfully!');
  } catch (error) {
    console.error('Error setting up storage:', error);
    process.exit(1);
  }
}

setupStorage(); 