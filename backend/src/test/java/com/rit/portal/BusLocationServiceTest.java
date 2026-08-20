package com.rit.portal;

import com.rit.portal.model.BusLocation;
import com.rit.portal.service.BusLocationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class BusLocationServiceTest {

    private BusLocationService busLocationService;

    @BeforeEach
    void setUp() {
        busLocationService = new BusLocationService();
    }

    @Test
    void testUpdateAndGetLocation() {
        busLocationService.updateLocation("24A", 13.0827, 80.2707);

        BusLocation loc = busLocationService.getLocation("24A");
        assertNotNull(loc);
        assertEquals("24A", loc.getRouteNumber());
        assertEquals(13.0827, loc.getLatitude());
        assertEquals(80.2707, loc.getLongitude());
        assertFalse(loc.isStopped());
        assertNotNull(loc.getLastUpdated());
    }

    @Test
    void testStopLocation() {
        busLocationService.updateLocation("15B", 12.9716, 77.5946);
        busLocationService.stopLocation("15B");

        BusLocation loc = busLocationService.getLocation("15B");
        assertNotNull(loc);
        assertTrue(loc.isStopped());
    }

    @Test
    void testGetNonExistentLocationReturnsNull() {
        BusLocation loc = busLocationService.getLocation("NON_EXISTENT");
        assertNull(loc);
    }

    @Test
    void testGetActiveLocations() {
        busLocationService.updateLocation("R1", 13.0, 80.0);
        busLocationService.updateLocation("R2", 13.1, 80.1);

        List<BusLocation> active = busLocationService.getActiveLocations();
        assertEquals(2, active.size());
    }
}
