function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export default function generateMarathiContent(service = {}) {
  const h1 = service.h1 || service.title || 'सेवा';
  const titleMap = {
    'Salary Loan': 'वेतन कर्ज',
    'Business Loan': 'व्यवसाय कर्ज',
    'Education Loan': 'शिक्षण कर्ज',
    'Home Loan': 'गृह कर्ज',
    'Mortgage / LAP': 'मॉर्गेज / जमीन-विरुद्ध कर्ज'
  };
  const mrH1 = (titleMap[h1] || (`${h1} — सेवा`));

  const parts = [];
  parts.push(`<p>अवानी लोन सर्व्हिसेस कडून ${escapeHtml(mrH1)} — लातूरमधील स्थानिक ग्राहकांसाठी जलद आणि विश्वसनीय कर्ज सेवा. आम्ही कागदपत्रे, अर्ज प्रक्रियेचे मार्गदर्शन आणि लवकर निर्णय मिळवून देतो.</p>`);
  parts.push('<h2>आम्हाला का निवडावे?</h2>');
  parts.push('<ul>');
  parts.push('<li>लातूर आणि महाराष्ट्रातील स्थानिक अनुभव</li>');
  parts.push('<li>कमी कागदपत्रे आणि जलद मंजुरी</li>');
  parts.push('<li>स्पष्ट फी आणि लवचिक ईएमआय योजना</li>');
  parts.push('</ul>');

  parts.push('<h2>प्रक्रिया कशी चालते</h2>');
  parts.push('<ol>');
  parts.push('<li>मुक्त पात्रता तपासणी</li>');
  parts.push('<li>कागदपत्र जमा करणे आणि पडताळणी</li>');
  parts.push('<li>अर्ज सादर करणे आणि अन्वेषण/केवायसी प्रक्रिया</li>');
  parts.push('<li>आवश्यक असल्यास मूल्यांकन आणि अंतिम मंजुरी</li>');
  parts.push('<li>रक्कम हस्तांतरण</li>');
  parts.push('</ol>');

  parts.push('<h3>सामान्य आवश्यक कागदपत्रे</h3>');
  parts.push('<ul>');
  parts.push('<li>ओळख पत्र: आधार, PAN किंवा पासपोर्ट</li>');
  parts.push('<li>पत्ता पुरावा: आधार/युटिलिटी बिल</li>');
  parts.push('<li>उत्पन्न पुरावा: पगार पर्च्या/बँक स्टेटमेंट/आयटीआर</li>');
  parts.push('</ul>');

  parts.push('<h3>लातूरमध्ये स्थानिक मदत</h3>');
  parts.push('<p>आम्ही स्थानिक कागदपत्रे, मूल्यांकन, आणि बँकांशी संवादामध्ये मदत करतो ज्यामुळे मंजुरीची वेळ कमी होते.</p>');

  parts.push('<h3>सामान्य प्रश्न</h3>');
  parts.push('<div>');
  parts.push('<strong>प्र.:</strong> कर्ज किती लवकर मिळू शकते?<br/><strong>उत्तर:</strong> कागदपत्रे पुरी झाल्यावर अनेक उत्पादने 24-72 तासांत मंजूर होऊ शकतात.');
  parts.push('<br/><br/><strong>प्र.:</strong> आपण कागदपत्रांची मदत करता का?<br/><strong>उत्तर:</strong> होय, आम्ही कागदपत्रे तपासून आवश्यक सुधारणा सुचवतो आणि अर्ज सादर करण्यात मदत करतो.');
  parts.push('</div>');

  parts.push('<h3>आता अर्ज करा</h3>');
  parts.push('<p>मुक्त सल्ल्यासाठी +91-9175635165 वर कॉल करा किंवा <a href="/contact">ऑनलाइन अर्ज</a> करा — आमचे स्थानिक सल्लागार आपल्याला मार्गदर्शन करतील.</p>');

  return parts.join('\n\n');
}
