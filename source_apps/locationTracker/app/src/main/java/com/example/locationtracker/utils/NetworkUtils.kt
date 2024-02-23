package com.example.locationtracker.utils

import android.content.Context
import android.net.wifi.WifiManager

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