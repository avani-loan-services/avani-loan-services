# Fix Supabase Upload Error (Row Level Security)

I have identified the exact cause of the error! Your Supabase bucket is successfully connected, but by default, Supabase blocks uploads for security reasons (Row Level Security) until you explicitly allow them. 

Since you are uploading directly from the frontend (to bypass Vercel's size limits), you need to add a policy allowing anonymous uploads to the `eligibility-docs` bucket.

### Quick Fix (Takes 30 seconds)

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Open your `avani-loan-storage` project.
3. In the left-hand menu, click on **SQL Editor** (it looks like a `>_` icon).
4. Click **New Query**.
5. **Copy and paste** the following SQL code into the editor:

```sql
-- Allow anyone to upload files to the eligibility-docs bucket
CREATE POLICY "Allow public uploads"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'eligibility-docs');
```

6. Click the green **Run** button at the bottom right.
7. You should see a "Success" message.

That's it! Once you run this SQL command, your website form will immediately start working and allow you to upload all 12 large PDFs without any errors. Please go ahead, run the code, and test your form again!
