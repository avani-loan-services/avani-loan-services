import { useEffect } from 'react';

export default function useSEO({ title, description, keywords, image }) {
  useEffect(() => {
    if (title) {
      document.title = `${title} | Avani Loan Services`;
    }

    const setMeta = (name, content) => {
      if (!content) return;
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = name;
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    const setProperty = (property, content) => {
      if (!content) return;
      let meta = document.querySelector(`meta[property="${property}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    const setCanonical = () => {
      const canonicalUrl = `https://www.avanifinserv.com${window.location.pathname}`;
      let link = document.querySelector('link[rel="canonical"]');
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', canonicalUrl);
    };

    setMeta('description', description);
    setMeta('keywords', keywords);
    setCanonical();

    const ogImage = image || 'https://www.avanifinserv.com/og/og-image.png';

    // Open Graph
    setProperty('og:title', title ? `${title} | Avani Loan Services` : 'Avani Loan Services');
    setProperty('og:description', description);
    setProperty('og:type', 'website');
    setProperty('og:url', `https://www.avanifinserv.com${window.location.pathname}`);
    setProperty('og:image', ogImage);

    // Twitter Card
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', title ? `${title} | Avani Loan Services` : 'Avani Loan Services');
    setMeta('twitter:description', description);
    setMeta('twitter:image', ogImage);

  }, [title, description, keywords, image]);
}
