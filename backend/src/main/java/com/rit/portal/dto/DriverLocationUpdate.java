package com.rit.portal.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DriverLocationUpdate {
    private Double latitude;
    private Double longitude;
    private String pin;
}
