"""
Save all RIT Transport map pages (map01.php - map29.php) to local HTML files.
Uses read_url_content results that are already saved, or can be run after
manually downloading with a tool that handles JS challenge pages.

This script reads downloaded .md content files and re-saves them as .html
for parsing by scrape_map_coordinates.py.
"""

import os
import glob
import re
import json

STEPS_DIR = r"C:\Users\dorut\.gemini\antigravity-ide\brain\3efb5b3c-ca4b-435b-a851-7cc558e7691b\.system_generated\steps"
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "map_pages")
MAP_COORDS_OUTPUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "map_coordinates.json")

os.makedirs(OUTPUT_DIR, exist_ok=True)


def extract_stops(js_text: str) -> list:
    stops = []
    pattern = re.compile(
        r"new\s+Array\s*\(\s*"
        r"([\d.]+)\s*,\s*([\d.]+)\s*,"
        r"\s*\w+\s*,"
        r"\s*'[^']*'\s*,"
        r"\s*'([^']*)'"
        r"\s*\)",
        re.IGNORECASE
    )
    for m in pattern.finditer(js_text):
        lat = float(m.group(1))
        lng = float(m.group(2))
        label = m.group(3).strip()
        label_match = re.match(r"Route\s+no\s*:\s*(\d+)\s*-\s*(.*)", label, re.IGNORECASE)
        if label_match:
            route_num = label_match.group(1).strip()
            stop_name = label_match.group(2).strip()
            if stop_name:
                stops.append({"route_num": route_num, "name": stop_name, "lat": lat, "lng": lng})
    return stops


def extract_polylines(js_text: str) -> list:
    polylines = []
    poly_pattern = re.compile(r"GPolyline\s*\(\s*\[(.*?)\]", re.DOTALL | re.IGNORECASE)
    coord_pattern = re.compile(r"GLatLng\s*\(\s*([\d.]+)\s*,\s*([\d.]+)\s*\)")
    for poly_match in poly_pattern.finditer(js_text):
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
            if abs(last[0] - first[0]) < 0.001 and abs(last[1] - first[1]) < 0.001:
                seg = seg[1:]
        merged.extend(seg)
    return merged


def find_map_content_files():
    """Find all content.md files from read_url_content that contain ritRouteMap."""
    results = {}
    for step_dir in glob.glob(os.path.join(STEPS_DIR, "*")):
        content_file = os.path.join(step_dir, "content.md")
        if os.path.exists(content_file):
            try:
                with open(content_file, "r", encoding="utf-8") as f:
                    content = f.read()
                # Check if this is a ritRouteMap page
                source_match = re.search(r"Source:\s*https?://fit25\.com/ritRouteMap/map(\d+)\.php", content)
                if source_match:
                    map_num = int(source_match.group(1))
                    results[map_num] = content
            except Exception:
                pass
    return results


def main():
    print("Searching for downloaded map page content files...")
    content_files = find_map_content_files()
    print(f"Found {len(content_files)} map page(s): {sorted(content_files.keys())}")

    all_routes = {}

    for map_num in sorted(content_files.keys()):
        content = content_files[map_num]
        print(f"\nParsing map{map_num:02d}.php ...")

        stops = extract_stops(content)
        polylines = extract_polylines(content)
        merged_poly = merge_polylines(polylines)

        if not stops and not polylines:
            print(f"  -> No data found")
            continue

        route_nums = set()
        for s in stops:
            rn = s["route_num"]
            route_nums.add(rn)
            key = f"R{rn}"
            if key not in all_routes:
                all_routes[key] = {"stops": [], "polyline": []}
            all_routes[key]["stops"].append({
                "name": s["name"],
                "lat": s["lat"],
                "lng": s["lng"]
            })

        if merged_poly:
            if len(route_nums) == 1:
                rn = list(route_nums)[0]
                key = f"R{rn}"
                existing = all_routes.get(key, {}).get("polyline", [])
                if existing:
                    all_routes[key]["polyline"] = merge_polylines([existing, merged_poly])
                else:
                    all_routes[key]["polyline"] = merged_poly
            else:
                for rn in sorted(route_nums):
                    key = f"R{rn}"
                    if not all_routes[key].get("polyline"):
                        all_routes[key]["polyline"] = merged_poly
                        break

        total_waypoints = sum(len(p) for p in polylines)
        print(f"  -> {len(stops)} stops, {len(polylines)} polyline segments ({total_waypoints} waypoints)")
        print(f"  -> Routes: {sorted(route_nums)}")

    # Deduplicate stops
    for key, data in all_routes.items():
        seen = set()
        unique = []
        for s in data["stops"]:
            ident = (s["name"], round(s["lat"], 5), round(s["lng"], 5))
            if ident not in seen:
                seen.add(ident)
                unique.append(s)
        data["stops"] = unique

    with open(MAP_COORDS_OUTPUT, "w", encoding="utf-8") as f:
        json.dump(all_routes, f, indent=2, ensure_ascii=False)

    total_stops = sum(len(d["stops"]) for d in all_routes.values())
    total_wp = sum(len(d["polyline"]) for d in all_routes.values())
    print(f"\nDone! Scraped {len(all_routes)} routes, {total_stops} stops, {total_wp} polyline waypoints")
    print(f"Output: {MAP_COORDS_OUTPUT}")


if __name__ == "__main__":
    main()
