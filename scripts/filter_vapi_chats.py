import csv
from pathlib import Path

root = Path(__file__).resolve().parents[1]
input_csv = root / 'VAPI_Chats_2026-05-13.csv'
assistant_out = root / 'VAPI_Chats_assistant_2026-05-13.csv'
user_out = root / 'VAPI_Chats_user_2026-05-13.csv'
system_out = root / 'VAPI_Chats_system_2026-05-13.csv'
assistant_kw_out = root / 'VAPI_Chats_assistant_keywords_2026-05-13.csv'

keywords = ['vapi','vapi.ai','webhook','assistant','exotel','hubspot','make.com','callid']

counts = {'assistant':0,'user':0,'system':0,'assistant_kw':0}

with input_csv.open('r', encoding='utf-8-sig', newline='') as fin:
    reader = csv.DictReader(fin)
    headers = reader.fieldnames

    with assistant_out.open('w', encoding='utf-8', newline='') as fa:
        with user_out.open('w', encoding='utf-8', newline='') as fu:
            with system_out.open('w', encoding='utf-8', newline='') as fs:
                with assistant_kw_out.open('w', encoding='utf-8', newline='') as fkw:

                    wa = csv.DictWriter(fa, fieldnames=headers)
                    wu = csv.DictWriter(fu, fieldnames=headers)
                    ws = csv.DictWriter(fs, fieldnames=headers)
                    wkw = csv.DictWriter(fkw, fieldnames=headers)

                    wa.writeheader()
                    wu.writeheader()
                    ws.writeheader()
                    wkw.writeheader()

                    for row in reader:
                        speaker = (row.get('Speaker') or '').strip().lower()
                        message = (row.get('Message') or '').lower()

                        if speaker == 'assistant':
                            wa.writerow(row)
                            counts['assistant'] += 1
                            if any(k in message for k in keywords):
                                wkw.writerow(row)
                                counts['assistant_kw'] += 1
                        elif speaker == 'user':
                            wu.writerow(row)
                            counts['user'] += 1
                        else:
                            ws.writerow(row)
                            counts['system'] += 1

print('WROTE:')
print(f"  assistant -> {assistant_out} ({counts['assistant']} rows)")
print(f"  assistant (keywords) -> {assistant_kw_out} ({counts['assistant_kw']} rows)")
print(f"  user -> {user_out} ({counts['user']} rows)")
print(f"  system/tool -> {system_out} ({counts['system']} rows)")
