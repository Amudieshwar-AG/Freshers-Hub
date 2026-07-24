"""
Download all RIT Transport map pages (map00.php - map45.php) live,
parse their stops and polyline coordinates, and output map_coordinates.json.
"""

import os
import re
import json
import time
import requests

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
MAP_PAGES_DIR = os.path.join(CURRENT_DIR, "map_pages")
MAP_COORDS_OUTPUT = os.path.join(CURRENT_DIR, "map_coordinates.json")

os.makedirs(MAP_PAGES_DIR, exist_ok=True)


def download_maps():
    print("Downloading RIT transport map pages live from fit25.com...")
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    
    downloaded_count = 0
    # Try downloading maps from 00 to 45
    for i in range(46):
        url = f"https://fit25.com/ritRouteMap/map{i:02d}.php?cb={int(time.time())}"
        filepath = os.path.join(MAP_PAGES_DIR, f"map{i:02d}.html")
        try:
            print(f"Fetching Map {i:02d}: {url} ...")
            res = requests.get(url, headers=headers, timeout=15)
            if res.status_code == 200:
                html = res.text
                if "newpoints" in html or "GPolyline" in html:
                    with open(filepath, "w", encoding="utf-8") as f:
                        f.write(html)
                    print(f"  -> Saved {len(html)} bytes to {os.path.basename(filepath)}")
                    downloaded_count += 1
                else:
                    print(f"  -> Skipped (no map data found in response)")
            else:
                print(f"  -> Skipped (status code {res.status_code})")
            
            # Respectful delay
            time.sleep(0.5)
        except Exception as e:
            print(f"  -> Error fetching map {i:02d}: {e}")
            time.sleep(1.0)
            
    print(f"Downloaded {downloaded_count} map page HTML files.")


def extract_stops(html_text: str) -> list:
    stops = []
    # Regex to capture newpoints entries, handling potential whitespace variation
    pattern = re.compile(
        r"new\s+Array\s*\(\s*"
        r"([\d.]+)\s*,\s*([\d.]+)\s*,"
        r"\s*[^,]+\s*,"
        r"\s*[^,]+\s*,"
        r"\s*'([^']*)'"
        r"\s*\)",
        re.IGNORECASE
    )
    for m in pattern.finditer(html_text):
        try:
            lat = float(m.group(1))
            lng = float(m.group(2))
            label = m.group(3).strip()
            
            # Match formats like:
            # - 'Route no:1  -  Lift Gate'
            # - 'Route no:9Vyasarpadi'
            # - 'Route no: 9MKB Nagar'
            # - 'Route no:13 - ICF'
            # - 'Route no:14A - Kakallur'
            label_match = re.search(r"Route\s+no\s*:\s*([a-zA-Z0-9]+)\s*-?\s*(.*)", label, re.IGNORECASE)
            if label_match:
                route_num = label_match.group(1).strip()
                stop_name = label_match.group(2).strip()
                # Clean up multiple spaces or hyphens in stop name
                stop_name = re.sub(r'^-?\s*', '', stop_name)
                stop_name = " ".join(stop_name.split())
                if stop_name:
                    stops.append({"route_num": route_num, "name": stop_name, "lat": lat, "lng": lng})
        except Exception as e:
            print(f"  Error parsing stop line: {m.group(0)} - {e}")
    return stops


def extract_polylines(html_text: str) -> list:
    polylines = []
    poly_pattern = re.compile(r"GPolyline\s*\(\s*\[(.*?)\]", re.DOTALL | re.IGNORECASE)
    coord_pattern = re.compile(r"GLatLng\s*\(\s*([\d.]+)\s*,\s*([\d.]+)\s*\)")
    for poly_match in poly_pattern.finditer(html_text):
        block = poly_match.group(1)
        coords = []
        for coord_match in coord_pattern.finditer(block):
            coords.append([float(coord_match.group(1)), float(coord_match.group(2))])
        if coords:
            polylines.append(coords)
    return polylines


def merge_polylines(polylines):
    if not polylines:
        return []
    merged = list(polylines[0])
    for seg in polylines[1:]:
        if not seg:
            continue
        if merged and seg:
            last = merged[-1]
            first = seg[0]
            # Connect if close, else just extend
            if abs(last[0] - first[0]) < 0.001 and abs(last[1] - first[1]) < 0.001:
                seg = seg[1:]
        merged.extend(seg)
    return merged


def parse_and_save_coordinates():
    print("\nParsing downloaded map HTML files...")
    all_routes = {}

    html_files = sorted([f for f in os.listdir(MAP_PAGES_DIR) if f.endswith(".html")])
    if not html_files:
        print("Error: No downloaded HTML files found in map_pages directory!")
        return

    for filename in html_files:
        filepath = os.path.join(MAP_PAGES_DIR, filename)
        print(f"Parsing {filename} ...")
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()

        stops = extract_stops(content)
        polylines = extract_polylines(content)
        merged_poly = merge_polylines(polylines)

        if not stops and not polylines:
            print(f"  -> No data parsed")
            continue

        route_nums = set()
        for s in stops:
            rn = s["route_num"]
            # Clean route num (e.g. '01' -> '1', '14A' -> '14A')
            rn_clean = re.sub(r'^0+', '', rn)
            route_nums.add(rn_clean)
            key = f"R{rn_clean}"
            if key not in all_routes:
                all_routes[key] = {"stops": [], "polyline": []}
            all_routes[key]["stops"].append({
                "name": s["name"],
                "lat": s["lat"],
                "lng": s["lng"]
            })

        if merged_poly:
            # If stops are all for a single route, assign the polyline to it
            if len(route_nums) == 1:
                rn = list(route_nums)[0]
                key = f"R{rn}"
                existing = all_routes.get(key, {}).get("polyline", [])
                if existing:
                    all_routes[key]["polyline"] = merge_polylines([existing, merged_poly])
                else:
                    all_routes[key]["polyline"] = merged_poly
            # Otherwise, try parsing route number from polyline variable comments or assign to all routes found
            else:
                # Fallback: assign polyline to all routes mentioned in this file
                for rn in sorted(route_nums):
                    key = f"R{rn}"
                    if not all_routes[key].get("polyline"):
                        all_routes[key]["polyline"] = merged_poly

        print(f"  -> Found {len(stops)} stops, {len(polylines)} polyline segments. Associated routes: {sorted(route_nums)}")

    # Deduplicate stops for each route
    for key, data in all_routes.items():
        seen = set()
        unique = []
        for s in data["stops"]:
            ident = (s["name"].lower().strip(), round(s["lat"], 5), round(s["lng"], 5))
            if ident not in seen:
                seen.add(ident)
                unique.append(s)
        data["stops"] = unique

    with open(MAP_COORDS_OUTPUT, "w", encoding="utf-8") as f:
        json.dump(all_routes, f, indent=2, ensure_ascii=False)

    total_stops = sum(len(d["stops"]) for d in all_routes.values())
    total_wp = sum(len(d["polyline"]) for d in all_routes.values())
    print(f"\nDone! Scraped {len(all_routes)} routes, {total_stops} stops, {total_wp} polyline waypoints.")
    print(f"Output saved to: {MAP_COORDS_OUTPUT}")


if __name__ == "__main__":
    download_maps()
    parse_and_save_coordinates()
