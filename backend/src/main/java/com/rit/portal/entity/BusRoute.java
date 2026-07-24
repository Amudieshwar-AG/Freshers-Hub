package com.rit.portal.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "bus_routes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BusRoute {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "route_number", unique = true, nullable = false)
    private String number;

    @Column(name = "route_name", nullable = false)
    private String name;

    @Column(name = "start_point", nullable = false)
    private String from;

    @Column(name = "end_point", nullable = false)
    private String to;

    @Column(name = "departure_time", nullable = false)
    private String departureTime;

    @Column(name = "arrival_time", nullable = false)
    private String arrivalTime;

    @Column(name = "color_code")
    private String color;

    @Column(name = "from_lat")
    private Double fromLat;

    @Column(name = "from_lng")
    private Double fromLng;

    @Column(name = "to_lat")
    private Double toLat;

    @Column(name = "to_lng")
    private Double toLng;

    @Column(name = "polyline_data", columnDefinition = "TEXT")
    @com.fasterxml.jackson.annotation.JsonRawValue
    private String polyline;

    @OneToMany(mappedBy = "route", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @OrderBy("stopOrder ASC")
    @Builder.Default
    private List<BusStop> stops = new ArrayList<>();
}
