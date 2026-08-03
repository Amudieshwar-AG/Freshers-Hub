package com.rit.portal.repository;

import com.rit.portal.entity.LeetcodeProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LeetcodeProfileRepository extends JpaRepository<LeetcodeProfile, Integer> {
    Optional<LeetcodeProfile> findByLeetcodeUsernameIgnoreCase(String leetcodeUsername);
    List<LeetcodeProfile> findAllByOrderByTotalSolvedDescRankingAsc();
    boolean existsByLeetcodeUsernameIgnoreCase(String leetcodeUsername);
}
