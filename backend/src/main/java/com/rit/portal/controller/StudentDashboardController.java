package com.rit.portal.controller;

import com.rit.portal.dto.ims.StudentDashboardDto.*;
import com.rit.portal.service.ims.ImsClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/ims")
public class StudentDashboardController {

    @Autowired
    private ImsClient imsClient;

    /**
     * POST /api/v1/ims/auth/login
     * Authenticates student via Register Number (e.g. 2114251001) and Password.
     */
    @PostMapping("/auth/login")
    public ResponseEntity<ImsLoginResponse> loginWithIms(@RequestBody ImsLoginRequest request) {
        ImsLoginResponse response = imsClient.authenticate(request.getRegNumber(), request.getPassword());
        if (!response.isSuccess()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/v1/ims/auth/mock-users
     * Returns pre-configured mock student credentials for instant testing.
     */
    @GetMapping("/auth/mock-users")
    public ResponseEntity<List<MockUserCredentialDto>> getMockUsers() {
        return ResponseEntity.ok(imsClient.getAvailableMockUsers());
    }

    /**
     * Helper to resolve the student's register number from email, header, or param.
     */
    private String resolveStudentId(String regNumber, String userEmail) {
        if (regNumber != null && !regNumber.isBlank()) {
            return regNumber.trim();
        }
        if (userEmail != null && !userEmail.isBlank()) {
            String digits = userEmail.split("@")[0].replaceAll("[^0-9]", "");
            return digits.isEmpty() ? "2114251001" : digits;
        }
        return "2114251001";
    }

    /**
     * GET /api/v1/ims/dashboard/me
     * Returns: Timetable of the day, Class Location, Class Teachers, Student & Dept Info
     */
    @GetMapping("/dashboard/me")
    public ResponseEntity<DashboardResponse> getMyDashboard(
            @RequestParam(required = false) String regNumber,
            @RequestParam(required = false) String email,
            @RequestHeader(value = "X-IMS-Student-Id", required = false) String headerStudentId,
            @RequestHeader(value = "X-Dev-Student-Id", required = false) String devStudentOverride) {

        String studentId = (devStudentOverride != null && !devStudentOverride.isBlank())
                ? devStudentOverride
                : (headerStudentId != null && !headerStudentId.isBlank())
                ? headerStudentId
                : resolveStudentId(regNumber, email);

        DashboardResponse response = imsClient.getStudentDashboard(studentId);
        return ResponseEntity.ok(response);
    }
}
