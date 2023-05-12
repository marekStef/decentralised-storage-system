package com.example.locationappandroidtest

import android.Manifest // This will allow you to reference the location permissions using the Manifest.permission constants in your code, such as Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION, and Manifest.permission.ACCESS_BACKGROUND_LOCATION.
import android.app.AlertDialog
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.BroadcastReceiver
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.ServiceConnection
import android.content.SharedPreferences
import android.content.pm.PackageManager
import android.location.Location
import android.os.Bundle
import android.os.IBinder
import android.util.Log
import android.widget.Toast
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
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.Button
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.TextField
import androidx.compose.runtime.mutableStateOf
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.TextFieldValue
import androidx.compose.ui.unit.dp

// for number picker
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.localbroadcastmanager.content.LocalBroadcastManager
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class AppData(private val context: Context) {

    val currentTestName = mutableStateOf(TextFieldValue())
    fun setCurrentTestName(testName: TextFieldValue) {
        currentTestName.value = testName
        saveSharedPreferences("currentTestName", testName.text)
    }

    var selectedNumberOfSecondsBetweenLocationUpdates = mutableStateOf(TextFieldValue())
    fun setSelectedNumberOfSecondsBetweenLocationUpdates(numOfSecs: TextFieldValue) {
        selectedNumberOfSecondsBetweenLocationUpdates.value = numOfSecs
        saveSharedPreferences("selectedNumberOfSecondsBetweenLocationUpdates", if (numOfSecs.text.length == 0) 0 else numOfSecs.text.toLong())
    }

    val currentTestId = mutableStateOf<Int>(-1)
    fun setCurrentTestId(newTestId: Int) {
        currentTestId.value = newTestId
        saveSharedPreferences("currentTestId", newTestId)
    }
    val startTestClicked = mutableStateOf(false)
    fun toggleStartTestClicked(clickedForStart: Boolean) {
        startTestClicked.value = clickedForStart
        saveSharedPreferences("startTestClicked", clickedForStart)
    }

    val lastLocation = mutableStateOf<String?>(null)
    val lastUpdatedTime = mutableStateOf<String?>("")

    fun updateLocation(latitude: Double, longitude: Double) {
        val dateFormat =
            android.icu.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault())
        val currentTime = dateFormat.format(Date())
        lastUpdatedTime.value = "Last updated: $currentTime"
        lastLocation.value = "latitude: ${latitude}, Longitude: ${longitude}"
    }

    // region persistent storage for test data

    // for persistent storage so that when the app is closed and foreground services are running,
    // data here about the test are not lost

    fun saveSharedPreferences(key: String, value: Any) {
        val sharedPreferences = context.getSharedPreferences("com.example.LocationAppAndroidTest.MY_APP_STATE_PREFS", Context.MODE_PRIVATE)
        val editor = sharedPreferences.edit()

        when (value) {
            is String -> editor.putString(key, value)
            is Int -> editor.putInt(key, value)
            is Long -> editor.putLong(key, value)
            is Boolean -> editor.putBoolean(key, value)
            else -> throw IllegalArgumentException("Unsupported value type")
        }

        editor.apply()
    }

    fun loadSharedPreferences() {
        val sharedPreferences = context.getSharedPreferences("com.example.LocationAppAndroidTest.MY_APP_STATE_PREFS", Context.MODE_PRIVATE)

        startTestClicked.value = sharedPreferences.getBoolean("startTestClicked", false)
        currentTestName.value = TextFieldValue(sharedPreferences.getString("currentTestName", "") ?: "")
        selectedNumberOfSecondsBetweenLocationUpdates.value = TextFieldValue(sharedPreferences.getLong("selectedNumberOfSecondsBetweenLocationUpdates", 0).toString())
        currentTestId.value = sharedPreferences.getInt("currentTestId", -1)
    }
    //endregion

    // region About shared preferences on android:
    //
    // SharedPreferences is an Android framework feature that allows us to store small amounts of
    // primitive data (like booleans, strings, integers, longs, and floats) as key-value pairs
    // in a file on the device. It's intended for use with simple, non-sensitive data that needs
    // to persist across app launches, such as user preferences or the state of the app.
    //
    // Some common use cases for SharedPreferences include:
    //
    // - Saving user preferences:
    //   SharedPreferences can be used to store and retrieve user preferences, such as theme
    //   settings or notification preferences.
    //
    // - Storing app state:
    //   SharedPreferences can be used to save the state of app when it's not running,
    //   such as the last opened screen, a game's high score, or the state of a toggle button.
    //
    // - Caching data:
    //   SharedPreferences can be used as a lightweight cache for small amounts of data that need
    //   to persist across app launches. For example, SharedPreferences may be used to cache user
    //   profile data fetched from a server, so the data doesn't need to be fetched every time
    //   the app is opened.
    //
    // SharedPreferences is not suitable for large amounts of data or sensitive information.
    // For larger datasets, you should consider using databases (like SQLite or Room) or other
    // storage options like files.
    //
    // For sensitive data, secure storage options should be used, like Android's EncryptedSharedPreferences
    // or the Android Keystore System.
    //
    // SharedPreferences is also not designed for concurrent read/write operations.
    // Rather consider using a database or other storage options that offer better concurrency control.

    // endregion
}

class MainActivity : ComponentActivity() {
    private val serverSender = ServerSender(this)

    private val REQUEST_LOCATION_PERMISSION = 1001

    companion object {
        public val CHANNEL_ID = "LocationUpdatesChannel"
    }

    private val appData = AppData(this)

    private val locationUpdateReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            val latitude = intent?.getDoubleExtra("latitude", 0.0) ?: 0.0
            val longitude = intent?.getDoubleExtra("longitude", 0.0) ?: 0.0
            appData.updateLocation(latitude, longitude)
        }
    }

    @OptIn(ExperimentalMaterial3Api::class)
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // load sharedPreferences to load saved values
        appData.loadSharedPreferences()

        // Listening to change of location from the foreground service
        LocalBroadcastManager.getInstance(this).registerReceiver(
            locationUpdateReceiver,
            IntentFilter("location_update")
        )

        setContent {
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
                        Text(
                            "Test of battery for sending foreground location to server",
                            style = MaterialTheme.typography.headlineSmall.copy(fontWeight = FontWeight.Bold),
                            modifier = Modifier.padding(0.dp, 0.dp, 0.dp, 20.dp),
                            textAlign = TextAlign.Center
                        )

                        Text("Current testId: ${if (appData.currentTestId.value == -1) "No test running at the moment" else appData.currentTestId.value}")

                        // Add a text input
                        TextField(
                            value = appData.currentTestName.value,
                            onValueChange = { appData.setCurrentTestName(it) },
                            label = { Text("Enter name of new test") },
                            singleLine = true,
                            enabled = !appData.startTestClicked.value
                        )

                        // Add a button
                        Button(onClick = {
                            val deviceName: String = "${android.os.Build.MANUFACTURER} ${android.os.Build.MODEL}"
                            Log.d("SPRAVA", appData.currentTestName.value.text.toString())
                            if (appData.currentTestName.value.text.length == 0) {
                                Toast.makeText(applicationContext, "Test name cannot be empty.", Toast.LENGTH_LONG).show()
                                return@Button
                            }

                            if (appData.selectedNumberOfSecondsBetweenLocationUpdates.value.text.length == 0) {
                                Toast.makeText(applicationContext, "Number of seconds between location updates cannot be empty.", Toast.LENGTH_LONG).show()
                                return@Button
                            } else if (appData.selectedNumberOfSecondsBetweenLocationUpdates.value.text.toLong() <= 0) {
                                Toast.makeText(applicationContext, "Number of seconds must be more than 0.", Toast.LENGTH_LONG).show()
                                return@Button
                            }

                            serverSender.createNewTest(
                                appData.currentTestName.value.text,
                                appData.selectedNumberOfSecondsBetweenLocationUpdates.value.text.toLong(),
                                deviceName,
                                successCallback = { testId ->
                                    appData.setCurrentTestId(testId)

                                    appData.toggleStartTestClicked(true)
                                    startMyCustomForegroundService()
                                    startLocationForegroundService()


                                    runOnUiThread {
                                        Toast.makeText(applicationContext, "Test created with ID: $testId", Toast.LENGTH_LONG).show()
                                    }
                                },
                                errorCallBack = { errorMessage ->
                                    // Handle error here, e.g., show a toast or update the UI
                                    runOnUiThread {
                                        Toast.makeText(applicationContext, "Error: $errorMessage. No foreground service started.", Toast.LENGTH_LONG).show()
                                    }
                                })
                        }, enabled = !appData.startTestClicked.value) {
                            Text("Start new test")
                        }

                        // Add a button
                        Button(onClick = {
                            appData.toggleStartTestClicked(false)
                            stopMyCustomForegroundService()
                            stopLocationForegroundService()
                        }, enabled = appData.startTestClicked.value) {
                            Text("End current test")
                        }

                        // region numberOfSecondsBetween location updates
                        Column(
                            modifier = Modifier.fillMaxWidth(),
//                            horizontalAlignment = Alignment.CenterHorizontally,
                        ) {
                            Text(
                                text = "Num of seconds between location updates ",
                                style = MaterialTheme.typography.labelLarge.copy(fontWeight = FontWeight.Bold),
                                textAlign = TextAlign.Center
                            )

                            TextField(
                                value = appData.selectedNumberOfSecondsBetweenLocationUpdates.value,
                                onValueChange = { appData.setSelectedNumberOfSecondsBetweenLocationUpdates(it) },
                                label = { Text("Enter a number") },
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                                singleLine = true,
                                enabled = !appData.startTestClicked.value
                            )
                        }
                        // endregion

                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(2.dp)
                                .background(Color.Gray)
                                .padding(20.dp)
                        )

                        // region location updates
                        if (appData.lastLocation.value == null) {
                            Text("Location not available")
                        } else {
                            Text(appData.lastLocation.value!!)
                            Text(appData.lastUpdatedTime.value!!)
                        }
                        // endregion
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
        Log.d("SPRAVA", "MainActivity - startLocationForegroundServiceInternal - testID: ${appData.currentTestId.value}")
        intent.putExtra("testId", appData.currentTestId.value.toString())
        intent.putExtra("numberOfSecondsBetweenLocationUpdates", appData.selectedNumberOfSecondsBetweenLocationUpdates.value.text.toLong())
        startForegroundService(intent)
    }

    fun stopLocationForegroundService() {
        val intent = Intent(this, LocationUpdatesService::class.java)
        stopService(intent)
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

    override fun onDestroy() {
        super.onDestroy()
        LocalBroadcastManager.getInstance(this).unregisterReceiver(locationUpdateReceiver)
    }

    override fun onStop() {
        super.onStop()
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