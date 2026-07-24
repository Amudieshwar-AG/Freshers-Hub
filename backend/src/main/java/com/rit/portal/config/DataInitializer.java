package com.rit.portal.config;

import com.rit.portal.entity.NotePyq;
import com.rit.portal.entity.BusRoute;
import com.rit.portal.entity.BusStop;
import com.rit.portal.repository.NotePyqRepository;
import com.rit.portal.repository.BusRouteRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import com.rit.portal.controller.NotePyqController;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private NotePyqRepository noteRepository;

    @Autowired
    private BusRouteRepository busRouteRepository;

    @Autowired
    private NotePyqController notePyqController;

    @Override
    public void run(String... args) throws Exception {
        // Clear all previous mock data from the database to force re-seeding with geocoded values
        noteRepository.deleteAll();
        busRouteRepository.deleteAll();

        // Run initial scan to populate database with whatever is currently in /uploads
        try {
            notePyqController.syncUploads();
            System.out.println("🌱 Initialized Note/PYQ database from local uploads folder!");
        } catch (Exception e) {
            System.err.println("⚠️ Failed to run initial uploads sync: " + e.getMessage());
        }

        // Seed Bus Routes
        try {
            ObjectMapper mapper = new ObjectMapper();
            InputStream is = getClass().getResourceAsStream("/bus_routes.json");
            if (is != null) {
                List<Map<String, Object>> routesList = mapper.readValue(is, new TypeReference<List<Map<String, Object>>>() {});
                List<BusRoute> routesToSave = new ArrayList<>();
                
                for (Map<String, Object> routeMap : routesList) {
                    List<List<Double>> polyList = (List<List<Double>>) routeMap.get("polyline");
                    String polyJson = null;
                    if (polyList != null) {
                        try {
                            polyJson = mapper.writeValueAsString(polyList);
                        } catch (Exception e) {
                            System.err.println("⚠️ Failed to serialize polyline: " + e.getMessage());
                        }
                    }

                    BusRoute br = BusRoute.builder()
                        .number((String) routeMap.get("number"))
                        .name((String) routeMap.get("name"))
                        .from((String) routeMap.get("from"))
                        .to((String) routeMap.get("to"))
                        .departureTime((String) routeMap.get("departureTime"))
                        .arrivalTime((String) routeMap.get("arrivalTime"))
                        .color((String) routeMap.get("color"))
                        .fromLat(routeMap.get("from_lat") != null ? ((Number) routeMap.get("from_lat")).doubleValue() : null)
                        .fromLng(routeMap.get("from_lng") != null ? ((Number) routeMap.get("from_lng")).doubleValue() : null)
                        .toLat(routeMap.get("to_lat") != null ? ((Number) routeMap.get("to_lat")).doubleValue() : null)
                        .toLng(routeMap.get("to_lng") != null ? ((Number) routeMap.get("to_lng")).doubleValue() : null)
                        .polyline(polyJson)
                        .build();
                    
                    List<Map<String, Object>> stopsList = (List<Map<String, Object>>) routeMap.get("stops");
                    List<BusStop> stops = new ArrayList<>();
                    if (stopsList != null) {
                        for (int i = 0; i < stopsList.size(); i++) {
                            Map<String, Object> stopMap = stopsList.get(i);
                            stops.add(BusStop.builder()
                                .route(br)
                                .name((String) stopMap.get("name"))
                                .time((String) stopMap.get("time"))
                                .lat(stopMap.get("lat") != null ? ((Number) stopMap.get("lat")).doubleValue() : null)
                                .lng(stopMap.get("lng") != null ? ((Number) stopMap.get("lng")).doubleValue() : null)
                                .stopOrder(i + 1)
                                .build());
                        }
                    }
                    br.setStops(stops);
                    routesToSave.add(br);
                }
                busRouteRepository.saveAll(routesToSave);
                System.out.println("🌱 Database successfully seeded with " + routesToSave.size() + " Bus Routes and stops!");
            } else {
                System.err.println("⚠️ Could not find bus_routes.json in resources!");
            }
        } catch (Exception e) {
            System.err.println("❌ Failed to seed bus routes: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
