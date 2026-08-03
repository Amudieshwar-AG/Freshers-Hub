package com.rit.portal.repository;

import com.rit.portal.entity.CollabRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CollabRequestRepository extends JpaRepository<CollabRequest, Integer> {
    List<CollabRequest> findAllByOrderByCreatedAtDesc();
    List<CollabRequest> findByTelegramChatIdAndStatusOrderByCreatedAtDesc(Long telegramChatId, String status);
    List<CollabRequest> findByDiscordUserIdAndStatusOrderByCreatedAtDesc(String discordUserId, String status);
}
