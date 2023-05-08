package com.example.locationappandroidtest

import android.Manifest // This will allow you to reference the location permissions using the Manifest.permission constants in your code, such as Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION, and Manifest.permission.ACCESS_BACKGROUND_LOCATION.
import android.app.AlertDialog
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.ServiceConnection
import android.content.pm.PackageManager
import android.os.Bundle
import android.os.IBinder
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.example.locationappandroidtest.ui.theme.LocationAppAndroidTestTheme
import androidx.activity.viewModels
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.TextField
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.text.input.TextFieldValue
import androidx.compose.ui.unit.dp

class MainActivity : ComponentActivity() {
    private val REQUEST_LOCATION_PERMISSION = 1001

    companion object {
        public const val CHANNEL_ID = "LocationUpdatesChannel"
        public const val NOTIFICATION_ID_FOR_LOCATION = 123
        public const val NOTIFICATION_ID_FOR_MY_CUSTOM_FOREGROUND_SERVICE = 124
    }

    private lateinit var locationUpdatesService: LocationUpdatesService
    private var isBound = false

    private val locationViewModel: LocationViewModel by viewModels()
    private val serviceConnection = object : ServiceConnection {
        override fun onServiceConnected(name: ComponentName?, service: IBinder?) {
            val binder = service as LocationUpdatesService.LocationUpdatesBinder
            locationUpdatesService = binder.getService()
            locationUpdatesService.locationViewModel = locationViewModel
            isBound = true
        }

        override fun onServiceDisconnected(name: ComponentName?) {
            isBound = false
        }
    }

    @OptIn(ExperimentalMaterial3Api::class)
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)


        setContent {
            val startTestClicked = remember { mutableStateOf(false) }

            LocationAppAndroidTestTheme {
                // A surface container using the 'background' color from the theme
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Text("Testing battery when sending foreground location to server")

                        // Add a text input
                        val inputText = remember { mutableStateOf(TextFieldValue()) }
                        TextField(
                            value = inputText.value,
                            onValueChange = { inputText.value = it },
                            label = { Text("Enter name of new test") },
                            singleLine = true,
                            enabled = !startTestClicked.value
                        )

                        // Add a button
                        Button(onClick = {
                            startTestClicked.value = true
                        }, enabled = !startTestClicked.value) {
                            Text("Start sending location")
                        }

                        // Add a button
                        Button(onClick = {
                            startTestClicked.value = false
                        }, enabled = startTestClicked.value) {
                            Text("End sending location")
                        }

                        if (locationViewModel.lastLocation.value == null) {
                            Text("Location not available")
                        } else {
                            Text(locationViewModel.lastLocation.value!!)
                            Text(locationViewModel.lastUpdatedTime.value!!)
                        }
                    }
                }
            }
        }

        createNotificationChannel()
        requestLocationPermissions()
    }

    // The createNotificationChannel() function creates a notification channel for the app.
    // A NotificationChannel is a construct introduced in Android 8.0 (API level 26) that allows to group notifications into channels.
    // Each channel represents a type of notification that the app can send, and each channel can have different settings,
    // such as the importance level, sound, vibration, and light settings.
    //
    //The CHANNEL_ID is a unique identifier for the notification channel.
    // ID needs to be provided when creating the notification channel and when creating the notification itself.
    // This ID helps the system to determine which channel the notification belongs to,
    // and it allows users to modify the settings of that channel individually in the system settings.
    //
    //The reason the app crashes without the createNotificationChannel() function is that,
    // starting from Android 8.0, you must create a notification channel before posting any notifications.
    // If I don't create a notification channel and try to post a notification, the system will throw an exception, causing your app to crash.
    //The importance level (IMPORTANCE_LOW) determines how the system should display notifications for this channel.
    // In this case, the notifications will be shown without making a sound, and they won't appear on the lock screen.
    private fun createNotificationChannel() {
        val name = "Location Updates"
        val descriptionText = "Sending location updates to server"
        val importance = NotificationManager.IMPORTANCE_LOW
        val channel = NotificationChannel(CHANNEL_ID, name, importance).apply {
            description = descriptionText
        }

        // Context.NOTIFICATION_SERVICE is a constant string that represents the system-level
        // service name for the NotificationManager.
        // It is used to retrieve an instance of the NotificationManager from the system.
        val notificationManager: NotificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.createNotificationChannel(channel)
    }

    private fun requestLocationPermissions() {
        val requiredPermissions = arrayOf(
            Manifest.permission.ACCESS_FINE_LOCATION,
            Manifest.permission.ACCESS_COARSE_LOCATION,
            Manifest.permission.ACCESS_BACKGROUND_LOCATION
        )

        val missingPermissions = requiredPermissions.filter {
            ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
        }.toTypedArray()

        if (missingPermissions.isNotEmpty()) {
            ActivityCompat.requestPermissions(
                this,
                missingPermissions,
                REQUEST_LOCATION_PERMISSION
            )
        } else {
            startLocationUpdatesService()
        }
    }

    // starts foreground service for location updates and binds the activity to the service
    private fun startLocationUpdatesService() {
        // Intent is a messaging object used to request an action from another app component, such as an Activity, Service, or BroadcastReceiver.
        // Intents are used to start activities, start services, or deliver broadcasts to various components within your app or even to other apps.
        val intent = Intent(this, LocationUpdatesService::class.java)
        ContextCompat.startForegroundService(this, intent)
        bindService(intent, serviceConnection, Context.BIND_AUTO_CREATE) // Context.BIND_AUTO_CREATE is a flag that specifies that the service should be created if it is not already running
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        Log.d("SPRAVA", "onRequestPermissionsResult called, requestCode: $requestCode")
        if (requestCode == REQUEST_LOCATION_PERMISSION) {
            if (grantResults.all { it == PackageManager.PERMISSION_GRANTED }) {
                AlertDialog.Builder(this)
                    .setTitle("Location Permission Granted")
                    .setMessage("All permisions are granted and locationUpdatesService is about to be started")
                    .show()
                startLocationUpdatesService()
            } else {
                AlertDialog.Builder(this)
                    .setTitle("Location Permission Required")
                    .setMessage("This app needs location permissions to send location updates.")
                    .setPositiveButton("Grant Permissions") { _, _ ->
                        requestLocationPermissions()
                    }
                    .setNegativeButton("Cancel") { _, _ ->
                        // Handle the case when the user doesn't want to grant permissions
                    }
                    .show()
            }
        }
    }

    override fun onStop() {
        super.onStop()
        if (isBound) {
            unbindService(serviceConnection)
            isBound = false
        }
    }
}

@Composable
fun Greeting(name: String, modifier: Modifier = Modifier) {
    Text(
            text = "ahoj, $name!",
            modifier = modifier
    )
}

@Preview(showBackground = true)
@Composable
fun GreetingPreview() {
    LocationAppAndroidTestTheme {
        Greeting("Android")
    }
}