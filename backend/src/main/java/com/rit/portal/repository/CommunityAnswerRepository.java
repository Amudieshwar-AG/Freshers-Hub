package com.rit.portal.repository;

import com.rit.portal.entity.CommunityAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CommunityAnswerRepository extends JpaRepository<CommunityAnswer, Integer> {
}
