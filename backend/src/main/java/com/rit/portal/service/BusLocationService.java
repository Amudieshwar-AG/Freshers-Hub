package com.rit.portal.service;

import com.rit.portal.model.BusLocation;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.List;

@Service
public class BusLocationService {

    private final Map<String, BusLocation> locationCache = new ConcurrentHashMap<>();
    private static final Duration STALE_DURATION = Duration.ofMinutes(2);

    public void updateLocation(String routeNumber, Double latitude, Double longitude) {
        locationCache.put(routeNumber, new BusLocation(
            routeNumber,
            latitude,
            longitude,
            Instant.now()
        ));
    }

    public BusLocation getLocation(String routeNumber) {
        BusLocation loc = locationCache.get(routeNumber);
        if (loc != null) {
            if (Instant.now().isAfter(loc.getLastUpdated().plus(STALE_DURATION))) {
                locationCache.remove(routeNumber);
                return null;
            }
        }
        return loc;
    }

    public List<BusLocation> getActiveLocations() {
        Instant threshold = Instant.now().minus(STALE_DURATION);
        // Clean up stale entries on read
        locationCache.entrySet().removeIf(entry -> entry.getValue().getLastUpdated().isBefore(threshold));
        return List.copyOf(locationCache.values());
    }
}
