import re

with open('real_timetable.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Find rows in the timetable table
rows = re.findall(r'<tr[^>]*>(.*?)</tr>', content, re.DOTALL)
print(f"Total tr rows: {len(rows)}")

for idx, r in enumerate(rows):
    if 'tuesday' in r.lower() or 'tue' in r.lower():
        print(f"\n--- ROW {idx} (TUESDAY) ---")
        tds = re.findall(r'<td[^>]*>(.*?)</td>', r, re.DOTALL)
        print(f"Total td cells in Tuesday row: {len(tds)}")
        for col_i, td in enumerate(tds):
            clean_td = ' '.join(re.sub(r'<[^>]+>', ' ', td).split())
            forms_in_td = re.findall(r'<form[^>]*>(.*?)</form>', td, re.DOTALL)
            print(f"  Col {col_i}: forms_count={len(forms_in_td)} | text={clean_td[:80]}")
