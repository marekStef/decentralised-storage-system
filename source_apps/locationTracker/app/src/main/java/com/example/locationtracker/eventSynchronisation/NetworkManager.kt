package com.example.locationtracker.eventSynchronisation

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.net.ConnectivityManager
import android.net.Network
import android.net.NetworkCapabilities
import android.net.NetworkRequest
import android.net.wifi.SupplicantState
import android.net.wifi.WifiInfo
import android.net.wifi.WifiManager
import android.os.Build
import android.util.Log
import androidx.core.content.ContextCompat
import androidx.core.content.ContextCompat.getSystemService
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import java.net.HttpURLConnection
import java.net.URL
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
    val wifiManager = context.applicationContext.getSystemService(Context.WIFI_SERVICE) as WifiManager
    val wifiInfo = wifiManager.connectionInfo
    if (wifiInfo.networkId != -1) {
        return wifiInfo.ssid.trim('"') // Remove quotation marks around the SSID
    }
    return null
}

suspend fun isDataStorageServerReachable(ipAddress: String, port: String): Boolean = withContext(
    Dispatchers.IO) {
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
        Log.e("AAAAAA", "Error checking data storage server reachability", e)
        false
    }
}