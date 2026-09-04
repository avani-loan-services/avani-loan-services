import json
import csv

infile = r"c:\Users\ALPHA-1\AppData\Roaming\Code\User\workspaceStorage\e807ac1835b589d10f3be0b50a13d615\GitHub.copilot-chat\transcripts\8f30a7ae-814b-42b2-a709-5959ef8b88ef.jsonl"
outfile = r"c:\Users\ALPHA-1\Desktop\AVANI LOAN SERVICE FY 26-27\VAPI_Chats_2026-05-13.csv"

date_marker = '2026-05-13'
keywords = [
    'vapi', 'vapi.ai', 'vapi dashboard', 'vapi_service', 'vapiservice', 'webhook', 'assistant', 'assistants',
    'vapiservice', 'vapiService', 'callid', 'make.com', 'hubspot', 'exotel', 'webhook', 'vapi_service'
]
keywords = [k.lower() for k in keywords]

count = 0
with open(infile, 'r', encoding='utf-8') as fin, open(outfile, 'w', newline='', encoding='utf-8') as fout:
    writer = csv.writer(fout)
    writer.writerow(['Timestamp', 'Speaker', 'Message'])
    for line in fin:
        if date_marker not in line:
            continue
        low = line.lower()
        if not any(k in low for k in keywords):
            continue
        try:
            obj = json.loads(line)
        except Exception as e:
            writer.writerow(['', 'raw', line.strip()])
            count += 1
            continue
        ts = obj.get('timestamp', '')
        typ = obj.get('type', '')
        if isinstance(typ, str) and 'assistant' in typ.lower():
            speaker = 'assistant'
        elif isinstance(typ, str) and 'user' in typ.lower():
            speaker = 'user'
        else:
            # some messages might be tool events or system
            speaker = typ or 'system'

        data = obj.get('data', {})
        msg = ''
        if isinstance(data, dict) and isinstance(data.get('content', None), str) and data.get('content').strip():
            msg = data.get('content').strip()
        else:
            # fallback: stringify useful parts
            try:
                msg = json.dumps(data, ensure_ascii=False)
            except Exception:
                msg = str(data)

        # normalize whitespace
        msg = ' '.join(msg.split())
        writer.writerow([ts, speaker, msg])
        count += 1

print(f'Wrote {count} rows to: {outfile}')
