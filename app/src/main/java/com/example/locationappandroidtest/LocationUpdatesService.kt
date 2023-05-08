package com.example.locationappandroidtest

import android.Manifest
import android.app.Notification
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.PackageManager
import android.os.BatteryManager
import android.os.Binder
import android.os.IBinder
import android.os.Handler
import android.os.HandlerThread
import android.util.Log
import androidx.core.app.ActivityCompat
import androidx.core.app.NotificationCompat
import com.google.android.gms.location.*
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

// importing just CHANNEL_ID
import com.example.locationappandroidtest.MainActivity.Companion.CHANNEL_ID
import com.example.locationappandroidtest.MainActivity.Companion.NOTIFICATION_ID_FOR_LOCATION
import com.example.locationappandroidtest.MainActivity.Companion.NOTIFICATION_ID_FOR_MY_CUSTOM_FOREGROUND_SERVICE

import android.os.Process // for: Process.THREAD_PRIORITY_BACKGROUND
import com.example.locationappandroidtest.NotificationHelper.updateNotification

class LocationUpdatesService : Service() {
    private val serverSender = ServerSender(this)

    private val updateIntervalMillis: Long = 5000 // The update interval in milliseconds

    // HandlerThread is a class in Android to create a thread that has its own message queue,
    // and that is designed to be used with a Handler.
    // A HandlerThread can be used to perform long-running operations in the background without blocking the UI thread.
    private lateinit var handlerThread: HandlerThread
    // The handler object is a Handler that is associated with this thread,
    // allowing to post Runnable objects or Message objects to the thread's message queue.
    private lateinit var handler: Handler

    lateinit var locationViewModel: LocationViewModel

    //    var locationViewModel: LocationViewModel? = null

    private val binder = LocationUpdatesBinder()
    override fun onBind(intent: Intent?): IBinder? {
        return binder
    }
    inner class LocationUpdatesBinder : Binder() {
        fun getService(): LocationUpdatesService = this@LocationUpdatesService
    }

    // any code that depends on the locationRequest property
    // will not be able to use it until it has been initialized.
    // However, once it has been initialized, subsequent accesses to the locationRequest property
    // will return the same LocationRequest object that was created during initialization
    private val locationRequest: LocationRequest by lazy { // by lazy is a property delegate that allows you to initialize a property lazily, meaning that the property is not initialized until it is accessed for the first time.
        LocationRequest.create().apply {
            interval = updateIntervalMillis
            fastestInterval = updateIntervalMillis
            priority = LocationRequest.PRIORITY_HIGH_ACCURACY
        }
    }

    private val fusedLocationClient: FusedLocationProviderClient by lazy {
        LocationServices.getFusedLocationProviderClient(this)
    }

    private val periodicTask = object : Runnable {
        override fun run() {
            Log.d("SPRAVA", "Periodic task run")
            val lastUpdateTime = SimpleDateFormat("hh:mm:ss a", Locale.getDefault()).format(Date())
                updateNotification(applicationContext, NOTIFICATION_ID_FOR_MY_CUSTOM_FOREGROUND_SERVICE, CHANNEL_ID, "Custom foreground service", "Last update sent: $lastUpdateTime")
            // Call your custom function to get the location and send it
            sendLocationAndBatteryLevel()

            // Post the Runnable again with a delay
            handler.postDelayed(this, updateIntervalMillis)
        }
    }

    // onStartCommand is called when a client (such as an activity ) requests to start the service using startService method.
    // the method returns an integer value telling the system what to do with the service after it has been started
    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        Log.d("SPRAVA", "LocationUpdatesService started")

        startForegroundNotification()

        handlerThread = HandlerThread("HandlerThread", Process.THREAD_PRIORITY_BACKGROUND)
        handlerThread.start()
        handler = Handler(handlerThread.looper)
        handler.post(periodicTask)

        // get another foreground service for location
        initializeLocationUpdates()

        return START_NOT_STICKY
        // This tells the system that if the service is killed by the system,
        // it should not be restarted automatically unless there are pending Intents to be delivered.
        // This means that the service will not be restarted if it is stopped due to low memory or other reasons,
        // unless the system has a pending Intent to restart it.

        // possible values:
        // - START_STICKY: This return value tells the system to restart the service if it is killed by the system,
        //    and to pass the original Intent that started the service to the onStartCommand() method when it is restarted.
        //    This means that any pending work that was not completed before the service was killed can be resumed.

        // - START_NOT_STICKY: The service will not be restarted if it is killed by the system, unless there are pending Intents to be delivered.

        //    START_REDELIVER_INTENT: This return value tells the system to restart the service if it is killed by the system,
        //    and to pass the original Intent that started the service to the onStartCommand() method when it is restarted.
        //    However, unlike START_STICKY, the system also re-delivers all pending Intents to the service, not just the original one.
        //    This means that any work that was not completed before the service was killed can be resumed,
        //    and any Intents that were received but not yet processed can be processed.
        // If the service performs long-running tasks and needs to resume them if it is killed and restarted,
        // prefer using START_STICKY.
        // If your service needs to process all Intents that were received but not yet processed,
        // you may want to use START_REDELIVER_INTENT. However, keep in mind that using START_REDELIVER_INTENT
        // can result in duplicate work being performed if the Intents are not properly handled.
    }

    private fun startForegroundNotification() {
        val notificationIntent = Intent(this, MainActivity::class.java)
        // A PendingIntent is a token that you give to another application
        // (e.g., the Android system) which allows that application to execute an operation on
        // app's behalf at a later time, even when your app is not running.
        // The operation can be to start an Activity, Service, or send a Broadcast.
        val pendingIntent = PendingIntent.getActivity(
            this, 0, notificationIntent, PendingIntent.FLAG_IMMUTABLE or 0
        )

        val notification: Notification = NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Location Updates")
            .setContentText("Sending location updates to server")
            .setSmallIcon(R.drawable.ic_launcher_background)
            .setContentIntent(pendingIntent)
            .build()

        startForeground(ONGOING_NOTIFICATION_ID, notification)
    }

    private fun sendLocationAndBatteryLevel() {
        Log.d("SPRAVA", "sendLocationAndBatteryLevel run")
        if (ActivityCompat.checkSelfPermission(
                this,
                Manifest.permission.ACCESS_FINE_LOCATION
            ) != PackageManager.PERMISSION_GRANTED && ActivityCompat.checkSelfPermission(
                this,
                Manifest.permission.ACCESS_COARSE_LOCATION
            ) != PackageManager.PERMISSION_GRANTED
        ) {
            Log.d("SPRAVA", "Missing permission.")
            // Missing permissions, can't get location
            return
        }

//        val handleLocationUpdate: (Location) -> Unit = { location ->
//            val batteryLevel = Helpers.getCurrentBatteryLevel(this)
//            Log.d(
//                "SPRAVA",
//                "Latitude: ${location.latitude}, Longitude: ${location.longitude}, Battery: $batteryLevel"
//            )
//
//            locationViewModel.updateLocation(location)
//            serverSender.sendLocation(location, batteryLevel)
//            updateNotification()
//        }

//        fusedLocationClient.lastLocation
//            .addOnSuccessListener { location ->
//                location?.let {
//                    handleLocationUpdate(location)
//                } ?: run {
//                    // If lastLocation is null, use requestLocationUpdates to get an update
//                    val locationRequest = LocationRequest.create().apply {
//                        interval = 5000
//                        fastestInterval = 5000
//                        priority = LocationRequest.PRIORITY_HIGH_ACCURACY
//                    }
//                    val locationCallback = object : LocationCallback() {
//                        override fun onLocationResult(locationResult: LocationResult) {
//                            fusedLocationClient.removeLocationUpdates(this)
//                            locationResult.lastLocation?.let {
//                                handleLocationUpdate(it)
//                            }
//                        }
//                    }
//                    fusedLocationClient.requestLocationUpdates(locationRequest, locationCallback, null)
//                }
//            }
//            .addOnFailureListener { exception ->
//                Log.e("SPRAVA", "Failed to get last location.", exception)
//            }

//        fusedLocationClient.lastLocation.addOnSuccessListener { location ->
//            location?.let {
//                val batteryLevel = Helpers.getCurrentBatteryLevel(this)
//                Log.d(
//                    "SPRAVA",
//                    "Latitude: ${location.latitude}, Longitude: ${location.longitude}, Battery: $batteryLevel"
//                )
//
//                locationViewModel.updateLocation(location)
//                serverSender.sendLocation(location, batteryLevel)
//                updateNotification()
//            }
//        }
//            .addOnFailureListener { exception ->
//                Log.e("SPRAVA", "Failed to get last location.", exception)
//            }
//            .addOnCompleteListener { l -> Log.d("SPRAVA", "Complete")}

    }

    override fun onDestroy() {
        Log.d("SPRAVA", "LocationUpdatesService destroyed")
        super.onDestroy()
        handler.removeCallbacks(periodicTask)
        handlerThread.quitSafely()
    }

    companion object {
        private const val ONGOING_NOTIFICATION_ID = 1
    }

//    override fun onCreate() {
//        Log.d("SPRAVA", "LocationUpdatesService created")
//        super.onCreate()
//        createLocationRequest()
//    }

    private val locationCallback = object : LocationCallback() {
        override fun onLocationResult(locationResult: LocationResult) {
            Log.d("SPRAVA", "Latest location received")
            val service: LocationUpdatesService = this@LocationUpdatesService
            val batteryLevel = Helpers.getCurrentBatteryLevel(service)
            locationResult.lastLocation.let { location ->
                locationViewModel.updateLocation(location)

                val lastUpdateTime = SimpleDateFormat("hh:mm:ss a", Locale.getDefault()).format(Date())
                updateNotification(applicationContext, NOTIFICATION_ID_FOR_LOCATION, CHANNEL_ID, "Location Updates", "Last update sent: $lastUpdateTime")

                serverSender.sendLocation(location, batteryLevel)
            }
        }
    }

    private fun initializeLocationUpdates() {
        if (ActivityCompat.checkSelfPermission(
                this,
                Manifest.permission.ACCESS_FINE_LOCATION
            ) != PackageManager.PERMISSION_GRANTED && ActivityCompat.checkSelfPermission(
                this,
                Manifest.permission.ACCESS_COARSE_LOCATION
            ) != PackageManager.PERMISSION_GRANTED
        ) {
            return
        }

        val locationRequest = LocationRequest.create().apply {
            interval = 10_000
            fastestInterval = 10_000
            priority = LocationRequest.PRIORITY_HIGH_ACCURACY
        }

        fusedLocationClient.requestLocationUpdates(locationRequest, locationCallback, null)
            .addOnFailureListener { exception ->
                Log.e("SPRAVA", "Failed to get last location.", exception)
            }
    }
}


object Helpers {
    @JvmStatic
    fun getCurrentBatteryLevel(context: Context): Int {
        val ifilter = IntentFilter(Intent.ACTION_BATTERY_CHANGED)
        val batteryStatus: Intent? = context.registerReceiver(null, ifilter)
        val level: Int = batteryStatus?.getIntExtra(BatteryManager.EXTRA_LEVEL, -1) ?: -1
        val scale: Int = batteryStatus?.getIntExtra(BatteryManager.EXTRA_SCALE, -1) ?: -1
        return level * 100 / scale
    }
}