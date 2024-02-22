package com.example.locationtracker.foregroundServices

import android.Manifest
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.location.Location
import android.os.Handler
import android.os.HandlerThread
import android.os.IBinder
import android.os.PowerManager
import android.os.Process
import android.util.Log
import androidx.core.app.ActivityCompat
import androidx.core.app.NotificationCompat
import com.example.locationtracker.MainActivity
import com.example.locationtracker.R
import com.example.locationtracker.constants.Notifications.NOTIFICATION_CHANNEL_ID_FOR_LOCATION_TRACKER_SERVICE
import com.example.locationtracker.constants.Notifications.NOTIFICATION_ID_FOR_LOCATION_TRACKER_SERVICE
import com.example.locationtracker.constants.Services.LOCATION_TRACKER_SERVICE_BROADCAST
import com.example.locationtracker.data.LogsManager
import com.example.locationtracker.data.NewLocation
import com.example.locationtracker.data.PreferencesManager
import com.example.locationtracker.utils.updateNotification
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationServices
import java.text.SimpleDateFormat
import java.time.LocalTime
import java.util.Date
import java.util.Locale

private var wakeLock: PowerManager.WakeLock? = null

class LocationTrackerService : Service() {
    private lateinit var dbManager: LogsManager;

    private var locationGatheringStartTime: LocalTime? = null
    private var locationGatheringEndTime: LocalTime? = null

    private fun isActiveTimeNow(): Boolean {
        if (locationGatheringStartTime == locationGatheringEndTime)
            return locationGatheringStartTime == LocalTime.MIDNIGHT
        return LocalTime.now() <= locationGatheringEndTime && LocalTime.now() >= locationGatheringStartTime
    }

    private lateinit var fusedLocationClient: FusedLocationProviderClient

    // HandlerThread is a class in Android to create a thread that has its own message queue,
    // and that is designed to be used with a Handler.
    // A HandlerThread can be used to perform long-running operations in the background without blocking the UI thread.
    private lateinit var handlerThread: HandlerThread

    // The handler object is a Handler that is associated with this thread,
    // allowing to post Runnable objects or Message objects to the thread's message queue.
    private lateinit var handler: Handler

    enum class Actions {
        START, STOP
    }

    override fun onBind(intent: Intent?): IBinder? {
        return null
    }

    private fun sendServiceStatusBroadcast(isRunning: Boolean) {
        val intent = Intent(LOCATION_TRACKER_SERVICE_BROADCAST)
        intent.putExtra("isRunning", isRunning)
        sendBroadcast(intent)
    }

    override fun onCreate() {
        super.onCreate()
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)
        dbManager = LogsManager.getInstance(this);

        PreferencesManager(this).setIsLocationTrackerServiceRunning(true)
        sendServiceStatusBroadcast(true)
    }

    override fun onDestroy() {
        super.onDestroy()
        wakeLock?.let {
            if (it.isHeld) {
                it.release()
            }
        }

        handler.removeCallbacks(periodicTask)
        handlerThread.quitSafely()

        PreferencesManager(this).setIsLocationTrackerServiceRunning(false)
        sendServiceStatusBroadcast(false)
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            Actions.START.toString() -> {
                val startTimeStr = intent.getStringExtra("startTime")
                val endTimeStr = intent.getStringExtra("endTime")

                locationGatheringStartTime = startTimeStr?.let { LocalTime.parse(it) }
                locationGatheringEndTime = endTimeStr?.let { LocalTime.parse(it) }

                start()
                return START_STICKY
            }

            Actions.STOP.toString() -> stopSelf()
        }
        return super.onStartCommand(intent, flags, startId)
    }

    private fun start() {
        val notificationIntent = Intent(this, MainActivity::class.java)

        val pendingIntent = PendingIntent.getActivity(
            this, 0, notificationIntent, PendingIntent.FLAG_IMMUTABLE or 0
        )

        val notification =
            NotificationCompat.Builder(this, NOTIFICATION_CHANNEL_ID_FOR_LOCATION_TRACKER_SERVICE)
                .setSmallIcon(R.mipmap.ic_launcher_round)
                .setContentTitle("Location Gathering Active")
                .setContentText("Gathering has been started")
                .setContentIntent(pendingIntent)
                .build()
        startForeground(NOTIFICATION_ID_FOR_LOCATION_TRACKER_SERVICE, notification)

        val powerManager = getSystemService(Context.POWER_SERVICE) as PowerManager
        wakeLock = powerManager.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "MyApp::MyWakelockTag")
        wakeLock?.acquire(10 * 1000L /*10 minutes*/)


        handlerThread = HandlerThread("HandlerThread", Process.THREAD_PRIORITY_BACKGROUND)
        handlerThread.start()
        handler = Handler(handlerThread.looper)
        handler.post(periodicTask)
    }

    private fun logLocation() {
        Log.d("SPRAVA", "Periodic task run")
        val lastUpdateTime = SimpleDateFormat("hh:mm:ss a", Locale.getDefault()).format(Date())
        Log.d("LOCATION", lastUpdateTime)

        if (ActivityCompat.checkSelfPermission(
                this@LocationTrackerService,
                Manifest.permission.ACCESS_FINE_LOCATION
            ) != PackageManager.PERMISSION_GRANTED && ActivityCompat.checkSelfPermission(
                this@LocationTrackerService,
                Manifest.permission.ACCESS_COARSE_LOCATION
            ) != PackageManager.PERMISSION_GRANTED
        ) {
            updateNotification(
                applicationContext,
                NOTIFICATION_ID_FOR_LOCATION_TRACKER_SERVICE,
                NOTIFICATION_CHANNEL_ID_FOR_LOCATION_TRACKER_SERVICE,
                "Are u kidding me?",
                "(Last update: $lastUpdateTime)"
            )
            // TODO: Consider calling
            //    ActivityCompat#requestPermissions
            // here to request the missing permissions, and then overriding
            //   public void onRequestPermissionsResult(int requestCode, String[] permissions,
            //                                          int[] grantResults)
            // to handle the case where the user grants the permission. See the documentation
            // for ActivityCompat#requestPermissions for more details.
            return
        }
        fusedLocationClient.lastLocation
            .addOnSuccessListener { location: Location? ->
                // Log location or use as needed
                location?.let {
                    location.provider

                    Log.d(
                        "\tLOCATION2",
                        "Current location: ${location.latitude}, ${location.longitude}"
                    )

                    dbManager.saveNewLocation(
                        NewLocation(
                            latitude = location.latitude,
                            longitude = location.longitude,
                            accuracy = if (location.hasAccuracy()) location.accuracy else null,
                            bearing = if (location.hasBearing()) location.bearing else null,
                            bearingAccuracy = if (location.hasBearingAccuracy()) location.bearingAccuracyDegrees else null,
                            altitude = if (location.hasAltitude()) location.altitude else null,
                            speed = if (location.hasSpeed()) location.speed else null,
                            speedAccuracyMetersPerSecond = if (location.hasSpeedAccuracy()) location.speedAccuracyMetersPerSecond else null,
                            provider = location.provider
                        )
                    )

                    updateNotification(
                        applicationContext,
                        NOTIFICATION_ID_FOR_LOCATION_TRACKER_SERVICE,
                        NOTIFICATION_CHANNEL_ID_FOR_LOCATION_TRACKER_SERVICE,
                        "Location Gathering Active",
                        "(Last update sent: $lastUpdateTime)\n Current location: ${location.latitude}, ${location.longitude}\""
                    )
                }
            }
            .addOnFailureListener { exception ->
                Log.e("\tLOCATION2", "Error getting the location", exception)
            }

    }

    private val periodicTask = object : Runnable {
        override fun run() {
            if (isActiveTimeNow()) {
                logLocation()
            }
            else {
                updateNotification(
                    applicationContext,
                    NOTIFICATION_ID_FOR_LOCATION_TRACKER_SERVICE,
                    NOTIFICATION_CHANNEL_ID_FOR_LOCATION_TRACKER_SERVICE,
                    "Location Gathering Active (${LocalTime.now()})",
                    "Currently not active. Active hours: ${locationGatheringStartTime} - ${locationGatheringEndTime}"
                )
            }
            // Post the Runnable again with a delay
            handler.postDelayed(this, 5000)
        }
    }
}