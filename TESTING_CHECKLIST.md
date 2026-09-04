# Testing Checklist

- [ ] Ensure `.env` is populated with actual keys.
- [ ] **Eligibility Engine:** Navigate to `/eligibility`. Upload sample documents and hit submit. Ensure the response succeeds and displays EMI and Recommendations.
- [ ] **AI Assistant Button:** Click the bottom-right purple icon. Fill in test details and submit. Ensure the network logs a successful POST to `/api/crm/sync`.
- [ ] **WhatsApp Button:** Click the green icon. Fill out details and hit "Start Chat". Verify WhatsApp Web opens with the correctly formatted template message and UTM params.
- [ ] **Lighthouse:** Run Chrome DevTools Lighthouse audit in an Incognito window. Ensure scores are > 95 for Performance, Accessibility, Best Practices, and SEO.
