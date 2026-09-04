# Deployment Guide

## Prerequisites
1. Node.js v18 or later.
2. A valid Gemini API Key.
3. A Google Cloud Service Account JSON file.
4. A production server or PaaS (like Vercel, Render, or Railway).

## Steps for Production
1. **Install Dependencies**: Run `npm install`.
2. **Build the Application**: Run `npm run build`. This generates optimized static assets in the `dist` folder.
3. **Environment Setup**: Copy `.env.example` to `.env` and fill in all the required secrets.
4. **Start the Server**: The backend expects a Node environment. Run `npm start` (or `node src/server.cjs`) to serve both the Express API and the static React `dist` folder simultaneously.
