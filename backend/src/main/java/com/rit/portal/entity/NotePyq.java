package com.rit.portal.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notes_pyqs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotePyq {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String subject;

    @Column(nullable = false)
    private String department;

    @Column(nullable = false)
    private Integer semester;

    @Column(name = "file_type", nullable = false)
    private String fileType; // 'notes', 'pyq', 'syllabus', 'assignment'

    @Column(name = "download_url", nullable = false)
    private String downloadUrl;

    @Column(name = "file_size", nullable = false)
    private String fileSize;

    @Column(name = "downloads_count")
    private Integer downloadsCount = 0;

    @Column(name = "uploaded_at")
    private LocalDateTime uploadedAt = LocalDateTime.now();
}
