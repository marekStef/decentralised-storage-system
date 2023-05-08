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

class ServerSender(private val context: Context) {
    val client = OkHttpClient()

    fun sendLocation(location: Location, batteryLevel: Int) {
        val locationJson = JSONObject().apply {
            put("latitude", location.latitude)
            put("longitude", location.longitude)
            put("speed", location.speed) // meters/second
            put("time", location.time)
            put("batteryLevel", batteryLevel)
        }

        // Send the JSON data to the server
        sendToServer(locationJson)
    }

    private fun sendToServer(jsonData: JSONObject) {

        CoroutineScope(Dispatchers.IO).launch {
            try {
                if (!isNetworkAvailable()) {
                    NotificationHelper.updateNotification(
                        context,
                        MainActivity.NOTIFICATION_ID_FOR_LOCATION,
                        MainActivity.CHANNEL_ID,
                        "Location Updates - NO INTERNET",
                        "No connection to the internet!"
                    )
                }
                Log.d("SPRAVA_SERVER", "Sending data to server: $jsonData")
                val request = Request.Builder()
                    .url("https://your-server-url/location")
                    .post(jsonData.toString().toRequestBody("application/json".toMediaType()))
                    .build()

                client.newCall(request).execute().use { response: Response ->
                    if (!response.isSuccessful) {
                        Log.d("SPRAVA_SERVER", "Data not sent")
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



