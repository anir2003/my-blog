import { createClient } from '@supabase/supabase-js';

// Replace these with your Supabase credentials
const supabaseUrl = 'https://bhzxlrmgrxyrrvijieki.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJoenhscm1ncnh5cnJ2aWppZWtpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3ODMxNTcsImV4cCI6MjA1NzM1OTE1N30.UBL9lQXWqhENKFgfDcfzZhpK0wyiX5b3ieVQ1ManzXQ';

// Replace these with your desired admin credentials
const adminEmail = process.argv[2] || 'anirdipta2003@gmail.com';
const adminPassword = process.argv[3] || 'SahilGh@1908';
const adminName = process.argv[4] || 'Admin User';

async function createSupabaseAdmin() {
  // Create a supabase client
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  console.log(`Creating Supabase admin user: ${adminEmail}`);
  
  try {
    // Try to sign in with the email to check if the user exists
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: 'random-password-to-check-existence', // We just want to check if the user exists
    });
    
    // If the error is "Invalid login credentials", it means the user exists
    // but the password is wrong, otherwise, the user doesn't exist
    if (!signInError || signInError.message !== 'Invalid login credentials') {
      if (!signInError) {
        console.log(`User with email ${adminEmail} already exists and password matched.`);
        return;
      } else if (signInError.message !== 'Invalid login credentials') {
        console.log(`User with email ${adminEmail} may already exist: ${signInError.message}`);
        return;
      }
    }
    
    // Create the user in Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: adminEmail,
      password: adminPassword,
      options: {
        data: {
          name: adminName,
          role: 'ADMIN',
        },
      },
    });
    
    if (error) {
      console.error('Error creating admin user:', error);
      return;
    }
    
    console.log('Admin user created successfully in Supabase Auth!');
    console.log('User details:', {
      id: data.user?.id,
      email: data.user?.email,
      name: adminName,
      role: 'ADMIN',
    });
    
    // Important: In a production scenario, you should also store the user in your database
    // and set the correct role there. This example only creates the user in Supabase Auth.
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

createSupabaseAdmin()
  .catch(console.error); 