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

const liveBusIcon = L.divIcon({
  html: `<div class="relative flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500 border-2 border-white shadow-xl text-white text-base font-bold cursor-pointer"><span class="absolute inset-0 rounded-full bg-emerald-500/50 animate-ping"></span>🚌</div>`,
  className: '',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

const stoppedBusIcon = L.divIcon({
  html: `<div class="relative flex items-center justify-center w-10 h-10 rounded-full bg-red-500 border-2 border-white shadow-xl text-white text-base font-bold cursor-pointer">🚌</div>`,
  className: '',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

// Helper component to pan map to active bus marker when selected
function MapPanFocus({ center }: { center: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 13, { animate: true });
    }
  }, [center, map]);
  return null;
}

interface BusRouteMapProps {
  selectedRoute: BusRoute | null;
  allRoutes: BusRoute[];
}

const DEFAULT_CENTER: [number, number] = [13.0118, 80.0214]; // RIT Campus default

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

  // Determine center focus point if a bus is live or selected
  const activeFocusCenter = useMemo<[number, number] | null>(() => {
    if (!selectedRoute) return null;

    const normalizeRouteNum = (str: string) => (str || '').replace(/^[Rr]0*/, '').trim().toUpperCase();
    const matchLocKey = Object.keys(allLiveLocations).find(
      (k) => normalizeRouteNum(k) === normalizeRouteNum(selectedRoute.number)
    );

    if (matchLocKey && allLiveLocations[matchLocKey]) {
      const loc = allLiveLocations[matchLocKey];
      return [loc.latitude, loc.longitude];
    }

    if (selectedRoute.from_lat && selectedRoute.from_lng) {
      return [selectedRoute.from_lat, selectedRoute.from_lng];
    }

    return DEFAULT_CENTER;
  }, [selectedRoute, allLiveLocations]);

  return (
    <div className="relative h-full w-full bg-slate-950 overflow-hidden">
      <MapContainer
        center={DEFAULT_CENTER as L.LatLngExpression}
        zoom={11}
        minZoom={10}
        maxZoom={18}
        maxBounds={[[12.65, 79.25], [13.35, 80.45]] as L.LatLngBoundsExpression}
        maxBoundsViscosity={1.0}
        className="h-full w-full z-10"
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Live GPS Bus Markers ONLY - No polyline routes */}
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

        <MapPanFocus center={activeFocusCenter} />
      </MapContainer>

      {/* Floating Info Card on Selected Route */}
      {selectedRoute && (
        <div className="absolute bottom-6 left-6 z-20 bg-slate-900/90 text-white backdrop-blur-md px-4 py-3 rounded-2xl border border-slate-700/80 shadow-2xl max-w-xs pointer-events-auto">
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className="px-2.5 py-0.5 rounded-full text-xs font-bold text-white shadow-xs"
              style={{ backgroundColor: selectedRoute.color }}
            >
              {selectedRoute.number}
            </span>
            <span className="text-xs font-bold text-white">{selectedRoute.name}</span>
          </div>
          <div className="text-[11px] text-slate-300 space-y-1">
            <p>
              🏁 <strong>Start:</strong> {selectedRoute.from} ({selectedRoute.departureTime})
            </p>
            <p>
              🏫 <strong>Destination:</strong> RIT Campus ({selectedRoute.arrivalTime})
            </p>
            <p>
              📍 <strong>Stops:</strong> {selectedRoute.stops.length} mapped stops
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
