package com.example.locationappandroidtest

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.os.Build
import androidx.core.app.NotificationCompat

object NotificationHelper {
//    fun createNotificationChannel(context: Context, channelId: String, channelName: String, channelDescription: String) {
//        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
//            val importance = NotificationManager.IMPORTANCE_DEFAULT
//            val channel = NotificationChannel(channelId, channelName, importance).apply {
//                description = channelDescription
//            }
//            val notificationManager: NotificationManager =
//                context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
//
//            notificationManager.createNotificationChannel(channel)
//        }
//    }

    // The createNotificationChannel() function creates a notification channel for the app.
    // A NotificationChannel is a construct introduced in Android 8.0 (API level 26) that allows to group notifications into channels.
    // Each channel represents a type of notification that the app can send, and each channel can have different settings,
    // such as the importance level, sound, vibration, and light settings.
    //
    //The CHANNEL_ID is a unique identifier for the notification channel.
    // ID needs to be provided when creating the notification channel and when creating the notification itself.
    // This ID helps the system to determine which channel the notification belongs to,
    // and it allows users to modify the settings of that channel individually in the system settings.
    //
    //The reason the app crashes without the createNotificationChannel() function is that,
    // starting from Android 8.0, you must create a notification channel before posting any notifications.
    // If I don't create a notification channel and try to post a notification, the system will throw an exception, causing your app to crash.
    //The importance level (IMPORTANCE_LOW) determines how the system should display notifications for this channel.
    // In this case, the notifications will be shown without making a sound, and they won't appear on the lock screen.
//    private fun createNotificationChannel() {
//        val name = "Location Updates"
//        val descriptionText = "Sending location updates to server"
//        val importance = NotificationManager.IMPORTANCE_LOW
//        val channel = NotificationChannel(CHANNEL_ID, name, importance).apply {
//            description = descriptionText
//        }
//
//        // Context.NOTIFICATION_SERVICE is a constant string that represents the system-level
//        // service name for the NotificationManager.
//        // It is used to retrieve an instance of the NotificationManager from the system.
//        val notificationManager: NotificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
//        notificationManager.createNotificationChannel(channel)
//    }

    fun updateNotification(
        context: Context,
        notificationID: Int,
        channelID: String,
        title: String,
        contentText: String
    ) {
        val notification = NotificationCompat.Builder(context, channelID)
            .setContentTitle(title)
            .setContentText(contentText)
            .setSmallIcon(R.drawable.ic_notification)
            .build()

        val notificationManager =
            context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.notify(notificationID, notification)
    }
}