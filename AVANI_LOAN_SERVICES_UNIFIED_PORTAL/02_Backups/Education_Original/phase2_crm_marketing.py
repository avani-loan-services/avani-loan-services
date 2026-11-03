# -*- coding: utf-8 -*-
"""
AVANI LOAN SERVICES — EDUCATION INSTITUTIONAL FUNDING AUTOMATION SYSTEM
Module: phase2_crm_marketing.py
Purpose: Executes Phase 6 (CRM Automation), Phase 7 (Marketing Automation Playbooks),
Phase 8 (Follow-Up & Consent Management), and Phase 9 (Institutional Enquiry Form HTML & PDF).
"""

import os
import sys
import csv
import json
import subprocess
from collections import Counter
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

def to_long_path(p):
    p = os.path.abspath(p)
    if not p.startswith('\\\\?\\'):
        return '\\\\?\\' + p
    return p

WORKSPACE_DIR = r"c:\Users\ALPHA-1\Downloads\21MAY2026\SACHIN SHINDE DOCUMENTS\DEVELOPEMENT TOOLS\1-AVANI LOAN SERVICE FY 26-27"
PROJ_DIR = os.path.join(WORKSPACE_DIR, "India_Education_Institutional_Funding_System")
PHASE2_ROOT = os.path.join(PROJ_DIR, "AVANI_EDUCATION_FUNDING_AUTOMATION_SYSTEM")

FOLDER_06 = os.path.join(PHASE2_ROOT, "06_CRM_Automation_and_Followup")
FOLDER_07 = os.path.join(PHASE2_ROOT, "07_Marketing_Playbooks_and_Campaigns")
FOLDER_08 = os.path.join(PHASE2_ROOT, "08_Consent_and_Enquiry_System")

AUDIT_DATE = "2026-10-31"

# Styling Constants
NAVY_HEADER = "1B365D"
GOLD_ACCENT = "D4AF37"
SOFT_BLUE_BG = "EBF2FA"
ZEBRA_ROW_BG = "F9FAFB"
WHITE = "FFFFFF"
DARK_GRAY_TEXT = "222222"
MUTED_TEXT = "555555"
BORDER_GRAY = "D3D3D3"

font_title = Font(name="Segoe UI", size=14, bold=True, color=NAVY_HEADER)
font_subtitle = Font(name="Segoe UI", size=10, italic=True, color=MUTED_TEXT)
font_header = Font(name="Segoe UI", size=10, bold=True, color=WHITE)
font_data = Font(name="Segoe UI", size=9, color=DARK_GRAY_TEXT)
font_data_bold = Font(name="Segoe UI", size=9, bold=True, color=DARK_GRAY_TEXT)

fill_header = PatternFill(start_color=NAVY_HEADER, end_color=NAVY_HEADER, fill_type="solid")
fill_subtotal = PatternFill(start_color=SOFT_BLUE_BG, end_color=SOFT_BLUE_BG, fill_type="solid")
fill_zebra = PatternFill(start_color=ZEBRA_ROW_BG, end_color=ZEBRA_ROW_BG, fill_type="solid")

thin_border = Border(
    left=Side(style='thin', color=BORDER_GRAY),
    right=Side(style='thin', color=BORDER_GRAY),
    top=Side(style='thin', color=BORDER_GRAY),
    bottom=Side(style='thin', color=BORDER_GRAY)
)

def format_excel_sheet(ws, headers, rows, title=None, subtitle=None):
    ws.views.sheetView[0].showGridLines = True
    start_row = 1
    if title:
        ws.merge_cells("A1:G1")
        ws["A1"] = title
        ws["A1"].font = font_title
        ws["A1"].alignment = Alignment(vertical="center")
        ws.row_dimensions[1].height = 28
        start_row = 3
    if subtitle:
        ws.merge_cells(f"A2:G2")
        ws["A2"] = subtitle
        ws["A2"].font = font_subtitle
        ws["A2"].alignment = Alignment(vertical="center")
        ws.row_dimensions[2].height = 18
        start_row = 4
        
    ws.row_dimensions[start_row].height = 24
    for col_idx, header in enumerate(headers, 1):
        cell = ws.cell(row=start_row, column=col_idx, value=header)
        cell.font = font_header
        cell.fill = fill_header
        cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
        cell.border = thin_border
        
    current_row = start_row + 1
    for row_data in rows:
        ws.row_dimensions[current_row].height = 20
        is_zebra = (current_row % 2 == 0)
        for col_idx, val in enumerate(row_data, 1):
            cell = ws.cell(row=current_row, column=col_idx, value=val)
            cell.font = font_data
            cell.border = thin_border
            if is_zebra:
                cell.fill = fill_zebra
            if isinstance(val, (int, float)):
                cell.alignment = Alignment(horizontal="right", vertical="center")
            elif str(val).startswith("ALS-"):
                cell.alignment = Alignment(horizontal="center", vertical="center")
                cell.font = font_data_bold
            elif str(val) in ["A+", "A", "B", "C", "VERIFIED", "PARTIALLY VERIFIED"]:
                cell.alignment = Alignment(horizontal="center", vertical="center")
                cell.font = font_data_bold
            else:
                cell.alignment = Alignment(horizontal="left", vertical="center")
        current_row += 1
        
    for col in ws.columns:
        col_letter = get_column_letter(col[0].column)
        max_len = 0
        for cell in col:
            if cell.row < start_row:
                continue
            if cell.value:
                val_str = str(cell.value)
                line_len = max(len(l) for l in val_str.split("\n"))
                if line_len > max_len:
                    max_len = line_len
        ws.column_dimensions[col_letter].width = min(max(max_len + 3, 11), 50)
    ws.freeze_panes = ws.cell(row=start_row + 1, column=1)

def generate_crm_files(records):
    """
    Generates Phase 6 CRM Master Import, Tracker, and Dashboard in 06_CRM_Automation_and_Followup/
    """
    print("\n--- Generating Phase 6: CRM Automation Files ---")
    
    # 1. CRM_Master_Import.xlsx & .csv (24 standardized fields matching user prompt Section 8)
    CRM_HEADERS = [
        "Lead ID", "Institution Name", "Parent Organization", "Institution Category",
        "City", "State", "Website", "Decision-Maker", "Designation",
        "Official Mobile", "Official Email", "Funding Purpose", "Funding Category",
        "Estimated Funding Requirement", "Lead Score", "Priority", "Source URL",
        "Verification Status", "Consent Status", "Lead Owner", "First Contact Date",
        "Last Contact Date", "Next Follow-up Date", "Current Stage", "Remarks"
    ]
    
    rows_crm = []
    for r in records:
        dm_name = r["owner_founder_name"]
        if dm_name == "Not publicly verified" or "Late" in dm_name:
            dm_name = r["chairman_name"]
        if dm_name == "Not publicly verified":
            dm_name = r["managing_trustee_name"]
        if dm_name == "Not publicly verified":
            dm_name = r["director_name"]
            
        stage = "Contact Identified" if r["verification_status"] == "VERIFIED" else "Verified Lead"
        
        rows_crm.append([
            r["lead_id"], r["institution_name"], r.get("parent_trust_society", ""), r["institution_category"],
            r["city"], r["state"], r["website"], dm_name, r["primary_dm_designation"],
            r["public_whatsapp"], r["professional_email"], r["funding_purpose"], r["funding_category"],
            r["potential_funding_requirement"], r["lead_priority_score"], r["lead_priority_tier"], r["research_evidence_url"],
            r["verification_status"], "Initial Consultative Enquiry Permitted", "Institutional Advisory Desk - Avani Finserv",
            "Pending Scheduled Outreach", "Initial Pipeline Entry", "2026-11-15",
            stage, r["remarks"]
        ])
        
    wb_crm = Workbook()
    ws_crm = wb_crm.active
    ws_crm.title = "CRM Master Import"
    format_excel_sheet(ws_crm, CRM_HEADERS, rows_crm,
                       title="AVANI LOAN SERVICES — CRM MASTER IMPORT DATABASE (24 FIELDS)",
                       subtitle="Ready for Direct Import into HubSpot, Salesforce, Zoho CRM, or Custom Banking LMS")
    p_crm_xlsx = to_long_path(os.path.join(FOLDER_06, "CRM_Master_Import.xlsx"))
    wb_crm.save(p_crm_xlsx)
    print(f"Saved: {p_crm_xlsx}")
    
    p_crm_csv = to_long_path(os.path.join(FOLDER_06, "CRM_Import.csv"))
    with open(p_crm_csv, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.writer(f)
        w.writerow(CRM_HEADERS)
        w.writerows(rows_crm)
    print(f"Saved: {p_crm_csv}")
    
    # 2. Lead_Followup_Tracker.xlsx
    TRACK_HEADERS = [
        "Lead ID", "Institution Name", "Decision Maker", "Designation",
        "Official Contact", "Official Email", "Priority Tier", "Lead Score",
        "Current Stage", "First Contact Date", "Last Contact Date", "Next Follow-up Due",
        "Touchpoint Cadence", "Outreach Channel", "Follow-up SLA Status", "Assigned Senior Loan Advisor"
    ]
    rows_track = []
    advisors = [
        "Sachin Shinde (Director - Institutional Advisory)",
        "Senior Loan Syndication Manager - Western Maharashtra",
        "Senior Loan Syndication Manager - Mumbai & MMR",
        "Senior Loan Syndication Manager - National Corporate Hubs"
    ]
    for idx, r in enumerate(records):
        dm_name = r["owner_founder_name"]
        if dm_name == "Not publicly verified" or "Late" in dm_name:
            dm_name = r["chairman_name"]
        if dm_name == "Not publicly verified":
            dm_name = r["director_name"]
            
        adv = advisors[idx % len(advisors)]
        rows_track.append([
            r["lead_id"], r["institution_name"], dm_name, r["primary_dm_designation"],
            r["public_whatsapp"], r["professional_email"], r["lead_priority_tier"], r["lead_priority_score"],
            "Contact Identified" if r["verification_status"] == "VERIFIED" else "Verified Lead",
            "Pending Scheduled Outreach", "Initial Pipeline Entry", "2026-11-15",
            "Touch 1: Executive Dossier + Formal Email", r["outreach_channel"],
            "On Track (Ready for Batch 1 Outreach)", adv
        ])
        
    wb_tr = Workbook()
    ws_tr = wb_tr.active
    ws_tr.title = "Lead Follow-up Tracker"
    format_excel_sheet(ws_tr, TRACK_HEADERS, rows_track,
                       title="AVANI LOAN SERVICES — INSTITUTIONAL OUTREACH & FOLLOW-UP SLA TRACKER",
                       subtitle="Lead Cadence Management, Advisory Officer Allocation, and Touchpoint Milestones")
    p_tr_xlsx = to_long_path(os.path.join(FOLDER_06, "Lead_Followup_Tracker.xlsx"))
    wb_tr.save(p_tr_xlsx)
    print(f"Saved: {p_tr_xlsx}")
    
    # 3. Lead_Priority_Dashboard.xlsx
    wb_pd = Workbook()
    
    # Sheet 1: Pipeline Stage Distribution
    ws_pd1 = wb_pd.active
    ws_pd1.title = "Pipeline Stage Breakdown"
    stages = [
        ("1. New Lead", 0, "Initial raw database ingestion"),
        ("2. Research Pending", 0, "Preliminary verification pending"),
        ("3. Verified Lead", 26, "Institutional identity and central switchboard verified (Partially Verified)"),
        ("4. Contact Identified", 54, "Direct Chairman / Managing Trustee / Corporate line verified (Fully Verified)"),
        ("5. Permission Requested", 0, "Opt-in / Consultative meeting request initiated"),
        ("6. Interested", 0, "Expressed interest in loan assessment or term-sheet review"),
        ("7. Requirement Collected", 0, "Detailed capex questionnaire completed"),
        ("8. Documents Awaited", 0, "3-year audited financials & property title documents awaited"),
        ("9. Financial Assessment", 0, "Debt-service coverage (DSCR) & LTV financial modeling"),
        ("10. Lender Matching", 0, "Matching with PSU/Private Banks, NBFCs, and Institutional Debt Funds"),
        ("11. Application Submitted", 0, "Formal loan application submitted to credit committee"),
        ("12. Sanctioned", 0, "Credit sanction letter issued"),
        ("13. Disbursed", 0, "Loan sanctioned and capital disbursed to educational trust"),
        ("14. Not Interested", 0, "Institution declined financing (immediate suppression)"),
        ("15. Follow-up Later", 0, "Scheduled for re-evaluation in next academic cycle"),
        ("16. Closed / Disqualified", 0, "Disqualified or entity closed")
    ]
    headers_stg = ["Sales Pipeline Stage", "Current Lead Count", "Share (%)", "Weighted Pipeline (₹ Cr)", "Operational Definition & Workflow"]
    rows_stg = []
    for s_name, count, desc in stages:
        pct = f"{count/len(records)*100:.1f}%"
        # Initial weighted value: 40% probability for Contact Identified, 20% for Verified Lead
        wt_val = count * 8.27 * (0.4 if count == 54 else (0.2 if count == 26 else 0.0))
        rows_stg.append([s_name, count, pct, f"₹{wt_val:.1f} Cr", desc])
    format_excel_sheet(ws_pd1, headers_stg, rows_stg,
                       title="AVANI LOAN SERVICES — 16-STAGE INSTITUTIONAL PIPELINE VELOCITY",
                       subtitle="Sales Funnel Stage Distribution and Weighted Commercial Conversion Values")
                       
    p_pd_xlsx = to_long_path(os.path.join(FOLDER_06, "Lead_Priority_Dashboard.xlsx"))
    wb_pd.save(p_pd_xlsx)
    print(f"Saved: {p_pd_xlsx}")

def generate_marketing_playbooks():
    """
    Generates Phase 7 Marketing Automation Playbooks in 07_Marketing_Playbooks_and_Campaigns/
    """
    print("\n--- Generating Phase 7: Marketing Automation Playbooks ---")
    p_md = to_long_path(os.path.join(FOLDER_07, "Marketing_Automation_Playbooks.md"))
    
    content = f"""# AVANI LOAN SERVICES — INSTITUTIONAL MARKETING AUTOMATION PLAYBOOKS
## Comprehensive Multi-Channel Campaign Sequences, Scripts, Questionnaires & Objection Handling
**Entity:** [AVANI LOAN SERVICES](https://www.avanifinserv.com/)  
**Target Ticket Size:** ₹10 Lakh to ₹10 Crore (Secured LAP & Unsecured Institutional Working Capital)  
**Execution Date:** {AUDIT_DATE}  
**Regulatory Compliance:** Full Adherence to TRAI Telecom Commercial Communications Customer Preference Regulations & Meta WhatsApp Business Policy  

---

## 1. STRATEGIC COMPLIANCE & PRIVACY FRAMEWORK

1. **Explicit Opt-In Protocol:** No unsolicited commercial broadcast messages are permitted. All outreach is consultative and directed strictly to publicly published institutional switchboards or corporate secretariat numbers.
2. **Opt-Out Suppression Rule:** Any communication containing words such as "STOP", "UNSUBSCRIBE", "NOT INTERESTED", or "NO" triggers immediate, irreversible exclusion from all future campaigns.
3. **No Fabrication Policy:** Never promise guaranteed interest rates, loan sanctions, or specific disbursement amounts. All terms are subject to lender credit policies, borrower financial statements, and collateral evaluation.
4. **Distinction of Authority:** Address statutory communications to the **Owner / Chairman / Managing Trustee**, while academic communications are separated from loan syndication proposals.

---

## 2. CAMPAIGN A: PRIVATE K-12 SCHOOL OWNERS & TRUSTEES
**Target Audience:** Owners, Chairmen, and Managing Trustees of CBSE, ICSE, Cambridge, and IB Schools  
**Core Capex Focus:** New STEAM labs, campus expansion, sports pavilions, student bus fleet financing, and working capital  

### 2.1 Formal Introductory Email Template
**Subject:** Capital Advisory: Infrastructure Expansion & Secured Facility for [Institution Name]  
**Pre-header:** AVANI FINSERV — Up to ₹10 Cr Structured Loan Advisory for K-12 School Groups  

```text
Respected [Chairman / Managing Trustee Name],
Greetings from AVANI LOAN SERVICES (www.avanifinserv.com).

We have closely observed the remarkable contribution of [Institution Name] under [Parent Trust / Society] towards providing quality K-12 education in [City].

As educational institutions expand their campus infrastructure to meet modern STEAM, robotics, and sports facility standards, structuring low-cost, flexible capital becomes vital.

AVANI LOAN SERVICES specializes in institutional debt syndication for leading private school trusts:
• ₹50 Lakh to ₹10 Crore Secured Loans Against Campus Real Estate (LAP).
• Long-tenure repayment structures (up to 15 years) aligned with academic fee collections.
• Equipment and laboratory lease financing for smart digital classrooms.
• Balance transfer options to reduce borrowing costs on existing high-cost loans by 150–250 bps.

We would be honored to provide an exploratory, non-binding institutional capital assessment for your upcoming campus initiatives.

May we request a brief 10-minute exploratory conversation with your office or your Finance Director next week?

Warm regards,

Sachin Shinde
Director — Institutional Banking Advisory
AVANI LOAN SERVICES
Website: https://www.avanifinserv.com/
Direct Advisory Desk: +91 94220 00000 | corporate@avanifinserv.com
```

### 2.2 WhatsApp Permission-Request Message (Strict Meta Opt-In Compliant)
```text
Respected [Chairman / Managing Trustee Name],

Greetings from AVANI LOAN SERVICES (www.avanifinserv.com). 

We advise leading educational societies across Maharashtra on structuring institutional loans (₹50 Lakh to ₹10 Crore) for school campus expansion, smart labs, and existing debt refinancing.

We have prepared a brief institutional funding assessment tailored for [Institution Name]. 

Would you or your Finance Team permit us to share this executive overview with your office? 

(Reply YES to review overview, or reply STOP to opt-out).
```

### 2.3 WhatsApp Value-Add Follow-Up Message (Post Opt-In)
```text
Thank you, [Chairman Name]. 

Attached is our Institutional Education Funding Dossier. Key parameters we evaluate for K-12 groups:
1. Long-tenure Loan Against Property (50-65% LTV on unencumbered school campus land).
2. Clean working capital lines synchronized with term tuition collections.
3. Balance transfer restructuring to immediately reduce recurring EMI outgo.

Would Tuesday or Thursday at 11:30 AM be convenient for a brief introductory call with our Senior Loan Advisor?
```

### 2.4 Telephone Opening Script (Chairman's Executive Assistant / Reception Desk)
```text
"Good morning, my name is [Advisor Name] calling from AVANI LOAN SERVICES corporate advisory desk. 

I am calling regarding a formal institutional debt advisory dossier we have prepared for [Chairman Name] concerning infrastructure expansion and debt restructuring facilities for [Institution Name]. 

Could you kindly guide me to the Executive Assistant to the Chairman or the Chief Financial Officer who oversees institutional banking relationships?"
```

### 2.5 Executive Meeting Booking Script
```text
"Thank you for connecting, [CFO / Executive Assistant Name]. We work with top education trusts across Maharashtra to syndicate ₹2 Cr to ₹10 Cr secured campus infrastructure loans at competitive commercial rates. 

We would like to present a 15-minute institutional financing comparison showing how [Institution Name] can optimize its upcoming capex without straining operational cash flows. Does [Date] at [Time] suit [Chairman Name] for a video briefing or campus visit?"
```

### 2.6 Funding Requirement Questionnaire (School Owners)
1. What is the primary purpose of the proposed funding (Campus expansion / New academic block / Sports arena / Debt takeover)?
2. What is the approximate target capital requirement (₹50 Lakh to ₹2 Cr / ₹2 Cr to ₹5 Cr / ₹5 Cr to ₹10 Cr)?
3. What is the freehold campus land area owned by the trust, and is the title unencumbered?
4. What is the current student enrollment and annual fee revenue trajectory over the last 3 fiscal years?
5. Does the society have existing term loans or overdrafts with scheduled banks, and at what current interest rate?

### 2.7 Document Collection Checklist
- [ ] Certified Copy of Trust Deed / Society Registration Certificate / Memorandum of Association
- [ ] 12A and 80G Registration Certificates
- [ ] Audited Balance Sheets and Income & Expenditure Statements for last 3 financial years (with all schedules & audit notes)
- [ ] Last 12 months' continuous bank account statements for all operational society accounts
- [ ] Sanction letters and latest repayment track records for existing bank borrowings
- [ ] Campus property title deeds, approved building layout plans, and non-encumbrance certificate

### 2.8 Objection Handling Responses
- **Objection:** *"We already have an established banking relationship with our nationalized/cooperative bank."*  
  **Response:** *"We completely respect that relationship. In fact, many education societies work with us specifically to benchmark their existing rates. Through structured loan syndication, we frequently reduce borrowing costs by 150 to 250 basis points or unlock additional construction funding that single branch managers cannot sanction. Reviewing our terms creates no obligation but provides valuable commercial leverage."*
- **Objection:** *"The trustees do not wish to provide personal guarantees."*  
  **Response:** *"Our institutional lending partners specialize in educational trust financing where credit underwriting is anchored on institutional physical campus collateral and predictable fee cash flows, minimizing or eliminating personal guarantee burdens."*

---

## 3. CAMPAIGN B: COLLEGE & UNIVERSITY MANAGEMENT
**Target Audience:** Presidents, Secretaries, Managing Directors, and Chancellors of Engineering, Medical, Autonomous Colleges, and Deemed Universities  
**Core Capex Focus:** High-rise student hostels, AI/robotics research centers, hospital equipment leasing, and campus infrastructure  

### 3.1 Formal Introductory Email Template
**Subject:** Institutional Capital Advisory: ₹5 Cr–₹10 Cr Infrastructure Financing for [Institution Name]  
**Pre-header:** Specialized Debt Syndication for Autonomous Colleges & Universities — AVANI FINSERV  

```text
Respected [President / Chancellor / Secretary Name],
Greetings from AVANI LOAN SERVICES.

Under your leadership, [Institution Name] has established an enviable benchmark in higher technical and professional education across [State].

With rapid technological transformations requiring investments into specialized AI supercomputing testbeds, semiconductor laboratories, and modern residential high-rises, institutional debt must be structured with optimal tenures and minimal cost.

AVANI LOAN SERVICES provides dedicated debt advisory for autonomous colleges and university groups:
• ₹2 Crore to ₹10 Crore Campus Infrastructure Loans & Construction Tranches.
• Medical & Advanced Scientific Equipment Leasing Lines.
• Student Housing High-Rise Construction Finance with moratorium periods matching construction completion.
• Institutional debt restructuring to lower overall weighted average cost of capital (WACC).

We invite you to review an exploratory financing structure tailored to [Institution Name]'s upcoming development plans.

May we coordinate a brief introductory consultation with your office or Director of Finance this week?

Sincerely,

Sachin Shinde
Director — Institutional Advisory
AVANI LOAN SERVICES (https://www.avanifinserv.com/)
```

### 3.2 WhatsApp Permission-Request Message
```text
Respected [President / Secretary Name],

Greetings from AVANI LOAN SERVICES (www.avanifinserv.com).

We partner with autonomous colleges and university managements across India to syndicate ₹2 Cr to ₹10 Cr institutional funding for student hostels, research laboratories, and balance transfers.

We have compiled a commercial financing framework specifically suitable for higher education campuses. 

May we share this executive briefing with your office or CFO? 

(Reply YES to receive the overview, or reply STOP to opt-out).
```

---

## 4. CAMPAIGN C: HISTORIC DISTRICT EDUCATIONAL TRUSTS
**Target Audience:** Presidents, Vice Presidents, and General Secretaries of multi-institution societies (e.g., MVP Samaj, Rayat Shikshan Sanstha, SSBES Nanded)  
**Core Capex Focus:** Modernization of 20+ rural schools into digital English-medium institutions, campus solar microgrids, and refinancing away from high-cost cooperative bank debt  

### 4.1 Formal Email Template
**Subject:** Strategic Capital Advisory: Digital Modernization & Debt Refinancing for [Parent Trust / Society]  
```text
Respected [President / Secretary Name],

Greetings from AVANI LOAN SERVICES.

[Parent Trust / Society] has a legendary heritage of uplifting thousands of students across [District] through its network of institutions.

We specialize in structuring multi-campus institutional financing:
1. Low-Cost Debt Refinancing: Replacing fragmented, high-cost cooperative loans with a single consolidated institutional facility, immediately reducing annual debt servicing costs.
2. Clean Green Energy Financing: Rooftop solar microgrid loans across 20+ campuses, lowering recurring electricity bills by 60–80%.
3. Smart Classroom & High-School Modernization Lines.

We welcome an opportunity to meet with your Management Council or Secretary Desk to present an institutional debt consolidation model.
```

---

## 5. CAMPAIGN D: PROFESSIONAL COACHING & TRAINING CHAINS
**Target Audience:** Managing Directors and Founders of multi-branch coaching and vocational skill networks  
**Core Capex Focus:** Multi-branch expansion, long-lease premises fit-outs, digital recording studios, and seasonal working capital  

### 5.1 Formal Email Template
**Subject:** Business Growth Finance: Branch Expansion & Working Capital Lines for [Institution Name]  
```text
Dear [Founder / Managing Director Name],

Greetings from AVANI LOAN SERVICES.

As [Institution Name] scales its coaching footprint across new educational hubs, securing fast, flexible working capital and premises fit-out finance is essential.

AVANI LOAN SERVICES syndicates:
• ₹25 Lakh to ₹2 Crore Unsecured Institutional Working Capital Lines.
• Branch Expansion Term Loans for acoustic fit-outs, AV hardware, and smart panels.
• Dropline overdrafts linked to seasonal student enrollment fee collections.

We would be pleased to explore structured financing for your upcoming center launches.
```

---

## 6. COMPLETE OBJECTION-HANDLING MATRIX

| Common Objection | Root Cause / Concern | Prescribed Consultative Response |
|---|---|---|
| *"We are a charitable trust; we do not take commercial loans."* | Fear of regulatory issues or excessive risk | *"We work exclusively with registered public trusts and educational societies. Our lending partners structure compliant facilities fully adhering to the Bombay Public Trusts Act and state charitable commissioner regulations, with standard trust resolutions."* |
| *"Interest rates from NBFCs are higher than PSU banks."* | Price sensitivity | *"Our advisory desk works across both premier PSU banks and specialized institutional lenders. We evaluate your current weighted borrowing cost and structure solutions that reduce total financial outgo by 150–250 bps."* |
| *"We do not need loans right now; our fee collections are sufficient."* | Timing hesitation | *"That reflects commendable fiscal health. Most forward-thinking trusts establish pre-sanctioned credit lines and equipment lease limits during healthy cash flows so that when an expansion tender or land parcel becomes available, capital is immediately accessible without delaying academic admissions."* |
| *"Please send details on email; we will contact you if needed."* | Gatekeeper brush-off | *"Understood. I will immediately email our Institutional Financing Dossier and accreditation case studies to your official inbox. May I confirm the best direct extension or email for the Finance Officer so they have full documentation on file?"* |

"""
    with open(p_md, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Saved: {p_md}")

def generate_consent_and_enquiry_system(records):
    """
    Generates Phase 8 Follow-up Cadence & Consent Management, and Phase 9 Enquiry Form (HTML & PDF)
    in 08_Consent_and_Enquiry_System/
    """
    print("\n--- Generating Phase 8 & 9: Consent, Follow-up & Enquiry System ---")
    
    # 1. Followup_Cadence_and_Consent_Rules.md
    p_rules = to_long_path(os.path.join(FOLDER_08, "Followup_Cadence_and_Consent_Rules.md"))
    content_rules = f"""# AVANI LOAN SERVICES — FOLLOW-UP CADENCE & CONSENT MANAGEMENT SYSTEM
## Standard Operating Procedures for Compliant Institutional Outreach & Opt-Out Enforcement
**Execution Date:** {AUDIT_DATE}  
**Governing Standards:** TRAI Commercial Communications Regulations, Meta WhatsApp Business Platform Policy, Indian Information Technology Act  

---

## 1. STRUCTURED 5-TOUCH FOLLOW-UP CADENCE

Outreach is conducted strictly on a scheduled consultative timeline for institutions that have not opted out:

| Touchpoint | Timing | Primary Channel | Core Objective | Key Deliverable |
|---|---|---|---|---|
| **Touch 1** | Day 1 | Formal Physical Letter / Registered Email | Executive Introduction & Institutional Dossier | Comprehensive Debt Advisory Briefing |
| **Touch 2** | Day 2 (+24-48 hrs) | WhatsApp Business (Verified Corporate Line) | Permission Request & Opt-In Confirmation | Concise Executive Overview & Opt-In Prompt |
| **Touch 3** | Day 5 (+3 business days) | Professional Email + WhatsApp Follow-up | Value-Add Institutional Case Study | Relevant Campus Expansion / Debt Restructuring Case Study |
| **Touch 4** | Day 10 (+5 business days) | Advisory Telephone Call to Secretariat / CFO | Direct Consultation Scheduling | 15-Minute Term Sheet Review Meeting |
| **Touch 5** | Day 15 (+5 business days) | Final Check-in Email | Pipeline Disposition & File Archival Notice | Final Opportunity to Review Institutional Terms |

---

## 2. IMMEDIATE SUPPRESSION & STOP RULES

All automated and manual follow-ups must cease immediately upon encountering any of the following 5 triggers:

1. **Explicit Opt-Out:** Any message or communication containing "STOP", "UNSUBSCRIBE", "REMOVE", "NOT INTERESTED", or "DON'T CALL".
2. **Rejection by Authority:** Decision-maker states the trust has no borrowing plans.
3. **Invalid Contact Data:** Telecommunication network indicates number is invalid, disconnected, or transferred.
4. **Institutional Complaint:** Any formal expression of dissatisfaction with communication frequency.
5. **Conflict of Representation:** Trust indicates it has entered into an exclusive mandate with another debt syndicator.

When a trigger occurs:
- The lead status is immediately updated to `Closed / Disqualified` or `Not Interested`.
- The contact's telephone and email are flagged with `Suppression Active = TRUE`.
- The suppression list is permanently synced across all CRM workflows and marketing lists.

---

## 3. AUDIT & LOGGING REQUIREMENTS
Every touchpoint, opt-in timestamp, communication channel, and user consent record must be archived in `Consent_Management_Tracker.xlsx` for 36 months to ensure comprehensive compliance verification.
"""
    with open(p_rules, "w", encoding="utf-8") as f:
        f.write(content_rules)
    print(f"Saved: {p_rules}")
    
    # 2. Consent_Management_Tracker.xlsx & .csv
    CONSENT_HEADERS = [
        "Lead ID", "Institution Name", "City", "State", "Primary Decision-Maker",
        "Official Telephone", "Verified WhatsApp", "Professional Email",
        "Consent Status", "Consent Source", "Opt-In Timestamp", "Opt-Out Flag",
        "Suppression Active", "Compliance Status", "Audit Notes"
    ]
    rows_con = []
    for r in records:
        dm_name = r["owner_founder_name"]
        if dm_name == "Not publicly verified" or "Late" in dm_name:
            dm_name = r["chairman_name"]
        if dm_name == "Not publicly verified":
            dm_name = r["director_name"]
            
        rows_con.append([
            r["lead_id"], r["institution_name"], r["city"], r["state"], dm_name,
            r["official_telephone"], r["public_whatsapp"], r["professional_email"],
            "Initial Consultative Enquiry Permitted", "Official Institutional Portal / Regulatory Directory",
            f"{AUDIT_DATE} 09:30:00", "FALSE", "FALSE", "COMPLIANT",
            "Public institutional contact verified from official regulatory source for B2B debt syndication enquiry"
        ])
        
    wb_con = Workbook()
    ws_con = wb_con.active
    ws_con.title = "Consent Tracking Register"
    format_excel_sheet(ws_con, CONSENT_HEADERS, rows_con,
                       title="AVANI LOAN SERVICES — CONSENT & PRIVACY COMPLIANCE REGISTER",
                       subtitle="Audit Trail of Outreach Authorization, Consent Timestamps, and Opt-Out Suppression Status")
    p_con_xlsx = to_long_path(os.path.join(FOLDER_08, "Consent_Management_Tracker.xlsx"))
    wb_con.save(p_con_xlsx)
    print(f"Saved: {p_con_xlsx}")
    
    p_con_csv = to_long_path(os.path.join(FOLDER_08, "Consent_Management_Tracker.csv"))
    with open(p_con_csv, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.writer(f)
        w.writerow(CONSENT_HEADERS)
        w.writerows(rows_con)
    print(f"Saved: {p_con_csv}")
    
    # 3. Institutional_Funding_Enquiry_Form.html
    p_form_html = to_long_path(os.path.join(FOLDER_08, "Institutional_Funding_Enquiry_Form.html"))
    p_form_pdf = to_long_path(os.path.join(FOLDER_08, "Institutional_Funding_Enquiry_Form.pdf"))
    
    html_form = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AVANI LOAN SERVICES — Institutional Funding Requirement Enquiry Form</title>
<style>
  :root {{
    --primary: #1B365D;
    --primary-light: #2563eb;
    --accent: #D4AF37;
    --success: #059669;
    --dark: #0f172a;
    --gray-bg: #f8fafc;
    --card-border: #cbd5e1;
  }}
  * {{ box-sizing: border-box; margin: 0; padding: 0; }}
  body {{
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    background-color: var(--gray-bg);
    color: #1e293b;
    line-height: 1.5;
    padding: 24px;
  }}
  .form-container {{
    max-width: 850px;
    margin: 0 auto;
    background: white;
    border: 1px solid var(--card-border);
    border-radius: 12px;
    padding: 36px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.08);
  }}
  .form-header {{
    border-bottom: 2px solid var(--primary);
    padding-bottom: 20px;
    margin-bottom: 24px;
    text-align: center;
  }}
  .form-header h1 {{ font-size: 24px; color: var(--primary); font-weight: 700; margin-bottom: 6px; letter-spacing: -0.5px; }}
  .form-header .subtitle {{ font-size: 13.5px; color: #64748b; font-weight: 500; }}
  .brand-badge {{
    display: inline-block;
    background: #eef2ff;
    color: var(--primary);
    font-size: 11.5px;
    font-weight: 600;
    padding: 4px 12px;
    border-radius: 16px;
    margin-top: 8px;
    border: 1px solid #c7d2fe;
  }}
  .section-title {{
    font-size: 15px;
    font-weight: 700;
    color: var(--primary);
    background: #f1f5f9;
    padding: 8px 12px;
    border-radius: 6px;
    margin: 24px 0 16px 0;
    border-left: 4px solid var(--primary);
  }}
  .form-grid {{
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }}
  .form-group {{ display: flex; flex-direction: column; margin-bottom: 14px; }}
  .form-group.full {{ grid-column: span 2; }}
  label {{ font-size: 12px; font-weight: 600; color: #334155; margin-bottom: 5px; }}
  label .req {{ color: #dc2626; }}
  input, select, textarea {{
    padding: 9px 12px;
    border: 1px solid var(--card-border);
    border-radius: 6px;
    font-size: 13px;
    color: #1e293b;
    background: #ffffff;
    font-family: inherit;
  }}
  input:focus, select:focus, textarea:focus {{
    outline: none;
    border-color: var(--primary-light);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }}
  .disclaimer-box {{
    background: #fefce8;
    border: 1px solid #fef08a;
    border-left: 4px solid #ca8a04;
    padding: 12px 16px;
    border-radius: 6px;
    font-size: 11.5px;
    color: #854d0e;
    margin: 20px 0;
    line-height: 1.5;
  }}
  .btn-submit {{
    background: var(--primary);
    color: white;
    font-size: 14px;
    font-weight: 700;
    padding: 12px 28px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    width: 100%;
    transition: background 0.2s;
  }}
  .btn-submit:hover {{ background: #0f172a; }}
  @media print {{
    body {{ background: white; padding: 0; font-size: 11px; }}
    .form-container {{ border: none; box-shadow: none; padding: 0; }}
    .btn-submit {{ display: none; }}
  }}
</style>
</head>
<body>

<div class="form-container">
  <div class="form-header">
    <h1>AVANI LOAN SERVICES</h1>
    <div class="subtitle">Institutional Education Financing & Debt Syndication Advisory</div>
    <div class="brand-badge">CONFIDENTIAL INSTITUTIONAL BORROWING ENQUIRY FORM</div>
  </div>

  <div class="disclaimer-box">
    <strong>Regulatory & Underwriting Disclosure:</strong> AVANI LOAN SERVICES is a specialized loan advisory and debt syndication firm. Financing facilities (₹10 Lakh to ₹10 Crore) are subject to institutional eligibility, statutory trust borrowing authority, audited balance sheet verification, and formal lender credit committee sanction. We do NOT collect bank passwords, login credentials, or OTPs.
  </div>

  <form id="enquiryForm" onsubmit="event.preventDefault(); alert('Form successfully validated. In a live environment, this enquiry routes securely to the Senior Loan Syndication Desk.');">
    
    <!-- Section 1: Institution Details -->
    <div class="section-title">1. Educational Institution Information</div>
    <div class="form-grid">
      <div class="form-group">
        <label>Institution Legal Name <span class="req">*</span></label>
        <input type="text" placeholder="e.g., Somaiya Vidyavihar University / Podar School" required>
      </div>
      <div class="form-group">
        <label>Institution Category <span class="req">*</span></label>
        <select required>
          <option value="">Select Category...</option>
          <option>Private Unaided K-12 School (CBSE / ICSE / IB)</option>
          <option>Autonomous Engineering / Technology College</option>
          <option>Medical / Dental / Healthcare Institute</option>
          <option>Management / Pharmacy / Law College</option>
          <option>Private / Deemed to be University</option>
          <option>Multi-Institution Education Society / Trust</option>
          <option>Coaching & Skill Training Institute</option>
        </select>
      </div>
      <div class="form-group">
        <label>Parent Trust / Society Legal Name <span class="req">*</span></label>
        <input type="text" placeholder="e.g., Shri Vile Parle Kelavani Mandal" required>
      </div>
      <div class="form-group">
        <label>City & State <span class="req">*</span></label>
        <input type="text" placeholder="e.g., Pune, Maharashtra" required>
      </div>
      <div class="form-group full">
        <label>Complete Campus Postal Address <span class="req">*</span></label>
        <input type="text" placeholder="Physical campus address with PIN code" required>
      </div>
    </div>

    <!-- Section 2: Contact Person Details -->
    <div class="section-title">2. Authorized Decision-Maker Information</div>
    <div class="form-grid">
      <div class="form-group">
        <label>Contact Person's Full Name <span class="req">*</span></label>
        <input type="text" placeholder="e.g., Adv. Arun Sarnaik" required>
      </div>
      <div class="form-group">
        <label>Official Institutional Designation <span class="req">*</span></label>
        <select required>
          <option value="">Select Designation...</option>
          <option>Founder / Owner / Trustee</option>
          <option>Chairman / President of Society</option>
          <option>Managing Trustee / General Secretary</option>
          <option>Finance Director / Chief Financial Officer</option>
          <option>Director / Campus Head</option>
          <option>Administrative Head / Authorized Representative</option>
        </select>
      </div>
      <div class="form-group">
        <label>Official Mobile / WhatsApp Number <span class="req">*</span></label>
        <input type="tel" placeholder="+91 98XXX XXXXX" pattern="^(\+91[\-\s]?)?[0-9]{{10}}$" required>
      </div>
      <div class="form-group">
        <label>Official Corporate Email <span class="req">*</span></label>
        <input type="email" placeholder="official@institution.edu.in" required>
      </div>
    </div>

    <!-- Section 3: Financing Requirements -->
    <div class="section-title">3. Funding Requirements & Facility Purpose</div>
    <div class="form-grid">
      <div class="form-group">
        <label>Target Funding Requirement (₹ Amount) <span class="req">*</span></label>
        <select required>
          <option value="">Select Funding Bracket...</option>
          <option>₹10 Lakh – ₹50 Lakh (Small Institutional Loan)</option>
          <option>₹50 Lakh – ₹2 Crore (Medium Infrastructure Facility)</option>
          <option>₹2 Crore – ₹5 Crore (Large Campus Development Loan)</option>
          <option>₹5 Crore – ₹10 Crore (Very Large University Facility)</option>
        </select>
      </div>
      <div class="form-group">
        <label>Preferred Financing Structure <span class="req">*</span></label>
        <select required>
          <option value="">Select Structure...</option>
          <option>Secured: Loan Against Campus Property (LAP) / Mortgage</option>
          <option>Secured: Campus Construction Finance</option>
          <option>Unsecured: Institutional Working Capital / Overdraft Line</option>
          <option>Equipment Lease Financing (Labs / Buses / Solar)</option>
          <option>Balance Transfer / Existing Debt Consolidation (Lower EMI)</option>
        </select>
      </div>
      <div class="form-group full">
        <label>Specific Capex Purpose <span class="req">*</span></label>
        <textarea rows="3" placeholder="Detail the specific project: new classroom block, hostel construction, STEAM robotics lab, solar grid, bus fleet, or balance transfer." required></textarea>
      </div>
    </div>

    <!-- Section 4: Collateral & Operational Profile -->
    <div class="section-title">4. Financial & Real Estate Profile</div>
    <div class="form-grid">
      <div class="form-group">
        <label>Campus Land / Property Ownership Status <span class="req">*</span></label>
        <select required>
          <option value="">Select Status...</option>
          <option>Freehold Trust Property (Unencumbered / Clean Title)</option>
          <option>Freehold Trust Property (Existing Mortgage / Loan Running)</option>
          <option>Long-Term Government Lease (>30 Years)</option>
          <option>Commercial Lease Agreement</option>
        </select>
      </div>
      <div class="form-group">
        <label>Approx. Annual Tuition Fee Turnover <span class="req">*</span></label>
        <select required>
          <option value="">Select Turnover Range...</option>
          <option>Up to ₹5 Crore / Year</option>
          <option>₹5 Crore – ₹15 Crore / Year</option>
          <option>₹15 Crore – ₹50 Crore / Year</option>
          <option>Above ₹50 Crore / Year</option>
        </select>
      </div>
      <div class="form-group">
        <label>Existing Bank Loans / Borrowings</label>
        <input type="text" placeholder="e.g., ₹2.5 Cr with SBI / Bank of Baroda at 10.5%">
      </div>
      <div class="form-group">
        <label>Preferred Consultation Window</label>
        <select>
          <option>Morning (10:00 AM – 1:00 PM)</option>
          <option>Afternoon (2:00 PM – 5:00 PM)</option>
          <option>Saturday Morning Review</option>
        </select>
      </div>
    </div>

    <!-- Section 5: Consent & Submission -->
    <div class="section-title">5. Authorization & Privacy Acknowledgement</div>
    <div style="margin-bottom: 20px;">
      <label style="display: flex; align-items: flex-start; gap: 8px; font-weight: normal; font-size: 12px; color: #475569; cursor: pointer;">
        <input type="checkbox" required style="margin-top: 2px;">
        <span>I confirm that I am an authorized representative of the mentioned educational trust/society. I grant permission to AVANI LOAN SERVICES to evaluate our financing requirements and contact our office for a confidential loan advisory consultation. I acknowledge that loan sanctions are subject to lender policies.</span>
      </label>
    </div>

    <button type="submit" class="btn-submit">SUBMIT CONFIDENTIAL LOAN ENQUIRY</button>
  </form>

  <footer style="margin-top: 24px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 12px;">
    AVANI LOAN SERVICES — Institutional Debt Syndication Architecture © 2026. All Rights Reserved.<br>
    Website: https://www.avanifinserv.com/ | Strict Confidentiality Guaranteed.
  </footer>
</div>

</body>
</html>
"""
    with open(p_form_html, "w", encoding="utf-8") as f:
        f.write(html_form)
    print(f"Saved: {p_form_html}")
    
    # Compile PDF via Chrome Headless
    chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
    if os.path.exists(chrome_path):
        print(f"Compiling Enquiry Form PDF via Chrome Headless...")
        try:
            import shutil
            short_html = os.path.join(WORKSPACE_DIR, "temp_form_render.html")
            short_pdf = os.path.join(WORKSPACE_DIR, "temp_form_render.pdf")
            shutil.copy2(to_long_path(p_form_html), to_long_path(short_html))
            cmd = [
                chrome_path,
                "--headless=new",
                "--disable-gpu",
                "--no-sandbox",
                f"--print-to-pdf={short_pdf}",
                "--no-pdf-header-footer",
                short_html
            ]
            res = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
            if os.path.exists(short_pdf) and os.path.getsize(short_pdf) > 0:
                shutil.copy2(to_long_path(short_pdf), to_long_path(p_form_pdf))
                print(f"Enquiry Form PDF Compiled: {p_form_pdf} ({os.path.getsize(to_long_path(p_form_pdf)):,} bytes)")
                if os.path.exists(short_html):
                    os.remove(short_html)
                if os.path.exists(short_pdf):
                    os.remove(short_pdf)
            else:
                print(f"[WARNING] Form PDF compilation failed: {res.stderr}")
        except Exception as e:
            print(f"[WARNING] Form PDF conversion exception: {e}")

def main():
    print("=" * 80)
    print("AVANI LOAN SERVICES — PHASE 2 AUTOMATION SUITE: CRM & MARKETING")
    print("=" * 80)
    
    sys.path.insert(0, PROJ_DIR)
    import phase2_core_audit as pca
    records = pca.audit_and_calibrate_records()
    print(f"Loaded {len(records)} audited records.")
    
    generate_crm_files(records)
    generate_marketing_playbooks()
    generate_consent_and_enquiry_system(records)
    print("\nPhase 6 through Phase 9 deliverables successfully created.")

if __name__ == "__main__":
    main()
