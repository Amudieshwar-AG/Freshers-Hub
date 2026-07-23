package com.rit.portal.controller;

import com.rit.portal.entity.BusRoute;
import com.rit.portal.repository.BusRouteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/bus-routes")
public class BusRouteController {

    @Autowired
    private BusRouteRepository busRouteRepository;

    @GetMapping
    public List<BusRoute> getAllBusRoutes() {
        return busRouteRepository.findAll();
    }
}
