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

    @GetMapping("/my-requests")
    public List<CollabRequest> getMyCollabRequests(@RequestParam String email) {
        return collabRequestRepository.findByAuthorEmailOrderByCreatedAtDesc(email);
    }

    @GetMapping("/my-applications")
    public List<CollabApplication> getMyCollabApplications(@RequestParam String email) {
        return collabApplicationRepository.findByApplicantEmailOrderByCreatedAtDesc(email);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CollabRequest> getCollabRequestById(@PathVariable Integer id) {
        return collabRequestRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/applications")
    public List<CollabApplication> getApplicationsForRequest(@PathVariable Integer id) {
        return collabApplicationRepository.findByCollabRequestIdOrderByCreatedAtDesc(id);
    }

    @PostMapping
    public CollabRequest createCollabRequest(@RequestBody CollabRequest request) {
        if (request.getStatus() == null) request.setStatus("OPEN");
        if (request.getApplicationsCount() == null) request.setApplicationsCount(0);
        if (request.getCollaboratorsNeeded() == null || request.getCollaboratorsNeeded() < 1) {
            request.setCollaboratorsNeeded(1);
        }
        if (request.getAcceptedCount() == null) request.setAcceptedCount(0);
        request.setCreatedAt(LocalDateTime.now());
        return collabRequestRepository.save(request);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CollabRequest> updateCollabRequest(
            @PathVariable Integer id,
            @RequestBody CollabRequest updated) {
        return collabRequestRepository.findById(id).map(req -> {
            if (updated.getProjectIdea() != null) req.setProjectIdea(updated.getProjectIdea());
            if (updated.getTag() != null) req.setTag(updated.getTag());
            if (updated.getDepartment() != null) req.setDepartment(updated.getDepartment());
            if (updated.getYear() != null) req.setYear(updated.getYear());
            if (updated.getGithubLink() != null) req.setGithubLink(updated.getGithubLink());
            if (updated.getContactInfo() != null) req.setContactInfo(updated.getContactInfo());
            if (updated.getCollaboratorsNeeded() != null) req.setCollaboratorsNeeded(updated.getCollaboratorsNeeded());
            return ResponseEntity.ok(collabRequestRepository.save(req));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/apply")
    public ResponseEntity<CollabApplication> applyToCollabRequest(
            @PathVariable Integer id,
            @RequestBody CollabApplication application) {
        return collabRequestRepository.findById(id).map(request -> {
            if ("CLOSED".equalsIgnoreCase(request.getStatus()) || "CANCELLED".equalsIgnoreCase(request.getStatus())) {
                return ResponseEntity.badRequest().<CollabApplication>build();
            }

            application.setCollabRequest(request);
            if (application.getStatus() == null) application.setStatus("PENDING");
            application.setCreatedAt(LocalDateTime.now());

            CollabApplication savedApp = collabApplicationRepository.save(application);

            // Increment applications count on parent request
            request.setApplicationsCount(request.getApplicationsCount() + 1);
            collabRequestRepository.save(request);

            // Notify Telegram intermediary bot asynchronously
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
                    payload.put("applicant_name", savedApp.getApplicantName());
                    payload.put("applicant_email", savedApp.getApplicantEmail());
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
            String newStatus = status.toUpperCase();
            if ("DECLINED".equals(newStatus) || "DECLINE".equals(newStatus) || "REJECT".equals(newStatus)) {
                newStatus = "REJECTED";
            }
            String oldStatus = app.getStatus();
            app.setStatus(newStatus);
            CollabApplication updated = collabApplicationRepository.save(app);

            // Manage parent request counts
            CollabRequest parentReq = app.getCollabRequest();
            if (parentReq != null) {
                if ("ACCEPTED".equals(newStatus) && !"ACCEPTED".equals(oldStatus)) {
                    int accepted = (parentReq.getAcceptedCount() == null ? 0 : parentReq.getAcceptedCount()) + 1;
                    parentReq.setAcceptedCount(accepted);
                    int needed = parentReq.getCollaboratorsNeeded() == null ? 1 : parentReq.getCollaboratorsNeeded();
                    if (accepted >= needed) {
                        parentReq.setStatus("CLOSED");
                    }
                    collabRequestRepository.save(parentReq);
                } else if (!"ACCEPTED".equals(newStatus) && "ACCEPTED".equals(oldStatus)) {
                    int accepted = Math.max(0, (parentReq.getAcceptedCount() == null ? 0 : parentReq.getAcceptedCount()) - 1);
                    parentReq.setAcceptedCount(accepted);
                    if ("CLOSED".equals(parentReq.getStatus())) {
                        parentReq.setStatus("OPEN");
                    }
                    collabRequestRepository.save(parentReq);
                }
            }
            return ResponseEntity.ok(updated);
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/active/telegram/{chatId}")
    public List<CollabRequest> getActiveRequestsByTelegram(@PathVariable Long chatId) {
        return collabRequestRepository.findByTelegramChatIdAndStatusOrderByCreatedAtDesc(chatId, "OPEN");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrCancelCollabRequest(@PathVariable Integer id) {
        return collabRequestRepository.findById(id).map(req -> {
            collabRequestRepository.delete(req);
            return ResponseEntity.noContent().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
