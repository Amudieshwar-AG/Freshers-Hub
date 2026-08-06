package com.rit.portal.repository;

import com.rit.portal.entity.CollabApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CollabApplicationRepository extends JpaRepository<CollabApplication, Integer> {
    List<CollabApplication> findByApplicantEmailOrderByCreatedAtDesc(String applicantEmail);
    List<CollabApplication> findByCollabRequestIdOrderByCreatedAtDesc(Integer collabRequestId);
}
