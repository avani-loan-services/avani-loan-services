# Upload CSVs to Google Drive (convert to Google Sheets)

1. Create a Google Cloud service account:
   - Go to Google Cloud Console → IAM & Admin → Service Accounts.
   - Create a service account and download the JSON key.
   - Enable the Google Drive API for the project (APIs & Services → Library → Drive API).

2. Share the target Drive folder with the service account:
   - Open the Drive folder in your browser.
   - Click "Share" and add the service account email (looks like `...@...gserviceaccount.com`) with Editor access.

3. Install Python dependencies:
```bash
python -m pip install --upgrade google-api-python-client google-auth google-auth-httplib2 google-auth-oauthlib
```

4. Run the uploader (example):
```bash
python scripts/upload_csvs_to_drive.py --creds /path/to/service-account.json --folder 18yJDS9904Rwk6GJVjfiQUcDzTr2IE58D
```
Add `--public` to allow anyone-with-link viewing.

5. What it does:
   - Finds CSV files by the glob `VAPI_Chats*.csv` in the repo root.
   - Uploads each CSV into the specified Drive folder and converts it to a Google Sheet.
   - Prints the Google Sheet URLs once created.

6. Alternatives:
   - If you prefer OAuth (personal account), use a different flow (not included here). The service-account pattern is easiest for automation.
