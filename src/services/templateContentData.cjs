// src/services/templateContentData.cjs
// ─────────────────────────────────────────────────────────────────
// AVANI LOAN SERVICES — High-Fidelity Knowledge Base for 10 Products
// ─────────────────────────────────────────────────────────────────

const { BUSINESS_IDENTITY } = require('../config/businessIdentity.cjs');

const PRODUCT_KNOWLEDGE = {
  personal_loan: {
    code: 'PERSONAL',
    name: 'Personal Loan',
    audience: 'Salaried Professionals, Working Professionals, Self-Employed',
    loanRange: '₹1 Lakh to ₹40 Lakhs',
    tenureRange: '12 to 60 Months',
    awareness: [
      {
        topic: 'Salary to EMI Ratio (FOIR)',
        hook: 'Ever wondered why loan applications get delayed or reduced?',
        content: 'Banks assess your Fixed Obligation to Income Ratio (FOIR). Keeping your existing EMIs under 50% of your net in-hand salary significantly improves your eligibility. At Avani Loan Services, we calculate your FOIR across multiple lenders before applying.',
        myth: 'Applying to 10 banks at once guarantees getting at least one loan.',
        fact: 'Multiple simultaneous hard inquiries lower your CIBIL score. Consulting an advisory firm like Avani Loan Services gives you a single pre-assessment without multiple hard hits.'
      },
      {
        topic: 'Personal Loan vs Credit Card Rollover',
        hook: 'Paying credit card minimum dues every month?',
        content: 'Credit card rollover charges can range from 36% to 42% annually. A structured personal loan from a scheduled bank or reputed NBFC starts at competitive rates, allowing you to consolidate high-cost debt into a single predictable monthly EMI.',
        myth: 'You cannot take a personal loan if you already have an ongoing home loan.',
        fact: 'As long as your net income supports the combined FOIR, a home loan with clean repayment history actually shows creditworthiness.'
      },
      {
        topic: 'Documentation for Salaried Employees',
        hook: 'Keep these 4 document sets ready for 24-48 hour personal loan processing.',
        content: '1) PAN & Aadhaar (e-KYC verified), 2) Last 3 months payslips, 3) Last 6 months salary account statement in original PDF, 4) Company ID card. Avani Loan Services helps you package your profile for swift underwriting.',
        myth: 'Salary paid in cash can qualify for normal bank personal loans.',
        fact: 'Mainstream banking partners require salary credited directly into a registered bank account supported by bank statements.'
      }
    ],
    videoConcepts: [
      {
        hookMr: 'पगार चांगला आहे, पण इमर्जन्सीसाठी पर्सनल लोन वेळेवर मिळत नाहीये?',
        problemMr: 'अचानक मेडिकल खर्च, लग्नकार्य किंवा घराचे नूतनीकरण आले की कागदपत्रांमध्ये वेळ वाया जातो.',
        explanationMr: 'पर्सनल लोनसाठी बँकेची योग्य निवड, सॅलरी स्लिप्स आणि FOIR रेशो अचूक असणे गरजेचे असते. अवनी लोन सर्व्हिसेस तुमचे प्रोफाइल तपासून योग्य बँक पर्याय सुचवते.',
        ctaMr: 'तुमची पर्सनल लोन एलिजिबिलिटी तपासण्यासाठी आजच खालील लिंकवर संपर्क करा.',
        hookEn: 'Got a good salary but struggling to find the right personal loan terms?',
        problemEn: 'Multiple inquiries hurt your credit score and banks have varying FOIR guidelines.',
        explanationEn: 'Avani Loan Services evaluates your profile across top banking partners, ensuring transparent comparisons without multiple credit hits.',
        ctaEn: 'Connect with Sachin Shinde at Avani Loan Services today.',
        bRoll: 'Salaried professional reviewing payslips on laptop in a modern office, calculator on desk.',
        duration: '35 sec'
      }
    ]
  },

  business_loan: {
    code: 'BUSINESS',
    name: 'Business Loan',
    audience: 'Business Owners, MSMEs, SMEs, Manufacturers, Traders',
    loanRange: '₹5 Lakhs to ₹2 Crores',
    tenureRange: '12 to 60 Months',
    awareness: [
      {
        topic: 'Working Capital vs Term Loan',
        hook: 'Is your business growing faster than your operating cash flow?',
        content: 'A working capital loan helps you bridge receivables cycles, purchase bulk inventory for seasonal demand, and maintain vendor credit without diluting equity. Avani Loan Services analyzes your GST turnover and banking credits to find suitable collateral-free limits.',
        myth: 'You must provide residential or commercial property for any business loan.',
        fact: 'Unsecured business loans up to ₹2 Crores are available for eligible enterprises with 2-3 years vintage and clean banking turnover.'
      },
      {
        topic: 'The Power of Average Banking Balance (ABB)',
        hook: 'Why do banking credits matter more than just profit on paper?',
        content: 'Underwriters look closely at regular deposits, cheque bounce instances, and month-end balances. A clean current account banking record is often the primary qualifying metric for business funding.',
        myth: 'Only businesses with ₹10 Crore turnover get bank financing.',
        fact: 'MSMEs with annual turnover from ₹25 Lakhs upwards can access tailored business loans.'
      }
    ],
    videoConcepts: [
      {
        hookMr: 'व्यवसाय वाढवायचा आहे, पण वर्किंग कॅपिटल किंवा स्टॉकसाठी निधी कमी पडतोय?',
        problemMr: 'मोठ्या ऑर्डर्स हातात असताना वेळेवर भांडवल नसेल तर व्यवसायाची संधी हुकते.',
        explanationMr: 'जीएसटी रिटर्न्स, बँकिंग टर्नओव्हर आणि बिझनेस व्हिंटेजच्या आधारे अनसिक्युअर्ड बिझनेस लोन उपलब्ध होऊ शकते. अवनी लोन सर्व्हिसेस योग्य मार्गदर्शन करते.',
        ctaMr: 'तुमच्या बिझनेस लोनसाठी आजच व्हॉट्सअॅपवर अवनी लोन सर्व्हिसेसशी संपर्क करा.',
        hookEn: 'Have big orders in hand but short on working capital?',
        problemEn: 'Cash flow bottlenecks shouldn’t stop your enterprise from expanding.',
        explanationEn: 'Avani Loan Services assists MSMEs and traders in securing structured business loans based on clean GST and banking turnover.',
        ctaEn: 'Message Avani Loan Services on WhatsApp for expert advisory.',
        bRoll: 'Business owner walking through an orderly warehouse with tablet, shaking hands with financial advisor.',
        duration: '40 sec'
      }
    ]
  },

  doctor_loan: {
    code: 'DOCTOR',
    name: 'Doctor Loan',
    audience: 'Doctors, Medical Specialists, Clinic & Hospital Owners, CAs',
    loanRange: '₹10 Lakhs to ₹1 Crore',
    tenureRange: '12 to 84 Months',
    awareness: [
      {
        topic: 'Special Schemes for Medical Practitioners',
        hook: 'Are you planning to upgrade ultrasound, laser, or diagnostic equipment at your clinic?',
        content: 'Doctors and CAs qualify for customized collateral-free professional loans. With basic registration documents (MBBS/MD/BAMS/BHMS or COP for CAs), institutional lenders offer competitive pricing and flexible moratorium periods.',
        myth: 'Doctor loans require heavy balance sheets like large corporations.',
        fact: 'Lenders evaluate medical qualification vintage and clinic footfall rather than complex manufacturing ratios.'
      }
    ],
    videoConcepts: [
      {
        hookMr: 'डॉक्टर साहेब, स्वतःचे क्लिनिक अपग्रेड किंवा नवीन वैद्यकीय उपकरणे खरेदी करायची आहेत?',
        problemMr: 'नवीन मशिनरी किंवा हॉस्पिटल विस्तारासाठी वेळेत आणि सोप्या अटींवर भांडवल हवे आहे का?',
        explanationMr: 'अवनी लोन सर्व्हिसेस डॉक्टर आणि मेडिकल प्रोफेशनल्ससाठी विशेष कोलेटरल-फ्री लोन सुविधा उपलब्ध करून देते.',
        ctaMr: 'अधिक माहितीसाठी आजच अवनी लोन सर्व्हिसेस लातूर येथे संपर्क करा.',
        hookEn: 'Upgrading diagnostic equipment or expanding your healthcare practice?',
        problemEn: 'Standard commercial loan underwriting doesn’t account for your specialized medical vintage.',
        explanationEn: 'Avani Loan Services provides specialized Doctor Loans with customized limits and minimal documentation.',
        ctaEn: 'Schedule a confidential consultation with Sachin Shinde today.',
        bRoll: 'Doctor in white coat reviewing digital medical scans in modern clinic, transitioning to consultation room.',
        duration: '35 sec'
      }
    ]
  },

  home_loan: {
    code: 'HOME',
    name: 'Home Loan',
    audience: 'Property Buyers, Salaried, Business Owners, First-Time Buyers',
    loanRange: '₹15 Lakhs to ₹5 Crores',
    tenureRange: 'Up to 30 Years',
    awareness: [
      {
        topic: 'Home Loan Pre-Approval & Sanction Letters',
        hook: 'Should you finalize the property first or check your home loan eligibility first?',
        content: 'Getting a pre-approved eligibility check helps you negotiate with builders confidently, understand your down payment budget, and avoid losing token booking amounts due to unexpected loan rejection.',
        myth: 'Lowest advertised interest rate is guaranteed for all applicants.',
        fact: 'Actual interest rate depends on your CIBIL score (750+ gets best slabs), loan-to-value (LTV), and property approvals.'
      }
    ],
    videoConcepts: [
      {
        hookMr: 'स्वतःच्या घराचे स्वप्न पूर्ण करायचं आहे, पण होम लोनचे व्याजदर आणि ईएमआय कसा ठरवायचा?',
        problemMr: 'विविध बँकांचे नियम आणि कागदपत्रे समजून घेण्यात खूप गोंधळ होतो.',
        explanationMr: 'अवनी लोन सर्व्हिसेस तुम्हाला विविध बँकांचे व्याजदर, टेन्युअर आणि आवश्यक कागदपत्रांची तुलना करून योग्य पर्याय देते.',
        ctaMr: 'तुमची होम लोन पात्रता तपासण्यासाठी आजच आम्हाला मेसेज करा.',
        hookEn: 'Ready to buy your dream home? Don’t let paperwork hold you back.',
        problemEn: 'Comparing Home Loan ROI, processing fees, and LTV across banks can be overwhelming.',
        explanationEn: 'Avani Loan Services provides end-to-end guidance from legal search to sanction and disbursement.',
        ctaEn: 'Click below to check your home loan eligibility with Avani Loan Services.',
        bRoll: 'Happy Indian family entering their newly constructed home, keys being handed over, architectural plans on table.',
        duration: '40 sec'
      }
    ]
  },

  mortgage_loan: {
    code: 'MORTGAGE',
    name: 'Mortgage Loan / Loan Against Property',
    audience: 'Property Owners, Businessmen, Self-Employed Individuals',
    loanRange: '₹20 Lakhs to ₹10 Crores',
    tenureRange: 'Up to 15 Years',
    awareness: [
      {
        topic: 'Unlocking Liquidity from Residential or Commercial Real Estate',
        hook: 'Why keep high-interest unsecured debt when you own freehold property?',
        content: 'A Loan Against Property (LAP) allows you to raise significant capital at much lower interest rates than unsecured business or personal loans. You can use funds for business expansion, child’s foreign education, or debt restructuring.',
        myth: 'The bank takes ownership of your property while the loan is active.',
        fact: 'You retain full ownership, possession, and rental rights of your property. Only an equitable mortgage lien is registered during the tenure.'
      }
    ],
    videoConcepts: [
      {
        hookMr: 'तुमच्या घराचे किंवा व्यावसायिक जागेचे मूल्य ओळखून मोठा निधी उभा करायचा आहे का?',
        problemMr: 'बिझनेस विस्तार किंवा इतर गरजांसाठी मोठी रक्कम कमी व्याजदरावर हवी असते.',
        explanationMr: 'मॉर्गिज लोन (Loan Against Property) द्वारे तुम्ही तुमच्या जागेवर १५ वर्षांपर्यंतच्या कालावधीसाठी कमी ईएमआयवर कर्ज घेऊ शकता.',
        ctaMr: 'प्रॉपर्टी लोन सल्ल्यासाठी अवनी लोन सर्व्हिसेसशी आजच चर्चा करा.',
        hookEn: 'Unlock the true market value of your property with a Mortgage Loan.',
        problemEn: 'Need large-ticket funding at lower EMI interest rates?',
        explanationEn: 'Avani Loan Services structures Loan Against Property across prime residential and commercial real estate.',
        ctaEn: 'Connect with Sachin Shinde for dedicated property valuation advisory.',
        bRoll: 'Close up of architectural drawings, commercial building facade, financial documents with clean stamps.',
        duration: '35 sec'
      }
    ]
  },

  education_loan_india: {
    code: 'EDU-INDIA',
    name: 'Education Loan — India',
    audience: 'Students, Parents, Aspiring Higher Education Candidates',
    loanRange: '₹4 Lakhs to ₹50 Lakhs',
    tenureRange: 'Course Duration + Up to 15 Years Moratorium',
    awareness: [
      {
        topic: 'Tax Benefits Under Section 80E',
        hook: 'Did you know the interest paid on education loans is 100% tax-deductible without an upper cap?',
        content: 'Under Section 80E of the Income Tax Act, the interest paid on an education loan for higher studies can be claimed as a deduction for up to 8 continuous years, significantly reducing the effective borrowing cost for parents or self-paying students.',
        myth: 'Repayment starts immediately from the first month of college.',
        fact: 'Education loans include a moratorium period covering the course duration plus 6 to 12 months after graduation.'
      }
    ],
    videoConcepts: [
      {
        hookMr: 'मुलांच्या उच्च शिक्षणासाठी देशातील नामांकित कॉलेजमध्ये ऍडमिशन झाले आहे?',
        problemMr: 'कॉलेज फी, हॉस्टेल आणि इतर खर्चांसाठी योग्य आर्थिक नियोजन वेळेत झाले पाहिजे.',
        explanationMr: 'अवनी लोन सर्व्हिसेस भारतातील नामांकित संस्थांसाठी शिक्षण कर्जाची सोय करते. सोप्या अटी आणि मोरेटोरियम कालावधी उपलब्ध.',
        ctaMr: 'आजच आमच्या शिक्षण कर्ज सल्लागारांशी संपर्क साधा.',
        hookEn: 'Secured admission in a premier Indian university?',
        problemEn: 'Managing semester fees, hostel charges, and laptop costs requires structured education financing.',
        explanationEn: 'Avani Loan Services assists parents and students with hassle-free Education Loans with flexible moratorium periods.',
        ctaEn: 'Talk to an Avani Education Loan advisor today.',
        bRoll: 'Proud student in college campus holding admission letter, parent sitting beside smiling in consultation room.',
        duration: '40 sec'
      }
    ]
  },

  education_loan_global: {
    code: 'EDU-GLOBAL',
    name: 'Education Loan — Global Studies',
    audience: 'Overseas Study Aspirants, Parents, Graduate Candidates',
    loanRange: '₹20 Lakhs to ₹1.5 Crores',
    tenureRange: 'Up to 15 Years',
    awareness: [
      {
        topic: 'Pre-Visa Sanction Letters for USA, UK, Canada & Europe',
        hook: 'Need proof of funds to receive your I-20 or student visa approval?',
        content: 'Embassies and foreign universities require verified financial capacity before issuing visa clearance. Avani Loan Services works with specialized lending institutions that issue pre-visa conditional sanction letters covering 100% of tuition and living expenses.',
        myth: 'Study abroad loans always require immovable property collateral.',
        fact: 'Non-collateral education loans up to ₹50-75 Lakhs are possible for STEM and top-tier global university programs.'
      }
    ],
    videoConcepts: [
      {
        hookMr: 'अमेरिकेत, युके किंवा कॅनडामध्ये उच्च शिक्षणासाठी जायचे स्वप्न आहे का?',
        problemMr: 'परदेशातील ट्युशन फी आणि व्हिसासाठी फंड्स दाखवणे सर्वात मोठी अडचण ठरते का?',
        explanationMr: 'अवनी लोन सर्व्हिसेस ग्लोबल एज्युकेशन लोनसाठी प्री-व्हिसा सँक्शन लेटर आणि सोप्या अटींवर कर्ज मिळवून देण्यासाठी मार्गदर्शन करते.',
        ctaMr: 'ग्लोबल स्टडीज लोन सल्ल्यासाठी आजच अवनी लोन सर्व्हिसेसशी संपर्क करा.',
        hookEn: 'Planning overseas education in the US, UK, Canada or Australia?',
        problemEn: 'Visa documentation requires ironclad proof of tuition and living funds.',
        explanationEn: 'Avani Loan Services provides expert advisory for Global Education Loans with pre-visa sanction letters.',
        ctaEn: 'Book your study abroad funding consultation with Sachin Shinde.',
        bRoll: 'Airplane taking off, student with backpack walking past university clock tower, passport and university admit letter on desk.',
        duration: '40 sec'
      }
    ]
  },

  school_funding: {
    code: 'SCHOOL',
    name: 'School Funding',
    audience: 'School Owners, Educational Trusts, Management Committees',
    loanRange: '₹50 Lakhs to ₹10 Crores',
    tenureRange: '3 to 10 Years',
    awareness: [
      {
        topic: 'Upgrading School Infrastructure & Smart Classrooms',
        hook: 'Is your educational trust planning to add a new CBSE wing or STEM robotics lab?',
        content: 'Private schools and educational trusts face unique cash flow cycles based on annual fee collections. Institutional project finance provides structured disbursements aligned with construction milestones and campus development.',
        myth: 'Educational trusts cannot avail commercial bank loans.',
        fact: 'Registered societies and trusts with positive student enrolment growth and audited 3-year accounts are eligible for institutional project financing.'
      }
    ],
    videoConcepts: [
      {
        hookMr: 'शाळेची नवीन इमारत, डिजिटल क्लासरूम किंवा क्रीडा संकुल उभारण्याचे नियोजन आहे का?',
        problemMr: 'शैक्षणिक संस्थांसाठी मोठा प्रकल्प निधी मिळवणे क्लिष्ट वाटू शकते.',
        explanationMr: 'अवनी लोन सर्व्हिसेस शाळा आणि शैक्षणिक संस्थांसाठी विशेष संस्थात्मक प्रकल्प कर्ज मार्गदर्शन उपलब्ध करून देते.',
        ctaMr: 'अधिक माहितीसाठी आजच सचिन शिंदे यांच्याशी संपर्क साधा.',
        hookEn: 'Expanding your school campus with modern smart classrooms and laboratories?',
        problemEn: 'Trust funding requires specialized banking underwriting aligned with fee cycles.',
        explanationEn: 'Avani Loan Services structures customized institutional project finance for K-12 private and trust-run schools.',
        ctaEn: 'Request our Institutional School Funding brochure today.',
        bRoll: 'Drone shot of well-maintained school campus, children in science lab, trustees discussing blueprints with financial consultant.',
        duration: '45 sec'
      }
    ]
  },

  college_funding: {
    code: 'COLLEGE',
    name: 'College Funding',
    audience: 'College Management, University Trustees, Higher Education Groups',
    loanRange: '₹1 Crore to ₹25 Crores',
    tenureRange: '5 to 15 Years',
    awareness: [
      {
        topic: 'Campus Expansion, NAAC Accreditation & Medical/Engineering Equipment',
        hook: 'Does your higher education institution require structured capital for multi-crore infrastructure?',
        content: 'Modern engineering, medical, pharmacy, and management colleges need continuous capital for hostel construction, hospital attachments, and research labs. We assist management committees in presenting bankable institutional proposals to consortium lenders.',
        myth: 'Bank loans for colleges require 100% cash margins.',
        fact: 'Institutional loans are collateralized primarily by the institutional land, building, and escrowed tuition fee cash flows.'
      }
    ],
    videoConcepts: [
      {
        hookMr: 'कॉलेज कॅम्पस विस्तार, हॉस्टेल बांधकाम किंवा आधुनिक लॅबसाठी संस्थात्मक निधी आवश्यक आहे?',
        problemMr: 'मोठ्या संस्थात्मक प्रकल्पांसाठी योग्य बँकिंग पार्टनर निवडणे आव्हानात्मक असते.',
        explanationMr: 'अवनी लोन सर्व्हिसेस कॉलेज आणि युनिव्हर्सिटी मॅनेजमेंटसाठी दीर्घ मुदतीचे संस्थात्मक कर्ज उभारणीत सल्लागार म्हणून काम करते.',
        ctaMr: 'संस्थात्मक लोन सल्ल्यासाठी अवनी लोन सर्व्हिसेसशी बैठक निश्चित करा.',
        hookEn: 'Scaling your college campus with new hostel blocks, advanced labs, and research wings?',
        problemEn: 'Institutional project funding requires precise financial modelling and cash flow escrow structuring.',
        explanationEn: 'Avani Loan Services works directly with college management and university trusts for long-term project debt.',
        ctaEn: 'Schedule an institutional consultation with Sachin Shinde.',
        bRoll: 'College campus building facade, lecture hall filled with students, senior administrators reviewing development masterplan.',
        duration: '45 sec'
      }
    ]
  },

  cibil_consultation: {
    code: 'CIBIL',
    name: 'CIBIL Improvement Consultation',
    audience: 'Applicants with Credit Concerns, Existing Borrowers, Future Loan Planners',
    loanRange: 'Consultation & Advisory',
    tenureRange: 'N/A',
    awareness: [
      {
        topic: 'Understanding Credit Report Disputes & Overdue Clean-up',
        hook: 'Has a past technical dispute or delayed EMI impacted your loan eligibility?',
        content: 'Your CIBIL report reflects your financial track record across all banks. Misreported balances, unclosed credit cards, or high credit utilization (above 30%) can drag down your score. Avani Loan Services provides objective credit report analysis and responsible restoration advice.',
        myth: 'Any agency can legally pay to increase your CIBIL score overnight by 100 points.',
        fact: 'No genuine agency can manipulate credit bureau data. Sustainable CIBIL improvement happens by correcting erroneous bureau entries, clearing genuine overdues, and maintaining disciplined payment cycles.'
      }
    ],
    videoConcepts: [
      {
        hookMr: 'सिबिल स्कोअर कमी असल्याने लोन मिळण्यात अडचण येतेय का?',
        problemMr: 'क्रेडिट रिपोर्टमधील जुने वाद किंवा चुकीच्या नोंदींमुळे चांगल्या ऑफर्स नाकारल्या जातात.',
        explanationMr: 'अवनी लोन सर्व्हिसेस तुमच्या सिबिल रिपोर्टचे बारकाईने विश्लेषण करून स्कोअर सुधारण्यासाठी कायदेशीर आणि जबाबदार मार्गदर्शनाची दिशा दाखवते.',
        ctaMr: 'मोफत सिबिल सल्लामसलतीसाठी आजच व्हॉट्सअॅपवर संपर्क करा.',
        hookEn: 'Is a low CIBIL score stopping you from getting the best loan interest rates?',
        problemEn: 'Incorrect entries or high credit card utilization can quietly lower your score.',
        explanationEn: 'Avani Loan Services provides ethical credit report analysis to help you understand your profile and systematically rebuild eligibility.',
        ctaEn: 'Connect with our credit advisory team for a preliminary report review.',
        bRoll: 'Person looking at credit score gauge on screen moving from orange to green, advisor pointing out item on printout, relaxed handshake.',
        duration: '35 sec'
      }
    ]
  }
};

module.exports = {
  PRODUCT_KNOWLEDGE
};
