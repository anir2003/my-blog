import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bhzxlrmgrxyrrvijieki.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJoenhscm1ncnh5cnJ2aWppZWtpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3ODMxNTcsImV4cCI6MjA1NzM1OTE1N30.UBL9lQXWqhENKFgfDcfzZhpK0wyiX5b3ieVQ1ManzXQ';

// Create a single supabase client for interacting with your database
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase; 