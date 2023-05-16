package com.example.locationappandroidtest

import android.Manifest
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Binder
import android.os.Build
import android.os.Handler
import android.os.HandlerThread
import android.os.IBinder
import android.os.Process
import android.util.Log
import androidx.core.app.ActivityCompat
import androidx.core.app.NotificationCompat
import com.example.locationappandroidtest.NotificationHelper.updateNotification
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class CustomForegroundService : Service() {
    companion object {
        public const val NOTIFICATION_ID_FOR_MY_CUSTOM_FOREGROUND_SERVICE = 124
        public val CUSTOM_FOREGROUND_SERVICE_CHANNEL_ID = "CustomForegroundServiceChannel"
    }

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
                CUSTOM_FOREGROUND_SERVICE_CHANNEL_ID,
                "Custom foreground service",
                "Not doing much at the moment (Last update sent: $lastUpdateTime)"
            )

            // Post the Runnable again with a delay
            handler.postDelayed(this, updateIntervalMillis)
        }
    }

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        Log.d("SPRAVA", "CUSTOOOOOOOOOOOOOOOM")
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

        val notification: Notification = NotificationCompat.Builder(this, CUSTOM_FOREGROUND_SERVICE_CHANNEL_ID)
            .setContentTitle("My Custom Foreground Service")
            .setContentText("Not doing much at the moment")
            .setSmallIcon(R.drawable.ic_launcher_foreground)
            .setContentIntent(pendingIntent)
            .build()

        startForeground(NOTIFICATION_ID_FOR_MY_CUSTOM_FOREGROUND_SERVICE, notification)
    }

    private fun createNotificationChannel() {
        // Create the NotificationChannel, but only on API 26+ because
        // the NotificationChannel class is new and not in the support library
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val name = "Custom foreground service"
            val descriptionText = "Channel for custom foreground service"
            val importance = NotificationManager.IMPORTANCE_DEFAULT
            val channel = NotificationChannel(CUSTOM_FOREGROUND_SERVICE_CHANNEL_ID, name, importance).apply {
                description = descriptionText
            }
            // Register the channel with the system
            val notificationManager: NotificationManager =
                getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        handler.removeCallbacks(periodicTask)
        handlerThread.quitSafely()
    }
}
