package com.example.locationappandroidtest

import android.Manifest
import android.app.Notification
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Binder
import android.os.Handler
import android.os.HandlerThread
import android.os.IBinder
import android.os.Process
import android.util.Log
import androidx.core.app.ActivityCompat
import androidx.core.app.NotificationCompat
import com.example.locationappandroidtest.MainActivity.Companion.CHANNEL_ID
import com.example.locationappandroidtest.NotificationHelper.updateNotification
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class CustomForegroundService : Service() {
    companion object {
        public const val NOTIFICATION_ID_FOR_MY_CUSTOM_FOREGROUND_SERVICE = 124
    }

    private val serverSender = ServerSender(this)
    private val updateIntervalMillis: Long = 5000 // The update interval in milliseconds

    // HandlerThread is a class in Android to create a thread that has its own message queue,
    // and that is designed to be used with a Handler.
    // A HandlerThread can be used to perform long-running operations in the background without blocking the UI thread.
    private lateinit var handlerThread: HandlerThread
    // The handler object is a Handler that is associated with this thread,
    // allowing to post Runnable objects or Message objects to the thread's message queue.
    private lateinit var handler: Handler

    private val binder = CustomForegroundServiceBinder()

    override fun onBind(intent: Intent?): IBinder? {
        return binder
    }
    inner class CustomForegroundServiceBinder : Binder() {
        fun getService(): CustomForegroundService = this@CustomForegroundService
    }

    private val periodicTask = object : Runnable {
        override fun run() {
            Log.d("SPRAVA", "Periodic task run")
            val lastUpdateTime = SimpleDateFormat("hh:mm:ss a", Locale.getDefault()).format(Date())
            updateNotification(
                applicationContext,
                NOTIFICATION_ID_FOR_MY_CUSTOM_FOREGROUND_SERVICE,
                CHANNEL_ID,
                "Custom foreground service",
                "Not doing much at the moment (Last update sent: $lastUpdateTime)"
            )

            // Post the Runnable again with a delay
            handler.postDelayed(this, updateIntervalMillis)
        }
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        startForegroundNotification()
        handlerThread = HandlerThread("HandlerThread", Process.THREAD_PRIORITY_BACKGROUND)
        handlerThread.start()
        handler = Handler(handlerThread.looper)
        handler.post(periodicTask)

        return START_STICKY
    }

    private fun startForegroundNotification() {
        val notificationIntent = Intent(this, MainActivity::class.java)
        // A PendingIntent is a token that you give to another application
        // (e.g., the Android system) which allows that application to execute an operation on
        // app's behalf at a later time, even when your app is not running.
        // The operation can be to start an Activity, Service, or send a Broadcast.
        val pendingIntent = PendingIntent.getActivity(
            this, 0, notificationIntent, PendingIntent.FLAG_IMMUTABLE or 0
        )

        val notification: Notification = NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("My Custom Foreground Service")
            .setContentText("Not doing much at the moment")
            .setSmallIcon(R.drawable.ic_launcher_background)
            .setContentIntent(pendingIntent)
            .build()

        startForeground(NOTIFICATION_ID_FOR_MY_CUSTOM_FOREGROUND_SERVICE, notification)
    }

    override fun onDestroy() {
        super.onDestroy()
        handler.removeCallbacks(periodicTask)
        handlerThread.quitSafely()
    }
}
