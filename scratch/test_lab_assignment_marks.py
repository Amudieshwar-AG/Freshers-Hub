import urllib.request
import urllib.parse
import http.cookiejar
import re

cj = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))

login_url = "https://ims.rajalakshmi.edu.in/ims/login"

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
}

# Step 1: GET login page
req = urllib.request.Request(login_url, headers=headers)
with opener.open(req) as resp:
    html = resp.read().decode('utf-8')

csrf_m = re.search(r'name="_token"\s+value="([^"]+)"', html)
csrf_token = csrf_m.group(1) if csrf_m else ''
print(f"CSRF Token: {csrf_token}")

# Step 2: POST login
post_data = urllib.parse.urlencode({
    '_token': csrf_token,
    'username': '2117240070293',
    'password': '7010406809'
}).encode('utf-8')

req_post = urllib.request.Request(login_url, data=post_data, headers=headers)
with opener.open(req_post) as resp_post:
    dash_html = resp_post.read().decode('utf-8')

print(f"Login success! Dash HTML length: {len(dash_html)}")

# Step 3: Find all <a> hrefs containing lab or assignment or mark or report
all_links = re.findall(r'<a[^>]+href="([^"]+)"[^>]*>(.*?)</a>', dash_html, re.DOTALL)
print(f"Total links found: {len(all_links)}")

for href, label in all_links:
    clean_label = re.sub(r'<[^>]+>', '', label).strip()
    clean_label_lower = clean_label.lower()
    if 'lab' in clean_label_lower or 'assignment' in clean_label_lower or 'mark' in clean_label_lower or 'grade' in clean_label_lower or 'cat' in clean_label_lower:
        print(f"Link: '{clean_label}' -> Href: '{href}'")

# Also search for all hrefs in the full HTML to be sure
all_hrefs = re.findall(r'href="([^"]+)"', dash_html)
print("\n--- ALL UNIQUE HREFS IN DASHBOARD ---")
for h in set(all_hrefs):
    if 'admin' in h or 'student' in h or 'mark' in h or 'report' in h:
        print(" ", h)
