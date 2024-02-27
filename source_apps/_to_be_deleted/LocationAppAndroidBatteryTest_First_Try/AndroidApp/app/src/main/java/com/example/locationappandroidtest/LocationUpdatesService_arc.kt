package com.example.locationappandroidtest
//
//import android.Manifest
//import android.app.AlertDialog
//import android.app.NotificationManager
//import android.app.Service
//import android.content.Context
//import android.content.Intent
//import android.content.IntentFilter
//import android.content.pm.PackageManager
//import android.os.BatteryManager
//import android.os.Binder
//import android.os.IBinder
//import android.os.Looper
//import android.os.Handler
//import android.util.Log
//import androidx.core.app.ActivityCompat
//import androidx.core.app.NotificationCompat
//import androidx.core.content.ContextCompat
//import com.google.android.gms.location.*
//import java.text.SimpleDateFormat
//import java.util.Date
//import java.util.Locale
//
//class LocationUpdatesService : Service() {
//    private val serverSender = ServerSender(this)
//
//    private val CHANNEL_ID = MainActivity.CHANNEL_ID
//    private val NOTIFICATION_ID = 123
//
//    private lateinit var fusedLocationClient: FusedLocationProviderClient
//    private lateinit var locationCallback: LocationCallback
//
//    private val binder = LocationUpdatesBinder()
//    var locationViewModel: LocationViewModel? = null
//
//    override fun onBind(intent: Intent?): IBinder? {
//        return binder
//    }
//
//    inner class LocationUpdatesBinder : Binder() {
//        fun getService(): LocationUpdatesService = this@LocationUpdatesService
//    }
//
//    override fun onCreate() {
//        Log.d("SPRAVA", "LocationUpdatesService created")
//        super.onCreate()
//        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)
//        createLocationRequest()
//
//    }
//
//    private fun createLocationRequest() {
//        val locationRequest = LocationRequest.create().apply {
//            interval = 5 * 1000
//            fastestInterval = 5 * 1000
//            priority = LocationRequest.PRIORITY_HIGH_ACCURACY
//        }
//
//        locationCallback = object : LocationCallback() {
//            override fun onLocationResult(locationResult: LocationResult?) {
//                locationResult ?: return
//                Log.d("SPRAVA", "------------------, Sending location to server!")
//
//                // If you want to log the actual location coordinates, you can do so like this:
//                val location = locationResult.lastLocation
//                val service: LocationUpdatesService = this@LocationUpdatesService
//                val batteryLevel = Helpers.getCurrentBatteryLevel(service)
//                Log.d(
//                    "SPRAVA",
//                    "Latitude: ${location.latitude}, Longitude: ${location.longitude}, Battery: ${batteryLevel}"
//                )
//
//                locationViewModel?.updateLocation(locationResult)
//                updateNotification()
//
//                serverSender.sendLocation(location, batteryLevel)
//            }
//
//            override fun onLocationAvailability(p0: LocationAvailability) {
//                Log.d("SPRAVA", "------------------, LOCATION AVAILABILITY!")
//            }
//        }
//
//        if (ActivityCompat.checkSelfPermission(
//                this,
//                Manifest.permission.ACCESS_FINE_LOCATION
//            ) != PackageManager.PERMISSION_GRANTED && ActivityCompat.checkSelfPermission(
//                this,
//                Manifest.permission.ACCESS_COARSE_LOCATION
//            ) != PackageManager.PERMISSION_GRANTED
//        ) {
//            // TODO: Consider calling
//            //    ActivityCompat#requestPermissions
//            // here to request the missing permissions, and then overriding
//            //   public void onRequestPermissionsResult(int requestCode, String[] permissions,
//            //                                          int[] grantResults)
//            // to handle the case where the user grants the permission. See the documentation
//            // for ActivityCompat#requestPermissions for more details.
//            return
//        }
//
//        Log.d("SPRAVA", "------------------, here2!")
//        fusedLocationClient.requestLocationUpdates(
//            locationRequest,
//            locationCallback,
//            Looper.myLooper() // Pass the current Looper or null to run on the main thread
//        )
//    }
//
//    // onStartCommand is called when a client (such as an activity ) requests to start the service using startService method.
//    // the method returns an integer value telling the system what to do with the service after it has been started
//    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
//        Log.d("SPRAVA", "LocationUpdatesService started")
//        val notification = NotificationCompat.Builder(this, CHANNEL_ID)
//            .setContentTitle("Location Updates")
//            .setContentText("Sending location updates to server")
//            .setSmallIcon(R.drawable.ic_notification)
//            .build()
//
//        startForeground(NOTIFICATION_ID, notification)
//
//        return START_NOT_STICKY // This tells the system that if the service is killed by the system,
//        // it should not be restarted automatically unless there are pending Intents to be delivered.
//        // This means that the service will not be restarted if it is stopped due to low memory or other reasons,
//        // unless the system has a pending Intent to restart it.
//
//        // possible values:
//        // - START_STICKY: This return value tells the system to restart the service if it is killed by the system,
//        //    and to pass the original Intent that started the service to the onStartCommand() method when it is restarted.
//        //    This means that any pending work that was not completed before the service was killed can be resumed.
//
//        // - START_NOT_STICKY: The service will not be restarted if it is killed by the system, unless there are pending Intents to be delivered.
//
//        //    START_REDELIVER_INTENT: This return value tells the system to restart the service if it is killed by the system,
//        //    and to pass the original Intent that started the service to the onStartCommand() method when it is restarted.
//        //    However, unlike START_STICKY, the system also re-delivers all pending Intents to the service, not just the original one.
//        //    This means that any work that was not completed before the service was killed can be resumed,
//        //    and any Intents that were received but not yet processed can be processed.
//        // If the service performs long-running tasks and needs to resume them if it is killed and restarted,
//        // prefer using START_STICKY.
//        // If your service needs to process all Intents that were received but not yet processed,
//        // you may want to use START_REDELIVER_INTENT. However, keep in mind that using START_REDELIVER_INTENT
//        // can result in duplicate work being performed if the Intents are not properly handled.
//    }
//
//    private fun updateNotification() {
//        val lastUpdateTime = SimpleDateFormat("hh:mm:ss a", Locale.getDefault()).format(Date())
//        val notification = NotificationCompat.Builder(this, CHANNEL_ID)
//            .setContentTitle("Location Updates")
//            .setContentText("Last update sent: $lastUpdateTime")
//            .setSmallIcon(R.drawable.ic_notification)
//            .build()
//
//        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
//        notificationManager.notify(NOTIFICATION_ID, notification)
//    }
//
//    override fun onDestroy() {
//        Log.d("SPRAVA", "LocationUpdatesService destroyed")
//        fusedLocationClient.removeLocationUpdates(locationCallback)
//        super.onDestroy()
//    }
//}
//
//
//object Helpers {
//    @JvmStatic
//    fun getCurrentBatteryLevel(context: Context): Int {
//        val ifilter = IntentFilter(Intent.ACTION_BATTERY_CHANGED)
//        val batteryStatus: Intent? = context.registerReceiver(null, ifilter)
//        val level: Int = batteryStatus?.getIntExtra(BatteryManager.EXTRA_LEVEL, -1) ?: -1
//        val scale: Int = batteryStatus?.getIntExtra(BatteryManager.EXTRA_SCALE, -1) ?: -1
//        return level * 100 / scale
//    }
//}