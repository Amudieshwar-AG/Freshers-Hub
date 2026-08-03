package com.rit.portal.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rit.portal.entity.LeetcodeProfile;
import com.rit.portal.repository.LeetcodeProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class LeetcodeService {

    private final LeetcodeProfileRepository repository;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestTemplate restTemplate = new RestTemplate();

    private static final String LEETCODE_GRAPHQL_URL = "https://leetcode.com/graphql";

    public List<LeetcodeProfile> getAllRankedProfiles() {
        return repository.findAllByOrderByTotalSolvedDescRankingAsc();
    }

    public LeetcodeProfile registerOrUpdateStudent(String studentName, String leetcodeUsername, String department, String year) {
        String cleanUsername = leetcodeUsername.trim();
        
        LeetcodeProfile profile = repository.findByLeetcodeUsernameIgnoreCase(cleanUsername)
                .orElse(LeetcodeProfile.builder()
                        .studentName(studentName.trim())
                        .leetcodeUsername(cleanUsername)
                        .department(department.trim())
                        .year(year.trim())
                        .build());

        profile.setStudentName(studentName.trim());
        profile.setDepartment(department.trim());
        profile.setYear(year.trim());

        // Fetch fresh stats immediately for registration
        boolean success = fetchAndUpdateProfile(profile);
        if (!success) {
            throw new IllegalArgumentException("LeetCode username '" + cleanUsername + "' could not be found on LeetCode.");
        }
        return repository.save(profile);
    }

    public boolean fetchAndUpdateProfile(LeetcodeProfile profile) {
        try {
            log.info("Fetching LeetCode GraphQL stats for: {}", profile.getLeetcodeUsername());

            String graphqlQuery = "{\"query\":\"query getUserProfile($username: String!) { matchedUser(username: $username) { username submitStats: submitStatsGlobal { acSubmissionNum { difficulty count } } profile { ranking reputation } } }\",\"variables\":{\"username\":\"" + profile.getLeetcodeUsername() + "\"}}";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
            headers.set("Referer", "https://leetcode.com/");

            HttpEntity<String> request = new HttpEntity<>(graphqlQuery, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(LEETCODE_GRAPHQL_URL, request, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                JsonNode matchedUser = root.path("data").path("matchedUser");

                if (matchedUser.isMissingNode() || matchedUser.isNull()) {
                    log.warn("LeetCode username not found: {}", profile.getLeetcodeUsername());
                    return false;
                }

                // Extract ranking and reputation
                JsonNode profileNode = matchedUser.path("profile");
                if (!profileNode.isMissingNode()) {
                    profile.setRanking(profileNode.path("ranking").asInt(0));
                    profile.setReputation(profileNode.path("reputation").asInt(0));
                }

                // Extract problem submission counts
                JsonNode acSubmissions = matchedUser.path("submitStats").path("acSubmissionNum");
                if (acSubmissions.isArray()) {
                    for (JsonNode item : acSubmissions) {
                        String diff = item.path("difficulty").asText("");
                        int count = item.path("count").asInt(0);
                        if ("All".equalsIgnoreCase(diff)) {
                            profile.setTotalSolved(count);
                        } else if ("Easy".equalsIgnoreCase(diff)) {
                            profile.setEasySolved(count);
                        } else if ("Medium".equalsIgnoreCase(diff)) {
                            profile.setMediumSolved(count);
                        } else if ("Hard".equalsIgnoreCase(diff)) {
                            profile.setHardSolved(count);
                        }
                    }
                }

                profile.setLastUpdated(LocalDateTime.now());
                log.info("Successfully updated LeetCode profile for {}: Total Solved = {}", profile.getLeetcodeUsername(), profile.getTotalSolved());
                return true;
            }
        } catch (Exception e) {
            log.error("Failed to fetch LeetCode data for {}: {}", profile.getLeetcodeUsername(), e.getMessage());
        }
        return false;
    }

    /**
     * Automatic 24-hour scheduled job running at 2:00 AM every day.
     * Uses spaced requests (3-second delay between each user) to ensure ZERO IP blocking.
     */
    @Scheduled(cron = "0 0 2 * * ?")
    public void scheduledDailySyncWithSpacedRequests() {
        log.info("Starting scheduled 24h LeetCode sync job...");
        syncAllProfilesWithSpacing();
    }

    /**
     * Manual or scheduled trigger to sync all profiles with a 3-second delay between requests.
     */
    public void syncAllProfilesWithSpacing() {
        List<LeetcodeProfile> profiles = repository.findAll();
        log.info("Queued {} LeetCode profiles for spaced synchronization.", profiles.size());

        new Thread(() -> {
            for (int i = 0; i < profiles.size(); i++) {
                LeetcodeProfile profile = profiles.get(i);
                try {
                    fetchAndUpdateProfile(profile);
                    repository.save(profile);

                    // Space out requests by 3 seconds if not the last item
                    if (i < profiles.size() - 1) {
                        log.info("Waiting 3 seconds before fetching next profile to space out requests...");
                        Thread.sleep(5000);
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    log.error("Spaced sync job interrupted.");
                    break;
                } catch (Exception e) {
                    log.error("Error during spaced sync for {}: {}", profile.getLeetcodeUsername(), e.getMessage());
                }
            }
            log.info("Finished spaced sync for all LeetCode profiles.");
        }).start();
    }
}
