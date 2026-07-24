import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { BusRoute } from '@/types';

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
const MIN_LAT = 12.7;
const MAX_LAT = 13.4;
const MIN_LNG = 79.6;
const MAX_LNG = 80.4;

const isValidCoordinate = (lat?: number, lng?: number): boolean => {
  if (lat === undefined || lng === undefined) return false;
  return lat >= MIN_LAT && lat <= MAX_LAT && lng >= MIN_LNG && lng <= MAX_LNG;
};

// Custom Premium DivIcons using Tailwind CSS
const getStartIcon = (label: string = "1") => L.divIcon({
  html: `<div class="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 border-2 border-white shadow-md text-white text-[10px] font-extrabold hover:scale-110 transition-transform">${label}</div>`,
  className: '',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const getStopIcon = (num: number) => L.divIcon({
  html: `<div class="flex items-center justify-center w-5.5 h-5.5 rounded-full bg-blue-600 border-2 border-white shadow-md text-white text-[10px] font-bold hover:scale-125 hover:bg-blue-700 transition-all">${num}</div>`,
  className: '',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

const campusIcon = L.divIcon({
  html: `<div class="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 border-2 border-white shadow-lg text-white text-sm font-bold animate-pulse hover:scale-110 transition-transform">🏫</div>`,
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
  // Collect coordinates for the polyline path, filtering out any invalid outliers
  const pathCoordinates = useMemo(() => {
    if (!selectedRoute) return [];
    
    const coords: [number, number][] = [];
    
    // Add start stop coords if valid
    if (isValidCoordinate(selectedRoute.from_lat, selectedRoute.from_lng)) {
      coords.push([selectedRoute.from_lat!, selectedRoute.from_lng!]);
    }
    
    // Add all intermediary stop coords that are valid
    selectedRoute.stops.forEach(stop => {
      if (isValidCoordinate(stop.lat, stop.lng)) {
        coords.push([stop.lat!, stop.lng!]);
      }
    });

    // Add end stop coords if valid
    if (isValidCoordinate(selectedRoute.to_lat, selectedRoute.to_lng)) {
      coords.push([selectedRoute.to_lat!, selectedRoute.to_lng!]);
    }

    return coords;
  }, [selectedRoute]);

  // Determine map bounds
  const mapBounds = useMemo(() => {
    if (pathCoordinates.length === 0) return null;
    return pathCoordinates as L.LatLngBoundsExpression;
  }, [pathCoordinates]);

  // Determine which markers to display
  const renderMarkers = () => {
    if (selectedRoute) {
      // Filter out stops that do not have valid coordinates
      const validStops = selectedRoute.stops.filter(stop => isValidCoordinate(stop.lat, stop.lng));

      return (
        <>
          {validStops.map((stop, index) => {
            const isStart = index === 0;
            const isEnd = index === validStops.length - 1;
            const isRit = stop.name.toLowerCase().includes("rit");

            let currentIcon = getStopIcon(index + 1);
            if (isStart) currentIcon = getStartIcon("Start");
            if (isRit || isEnd) currentIcon = campusIcon;

            return (
              <Marker 
                key={`${stop.name}-${index}`} 
                position={[stop.lat!, stop.lng!]} 
                icon={currentIcon}
              >
                <Popup>
                  <div className="p-1 font-sans">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-bold">
                        Stop #{index + 1}
                      </span>
                      <h4 className="font-bold text-slate-800 text-xs">{stop.name}</h4>
                    </div>
                    <p className="text-[10px] text-orange-500 font-semibold mt-0.5">Estimated Arrival: {stop.time}</p>
                    {isStart && <span className="inline-block text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full mt-1 font-bold">Departure Stop</span>}
                    {isRit && <span className="inline-block text-[9px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full mt-1 font-bold">RIT Campus</span>}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </>
      );
    }

    // Default view: Draw RIT Campus pin + Start pins for all routes (only if coordinates are valid)
    return (
      <>
        <Marker position={[13.0118, 80.0214]} icon={campusIcon}>
          <Popup>
            <div className="p-1 font-sans">
              <h4 className="font-bold text-slate-800 text-xs">Rajalakshmi Institute of Technology</h4>
              <p className="text-[10px] text-slate-500 mt-0.5">Kuthambakkam, Chennai</p>
            </div>
          </Popup>
        </Marker>
        {allRoutes.map((r, i) => {
          if (!isValidCoordinate(r.from_lat, r.from_lng)) return null;
          return (
            <Marker 
              key={`start-${r.number}-${i}`} 
              position={[r.from_lat!, r.from_lng!]} 
              icon={getStartIcon(r.number)}
            >
              <Popup>
                <div className="p-1 font-sans">
                  <span className="px-2 py-0.5 rounded text-[10px] text-white font-bold" style={{ backgroundColor: r.color }}>
                    {r.number}
                  </span>
                  <h4 className="font-bold text-slate-800 text-xs mt-1">{r.name}</h4>
                  <p className="text-[10px] text-slate-500">Starts: {r.from} at {r.departureTime}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </>
    );
  };

  return (
    <div className="relative h-full w-full min-h-[350px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-200/80 shadow-md">
      <MapContainer 
        center={DEFAULT_CENTER as L.LatLngExpression} 
        zoom={11} 
        className="h-full w-full z-10"
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {renderMarkers()}
        
        {selectedRoute && pathCoordinates.length > 1 && (
          <Polyline 
            positions={pathCoordinates} 
            color={selectedRoute.color || "#F97316"}
            weight={4}
            opacity={0.8}
          />
        )}

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
