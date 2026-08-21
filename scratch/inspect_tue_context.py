import re

with open('real_timetable.html', 'r', encoding='utf-8') as f:
    content = f.read()

print("File length:", len(content))
# Search for Tuesday in content
tue_matches = [m.start() for m in re.finditer(r'tuesday', content, re.IGNORECASE)]
print("Tuesday matches at indices:", tue_matches)

for pos in tue_matches[:3]:
    print("\n--- Context around Tuesday ---")
    print(content[max(0, pos-200):min(len(content), pos+400)])
