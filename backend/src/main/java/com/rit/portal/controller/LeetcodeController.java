package com.rit.portal.controller;

import com.rit.portal.entity.LeetcodeProfile;
import com.rit.portal.service.LeetcodeService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/leetcode")
@CrossOrigin(originPatterns = "*")
@RequiredArgsConstructor
public class LeetcodeController {

    private final LeetcodeService leetcodeService;

    @GetMapping("/leaderboard")
    public List<LeetcodeProfile> getLeaderboard() {
        return leetcodeService.getAllRankedProfiles();
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerProfile(@RequestBody RegisterRequest request) {
        if (request.getLeetcodeUsername() == null || request.getLeetcodeUsername().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "LeetCode username is required"));
        }
        if (request.getStudentName() == null || request.getStudentName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Student name is required"));
        }

        try {
            LeetcodeProfile profile = leetcodeService.registerOrUpdateStudent(
                    request.getStudentName(),
                    request.getLeetcodeUsername(),
                    request.getDepartment() != null ? request.getDepartment() : "CSE",
                    request.getYear() != null ? request.getYear() : "1st Year"
            );
            return ResponseEntity.ok(profile);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to register profile: " + e.getMessage()));
        }
    }

    @PostMapping("/sync")
    public ResponseEntity<?> triggerSpacedSync() {
        leetcodeService.syncAllProfilesWithSpacing();
        return ResponseEntity.ok(Map.of("message", "24h background sync initiated with 3-second request spacing between users."));
    }

    @Data
    public static class RegisterRequest {
        private String studentName;
        private String leetcodeUsername;
        private String department;
        private String year;
    }
}
