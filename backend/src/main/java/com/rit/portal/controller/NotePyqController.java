package com.rit.portal.controller;

import com.rit.portal.entity.NotePyq;
import com.rit.portal.repository.NotePyqRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

import java.io.File;
import java.util.ArrayList;
import java.util.Collections;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/notes")
@CrossOrigin(origins = "*") // CrossOrigin configured globally, but added here for safety
public class NotePyqController {

    @Autowired
    private NotePyqRepository noteRepository;

    // Sync uploads directory with DB
    public synchronized void syncUploads() {
        File uploadsDir = new File("uploads");
        if (!uploadsDir.exists()) {
            uploadsDir.mkdirs();
        }

        List<NotePyq> currentNotes = noteRepository.findAll();
        List<String> activeUrls = Collections.synchronizedList(new ArrayList<>());

        File[] semDirs = uploadsDir.listFiles();
        if (semDirs != null) {
            for (File semDir : semDirs) {
                if (semDir.isDirectory() && semDir.getName().startsWith("sem")) {
                    String semStr = semDir.getName().substring(3);
                    try {
                        Integer semester = Integer.parseInt(semStr);
                        File[] subDirs = semDir.listFiles();
                        if (subDirs != null) {
                            for (File subDir : subDirs) {
                                if (subDir.isDirectory()) {
                                    String subject = subDir.getName();
                                    File[] typeDirs = subDir.listFiles();
                                    if (typeDirs != null) {
                                        for (File typeDir : typeDirs) {
                                            if (typeDir.isDirectory()) {
                                                String fileType = typeDir.getName();
                                                File[] files = typeDir.listFiles();
                                                if (files != null) {
                                                    for (File file : files) {
                                                        if (file.isFile() && !file.getName().equals(".gitkeep")) {
                                                            String fileName = file.getName();
                                                            String downloadUrl = "http://localhost:8080/uploads/" + 
                                                                    semDir.getName() + "/" + 
                                                                    subDir.getName() + "/" + 
                                                                    typeDir.getName() + "/" + 
                                                                    fileName;
                                                            activeUrls.add(downloadUrl);

                                                            boolean exists = currentNotes.stream().anyMatch(n -> n.getDownloadUrl().equals(downloadUrl));
                                                            if (!exists) {
                                                                String baseName = fileName.contains(".") ? fileName.substring(0, fileName.lastIndexOf('.')) : fileName;
                                                                String title = baseName.replace("_", " ").replace("-", " ");

                                                                String department = "All Departments";

                                                                long bytes = file.length();
                                                                String fileSize = formatFileSize(bytes);

                                                                NotePyq newNote = NotePyq.builder()
                                                                        .title(title)
                                                                        .subject(subject)
                                                                        .department(department)
                                                                        .semester(semester)
                                                                        .fileType(fileType)
                                                                        .downloadUrl(downloadUrl)
                                                                        .fileSize(fileSize)
                                                                        .downloadsCount(0)
                                                                        .uploadedAt(LocalDateTime.now())
                                                                        .build();
                                                                noteRepository.save(newNote);
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    } catch (NumberFormatException e) {
                        // Ignore
                    }
                }
            }
        }

        // Delete notes from DB that no longer exist on disk
        for (NotePyq note : currentNotes) {
            if (!activeUrls.contains(note.getDownloadUrl())) {
                noteRepository.delete(note);
            }
        }
    }

    private String formatFileSize(long bytes) {
        if (bytes < 1024) return bytes + " B";
        int exp = (int) (Math.log(bytes) / Math.log(1024));
        char pre = "KMGTPE".charAt(exp - 1);
        return String.format("%.1f %sB", bytes / Math.pow(1024, exp), pre);
    }

    // Get all notes
    @GetMapping
    public List<NotePyq> getAllNotes() {
        syncUploads();
        return noteRepository.findAll();
    }

    // Get notes by semester
    @GetMapping("/semester/{semester}")
    public List<NotePyq> getNotesBySemester(@PathVariable Integer semester) {
        syncUploads();
        return noteRepository.findBySemester(semester);
    }

    // Get notes by department
    @GetMapping("/department")
    public List<NotePyq> getNotesByDepartment(@RequestParam String dept) {
        syncUploads();
        return noteRepository.findByDepartment(dept);
    }

    // Add a new note metadata
    @PostMapping
    public NotePyq createNote(@RequestBody NotePyq note) {
        return noteRepository.save(note);
    }

    // Increment downloads count
    @PostMapping("/{id}/download")
    public ResponseEntity<Void> incrementDownloads(@PathVariable Long id) {
        return noteRepository.findById(id).map(note -> {
            note.setDownloadsCount(note.getDownloadsCount() + 1);
            note.setFileType(note.getFileType()); // Keep dirty check
            noteRepository.save(note);
            return ResponseEntity.ok().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
