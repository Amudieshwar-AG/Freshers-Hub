package com.rit.portal.controller;

import org.springframework.beans.factory.annotation.Value;
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

    @Value("${admin.username:ritadmin}")
    private String adminUsername;

    @Value("${admin.password:ritadmin2026!}")
    private String adminPassword;

    public static class LoginDTO {
        private String username;
        private String password;

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class RecipientDTO {
        private String email;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }

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

    @RequestMapping(value = "/login", method = {RequestMethod.GET, RequestMethod.POST})
    public ResponseEntity<Map<String, Object>> login(
            @RequestBody(required = false) LoginDTO dto,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String password) {
        
        Map<String, Object> response = new HashMap<>();
        try {
            String inputUser = "";
            String inputPass = "";

            if (dto != null) {
                if (dto.getUsername() != null) inputUser = dto.getUsername().trim();
                if (dto.getPassword() != null) inputPass = dto.getPassword().trim();
            }
            if (inputUser.isEmpty() && username != null) inputUser = username.trim();
            if (inputPass.isEmpty() && password != null) inputPass = password.trim();

            String expectedUser = "ritadmin";
            if (adminUsername != null && !adminUsername.trim().isEmpty()) {
                expectedUser = adminUsername.trim();
            }

            String expectedPass = "ritadmin2026!";
            if (adminPassword != null && !adminPassword.trim().isEmpty()) {
                expectedPass = adminPassword.trim();
            }

            boolean isUsernameValid = "ritadmin".equalsIgnoreCase(inputUser) || expectedUser.equalsIgnoreCase(inputUser);
            boolean isPasswordValid = "ritadmin2026!".equals(inputPass) || expectedPass.equals(inputPass);

            if (isUsernameValid && isPasswordValid) {
                response.put("success", true);
                response.put("message", "Admin login successful");
                response.put("token", "ADMIN_SESSION_TOKEN_RIT_2026");
            } else {
                response.put("success", false);
                response.put("message", "Invalid admin username or password");
            }
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error during login: " + e.getMessage());
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
    public ResponseEntity<Map<String, Object>> addRecipient(
            @RequestBody(required = false) RecipientDTO dto,
            @RequestParam(required = false) String email) {
        
        Map<String, Object> response = new HashMap<>();
        String targetEmail = (dto != null && dto.getEmail() != null) ? dto.getEmail() : email;

        if (targetEmail == null || !targetEmail.contains("@")) {
            response.put("success", false);
            response.put("message", "Please enter a valid email address");
            return ResponseEntity.badRequest().body(response);
        }

        targetEmail = targetEmail.trim().toLowerCase();
        Path path = getRecipientsFilePath();
        List<String> existing = getRecipientsList(path);

        if (existing.contains(targetEmail)) {
            response.put("success", false);
            response.put("message", "Email is already subscribed to notifications");
            return ResponseEntity.badRequest().body(response);
        }

        existing.add(targetEmail);
        saveRecipientsList(path, existing);

        response.put("success", true);
        response.put("message", "Added recipient: " + targetEmail);
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
