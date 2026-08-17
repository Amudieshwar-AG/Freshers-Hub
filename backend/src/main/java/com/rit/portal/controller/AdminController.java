package com.rit.portal.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rit.portal.entity.BusRoute;
import com.rit.portal.entity.BusStop;
import com.rit.portal.entity.CommunityQuestion;
import com.rit.portal.entity.NotePyq;
import com.rit.portal.repository.BusRouteRepository;
import com.rit.portal.repository.BusStopRepository;
import com.rit.portal.repository.CommunityQuestionRepository;
import com.rit.portal.repository.NotePyqRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.*;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(originPatterns = "*")
public class AdminController {

    @Autowired
    private BusRouteRepository busRouteRepository;

    @Autowired
    private BusStopRepository busStopRepository;

    @Autowired
    private NotePyqRepository notePyqRepository;

    @Autowired
    private CommunityQuestionRepository communityQuestionRepository;

    @Value("${admin.transport.username:Transport}")
    private String transportUsername;

    @Value("${admin.transport.password:RIT@2026}")
    private String transportPassword;

    @Value("${admin.super.username:Admin}")
    private String superAdminUsername;

    @Value("${admin.super.password:RIT@2026}")
    private String superAdminPassword;

    private final ObjectMapper objectMapper = new ObjectMapper();

    // ─────────────────────────────────────────────────────────────
    // 1. MULTI-ROLE ADMIN AUTHENTICATION
    // ─────────────────────────────────────────────────────────────
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();
        try {
            String inputUser = "";
            String inputPass = "";

            if (payload != null) {
                Object u = payload.get("username");
                Object p = payload.get("password");
                if (u != null) inputUser = u.toString().trim();
                if (p != null) inputPass = p.toString().trim();
            }

            // 1. Check Transport Admin ("Transport" / "RIT@2026")
            if (transportUsername.equalsIgnoreCase(inputUser) && transportPassword.equals(inputPass)) {
                response.put("success", true);
                response.put("role", "ROLE_TRANSPORT");
                response.put("username", "Transport Admin");
                response.put("token", "TRANSPORT_SESSION_TOKEN_RIT_2026");
                response.put("message", "Transport admin login successful");
                return ResponseEntity.ok(response);
            }

            // 2. Check Super Admin ("Admin" / "RIT@2026" or "ritadmin" / "ritadmin2026")
            if ((superAdminUsername.equalsIgnoreCase(inputUser) && superAdminPassword.equals(inputPass)) ||
                ("ritadmin".equalsIgnoreCase(inputUser) && "ritadmin2026".equals(inputPass))) {
                response.put("success", true);
                response.put("role", "ROLE_SUPER_ADMIN");
                response.put("username", "Super Admin");
                response.put("token", "ADMIN_SESSION_TOKEN_RIT_2026");
                response.put("message", "Super admin login successful");
                return ResponseEntity.ok(response);
            }

            response.put("success", false);
            response.put("message", "Invalid credentials. Use 'Transport' or 'Admin' with password 'RIT@2026'.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Login error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // ─────────────────────────────────────────────────────────────
    // 2. TRANSPORT & BUS FLEET MANAGEMENT
    // ─────────────────────────────────────────────────────────────
    @GetMapping("/transport/routes")
    public ResponseEntity<List<BusRoute>> getAllTransportRoutes() {
        return ResponseEntity.ok(busRouteRepository.findAll());
    }

    @PostMapping("/transport/routes")
    public ResponseEntity<?> createBusRoute(@RequestBody Map<String, Object> routeData) {
        try {
            String number = (String) routeData.get("number");
            String name = (String) routeData.get("name");
            String from = (String) routeData.get("from");
            String to = (String) routeData.get("to");
            String departureTime = (String) routeData.get("departureTime");
            String arrivalTime = (String) routeData.get("arrivalTime");
            String color = (String) routeData.getOrDefault("color", "#FF6B00");

            if (number == null || name == null || from == null || to == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Missing required route fields"));
            }

            BusRoute newRoute = BusRoute.builder()
                    .number(number.trim().toUpperCase())
                    .name(name.trim())
                    .from(from.trim())
                    .to(to.trim())
                    .departureTime(departureTime != null ? departureTime : "07:00 AM")
                    .arrivalTime(arrivalTime != null ? arrivalTime : "08:30 AM")
                    .color(color)
                    .stops(new ArrayList<>())
                    .build();

            // Save parent route first
            BusRoute saved = busRouteRepository.save(newRoute);

            // Handle nested stops
            Object stopsObj = routeData.get("stops");
            if (stopsObj instanceof List<?> rawStops) {
                int order = 1;
                for (Object item : rawStops) {
                    if (item instanceof Map<?, ?> stopMap) {
                        String stopName = (String) stopMap.get("name");
                        String time = (String) stopMap.get("time");
                        if (stopName != null && !stopName.isBlank()) {
                            BusStop stop = BusStop.builder()
                                    .route(saved)
                                    .name(stopName.trim())
                                    .time(time != null ? time.trim() : "07:30 AM")
                                    .stopOrder(order++)
                                    .build();
                            busStopRepository.save(stop);
                            saved.getStops().add(stop);
                        }
                    }
                }
            }

            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to create route: " + e.getMessage()));
        }
    }

    @PutMapping("/transport/routes/{id}")
    public ResponseEntity<?> updateBusRoute(@PathVariable Integer id, @RequestBody Map<String, Object> routeData) {
        Optional<BusRoute> optionalRoute = busRouteRepository.findById(id);
        if (optionalRoute.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        try {
            BusRoute route = optionalRoute.get();
            if (routeData.containsKey("number")) route.setNumber(((String) routeData.get("number")).trim().toUpperCase());
            if (routeData.containsKey("name")) route.setName(((String) routeData.get("name")).trim());
            if (routeData.containsKey("from")) route.setFrom(((String) routeData.get("from")).trim());
            if (routeData.containsKey("to")) route.setTo(((String) routeData.get("to")).trim());
            if (routeData.containsKey("departureTime")) route.setDepartureTime((String) routeData.get("departureTime"));
            if (routeData.containsKey("arrivalTime")) route.setArrivalTime((String) routeData.get("arrivalTime"));
            if (routeData.containsKey("color")) route.setColor((String) routeData.get("color"));

            // Clear old stops and replace
            if (routeData.containsKey("stops")) {
                Object stopsObj = routeData.get("stops");
                if (stopsObj instanceof List<?> rawStops) {
                    route.getStops().clear();
                    busRouteRepository.save(route);

                    int order = 1;
                    for (Object item : rawStops) {
                        if (item instanceof Map<?, ?> stopMap) {
                            String stopName = (String) stopMap.get("name");
                            String time = (String) stopMap.get("time");
                            if (stopName != null && !stopName.isBlank()) {
                                BusStop stop = BusStop.builder()
                                        .route(route)
                                        .name(stopName.trim())
                                        .time(time != null ? time.trim() : "07:30 AM")
                                        .stopOrder(order++)
                                        .build();
                                busStopRepository.save(stop);
                                route.getStops().add(stop);
                            }
                        }
                    }
                }
            }

            BusRoute saved = busRouteRepository.save(route);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update route: " + e.getMessage()));
        }
    }

    @DeleteMapping("/transport/routes/{id}")
    public ResponseEntity<?> deleteBusRoute(@PathVariable Integer id) {
        if (!busRouteRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        busRouteRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Route deleted successfully"));
    }

    // ─────────────────────────────────────────────────────────────
    // 3. TELEGRAM BOT Q&A "SENIORS" & CONFIGURATION MANAGEMENT
    // ─────────────────────────────────────────────────────────────
    private Path getTelegramConfigPath() {
        // Priority 1: Production VPS path
        Path vpsPath = Paths.get("/var/www/freshers-hub/telegram-bot/config.json");
        if (Files.exists(vpsPath)) {
            return vpsPath;
        }
        // Priority 2: Local relative directory
        Path localPath1 = Paths.get("telegram-bot/config.json").toAbsolutePath();
        if (Files.exists(localPath1)) {
            return localPath1;
        }
        Path localPath2 = Paths.get("../telegram-bot/config.json").toAbsolutePath();
        if (Files.exists(localPath2)) {
            return localPath2;
        }
        return localPath1;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> readTelegramConfigFile() {
        Path path = getTelegramConfigPath();
        if (Files.exists(path)) {
            try {
                byte[] bytes = Files.readAllBytes(path);
                return objectMapper.readValue(bytes, Map.class);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        Map<String, Object> defaultCfg = new HashMap<>();
        defaultCfg.put("community_bot_token", "");
        defaultCfg.put("telegram_bot_token", "");
        defaultCfg.put("helper_chat_ids", new ArrayList<Long>(List.of(971749136L, 5567776672L, 1873240361L)));
        defaultCfg.put("spring_backend_url", "http://localhost:8085");
        return defaultCfg;
    }

    private void saveTelegramConfigFile(Map<String, Object> config) {
        Path path = getTelegramConfigPath();
        try {
            if (path.getParent() != null && !Files.exists(path.getParent())) {
                Files.createDirectories(path.getParent());
            }
            objectMapper.writerWithDefaultPrettyPrinter().writeValue(new File(path.toString()), config);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @GetMapping("/telegram/config")
    public ResponseEntity<Map<String, Object>> getTelegramConfig() {
        return ResponseEntity.ok(readTelegramConfigFile());
    }

    @PutMapping("/telegram/config")
    public ResponseEntity<?> updateTelegramConfig(@RequestBody Map<String, Object> payload) {
        Map<String, Object> current = readTelegramConfigFile();
        if (payload.containsKey("community_bot_token")) current.put("community_bot_token", payload.get("community_bot_token"));
        if (payload.containsKey("telegram_bot_token")) current.put("telegram_bot_token", payload.get("telegram_bot_token"));
        if (payload.containsKey("spring_backend_url")) current.put("spring_backend_url", payload.get("spring_backend_url"));
        saveTelegramConfigFile(current);
        return ResponseEntity.ok(Map.of("success", true, "config", current));
    }

    @PostMapping("/telegram/helpers")
    public ResponseEntity<?> addSeniorHelper(@RequestBody Map<String, Object> payload) {
        Object chatIdObj = payload.get("chatId");
        if (chatIdObj == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "chatId is required"));
        }

        Long chatId;
        try {
            chatId = Long.parseLong(chatIdObj.toString().trim());
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "chatId must be a valid integer number"));
        }

        Map<String, Object> config = readTelegramConfigFile();
        @SuppressWarnings("unchecked")
        List<Object> rawHelpers = (List<Object>) config.getOrDefault("helper_chat_ids", new ArrayList<>());
        List<Long> helpers = new ArrayList<>();
        for (Object o : rawHelpers) {
            helpers.add(Long.parseLong(o.toString()));
        }

        if (!helpers.contains(chatId)) {
            helpers.add(chatId);
            config.put("helper_chat_ids", helpers);
            saveTelegramConfigFile(config);
        }

        return ResponseEntity.ok(Map.of("success", true, "helpers", helpers));
    }

    @DeleteMapping("/telegram/helpers/{chatId}")
    public ResponseEntity<?> removeSeniorHelper(@PathVariable Long chatId) {
        Map<String, Object> config = readTelegramConfigFile();
        @SuppressWarnings("unchecked")
        List<Object> rawHelpers = (List<Object>) config.getOrDefault("helper_chat_ids", new ArrayList<>());
        List<Long> helpers = new ArrayList<>();
        for (Object o : rawHelpers) {
            helpers.add(Long.parseLong(o.toString()));
        }

        boolean removed = helpers.removeIf(id -> id.equals(chatId));
        if (removed) {
            config.put("helper_chat_ids", helpers);
            saveTelegramConfigFile(config);
        }

        return ResponseEntity.ok(Map.of("success", true, "helpers", helpers));
    }

    // ─────────────────────────────────────────────────────────────
    // 4. NOTES & PYQS STUDY MATERIALS MODERATION
    // ─────────────────────────────────────────────────────────────
    @GetMapping("/notes")
    public ResponseEntity<List<NotePyq>> getAllNotes() {
        return ResponseEntity.ok(notePyqRepository.findAll());
    }

    @DeleteMapping("/notes/{id}")
    public ResponseEntity<?> deleteNote(@PathVariable Integer id) {
        if (!notePyqRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        notePyqRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Note deleted successfully"));
    }

    // ─────────────────────────────────────────────────────────────
    // 5. COMMUNITY QUESTIONS MODERATION
    // ─────────────────────────────────────────────────────────────
    @GetMapping("/questions")
    public ResponseEntity<List<CommunityQuestion>> getAllQuestions() {
        return ResponseEntity.ok(communityQuestionRepository.findAll());
    }

    @DeleteMapping("/questions/{id}")
    public ResponseEntity<?> deleteQuestion(@PathVariable Integer id) {
        if (!communityQuestionRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        communityQuestionRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Question deleted successfully"));
    }

    // ─────────────────────────────────────────────────────────────
    // 6. DEPLOYMENT RECIPIENTS (GIT PUSH HEALTH NOTIFICATIONS)
    // ─────────────────────────────────────────────────────────────
    private Path getRecipientsFilePath() {
        Path vpsPath = Paths.get("/var/www/freshers-hub/scripts/recipients.txt");
        if (vpsPath.getParent() != null && Files.exists(vpsPath.getParent())) {
            return vpsPath;
        }
        Path localPath = Paths.get("scripts/recipients.txt").toAbsolutePath();
        if (localPath.getParent() != null && !Files.exists(localPath.getParent())) {
            try {
                Files.createDirectories(localPath.getParent());
            } catch (IOException ignored) {}
        }
        return localPath;
    }

    @GetMapping("/recipients")
    public ResponseEntity<List<String>> getRecipients() {
        Path path = getRecipientsFilePath();
        return ResponseEntity.ok(getRecipientsList(path));
    }

    @PostMapping("/recipients")
    public ResponseEntity<Map<String, Object>> addRecipient(@RequestBody Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();
        Object emailObj = (payload != null) ? payload.get("email") : null;
        String email = (emailObj != null) ? emailObj.toString().trim().toLowerCase() : null;

        if (email == null || !email.contains("@")) {
            response.put("success", false);
            response.put("message", "Please enter a valid email address");
            return ResponseEntity.ok(response);
        }

        Path path = getRecipientsFilePath();
        List<String> existing = getRecipientsList(path);

        if (existing.contains(email)) {
            response.put("success", false);
            response.put("message", "Email is already subscribed");
            return ResponseEntity.ok(response);
        }

        existing.add(email);
        saveRecipientsList(path, existing);

        response.put("success", true);
        response.put("message", "Added recipient: " + email);
        response.put("recipients", existing);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/recipients")
    public ResponseEntity<Map<String, Object>> removeRecipient(@RequestParam String email) {
        Map<String, Object> response = new HashMap<>();
        if (email == null) {
            response.put("success", false);
            response.put("message", "Email parameter is required");
            return ResponseEntity.ok(response);
        }

        String target = email.trim().toLowerCase();
        Path path = getRecipientsFilePath();
        List<String> existing = getRecipientsList(path);

        boolean removed = existing.removeIf(e -> e.equalsIgnoreCase(target));
        if (removed) {
            saveRecipientsList(path, existing);
            response.put("success", true);
            response.put("message", "Removed: " + target);
            response.put("recipients", existing);
        } else {
            response.put("success", false);
            response.put("message", "Email not found");
        }
        return ResponseEntity.ok(response);
    }

    private List<String> getRecipientsList(Path path) {
        List<String> recipients = new ArrayList<>();
        if (Files.exists(path)) {
            try {
                List<String> lines = Files.readAllLines(path);
                for (String line : lines) {
                    String trimmed = line.trim();
                    if (!trimmed.isEmpty() && !trimmed.startsWith("#")) {
                        recipients.add(trimmed);
                    }
                }
            } catch (IOException ignored) {}
        }
        return recipients;
    }

    private void saveRecipientsList(Path path, List<String> recipients) {
        try {
            if (path.getParent() != null && !Files.exists(path.getParent())) {
                Files.createDirectories(path.getParent());
            }
            Files.write(path, recipients, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
