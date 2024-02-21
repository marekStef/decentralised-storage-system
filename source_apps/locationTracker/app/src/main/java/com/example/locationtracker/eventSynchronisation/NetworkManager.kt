package com.example.locationtracker.eventSynchronisation

import android.content.Context
import android.net.wifi.WifiManager
import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONException
import org.json.JSONObject
import java.time.Instant
import java.time.format.DateTimeFormatter
import java.util.concurrent.TimeUnit


class NetworkManager {
}

//fun getCurrentSsid(context: Context): String? {
//    val wifiManager = context.applicationContext.getSystemService(Context.WIFI_SERVICE) as WifiManager
//    val wifiInfo = wifiManager.connectionInfo
//    return if (wifiInfo.networkId == -1) {
//        null // Not connected to an access point
//    } else {
//        wifiInfo.ssid.trim('"') // Remove quotation marks around the SSID
//    }
//}

//fun getCurrentSsid(context: Context): String? {
//    val connectivityManager = context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
//    var ssid: String? = null
//
//    val networkRequest = NetworkRequest.Builder()
//        .addTransportType(NetworkCapabilities.TRANSPORT_WIFI)
//        .build()
//
//    val networkCallback = object : ConnectivityManager.NetworkCallback(ConnectivityManager.NetworkCallback.FLAG_INCLUDE_LOCATION_INFO) {
//        override fun onAvailable(network: Network) {
//            Log.d("*************", "**************xxxxxxxxxxxxx***************")
//            super.onAvailable(network)
//            val networkCapabilities = connectivityManager.getNetworkCapabilities(network)
//            val wifiInfo = networkCapabilities?.transportInfo as? WifiInfo
//            if (wifiInfo?.networkId != -1) {
//                ssid = wifiInfo?.ssid
//                Log.d("*************", "**************xxxxxxxxxxxxx***************** ${ssid}")
//            }
//        }
//    }
//
//    connectivityManager.registerNetworkCallback(networkRequest, networkCallback)
//    return ssid
//}


fun getCurrentSsid(context: Context): String? {
    val wifiManager =
        context.applicationContext.getSystemService(Context.WIFI_SERVICE) as WifiManager
    val wifiInfo = wifiManager.connectionInfo
    if (wifiInfo.networkId != -1) {
        return wifiInfo.ssid.trim('"') // Remove quotation marks around the SSID
    }
    return null
}

suspend fun isDataStorageServerReachable(ipAddress: String, port: String): Boolean = withContext(
    Dispatchers.IO
) {
    Log.d("NETWORK", "http://$ipAddress:$port/status_info/checks/check_data_storage_presence")


    val client = OkHttpClient.Builder()
        .connectTimeout(5, TimeUnit.SECONDS)
        .readTimeout(5, TimeUnit.SECONDS)
        .build()

    val request = Request.Builder()
        .url("http://$ipAddress:$port/status_info/checks/check_data_storage_presence")
        .build()

    try {
        client.newCall(request).execute().use { response ->
            // Assuming the server responds with HTTP 200 on successful reachability
            response.isSuccessful
        }
    } catch (e: Exception) {
        Log.e("NETWORK", "Error checking data storage server reachability", e)
        false
    }
}

suspend fun associateAppWithDataStorageAppHolder(
    associationTokenId: String,
    nameDefinedByApp: String,
    url: String
): Result<String> = withContext(
    Dispatchers.IO
) {
    Log.d("NETWORK", url)

    val client = OkHttpClient()
    val mediaType = "application/json; charset=utf-8".toMediaType()
    val jsonObject = JSONObject().apply {
        put("associationTokenId", associationTokenId)
        put("nameDefinedByApp", nameDefinedByApp)
    }
    val requestBody = jsonObject.toString().toRequestBody(mediaType)

    val request = Request.Builder()
        .url(url)
        .post(requestBody)
        .build()

    return@withContext try {
        client.newCall(request).execute().use { response ->
            if (response.isSuccessful) {
                val responseBody = response.body?.string() ?: return@use Result.failure(
                    RuntimeException("Empty response body")
                )
                val jsonResponse = JSONObject(responseBody)
                val jwtToken =
                    jsonResponse.optString("jwtTokenForPermissionRequestsAndProfiles", "")
                if (jwtToken.isNotEmpty()) {
                    Result.success(jwtToken)
                } else {
                    Result.failure(RuntimeException("Token not found in response"))
                }
            } else {
                // Extracting error message from response
                val errorBody = response.body?.string()
                val errorMessage = if (errorBody != null) {
                    try {
                        val jsonObj = JSONObject(errorBody)
                        jsonObj.optString("message", "Unknown error occurred")
                    } catch (e: JSONException) {
                        "Error parsing error message"
                    }
                } else {
                    "Failed to associate app with storage app holder and no error message provided"
                }
                Result.failure(RuntimeException(errorMessage))
            }
        }
    } catch (e: Exception) {
        Log.d("NETWORK", "associateAppWithStorageAppHolder: ", e)
        Result.failure(e)
    }
}

suspend fun registerNewProfileToDataStorage(
    ip: String,
    port: String,
    jwtTokenForPermissionRequestsAndProfiles: String,
    profileName: String,
    schema: String
): Result<String> = withContext(Dispatchers.IO) {
    val url: String = "http://${ip}:${port}/app/api/register_new_profile"
    Log.d("NETWORK", url)

    val currentTimestamp = DateTimeFormatter.ISO_INSTANT.format(Instant.now())

    val metadata: JSONObject = JSONObject().apply {
        put("createdDate", currentTimestamp)
        put("profile", "core:profile-registration_v1")
    }

    val client = OkHttpClient()
    val mediaType = "application/json; charset=utf-8".toMediaType()
    val jsonObject = JSONObject().apply {
        put("jwtTokenForPermissionRequestsAndProfiles", jwtTokenForPermissionRequestsAndProfiles)
        put("name", profileName)
        put("metadata", metadata)
        put("schema", schema)
    }
    val requestBody = jsonObject.toString().toRequestBody(mediaType)

    val request = Request.Builder()
        .url(url)
        .post(requestBody)
        .build()

    return@withContext try {
        client.newCall(request).execute().use { response ->
            if (response.isSuccessful) {
                val responseBody = response.body?.string() ?: return@use Result.failure(
                    RuntimeException("Empty response body")
                )
                // todo - parse response data
                Result.success(responseBody)
            } else {
                val errorBody = response.body?.string()
                val errorMessage = if (errorBody != null) {
                    try {
                        val jsonObj = JSONObject(errorBody)
                        jsonObj.optString("message", "Unknown error occurred")
                    } catch (e: JSONException) {
                        "Error parsing error message"
                    }
                } else {
                    "Failed to post to server and no error message provided"
                }
                Result.failure(RuntimeException(errorMessage))
            }
        }
    } catch (e: Exception) {
        Log.d("NETWORK", "postToServer: ", e)
        Result.failure(e)
    }
}