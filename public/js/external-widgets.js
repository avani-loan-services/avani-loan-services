// public/js/external-widgets.js
// Externalized initialization for Google Analytics 4, HubSpot Forms, and Vapi Voice Widget.
// Keeps executable scripts out of inline HTML blocks for least-privilege CSP compatibility.
(function initExternalWidgets() {
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = window.gtag || gtag;
  window.gtag('js', new Date());
  window.gtag('config', 'G-R1ZR27W09W');

  function mountWidgets() {
    if (window.hbspt && window.hbspt.forms && document.getElementById('hubspot-form')) {
      window.hbspt.forms.create({
        portalId: '244236573',
        formId: 'edde042c-3451-420a-a472-6a5c42cbdf98',
        target: '#hubspot-form'
      });
    }

    if (window.vapiSDK && typeof window.vapiSDK.run === 'function') {
      window.vapiSDK.run({
        apiKey: '006036f2-b1ee-44de-9abd-117cb4298681',
        assistant: '9f322737-3bb8-467a-95e3-7a66f9a93dc1',
        config: {
          position: 'bottom-right',
          theme: {
            primary: '#111827',
            secondary: '#ffffff'
          }
        }
      });
    }
  }

  if (document.readyState === 'complete') {
    mountWidgets();
  } else {
    window.addEventListener('load', mountWidgets, { once: true });
  }
})();
