# Avani Loan Service: Deployment Reference Manual

This document contains key information for managing the hosting and automated updates for the Avani Loan Service platform.

## 1. Hosting & Automation Details
- **Provider**: Vercel (Production)
- **Live Preview URL**: [avani-loan-service-fy-26-27.vercel.app](https://avani-loan-service-fy-26-27.vercel.app)
- **Automation Method**: GitHub CI/CD (Linked to repository)
- **Vercel Project Name**: `avani-loan-service-fy-26-27`
- **GitHub Repository**: `avani-loan-services/avani-loan-services`

## 2. 'Auto Mode' (GitHub Sync)
The project is configured for **Auto Mode**. Every time you push changes to the GitHub repository:
1. Vercel automatically detects the update.
2. A new production build is generated.
3. The live site is updated within minutes.

### Manual Command Sync
The easiest way to update is using the new **Auto Mode** commands:

1. **Via NPM (Fastest)**:
   ```bash
   npm run deploy
   ```

2. **Via PowerShell Script**:
   ```powershell
   ./auto-deploy.ps1
   ```

*Note: If you see a 'token not valid' error, run `npx vercel login` first.*

## 3. Professional Production Domain
The production site is connected to the official custom domain: **`https://www.avanifinserv.com/`**.

| Type | Name | Value | 
| :--- | :--- | :--- | 
| **CNAME** | www | `cname.vercel-dns.com` |

## 4. Branding & Contact
- **Standardized Email**: `info@avanifinserv.com`
- **Branding Verification**: Footer, Contact Page, and Privacy Policy have been updated for a professional business presentation.

