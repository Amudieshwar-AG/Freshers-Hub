package com.rit.portal.repository;

import com.rit.portal.entity.SkillrackProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SkillrackProfileRepository extends JpaRepository<SkillrackProfile, Integer> {
    Optional<SkillrackProfile> findBySkillrackEmailIgnoreCase(String skillrackEmail);
    List<SkillrackProfile> findAllByOrderByTotalPointsDesc();
    boolean existsBySkillrackEmailIgnoreCase(String skillrackEmail);
}
