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

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private NotePyqRepository noteRepository;

    @Autowired
    private BusRouteRepository busRouteRepository;

    @Override
    public void run(String... args) throws Exception {
        if (noteRepository.count() == 0) {
            noteRepository.saveAll(Arrays.asList(
                NotePyq.builder()
                    .title("Engineering Mathematics – Unit 1-5")
                    .subject("Mathematics")
                    .department("Computer Science & Engineering")
                    .semester(1)
                    .fileType("notes")
                    .downloadUrl("#")
                    .fileSize("4.2 MB")
                    .downloadsCount(348)
                    .uploadedAt(LocalDateTime.now())
                    .build(),
                NotePyq.builder()
                    .title("Physics PYQ 2020-2024")
                    .subject("Physics")
                    .department("Computer Science & Engineering")
                    .semester(1)
                    .fileType("pyq")
                    .downloadUrl("#")
                    .fileSize("8.1 MB")
                    .downloadsCount(512)
                    .uploadedAt(LocalDateTime.now())
                    .build(),
                NotePyq.builder()
                    .title("C Programming Complete Notes")
                    .subject("Programming")
                    .department("Computer Science & Engineering")
                    .semester(1)
                    .fileType("notes")
                    .downloadUrl("#")
                    .fileSize("6.3 MB")
                    .downloadsCount(734)
                    .uploadedAt(LocalDateTime.now())
                    .build(),
                NotePyq.builder()
                    .title("Data Structures PYQ 2019-2024")
                    .subject("Data Structures")
                    .department("Computer Science & Engineering")
                    .semester(3)
                    .fileType("pyq")
                    .downloadUrl("#")
                    .fileSize("10.2 MB")
                    .downloadsCount(621)
                    .uploadedAt(LocalDateTime.now())
                    .build(),
                NotePyq.builder()
                    .title("Circuit Theory Full Notes")
                    .subject("Circuit Theory")
                    .department("Electronics & Communication")
                    .semester(2)
                    .fileType("notes")
                    .downloadUrl("#")
                    .fileSize("5.7 MB")
                    .downloadsCount(289)
                    .uploadedAt(LocalDateTime.now())
                    .build(),
                NotePyq.builder()
                    .title("Anna University Syllabus 2021")
                    .subject("Syllabus")
                    .department("All Departments")
                    .semester(1)
                    .fileType("syllabus")
                    .downloadUrl("#")
                    .fileSize("2.1 MB")
                    .downloadsCount(890)
                    .uploadedAt(LocalDateTime.now())
                    .build(),
                NotePyq.builder()
                    .title("Thermodynamics Notes")
                    .subject("Thermodynamics")
                    .department("Mechanical Engineering")
                    .semester(3)
                    .fileType("notes")
                    .downloadUrl("#")
                    .fileSize("3.9 MB")
                    .downloadsCount(201)
                    .uploadedAt(LocalDateTime.now())
                    .build(),
                NotePyq.builder()
                    .title("Digital Electronics PYQ")
                    .subject("Digital Electronics")
                    .department("Electronics & Communication")
                    .semester(4)
                    .fileType("pyq")
                    .downloadUrl("#")
                    .fileSize("7.3 MB")
                    .downloadsCount(445)
                    .uploadedAt(LocalDateTime.now())
                    .build()
            ));
            System.out.println("🌱 Database successfully seeded with Notes & PYQs test data!");
        }

        // Seed Bus Routes
        if (busRouteRepository.count() == 0) {
            try {
                ObjectMapper mapper = new ObjectMapper();
                InputStream is = getClass().getResourceAsStream("/bus_routes.json");
                if (is != null) {
                    List<Map<String, Object>> routesList = mapper.readValue(is, new TypeReference<List<Map<String, Object>>>() {});
                    List<BusRoute> routesToSave = new ArrayList<>();
                    
                    for (Map<String, Object> routeMap : routesList) {
                        BusRoute br = BusRoute.builder()
                            .number((String) routeMap.get("number"))
                            .name((String) routeMap.get("name"))
                            .from((String) routeMap.get("from"))
                            .to((String) routeMap.get("to"))
                            .departureTime((String) routeMap.get("departureTime"))
                            .arrivalTime((String) routeMap.get("arrivalTime"))
                            .color((String) routeMap.get("color"))
                            .build();
                        
                        List<Map<String, String>> stopsList = (List<Map<String, String>>) routeMap.get("stops");
                        List<BusStop> stops = new ArrayList<>();
                        if (stopsList != null) {
                            for (int i = 0; i < stopsList.size(); i++) {
                                Map<String, String> stopMap = stopsList.get(i);
                                stops.add(BusStop.builder()
                                    .route(br)
                                    .name(stopMap.get("name"))
                                    .time(stopMap.get("time"))
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
}
