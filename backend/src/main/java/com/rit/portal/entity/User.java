package com.rit.portal.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String name;

    @Column(name = "picture_url")
    private String pictureUrl;

    @Column(name = "google_id", unique = true)
    private String googleId;

    /**
     * true if the email ends with @ritchennai.edu.in
     * Only verified students can post/apply to DevCollab.
     */
    @Column(name = "verified_student")
    @Builder.Default
    private Boolean verifiedStudent = false;

    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "last_login_at")
    @Builder.Default
    private LocalDateTime lastLoginAt = LocalDateTime.now();
}
