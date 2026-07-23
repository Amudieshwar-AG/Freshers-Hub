package com.rit.portal.controller;

import com.rit.portal.entity.CommunityAnswer;
import com.rit.portal.entity.CommunityQuestion;
import com.rit.portal.repository.CommunityAnswerRepository;
import com.rit.portal.repository.CommunityQuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/questions")
public class CommunityQuestionController {

    @Autowired
    private CommunityQuestionRepository questionRepository;

    @Autowired
    private CommunityAnswerRepository answerRepository;

    private final RestTemplate restTemplate = new RestTemplate();
    private static final String TELEGRAM_BOT_URL = "http://localhost:8082/send_question";

    @GetMapping
    public List<CommunityQuestion> getAllQuestions() {
        return questionRepository.findAll();
    }

    @GetMapping("/paged")
    public org.springframework.data.domain.Page<CommunityQuestion> getPagedQuestions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {
        return questionRepository.findAll(
            org.springframework.data.domain.PageRequest.of(
                page,
                size,
                org.springframework.data.domain.Sort.by("createdAt").descending()
            )
        );
    }

    @PostMapping
    public CommunityQuestion createQuestion(@RequestBody CommunityQuestion question) {
        if (question.getUpvotes() == null) question.setUpvotes(0);
        if (question.getIsAnswered() == null) question.setIsAnswered(false);
        question.setCreatedAt(LocalDateTime.now());
        
        CommunityQuestion saved = questionRepository.save(question);
        
        // Notify Telegram bot in a background thread to keep it robust and non-blocking
        new Thread(() -> {
            try {
                Map<String, Object> payload = new HashMap<>();
                payload.put("question_id", saved.getId());
                payload.put("title", saved.getTitle());
                payload.put("body", saved.getBody());
                payload.put("author", saved.getAuthor());
                
                restTemplate.postForEntity(TELEGRAM_BOT_URL, payload, String.class);
            } catch (Exception e) {
                System.err.println("Failed to notify Telegram Bot intermediary: " + e.getMessage());
            }
        }).start();

        return saved;
    }

    @PostMapping("/{id}/answers")
    public ResponseEntity<CommunityAnswer> addAnswer(@PathVariable Integer id, @RequestBody CommunityAnswer answer) {
        return questionRepository.findById(id).map(question -> {
            answer.setQuestion(question);
            if (answer.getUpvotes() == null) answer.setUpvotes(0);
            if (answer.getIsAccepted() == null) answer.setIsAccepted(false);
            answer.setCreatedAt(LocalDateTime.now());
            
            CommunityAnswer savedAnswer = answerRepository.save(answer);
            
            question.setIsAnswered(true);
            questionRepository.save(question);
            
            return ResponseEntity.ok(savedAnswer);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/upvote")
    public ResponseEntity<CommunityQuestion> upvoteQuestion(@PathVariable Integer id) {
        return questionRepository.findById(id).map(question -> {
            question.setUpvotes(question.getUpvotes() + 1);
            return ResponseEntity.ok(questionRepository.save(question));
        }).orElse(ResponseEntity.notFound().build());
    }
}
