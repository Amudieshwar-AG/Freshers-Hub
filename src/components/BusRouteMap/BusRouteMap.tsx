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

// Glowing Live Bus Icon
const liveBusIcon = L.divIcon({
  html: `<div class="relative flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500 border-2 border-white shadow-2xl text-white text-base font-bold cursor-pointer"><span class="absolute inset-0 rounded-full bg-emerald-500/60 animate-ping"></span>🚌</div>`,
  className: '',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

// Stopped Bus Icon
const stoppedBusIcon = L.divIcon({
  html: `<div class="relative flex items-center justify-center w-10 h-10 rounded-full bg-red-500 border-2 border-white shadow-2xl text-white text-base font-bold cursor-pointer">🚌</div>`,
  className: '',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

// Helper: Create Clean Start Point Icon (Starting Location Name Only)
function createStartIcon(locationName: string) {
  return L.divIcon({
    html: `
      <div class="relative flex items-center justify-center cursor-pointer group">
        <span class="absolute -inset-2 rounded-full bg-emerald-500/40 animate-ping"></span>
        <div class="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-600 border-2 border-white text-white font-extrabold text-xs shadow-2xl transition-transform group-hover:scale-105">
          <span class="text-sm">📍</span>
          <span class="whitespace-nowrap tracking-wide">${locationName}</span>
        </div>
      </div>
    `,
    className: '',
    iconSize: [160, 40],
    iconAnchor: [80, 20],
  });
}

// Helper: Create Clean Destination Point Icon (RIT Campus Only)
function createDestinationIcon(locationName: string) {
  const displayName = locationName.includes('RIT') ? locationName : 'RIT Campus';
  return L.divIcon({
    html: `
      <div class="relative flex items-center justify-center cursor-pointer group">
        <span class="absolute -inset-2 rounded-full bg-orange-500/40 animate-ping"></span>
        <div class="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-600 border-2 border-white text-white font-extrabold text-xs shadow-2xl transition-transform group-hover:scale-105">
          <span class="text-sm">🏫</span>
          <span class="whitespace-nowrap tracking-wide">${displayName}</span>
        </div>
      </div>
    `,
    className: '',
    iconSize: [160, 40],
    iconAnchor: [80, 20],
  });
}

// Helper component to auto-fit map view bounds when route changes
function MapPanFocus({ bounds }: { bounds: L.LatLngBoundsExpression | null }) {
  const map = useMap();

  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, {
        padding: [80, 80],
        maxZoom: 14,
        animate: true,
        duration: 0.8,
      });
    }
  }, [bounds, map]);

  return null;
}

interface BusRouteMapProps {
  selectedRoute: BusRoute | null;
  allRoutes: BusRoute[];
}

const RIT_CAMPUS_COORDS: [number, number] = [13.03868, 80.045138]; // True RIT Campus Kuthambakkam / Poonamallee
const DEFAULT_CENTER: [number, number] = RIT_CAMPUS_COORDS;

export default function BusRouteMap({ selectedRoute }: BusRouteMapProps) {
  const [allLiveLocations, setAllLiveLocations] = useState<
    Record<string, { latitude: number; longitude: number; lastUpdated: string; stopped: boolean }>
  >({});

  useEffect(() => {
    const fetchLiveLocations = () => {
      fetch(getBackendUrl('/api/bus-locations'))
        .then((res) => {
          if (res.ok) return res.json();
          return [];
        })
        .then(
          (
            data: Array<{
              routeNumber: string;
              latitude: number;
              longitude: number;
              lastUpdated: string;
              stopped: boolean;
            }>
          ) => {
            if (Array.isArray(data)) {
              const locMap: Record<
                string,
                { latitude: number; longitude: number; lastUpdated: string; stopped: boolean }
              > = {};
              data.forEach((item) => {
                if (item.routeNumber && item.latitude && item.longitude) {
                  locMap[item.routeNumber] = {
                    latitude: item.latitude,
                    longitude: item.longitude,
                    lastUpdated: item.lastUpdated,
                    stopped: item.stopped,
                  };
                }
              });
              setAllLiveLocations(locMap);
            }
          }
        )
        .catch(() => {
          setAllLiveLocations({});
        });
    };

    fetchLiveLocations();
    const interval = setInterval(fetchLiveLocations, 3000);
    return () => clearInterval(interval);
  }, []);

  // Compute Start and Destination coordinates only
  const routeData = useMemo(() => {
    if (!selectedRoute) return null;

    // Start coordinates
    let startCoords: [number, number] | null = null;
    let startName = selectedRoute.from || 'Start Point';

    if (selectedRoute.from_lat && selectedRoute.from_lng) {
      startCoords = [selectedRoute.from_lat, selectedRoute.from_lng];
    } else if (selectedRoute.stops && selectedRoute.stops.length > 0) {
      const firstStop = selectedRoute.stops[0];
      if (firstStop.lat && firstStop.lng) {
        startCoords = [firstStop.lat, firstStop.lng];
        startName = firstStop.name || startName;
      }
    }

    // Destination is ALWAYS the true RIT Campus location (Kuthambakkam)
    const destCoords: [number, number] = RIT_CAMPUS_COORDS;
    const destName = 'RIT Campus';

    // Compute bounding box for map view auto-fit (start & destination only)
    const allPoints: [number, number][] = [];
    if (startCoords) allPoints.push(startCoords);
    if (destCoords) allPoints.push(destCoords);

    const bounds: L.LatLngBoundsExpression | null =
      allPoints.length > 0 ? (allPoints as L.LatLngBoundsExpression) : null;

    return {
      startCoords,
      startName,
      destCoords,
      destName,
      bounds,
    };
  }, [selectedRoute]);

  return (
    <div className="relative h-full w-full bg-slate-950 overflow-hidden">
      <MapContainer
        center={DEFAULT_CENTER as L.LatLngExpression}
        zoom={11}
        minZoom={9}
        maxZoom={18}
        className="h-full w-full z-10"
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* ── SELECTED ROUTE MARKERS (Starting Point & RIT Campus Destination ONLY) ── */}
        {selectedRoute && routeData && (
          <>
            {/* START Point Marker */}
            {routeData.startCoords && (
              <Marker
                position={routeData.startCoords}
                icon={createStartIcon(routeData.startName)}
              >
                <Popup>
                  <div className="p-1 font-sans text-center">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      📍 ORIGIN / PICKUP
                    </span>
                    <h4 className="font-bold text-slate-900 text-xs mt-1">{routeData.startName}</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Departure: <strong>{selectedRoute.departureTime || 'Early Morning'}</strong>
                    </p>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* DESTINATION Point Marker (RIT Campus) */}
            {routeData.destCoords && (
              <Marker
                position={routeData.destCoords}
                icon={createDestinationIcon(routeData.destName)}
              >
                <Popup>
                  <div className="p-1 font-sans text-center">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 text-[10px] font-bold">
                      🏫 DESTINATION
                    </span>
                    <h4 className="font-bold text-slate-900 text-xs mt-1">{routeData.destName}</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Arrival: <strong>{selectedRoute.arrivalTime || '08:30 AM'}</strong>
                    </p>
                  </div>
                </Popup>
              </Marker>
            )}
          </>
        )}

        {/* ── LIVE GPS BUS TRACKING MARKERS ── */}
        {Object.entries(allLiveLocations).map(([rNum, loc]) => {
          const normalizeRouteNum = (str: string) => (str || '').replace(/^[Rr]0*/, '').trim().toUpperCase();
          if (selectedRoute && normalizeRouteNum(selectedRoute.number) !== normalizeRouteNum(rNum)) return null;

          const isStale =
            loc.stopped ||
            (loc.lastUpdated ? new Date().getTime() - new Date(loc.lastUpdated).getTime() > 120000 : false);

          return (
            <Marker key={`live-bus-${rNum}`} position={[loc.latitude, loc.longitude]} icon={isStale ? stoppedBusIcon : liveBusIcon}>
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
                    {loc.stopped ? 'Sharing ended by driver' : isStale ? 'Last known location' : 'Broadcasting live coordinates'}
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Auto fit map bounds when selected route changes */}
        <MapPanFocus bounds={routeData?.bounds || null} />
      </MapContainer>

      {/* Floating Info Card on Selected Route */}
      {selectedRoute && (
        <div className="absolute bottom-6 left-6 z-20 bg-slate-900/90 text-white backdrop-blur-md px-4 py-3 rounded-2xl border border-slate-700/80 shadow-2xl max-w-xs pointer-events-auto">
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className="px-2.5 py-0.5 rounded-full text-xs font-bold text-white shadow-xs"
              style={{ backgroundColor: selectedRoute.color || '#F97316' }}
            >
              {selectedRoute.number}
            </span>
            <span className="text-xs font-bold text-white">{selectedRoute.name}</span>
          </div>
          <div className="text-[11px] text-slate-300 space-y-1">
            <p className="flex items-center gap-1.5">
              <span className="text-emerald-400 font-bold">📍 Start:</span> {selectedRoute.from} ({selectedRoute.departureTime})
            </p>
            <p className="flex items-center gap-1.5">
              <span className="text-orange-400 font-bold">🏫 Destination:</span> RIT Campus ({selectedRoute.arrivalTime})
            </p>
            <p className="text-slate-400 text-[10px] pt-0.5">
              📍 {selectedRoute.stops.length} mapped stops along route
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
