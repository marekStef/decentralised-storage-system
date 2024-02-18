package com.example.locationtracker.constants

object Constants {

}

object SharedPreferences {
    const val LOCATION_TRACKER_SERVICE_SHARED_PREFERENCES = "location_tracker_service_shared_preferences"
    const val LOCATION_TRACKER_SERVICE_RUNNING_FLAG = "is_service_running_flag"

    const val DATA_STORAGE_DETAILS_PREFERENCES = "data_storage_details_preferences"
    const val DATA_STORAGE_DETAILS = "data_storage_details"
}

object Services {
    const val LOCATION_TRACKER_SERVICE_BROADCAST = "SERVICE_STATUS_ACTION"
}

object Notifications {
    // for location tracker service
    const val REQUEST_CODE_FOR_POST_NOTIFICATIONS_PERMISSION_FOR_LOCATION_TRACKER_SERVICE = 0
    val NOTIFICATION_ID_FOR_LOCATION_TRACKER_SERVICE = 1
    val NOTIFICATION_CHANNEL_ID_FOR_LOCATION_TRACKER_SERVICE = "location_channel"
    const val NOTIFICATION_CHANNEL_NAME_FOR_LOCATION_TRACKER_SERVICE = "Location Tracking Service"
    const val NOTIFICATION_CHANNEL_DESCRIPTION_FOR_LOCATION_TRACKER_SERVICE = "This channel is used by Location Tracker service"

    // for important notifications
    const val REQUEST_CODE_FOR_POST_NOTIFICATIONS_PERMISSION_FOR_IMPORTANT_THINGS = 10
    val NOTIFICATION_ID_FOR_IMPORTANT_THINGS = 11
    val NOTIFICATION_CHANNEL_ID_FOR_IMPORTANT_THINGS = "important_channel"
    const val NOTIFICATION_CHANNEL_NAME_FOR_IMPORTANT_THINGS = "Location Tracking"
    const val NOTIFICATION_CHANNEL_DESCRIPTION_FOR_IMPORTANT_THINGS = "This channel is used for notifications of important things"
}