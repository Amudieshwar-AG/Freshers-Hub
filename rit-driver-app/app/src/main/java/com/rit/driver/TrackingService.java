package com.rit.driver;

import android.annotation.SuppressLint;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Build;
import android.os.Bundle;
import android.os.IBinder;
import android.os.PowerManager;
import android.util.Log;
import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

public class TrackingService extends Service {

    private static final String TAG = "TrackingService";
    private static final String CHANNEL_ID = "TrackingServiceChannel";
    private static final int NOTIFICATION_ID = 444;

    private LocationManager locationManager;
    private PowerManager.WakeLock wakeLock;

    private String serverUrl = "";
    private String routeNumber = "";
    private String driverPin = "";

    // Broadcast action for MainActivity to update UI coordinates
    public static final String ACTION_LOCATION_BROADCAST = "com.rit.driver.LOCATION_BROADCAST";
    public static final String EXTRA_LATITUDE = "extra_latitude";
    public static final String EXTRA_LONGITUDE = "extra_longitude";
    public static final String EXTRA_ACCURACY = "extra_accuracy";
    public static final String EXTRA_STATUS = "extra_status";

    private final LocationListener locationListener = new LocationListener() {
        @Override
        public void onLocationChanged(Location location) {
            double lat = location.getLatitude();
            double lng = location.getLongitude();
            float accuracy = location.getAccuracy();

            Log.d(TAG, "Location updated: " + lat + ", " + lng + " (Accuracy: " + accuracy + "m)");

            // Broadcast updates locally to MainActivity UI
            Intent broadcastIntent = new Intent(ACTION_LOCATION_BROADCAST);
            broadcastIntent.putExtra(EXTRA_LATITUDE, lat);
            broadcastIntent.putExtra(EXTRA_LONGITUDE, lng);
            broadcastIntent.putExtra(EXTRA_ACCURACY, accuracy);
            broadcastIntent.putExtra(EXTRA_STATUS, "Broadcasting Location...");
            sendBroadcast(broadcastIntent);

            // Upload location to backend
            NetworkHelper.postLocation(serverUrl, routeNumber, lat, lng, driverPin, new NetworkHelper.Callback() {
                @Override
                public void onSuccess() {
                    Log.d(TAG, "Uploaded location successfully");
                    Intent statusIntent = new Intent(ACTION_LOCATION_BROADCAST);
                    statusIntent.putExtra(EXTRA_STATUS, "Upload Success: Location synced.");
                    sendBroadcast(statusIntent);
                }

                @Override
                public void onFailure(String error) {
                    Log.e(TAG, "Upload failed: " + error);
                    Intent statusIntent = new Intent(ACTION_LOCATION_BROADCAST);
                    statusIntent.putExtra(EXTRA_STATUS, "Upload Failed: " + error);
                    sendBroadcast(statusIntent);
                }
            });
        }

        @Override
        public void onStatusChanged(String provider, int status, Bundle extras) {}

        @Override
        public void onProviderEnabled(String provider) {}

        @Override
        public void onProviderDisabled(String provider) {
            Intent statusIntent = new Intent(ACTION_LOCATION_BROADCAST);
            statusIntent.putExtra(EXTRA_STATUS, "GPS Provider Disabled. Please turn on Location/GPS.");
            sendBroadcast(statusIntent);
        }
    };

    @Override
    public void onCreate() {
        super.onCreate();
        Log.d(TAG, "onCreate: Service starting");
        createNotificationChannel();
    }

    @SuppressLint("InvalidWakeLockTag")
    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        Log.d(TAG, "onStartCommand: Service active");

        if (intent != null) {
            serverUrl = intent.getStringExtra("server_url");
            routeNumber = intent.getStringExtra("route_number");
            driverPin = intent.getStringExtra("driver_pin");
        }

        // 1. Show Foreground Notification
        Intent notificationIntent = new Intent(this, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(
                this, 0, notificationIntent,
                PendingIntent.FLAG_IMMUTABLE
        );

        Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("RIT Driver Tracker")
                .setContentText("Active Journey: Route " + routeNumber + " is currently tracking...")
                .setSmallIcon(android.R.drawable.ic_menu_compass)
                .setContentIntent(pendingIntent)
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .build();

        startForeground(NOTIFICATION_ID, notification);

        // 2. Acquire Power CPU WakeLock
        PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
        if (pm != null) {
            wakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "TrackingService::WakeLock");
            wakeLock.acquire();
            Log.d(TAG, "WakeLock acquired successfully");
        }

        // 3. Register GPS location listener
        locationManager = (LocationManager) getSystemService(Context.LOCATION_SERVICE);
        try {
            if (locationManager != null) {
                // Request updates every 5 seconds (5000ms) or 2 meters
                locationManager.requestLocationUpdates(
                        LocationManager.GPS_PROVIDER,
                        5000,
                        2.0f,
                        locationListener
                );
                Log.d(TAG, "GPS Listener registered successfully");
            }
        } catch (SecurityException e) {
            Log.e(TAG, "SecurityException: Location permissions not granted", e);
            stopSelf();
        }

        return START_REDELIVER_INTENT;
    }

    @Override
    public void onDestroy() {
        Log.d(TAG, "onDestroy: Stopping service cleanups");

        // 1. Remove GPS Listener
        if (locationManager != null) {
            locationManager.removeUpdates(locationListener);
        }

        // 2. Release CPU WakeLock
        if (wakeLock != null && wakeLock.isHeld()) {
            wakeLock.release();
            Log.d(TAG, "WakeLock released cleanly");
        }

        super.onDestroy();
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel serviceChannel = new NotificationChannel(
                    CHANNEL_ID,
                    "RIT Driver Tracker Channel",
                    NotificationManager.IMPORTANCE_DEFAULT
            );
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(serviceChannel);
            }
        }
    }
}
