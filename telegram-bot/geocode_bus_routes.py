import os
import json
import time
import requests
import re

# File Paths
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BUS_ROUTES_PATH = os.path.abspath(os.path.join(CURRENT_DIR, "..", "backend", "src", "main", "resources", "bus_routes.json"))
CACHE_PATH = os.path.join(CURRENT_DIR, "coordinates_cache.json")

# Predefined coordinates for hard-to-geocode stops or fallback landmarks in Chennai
STATIC_COORDINATES = {
    "RIT Campus": {"lat": 13.0118, "lng": 80.0214},
    "Rajalakshmi Institute of Technology": {"lat": 13.0118, "lng": 80.0214},
    "Kuthambakkam": {"lat": 13.0125, "lng": 80.0210},
    "Lift Gate": {"lat": 13.1610, "lng": 80.3015},
    "Wimco Market": {"lat": 13.1782, "lng": 80.3021},
    "Ajax": {"lat": 13.1685, "lng": 80.3005},
    "Theradi": {"lat": 13.1620, "lng": 80.2995},
    "Apollo": {"lat": 13.1189, "lng": 80.2874},
    "Mint": {"lat": 13.1075, "lng": 80.2785},
    "Parry's": {"lat": 13.0898, "lng": 80.2882},
    "Central": {"lat": 13.0827, "lng": 80.2707},
    "Egmore": {"lat": 13.0792, "lng": 80.2598},
    "Dasprakash": {"lat": 13.0811, "lng": 80.2524},
    "Ice House Police Station": {"lat": 13.0520, "lng": 80.2762},
    "Choolaimedu Subway": {"lat": 13.0645, "lng": 80.2224},
    "Kellys Signal": {"lat": 13.0820, "lng": 80.2435},
    "Anna Nagar Roundtana": {"lat": 13.0850, "lng": 80.2101},
    "VR Mall": {"lat": 13.0722, "lng": 80.1989},
    "Mogappair West depot": {"lat": 13.0805, "lng": 80.1654},
    "Nolambur": {"lat": 13.0737, "lng": 80.1614},
    "MGR University": {"lat": 13.0337, "lng": 80.2014},
    "Guindy": {"lat": 13.0067, "lng": 80.2206},
    "Butt Road": {"lat": 13.0084, "lng": 80.1987},
    "Porur": {"lat": 13.0382, "lng": 80.1565},
    "Ayyapanthangal": {"lat": 13.0410, "lng": 80.1412},
    "Poonamallee": {"lat": 13.0473, "lng": 80.0945},
    "Tambaram": {"lat": 12.9238, "lng": 80.1214},
    "Avadi": {"lat": 13.1166, "lng": 80.1013},
    "Chrompet": {"lat": 12.9610, "lng": 80.1462},
    "Koyambedu": {"lat": 13.0728, "lng": 80.2019},
    "Koyambedu Metro": {"lat": 13.0728, "lng": 80.2019},
    "CMBT": {"lat": 13.0678, "lng": 80.2054},
    "Aminjikarai": {"lat": 13.0734, "lng": 80.2195},
    "Skywalk": {"lat": 13.0741, "lng": 80.2185},
    "Maduravoyal": {"lat": 13.0673, "lng": 80.1627},
    "Vanagaram": {"lat": 13.0636, "lng": 80.1548},
    "Kasi Theatre": {"lat": 13.0305, "lng": 80.2132},
    "Ashok Pillar": {"lat": 13.0336, "lng": 80.2114},
    "Olympia": {"lat": 13.0135, "lng": 80.2155},
    "Mandaveli": {"lat": 13.0238, "lng": 80.2687},
    "Santhome": {"lat": 13.0336, "lng": 80.2785},
    "Pattinapakkam": {"lat": 13.0287, "lng": 80.2788},
    "Kovilampakkam": {"lat": 12.9510, "lng": 80.1874},
    "Keelkattalai": {"lat": 12.9687, "lng": 80.2014},
    "Madipakkam": {"lat": 12.9738, "lng": 80.2087},
    "Nanganallur": {"lat": 12.9838, "lng": 80.1987},
    "Saidapet": {"lat": 13.0238, "lng": 80.2287},
    "KK Nagar": {"lat": 13.0373, "lng": 80.2045},
    "Virugampakkam": {"lat": 13.0487, "lng": 80.1914},
    "Ramapuram": {"lat": 13.0287, "lng": 80.1788},
    "Tiruvallur": {"lat": 13.1438, "lng": 79.9087},
}

def load_cache():
    if os.path.exists(CACHE_PATH):
        try:
            with open(CACHE_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {}

def save_cache(cache):
    with open(CACHE_PATH, "w", encoding="utf-8") as f:
        json.dump(cache, f, indent=2)

def clean_name(name):
    # Remove contents inside parentheses
    name = re.sub(r'\(.*?\)', '', name)
    # Remove descriptors like 'Route', 'Stop', 'Signal', 'Bunk', etc.
    name = re.sub(r'\b(stop|signal|bunk|junction|crossing|stage|bus stop|market|railway station|station)\b', '', name, flags=re.IGNORECASE)
    # Normalize whitespaces
    return " ".join(name.split()).strip()

def geocode_nominatim(name):
    # 1. Check static overrides first
    cleaned = clean_name(name)
    for key, coords in STATIC_COORDINATES.items():
        if key.lower() == name.lower() or key.lower() == cleaned.lower():
            return coords

    # 2. Try clean geocoding
    search_queries = [
        f"{name}, Chennai, Tamil Nadu, India",
        f"{cleaned}, Chennai, Tamil Nadu, India",
        f"{cleaned}, Tamil Nadu, India"
    ]
    
    headers = {
        "User-Agent": "RITFreshersHubBusGeocoderConsolidator/2.0 (mail@ritchennai.edu.in)"
    }
    
    for query in search_queries:
        try:
            url = "https://nominatim.openstreetmap.org/search"
            params = {"q": query, "format": "json", "limit": 1}
            print(f"Requesting: {query} ...")
            res = requests.get(url, headers=headers, params=params, timeout=10)
            if res.status_code == 200:
                data = res.json()
                if data:
                    lat = float(data[0]["lat"])
                    lng = float(data[0]["lon"])
                    print(f"-> Found: {lat}, {lng}")
                    return {"lat": lat, "lng": lng}
            # Rest to respect API limit
            time.sleep(1.2)
        except Exception as e:
            print(f"Error querying {query}: {e}")
            time.sleep(1.2)

    # 3. Fallback keywords check
    for key, coords in STATIC_COORDINATES.items():
        if key.lower() in name.lower() or key.lower() in cleaned.lower():
            print(f"-> Matching fallback keyword: '{key}' for '{name}'")
            return coords
            
    # Default fallback: RIT Campus coordinates
    print(f"-> No match found for '{name}'. Defaulting to RIT Campus.")
    return STATIC_COORDINATES["RIT Campus"]

def geocode_routes():
    if not os.path.exists(BUS_ROUTES_PATH):
        print(f"Error: {BUS_ROUTES_PATH} does not exist.")
        return

    with open(BUS_ROUTES_PATH, "r", encoding="utf-8") as f:
        routes = json.load(f)

    cache = load_cache()
    modified = False

    # Collect all unique stop names
    unique_names = set()
    for r in routes:
        unique_names.add(r["from"])
        unique_names.add(r["to"])
        for stop in r.get("stops", []):
            unique_names.add(stop["name"])

    print(f"Total unique stops to geocode: {len(unique_names)}")

    # Geocode each stop
    count = 0
    for name in sorted(unique_names):
        if name not in cache:
            coords = geocode_nominatim(name)
            cache[name] = coords
            count += 1
            # Save cache incrementally
            if count % 5 == 0:
                save_cache(cache)
    save_cache(cache)

    # Enrich bus_routes.json
    for r in routes:
        from_coords = cache.get(r["from"], STATIC_COORDINATES["RIT Campus"])
        to_coords = cache.get(r["to"], STATIC_COORDINATES["RIT Campus"])
        r["from_lat"] = from_coords["lat"]
        r["from_lng"] = from_coords["lng"]
        r["to_lat"] = to_coords["lat"]
        r["to_lng"] = to_coords["lng"]

        for stop in r.get("stops", []):
            stop_coords = cache.get(stop["name"], STATIC_COORDINATES["RIT Campus"])
            stop["lat"] = stop_coords["lat"]
            stop["lng"] = stop_coords["lng"]

    # Write enriched data back
    with open(BUS_ROUTES_PATH, "w", encoding="utf-8") as f:
        json.dump(routes, f, indent=2)

    print("Geocoding process complete! bus_routes.json updated with coordinates.")

if __name__ == "__main__":
    geocode_routes()
