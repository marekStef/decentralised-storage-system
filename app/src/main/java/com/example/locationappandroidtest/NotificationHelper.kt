package com.example.locationappandroidtest

import android.app.Notification
import android.app.NotificationManager
import android.content.Context
import androidx.core.app.NotificationCompat

object NotificationHelper {

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