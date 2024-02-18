package com.example.locationtracker.utils

import android.Manifest
import android.annotation.SuppressLint
import android.app.Activity
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.PowerManager
import androidx.core.app.ActivityCompat
import android.net.Uri
import com.example.locationtracker.App

import com.example.locationtracker.constants.Notifications.REQUEST_CODE_FOR_POST_NOTIFICATIONS_PERMISSION_FOR_IMPORTANT_THINGS
import com.example.locationtracker.constants.Notifications.REQUEST_CODE_FOR_POST_NOTIFICATIONS_PERMISSION_FOR_LOCATION_TRACKER_SERVICE

fun requestPostNotificationsPermission(activity: Activity) {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        ActivityCompat.requestPermissions(
            activity,
            arrayOf(Manifest.permission.POST_NOTIFICATIONS),
            REQUEST_CODE_FOR_POST_NOTIFICATIONS_PERMISSION_FOR_LOCATION_TRACKER_SERVICE
        )

        ActivityCompat.requestPermissions(
            activity,
            arrayOf(Manifest.permission.POST_NOTIFICATIONS),
            REQUEST_CODE_FOR_POST_NOTIFICATIONS_PERMISSION_FOR_IMPORTANT_THINGS
        )
    }
}

fun isAppExemptFromBatteryOptimizations(context: Context): Boolean {
    val powerManager = context.getSystemService(Context.POWER_SERVICE) as PowerManager
    return powerManager.isIgnoringBatteryOptimizations(context.packageName)
}

@SuppressLint("BatteryLife")
fun requestDisableBatteryOptimization(activity: App) {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
        val intent = Intent(android.provider.Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS).apply {
            data = Uri.parse("package:${activity.packageName}")
        }
        activity.startActivity(intent)
    }
}

//
//private fun hasAllNecessaryLocationPermissions(activity: Activity): Boolean {
//    // Check for foreground location permission
//    val hasForegroundLocationPermission = ContextCompat.checkSelfPermission(
//        activity,
//        Manifest.permission.ACCESS_FINE_LOCATION
//    ) == PackageManager.PERMISSION_GRANTED
//
//    // Check for background location permission (if necessary)
//    val hasBackgroundLocationPermission = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
//        ContextCompat.checkSelfPermission(
//            activity,
//            Manifest.permission.ACCESS_BACKGROUND_LOCATION
//        ) == PackageManager.PERMISSION_GRANTED
//    } else {
//        true // Background permission not needed for API < Q
//    }
//
//    return hasForegroundLocationPermission && hasBackgroundLocationPermission
//}
//
//private fun requestPermission(activity: Activity, permissions: Array<String>, requestCode: Int) {
//    ActivityCompat.requestPermissions(activity, permissions, requestCode)
//}
//
//private fun shouldShowRequestPermissionRationale(activity: Activity, permission: String): Boolean {
//    return ActivityCompat.shouldShowRequestPermissionRationale(activity, permission)
//}
//
//private fun hasForegroundLocationPermission(activity: Activity): Boolean =
//    ContextCompat.checkSelfPermission(activity, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED
//
//private fun hasBackgroundLocationPermission(activity: Activity): Boolean =
//    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
//        ContextCompat.checkSelfPermission(activity, Manifest.permission.ACCESS_BACKGROUND_LOCATION) == PackageManager.PERMISSION_GRANTED
//    } else {
//        true // Background permission not needed for API < Q
//    }
//
//
//
//private fun requestNecessaryLocationPermissions(activity: Activity, onComplete: (Boolean) -> Unit) {
//    val REQUEST_LOCATION_PERMISSION_CODE = 101
//    val REQUEST_BACKGROUND_LOCATION_PERMISSION_CODE = 102
//
//    // Determine if we should show UI with rationale for requesting permissions
//    val shouldProvideRationaleForeground = shouldShowRequestPermissionRationale(activity, Manifest.permission.ACCESS_FINE_LOCATION)
//    val shouldProvideRationaleBackground = Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q &&
//            shouldShowRequestPermissionRationale(activity, Manifest.permission.ACCESS_BACKGROUND_LOCATION)
//
//    if (shouldProvideRationaleForeground) {
//        // Show rationale dialog for foreground location permission
//        showRationaleDialog(activity, "Location access is needed for core functionalities.", {
//            requestPermission(activity, arrayOf(Manifest.permission.ACCESS_FINE_LOCATION), REQUEST_LOCATION_PERMISSION_CODE)
//        })
//    } else if (shouldProvideRationaleBackground) {
//        // Show rationale dialog for background location permission
//        showRationaleDialog(activity, "Background location access is needed for background updates.", {
//            requestPermission(activity, arrayOf(Manifest.permission.ACCESS_BACKGROUND_LOCATION), REQUEST_BACKGROUND_LOCATION_PERMISSION_CODE)
//        })
//    } else {
//        // No rationale can or needs to be provided
//        if (!hasForegroundLocationPermission(activity) ||
//            (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q && !hasBackgroundLocationPermission(activity))) {
//            val permissionsToRequest = mutableListOf<String>().apply {
//                add(Manifest.permission.ACCESS_FINE_LOCATION)
//                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) add(Manifest.permission.ACCESS_BACKGROUND_LOCATION)
//            }.toTypedArray()
//
//            requestPermission(activity, permissionsToRequest, REQUEST_LOCATION_PERMISSION_CODE)
//        } else {
//            // User has denied the permission request and chosen "Don't ask again"
//            // Show a dialog that directs them to the app settings
//            showSettingsDialog(activity, "The app needs location permissions to function properly. Please enable them in the app settings.")
//        }
//    }
//}
//
//
//// Ensure to adjust your onRequestPermissionsResult to handle the callback logic and determine if all permissions have been granted.
//
//fun checkAndRequestLocationPermissions(activity: Activity, onComplete: (Boolean) -> Unit): Boolean {
//    if (hasAllNecessaryLocationPermissions(activity)) {
//        // All necessary permissions are already granted
//        return true
//    } else {
//        // Request necessary permissions
//        requestNecessaryLocationPermissions(activity, onComplete)
//        return false
//    }
//}
