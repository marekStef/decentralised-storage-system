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

    private val currentTestId = mutableStateOf(TextFieldValue())

    companion object {
        public const val CHANNEL_ID = "LocationUpdatesChannel"
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
                        TextField(
                            value = currentTestId.value,
                            onValueChange = { currentTestId.value = it },
                            label = { Text("Enter name of new test") },
                            singleLine = true,
                            enabled = !startTestClicked.value
                        )

                        // Add a button
                        Button(onClick = {
                            startTestClicked.value = true
                            startMyCustomForegroundService()
                            startLocationForegroundService()
                        }, enabled = !startTestClicked.value) {
                            Text("Start sending location")
                        }

                        // Add a button
                        Button(onClick = {
                            startTestClicked.value = false
                            stopMyCustomForegroundService()
                            stopLocationForegroundService()
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
    }

    // region myCustomForegroundService
    fun startMyCustomForegroundService() {
        val customForegroundServiceIntent = Intent(this, CustomForegroundService::class.java)
        startService(customForegroundServiceIntent)
    }

    fun stopMyCustomForegroundService() {
        val customForegroundServiceIntent = Intent(this, CustomForegroundService::class.java)
        stopService(customForegroundServiceIntent)
    }
    // endregion

    // region Location Foreground Service
    // starts foreground service for location updates and binds the activity to the service
    fun startLocationForegroundService() {
        // starting location foreground service
        requestLocationPermissions()
    }

    fun startLocationForegroundServiceInternal()
    {
        // Intent is a messaging object used to request an action from another app component, such as an Activity, Service, or BroadcastReceiver.
        // Intents are used to start activities, start services, or deliver broadcasts to various components within your app or even to other apps.
        val intent = Intent(this, LocationUpdatesService::class.java)
        intent.putExtra("testId", currentTestId.value.toString())
        startForegroundService(intent)
        bindService(intent, serviceConnection, Context.BIND_AUTO_CREATE) // Context.BIND_AUTO_CREATE is a flag that specifies that the service should be created if it is not already running
    }

    fun stopLocationForegroundService() {
        if (isBound) {
            locationUpdatesService.stopService()
            unbindService(serviceConnection)
            isBound = false
        }
    }
    // endregion

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
            // all permissions were granted!
            startLocationForegroundServiceInternal()
        }
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
                startLocationForegroundServiceInternal()
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