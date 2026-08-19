package com.rit.portal.controller;

import com.rit.portal.entity.ClubLike;
import com.rit.portal.repository.ClubLikeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/clubs")
@CrossOrigin(origins = "*")
public class ClubController {

    @Autowired
    private ClubLikeRepository clubLikeRepository;

    /**
     * Get total count of likes for all clubs & centers
     */
    @GetMapping("/likes")
    public ResponseEntity<Map<String, Long>> getAllClubLikes() {
        List<Object[]> results = clubLikeRepository.countAllGroupedByClubId();
        Map<String, Long> likesMap = new HashMap<>();
        for (Object[] result : results) {
            String clubId = (String) result[0];
            Long count = (Long) result[1];
            likesMap.put(clubId, count);
        }
        return ResponseEntity.ok(likesMap);
    }

    /**
     * Get list of club IDs liked by a specific user or device
     */
    @GetMapping("/user-likes")
    public ResponseEntity<List<String>> getUserLikedClubs(@RequestParam("userIdentifier") String userIdentifier) {
        if (userIdentifier == null || userIdentifier.isBlank()) {
            return ResponseEntity.ok(Collections.emptyList());
        }
        List<ClubLike> likes = clubLikeRepository.findByUserIdentifier(userIdentifier);
        List<String> likedClubIds = likes.stream()
                .map(ClubLike::getClubId)
                .collect(Collectors.toList());
        return ResponseEntity.ok(likedClubIds);
    }

    /**
     * Toggle like state for a club/center by a user or device
     */
    @PostMapping("/{clubId}/like")
    @Transactional
    public ResponseEntity<Map<String, Object>> toggleClubLike(
            @PathVariable("clubId") String clubId,
            @RequestBody(required = false) Map<String, String> payload,
            @RequestParam(value = "userIdentifier", required = false) String paramUserIdentifier) {

        String userIdentifier = null;
        if (payload != null && payload.containsKey("userIdentifier")) {
            userIdentifier = payload.get("userIdentifier");
        }
        if ((userIdentifier == null || userIdentifier.isBlank()) && paramUserIdentifier != null) {
            userIdentifier = paramUserIdentifier;
        }
        if (userIdentifier == null || userIdentifier.isBlank()) {
            userIdentifier = "anonymous_guest";
        }

        Optional<ClubLike> existingLike = clubLikeRepository.findByClubIdAndUserIdentifier(clubId, userIdentifier);
        boolean isNowLiked;

        if (existingLike.isPresent()) {
            clubLikeRepository.delete(existingLike.get());
            isNowLiked = false;
        } else {
            ClubLike newLike = ClubLike.builder()
                    .clubId(clubId)
                    .userIdentifier(userIdentifier)
                    .createdAt(LocalDateTime.now())
                    .build();
            clubLikeRepository.save(newLike);
            isNowLiked = true;
        }

        long newCount = clubLikeRepository.countByClubId(clubId);

        Map<String, Object> response = new HashMap<>();
        response.put("clubId", clubId);
        response.put("liked", isNowLiked);
        response.put("count", newCount);

        return ResponseEntity.ok(response);
    }
}
