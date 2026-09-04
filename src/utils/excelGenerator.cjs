// src/utils/excelGenerator.js
// ─────────────────────────────────────────────────────────────────
// Generates a premium‑styled Excel workbook using exceljs.
// Columns: Timestamp, Name, Phone, Email, Loan Type, Amount, City,
//          Source, Status, AI Call ID, Document, Bank, Account No.,
//          Salary (₹), Net Income (₹), PAN, Aadhaar, Eligibility
// ─────────────────────────────────────────────────────────────────
const Excel = require('exceljs');
const path  = require('path');
const fs    = require('fs');

const HEADER_COLOR  = 'FF1B3A6B';   // Deep navy blue
const ODD_ROW_COLOR = 'FFE8F0FE';   // Light blue
const EVN_ROW_COLOR = 'FFFFFFFF';   // White

async function generateExcel(parsedDocs, meta = {}) {
  const workbook  = new Excel.Workbook();
  workbook.creator = 'Avani Loan Services';
  workbook.created = new Date();

  // ── Sheet 1: Summary ──────────────────────────────────────────
  const summary = workbook.addWorksheet('Customer Summary');
  summary.columns = [
    { header: 'Timestamp',   key: 'timestamp',  width: 22 },
    { header: 'Name',        key: 'name',       width: 22 },
    { header: 'Phone',       key: 'phone',      width: 16 },
    { header: 'Email',       key: 'email',      width: 28 },
    { header: 'Loan Type',   key: 'loanType',   width: 18 },
    { header: 'Amount (₹)', key: 'amount',     width: 16, style: { numFmt: '#,##0' } },
    { header: 'City',        key: 'city',       width: 16 },
    { header: 'Source',      key: 'source',     width: 16 },
    { header: 'Status',      key: 'status',     width: 14 },
    { header: 'AI Call ID',  key: 'aiCallId',   width: 22 },
  ];
  styleHeader(summary);
  summary.addRow({
    timestamp: meta.timestamp || new Date().toISOString(),
    name     : meta.name      || '',
    phone    : meta.phone     || '',
    email    : meta.email     || '',
    loanType : meta.loanType  || '',
    amount   : Number(meta.amount) || 0,
    city     : meta.city      || '',
    source   : meta.source    || '',
    status   : meta.status    || 'Pending',
    aiCallId : meta.aiCallId  || ''
  });
  styleDataRows(summary);

  // ── Sheet 2: Document Analysis ────────────────────────────────
  const docSheet = workbook.addWorksheet('Document Analysis');
  docSheet.columns = [
    { header: 'Document',       key: 'document',   width: 30 },
    { header: 'Bank',           key: 'bank',       width: 22 },
    { header: 'Account No.',    key: 'account',    width: 20 },
    { header: 'Salary (₹)',    key: 'salary',     width: 16, style: { numFmt: '#,##0' } },
    { header: 'Net Income (₹)',key: 'netIncome',  width: 18, style: { numFmt: '#,##0' } },
    { header: 'PAN',            key: 'pan',        width: 14 },
    { header: 'Aadhaar',        key: 'aadhaar',    width: 18 },
    { header: 'Eligibility',    key: 'eligibility',width: 18 },
    { header: 'Annual Income',  key: 'annual',     width: 18, style: { numFmt: '#,##0' } },
  ];
  styleHeader(docSheet);

  parsedDocs.forEach((item, idx) => {
    const rowNum = idx + 2;
    docSheet.addRow({
      document : item.document  || '',
      bank     : item.bank      || '',
      account  : item.account   || '',
      salary   : item.salary    || 0,
      netIncome: item.netIncome || 0,
      pan      : item.pan       || '',
      aadhaar  : item.aadhaar   || '',
      eligibility: '',   // formula below
      annual   : 0,      // formula below
    });
    // Eligibility formula: IF(netIncome*60 >= amount, "Eligible", "Not Eligible")
    docSheet.getCell(`H${rowNum}`).value = {
      formula: `IF(E${rowNum}*60>=${Number(meta.amount) || 500000},"✅ Eligible","❌ Not Eligible")`
    };
    // Annualised net income
    docSheet.getCell(`I${rowNum}`).value = { formula: `E${rowNum}*12` };
  });

  styleDataRows(docSheet);
  docSheet.autoFilter = { from: 'A1', to: 'I1' };

  // ── Save file ──────────────────────────────────────────────────
  const outDir  = process.env.VERCEL
    ? '/tmp/uploads/eligibility'
    : (process.env.ELIGIBILITY_UPLOAD_DIR || path.join(__dirname, '../../uploads/eligibility'));
  try {
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  } catch (e) {
    console.warn('[excelGenerator] Could not create outDir:', e.message);
  }
  const fileName = `Eligibility_Report_${Date.now()}.xlsx`;
  const outPath  = path.join(outDir, fileName);
  await workbook.xlsx.writeFile(outPath);
  return outPath;
}

// ── Helpers ───────────────────────────────────────────────────────
function styleHeader(ws) {
  const headerRow = ws.getRow(1);
  headerRow.eachCell(cell => {
    cell.font      = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11, name: 'Calibri' };
    cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_COLOR } };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border    = {
      bottom: { style: 'medium', color: { argb: 'FFD4AF37' } }
    };
  });
  headerRow.height = 28;
}

function styleDataRows(ws) {
  ws.eachRow((row, rowNum) => {
    if (rowNum === 1) return;
    const fillColor = rowNum % 2 === 0 ? ODD_ROW_COLOR : EVN_ROW_COLOR;
    row.eachCell({ includeEmpty: true }, cell => {
      cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: fillColor } };
      cell.alignment = { vertical: 'middle', horizontal: 'left' };
      cell.font      = { size: 10, name: 'Calibri' };
    });
    row.height = 20;
  });
}

module.exports = { generateExcel };
