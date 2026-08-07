package com.rit.portal.controller;

import org.springframework.beans.factory.annotation.Value;
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
@CrossOrigin(origins = "*")
public class AdminController {

    @Value("${admin.username:ritadmin}")
    private String adminUsername;

    @Value("${admin.password:ritadmin2026!}")
    private String adminPassword;

    private Path getRecipientsFilePath() {
        // Try VPS deployment path first, fallback to workspace relative path
        Path vpsPath = Paths.get("/var/www/freshers-hub/scripts/recipients.txt");
        if (Files.exists(vpsPath.getParent())) {
            return vpsPath;
        }
        Path localPath = Paths.get("scripts/recipients.txt").toAbsolutePath();
        if (!Files.exists(localPath.getParent())) {
            try {
                Files.createDirectories(localPath.getParent());
            } catch (IOException ignored) {}
        }
        return localPath;
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(
            @RequestBody(required = false) Map<String, String> payload,
            @RequestParam(required = false) String user,
            @RequestParam(required = false) String pass) {
        
        String username = "";
        String password = "";

        if (payload != null) {
            if (payload.get("username") != null) username = payload.get("username").trim();
            if (payload.get("password") != null) password = payload.get("password").trim();
        }
        if (username.isEmpty() && user != null) username = user.trim();
        if (password.isEmpty() && pass != null) password = pass.trim();

        Map<String, Object> response = new HashMap<>();
        boolean isUsernameValid = "ritadmin".equalsIgnoreCase(username) || (adminUsername != null && adminUsername.equalsIgnoreCase(username));
        boolean isPasswordValid = "ritadmin2026!".equals(password) || (adminPassword != null && adminPassword.equals(password));

        if (isUsernameValid && isPasswordValid) {
            response.put("success", true);
            response.put("message", "Admin login successful");
            response.put("token", "ADMIN_SESSION_TOKEN_RIT_2026");
            return ResponseEntity.ok(response);
        } else {
            response.put("success", false);
            response.put("message", "Invalid username or password. (Expected: ritadmin / ritadmin2026!)");
            return ResponseEntity.ok(response);
        }
    }

    @GetMapping("/recipients")
    public ResponseEntity<List<String>> getRecipients() {
        Path path = getRecipientsFilePath();
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
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        return ResponseEntity.ok(recipients);
    }

    @PostMapping("/recipients")
    public ResponseEntity<Map<String, Object>> addRecipient(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        Map<String, Object> response = new HashMap<>();

        if (email == null || !email.contains("@")) {
            response.put("success", false);
            response.put("message", "Please enter a valid email address");
            return ResponseEntity.badRequest().body(response);
        }

        email = email.trim().toLowerCase();
        Path path = getRecipientsFilePath();
        List<String> existing = getRecipientsList(path);

        if (existing.contains(email)) {
            response.put("success", false);
            response.put("message", "Email is already subscribed to notifications");
            return ResponseEntity.badRequest().body(response);
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
            return ResponseEntity.badRequest().body(response);
        }

        String target = email.trim().toLowerCase();
        Path path = getRecipientsFilePath();
        List<String> existing = getRecipientsList(path);

        boolean removed = existing.removeIf(e -> e.equalsIgnoreCase(target));
        if (removed) {
            saveRecipientsList(path, existing);
            response.put("success", true);
            response.put("message", "Removed recipient: " + target);
            response.put("recipients", existing);
            return ResponseEntity.ok(response);
        } else {
            response.put("success", false);
            response.put("message", "Email not found in recipient list");
            return ResponseEntity.badRequest().body(response);
        }
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
