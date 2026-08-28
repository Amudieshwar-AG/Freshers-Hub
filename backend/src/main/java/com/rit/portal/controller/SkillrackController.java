package com.rit.portal.controller;

import com.rit.portal.entity.SkillrackProfile;
import com.rit.portal.service.SkillrackService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/skillrack")
@CrossOrigin(originPatterns = "*")
@RequiredArgsConstructor
public class SkillrackController {

    private final SkillrackService skillrackService;

    @GetMapping("/leaderboard")
    public List<SkillrackProfile> getLeaderboard() {
        return skillrackService.getAllRankedProfiles();
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerProfile(@RequestBody RegisterRequest request) {
        if (request.getSkillrackEmail() == null || request.getSkillrackEmail().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "SkillRack email is required"));
        }
        if (request.getSkillrackPassword() == null || request.getSkillrackPassword().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "SkillRack password is required"));
        }
        if (request.getStudentName() == null || request.getStudentName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Student name is required"));
        }

        try {
            SkillrackProfile profile = skillrackService.registerOrUpdateStudent(
                    request.getStudentName(),
                    request.getSkillrackEmail(),
                    request.getSkillrackPassword(),
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
    public ResponseEntity<?> triggerSync() {
        skillrackService.syncAllProfilesWithSpacing();
        return ResponseEntity.ok(Map.of("message", "SkillRack background sync initiated with 5-second spacing."));
    }

    @Data
    public static class RegisterRequest {
        private String studentName;
        private String skillrackEmail;
        private String skillrackPassword;
        private String department;
        private String year;
    }
}
