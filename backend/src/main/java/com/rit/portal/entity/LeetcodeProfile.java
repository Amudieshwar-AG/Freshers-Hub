package com.rit.portal.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "leetcode_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeetcodeProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "student_name", nullable = false)
    private String studentName;

    @Column(name = "leetcode_username", nullable = false, unique = true)
    private String leetcodeUsername;

    @Column(nullable = false)
    private String department;

    @Column(nullable = false)
    private String year;

    @Column(name = "total_solved")
    @Builder.Default
    private Integer totalSolved = 0;

    @Column(name = "easy_solved")
    @Builder.Default
    private Integer easySolved = 0;

    @Column(name = "medium_solved")
    @Builder.Default
    private Integer mediumSolved = 0;

    @Column(name = "hard_solved")
    @Builder.Default
    private Integer hardSolved = 0;

    @Column(name = "ranking")
    @Builder.Default
    private Integer ranking = 0;

    @Column(name = "reputation")
    @Builder.Default
    private Integer reputation = 0;

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
