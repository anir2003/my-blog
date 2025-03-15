# My Personal Blog with Supabase

A minimalist, dark-themed personal blog built with Next.js, Tailwind CSS, and Supabase, featuring an admin dashboard for content management.

## Features

- Clean, minimalist design with a dark theme
- Responsive layout for all device sizes
- Secure admin dashboard with Supabase authentication
- Rich text editor for creating and editing blog posts
- Supabase database (PostgreSQL) and storage for content and images
- Featured and new posts sections
- Dynamic routing for blog posts

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier works fine)

### Supabase Setup

1. Create a Supabase project at [https://supabase.com](https://supabase.com)
2. Get your project URL and API key from the API settings
3. Set up the PostgreSQL database:
   - Configure your database password and update it in `.env`
4. Create a storage bucket named `blog-images`:
   - Go to Storage in the Supabase dashboard
   - Create a new bucket called `blog-images`
   - Set the bucket to public access
5. Create a Supabase Auth user:
   - Either use the provided script `scripts/create-supabase-admin.ts`
   - Or create a user manually in the Supabase Auth dashboard

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd my-blog
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy the `.env.example` file to `.env`
   - Update the values with your Supabase credentials:
     ```
     DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_ID.supabase.co:5432/postgres"
     NEXTAUTH_SECRET="your-super-secret-key-for-nextauth"
     NEXTAUTH_URL="http://localhost:3004"
     SUPABASE_URL="https://YOUR_PROJECT_ID.supabase.co"
     SUPABASE_KEY="YOUR_SUPABASE_API_KEY"
     ```

4. Set up the database and initial data:
   ```bash
   npx prisma db push
   npx ts-node scripts/supabase-setup.ts
   ```

### Running the Application

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open your browser and navigate to:
   - Blog: [http://localhost:3004](http://localhost:3004)
   - Admin: [http://localhost:3004/admin/login](http://localhost:3004/admin/login)

## Admin Dashboard Usage

### Authentication

- You can log in using:
  - Supabase Auth credentials (if you've created a user in Supabase Auth)
  - Or the admin account: anirdipta2003@gmail.com / SahilGh@1908

### Creating Blog Posts

1. After logging in, click "Create Post" in the sidebar
2. Fill in:
   - Title: The headline of your blog post
   - Slug: Auto-generated from title, but you can customize it
   - Content: Write using the rich text editor
   - Excerpt: A short summary of your post
   - Cover Image: URL to a featured image or upload one
   - Featured/Published toggles

### Managing Images

When editing a post, you can upload images directly:
1. Click the image icon in the editor
2. Either paste an image URL or click "Upload Image"
3. Select an image from your computer
4. The image will be uploaded to Supabase Storage

## Deploying to Netlify

1. Push your code to GitHub
2. Connect your repository to Netlify
3. Set the build command: `npx prisma generate && next build`
4. Set the publish directory: `.next`
5. Add your environment variables in the Netlify dashboard
6. Deploy your site!

## Troubleshooting

If you encounter issues:

1. **Database Connection**: Check if your Supabase database password is correct in `.env`
2. **Image Uploads**: Make sure your `blog-images` bucket exists and has public access
3. **Authentication**: Verify your Supabase API key and URL are correct

## Technologies Used

- Next.js 15+
- React 18
- Prisma with PostgreSQL
- Supabase (Auth, Storage, Database)
- NextAuth.js for authentication integration
- TipTap for rich text editing
- Tailwind CSS for styling

## Deployment

This is a Next.js project, so it can be easily deployed on Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/my-blog)

For production deployment, make sure to:
1. Update the `NEXTAUTH_SECRET` with a strong, unique value
2. Set the `NEXTAUTH_URL` to your production URL
You can also deploy to other platforms that support Next.js applications, such as Netlify, AWS Amplify, or a traditional server setup.
