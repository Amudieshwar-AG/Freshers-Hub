import requests
import json
import re
import os
from urllib.parse import urljoin
from bs4 import BeautifulSoup

def scrape_routes():
    base_url = "https://www.rittransport.com/"
    index_url = urljoin(base_url, "js/51jan26.php")
    
    print(f"Fetching index from {index_url}...")
    res = requests.get(index_url)
    res.encoding = 'utf-8'
    soup = BeautifulSoup(res.text, 'html.parser')
    
    routes = []
    # Find table
    table = soup.find('table')
    if not table:
        print("No table found on index page.")
        return
        
    rows = table.find_all('tr')
    for row in rows:
        cells = row.find_all('td')
        if len(cells) < 4:
            continue
        
        sno = cells[0].get_text(strip=True)
        rno = cells[1].get_text(strip=True)
        rname = cells[2].get_text(strip=True)
        
        # Link is in cells[3] (Timing column)
        link_tag = cells[3].find('a')
        if not link_tag or not link_tag.get('href'):
            continue
            
        href = link_tag.get('href')
        detail_url = urljoin("https://www.rittransport.com/js/", href.strip())
        
        start_time = cells[4].get_text(strip=True)
        
        routes.append({
            "number": rno,
            "name": rname,
            "detail_url": detail_url,
            "start_time": start_time
        })
        
    print(f"Found {len(routes)} routes. Fetching details...")
    
    detailed_routes = []
    
    # Colors for frontend UI
    colors = [
        '#F97316', '#3B82F6', '#10B981', '#8B5CF6', '#EF4444', 
        '#EC4899', '#06B6D4', '#F59E0B', '#14B8A6', '#6366F1'
    ]
    
    for i, r in enumerate(routes):
        try:
            detail_res = requests.get(r['detail_url'])
            detail_res.encoding = 'utf-8'
            html_content = detail_res.text
            
            dsoup = BeautifulSoup(html_content, 'html.parser')
            stops = []
            detail_rows = dsoup.find_all('tr')
            
            for drow in detail_rows:
                tds = drow.find_all('td')
                if len(tds) >= 2:
                    stop_name = tds[0].get_text(strip=True)
                    stop_time = tds[1].get_text(strip=True)
                    
                    stop_name = re.sub(r'\s+', ' ', stop_name).strip()
                    stop_time = re.sub(r'\s+', ' ', stop_time).strip()
                    
                    if stop_name and not stop_name.startswith("R-") and not "Boarding" in stop_name:
                        # Normalize time format
                        stop_time = stop_time.replace('.', ':')
                        if ':' in stop_time:
                            parts = stop_time.split()
                            time_part = parts[0]
                            ampm_part = parts[1].upper() if len(parts) > 1 else "AM"
                            h_m = time_part.split(':')
                            if len(h_m) == 2:
                                h, m = h_m[0].strip(), h_m[1].strip()
                                h = "".join(filter(str.isdigit, h))
                                m = "".join(filter(str.isdigit, m))
                                if h and m:
                                    h_int = int(h)
                                    h_str = f"{h_int:02d}"
                                    m_str = f"{int(m):02d}"
                                    stop_time = f"{h_str}:{m_str} {ampm_part}"
                        
                        stops.append({
                            "name": stop_name,
                            "time": stop_time
                        })
            
            if len(stops) > 0:
                from_point = stops[0]['name']
                to_point = stops[-1]['name']
                departure_time = stops[0]['time']
                arrival_time = stops[-1]['time']
            else:
                from_point = r['name']
                to_point = "RIT Campus"
                departure_time = r['start_time']
                arrival_time = "07:40 AM"
                
            detailed_routes.append({
                "number": r['number'],
                "name": r['name'] + " Route",
                "from": from_point,
                "to": to_point,
                "departureTime": departure_time,
                "arrivalTime": arrival_time,
                "color": colors[i % len(colors)],
                "stops": stops
            })
        except Exception as e:
            print(f"Error scraping {r['number']}: {e}")
            
    # Save directly to the backend resources folder
    target_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend", "src", "main", "resources"))
    if not os.path.exists(target_dir):
        os.makedirs(target_dir, exist_ok=True)
    output_path = os.path.join(target_dir, "bus_routes.json")
    
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(detailed_routes, f, indent=2)
    print(f"Scraping completed. Saved to {output_path}.")

if __name__ == "__main__":
    scrape_routes()
