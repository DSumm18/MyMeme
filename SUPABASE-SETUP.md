# MyMeme Supabase Project Setup

## Project Creation
1. Go to https://supabase.com/dashboard
2. Create a new project with the following details:
   - **Name:** mymeme
   - **Region:** eu-west-2 (London)
   - **Database Password:** Generate a strong, unique password
   - **Organization:** Select the appropriate organization

## Authentication Providers
Enable the following auth providers:
- Google
- Apple

## Database Migration
1. Open the SQL Editor in Supabase dashboard
2. Run the migration script: `supabase/migrations/001_initial_schema.sql`
   - This sets up user profiles, albums, and creations tables
   - Includes Row Level Security (RLS) policies
   - Adds an auto-profile creation trigger

## Storage Buckets
Create two storage buckets:
1. **"creations"**
   - Public access
   - For generated meme images/videos
2. **"originals"**
   - Private access
   - For user-uploaded source images

Run the policies from `supabase/storage-policies.sql` in the SQL Editor

## Environment Configuration
Copy the following from the Supabase project settings:
- Project URL (anon public key)
- Project API Key

Add these to:
- `.env.local` in the project
- Vercel Environment Variables

## Additional Setup
- Configure additional auth providers as needed
- Set up any additional database functions or triggers
- Review and adjust RLS policies as the app evolves

## Recommended Next Steps
- Test authentication flows
- Verify storage bucket permissions
- Set up local development environment with Supabase CLI