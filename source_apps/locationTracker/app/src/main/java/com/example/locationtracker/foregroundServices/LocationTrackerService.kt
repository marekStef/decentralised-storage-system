package com.example.locationtracker.foregroundServices

import android.app.Service
import android.content.Intent
import android.os.IBinder
import androidx.core.app.NotificationCompat
import com.example.locationtracker.R
import com.example.locationtracker.constants.Constants.NOTIFICATION_CHANNEL_ID
import com.example.locationtracker.constants.Constants.NOTIFICATION_ID
import com.example.locationtracker.data.PreferencesManager

class LocationTrackerService: Service() {
    enum class Actions {
        START, STOP
    }
    override fun onBind(intent: Intent?): IBinder? {
        return null
    }

    private fun sendServiceStatusBroadcast(isRunning: Boolean) {
        val intent = Intent("SERVICE_STATUS_ACTION")
        intent.putExtra("isRunning", isRunning)
        sendBroadcast(intent)
    }

    override fun onCreate() {
        super.onCreate()
        PreferencesManager(this).setIsLocationTrackerServiceRunning(true)
        sendServiceStatusBroadcast(true)
    }
    override fun onDestroy() {
        super.onDestroy()
        PreferencesManager(this).setIsLocationTrackerServiceRunning(false)
        sendServiceStatusBroadcast(false)
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when(intent?.action) {
            Actions.START.toString() -> start()
            Actions.STOP.toString() -> stopSelf()
        }
        return super.onStartCommand(intent, flags, startId)
    }

    private fun start() {
        val notification = NotificationCompat.Builder(this, NOTIFICATION_CHANNEL_ID)
            .setSmallIcon(R.mipmap.ic_launcher_round)
            .setContentTitle("Location Gathering Active")
            .setContentText("Elapsed time: 00:50")
            .build()

        startForeground(NOTIFICATION_ID, notification)
    }
}