import android.Manifest
import android.app.Service
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.location.Location
import android.os.IBinder
import android.os.PowerManager
import android.util.Log
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationServices
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

//import android.Manifest
//import android.app.Notification
//import android.app.Service
//import android.content.Intent
//import android.content.pm.PackageManager
//import android.location.Location
//import android.os.Handler
//import android.os.IBinder
//import android.os.Looper
//import android.util.Log
//import androidx.core.app.ActivityCompat
//import com.google.android.gms.location.FusedLocationProviderClient
//import com.google.android.gms.location.LocationServices
//
//class NewLocationService : Service() {
//    private lateinit var fusedLocationClient: FusedLocationProviderClient
//
//    override fun onBind(intent: Intent): IBinder? {
//        return null
//    }
//
//    override fun onCreate() {
//        super.onCreate()
//        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)
//        startForeground(1, Notification()) // Create a proper notification for Android O and above
//
//        // Schedule location updates
//        Log.d("------------------- NewLocationService", "CREATED")
//        val handler = Handler(Looper.getMainLooper())
//        val runnable = object : Runnable {
//            override fun run() {
//                getLastLocation()
//                handler.postDelayed(this, 300000) // 5 minutes
//            }
//        }
//        handler.post(runnable)
//    }
//
//    private fun getLastLocation() {
//        if (ActivityCompat.checkSelfPermission(this,
//                Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED && ActivityCompat.checkSelfPermission(
//                this, Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
//            // TODO: Consider calling ActivityCompat#requestPermissions
//            return
//        }
//        fusedLocationClient.lastLocation
//            .addOnSuccessListener { location : Location? ->
//                // Log location or use as needed
//                location?.let {
//                    Log.d("------------------- LocationService", "Current location: ${location.latitude}, ${location.longitude}")
//                }
//            }
//    }
//}

public class AlarmReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        // You can start a service or directly fetch the location here
        // If targeting API 26 or above, use startForegroundService to start your service
        val lastUpdateTime = SimpleDateFormat("hh:mm:ss a", Locale.getDefault()).format(Date())
        Log.d("ALARM_RECEIVER", "onReceive: ${lastUpdateTime}")
        val serviceIntent = Intent(context, LocationService::class.java)
        ContextCompat.startForegroundService(context, serviceIntent)
    }
}

class LocationService : Service() {
    private lateinit var fusedLocationClient: FusedLocationProviderClient
    private lateinit var wakeLock: PowerManager.WakeLock

    override fun onBind(intent: Intent): IBinder? {
        return null
    }
    override fun onCreate() {
        super.onCreate()
        val powerManager = getSystemService(POWER_SERVICE) as PowerManager
        wakeLock = powerManager.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "LocationService::lock")
        wakeLock.acquire(10*60*1000L /*10 minutes*/)
        val lastUpdateTime = SimpleDateFormat("hh:mm:ss a", Locale.getDefault()).format(Date())
        Log.d("LocationService", "onCreate: ${lastUpdateTime}")
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)
        getLastLocation()
    }

    override fun onDestroy() {
        super.onDestroy()
        wakeLock.release()
    }

    private fun getLastLocation() {
        if (ActivityCompat.checkSelfPermission(this,
                Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED && ActivityCompat.checkSelfPermission(
                this, Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            // TODO: Consider calling ActivityCompat#requestPermissions
            return
        }
        fusedLocationClient.lastLocation
            .addOnSuccessListener { location : Location? ->
                // Log location or use as needed
                location?.let {
                    Log.d("LocationService", "Current location: ${location.latitude}, ${location.longitude}")
                }
            }
    }

    // Remaining implementation of getLastLocation
}
