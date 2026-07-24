package com.rit.driver;

import android.Manifest;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import java.util.ArrayList;
import java.util.List;

public class MainActivity extends AppCompatActivity {

    private static final int PERMISSION_REQUEST_CODE = 888;

    private EditText etRouteNumber;
    private EditText etDriverPin;
    private Button btnStartSharing;
    private Button btnStopSharing;
    private TextView tvStatusHeader;
    private TextView tvStatusLogs;
    private LinearLayout statusCard;

    private boolean isServiceRunning = false;

    // Receive tracking updates from Foreground Service
    private final BroadcastReceiver locationReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            if (intent != null) {
                if (intent.hasExtra(TrackingService.EXTRA_STATUS)) {
                    String status = intent.getStringExtra(TrackingService.EXTRA_STATUS);
                    tvStatusHeader.setText("STATUS: " + (isServiceRunning ? "ACTIVE" : "INACTIVE"));
                    logStatus(status);
                }

                if (intent.hasExtra(TrackingService.EXTRA_LATITUDE) && intent.hasExtra(TrackingService.EXTRA_LONGITUDE)) {
                    double lat = intent.getDoubleExtra(TrackingService.EXTRA_LATITUDE, 0.0);
                    double lng = intent.getDoubleExtra(TrackingService.EXTRA_LONGITUDE, 0.0);
                    float accuracy = intent.getFloatExtra(TrackingService.EXTRA_ACCURACY, 0.0f);

                    String gpsInfo = String.format("GPS Coords: %.6f, %.6f\nAccuracy: ±%.1fm", lat, lng, accuracy);
                    logStatus(gpsInfo);
                }
            }
        }
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // Bind Views
        etRouteNumber = findViewById(R.id.etRouteNumber);
        etDriverPin = findViewById(R.id.etDriverPin);
        etDriverPin.setText(Config.DEFAULT_PIN);
        btnStartSharing = findViewById(R.id.btnStartSharing);
        btnStopSharing = findViewById(R.id.btnStopSharing);
        tvStatusHeader = findViewById(R.id.tvStatusHeader);
        tvStatusLogs = findViewById(R.id.tvStatusLogs);
        statusCard = findViewById(R.id.statusCard);

        btnStartSharing.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (checkAndRequestPermissions()) {
                    startTracking();
                }
            }
        });

        btnStopSharing.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                stopTracking();
            }
        });
    }

    @Override
    protected void onResume() {
        super.onResume();
        // Register receiver for service communication
        IntentFilter filter = new IntentFilter(TrackingService.ACTION_LOCATION_BROADCAST);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(locationReceiver, filter, Context.RECEIVER_NOT_EXPORTED);
        } else {
            registerReceiver(locationReceiver, filter);
        }
    }

    @Override
    protected void onPause() {
        // Unregister receiver
        unregisterReceiver(locationReceiver);
        super.onPause();
    }

    private void startTracking() {
        String serverUrl = Config.BACKEND_URL;
        String routeNumber = etRouteNumber.getText().toString().trim();
        String driverPin = etDriverPin.getText().toString().trim();
        if (routeNumber.isEmpty()) {
            Toast.makeText(this, "Enter bus route number", Toast.LENGTH_SHORT).show();
            return;
        }
        if (driverPin.isEmpty()) {
            Toast.makeText(this, "Enter security driver PIN", Toast.LENGTH_SHORT).show();
            return;
        }

        Intent serviceIntent = new Intent(this, TrackingService.class);
        serviceIntent.putExtra("server_url", serverUrl);
        serviceIntent.putExtra("route_number", routeNumber);
        serviceIntent.putExtra("driver_pin", driverPin);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(serviceIntent);
        } else {
            startService(serviceIntent);
        }

        isServiceRunning = true;
        btnStartSharing.setVisibility(View.GONE);
        btnStopSharing.setVisibility(View.VISIBLE);
        tvStatusHeader.setText("STATUS: ACTIVE");
        logStatus("Foreground tracking service started.");
    }

    private void stopTracking() {
        Intent serviceIntent = new Intent(this, TrackingService.class);
        stopService(serviceIntent);

        isServiceRunning = false;
        btnStartSharing.setVisibility(View.VISIBLE);
        btnStopSharing.setVisibility(View.GONE);
        tvStatusHeader.setText("STATUS: INACTIVE");
        logStatus("Tracking stopped by driver.");
    }

    private void logStatus(String msg) {
        String currentText = tvStatusLogs.getText().toString();
        tvStatusLogs.setText(msg + "\n\n" + currentText);
    }

    private boolean checkAndRequestPermissions() {
        boolean hasFine = ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED;
        boolean hasCoarse = ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED;

        List<String> listPermissionsNeeded = new ArrayList<>();

        if (!hasFine && !hasCoarse) {
            listPermissionsNeeded.add(Manifest.permission.ACCESS_FINE_LOCATION);
            listPermissionsNeeded.add(Manifest.permission.ACCESS_COARSE_LOCATION);
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                listPermissionsNeeded.add(Manifest.permission.POST_NOTIFICATIONS);
            }
        }

        if (!listPermissionsNeeded.isEmpty()) {
            ActivityCompat.requestPermissions(
                    this,
                    listPermissionsNeeded.toArray(new String[0]),
                    PERMISSION_REQUEST_CODE
            );
            return false;
        }

        return true;
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == PERMISSION_REQUEST_CODE) {
            boolean hasFine = ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED;
            boolean hasCoarse = ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED;

            if (hasFine || hasCoarse) {
                startTracking();
            } else {
                Toast.makeText(this, "Location permission (Precise or Approximate) is required to track the bus.", Toast.LENGTH_LONG).show();
            }
        }
    }
}
