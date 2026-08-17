package com.rit.portal.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "collab_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CollabRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "author_name", nullable = false)
    private String authorName;

    @Column(name = "author_email")
    private String authorEmail;

    @Column(nullable = false)
    private String department;

    @Column(nullable = false)
    private String year;

    @Column(name = "project_idea", nullable = false, columnDefinition = "TEXT")
    private String projectIdea;

    @Column(name = "github_link")
    private String githubLink;

    @Column(nullable = false)
    private String tag;

    @Column(name = "contact_info")
    private String contactInfo;

    @Column(name = "telegram_chat_id")
    private Long telegramChatId;

    @Column(name = "status")
    @Builder.Default
    private String status = "OPEN";

    @Column(name = "applications_count")
    @Builder.Default
    private Integer applicationsCount = 0;

    @Column(name = "collaborators_needed")
    @Builder.Default
    private Integer collaboratorsNeeded = 1;

    @Column(name = "accepted_count")
    @Builder.Default
    private Integer acceptedCount = 0;

    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "collabRequest", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @Builder.Default
    private List<CollabApplication> applications = new ArrayList<>();
}
