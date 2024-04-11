### These are only notes for me during the development of this app

#### device location in my own foreground service instead of relying on fuse location provider
To get device location updates without using the Fused Location Provider,
you can use the `LocationManager` class and request updates from the GPS provider.
Here's a step-by-step guide to create a foreground service to get location updates using `LocationManager`:

1. Add the necessary permissions in your `AndroidManifest.xml` file:

```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
```

2. Create a new service class that extends `Service`:

```kotlin
class MyLocationService : Service() {
    private lateinit var locationManager: LocationManager
    private lateinit var locationListener: LocationListener

    override fun onBind(intent: Intent): IBinder? {
        return null
    }

    override fun onCreate() {
        super.onCreate()
        createLocationListener()
        createNotificationChannel()
        startForeground(NOTIFICATION_ID, createNotification())

        locationManager = getSystemService(Context.LOCATION_SERVICE) as LocationManager
        try {
            locationManager.requestLocationUpdates(LocationManager.GPS_PROVIDER, LOCATION_UPDATE_INTERVAL, MIN_DISTANCE_CHANGE, locationListener)
        } catch (e: SecurityException) {
            e.printStackTrace()
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        locationManager.removeUpdates(locationListener)
    }

    private fun createLocationListener() {
        locationListener = object : LocationListener {
            override fun onLocationChanged(location: Location) {
                // Do something with the new location
                Log.d(TAG, "Location: ${location.latitude}, ${location.longitude}")
            }

            override fun onStatusChanged(provider: String, status: Int, extras: Bundle) {}

            override fun onProviderEnabled(provider: String) {}

            override fun onProviderDisabled(provider: String) {}
        }
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(NOTIFICATION_CHANNEL_ID, NOTIFICATION_CHANNEL_NAME, NotificationManager.IMPORTANCE_LOW)
            val notificationManager = getSystemService(NotificationManager::class.java)
            notificationManager.createNotificationChannel(channel)
        }
    }

    private fun createNotification(): Notification {
        val notificationIntent = Intent(this, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(this, 0, notificationIntent, 0)

        return NotificationCompat.Builder(this, NOTIFICATION_CHANNEL_ID)
            .setContentTitle("My Location Service")
            .setContentText("Getting location updates...")
            .setSmallIcon(R.drawable.ic_launcher_foreground)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .build()
    }

    companion object {
        private const val TAG = "MyLocationService"
        private const val NOTIFICATION_ID = 1
        private const val NOTIFICATION_CHANNEL_ID = "location_service_channel"
        private const val NOTIFICATION_CHANNEL_NAME = "Location Service"
        private const val LOCATION_UPDATE_INTERVAL = 60000L // 60 seconds
        private const val MIN_DISTANCE_CHANGE = 10f // 10 meters
    }
}
```

3. Start the foreground service from your activity:

```kotlin
private fun startLocationService() {
    val intent = Intent(this, MyLocationService::class.java)
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        startForegroundService(intent)
    } else {
        startService(intent)
    }
}

private fun stopLocationService() {
    val intent = Intent(this, MyLocationService::class.java)
    stopService(intent)
}
```

This code creates a foreground service that uses the `LocationManager` to request location updates from the GPS provider. Make sure to replace `R.drawable.ic_launcher_foreground` with an appropriate icon resource

## Is fused location provider better than this custom solution?

Fused Location Provider (FLP) is generally considered better than using the `LocationManager` with GPS_PROVIDER directly, due to several reasons:

1. Battery efficiency: FLP uses a combination of GPS, Wi-Fi, and cellular network data to determine location. It intelligently balances the use of these providers to optimize battery usage.

2. Accuracy: FLP can provide better accuracy as it combines data from multiple sources (GPS, Wi-Fi, and cellular networks), whereas using the `LocationManager` with GPS_PROVIDER relies solely on the GPS.

3. Faster location updates: FLP can provide quicker initial location fixes, as it can use Wi-Fi or cellular network data to determine an approximate location before the GPS gets a fix.

4. Easier to use: FLP provides a simpler API for requesting location updates, which makes it easier to implement and manage in your app.

However, there are some cases where you might prefer using the `LocationManager` directly with the GPS_PROVIDER:

1. If your app requires only GPS-based location data (e.g., for an outdoor activity tracking app).

2. If you need more fine-grained control over the GPS hardware and its settings.

In most cases, it's recommended to use the Fused Location Provider due to its better battery efficiency, accuracy, and ease of use. But if you have specific requirements, using the `LocationManager` directly with the GPS_PROVIDER might be more suitable for your use case.