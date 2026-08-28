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
     * Core scraping method:
     * 1. GET the SkillRack login page to obtain JSESSIONID cookie + ViewState
     * 2. POST login form with email + password + ViewState
     * 3. Parse the resulting profile/dashboard page for stats
     */
    public boolean fetchAndUpdateProfile(SkillrackProfile profile, String rawPassword) {
        try {
            log.info("Fetching SkillRack stats for: {}", profile.getSkillrackEmail());

            // Step 1: GET login page to get session cookie + ViewState
            Connection.Response loginPageRes = Jsoup.connect(LOGIN_URL)
                    .method(Connection.Method.GET)
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
                    .timeout(15000)
                    .execute();

            Map<String, String> cookies = new HashMap<>(loginPageRes.cookies());
            Document loginDoc = loginPageRes.parse();

            // Extract ViewState from hidden input
            String viewState = "";
            Element vsEl = loginDoc.selectFirst("input[name=javax.faces.ViewState]");
            if (vsEl != null) {
                viewState = vsEl.attr("value");
            }

            // Find the login form and its ID
            Element loginForm = loginDoc.selectFirst("form[id]");
            String formId = loginForm != null ? loginForm.attr("id") : "j_idt4";

            // Step 2: POST login credentials
            Map<String, String> formData = new LinkedHashMap<>();
            formData.put(formId, formId);
            formData.put("javax.faces.ViewState", viewState);

            // Find email/username and password input fields
            Elements inputs = loginDoc.select("input[type=text], input[type=email], input[type=password]");
            String emailFieldName = formId + ":j_idt6";
            String passwordFieldName = formId + ":j_idt8";

            for (Element input : inputs) {
                String name = input.attr("name");
                String type = input.attr("type");
                if (type.equals("text") || type.equals("email")) {
                    emailFieldName = name;
                } else if (type.equals("password")) {
                    passwordFieldName = name;
                }
            }

            formData.put(emailFieldName, profile.getSkillrackEmail());
            formData.put(passwordFieldName, rawPassword);

            // Find submit button name
            Element submitBtn = loginDoc.selectFirst("input[type=submit], button[type=submit]");
            if (submitBtn != null && submitBtn.hasAttr("name")) {
                formData.put(submitBtn.attr("name"), submitBtn.attr("value"));
            }

            String formAction = LOGIN_URL;
            if (loginForm != null && loginForm.hasAttr("action")) {
                String action = loginForm.attr("action");
                if (action.startsWith("http")) {
                    formAction = action;
                } else {
                    formAction = SKILLRACK_BASE + action;
                }
            }

            Connection.Response loginRes = Jsoup.connect(formAction)
                    .method(Connection.Method.POST)
                    .cookies(cookies)
                    .data(formData)
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .header("Referer", LOGIN_URL)
                    .followRedirects(true)
                    .timeout(15000)
                    .execute();

            cookies.putAll(loginRes.cookies());

            // Step 3: Fetch the profile/dashboard page with authenticated session
            Connection.Response profileRes = Jsoup.connect(PROFILE_URL)
                    .method(Connection.Method.GET)
                    .cookies(cookies)
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
                    .followRedirects(true)
                    .timeout(15000)
                    .execute();

            cookies.putAll(profileRes.cookies());
            Document profileDoc = profileRes.parse();

            // Check if we're still on the login page (auth failed)
            String bodyText = profileDoc.body().text();
            if (bodyText.contains("Incorrect email") || bodyText.contains("Login") && !bodyText.contains("Total Points")) {
                // Try alternative dashboard URL
                Connection.Response dashRes = Jsoup.connect(SKILLRACK_BASE + "/faces/candidate/manageprofile.xhtml")
                        .method(Connection.Method.GET)
                        .cookies(cookies)
                        .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
                        .followRedirects(true)
                        .timeout(15000)
                        .execute();
                cookies.putAll(dashRes.cookies());
                profileDoc = dashRes.parse();
                bodyText = profileDoc.body().text();
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
        boolean foundAnything = false;
        String fullText = doc.body().text();

        // Try to find stats from structured HTML elements (cards, spans, divs)
        // SkillRack typically shows stats in card-like containers

        // Look for numbers near keywords
        foundAnything = parseFromRawText(fullText, profile);

        // Also try parsing from any table structures
        Elements tables = doc.select("table");
        for (Element table : tables) {
            Elements rows = table.select("tr");
            for (Element row : rows) {
                Elements cells = row.select("td, th");
                if (cells.size() >= 2) {
                    String label = cells.get(0).text().trim().toLowerCase();
                    String value = cells.get(cells.size() - 1).text().trim();
                    int num = parseIntSafe(value);

                    if (label.contains("code test") || label.contains("codetest")) {
                        profile.setCodeTestSolved(num);
                        foundAnything = true;
                    } else if (label.contains("code tutor") || label.contains("codetutor")) {
                        profile.setCodeTutorSolved(num);
                        foundAnything = true;
                    } else if (label.contains("code track") || label.contains("codetrack")) {
                        profile.setCodeTrackSolved(num);
                        foundAnything = true;
                    } else if (label.contains("daily challenge") || label.contains("dc")) {
                        profile.setDcSolved(num);
                        foundAnything = true;
                    } else if (label.contains("gold")) {
                        profile.setGoldMedals(num);
                        foundAnything = true;
                    } else if (label.contains("silver")) {
                        profile.setSilverMedals(num);
                        foundAnything = true;
                    } else if (label.contains("bronze")) {
                        profile.setBronzeMedals(num);
                        foundAnything = true;
                    } else if (label.contains("total") && label.contains("point")) {
                        profile.setTotalPoints(num);
                        foundAnything = true;
                    }
                }
            }
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
