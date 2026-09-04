const fs = require('fs');

// Input transcript (from Copilot chat workspace)
const infile = 'c:\\Users\\ALPHA-1\\AppData\\Roaming\\Code\\User\\workspaceStorage\\e807ac1835b589d10f3be0b50a13d615\\GitHub.copilot-chat\\transcripts\\8f30a7ae-814b-42b2-a709-5959ef8b88ef.jsonl';
const outfile = 'c:\\Users\\ALPHA-1\\Desktop\\AVANI LOAN SERVICE FY 26-27\\VAPI_Chats_2026-05-13.csv';

const dateMarker = '2026-05-13';
const keywords = [
  'vapi', 'vapi.ai', 'vapi dashboard', 'vapi_service', 'vapiservice', 'webhook', 'assistant', 'assistants', 'vapiService', 'callId', 'make.com', 'hubspot', 'exotel'
];

function safe(str) {
  if (str === undefined || str === null) return '';
  return String(str).replace(/\r?\n/g, ' ').replace(/"/g, '""');
}

try {
  const raw = fs.readFileSync(infile, 'utf8');
  const lines = raw.split(/\r?\n/);
  const out = [];
  out.push('Timestamp,Speaker,Message');

  for (const line of lines) {
    if (!line || line.trim().length === 0) continue;
    if (!line.includes(dateMarker)) continue; // only entries from the requested date

    const low = line.toLowerCase();
    let matched = false;
    for (const k of keywords) {
      if (low.includes(k.toLowerCase())) { matched = true; break; }
    }
    if (!matched) continue;

    try {
      const obj = JSON.parse(line);
      const ts = obj.timestamp || (obj.data && obj.data.timestamp) || '';
      let speaker = '';
      if (obj.type && obj.type.toLowerCase().includes('assistant')) speaker = 'assistant';
      else if (obj.type && obj.type.toLowerCase().includes('user')) speaker = 'user';
      else speaker = obj.type || 'system';

      let msg = '';
      if (obj.data && typeof obj.data.content === 'string' && obj.data.content.trim() !== '') {
        msg = obj.data.content;
      } else {
        // Fallback: stringify the data object (tool calls, reasonings etc.)
        msg = JSON.stringify(obj.data || obj, null, 0);
      }

      out.push(`"${safe(ts)}","${safe(speaker)}","${safe(msg)}"`);
    } catch (err) {
      // If JSON parse fails, include raw
      out.push(`"","raw","${safe(line)}"`);
    }
  }

  fs.writeFileSync(outfile, out.join('\n'), 'utf8');
  console.log('Wrote', outfile, 'rows:', out.length - 1);
} catch (err) {
  console.error('Failed to extract transcript:', err);
  process.exit(1);
}
