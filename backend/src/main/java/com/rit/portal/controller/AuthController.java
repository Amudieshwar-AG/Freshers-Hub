package com.rit.portal.controller;

import com.rit.portal.entity.User;
import com.rit.portal.service.GoogleAuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private GoogleAuthService googleAuthService;

    /**
     * POST /api/auth/google
     * Body: { "credential": "<Google ID Token>" }
     * Verifies the Google ID token, registers/logs in user, returns user profile.
     */
    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> body) {
        String credential = body.get("credential");
        if (credential == null || credential.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing Google credential token"));
        }

        User user = googleAuthService.verifyGoogleTokenAndLogin(credential);
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid or expired Google token"));
        }

        // Return user profile (the credential itself serves as the session token
        // since the frontend will send it with subsequent requests)
        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("email", user.getEmail());
        response.put("name", user.getName());
        response.put("pictureUrl", user.getPictureUrl());
        response.put("verifiedStudent", user.getVerifiedStudent());
        response.put("createdAt", user.getCreatedAt());

        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/auth/me?email=user@example.com
     * Quick lookup to check if a stored session is still valid.
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestParam String email) {
        return googleAuthService.findByEmail(email)
                .map(user -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("id", user.getId());
                    response.put("email", user.getEmail());
                    response.put("name", user.getName());
                    response.put("pictureUrl", user.getPictureUrl());
                    response.put("verifiedStudent", user.getVerifiedStudent());
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.status(401).build());
    }
}
