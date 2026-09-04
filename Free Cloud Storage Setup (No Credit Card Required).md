# Free Cloud Storage Setup (No Credit Card Required)

I see you hit the `[OR_BACR2_44]` error in Google Cloud. This happens when Google declines the payment method during billing setup.

To bypass this completely, we will use **Supabase Storage**. It gives you a generous free tier and **does not require a credit card** to get started!

Please follow these quick steps:

## Step 1: Create a Supabase Account & Project
1. Go to [Supabase.com](https://supabase.com/) and click **Start your project**.
2. Sign in using GitHub or your email.
3. Click **New Project** and select your organization.
4. **Name**: `avani-loan-storage`
5. **Database Password**: Generate a secure password (we won't really use this, but it's required).
6. **Region**: Choose the one closest to you (e.g., `South Asia (Mumbai)`).
7. Click **Create new project**. *(It may take 1-2 minutes for the project to provision).*

## Step 2: Create a Storage Bucket
1. Once your project is ready, click on **Storage** in the left-hand menu.
2. Click **New Bucket**.
3. **Name**: `eligibility-docs`
4. **Public Bucket**: Turn this toggle **ON** (this allows the generated Excel report to include working links).
5. Click **Save**.

## Step 3: Get Your Credentials
1. In the left-hand menu, click on the **Settings** gear icon (at the very bottom).
2. Click on **API** under the Configuration section.
3. You need to copy two things from this page:
   - Your **Project URL**
   - Your **Project API Key** (the one labeled `anon` `public`).

## Step 4: Add Credentials to Vercel
1. Go to your [Vercel Dashboard](https://vercel.com/dashboard) and open the `avani-loan-service-fy-26-27` project.
2. Go to **Settings > Environment Variables**.
3. Add the following new variables:
   
   - **Key**: `VITE_SUPABASE_URL`
     **Value**: `[Paste your Project URL here]`

   - **Key**: `VITE_SUPABASE_ANON_KEY`
     **Value**: `[Paste your anon public API Key here]`

4. Click **Save**.

---

### You're Done!
Once you have added these two variables to Vercel, reply to me saying **"Supabase is ready"** and I will rewrite the code to upload directly to Supabase, completely bypassing Vercel's payload limits!
