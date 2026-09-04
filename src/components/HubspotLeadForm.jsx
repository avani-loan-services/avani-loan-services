import { useEffect } from 'react';
import './HubspotLeadForm.css';

export default function HubspotLeadForm() {
  useEffect(() => {
    const scriptId = 'hs-form-script';

    // Read HubSpot configuration from Vite env vars (expose using VITE_ prefix)
    const region = import.meta.env.VITE_HUBSPOT_REGION || 'na1';
    const portalId = import.meta.env.VITE_HUBSPOT_PORTAL_ID || '244236573';
    const formId = import.meta.env.VITE_HUBSPOT_FORM_ID || 'YOURHUBSPOTFORM_ID';

    // Load HubSpot forms script once
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.src = 'https://js.hsforms.net/forms/embed/v2.js';
      script.type = 'text/javascript';
      script.async = true;
      script.id = scriptId;
      script.onload = () => {
        if (window.hbspt) {
          window.hbspt.forms.create({
            region,
            portalId,
            formId,
            target: '#hubspot-lead-form',
          });
        }
      };
      document.body.appendChild(script);
    } else {
      if (window.hbspt) {
        const existingTarget = document.querySelector('#hubspot-lead-form');
        if (existingTarget && existingTarget.childElementCount === 0) {
          window.hbspt.forms.create({
            region,
            portalId,
            formId,
            target: '#hubspot-lead-form',
          });
        }
      }
    }
  }, []);

  return (
    <div className="hubspot-form-wrapper">
      <div className="hubspot-form-header">
        <h3 className="hubspot-form-title">Get Free Loan Consultation</h3>
      </div>
      <div id="hubspot-lead-form"></div>
      <p className="hubspot-form-note">✅ 100% Free. No spam. Advisor calls in 5 minutes.</p>
    </div>
  );
}
