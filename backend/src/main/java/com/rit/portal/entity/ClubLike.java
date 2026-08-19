package com.rit.portal.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "club_likes", uniqueConstraints = {
    @UniqueConstraint(name = "unique_club_user_like", columnNames = {"club_id", "user_identifier"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClubLike {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "club_id", nullable = false, length = 100)
    private String clubId;

    @Column(name = "user_identifier", nullable = false, length = 255)
    private String userIdentifier;

    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
