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
import org.springframework.web.client.RestTemplate;

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

    @Value("${admin.community.username:Community}")
    private String communityUsername;

    @Value("${admin.community.password:RIT@2026}")
    private String communityPassword;

    @Value("${admin.clubs.username:Clubs}")
    private String clubsUsername;

    @Value("${admin.clubs.password:RIT@2026}")
    private String clubsPassword;

    @Value("${admin.curriculum.username:Curriculum}")
    private String curriculumUsername;

    @Value("${admin.curriculum.password:RIT@2026}")
    private String curriculumPassword;

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

            boolean isStandardPass = "RIT@2026".equalsIgnoreCase(inputPass);

            // 1. Check Transport Admin ("Transport" / "RIT@2026")
            if ((transportUsername.equalsIgnoreCase(inputUser) && (transportPassword.equals(inputPass) || isStandardPass)) ||
                "transportadmin".equalsIgnoreCase(inputUser) && isStandardPass) {
                response.put("success", true);
                response.put("role", "ROLE_TRANSPORT");
                response.put("username", "Transport Admin");
                response.put("token", "TRANSPORT_SESSION_TOKEN_RIT_2026");
                response.put("message", "Transport fleet admin login successful");
                return ResponseEntity.ok(response);
            }

            // 2. Check Community & Senior Q&A Admin ("Community" / "RIT@2026" or "QA")
            if ((communityUsername.equalsIgnoreCase(inputUser) && (communityPassword.equals(inputPass) || isStandardPass)) ||
                "qa".equalsIgnoreCase(inputUser) && isStandardPass ||
                "communityadmin".equalsIgnoreCase(inputUser) && isStandardPass ||
                "seniorqa".equalsIgnoreCase(inputUser) && isStandardPass) {
                response.put("success", true);
                response.put("role", "ROLE_COMMUNITY");
                response.put("username", "Community & Q&A Admin");
                response.put("token", "COMMUNITY_SESSION_TOKEN_RIT_2026");
                response.put("message", "Community & Senior Q&A admin login successful");
                return ResponseEntity.ok(response);
            }

            // 3. Check Clubs & Centers Admin ("Clubs" / "RIT@2026" or "Club")
            if ((clubsUsername.equalsIgnoreCase(inputUser) && (clubsPassword.equals(inputPass) || isStandardPass)) ||
                "club".equalsIgnoreCase(inputUser) && isStandardPass ||
                "clubadmin".equalsIgnoreCase(inputUser) && isStandardPass ||
                "clubsadmin".equalsIgnoreCase(inputUser) && isStandardPass) {
                response.put("success", true);
                response.put("role", "ROLE_CLUBS");
                response.put("username", "Clubs & Centers Admin");
                response.put("token", "CLUBS_SESSION_TOKEN_RIT_2026");
                response.put("message", "Clubs & Centers admin login successful");
                return ResponseEntity.ok(response);
            }

            // 4. Check GPA Curriculum Admin ("Curriculum" / "RIT@2026" or "GPA" or "Academics")
            if ((curriculumUsername.equalsIgnoreCase(inputUser) && (curriculumPassword.equals(inputPass) || isStandardPass)) ||
                "gpa".equalsIgnoreCase(inputUser) && isStandardPass ||
                "gpaadmin".equalsIgnoreCase(inputUser) && isStandardPass ||
                "academics".equalsIgnoreCase(inputUser) && isStandardPass ||
                "curriculumadmin".equalsIgnoreCase(inputUser) && isStandardPass) {
                response.put("success", true);
                response.put("role", "ROLE_CURRICULUM");
                response.put("username", "GPA Curriculum Admin");
                response.put("token", "CURRICULUM_SESSION_TOKEN_RIT_2026");
                response.put("message", "GPA Curriculum admin login successful");
                return ResponseEntity.ok(response);
            }

            // 5. Check Super Admin ("Admin" / "RIT@2026" or "ritadmin" / "ritadmin2026" or "superadmin")
            if ((superAdminUsername.equalsIgnoreCase(inputUser) && (superAdminPassword.equals(inputPass) || isStandardPass)) ||
                "superadmin".equalsIgnoreCase(inputUser) && isStandardPass ||
                ("ritadmin".equalsIgnoreCase(inputUser) && "ritadmin2026".equals(inputPass))) {
                response.put("success", true);
                response.put("role", "ROLE_SUPER_ADMIN");
                response.put("username", "Super Admin");
                response.put("token", "ADMIN_SESSION_TOKEN_RIT_2026");
                response.put("message", "Super admin login successful");
                return ResponseEntity.ok(response);
            }

            response.put("success", false);
            response.put("message", "Invalid credentials. Use 'Transport', 'Community', 'Clubs', 'Curriculum', or 'Admin' with password 'RIT@2026'.");
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
                Map<String, Object> loaded = objectMapper.readValue(bytes, Map.class);
                if (loaded != null) {
                    List<Object> rawChatIds = (List<Object>) loaded.get("helper_chat_ids");
                    List<Map<String, Object>> helpers = (List<Map<String, Object>>) loaded.get("seniorHelpers");

                    if (helpers == null && rawChatIds != null) {
                        helpers = new ArrayList<>();
                        for (Object id : rawChatIds) {
                            Map<String, Object> h = new HashMap<>();
                            h.put("chatId", Long.parseLong(id.toString()));
                            h.put("name", "Senior Responder");
                            helpers.add(h);
                        }
                        loaded.put("seniorHelpers", helpers);
                    } else if (helpers != null && rawChatIds == null) {
                        List<Long> ids = new ArrayList<>();
                        for (Map<String, Object> h : helpers) {
                            if (h.get("chatId") != null) {
                                try {
                                    ids.add(Long.parseLong(h.get("chatId").toString()));
                                } catch (Exception ignored) {}
                            }
                        }
                        loaded.put("helper_chat_ids", ids);
                    }
                    return loaded;
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        Map<String, Object> defaultCfg = new HashMap<>();
        defaultCfg.put("community_bot_token", "8973721012:AAG37F4Q4q584m_2aS8rT6qSWuA-WuHRGMY");
        defaultCfg.put("telegram_bot_token", "8973721012:AAG37F4Q4q584m_2aS8rT6qSWuA-WuHRGMY");
        defaultCfg.put("helper_chat_ids", new ArrayList<Long>(List.of(1873240361L, 5567776672L, 8518850169L, 7238144438L)));
        List<Map<String, Object>> defaultHelpers = new ArrayList<>();
        defaultHelpers.add(Map.of("chatId", 1873240361L, "name", "Senior Mentor (CSE)"));
        defaultHelpers.add(Map.of("chatId", 5567776672L, "name", "Senior Responder (ECE)"));
        defaultHelpers.add(Map.of("chatId", 8518850169L, "name", "Senior Responder (IT)"));
        defaultHelpers.add(Map.of("chatId", 7238144438L, "name", "Senior Responder (AIDS)"));
        defaultCfg.put("seniorHelpers", defaultHelpers);
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
        if (payload.containsKey("bot_username")) current.put("bot_username", payload.get("bot_username"));
        if (payload.containsKey("seniorHelpers")) {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> helpers = (List<Map<String, Object>>) payload.get("seniorHelpers");
            current.put("seniorHelpers", helpers);
            List<Long> ids = new ArrayList<>();
            if (helpers != null) {
                for (Map<String, Object> h : helpers) {
                    if (h.get("chatId") != null) {
                        try {
                            ids.add(Long.parseLong(h.get("chatId").toString()));
                        } catch (Exception ignored) {}
                    }
                }
            }
            current.put("helper_chat_ids", ids);
        } else if (payload.containsKey("helper_chat_ids")) {
            current.put("helper_chat_ids", payload.get("helper_chat_ids"));
        }
        saveTelegramConfigFile(current);
        return ResponseEntity.ok(Map.of("success", true, "config", current));
    }

    @PostMapping("/telegram/helpers")
    public ResponseEntity<?> addSeniorHelper(@RequestBody Map<String, Object> payload) {
        Object chatIdObj = payload.get("chatId");
        String nameStr = payload.get("name") != null ? payload.get("name").toString().trim() : "Senior Responder";
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
        List<Map<String, Object>> helpers = (List<Map<String, Object>>) config.getOrDefault("seniorHelpers", new ArrayList<>());
        if (helpers == null) helpers = new ArrayList<>();
        List<Long> helperIds = new ArrayList<>();

        boolean found = false;
        for (Map<String, Object> h : helpers) {
            if (h.get("chatId") != null) {
                Long cId = Long.parseLong(h.get("chatId").toString());
                helperIds.add(cId);
                if (cId.equals(chatId)) {
                    h.put("name", nameStr);
                    found = true;
                }
            }
        }

        if (!found) {
            Map<String, Object> newHelper = new HashMap<>();
            newHelper.put("chatId", chatId);
            newHelper.put("name", nameStr);
            helpers.add(newHelper);
            helperIds.add(chatId);
        }

        config.put("seniorHelpers", helpers);
        config.put("helper_chat_ids", helperIds);
        saveTelegramConfigFile(config);

        return ResponseEntity.ok(Map.of("success", true, "helpers", helpers, "helper_chat_ids", helperIds));
    }

    @DeleteMapping("/telegram/helpers/{chatId}")
    public ResponseEntity<?> removeSeniorHelper(@PathVariable Long chatId) {
        Map<String, Object> config = readTelegramConfigFile();
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> helpers = (List<Map<String, Object>>) config.getOrDefault("seniorHelpers", new ArrayList<>());
        if (helpers != null) {
            helpers.removeIf(h -> h.get("chatId") != null && Long.parseLong(h.get("chatId").toString()) == chatId);
        } else {
            helpers = new ArrayList<>();
        }

        List<Long> helperIds = new ArrayList<>();
        for (Map<String, Object> h : helpers) {
            if (h.get("chatId") != null) {
                try {
                    helperIds.add(Long.parseLong(h.get("chatId").toString()));
                } catch (Exception ignored) {}
            }
        }

        config.put("seniorHelpers", helpers);
        config.put("helper_chat_ids", helperIds);
        saveTelegramConfigFile(config);

        return ResponseEntity.ok(Map.of("success", true, "helpers", helpers, "helper_chat_ids", helperIds));
    }

    @PostMapping("/telegram/test-bot")
    public ResponseEntity<?> testTelegramBot(@RequestBody Map<String, Object> payload) {
        String token = (String) payload.get("token");
        if (token == null || token.trim().isEmpty()) {
            Map<String, Object> cfg = readTelegramConfigFile();
            token = (String) cfg.getOrDefault("community_bot_token", "");
        }
        if (token == null || token.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("ok", false, "description", "Bot token is required"));
        }
        try {
            RestTemplate restTemplate = new RestTemplate();
            String url = "https://api.telegram.org/bot" + token.trim() + "/getMe";
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("ok", false, "description", e.getMessage()));
        }
    }

    @PostMapping("/telegram/test-dispatch")
    public ResponseEntity<?> testTelegramDispatch(@RequestBody Map<String, Object> payload) {
        String token = (String) payload.get("token");
        Object chatIdObj = payload.get("chatId");
        String message = (String) payload.get("message");
        if (token == null || token.trim().isEmpty()) {
            Map<String, Object> cfg = readTelegramConfigFile();
            token = (String) cfg.getOrDefault("community_bot_token", "");
        }
        if (token == null || token.trim().isEmpty() || chatIdObj == null) {
            return ResponseEntity.badRequest().body(Map.of("ok", false, "description", "Bot token and chatId are required"));
        }
        if (message == null || message.trim().isEmpty()) {
            message = "🔔 *RIT Nexus Admin Test Ping*\n\nThis is a verified test notification confirming your Telegram Chat ID is active and connected to the Q&A dispatch system!";
        }
        try {
            RestTemplate restTemplate = new RestTemplate();
            String url = "https://api.telegram.org/bot" + token.trim() + "/sendMessage";
            Map<String, Object> body = new HashMap<>();
            body.put("chat_id", chatIdObj);
            body.put("text", message);
            body.put("parse_mode", "Markdown");
            ResponseEntity<Map> response = restTemplate.postForEntity(url, body, Map.class);
            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("ok", false, "description", e.getMessage()));
        }
    }

    @PostMapping("/telegram/test-broadcast")
    public ResponseEntity<?> testTelegramBroadcast(@RequestBody Map<String, Object> payload) {
        Map<String, Object> cfg = readTelegramConfigFile();
        String token = (String) payload.getOrDefault("token", cfg.get("community_bot_token"));
        String message = (String) payload.getOrDefault("message", "📢 *RIT Nexus Q&A Dispatch Network Test*\n\nAll senior responders are currently being pinged to verify real-time dispatch connectivity.");

        @SuppressWarnings("unchecked")
        List<Object> rawHelpers = (List<Object>) cfg.getOrDefault("helper_chat_ids", new ArrayList<>());
        int delivered = 0;
        List<Map<String, Object>> results = new ArrayList<>();
        RestTemplate restTemplate = new RestTemplate();

        if (token != null && !token.trim().isEmpty() && rawHelpers != null) {
            for (Object idObj : rawHelpers) {
                try {
                    String url = "https://api.telegram.org/bot" + token.trim() + "/sendMessage";
                    Map<String, Object> body = new HashMap<>();
                    body.put("chat_id", idObj);
                    body.put("text", message);
                    body.put("parse_mode", "Markdown");
                    ResponseEntity<Map> res = restTemplate.postForEntity(url, body, Map.class);
                    results.add(Map.of("chatId", idObj, "status", "success", "response", res.getBody()));
                    delivered++;
                } catch (Exception e) {
                    results.add(Map.of("chatId", idObj, "status", "failed", "error", e.getMessage()));
                }
            }
        }
        return ResponseEntity.ok(Map.of("success", true, "delivered", delivered, "total", rawHelpers != null ? rawHelpers.size() : 0, "details", results));
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
