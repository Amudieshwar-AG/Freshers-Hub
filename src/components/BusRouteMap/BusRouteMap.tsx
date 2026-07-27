import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { BusRoute } from '@/types';
import { getBackendUrl } from '@/lib/utils';

// Standard Leaflet Icon fix for Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Domain Boundary validation (Chennai and surrounding route regions)
const MIN_LAT = 12.65;
const MAX_LAT = 13.35;
const MIN_LNG = 79.25;
const MAX_LNG = 80.45;

const isValidCoordinate = (lat?: number, lng?: number): boolean => {
  if (lat === undefined || lng === undefined) return false;
  return lat >= MIN_LAT && lat <= MAX_LAT && lng >= MIN_LNG && lng <= MAX_LNG;
};

const isRealStopCoordinate = (stop: { name: string; lat?: number; lng?: number }): boolean => {
  if (stop.lat === undefined || stop.lng === undefined) return false;
  if (!isValidCoordinate(stop.lat, stop.lng)) return false;
  
  // Check for RIT Campus coordinate fallback (13.0118, 80.0214)
  const isRITCoord = Math.abs(stop.lat - 13.0118) < 0.001 && Math.abs(stop.lng - 80.0214) < 0.001;
  const isRITName = stop.name.toLowerCase().includes("rit") || 
                    stop.name.toLowerCase().includes("campus") || 
                    stop.name.toLowerCase().includes("college") ||
                    stop.name.toLowerCase().includes("rajalakshmi");
  
  if (isRITCoord && !isRITName) {
    return false; // Exclude defaulted RIT Campus coordinates
  }
  
  return true;
};



const liveBusIcon = L.divIcon({
  html: `<div class="relative flex items-center justify-center w-9 h-9 rounded-full bg-emerald-500 border-2 border-white shadow-lg text-white text-sm font-bold"><span class="absolute inset-0 rounded-full bg-emerald-500/40 animate-ping"></span>🚌</div>`,
  className: '',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

const stoppedBusIcon = L.divIcon({
  html: `<div class="relative flex items-center justify-center w-9 h-9 rounded-full bg-red-500 border-2 border-white shadow-lg text-white text-sm font-bold">🚌</div>`,
  className: '',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

// Helper component to auto-pan and fit the map bounds to the active route
function MapUpdater({ bounds }: { bounds: L.LatLngBoundsExpression | null }) {
  const map = useMap();
  useEffect(() => {
    if (bounds && (bounds as any).length > 0) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14, animate: true });
    }
  }, [bounds, map]);
  return null;
}

interface BusRouteMapProps {
  selectedRoute: BusRoute | null;
  allRoutes: BusRoute[];
}

const DEFAULT_CENTER = [13.0118, 80.0214]; // RIT Campus default

export default function BusRouteMap({ selectedRoute, allRoutes }: BusRouteMapProps) {
  const [allLiveLocations, setAllLiveLocations] = useState<Record<string, { latitude: number; longitude: number; lastUpdated: string; stopped: boolean }>>({});

  useEffect(() => {
    const fetchLiveLocations = () => {
      fetch(getBackendUrl('/api/bus-locations'))
        .then((res) => {
          if (res.ok) return res.json();
          return [];
        })
        .then((data: Array<{ routeNumber: string; latitude: number; longitude: number; lastUpdated: string; stopped: boolean }>) => {
          if (Array.isArray(data)) {
            const locMap: Record<string, { latitude: number; longitude: number; lastUpdated: string; stopped: boolean }> = {};
            data.forEach((item) => {
              if (item.routeNumber && item.latitude && item.longitude) {
                locMap[item.routeNumber] = { 
                  latitude: item.latitude, 
                  longitude: item.longitude, 
                  lastUpdated: item.lastUpdated,
                  stopped: item.stopped
                };
              }
            });
            setAllLiveLocations(locMap);
          }
        })
        .catch(() => {
          setAllLiveLocations({});
        });
    };

    // Initial fetch
    fetchLiveLocations();

    // Poll every 3 seconds
    const interval = setInterval(fetchLiveLocations, 3000);
    return () => clearInterval(interval);
  }, []);
  // Collect coordinates for the polyline path, filtering out any invalid outliers
  const pathCoordinates = useMemo(() => {
    if (!selectedRoute) return [];
    
    // If route has pre-scraped polyline road path, use it!
    if (selectedRoute.polyline && selectedRoute.polyline.length > 0) {
      return selectedRoute.polyline;
    }
    
    const coords: [number, number][] = [];
    
    // Add start stop coords if valid and real
    if (isValidCoordinate(selectedRoute.from_lat, selectedRoute.from_lng)) {
      const isStartRIT = Math.abs(selectedRoute.from_lat! - 13.0118) < 0.001 && Math.abs(selectedRoute.from_lng! - 80.0214) < 0.001;
      const isStartRITName = selectedRoute.from.toLowerCase().includes("rit") || 
                             selectedRoute.from.toLowerCase().includes("campus") || 
                             selectedRoute.from.toLowerCase().includes("college");
      if (!isStartRIT || isStartRITName) {
        coords.push([selectedRoute.from_lat!, selectedRoute.from_lng!]);
      }
    }
    
    // Add all intermediary stop coords that are valid and real
    selectedRoute.stops.forEach(stop => {
      if (isRealStopCoordinate(stop)) {
        coords.push([stop.lat!, stop.lng!]);
      }
    });

    // Add end stop coords if valid and real
    if (isValidCoordinate(selectedRoute.to_lat, selectedRoute.to_lng)) {
      const isEndRIT = Math.abs(selectedRoute.to_lat! - 13.0118) < 0.001 && Math.abs(selectedRoute.to_lng! - 80.0214) < 0.001;
      const isEndRITName = selectedRoute.to.toLowerCase().includes("rit") || 
                           selectedRoute.to.toLowerCase().includes("campus") || 
                           selectedRoute.to.toLowerCase().includes("college");
      if (!isEndRIT || isEndRITName) {
        coords.push([selectedRoute.to_lat!, selectedRoute.to_lng!]);
      }
    }

    return coords;
  }, [selectedRoute]);

  // Determine map bounds
  const mapBounds = useMemo(() => {
    if (pathCoordinates.length === 0) return null;
    return pathCoordinates as L.LatLngBoundsExpression;
  }, [pathCoordinates]);



  return (
    <div className="relative h-full w-full min-h-[350px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-200/80 shadow-md">
      <MapContainer 
        center={DEFAULT_CENTER as L.LatLngExpression} 
        zoom={11} 
        minZoom={10}
        maxZoom={18}
        maxBounds={[[12.65, 79.25], [13.35, 80.45]] as L.LatLngBoundsExpression}
        maxBoundsViscosity={1.0}
        className="h-full w-full z-10"
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {Object.entries(allLiveLocations).map(([rNum, loc]) => {
          if (selectedRoute && selectedRoute.number !== rNum) return null;
          
          const isStale = loc.stopped || (loc.lastUpdated ? (new Date().getTime() - new Date(loc.lastUpdated).getTime() > 120000) : false);
          
          return (
            <Marker 
              key={`live-bus-${rNum}`}
              position={[loc.latitude, loc.longitude]} 
              icon={isStale ? stoppedBusIcon : liveBusIcon}
            >
              <Popup>
                <div className="p-1 font-sans text-center">
                  {loc.stopped ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-bold">
                      LOCATION SHARING ENDED
                    </span>
                  ) : isStale ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 text-[10px] font-bold">
                      LOCATION SHARING STOPPED
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>LIVE TRACKING
                    </span>
                  )}
                  <h4 className="font-bold text-slate-800 text-xs mt-1">Bus {rNum}</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {loc.stopped ? "Sharing ended by driver" : isStale ? "Last known location" : "Broadcasting live coordinates"}
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}
        

        <MapUpdater bounds={mapBounds} />
      </MapContainer>

      {/* Floating Info Overlay on Selected Route */}
      {selectedRoute && (
        <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl border border-slate-200 shadow-xl max-w-xs pointer-events-auto">
          <div className="flex items-center gap-2 mb-1.5">
            <span 
              className="px-2.5 py-0.5 rounded-full text-xs font-bold text-white shadow-xs"
              style={{ backgroundColor: selectedRoute.color }}
            >
              {selectedRoute.number}
            </span>
            <span className="text-xs font-bold text-slate-800">{selectedRoute.name}</span>
          </div>
          <div className="text-[11px] text-slate-600 space-y-1">
            <p>🏁 <strong>Start:</strong> {selectedRoute.from} ({selectedRoute.departureTime})</p>
            <p>🏫 <strong>Destination:</strong> RIT Campus ({selectedRoute.arrivalTime})</p>
            <p>📍 <strong>Total Stops:</strong> {selectedRoute.stops.length} mapped stops</p>
          </div>
        </div>
      )}
    </div>
  );
}
