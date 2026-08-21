import re

with open('real_timetable.html', 'r', encoding='utf-8') as f:
    content = f.read()

forms = re.findall(r'<form[^>]*class="[^"]*period_form[^"]*"[^>]*>(.*?)</form>', content, re.DOTALL)
print(f"Total forms found: {len(forms)}")

by_day = {}
for form in forms:
    day_m = re.search(r'name="day"\s+value="([^"]+)"', form)
    per_m = re.search(r'name="period"\s+value="([^"]+)"', form)
    day = day_m.group(1).lower() if day_m else 'unknown'
    per = per_m.group(1) if per_m else '0'
    by_day.setdefault(day, []).append((per, form))

for day in sorted(by_day.keys()):
    print(f"\n=== DAY: {day.upper()} (Count: {len(by_day[day])}) ===")
    for per, form in by_day[day]:
        primaries = re.findall(r'class="[^"]*text-primary[^"]*"[^>]*>(.*?)</span>', form, re.DOTALL)
        clean_p = [re.sub(r'<[^>]+>', '', p).strip() for p in primaries]
        full_txt = re.sub(r'<[^>]+>', ' ', form).strip()
        full_txt = ' '.join(full_txt.split())
        print(f"  Period {per}: primaries={clean_p} | full_txt={full_txt[:100]}")
