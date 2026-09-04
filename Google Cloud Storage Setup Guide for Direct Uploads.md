# Google Cloud Storage Setup Guide for Direct Uploads

Since you are already using the Google Sheets API for your application, **Google Cloud Storage (GCS)** is the perfect choice! You can use the exact same Service Account JSON you are already using. 

Follow these exact steps to create the storage bucket, configure it to allow direct uploads from your website, and link it to Vercel.

## Step 1: Create the Storage Bucket

1. Go to the [Google Cloud Console - Cloud Storage Buckets](https://console.cloud.google.com/storage/browser).
2. Ensure you are in the same project where you created your Google Sheets API credentials.
3. Click **CREATE** (or "Create Bucket").
4. **Name your bucket**: Choose a unique name (e.g., `avani-loan-eligibility-docs`). Note this down, you will need it later.
5. **Location type**: Choose **Region** and pick the one closest to your users (e.g., `asia-south1` for Mumbai).
6. **Storage class**: Choose **Standard**.
7. **Access control**: 
   - *Crucial Step*: Ensure **"Enforce public access prevention on this bucket"** is **CHECKED** (you don't want these sensitive documents to be public).
   - Choose **Uniform** access control.
8. Click **CREATE**.

## Step 2: Grant Your Service Account Access to the Bucket

Since you already have a Service Account JSON for Google Sheets, we need to give that exact same account permission to upload files to this new bucket.

1. In the Google Cloud Console, go to **IAM & Admin > IAM**.
2. Find the Service Account email address you are using for Google Sheets (it usually ends in `...gserviceaccount.com`).
3. Click the **Edit** pencil icon next to that account.
4. Click **ADD ANOTHER ROLE**.
5. Select the role: **Cloud Storage > Storage Object Admin**.
6. Click **SAVE**.

> [!TIP]
> If you don't already have the JSON key for this service account, go to **IAM & Admin > Service Accounts**, click the email, go to the **Keys** tab, click **Add Key > Create New Key > JSON**, and download it.

## Step 3: Configure CORS (Cross-Origin Resource Sharing)

Because your website (`www.avanifinserv.com`) needs to upload files directly to Google's servers, Google requires explicit permission for your website's domain to interact with the bucket.

1. Open the [Google Cloud Shell](https://console.cloud.google.com/?cloudshell=true) (the terminal icon `>_` in the top right of the Google Cloud Console).
2. In the terminal that opens at the bottom, type the following command to create a `cors.json` file:
   ```bash
   echo '[{"origin": ["https://www.avanifinserv.com", "https://avani-loan-service-fy-26-27.vercel.app", "http://localhost:5173"], "method": ["GET", "PUT", "POST", "OPTIONS"], "responseHeader": ["Content-Type", "Access-Control-Allow-Origin"], "maxAgeSeconds": 3600}]' > cors.json
   ```
3. Apply this configuration to your bucket by running this command (Replace `YOUR_BUCKET_NAME` with the exact name of the bucket you created in Step 1):
   ```bash
   gcloud storage buckets update gs://YOUR_BUCKET_NAME --cors-file=cors.json
   ```

## Step 4: Add Credentials to Vercel

Finally, we need to tell Vercel what your bucket name is, and ensure it has the Google credentials.

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard) and open the `avani-loan-service-fy-26-27` project.
2. Go to **Settings > Environment Variables**.
3. Add the following new variables:
   
   - **Key**: `GCS_BUCKET_NAME`
     **Value**: `[The name of the bucket you created in Step 1]`

   - **Key**: `GOOGLE_SERVICE_ACCOUNT_JSON`
     **Value**: `[Paste the ENTIRE contents of your Google Service Account JSON file here]` 
     *(Note: If you already added this for Google Sheets, you just need to make sure it's correct).*

4. Click **Save**.

---

### You're Done!
Once you have completed these steps, reply to me saying **"Bucket is ready"** and I will immediately rewrite the code to upload your 12 large PDFs directly to Google Cloud Storage!
