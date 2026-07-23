package com.rit.portal.controller;

import com.rit.portal.entity.NotePyq;
import com.rit.portal.repository.NotePyqRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/notes")
public class NotePyqController {

    @Autowired
    private NotePyqRepository noteRepository;

    // Get all notes
    @GetMapping
    public List<NotePyq> getAllNotes() {
        return noteRepository.findAll();
    }

    // Get notes by semester
    @GetMapping("/semester/{semester}")
    public List<NotePyq> getNotesBySemester(@PathVariable Integer semester) {
        return noteRepository.findBySemester(semester);
    }

    // Get notes by department
    @GetMapping("/department")
    public List<NotePyq> getNotesByDepartment(@RequestParam String dept) {
        return noteRepository.findByDepartment(dept);
    }

    // Add a new note metadata
    @PostMapping
    public NotePyq createNote(@RequestBody NotePyq note) {
        return noteRepository.save(note);
    }

    // Increment downloads count
    @PostMapping("/{id}/download")
    public ResponseEntity<Void> incrementDownloads(@PathVariable Integer id) {
        return noteRepository.findById(id).map(note -> {
            note.setDownloadsCount(note.getDownloadsCount() + 1);
            note.setFileType(note.getFileType()); // Keep dirty check
            noteRepository.save(note);
            return ResponseEntity.ok().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
