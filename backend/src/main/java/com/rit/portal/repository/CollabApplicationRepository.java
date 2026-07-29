package com.rit.portal.repository;

import com.rit.portal.entity.CollabApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CollabApplicationRepository extends JpaRepository<CollabApplication, Integer> {
}
