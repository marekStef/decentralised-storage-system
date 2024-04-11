package com.example.locationtracker.utils

import android.app.NotificationManager
import android.content.Context
import androidx.core.app.NotificationCompat
import com.example.locationtracker.R

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
        .setSmallIcon(R.mipmap.ic_launcher_round)
        .build()

    val notificationManager =
        context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    notificationManager.notify(notificationID, notification)
}