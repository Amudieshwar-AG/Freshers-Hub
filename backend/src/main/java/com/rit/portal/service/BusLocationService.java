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
    private static final Duration STALE_DURATION = Duration.ofMinutes(20);

    public void updateLocation(String routeNumber, Double latitude, Double longitude) {
        locationCache.put(routeNumber, new BusLocation(
            routeNumber,
            latitude,
            longitude,
            Instant.now(),
            false
        ));
    }

    public void stopLocation(String routeNumber) {
        BusLocation loc = locationCache.get(routeNumber);
        if (loc != null) {
            loc.setStopped(true);
            loc.setLastUpdated(Instant.now());
        }
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
        return locationCache.values().stream()
            .filter(loc -> !loc.getLastUpdated().isBefore(threshold))
            .toList();
    }

    /**
     * Periodic background eviction of stale GPS coordinates every 5 minutes
     */
    @org.springframework.scheduling.annotation.Scheduled(fixedRate = 300000)
    public void evictStaleLocations() {
        Instant threshold = Instant.now().minus(STALE_DURATION);
        locationCache.entrySet().removeIf(entry -> entry.getValue().getLastUpdated().isBefore(threshold));
    }
}
