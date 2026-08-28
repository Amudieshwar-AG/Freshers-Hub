package com.rit.portal.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "skillrack_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SkillrackProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "student_name", nullable = false)
    private String studentName;

    @Column(name = "skillrack_email", nullable = false, unique = true)
    private String skillrackEmail;

    @Column(name = "encrypted_password", nullable = false, length = 512)
    private String encryptedPassword;

    @Column(nullable = false)
    private String department;

    @Column(nullable = false)
    private String year;

    @Column(name = "total_points")
    @Builder.Default
    private Integer totalPoints = 0;

    @Column(name = "code_test_solved")
    @Builder.Default
    private Integer codeTestSolved = 0;

    @Column(name = "code_tutor_solved")
    @Builder.Default
    private Integer codeTutorSolved = 0;

    @Column(name = "code_track_solved")
    @Builder.Default
    private Integer codeTrackSolved = 0;

    @Column(name = "dc_solved")
    @Builder.Default
    private Integer dcSolved = 0;

    @Column(name = "gold_medals")
    @Builder.Default
    private Integer goldMedals = 0;

    @Column(name = "silver_medals")
    @Builder.Default
    private Integer silverMedals = 0;

    @Column(name = "bronze_medals")
    @Builder.Default
    private Integer bronzeMedals = 0;

    @Column(name = "last_updated")
    private LocalDateTime lastUpdated;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (lastUpdated == null) lastUpdated = LocalDateTime.now();
    }
}
