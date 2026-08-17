package com.rit.portal.dto.ims;

import lombok.*;
import java.time.LocalDate;
import java.util.List;

public class StudentDashboardDto {

    // ─── 0. IMS Authentication DTOs ──────────────────────────────
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ImsLoginRequest {
        private String regNumber;        // e.g. "2114251001" or "251001"
        private String password;         // e.g. "rit@2026"
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ImsLoginResponse {
        private boolean success;
        private String message;
        private String token;            // IMS Session / Bearer Token
        private StudentInfo student;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MockUserCredentialDto {
        private String regNumber;
        private String defaultPassword;
        private String studentName;
        private String department;
        private String section;
    }

    // ─── 1. Student & Department Details ─────────────────────────
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StudentInfo {
        private String studentId;        // e.g. "2114251001" or "251001"
        private String regNumber;        // e.g. "2114251001"
        private String name;             // e.g. "Anbu Kathir"
        private String email;            // e.g. "251001@ritchennai.edu.in"
        private String degree;           // e.g. "B.E."
        private String department;       // e.g. "Computer Science & Engineering"
        private String departmentCode;   // e.g. "CSE"
        private int year;                // e.g. 1
        private int semester;            // e.g. 2
        private String section;          // e.g. "A"
        private String batch;            // e.g. "2025 - 2029"
        private String regulation;       // e.g. "2021 Regulation"
    }

    // ─── 2. Class & Campus Location ─────────────────────────────
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ClassLocationInfo {
        private String roomNumber;       // e.g. "LH-204"
        private String buildingName;     // e.g. "Dr. APJ Abdul Kalam Academic Block"
        private String floor;            // e.g. "2nd Floor"
        private String wing;             // e.g. "East Wing"
        private String landmark;         // e.g. "Next to CSE Department Library, Opposite to Seminar Hall"
    }

    // ─── 3. Faculty / Staff for this Class ───────────────────────
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ClassFacultyMember {
        private String subjectCode;      // e.g. "CS3201"
        private String subjectName;      // e.g. "Data Structures & Algorithms"
        private String facultyName;      // e.g. "Dr. R. Arunkumar"
        private String designation;      // e.g. "Associate Professor"
        private String email;            // e.g. "arunkumar.r@ritchennai.edu.in"
        private String officeLocation;   // e.g. "APJ Block, Cabin 208-B"
        private String phoneExtension;   // e.g. "Ext. 312"
        private String avatarUrl;        // Optional photo
        private boolean isClassIncharge; // true if Class Incharge
    }

    // ─── 4. Timetable Period ─────────────────────────────────────
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TimetablePeriod {
        private int periodNumber;        // 1 to 6
        private String timeSlot;         // e.g. "08:45 AM - 09:40 AM"
        private String startTime;        // "08:45"
        private String endTime;          // "09:40"
        private String subjectCode;      // "CS3201"
        private String subjectName;      // "Data Structures & Algorithms"
        private String type;             // "THEORY" | "LAB" | "TUTORIAL" | "LIBRARY"
        private String facultyName;      // "Dr. R. Arunkumar"
        private String venue;            // "LH-204" or "CC-03 Lab"
        private String status;           // "UPCOMING" | "ONGOING" | "COMPLETED"
    }

    // ─── 5. Daily Timetable ──────────────────────────────────────
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DaySchedule {
        private String dayOfWeek;        // "MONDAY", "TUESDAY", etc.
        private LocalDate date;
        private List<TimetablePeriod> periods;
    }

    // ─── Complete Dashboard Aggregate ────────────────────────────
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DashboardResponse {
        private StudentInfo student;
        private ClassLocationInfo classLocation;
        private List<ClassFacultyMember> facultyList;
        private DaySchedule todaySchedule;
        private boolean isMockData;
    }
}
