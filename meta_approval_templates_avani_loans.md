# Meta WhatsApp API Template Approval & Multi-Channel Sequence Documentation
**Company:** Avani Loan Services Latur  
**Contact:** +91-9175635165  
**WhatsApp Link:** `wa.me/9175635165`  
**Google Business Profile:** [Avani Loan Services Latur](https://www.google.com/search?kgmid=/g/11f103qvkv)  

---

## 📋 Overview & Meta Approval Submission Rules

When submitting message templates to **Meta Business Manager (WhatsApp Business API)**, Meta enforces strict syntax and categorization guidelines. Templates that do not follow these standard rules are subject to rejection.

### Meta Approval Field Standards

| Field Name | Rules & Constraints |
| :--- | :--- |
| **Template Name** | Must be lowercase, numbers, and underscores only (e.g., `avani_retail_day1_ack`). No spaces or special characters. Max 512 characters. |
| **Category** | Must select one of: **UTILITY** (Transactional / Post-inquiry updates), **MARKETING** (Promotional / Lead nurturing), or **AUTHENTICATION** (OTPs). *Note: Nurturing sequences are best submitted under `UTILITY` or `MARKETING` based on account status.* |
| **Language** | Select exact language code, e.g., `English (US)` (`en_US`) or `English (UK)` (`en_UK`). |
| **Header (Optional)** | Options: `TEXT` (Max 60 chars), `IMAGE`, `DOCUMENT`, `VIDEO`, or `NONE`. |
| **Body Text** | Main message content. Max 1,024 characters. Variables must be enclosed in double curly braces `{{1}}`, `{{2}}`, etc. |
| **Footer (Optional)** | Short secondary text. Max 60 characters. |
| **Buttons (Optional)** | **Call to Action**: Phone Number (`+919175635165`) or Website URL (`https://wa.me/9175635165`). <br>**Quick Reply**: Custom text buttons (e.g., "Share Details", "Call Us"). |
| **Sample Values** | Meta **requires** sample text for all variables (e.g., `{{1}}` = *Rahul Sharma*) to verify intent. |

---

## 🛠️ Step-by-Step Meta Submission Form Template

Below is the standard configuration schema for submitting any template to Meta Business Manager:

```yaml
Template Name: <lowercase_underscore_name>
Category: UTILITY | MARKETING
Language: English (US) [en_US]
Header Type: None | Text | Header Media

Body Text (Meta Format with Variables):
"Hello {{1}}! ..."

Sample Values:
- {{1}}: <Sample Value 1>
- {{2}}: <Sample Value 2>

Footer Text: Avani Loan Services Latur | 9175635165
Buttons:
  - Type: PHONE_NUMBER | URL | QUICK_REPLY
    Text: "Call Now" / "Chat on WhatsApp"
    Value: "+919175635165"
```

---

# 🟢 SECTION 1: Standard Retail & Commercial Loans
*(Personal, Home, Business, & Mortgage Loans)*

---

### 📱 Day 1: Instant Acknowledgment & Data Capture

#### 1. Meta WhatsApp API Submission Format (Official Approval Details)

> [!NOTE]
> **Template Name:** `avani_retail_day1_ack`  
> **Category:** `UTILITY`  
> **Language:** `English (US) (en_US)`  
> **Header Type:** `None`

* **Body Text (Meta Format with Variables):**
  ```text
  Hello! Thank you for reaching out to Avani Loan Services Latur. We have received your inquiry. Whether you need a Personal, Home, Business, or Mortgage Loan, we offer competitive rates and customized financial solutions.

  To help us assign the right expert to your case, please reply with these details:
  - Name: {{1}}
  - City/Location: {{2}}
  - Loan Type: {{3}} (Personal / Home / Business / Mortgage)
  - Required Amount (₹): {{4}}

  Our team will review your eligibility and call you back immediately. You can also reach us directly at 9175635165.
  ```

* **Variable Sample Values for Meta Review:**
  * `{{1}}` : *Amit Patil*
  * `{{2}}` : *Latur*
  * `{{3}}` : *[[[[[[[[[[[[[[[[[[[[[[[[Home Loan](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)](/services/home-loan)*
  * `{{4}}` : *25,00,000*

* **Footer:** `Avani Loan Services Latur | Financial Solutions`
* **Buttons:**
  * **Call Button:** `Call Us` ➔ `+919175635165`

---

#### 2. Raw WhatsApp Message (For Direct Manual / Web Messaging)

```text
Hello! Thank you for reaching out to Avani Loan Services Latur (https://www.google.com/search?kgmid=/g/11f103qvkv). We have received your inquiry. Whether you need a Personal, Home, Business, or Mortgage Loan, we offer competitive rates and customized financial solutions.

To help us assign the right expert to your case, please reply with these details:
Name:
City/Location:
Loan Type: (Personal / Home / Business / Mortgage)
Required Amount (₹):

Our team will review your eligibility and call you back immediately. You can also reach us directly at 9175635165.
```

---

#### 💬 Facebook & Instagram DM Sequence - Day 1

```text
Hi there! Thanks for connecting with Avani Loan Services Latur. We provide specialized solutions for Personal, Home, Business, and Mortgage Loans. To give you the best rates, please drop your Name, City, Loan Type, and Required Amount right here, or message our team directly on WhatsApp for a faster response: wa.me/9175635165.
```

---

### 📱 Day 3: Friendly Follow-Up & Value Prop

#### 1. Meta WhatsApp API Submission Format

> [!NOTE]
> **Template Name:** `avani_retail_day3_followup`  
> **Category:** `MARKETING`  
> **Language:** `English (US) (en_US)`  
> **Header Type:** `None`

* **Body Text (Meta Format with Variables):**
  ```text
  Hi {{1}}! Just checking in from Avani Loan Services Latur regarding your loan requirement. Securing funding at competitive interest rates can save you a lot of time and money.

  If you haven't filled out your details yet, please share your Name, City, Loan Type, and Required Amount right here. Alternatively, let us know a convenient time for a quick 2-minute call, or reach us at 9175635165.
  ```

* **Variable Sample Values for Meta Review:**
  * `{{1}}` : *Valued Customer*

* **Footer:** `Avani Loan Services Latur | 9175635165`
* **Buttons:**
  * **Quick Reply 1:** `Share Details`
  * **Call Button:** `Call Support` ➔ `+919175635165`

---

#### 2. Raw WhatsApp Message

```text
Hi there! Just checking in from Avani Loan Services Latur (https://www.google.com/search?kgmid=/g/11f103qvkv) regarding your loan requirement. Securing funding at competitive interest rates can save you a lot of time and money.

If you haven't filled out your details yet, please share your Name, City, Loan Type, and Required Amount right here. Alternatively, let us know a convenient time for a quick 2-minute call, or reach us at 9175635165.
```

---

#### 💬 Facebook & Instagram DM Sequence - Day 3

```text
Hi! Following up on your loan inquiry with Avani Loan Services. Rates change frequently, and we want to ensure you get the absolute best deal available today. Could you share your Name, City, Loan Type, and Required Amount? We can jump on a quick call if you leave your contact number here, or you can ping us on WhatsApp at 9175635165.
```

---

### 📱 Day 5: Process Simplification & Document Checklist

#### 1. Meta WhatsApp API Submission Format

> [!NOTE]
> **Template Name:** `avani_retail_day5_docs`  
> **Category:** `UTILITY`  
> **Language:** `English (US) (en_US)`  
> **Header Text:** `Simplified Document Checklist`

* **Body Text (Meta Format with Variables):**
  ```text
  Hello {{1}}! We know that applying for loans can sometimes feel overwhelming with paperwork. At Avani Loan Services Latur, we make the documentation and approval process completely seamless.

  To get your application processed quickly, here is the basic checklist of Documents Required:
  1. Identity & Address Proof: PAN Card & Aadhaar Card
  2. Income Proof (Salaried): Last 3 months' salary slips & Form 16
  3. Income Proof (Self-Employed/Business): Last 2-3 years' ITR with financials
  4. Banking: Last 6 months' updated bank account statements

  If your financial need is still active, just reply with your Name, City, Loan Type, and Required Amount along with these documents. You can also call us at 9175635165 to get started.
  ```

* **Variable Sample Values for Meta Review:**
  * `{{1}}` : *Applicant*

* **Footer:** `Avani Loan Services Latur | Hassle-free Processing`
* **Buttons:**
  * **Call Button:** `Call 9175635165` ➔ `+919175635165`

---

#### 2. Raw WhatsApp Message

```text
Hello! We know that applying for loans can sometimes feel overwhelming with paperwork. At Avani Loan Services Latur (https://www.google.com/search?kgmid=/g/11f103qvkv), we make the documentation and approval process completely seamless.

To get your application processed quickly, here is the basic checklist of Documents Required:
• Identity & Address Proof: PAN Card & Aadhaar Card
• Income Proof (Salaried): Last 3 months' salary slips & Form 16
• Income Proof (Self-Employed/Business): Last 2-3 years' ITR with financials
• Banking: Last 6 months' updated bank account statements

If your financial need is still active, just reply with your Name, City, Loan Type, and Required Amount along with these documents. You can also call us at 9175635165 to get started.
```

---

#### 💬 Facebook & Instagram DM Sequence - Day 5

```text
Hello! Applying for a loan doesn't have to be stressful. To fast-track your file, we generally just need your PAN, Aadhaar, 3 months' salary slips/ITR, and 6 months' bank statements. Reply with your Name, City, Loan Type, and Required Amount to get an instant eligibility check. WhatsApp: 9175635165.
```

---

### 📱 Day 7: Final Check-in / Break-up Message

#### 1. Meta WhatsApp API Submission Format

> [!NOTE]
> **Template Name:** `avani_retail_day7_breakup`  
> **Category:** `MARKETING`  
> **Language:** `English (US) (en_US)`  
> **Header Type:** `None`

* **Body Text (Meta Format with Variables):**
  ```text
  Hi {{1}}! We have tried reaching out regarding your loan inquiry but haven't received your details yet. To keep your inbox clean, we will close this request for now.

  If you still need financial assistance later, simply send over your Name, City, Loan Type, and Required Amount to this number (9175635165). We are always here to support your financial growth. 

  Best regards, 
  Avani Loan Services Latur.
  ```

* **Variable Sample Values for Meta Review:**
  * `{{1}}` : *Friend*

* **Footer:** `Avani Loan Services Latur`
* **Buttons:**
  * **URL Button:** `Re-open Request` ➔ `https://wa.me/9175635165`

---

#### 2. Raw WhatsApp Message

```text
Hi! We have tried reaching out regarding your loan inquiry but haven't received your details yet. To keep your inbox clean, we will close this request for now.

If you still need financial assistance later, simply send over your Name, City, Loan Type, and Required Amount to this number (9175635165). We are always here to support your financial growth. Best regards, Avani Loan Services Latur.
```

---

#### 💬 Facebook & Instagram DM Sequence - Day 7

```text
Hi! We will stop knocking on your DMs for now! If your financial plans are temporarily on hold, that is completely fine. Whenever you are ready to restart, just save our WhatsApp number 9175635165 and send us your Name, City, Loan Type, and Required Amount. Wishing you the very best!
```

---

# 🎓 SECTION 2: Education Loans (India & Global)
*(Higher Education Funding for Domestic & International Universities)*

---

### 📱 Day 1: Instant Acknowledgment & Data Capture

#### 1. Meta WhatsApp API Submission Format

> [!NOTE]
> **Template Name:** `avani_edu_day1_ack`  
> **Category:** `UTILITY`  
> **Language:** `English (US) (en_US)`  
> **Header Type:** `None`

* **Body Text (Meta Format with Variables):**
  ```text
  Hello! Thank you for reaching out to Avani Loan Services Latur regarding your Education Loan inquiry. We specialize in funding higher education both within India and at Global universities, helping students secure their academic future with hassle-free loan approvals.

  To help our education finance experts evaluate your profile, please reply with these details:
  - Student Name: {{1}}
  - City/Location: {{2}}
  - Target Country / University: {{3}} (India or International country name)
  - Required Amount (₹): {{4}}

  We will review your profile and connect with you to guide you through the process. You can also reach us at 9175635165.
  ```

* **Variable Sample Values for Meta Review:**
  * `{{1}}` : *Siddharth Kulkarni*
  * `{{2}}` : *Latur*
  * `{{3}}` : *USA / Northeastern University*
  * `{{4}}` : *35,00,000*

* **Footer:** `Avani Loan Services Latur | Education Desk`
* **Buttons:**
  * **Call Button:** `Contact Education Desk` ➔ `+919175635165`

---

#### 2. Raw WhatsApp Message

```text
Hello! Thank you for reaching out to Avani Loan Services Latur (https://www.google.com/search?kgmid=/g/11f103qvkv) regarding your Education Loan inquiry. We specialize in funding higher education both within India and at Global universities, helping students secure their academic future with hassle-free loan approvals.

To help our education finance experts evaluate your profile, please reply with these details:
Student Name:
City/Location:
Target Country / University: (India or International country name)
Required Amount (₹):

We will review your profile and connect with you to guide you through the process. You can also reach us at 9175635165.
```

---

#### 💬 Facebook & Instagram DM Sequence - Day 1

```text
Hi there! Thanks for reaching out to Avani Loan Services Latur for an Education Loan. We offer robust financial support for studies in India and Abroad. To help us evaluate your application, please drop your Name, City, Destination Country, and Required Amount right here, or ping us directly on WhatsApp: wa.me/9175635165.
```

---

### 📱 Day 3: Friendly Follow-Up & Value Prop

#### 1. Meta WhatsApp API Submission Format

> [!NOTE]
> **Template Name:** `avani_edu_day3_followup`  
> **Category:** `MARKETING`  
> **Language:** `English (US) (en_US)`  
> **Header Type:** `None`

* **Body Text (Meta Format with Variables):**
  ```text
  Hi {{1}}! Securing an education loan early is crucial to locking in university admissions and visa processing times. At Avani Loan Services Latur, we help students get competitive interest rates and flexible moratorium periods.

  If you haven't shared your details yet, please reply with your Name, City, Target Country, and Required Amount right here, or call us at 9175635165 to schedule a free counseling session.
  ```

* **Variable Sample Values for Meta Review:**
  * `{{1}}` : *Student/Parent*

* **Footer:** `Avani Loan Services Latur | 9175635165`
* **Buttons:**
  * **Call Button:** `Book Counseling` ➔ `+919175635165`

---

#### 2. Raw WhatsApp Message

```text
Hi there! Securing an education loan early is crucial to locking in university admissions and visa processing times. At Avani Loan Services Latur (https://www.google.com/search?kgmid=/g/11f103qvkv), we help students get competitive interest rates and flexible moratorium periods.

If you haven't shared your details yet, please reply with your Name, City, Target Country, and Required Amount right here, or call us at 9175635165 to schedule a free counseling session.
```

---

#### 💬 Facebook & Instagram DM Sequence - Day 3

```text
Hi! Just checking in regarding your Education Loan inquiry. Timely financial approval is key to secured university admissions and visa processing. Could you share your Name, City, Destination Country, and Required Amount? You can also contact our education desk directly at 9175635165.
```

---

### 📱 Day 5: Process Simplification & Document Checklist

#### 1. Meta WhatsApp API Submission Format

> [!NOTE]
> **Template Name:** `avani_edu_day5_docs`  
> **Category:** `UTILITY`  
> **Language:** `English (US) (en_US)`  
> **Header Text:** `[Education Loan](/services/education-loan) Checklist`

* **Body Text (Meta Format with Variables):**
  ```text
  Hello student/parent {{1}}! We know that managing university admissions alongside financial paperwork can be stressful. At Avani Loan Services Latur, we streamline the process so you can focus entirely on your studies.

  To fast-track your approval, please keep the following Documents Required ready:
  1. Academic Proofs: 10th, 12th, and Graduation marksheets/passing certificates
  2. Admission Proof: Admission offer letter from the College/University
  3. KYC: PAN & Aadhaar cards of both Student and Co-applicant (Parents)
  4. Co-Applicant Income Proof: 3 months' salary slips OR 2 years' ITR, along with a 6-month bank statement

  Reply with your Name, City, Loan Type, and Required Amount along with these details to initiate your application. Contact us at 9175635165.
  ```

* **Variable Sample Values for Meta Review:**
  * `{{1}}` : *Applicant*

* **Footer:** `Avani Loan Services Latur | Education Desk`
* **Buttons:**
  * **Call Button:** `Call 9175635165` ➔ `+919175635165`

---

#### 2. Raw WhatsApp Message

```text
Hello student/parent! We know that managing university admissions alongside financial paperwork can be stressful. At Avani Loan Services Latur, we streamline the process so you can focus entirely on your studies.

To fast-track your approval, please keep the following Documents Required ready:
• Academic Proofs: 10th, 12th, and Graduation marksheets/passing certificates
• Admission Proof: Admission offer letter from the College/University
• KYC: PAN & Aadhaar cards of both Student and Co-applicant (Parents)
• Co-Applicant Income Proof: 3 months' salary slips OR 2 years' ITR, along with a 6-month bank statement

Reply with your Name, City, Loan Type, and Required Amount along with these details to initiate your application. Contact us at 9175635165.
```

---

#### 💬 Facebook & Instagram DM Sequence - Day 5

```text
Hello! Getting an education loan is highly systematic. To jumpstart the process, we primarily look at student academic scores, the university offer letter, and parent/co-applicant income docs. Share your Name, City, Loan Type, and Required Amount to verify your eligibility today. WhatsApp: 9175635165.
```

---

### 📱 Day 7: Final Check-in / Break-up Message

#### 1. Meta WhatsApp API Submission Format

> [!NOTE]
> **Template Name:** `avani_edu_day7_breakup`  
> **Category:** `MARKETING`  
> **Language:** `English (US) (en_US)`  
> **Header Type:** `None`

* **Body Text (Meta Format with Variables):**
  ```text
  Hi {{1}}! We haven't heard back from you regarding your Education Loan inquiry. As admission deadlines and university intakes approach quickly, we want to ensure you don't miss out. We are closing this request for now to keep your inbox clean.

  If you decide to process your funding later, simply drop your Name, City, Target University, and Required Amount via WhatsApp to 9175635165. Best wishes for your future career!
  ```

* **Variable Sample Values for Meta Review:**
  * `{{1}}` : *Student*

* **Footer:** `Avani Loan Services Latur`
* **Buttons:**
  * **URL Button:** `WhatsApp Us` ➔ `https://wa.me/9175635165`

---

#### 2. Raw WhatsApp Message

```text
Hi! We haven't heard back from you regarding your Education Loan inquiry. As admission deadlines and university intakes approach quickly, we want to ensure you don't miss out. We are closing this request for now to keep your inbox clean.

If you decide to process your funding later, simply drop your Name, City, Target University, and Required Amount via WhatsApp to 9175635165. Best wishes for your future career!
```

---

#### 💬 Facebook & Instagram DM Sequence - Day 7

```text
Hi! We will stop sending messages to your inbox for now. If your higher education plans are currently on hold, we wish you the absolute best. Should you need financial backing in the future, save our WhatsApp number 9175635165 and send us your details.
```

---

# 🏫 SECTION 3: Institutional Funding
*(School & College Funding)*

---

### 📱 Day 1: Instant Acknowledgment & Data Capture

#### 1. Meta WhatsApp API Submission Format

> [!NOTE]
> **Template Name:** `avani_inst_day1_ack`  
> **Category:** `UTILITY`  
> **Language:** `English (US) (en_US)`  
> **Header Type:** `None`

* **Body Text (Meta Format with Variables):**
  ```text
  Hello! Thank you for reaching out to Avani Loan Services Latur. We received your inquiry regarding Institutional Funding (School/College Funding). We specialize in structuring large-scale capital solutions for infrastructure expansion, working capital, and equipment upgrades for educational institutions.

  To assign a senior institutional finance consultant to your file, please reply with these details:
  - Institution/Trust Name: {{1}}
  - City/Location: {{2}}
  - Funding Purpose: {{3}} (School Funding / College Funding)
  - Required Amount (₹): {{4}}

  Our senior team will evaluate your request and schedule a direct meeting. You can also contact us at 9175635165.
  ```

* **Variable Sample Values for Meta Review:**
  * `{{1}}` : *Vidya Vardhini Educational Trust*
  * `{{2}}` : *Latur*
  * `{{3}}` : *School Campus Expansion*
  * `{{4}}` : *1,50,00,000*

* **Footer:** `Avani Loan Services Latur | Institutional Desk`
* **Buttons:**
  * **Call Button:** `Call Senior Advisory` ➔ `+919175635165`

---

#### 2. Raw WhatsApp Message

```text
Hello! Thank you for reaching out to Avani Loan Services Latur. We received your inquiry regarding Institutional Funding (School/College Funding). We specialize in structuring large-scale capital solutions for infrastructure expansion, working capital, and equipment upgrades for educational institutions.

To assign a senior institutional finance consultant to your file, please reply with these details:
Institution/Trust Name:
City/Location:
Funding Purpose: (School Funding / College Funding)
Required Amount (₹):

Our senior team will evaluate your request and schedule a direct meeting. You can also contact us at 9175635165.
```

---

#### 💬 Facebook & Instagram DM Sequence - Day 1

```text
Greetings! Thank you for connecting with Avani Loan Services Latur regarding School or College Funding. We offer tailored long-term capital structures for educational institutions. Please share your Institution Name, City, Funding Purpose, and Required Amount here, or reach our senior desk directly on WhatsApp: wa.me/9175635165.
```

---

### 📱 Day 3: Friendly Follow-Up & Value Prop

#### 1. Meta WhatsApp API Submission Format

> [!NOTE]
> **Template Name:** `avani_inst_day3_followup`  
> **Category:** `MARKETING`  
> **Language:** `English (US) (en_US)`  
> **Header Type:** `None`

* **Body Text (Meta Format with Variables):**
  ```text
  Greetings {{1}}! Capital requirements for schools and colleges require custom structural planning to balance institutional cash flows. At Avani Loan Services Latur, we help educational trusts secure customized funding models with extended repayment flexibilities.

  If you haven't shared your core details yet, please provide your Name/Institution, City, Funding Type, and Required Amount right here, or call us at 9175635165 to arrange a confidential discussion.
  ```

* **Variable Sample Values for Meta Review:**
  * `{{1}}` : *Trustee / Director*

* **Footer:** `Avani Loan Services Latur | 9175635165`
* **Buttons:**
  * **Call Button:** `Schedule Meeting` ➔ `+919175635165`

---

#### 2. Raw WhatsApp Message

```text
Greetings! Capital requirements for schools and colleges require custom structural planning to balance institutional cash flows. At Avani Loan Services Latur, we help educational trusts secure customized funding models with extended repayment flexibilities.

If you haven't shared your core details yet, please provide your Name/Institution, City, Funding Type, and Required Amount right here, or call us at 9175635165 to arrange a confidential discussion.
```

---

#### 💬 Facebook & Instagram DM Sequence - Day 3

```text
Hello! Following up on your institutional loan query. Expanding school/college infrastructure requires optimal financial planning to protect cash flow. Could you share your Institution Name, City, Funding Type, and Required Amount? Alternatively, connect directly with our advisory team via WhatsApp at 9175635165.
```

---

### 📱 Day 5: Process Simplification & Document Checklist

#### 1. Meta WhatsApp API Submission Format

> [!NOTE]
> **Template Name:** `avani_inst_day5_docs`  
> **Category:** `UTILITY`  
> **Language:** `English (US) (en_US)`  
> **Header Text:** `Institutional Financial Documents`

* **Body Text (Meta Format with Variables):**
  ```text
  Hello {{1}}! Institutional fundraising involves precise financial evaluations. At Avani Loan Services Latur, we work directly with management boards and trust committees to ensure a smooth, professional, and compliant funding journey.

  To help our credit team evaluate the initial file, please prepare the following Documents Required:
  1. Trust/Society Registration: Trust Deed, Society Registration Certificate, and Bye-laws
  2. Financial Proofs: Last 3 years' Audited Balance Sheets and Income & Expenditure statements
  3. Approvals: Recognition certificates, affiliation letters (CBSE/ICSE/State Board/UGC/AICTE)
  4. Banking: Last 12 months' statements of primary operational bank accounts

  To move your file to the preliminary evaluation stage, please reply with your Name, City, Institution Type, and Required Amount. Contact: 9175635165.
  ```

* **Variable Sample Values for Meta Review:**
  * `{{1}}` : *Management Board*

* **Footer:** `Avani Loan Services Latur | Institutional Desk`
* **Buttons:**
  * **Call Button:** `Call Advisory` ➔ `+919175635165`

---

#### 2. Raw WhatsApp Message

```text
Hello! Institutional fundraising involves precise financial evaluations. At Avani Loan Services Latur, we work directly with management boards and trust committees to ensure a smooth, professional, and compliant funding journey.

To help our credit team evaluate the initial file, please prepare the following Documents Required:
• Trust/Society Registration: Trust Deed, Society Registration Certificate, and Bye-laws
• Financial Proofs: Last 3 years' Audited Balance Sheets and Income & Expenditure statements
• Approvals: Recognition certificates, affiliation letters (CBSE/ICSE/State Board/UGC/AICTE)
• Banking: Last 12 months' statements of primary operational bank accounts

To move your file to the preliminary evaluation stage, please reply with your Name, City, Institution Type, and Required Amount. Contact: 9175635165.
```

---

#### 💬 Facebook & Instagram DM Sequence - Day 5

```text
Hello! To initiate institutional funding evaluations smoothly, we generally require Trust registration deeds, 3 years of audited financials, board resolutions, and board affiliation letters. Please reply with your Name, City, Funding Type, and Required Amount to schedule an eligibility screening. WhatsApp: 9175635165.
```

---

### 📱 Day 7: Final Check-in / Break-up Message

#### 1. Meta WhatsApp API Submission Format

> [!NOTE]
> **Template Name:** `avani_inst_day7_breakup`  
> **Category:** `MARKETING`  
> **Language:** `English (US) (en_US)`  
> **Header Type:** `None`

* **Body Text (Meta Format with Variables):**
  ```text
  Hello {{1}}! We have tried reaching out regarding your interest in School/College Institutional Funding but haven't received your operational details. We will close this ticket for now to keep your communication channel clean.

  If your institution intends to expand or restructure its debt in the upcoming fiscal terms, please feel free to reconnect by dropping your Name, City, Funding Type, and Required Amount to 9175635165. 

  Best regards, 
  Avani Loan Services Latur.
  ```

* **Variable Sample Values for Meta Review:**
  * `{{1}}` : *Institutional Partner*

* **Footer:** `Avani Loan Services Latur`
* **Buttons:**
  * **URL Button:** `WhatsApp Desk` ➔ `https://wa.me/9175635165`

---

#### 2. Raw WhatsApp Message

```text
Hello! We have tried reaching out regarding your interest in School/College Institutional Funding but haven't received your operational details. We will close this ticket for now to keep your communication channel clean.

If your institution intends to expand or restructure its debt in the upcoming fiscal terms, please feel free to reconnect by dropping your Name, City, Funding Type, and Required Amount to 9175635165. Best regards, Avani Loan Services Latur.
```

---

#### 💬 Facebook & Instagram DM Sequence - Day 7

```text
Hello! We will step back from your inbox for now. If your institutional expansion plans are on hold, we completely understand. Should you require financial advisory or substantial funding in the future, please save our WhatsApp contact 9175635165 and reach out.
```

---

## 📌 Checklist for Meta Approval Submission Success

1. **Category Accuracy**:
   - `UTILITY`: Day 1 and Day 5 (Data capture & document requirements).
   - `MARKETING`: Day 3 and Day 7 (Nurturing & closure follow-ups).
2. **Variable Syntax**:
   - Always use double curly brackets `{{1}}`, `{{2}}`.
   - Never put variables at the very beginning or end of a template body.
   - Do not place two variables consecutively like `{{1}} {{2}}`.
3. **Sample Values**:
   - Always fill out realistic sample parameters in Meta Manager prior to clicking **Submit**.
4. **Button Links**:
   - Ensure phone numbers include country code (`+919175635165`).
   - URLs should open directly in WhatsApp or Google Business listing.
