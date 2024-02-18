package com.example.locationtracker

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.util.Log
import com.example.locationtracker.constants.Notifications
import com.example.locationtracker.utils.isAppExemptFromBatteryOptimizations
import com.example.locationtracker.utils.requestDisableBatteryOptimization

class App: Application() {
    override fun onCreate() {
        super.onCreate()
//      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) { }
        val channelForLocationTrackerService = NotificationChannel(
            Notifications.NOTIFICATION_CHANNEL_ID_FOR_LOCATION_TRACKER_SERVICE,
            Notifications.NOTIFICATION_CHANNEL_NAME_FOR_LOCATION_TRACKER_SERVICE,
            NotificationManager.IMPORTANCE_DEFAULT
        ).apply {
            description = Notifications.NOTIFICATION_CHANNEL_DESCRIPTION_FOR_IMPORTANT_THINGS
        }

        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.createNotificationChannel(channelForLocationTrackerService)
    }
}