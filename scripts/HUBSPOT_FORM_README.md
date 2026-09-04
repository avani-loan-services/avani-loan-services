# HubSpot Form Creation (Auto)

This folder contains a small helper script to create a HubSpot embedded form for Avani Lead capture.

Steps
1. Obtain a HubSpot private app token with Forms write permissions (or use your legacy `hapikey`).
2. From your project root run:

```bash
# Using a private app token (recommended)
HUBSPOT_API_KEY=your_private_app_token node scripts/create_hubspot_form.js

# Or using legacy hapikey
HUBSPOT_HAPIKEY=your_hapikey node scripts/create_hubspot_form.js
```

3. The script will print the API response and the newly created form id (look for `guid`/`formId`).
4. Add the returned id to your project's `.env` file:

```
VITE_HUBSPOT_FORM_ID=the_returned_form_id
VITE_HUBSPOT_PORTAL_ID=244236573
```

5. Restart the dev server (`npm run dev`) or rebuild (`npm run build`) so `import.meta.env` picks up the new value.

Notes
- The script posts to HubSpot's Forms API (`/forms/v2/forms`). If HubSpot changes the API, you may need to update the script.
- The `HubspotLeadForm` component at `src/components/HubspotLeadForm.jsx` reads `VITE_HUBSPOT_FORM_ID` and `VITE_HUBSPOT_PORTAL_ID` at runtime.
- If you prefer, you can create the form manually in the HubSpot UI at the link you provided and then copy its id into the `.env`.
