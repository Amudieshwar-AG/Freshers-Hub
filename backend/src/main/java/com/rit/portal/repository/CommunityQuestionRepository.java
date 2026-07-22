package com.rit.portal.repository;

import com.rit.portal.entity.CommunityQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CommunityQuestionRepository extends JpaRepository<CommunityQuestion, Integer> {
}
