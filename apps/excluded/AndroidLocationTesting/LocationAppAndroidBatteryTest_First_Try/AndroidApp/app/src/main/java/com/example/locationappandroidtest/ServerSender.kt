package com.example.locationappandroidtest

import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.location.Location
import android.os.BatteryManager
import android.util.Log
import android.widget.Toast
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONObject
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import okhttp3.Response

import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.os.Build
import org.json.JSONException
import java.time.Instant
import java.time.LocalDateTime
import java.time.ZoneId

class ServerSender(private val context: Context) {
    val client = OkHttpClient()

    companion object {
//        private const val url = "http://192.168.0.110:8080/testingAndroidLocationBattery/api"
        private const val url = "http://192.168.137.1:80/testingAndroidLocationBattery/api"
    }

    fun createNewTest(
        testName: String,
        numberOfSecondsBetweenLocationUpdates: Long,
        deviceName: String,
        successCallback: (testId: Int) -> Unit,
        errorCallBack: (errorMessage: String) -> Unit
    ) {

        if (!isNetworkAvailable()) {
            errorCallBack("Not connected to the internet")
            return
        }

        val jsonData = JSONObject().apply {
            put("testName", testName)
            put("numOfSecsBetweenLocationUpdates", numberOfSecondsBetweenLocationUpdates)
            put("deviceType", deviceName)
        }

        CoroutineScope(Dispatchers.IO).launch {
            try {
                Log.d("SPRAVA_SERVER", "Creating new test.")
                val request = Request.Builder()
                    .url("${url}/createNewTest.php")
                    .post(jsonData.toString().toRequestBody("application/json".toMediaType()))
                    .build()

                client.newCall(request).execute().use { response: Response ->
                    if (response.isSuccessful) {
                        val responseBodyString = response.body?.string() ?: ""
                        try {
                            val jsonResponse = JSONObject(responseBodyString)
                            Log.d("SPRAVA_SERVER", "Data received from server (CREATE_TEST): $jsonResponse")
                            successCallback(jsonResponse.getInt("testId"))
                            // Access JSON data using keys, e.g., jsonResponse.getString("key")
                        } catch (e: JSONException) {
                            Log.e("SPRAVA_SERVER", "Error parsing JSON response", e)
                        }


                    }
                    else {
                        val responseBodyString = response.body?.string() ?: ""
                        Log.d("SPRAVA_SERVER", "Data not sent, ${responseBodyString}")
                    }
                }
            }  catch (e: Exception) {
                Log.e("SPRAVA_SERVER", "Error sending data to server", e)
                Log.e("SPRAVA_SERVER", e.toString())
            }
        }
    }
    fun sendLocation(location: Location, batteryLevel: Int, testId : String?) {
        val currentInstant = Instant.now()
        val currentZone = ZoneId.systemDefault()
        val currentLocalDateTime = LocalDateTime.ofInstant(currentInstant, currentZone)

        val locationJson = JSONObject().apply {
            put("latitude", location.latitude)
            put("longitude", location.longitude)
            put("speed", location.speed) // meters/second
            put("time", currentLocalDateTime)
            put("batteryLevel", batteryLevel)
            put("wifi", 1)
            put("testId", testId)
        }

        // Send the JSON data to the server
        sendToServer(locationJson, "/updateLocation.php")
    }

    private fun sendToServer(jsonData: JSONObject, endPoint: String) {

        CoroutineScope(Dispatchers.IO).launch {
            try {
                if (!isNetworkAvailable()) {
                    NotificationHelper.updateNotification(
                        context,
                        LocationUpdatesService.NOTIFICATION_ID_FOR_LOCATION,
                        LocationUpdatesService.CHANNEL_ID,
                        "Location Updates - NO INTERNET",
                        "No connection to the internet!"
                    )
                }
                Log.d("SPRAVA_SERVER", "Sending data to server: $jsonData, url $url$endPoint")
                val request = Request.Builder()
                    .url("${url}${endPoint}")
                    .post(jsonData.toString().toRequestBody("application/json".toMediaType()))
                    .build()

                client.newCall(request).execute().use { response: Response ->
                    if (response.isSuccessful) {
                        Log.d("SPRAVA_SERVER", "Data received from server: $response")
                    }
                    else {
                        val responseBodyString = response.body?.string() ?: ""
                        Log.d("SPRAVA_SERVER", "Data not sent, ${responseBodyString}")
                    }
                }
            }  catch (e: Exception) {
                Log.e("SPRAVA_SERVER", "Error sending data to server", e)
                Log.e("SPRAVA_SERVER", e.toString())
            }
        }
    }

    private fun isNetworkAvailable(): Boolean {
        val connectivityManager =
            context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) { // this doesn't need to be here ( but I will lower the minimum sdk probably
            val capabilities =
                connectivityManager.getNetworkCapabilities(connectivityManager.activeNetwork)
            return capabilities != null && (capabilities.hasTransport(NetworkCapabilities.TRANSPORT_WIFI)
                    || capabilities.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR)
                    || capabilities.hasTransport(NetworkCapabilities.TRANSPORT_ETHERNET))
        } else {
            val activeNetworkInfo = connectivityManager.activeNetworkInfo
            return activeNetworkInfo != null && activeNetworkInfo.isConnected
        }
    }
}

// *
// The kotlinx.serialization library, including the @Serializable annotation, works through a combination
// of code generation and reflection. However, it primarily relies on code generation to provide
// efficient serialization and deserialization of data classes.
// How it works under the hood:
//
// Code Generation:
// When you annotate a data class with the @Serializable annotation, the Kotlin compiler plugin
// generates serialization and deserialization code for that class at compile time.
// This code generation is based on the class properties, their types, and any custom serializers
// specified for those types.
//
// The generated code includes the implementation of the KSerializer interface for the annotated
// data class. This implementation is responsible for the actual serialization and deserialization
// process. Since the code is generated at compile time, it eliminates the need for runtime
// reflection, which is generally slower and less efficient.
//
// Reflection (Limited):
// kotlinx.serialization uses reflection in a limited capacity to discover serializers for
// user-defined types. When you serialize or deserialize an object, the library needs to find the
// corresponding serializer for the object's class. It uses reflection to locate and instantiate
// the auto-generated serializers for the classes annotated with @Serializable. However, this
// reflection is limited to serializer discovery and does not affect the actual serialization
// and deserialization process, which is handled by the generated code.
//
