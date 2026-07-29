package com.rit.portal.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "collab_applications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CollabApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "collab_request_id", nullable = false)
    @JsonIgnore
    private CollabRequest collabRequest;

    @Column(name = "applicant_name", nullable = false)
    private String applicantName;

    @Column(name = "applicant_dept", nullable = false)
    private String applicantDept;

    @Column(name = "applicant_year", nullable = false)
    private String applicantYear;

    @Column(name = "applicant_contact", nullable = false)
    private String applicantContact;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Column(name = "status")
    @Builder.Default
    private String status = "PENDING";

    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
