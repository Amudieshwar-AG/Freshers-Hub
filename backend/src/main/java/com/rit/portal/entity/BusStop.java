package com.rit.portal.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "bus_stops")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BusStop {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "route_id", nullable = false)
    @JsonIgnore
    private BusRoute route;

    @Column(name = "stop_name", nullable = false)
    private String name;

    @Column(name = "arrival_time", nullable = false)
    private String time;

    @Column(name = "stop_order", nullable = false)
    private Integer stopOrder;
}
