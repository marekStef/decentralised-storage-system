package com.example.locationappandroidtest

import CustomLogger
import android.Manifest
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.PackageManager
import android.os.BatteryManager
import android.os.Binder
import android.os.Build
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

import android.os.Process // for: Process.THREAD_PRIORITY_BACKGROUND
import androidx.core.app.NotificationManagerCompat
import androidx.localbroadcastmanager.content.LocalBroadcastManager
import com.example.locationappandroidtest.NotificationHelper.updateNotification

class LocationUpdatesService() : Service() {
    companion object {
        public const val NOTIFICATION_ID_FOR_LOCATION = 123
        public val CHANNEL_ID = "LocationUpdatesChannel"
    }

    private val serverSender = ServerSender(this)
    private val updateIntervalMillis: Long = 5000 // The update interval in milliseconds
    private var testId:String? = ""
    private var numberOfSecondsBetweenLocationUpdates:Long = 1 // default value

    private var logger:CustomLogger = CustomLogger

    private val fusedLocationClient: FusedLocationProviderClient by lazy {
        LocationServices.getFusedLocationProviderClient(this)
    }

    override fun onBind(intent: Intent?): IBinder? {
        return null
    }

    // onStartCommand is called when a client (such as an activity ) requests to start the service using startService method.
    // the method returns an integer value telling the system what to do with the service after it has been started
    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        logger.init(this)

        Log.d("SPRAVA", "LocationUpdatesService started")
        testId = intent?.getStringExtra("testId")

        // non-null asserted call is an operation that enforces a nullable type to be treated
        // as a non-null type. This is done using the not-null assertion operator,
        // which is a double exclamation mark !!
        // You're telling the compiler that you're sure the value won't be null at this point in the code.
        // If the value turns out to be null, however, a NullPointerException will be thrown at runtime.
        // Using the not-null assertion operator can be risky.
        numberOfSecondsBetweenLocationUpdates =
            intent?.getLongExtra("numberOfSecondsBetweenLocationUpdates", 1)!!
        numberOfSecondsBetweenLocationUpdates = numberOfSecondsBetweenLocationUpdates

        startForegroundNotification()

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
        createNotificationChannel()

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

        startForeground(NOTIFICATION_ID_FOR_LOCATION, notification)
    }

    private fun createNotificationChannel() {
        // Create the NotificationChannel, but only on API 26+ because
        // the NotificationChannel class is new and not in the support library
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val name = "Location Updates Channel"
            val descriptionText = "Channel for location update notifications"
            val importance = NotificationManager.IMPORTANCE_DEFAULT
            val channel = NotificationChannel(CHANNEL_ID, name, importance).apply {
                description = descriptionText
            }
            // Register the channel with the system
            val notificationManager: NotificationManager =
                getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }

    override fun onDestroy() {
        Log.d("SPRAVA", "LocationUpdatesService destroyed")
        stopService()
        super.onDestroy()
    }

    fun stopService() {
        val notificationManager = NotificationManagerCompat.from(this)
        notificationManager.cancel(NOTIFICATION_ID_FOR_LOCATION)
        logger.close()

        fusedLocationClient.removeLocationUpdates(locationCallback)
        stopSelf()
    }

//    override fun onCreate() {
//        Log.d("SPRAVA", "LocationUpdatesService created")
//        super.onCreate()
//        createLocationRequest()
//    }

    private fun sendLocationUpdateBroadcast(latitude: Double, longitude: Double) {
        val intent = Intent("location_update")
        intent.putExtra("latitude", latitude)
        intent.putExtra("longitude", longitude)
        LocalBroadcastManager.getInstance(this).sendBroadcast(intent)
        Log.d("SPRAVA", "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
    }

    private val locationCallback = object : LocationCallback() {
        override fun onLocationResult(locationResult: LocationResult) {
            Log.d("SPRAVA", "Latest location received")
            val service: LocationUpdatesService = this@LocationUpdatesService
            val batteryLevel = Helpers.getCurrentBatteryLevel(service)
            locationResult.lastLocation.let { location ->

                sendLocationUpdateBroadcast(latitude = location.latitude, longitude = location.longitude)

                val lastUpdateTime = SimpleDateFormat("hh:mm:ss a", Locale.getDefault()).format(Date())
                updateNotification(applicationContext, NOTIFICATION_ID_FOR_LOCATION, CHANNEL_ID, "Location Updates", "Last update sent: $lastUpdateTime")
                logger.log("LOGGER", lastUpdateTime)
                //serverSender.sendLocation(location, batteryLevel, testId)
            }
        }
    }

    private fun initializeLocationUpdates() {
        val hasFineLocationPermission = ActivityCompat.checkSelfPermission(
            this,
            Manifest.permission.ACCESS_FINE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED
        val hasBackgroundLocationPermission = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            ActivityCompat.checkSelfPermission(
                this,
                Manifest.permission.ACCESS_BACKGROUND_LOCATION
            ) == PackageManager.PERMISSION_GRANTED
        } else {
            true
        }

        if (!hasFineLocationPermission || !hasBackgroundLocationPermission) {
            //TODO: Handle permission request here
            return
        }

        val locationRequest = LocationRequest.create().apply {
            interval = numberOfSecondsBetweenLocationUpdates * 1000
            fastestInterval = numberOfSecondsBetweenLocationUpdates * 1000
            maxWaitTime = numberOfSecondsBetweenLocationUpdates * 1000
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