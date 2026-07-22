package com.rit.portal.repository;

import com.rit.portal.entity.BusRoute;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BusRouteRepository extends JpaRepository<BusRoute, Integer> {
    BusRoute findByNumber(String number);
}
