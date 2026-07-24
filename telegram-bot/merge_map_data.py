"""
Merge scraped map coordinates into the existing bus_routes.json.

Reads:
  - bus_routes.json  (from scrape_bus_routes.py — has route names, timings, stop names)
  - map_coordinates.json  (from scrape_map_coordinates.py — has exact GPS coords + polylines)

Matches routes by number (e.g. R1 ↔ route with number "R1").
For each stop, finds the closest matching stop name from the map data and
writes the exact lat/lng. Adds a "polyline" array to each route.
"""

import json
import os
import re
from difflib import SequenceMatcher

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BUS_ROUTES_PATH = os.path.abspath(os.path.join(CURRENT_DIR, "..", "backend", "src", "main", "resources", "bus_routes.json"))
MAP_COORDS_PATH = os.path.join(CURRENT_DIR, "map_coordinates.json")


def normalize(name: str) -> str:
    """Normalize a stop name for fuzzy matching."""
    name = name.lower().strip()
    # Remove common suffixes/words
    name = re.sub(r'\b(bus\s*stop|bus\s*depot|railway\s*station|signal|junction|market|stop)\b', '', name)
    name = re.sub(r'\(.*?\)', '', name)
    name = re.sub(r'[^a-z0-9\s]', '', name)
    return ' '.join(name.split())


def similarity(a: str, b: str) -> float:
    return SequenceMatcher(None, normalize(a), normalize(b)).ratio()


def find_best_match(stop_name: str, map_stops: list[dict], threshold: float = 0.5) -> dict | None:
    """Find the best matching stop from map data by name similarity."""
    best = None
    best_score = 0
    norm_name = normalize(stop_name)

    for ms in map_stops:
        norm_map = normalize(ms["name"])

        # Exact match
        if norm_name == norm_map:
            return ms

        # Check if one contains the other
        if norm_name in norm_map or norm_map in norm_name:
            score = 0.85
        else:
            score = SequenceMatcher(None, norm_name, norm_map).ratio()

        if score > best_score:
            best_score = score
            best = ms

    if best_score >= threshold:
        return best
    return None


def merge():
    if not os.path.exists(BUS_ROUTES_PATH):
        print(f"Error: {BUS_ROUTES_PATH} not found")
        return

    if not os.path.exists(MAP_COORDS_PATH):
        print(f"Error: {MAP_COORDS_PATH} not found")
        return

    with open(BUS_ROUTES_PATH, "r", encoding="utf-8") as f:
        routes = json.load(f)

    with open(MAP_COORDS_PATH, "r", encoding="utf-8") as f:
        map_data = json.load(f)

    print(f"Loaded {len(routes)} bus routes and {len(map_data)} map routes")

    matched_routes = 0
    matched_stops = 0
    total_stops = 0

    for route in routes:
        route_num = route.get("number", "")  # e.g. "R01", "R29A"
        
        # Try exact key match first
        map_route = map_data.get(route_num)
        
        # Try stripping leading zeros (e.g. "R01" -> "R1")
        if not map_route:
            clean_num = re.sub(r'^R0+(\d+)', r'R\1', route_num)
            map_route = map_data.get(clean_num)
            
        # Try without letter suffix (e.g. "R01A" -> "R1")
        if not map_route:
            clean_num = re.sub(r'^R0+(\d+)', r'R\1', route_num)
            base_num = re.sub(r'[A-Za-z]+$', '', clean_num)
            map_route = map_data.get(base_num)

        # Always clean up dummy/defaulted RIT Campus coordinates first for all stops in the route
        for stop in route.get("stops", []):
            if stop.get("lat") == 13.0118 and stop.get("lng") == 80.0214 and not "rit" in stop["name"].lower():
                stop.pop("lat", None)
                stop.pop("lng", None)

        if not map_route:
            print(f"  [WARN] No map data for route {route_num} ({route.get('name', '')}) - Cleaned dummy coords only.")
            # Set route-level from/to coordinates from first/last valid stop
            valid_stops = [s for s in route.get("stops", []) if s.get("lat")]
            if valid_stops:
                route["from_lat"] = valid_stops[0]["lat"]
                route["from_lng"] = valid_stops[0]["lng"]
                route["to_lat"] = valid_stops[-1]["lat"]
                route["to_lng"] = valid_stops[-1]["lng"]
            else:
                route["from_lat"] = 13.0118
                route["from_lng"] = 80.0214
                route["to_lat"] = 13.0118
                route["to_lng"] = 80.0214
            continue

        matched_routes += 1
        map_stops = map_route.get("stops", [])
        polyline = map_route.get("polyline", [])

        # Match each stop against map stops
        for stop in route.get("stops", []):
            total_stops += 1
            match = find_best_match(stop["name"], map_stops)
            if match:
                stop["lat"] = match["lat"]
                stop["lng"] = match["lng"]
                matched_stops += 1

        # Set route-level from/to coordinates from first/last valid stop
        valid_stops = [s for s in route.get("stops", []) if s.get("lat")]
        if valid_stops:
            route["from_lat"] = valid_stops[0]["lat"]
            route["from_lng"] = valid_stops[0]["lng"]
            route["to_lat"] = valid_stops[-1]["lat"]
            route["to_lng"] = valid_stops[-1]["lng"]
        else:
            route["from_lat"] = 13.0118
            route["from_lng"] = 80.0214
            route["to_lat"] = 13.0118
            route["to_lng"] = 80.0214

        # Add the polyline path
        if polyline:
            route["polyline"] = polyline

    # Save enriched data
    with open(BUS_ROUTES_PATH, "w", encoding="utf-8") as f:
        json.dump(routes, f, indent=2, ensure_ascii=False)

    print(f"\nMerge complete!")
    print(f"   Matched routes: {matched_routes}/{len(routes)}")
    print(f"   Matched stops:  {matched_stops}/{total_stops}")
    print(f"   Output: {BUS_ROUTES_PATH}")


if __name__ == "__main__":
    merge()

