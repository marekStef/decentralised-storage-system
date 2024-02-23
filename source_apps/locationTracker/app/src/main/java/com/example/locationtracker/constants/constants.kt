package com.example.locationtracker.constants

object Constants {

}

object App {
    const val APP_NAME = "location_track"
}

object SharedPreferences {
    const val SYNCHRONISATION_INFO_SHARED_PREFERENCES =
        "com.example.locationtracker.data.database.syncinfo_preferences_v9"
    const val SYNCHRONISATION_INFO_LAST_SYNC = "last_sync"
    const val SYNCHRONISATION_INFO_EVENTS_NOT_SYNCED = "events_not_synced"
    const val SYNCHRONISATION_INFO_OLDEST_EVENT_TIME_NOT_SYNCED = "oldest_event_not_synced"
    const val SYNCHRONISATION_INFO_TOTAL_EVENTS_SYNCED = "total_events_synced"

    const val LOCATION_TRACKER_SERVICE_SHARED_PREFERENCES =
        "location_tracker_service_shared_preferences_v75"
    const val LOCATION_TRACKER_SERVICE_RUNNING_FLAG = "is_service_running_flag"

    const val DATA_STORAGE_DETAILS_PREFERENCES = "data_storage_details_preferencess"
    const val DATA_STORAGE_DETAILS = "data_storage_details"

    const val APPLICATION_SETTINGS_PREFERENCES = "application_settings_preferences_v3"
    const val APPLICATION_SETTINGS = "application_settings"
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
    const val NOTIFICATION_CHANNEL_DESCRIPTION_FOR_LOCATION_TRACKER_SERVICE =
        "This channel is used by Location Tracker service"

    // for important notifications
    const val REQUEST_CODE_FOR_POST_NOTIFICATIONS_PERMISSION_FOR_IMPORTANT_THINGS = 10
    val NOTIFICATION_ID_FOR_IMPORTANT_THINGS = 11
    val NOTIFICATION_CHANNEL_ID_FOR_IMPORTANT_THINGS = "important_channel"
    const val NOTIFICATION_CHANNEL_NAME_FOR_IMPORTANT_THINGS = "Location Tracking"
    const val NOTIFICATION_CHANNEL_DESCRIPTION_FOR_IMPORTANT_THINGS =
        "This channel is used for notifications of important things"
}

object DataStorageRelated {
    const val UNIQUE_APP_NAME = "locationTracker.com"
    const val UNIQUE_LOCATION_PROFILE_NAME = "${UNIQUE_APP_NAME}/profiles/location_profilea"
}

