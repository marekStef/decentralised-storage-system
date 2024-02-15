package com.example.locationtracker.constants

object Constants {
    val NOTIFICATION_ID = 1
    val NOTIFICATION_CHANNEL_ID = "location_channel"
    const val NOTIFICATION_CHANNEL_NAME = "Location Tracking Service"
    const val NOTIFICATION_CHANNEL_DESCRIPTION = "This channel is used by Location Tracker service"


    const val REQUEST_CODE_FOR_POST_NOTIFICATIONS_PERMISSION = 0
}

object SharedPreferences {
    const val LOCATION_TRACKER_SERVICE_SHARED_PREFERENCES = "location_tracker_service_shared_preferences"
    const val LOCATION_TRACKER_SERVICE_RUNNING_FLAG = "is_service_running_flag"
}