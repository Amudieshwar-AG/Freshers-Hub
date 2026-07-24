package com.rit.portal.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BusLocation {
    private String routeNumber;
    private Double latitude;
    private Double longitude;
    private Instant lastUpdated;
}
