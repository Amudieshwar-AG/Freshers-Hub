package com.rit.driver;

import android.util.Log;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

public class NetworkHelper {

    private static final String TAG = "NetworkHelper";

    public interface Callback {
        void onSuccess();
        void onFailure(String error);
    }

    public static void postLocation(final String serverUrl, final String routeNumber, final double lat, final double lng, final String pin, final Callback callback) {
        new Thread(new Runnable() {
            @Override
            public void run() {
                HttpURLConnection conn = null;
                try {
                    // Clean URL trailing slash and route mapping
                    String cleanUrl = serverUrl;
                    if (cleanUrl.endsWith("/")) {
                        cleanUrl = cleanUrl.substring(0, cleanUrl.length() - 1);
                    }
                    String targetUrl = cleanUrl + "/api/bus-locations/" + routeNumber;

                    URL url = new URL(targetUrl);
                    conn = (HttpURLConnection) url.openConnection();
                    conn.setRequestMethod("POST");
                    conn.setRequestProperty("Content-Type", "application/json");
                    conn.setDoOutput(true);
                    conn.setConnectTimeout(8000);
                    conn.setReadTimeout(8000);

                    // Build JSON string payload
                    String jsonInputString = String.format(
                        "{\"latitude\": %f, \"longitude\": %f, \"pin\": \"%s\"}",
                        lat, lng, pin
                    );

                    try (OutputStream os = conn.getOutputStream()) {
                        byte[] input = jsonInputString.getBytes(StandardCharsets.UTF_8);
                        os.write(input, 0, input.length);
                    }

                    int code = conn.getResponseCode();
                    if (code == 200 || code == 201) {
                        Log.d(TAG, "Location uploaded successfully: " + code);
                        if (callback != null) {
                            callback.onSuccess();
                        }
                    } else {
                        String errMsg = "HTTP error code " + code;
                        Log.w(TAG, errMsg);
                        if (callback != null) {
                            callback.onFailure(errMsg);
                        }
                    }
                } catch (Exception e) {
                    String errMsg = "Upload failed: " + e.getMessage();
                    Log.e(TAG, errMsg, e);
                    if (callback != null) {
                        callback.onFailure(errMsg);
                    }
                } finally {
                    if (conn != null) {
                        conn.disconnect();
                    }
                }
            }
        }).start();
    }
}
