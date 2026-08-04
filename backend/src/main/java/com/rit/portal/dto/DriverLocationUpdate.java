package com.rit.portal.dto;

public class DriverLocationUpdate {
    private Double latitude;
    private Double longitude;
    private String pin;

    public DriverLocationUpdate() {}

    public DriverLocationUpdate(Double latitude, Double longitude, String pin) {
        this.latitude = latitude;
        this.longitude = longitude;
        this.pin = pin;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public String getPin() {
        return pin;
    }

    public void setPin(String pin) {
        this.pin = pin;
    }
}
