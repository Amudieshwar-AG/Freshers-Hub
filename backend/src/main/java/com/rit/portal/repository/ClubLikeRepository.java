package com.rit.portal.repository;

import com.rit.portal.entity.ClubLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ClubLikeRepository extends JpaRepository<ClubLike, Long> {

    Optional<ClubLike> findByClubIdAndUserIdentifier(String clubId, String userIdentifier);

    boolean existsByClubIdAndUserIdentifier(String clubId, String userIdentifier);

    long countByClubId(String clubId);

    List<ClubLike> findByUserIdentifier(String userIdentifier);

    @Query("SELECT c.clubId, COUNT(c) FROM ClubLike c GROUP BY c.clubId")
    List<Object[]> countAllGroupedByClubId();
}
