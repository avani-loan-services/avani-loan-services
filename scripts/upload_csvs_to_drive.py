#!/usr/bin/env python3
"""
Upload CSV files matching a glob pattern to a Google Drive folder and convert to Google Sheets.

Usage:
  python scripts/upload_csvs_to_drive.py --creds /path/to/service-account.json --folder FOLDER_ID [--pattern "VAPI_Chats*.csv"] [--public]

Requirements:
  pip install --upgrade google-api-python-client google-auth google-auth-httplib2 google-auth-oauthlib

Notes:
  - Share the target Drive folder with the service account email before running.
  - The script converts uploaded CSVs into Google Sheets.
"""
import argparse
import glob
import os
import sys

from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

SCOPES = ['https://www.googleapis.com/auth/drive']

def upload_file(service, file_path, folder_id, make_public=False):
    file_name = os.path.basename(file_path)
    media = MediaFileUpload(file_path, mimetype='text/csv', resumable=True)
    body = {
        'name': file_name.rsplit('.', 1)[0],
        'parents': [folder_id],
        'mimeType': 'application/vnd.google-apps.spreadsheet'
    }
    created = service.files().create(body=body, media_body=media, fields='id').execute()
    file_id = created.get('id')
    sheet_url = f'https://docs.google.com/spreadsheets/d/{file_id}'
    print(f'Uploaded {file_name} -> {sheet_url}')
    if make_public:
        try:
            service.permissions().create(fileId=file_id, body={'type': 'anyone', 'role': 'reader'}).execute()
            print('Permission: anyone with the link can view')
        except Exception as e:
            print('Warning: failed to set public permission:', e)
    return file_id

def main():
    parser = argparse.ArgumentParser(description='Upload CSVs to Drive and convert to Google Sheets')
    parser.add_argument('--creds', required=True, help='Path to service account JSON credentials')
    parser.add_argument('--folder', required=True, help='Drive folder ID to upload into')
    parser.add_argument('--pattern', default='VAPI_Chats*.csv', help='Glob pattern for CSV files to upload')
    parser.add_argument('--public', action='store_true', help='Set uploaded sheets to anyone-with-link viewer')
    args = parser.parse_args()

    if not os.path.exists(args.creds):
        print('Credentials file not found:', args.creds)
        sys.exit(2)

    creds = Credentials.from_service_account_file(args.creds, scopes=SCOPES)
    service = build('drive', 'v3', credentials=creds)

    files = sorted(glob.glob(args.pattern))
    if not files:
        print(f'No files matched pattern: {args.pattern}')
        return
    for fpath in files:
        upload_file(service, fpath, args.folder, make_public=args.public)

if __name__ == '__main__':
    main()
