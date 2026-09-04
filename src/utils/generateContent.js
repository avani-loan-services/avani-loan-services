function sentenceJoin(paragraphs) {
  return paragraphs.join('\n\n');
}

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export default function generateLongContent(service = {}) {
  const kws = (service.keywords || []).join(', ');
  const h1 = service.h1 || service.title || 'Service';
  const intro = [];
  intro.push(`${h1} from Avani Loan Services: Fast, local, and tailored for customers in Latur and nearby areas. We specialize in providing transparent, competitively priced ${kws || 'loan products'} with fast processing and friendly support.`);
  intro.push(`Our team guides you through the application, documentation, and disbursal steps so you spend less time on paperwork and more time on what matters. Whether you need funds for routine expenses, business growth, education, or buying a home, our ${h1.toLowerCase()} solutions are designed to fit diverse needs.`);
  intro.push(`This page provides everything you need to know about ${h1.toLowerCase()} — eligibility, documentation, expected timelines, common fees, and tips to improve approval chances. Use the contact details at the end to get a free eligibility check.`);

  const why = [];
  why.push('<h2>Why Choose Avani Loan Services?</h2>');
  why.push('<ul>');
  why.push('<li>Local expertise in Latur and Maharashtra — we understand local documentation and lender relationships.</li>');
  why.push('<li>Quick approvals and fast disbursal when eligibility is met.</li>');
  why.push('<li>Transparent fees and clear EMI options.</li>');
  why.push('<li>End-to-end assistance: application, valuation (if required), and follow-up.</li>');
  why.push('<li>Comparison of offers from multiple lenders to secure the best possible terms.</li>');
  why.push('</ul>');

  const process = [];
  process.push('<h2>How the Process Works</h2>');
  process.push('<ol>');
  process.push('<li>Free consultation: we do a quick eligibility check and suggest the most suitable loan types and lenders.</li>');
  process.push('<li>Document collection: we provide a checklist and help you collect and verify documents.</li>');
  process.push('<li>Application submission: we submit the application to selected lenders and follow up on verification.</li>');
  process.push('<li>Approval & offer: lenders issue an in-principle approval and a term sheet; we compare offers with you.</li>');
  process.push('<li>Disbursal & support: after acceptance and final checks, funds are disbursed; we remain available for any post-disbursal support.</li>');
  process.push('</ol>');

  const eligibility = [];
  eligibility.push('<h3>Typical Eligibility</h3>');
  eligibility.push('<ul>');
  eligibility.push('<li>Minimum age: 21 years. Maximum age depends on product and lender.</li>');
  eligibility.push('<li>Stable income or business track record as required by the selected product.</li>');
  eligibility.push('<li>Acceptable credit history — lenders evaluate credit score, repayment behaviour, and outstanding liabilities.</li>');
  eligibility.push('</ul>');

  const documents = [];
  documents.push('<h3>Common Documents Required</h3>');
  documents.push('<ul>');
  documents.push('<li>Identity proof: Aadhaar, PAN, or Passport.</li>');
  documents.push('<li>Address proof: Aadhaar, utility bill, or driving licence.</li>');
  documents.push('<li>Income proof: salary slips, Form-16, ITR or bank statements depending on the loan type.</li>');
  documents.push('<li>Property papers when applicable (for LAP / Home Loans).</li>');
  documents.push('</ul>');

  const local = [];
  local.push('<h3>Local Support in Latur</h3>');
  local.push('We provide local support in Latur: in-person help where required, assistance with valuations, and lenders who are familiar with the region’s property and business landscape. This local knowledge helps speed up approvals and reduces surprises in documentation.');

  const benefits = [];
  benefits.push('<h3>Benefits</h3>');
  benefits.push('<ul>');
  benefits.push('<li>Faster decision-making with local assistance.</li>');
  benefits.push('<li>Personalized EMI plans and loan structures.</li>');
  benefits.push('<li>Access to multiple lenders enabling competitive offers.</li>');
  benefits.push('</ul>');

  const caseStudy = [];
  caseStudy.push('<h3>Case Study: Quick Salary Loan Disbursal</h3>');
  caseStudy.push('<p>Client: Mr. X, salaried professional in Latur. Requirement: ₹3 Lakh for urgent home repair. Outcome: Eligibility verified, documents uploaded, lender approved within 48 hours, funds disbursed within 72 hours. Key factors: clean salary records, bank statements, and quick local KYC.</p>');

  const costs = [];
  costs.push('<h3>Costs & Fees</h3>');
  costs.push('<p>Typical fees include processing fees (0.5%–2.5%), valuation charges (for property loans), and minimal administrative charges. Interest rates vary by product and credit profile; we compare multiple lenders to find the most cost-effective option.</p>');

  const repaymentTips = [];
  repaymentTips.push('<h3>Repayment Tips</h3>');
  repaymentTips.push('<ul>');
  repaymentTips.push('<li>Choose tenure that balances EMI affordability and total interest paid.</li>');
  repaymentTips.push('<li>Set up auto-debit for EMIs to maintain a clean repayment history.</li>');
  repaymentTips.push('<li>Consider partial prepayment if you have surplus funds — check lender prepayment charges first.</li>');
  repaymentTips.push('</ul>');

  const compare = [];
  compare.push('<h3>Comparing Loan Options</h3>');
  compare.push('<p>We evaluate loan offers on interest rate, processing fees, prepayment charges, tenor flexibility and lender reliability. For secured loans like LAP or Home Loans, property valuation and tenure play a major role in determining the final offer.</p>');

  const faqs = [];
  faqs.push('<h3>Frequently Asked Questions</h3>');
  faqs.push('<div>');
  faqs.push('<strong>Q:</strong> How quickly can I get the loan?');
  faqs.push('<br/><strong>A:</strong> Typical timelines vary by product and documentation. Many salary and small business loans can be approved within 24-72 hours once all documents are submitted.');
  faqs.push('<br/><br/><strong>Q:</strong> Will you help with paperwork?');
  faqs.push('<br/><strong>A:</strong> Yes — our team helps you gather, verify and submit the required documents to reduce delays.');
  faqs.push('<br/><br/><strong>Q:</strong> Do you charge hidden fees?');
  faqs.push('<br/><strong>A:</strong> No. We provide a clear breakdown of fees and EMIs before you sign.');
  faqs.push('<br/><br/><strong>Q:</strong> Can I prepay my loan?');
  faqs.push('<br/><strong>A:</strong> Prepayment terms depend on the lender; we will explain the terms and any charges during offer stage.');
  faqs.push('</div>');

  const cta = [];
  cta.push('<h3>Ready to apply?</h3>');
  cta.push(`<p>Contact Avani Loan Services in Latur for a free consultation and a tailored ${h1.toLowerCase()} quote. Call us at +91-9175635165 or <a href="/contact">apply online</a> — our team will evaluate your case and suggest the best lenders and terms.</p>`);

  const parts = [
    `<p>${escapeHtml(intro.join(' '))}</p>`,
    why.join('\n'),
    process.join('\n'),
    eligibility.join('\n'),
    documents.join('\n'),
    local.join('\n'),
    benefits.join('\n'),
    caseStudy.join('\n'),
    costs.join('\n'),
    repaymentTips.join('\n'),
    compare.join('\n'),
    faqs.join('\n'),
    cta.join('\n')
  ];

  return parts.join('\n\n');
}
