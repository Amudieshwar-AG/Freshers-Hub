package com.rit.portal.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.*;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    // Hardcoded credentials - no @Value injection needed
    private static final String ADMIN_USER = "ritadmin";
    private static final String ADMIN_PASS = "ritadmin2026";

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

            if (ADMIN_USER.equalsIgnoreCase(inputUser) && ADMIN_PASS.equals(inputPass)) {
                response.put("success", true);
                response.put("message", "Admin login successful");
                response.put("token", "ADMIN_SESSION_TOKEN_RIT_2026");
            } else {
                response.put("success", false);
                response.put("message", "Invalid admin credentials");
            }
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Login error: " + e.getMessage());
            return ResponseEntity.ok(response);
        }
    }

    @GetMapping("/recipients")
    public ResponseEntity<List<String>> getRecipients() {
        Path path = getRecipientsFilePath();
        List<String> recipients = getRecipientsList(path);
        return ResponseEntity.ok(recipients);
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
