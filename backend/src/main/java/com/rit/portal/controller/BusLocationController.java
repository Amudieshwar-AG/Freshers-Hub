package com.rit.portal.controller;

import com.rit.portal.dto.DriverLocationUpdate;
import com.rit.portal.model.BusLocation;
import com.rit.portal.service.BusLocationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bus-locations")
@CrossOrigin(originPatterns = "*")
public class BusLocationController {

    @Autowired
    private BusLocationService busLocationService;

    private static final String REQUIRED_PIN = "RITDRIVER";

    @PostMapping("/{routeNumber}")
    public ResponseEntity<Map<String, String>> updateLocation(
            @PathVariable String routeNumber,
            @RequestBody DriverLocationUpdate update) {
        
        if (update == null || update.getLatitude() == null || update.getLongitude() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid coordinates"));
        }
        
        if (!REQUIRED_PIN.equals(update.getPin())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid driver PIN"));
        }

        busLocationService.updateLocation(routeNumber, update.getLatitude(), update.getLongitude());
        return ResponseEntity.ok(Map.of("status", "success", "message", "Location updated successfully"));
    }

    @GetMapping
    public ResponseEntity<List<BusLocation>> getActiveLocations() {
        return ResponseEntity.ok(busLocationService.getActiveLocations());
    }

    @GetMapping("/{routeNumber}")
    public ResponseEntity<BusLocation> getLocation(@PathVariable String routeNumber) {
        BusLocation loc = busLocationService.getLocation(routeNumber);
        if (loc == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(loc);
    }
}
