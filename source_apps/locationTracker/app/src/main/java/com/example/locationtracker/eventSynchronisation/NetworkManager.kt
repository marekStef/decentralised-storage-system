package com.example.locationtracker.eventSynchronisation

import android.content.Context
import android.net.wifi.WifiManager
import android.util.Log
import com.example.locationtracker.constants.DataStorageRelated.UNIQUE_LOCATION_PROFILE_NAME
import com.example.locationtracker.data.database.entities.Location
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
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

suspend fun isDataStorageServerReachable(ipAddress: String, port: String): Boolean = withContext(
    Dispatchers.IO
) {
    Log.d("NETWORK", "http://$ipAddress:$port/status_info/checks/check_auth_service_presence")


    val client = OkHttpClient.Builder()
        .connectTimeout(5, TimeUnit.SECONDS)
        .readTimeout(5, TimeUnit.SECONDS)
        .build()

    val request = Request.Builder()
        .url("http://$ipAddress:$port/status_info/checks/check_auth_service_presence")
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
    schema: String
): Result<String> = withContext(Dispatchers.IO) {
    val url: String = "http://${ip}:${port}/app/api/registerNewProfile"
    Log.d("NETWORK", url)

    val currentTimestamp = DateTimeFormatter.ISO_INSTANT.format(Instant.now())

    val metadata: JSONObject = JSONObject().apply {
        put("createdDate", currentTimestamp)
        put("profile", "core:profile-registration_v1")
    }

    val payload = JSONObject(schema) // convert the schema string to a JSONObject (this has been added as api had been changed)

    val client = OkHttpClient()
    val mediaType = "application/json; charset=utf-8".toMediaType()
    val jsonObject = JSONObject().apply {
        put("jwtTokenForPermissionRequestsAndProfiles", jwtTokenForPermissionRequestsAndProfiles)
        put("metadata", metadata)
        put("payload", payload)
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

// returns generated access token in case of success, error message otherwise
suspend fun sendPermissionRequestToServer(
    ip: String,
    port: String,
    jwtTokenForPermissionRequestsAndProfiles: String
): Result<String> = withContext(Dispatchers.IO) {
    val url: String = "http://${ip}:${port}/app/api/requestNewPermission"
    val client = OkHttpClient()
    val mediaType = "application/json; charset=utf-8".toMediaType()
    val permissionRequest = JSONObject().apply {
        put("profile", UNIQUE_LOCATION_PROFILE_NAME)
        put("read", true)
        put("create", true)
        put("modify", true)
        put("delete", true)
    }
    val jsonObject = JSONObject().apply {
        put("jwtTokenForPermissionRequestsAndProfiles", jwtTokenForPermissionRequestsAndProfiles)
        put("permissionsRequest", permissionRequest)
    }
    val requestBody = jsonObject.toString().toRequestBody(mediaType)

    val request = Request.Builder()
        .url(url)
        .post(requestBody)
        .build()

    return@withContext try {
        client.newCall(request).execute().use { response ->
            if (response.isSuccessful && response.code == 201) {
                val responseBody = response.body?.string() ?: return@use Result.failure(
                    RuntimeException("Empty response body")
                )
                val jsonResponse = JSONObject(responseBody)
//                val message = jsonResponse.optString("message", "No message in response")
                val generatedAccessToken = jsonResponse.optString("generatedAccessToken", "")
                Result.success(generatedAccessToken)
            } else {
                val errorBody = response.body?.string()
                val errorMessage = if (errorBody != null) {
                    try {
                        val jsonObj = JSONObject(errorBody)
                        jsonObj.optString("message", "Unknown error occurred")
                    } catch (e: Exception) {
                        "Error parsing error message"
                    }
                } else {
                    "Failed to post to server and no error message provided"
                }
                Result.failure(RuntimeException(errorMessage))
            }
        }
    } catch (e: Exception) {
        Result.failure(e)
    }
}

suspend fun checkAccessTokenStatus(ip: String, port: String, accessToken: String): Boolean = withContext(Dispatchers.IO) {
    val url = "http://$ip:$port/app/api/checkAccessTokenStatus?accessToken=$accessToken"
    Log.d("NETWORK", "Checking access token status: $url")

    val client = OkHttpClient.Builder()
        .connectTimeout(5, TimeUnit.SECONDS)
        .readTimeout(5, TimeUnit.SECONDS)
        .build()

    val request = Request.Builder()
        .url(url)
        .build()

    try {
        client.newCall(request).execute().use { response ->
            if (response.isSuccessful) {
                response.body?.string()?.let { responseBody ->
                    val isActive = JSONObject(responseBody).getBoolean("isActive")
                    Log.d("NETWORK", "Access token status: $isActive")
                    return@withContext isActive
                } ?: run {
                    Log.e("NETWORK", "Error parsing response body")
                    false
                }
            } else {
                Log.e("NETWORK", "Error fetching access token status: ${response.code}")
                false
            }
        }
    } catch (e: Exception) {
        Log.e("NETWORK", "Error checking access token status", e)
        false
    }
}

// returns bool whether syncing was successfull
suspend fun sendLocationsToServer(ip: String, port: String, locations: List<Location>): Boolean {
    Log.d("SENDING_LOCATIONS", "locationsc count: ${locations.size}")
    Log.d("SENDING_LOCATIONS", "first event id: ${locations[0].id.toString()}, last event id: ${locations[locations.size - 1].id.toString()}")
    // TODO: Implement the API call to sync locations
    delay(4000)

    return true
}