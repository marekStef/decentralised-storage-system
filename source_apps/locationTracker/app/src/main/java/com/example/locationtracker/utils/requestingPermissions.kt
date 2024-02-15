package com.example.locationtracker.utils

import android.Manifest
import android.app.Activity
import android.os.Build
import androidx.core.app.ActivityCompat
import com.example.locationtracker.constants.Constants.REQUEST_CODE_FOR_POST_NOTIFICATIONS_PERMISSION

fun requestPostNotificationsPermission(activity: Activity) {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        ActivityCompat.requestPermissions(
            activity,
            arrayOf(Manifest.permission.POST_NOTIFICATIONS),
            REQUEST_CODE_FOR_POST_NOTIFICATIONS_PERMISSION
        )
    }
}