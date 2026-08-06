package com.rit.portal.service;

import com.rit.portal.entity.User;
import com.rit.portal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@Service
public class GoogleAuthService {

    @Autowired
    private UserRepository userRepository;

    @Value("${google.client.id:}")
    private String googleClientId;

    private static final String COLLEGE_DOMAIN = "ritchennai.edu.in";
    private static final String GOOGLE_TOKEN_INFO_URL = "https://oauth2.googleapis.com/tokeninfo?id_token=";

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Verify a Google ID token by calling Google's tokeninfo endpoint.
     * Returns the authenticated/registered User, or null on failure.
     */
    public User verifyGoogleTokenAndLogin(String idToken) {
        try {
            // Call Google's tokeninfo endpoint to verify the token
            @SuppressWarnings("unchecked")
            Map<String, Object> tokenInfo = restTemplate.getForObject(
                    GOOGLE_TOKEN_INFO_URL + idToken, Map.class
            );

            if (tokenInfo == null || !tokenInfo.containsKey("email")) {
                System.err.println("Google token verification failed: no email in response");
                return null;
            }

            // Validate audience (aud) matches our Client ID if configured
            if (googleClientId != null && !googleClientId.isBlank()) {
                String aud = (String) tokenInfo.get("aud");
                if (aud == null || !aud.equals(googleClientId)) {
                    System.err.println("Google token audience mismatch: expected=" + googleClientId + " got=" + aud);
                    return null;
                }
            }

            String email = (String) tokenInfo.get("email");
            String name = (String) tokenInfo.getOrDefault("name", email.split("@")[0]);
            String pictureUrl = (String) tokenInfo.get("picture");
            String googleId = (String) tokenInfo.get("sub");

            // Check if user already exists
            Optional<User> existingUser = userRepository.findByEmail(email);
            if (existingUser.isPresent()) {
                User user = existingUser.get();
                // Update last login and any changed profile info
                user.setLastLoginAt(LocalDateTime.now());
                if (name != null) user.setName(name);
                if (pictureUrl != null) user.setPictureUrl(pictureUrl);
                // Re-check verified status in case domain changed (unlikely but safe)
                user.setVerifiedStudent(isCollegeDomain(email));
                return userRepository.save(user);
            }

            // Create new user
            User newUser = User.builder()
                    .email(email)
                    .name(name)
                    .pictureUrl(pictureUrl)
                    .googleId(googleId)
                    .verifiedStudent(isCollegeDomain(email))
                    .createdAt(LocalDateTime.now())
                    .lastLoginAt(LocalDateTime.now())
                    .build();

            return userRepository.save(newUser);

        } catch (Exception e) {
            System.err.println("Google token verification error: " + e.getMessage());
            return null;
        }
    }

    /**
     * Returns true if the email belongs to the college domain.
     */
    public boolean isCollegeDomain(String email) {
        return email != null && email.toLowerCase().endsWith("@" + COLLEGE_DOMAIN);
    }

    /**
     * Find a user by email (used by controllers to validate tokens from headers).
     */
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
}
