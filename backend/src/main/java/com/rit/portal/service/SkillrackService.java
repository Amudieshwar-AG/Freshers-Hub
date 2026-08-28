package com.rit.portal.service;

import com.rit.portal.entity.SkillrackProfile;
import com.rit.portal.repository.SkillrackProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Connection;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class SkillrackService {

    private final SkillrackProfileRepository repository;

    // AES-128 key (16 bytes) — in production, move to environment variable
    private static final String AES_KEY = "RitSkillR@ck2026";
    private static final String SKILLRACK_BASE = "https://www.skillrack.com";
    private static final String LOGIN_URL = SKILLRACK_BASE + "/faces/candidate/profileview.xhtml";
    private static final String PROFILE_URL = SKILLRACK_BASE + "/faces/candidate/profileview.xhtml";

    // ─── Public API ───────────────────────────────────────────────────

    public List<SkillrackProfile> getAllRankedProfiles() {
        return repository.findAllByOrderByTotalPointsDesc();
    }

    public SkillrackProfile registerOrUpdateStudent(String studentName, String email, String password,
                                                     String department, String year) {
        String cleanEmail = email.trim().toLowerCase();

        SkillrackProfile profile = repository.findBySkillrackEmailIgnoreCase(cleanEmail)
                .orElse(SkillrackProfile.builder()
                        .studentName(studentName.trim())
                        .skillrackEmail(cleanEmail)
                        .department(department.trim())
                        .year(year.trim())
                        .build());

        profile.setStudentName(studentName.trim());
        profile.setDepartment(department.trim());
        profile.setYear(year.trim());
        profile.setEncryptedPassword(encrypt(password));

        boolean success = fetchAndUpdateProfile(profile, password);
        if (!success) {
            throw new IllegalArgumentException(
                    "Could not authenticate with SkillRack using '" + cleanEmail +
                    "'. Please verify your email and password are correct.");
        }
        return repository.save(profile);
    }

    public boolean fetchAndUpdateProfile(SkillrackProfile profile) {
        String password = decrypt(profile.getEncryptedPassword());
        if (password == null || password.isEmpty()) {
            log.warn("Cannot decrypt password for SkillRack profile: {}", profile.getSkillrackEmail());
            return false;
        }
        return fetchAndUpdateProfile(profile, password);
    }

    /**
     * Core scraping method using SkillRack's container security:
     * 1. GET https://www.skillrack.com/faces/ui/profile.xhtml to establish JSESSIONID session
     * 2. POST to https://www.skillrack.com/faces/ui/j_security_check with j_username (Login ID) & j_password
     * 3. GET https://www.skillrack.com/faces/candidate/profileview.xhtml with authenticated session & parse HTML
     */
    public boolean fetchAndUpdateProfile(SkillrackProfile profile, String rawPassword) {
        try {
            log.info("Fetching SkillRack stats for Login ID: {}", profile.getSkillrackEmail());

            String loginPageUrl = SKILLRACK_BASE + "/faces/ui/profile.xhtml";
            String jSecurityCheckUrl = SKILLRACK_BASE + "/faces/ui/j_security_check";

            // Step 1: GET login page to establish session cookie
            Connection.Response pageRes = Jsoup.connect(loginPageUrl)
                    .method(Connection.Method.GET)
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
                    .timeout(15000)
                    .execute();

            Map<String, String> cookies = new HashMap<>(pageRes.cookies());

            // Step 2: POST login credentials to j_security_check
            Map<String, String> formData = new LinkedHashMap<>();
            formData.put("j_username", profile.getSkillrackEmail().trim());
            formData.put("j_password", rawPassword);

            Connection.Response loginRes = Jsoup.connect(jSecurityCheckUrl)
                    .method(Connection.Method.POST)
                    .cookies(cookies)
                    .data(formData)
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .header("Referer", loginPageUrl)
                    .followRedirects(true)
                    .timeout(15000)
                    .execute();

            cookies.putAll(loginRes.cookies());

            // Step 3: Fetch candidate profile page with authenticated session
            Connection.Response profileRes = Jsoup.connect(PROFILE_URL)
                    .method(Connection.Method.GET)
                    .cookies(cookies)
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
                    .followRedirects(true)
                    .timeout(15000)
                    .execute();

            cookies.putAll(profileRes.cookies());
            Document profileDoc = profileRes.parse();
            String bodyText = profileDoc.body().text();

            // Check if login failed (still redirected back to login page containing Login Id input)
            if (bodyText.contains("Login Id") || bodyText.contains("Invalid") || !bodyText.contains("Candidate")) {
                // Try alternative candidate manage profile page
                Connection.Response dashRes = Jsoup.connect(SKILLRACK_BASE + "/faces/candidate/manageprofile.xhtml")
                        .method(Connection.Method.GET)
                        .cookies(cookies)
                        .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
                        .followRedirects(true)
                        .timeout(15000)
                        .execute();
                cookies.putAll(dashRes.cookies());
                Document dashDoc = dashRes.parse();
                String dashText = dashDoc.body().text();
                if (!dashText.contains("Login Id")) {
                    profileDoc = dashDoc;
                    bodyText = dashText;
                }
            }

            // Step 4: Parse profile stats from the HTML
            boolean parsed = parseProfileStats(profileDoc, profile);

            if (!parsed) {
                // Fallback: Try to extract from raw text with regex patterns
                parsed = parseFromRawText(bodyText, profile);
            }

            if (parsed) {
                profile.setLastUpdated(LocalDateTime.now());
                log.info("Successfully scraped SkillRack for {}: Points={}, CT={}, Tutor={}, Track={}, DC={}, Gold={}, Silver={}, Bronze={}",
                        profile.getSkillrackEmail(), profile.getTotalPoints(),
                        profile.getCodeTestSolved(), profile.getCodeTutorSolved(),
                        profile.getCodeTrackSolved(), profile.getDcSolved(),
                        profile.getGoldMedals(), profile.getSilverMedals(), profile.getBronzeMedals());
                return true;
            }

            log.warn("Could not parse SkillRack profile data for: {}", profile.getSkillrackEmail());
            return false;

        } catch (Exception e) {
            log.error("Failed to fetch SkillRack data for {}: {}", profile.getSkillrackEmail(), e.getMessage());
            return false;
        }
    }

    // ─── HTML Parsing ─────────────────────────────────────────────────

    private boolean parseProfileStats(Document doc, SkillrackProfile profile) {
        String html = doc.html();
        boolean foundAnything = false;

        // 1. Extract Real Name from .ui-chip-text if available
        Element chipEl = doc.selectFirst(".ui-chip-text");
        if (chipEl != null) {
            String chipText = chipEl.text().trim();
            if (chipText.contains("-")) {
                String[] parts = chipText.split("-");
                if (parts.length >= 1 && !parts[0].trim().isEmpty()) {
                    profile.setStudentName(parts[0].trim());
                }
            }
        }

        // 2. Gold Medals (orange medal icon)
        Matcher goldM = Pattern.compile("ion-md-medal\"\\s+style=\"color:orange\"></i>\\s*(\\d+)").matcher(html);
        if (goldM.find()) {
            profile.setGoldMedals(Integer.parseInt(goldM.group(1)));
            foundAnything = true;
        }

        // 3. Silver Medals (grey medal icon)
        Matcher silverM = Pattern.compile("ion-md-medal\"\\s+style=\"color:grey\"></i>\\s*(\\d+)").matcher(html);
        if (silverM.find()) {
            profile.setSilverMedals(Integer.parseInt(silverM.group(1)));
            foundAnything = true;
        }

        // 4. Bronze Medals (brown medal icon)
        Matcher bronzeM = Pattern.compile("ion-md-medal\"\\s+style=\"color:brown\"></i>\\s*(\\d+)").matcher(html);
        if (bronzeM.find()) {
            profile.setBronzeMedals(Integer.parseInt(bronzeM.group(1)));
            foundAnything = true;
        }

        // 5. Total Points / Score (brown flag icon)
        Matcher pointsM = Pattern.compile("ion-md-flag\"\\s+style=\"color:brown\"></i>\\s*(\\d+)").matcher(html);
        if (pointsM.find()) {
            profile.setTotalPoints(Integer.parseInt(pointsM.group(1)));
            foundAnything = true;
        }

        return foundAnything;
    }

    private boolean parseFromRawText(String text, SkillrackProfile profile) {
        boolean found = false;

        // Pattern: "Code Test 123" or "CodeTest: 123" or "Code Test Solved: 123"
        found |= extractAndSet(text, "(?i)code\\s*test[^\\d]*(\\d+)", val -> profile.setCodeTestSolved(val));
        found |= extractAndSet(text, "(?i)code\\s*tutor[^\\d]*(\\d+)", val -> profile.setCodeTutorSolved(val));
        found |= extractAndSet(text, "(?i)code\\s*track[^\\d]*(\\d+)", val -> profile.setCodeTrackSolved(val));
        found |= extractAndSet(text, "(?i)daily\\s*challenge[^\\d]*(\\d+)", val -> profile.setDcSolved(val));
        found |= extractAndSet(text, "(?i)(?:dc|DC)[^\\d]*(\\d+)", val -> {
            if (profile.getDcSolved() == 0) profile.setDcSolved(val);
        });
        found |= extractAndSet(text, "(?i)gold[^\\d]*(\\d+)", val -> profile.setGoldMedals(val));
        found |= extractAndSet(text, "(?i)silver[^\\d]*(\\d+)", val -> profile.setSilverMedals(val));
        found |= extractAndSet(text, "(?i)bronze[^\\d]*(\\d+)", val -> profile.setBronzeMedals(val));
        found |= extractAndSet(text, "(?i)total\\s*(?:point|score)s?[^\\d]*(\\d+)", val -> profile.setTotalPoints(val));

        // If total points not found, compute from components
        if (profile.getTotalPoints() == 0 && found) {
            int computed = profile.getCodeTestSolved() + profile.getCodeTutorSolved()
                    + profile.getCodeTrackSolved() + profile.getDcSolved();
            if (computed > 0) {
                profile.setTotalPoints(computed);
            }
        }

        return found;
    }

    private boolean extractAndSet(String text, String regex, java.util.function.IntConsumer setter) {
        Matcher m = Pattern.compile(regex).matcher(text);
        if (m.find()) {
            int val = parseIntSafe(m.group(1));
            if (val > 0) {
                setter.accept(val);
                return true;
            }
        }
        return false;
    }

    private int parseIntSafe(String s) {
        try {
            return Integer.parseInt(s.replaceAll("[^\\d]", ""));
        } catch (NumberFormatException e) {
            return 0;
        }
    }

    // ─── AES Encryption Helpers ───────────────────────────────────────

    private String encrypt(String plainText) {
        try {
            SecretKeySpec key = new SecretKeySpec(AES_KEY.getBytes(StandardCharsets.UTF_8), "AES");
            Cipher cipher = Cipher.getInstance("AES/ECB/PKCS5Padding");
            cipher.init(Cipher.ENCRYPT_MODE, key);
            byte[] encrypted = cipher.doFinal(plainText.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(encrypted);
        } catch (Exception e) {
            log.error("AES encryption failed: {}", e.getMessage());
            throw new RuntimeException("Encryption failed", e);
        }
    }

    private String decrypt(String encryptedBase64) {
        try {
            SecretKeySpec key = new SecretKeySpec(AES_KEY.getBytes(StandardCharsets.UTF_8), "AES");
            Cipher cipher = Cipher.getInstance("AES/ECB/PKCS5Padding");
            cipher.init(Cipher.DECRYPT_MODE, key);
            byte[] decoded = Base64.getDecoder().decode(encryptedBase64);
            byte[] decrypted = cipher.doFinal(decoded);
            return new String(decrypted, StandardCharsets.UTF_8);
        } catch (Exception e) {
            log.error("AES decryption failed: {}", e.getMessage());
            return null;
        }
    }

    // ─── Scheduled & Manual Sync ──────────────────────────────────────

    /**
     * Automatic daily sync at 2:30 AM — spaced 5s apart to avoid rate limits
     */
    @Scheduled(cron = "0 30 2 * * ?")
    public void scheduledDailySync() {
        log.info("Starting scheduled daily SkillRack sync...");
        syncAllProfilesWithSpacing();
    }

    /**
     * Manual or scheduled trigger to sync all profiles with 5-second delays.
     */
    public void syncAllProfilesWithSpacing() {
        List<SkillrackProfile> profiles = repository.findAll();
        log.info("Queued {} SkillRack profiles for sync.", profiles.size());

        new Thread(() -> {
            for (int i = 0; i < profiles.size(); i++) {
                SkillrackProfile p = profiles.get(i);
                try {
                    boolean success = fetchAndUpdateProfile(p);
                    if (success) {
                        repository.save(p);
                    }
                    if (i < profiles.size() - 1) {
                        log.info("Waiting 5s before next SkillRack profile sync...");
                        Thread.sleep(5000);
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    log.error("SkillRack sync interrupted.");
                    break;
                } catch (Exception e) {
                    log.error("Error syncing SkillRack profile {}: {}", p.getSkillrackEmail(), e.getMessage());
                }
            }
            log.info("Finished SkillRack sync for all profiles.");
        }).start();
    }
}
