package com.rit.portal.controller;

import com.rit.portal.entity.CollabApplication;
import com.rit.portal.entity.CollabRequest;
import com.rit.portal.repository.CollabApplicationRepository;
import com.rit.portal.repository.CollabRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/collab")
public class CollabController {

    @Autowired
    private CollabRequestRepository collabRequestRepository;

    @Autowired
    private CollabApplicationRepository collabApplicationRepository;

    private final RestTemplate restTemplate = new RestTemplate();
    private static final String BOT_COLLAB_APP_URL = "http://localhost:8082/send_collab_application";

    @GetMapping
    public List<CollabRequest> getAllCollabRequests() {
        return collabRequestRepository.findAllByOrderByCreatedAtDesc();
    }

    @GetMapping("/{id}")
    public ResponseEntity<CollabRequest> getCollabRequestById(@PathVariable Integer id) {
        return collabRequestRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public CollabRequest createCollabRequest(@RequestBody CollabRequest request) {
        if (request.getStatus() == null) request.setStatus("OPEN");
        if (request.getApplicationsCount() == null) request.setApplicationsCount(0);
        request.setCreatedAt(LocalDateTime.now());
        return collabRequestRepository.save(request);
    }

    @PostMapping("/{id}/apply")
    public ResponseEntity<CollabApplication> applyToCollabRequest(
            @PathVariable Integer id,
            @RequestBody CollabApplication application) {
        return collabRequestRepository.findById(id).map(request -> {
            application.setCollabRequest(request);
            if (application.getStatus() == null) application.setStatus("PENDING");
            application.setCreatedAt(LocalDateTime.now());

            CollabApplication savedApp = collabApplicationRepository.save(application);

            // Increment count on parent request
            request.setApplicationsCount(request.getApplicationsCount() + 1);
            collabRequestRepository.save(request);

            // Notify Telegram/Discord intermediary bot asynchronously
            new Thread(() -> {
                try {
                    Map<String, Object> payload = new HashMap<>();
                    payload.put("collab_id", request.getId());
                    payload.put("application_id", savedApp.getId());
                    payload.put("project_idea", request.getProjectIdea());
                    payload.put("tag", request.getTag());
                    payload.put("author_name", request.getAuthorName());
                    payload.put("contact_info", request.getContactInfo());
                    payload.put("telegram_chat_id", request.getTelegramChatId());
                    payload.put("discord_user_id", request.getDiscordUserId());
                    payload.put("applicant_name", savedApp.getApplicantName());
                    payload.put("applicant_dept", savedApp.getApplicantDept());
                    payload.put("applicant_year", savedApp.getApplicantYear());
                    payload.put("applicant_contact", savedApp.getApplicantContact());
                    payload.put("message", savedApp.getMessage());

                    restTemplate.postForEntity(BOT_COLLAB_APP_URL, payload, String.class);
                } catch (Exception e) {
                    System.err.println("Failed to send collab application notification to bot: " + e.getMessage());
                }
            }).start();

            return ResponseEntity.ok(savedApp);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/applications/{applicationId}/status")
    public ResponseEntity<CollabApplication> updateApplicationStatus(
            @PathVariable Integer applicationId,
            @RequestParam String status) {
        return collabApplicationRepository.findById(applicationId).map(app -> {
            app.setStatus(status.toUpperCase());
            CollabApplication updated = collabApplicationRepository.save(app);
            return ResponseEntity.ok(updated);
        }).orElse(ResponseEntity.notFound().build());
    }
}
