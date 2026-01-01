# Supabase Backend Setup Guide

This guide will help you set up Supabase as the backend for SmartRoster Pro, enabling multi-device access and cloud data sync.

## Step 1: Create a Supabase Account

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" and sign up with GitHub, Google, or email
3. Free tier includes:
   - 500MB database storage
   - 1GB file storage
   - 50,000 monthly active users
   - Unlimited API requests

## Step 2: Create a New Project

1. Click "New Project" in your Supabase dashboard
2. Fill in the details:
   - **Name**: SmartRoster Pro (or any name you prefer)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your location
3. Click "Create new project"
4. Wait 1-2 minutes for the project to initialize

## Step 3: Set Up the Database Schema

1. In your Supabase project dashboard, click on the **SQL Editor** tab (left sidebar)
2. Click "New query"
3. Copy the entire contents of `supabase_schema.sql` (in this project folder)
4. Paste it into the SQL editor
5. Click "Run" or press `Ctrl+Enter`
6. You should see "Success. No rows returned" - this means the tables were created successfully

## Step 4: Get Your API Credentials

1. Go to **Project Settings** (gear icon in left sidebar)
2. Click on **API** in the settings menu
3. You'll see two important values:
   - **Project URL**: Something like `https://xxxxxxxxxxxxx.supabase.co`
   - **anon/public key**: A long string starting with `eyJ...`
4. Keep this page open - you'll need these values next

## Step 5: Configure Environment Variables

1. In your project folder, create a file called `.env.local`
2. Copy the contents from `.env.example`
3. Replace the placeholder values:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Google Gemini AI API (for OCR)
VITE_GEMINI_API_KEY=your_existing_gemini_key
```

4. Save the file

## Step 6: Enable Email Authentication (Optional)

By default, Supabase requires email confirmation. To disable this for faster testing:

1. Go to **Authentication** → **Providers** in Supabase dashboard
2. Click on **Email**
3. Scroll down to "Confirm email"
4. Toggle OFF "Enable email confirmations"
5. Click "Save"

**Note**: For production, keep email confirmation enabled for security.

## Step 7: Test the Application

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open the app in your browser
3. You should see the login screen
4. Click "Don't have an account? Sign up"
5. Create an account with your email and password (min 6 characters)
6. Sign in

## Step 8: Verify Data Sync

1. After signing in, upload a schedule or create some tasks
2. Open the app on a different device or browser
3. Sign in with the same credentials
4. You should see the same data - it's syncing!

## Step 9: Deploy to Vercel (Production)

When deploying to Vercel, add the environment variables:

1. Go to your Vercel project settings
2. Click **Environment Variables**
3. Add these variables:
   - `VITE_SUPABASE_URL`: Your project URL
   - `VITE_SUPABASE_ANON_KEY`: Your anon key
   - `VITE_GEMINI_API_KEY`: Your Gemini API key (or use `GEMINI_API_KEY` for server-side)

## Troubleshooting

### "Not authenticated" error
- Make sure you're signed in
- Check that your environment variables are correct
- Try signing out and back in

### Data not syncing across devices
- Verify you're using the same account on both devices
- Check browser console for errors
- Ensure you have internet connection

### Database errors
- Verify the SQL schema was run successfully
- Check that Row Level Security policies are enabled
- Make sure your anon key is correct

### Email confirmation issues
- Check your spam folder for verification emails
- Or disable email confirmation (see Step 6)
- Use a real email address (some free services may block Supabase emails)

## Security Notes

1. **Never commit `.env.local` to Git** - it contains secrets!
2. The anon key is safe to use in client-side code
3. Row Level Security (RLS) ensures users can only access their own data
4. Use strong passwords (12+ characters with mix of letters, numbers, symbols)
5. For production, enable email confirmation

## What You Get

✅ **Multi-device access** - Work from computer, phone, or tablet
✅ **Automatic cloud backup** - Data is never lost
✅ **Real-time sync** - Changes appear instantly across devices
✅ **Secure authentication** - Each user has their own isolated data
✅ **Unlimited devices** - Sign in from as many devices as you need

## Need Help?

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord Community](https://discord.supabase.com)
- Check the browser console for error messages
