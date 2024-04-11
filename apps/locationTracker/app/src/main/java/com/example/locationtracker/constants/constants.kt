package com.example.locationtracker.constants

object App {
    const val APP_NAME = "location_track"
}

object SharedPreferences {
    const val SYNCHRONISATION_INFO_SHARED_PREFERENCES =
        "com.example.locationtracker.data.database.syncinfo_preferences_v9999999999"
    const val SYNCHRONISATION_INFO_LAST_SYNC = "last_sync"
    const val SYNCHRONISATION_INFO_SYNC_MESSAGE = "sync_message"
    const val SYNCHRONISATION_INFO_SYNC_STATUS = "sync_status"
    const val SYNCHRONISATION_INFO_SYNC_PROGRESS = "sync_progress"
    const val SYNCHRONISATION_INFO_EVENTS_NOT_SYNCED = "events_not_synced"
    const val SYNCHRONISATION_INFO_OLDEST_EVENT_TIME_NOT_SYNCED = "oldest_event_not_synced"
    const val SYNCHRONISATION_INFO_TOTAL_EVENTS_SYNCED = "total_events_synced"

    const val LOCATION_TRACKER_SERVICE_SHARED_PREFERENCES =
        "location_tracker_service_shared_preferences_v75599979399"
    const val LOCATION_TRACKER_SERVICE_RUNNING_FLAG = "is_service_running_flag"

    const val DATA_STORAGE_DETAILS_PREFERENCES = "data_storage_details_preferencess"
    const val DATA_STORAGE_DETAILS = "data_storage_details"

    const val APPLICATION_SETTINGS_PREFERENCES = "application_settings_preferences_v3"
    const val APPLICATION_SETTINGS_PREF_MAIN_KEY = "application_settings"
    const val APPLICATION_SETTINGS_PREF_IS_APP_REGISTERED = "application_settings_pref_is_app_registered"

}

object Services {
    const val LOCATION_TRACKER_SERVICE_BROADCAST = "SERVICE_STATUS_ACTION"
}

object LocationTrackerServiceParameters {
    const val LOCATION_TRACKER_SERVICE_START_TIME_PARAMETER = "startTime"
    const val LOCATION_TRACKER_SERVICE_END_TIME_PARAMETER = "endTime"
    const val LOCATION_TRACKER_SERVICE_NETWORK_NAME_PARAMETER = "network_name"
    const val LOCATION_TRACKER_SERVICE_AUTOMATIC_SYNC_PARAMETER = "automaticSync"
}

object LocationTrackerServiceBroadcastParameters {
    const val LOCATION_TRACKER_SERVICE_IS_RUNNING_BROADCAST_PARAMETER = "isRunning"
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
    const val UNIQUE_LOCATION_PROFILE_NAME = "${UNIQUE_APP_NAME}/profiles/location_profile"
}

object ScreensNames {
    const val MAIN_SCREEN = "mainScreen"
    const val LOG_SCREEN = "logScreen"
    const val PROFILES_AND_PERMISSIONS_SCREEN = "profilesAndPermissions"
    const val REGISTRATION_SCREEN = "registrationScreen"
    const val SETTINGS_SCREEN_FOR_REGISTERED_APP = "settingsScreenForRegisteredApp"
}

object TimeRelated {
    const val _24_HOURS_IN_MILLISECONDS = 24*60*60*1000
}

object Workers {
    const val SYNCHRONISATION_WORKER_UNIQUE_NAME = "___synchronisation_worker___"
    const val SYNCHRONISATION_WORKER_BROADCAST = "SYNCHRONISATION_WORKER_BROADCAST"
    const val SYNCHRONISATION_WORKER_PROGRESS_PARAMETER_BROADCAST = "SYNCHRONISATION_WORKER_PROGRESS_PARAMETER_BROADCAST"
    const val SYNCHRONISATION_WORKER_SYNC_STATUS_PARAMETER_BROADCAST = "SYNCHRONISATION_WORKER_SYNC_STATUS_PARAMETER_BROADCAST"
    const val SYNCHRONISATION_WORKER_SYNC_MESSAGE_PARAMETER_BROADCAST = "SYNCHRONISATION_WORKER_SYNC_MESSAGE_PARAMETER_BROADCAST"
    const val SYNCHRONISATION_WORKER_ADDITIONAL_NUMBER_OF_SYNCED_EVENTS_PARAMETER_BROADCAST = "SYNCHRONISATION_WORKER_ADDITIONAL_NUMBER_OF_SYNCED_EVENTS_PARAMETER_BROADCAST"
    const val SYNCHRONISATION_WORKER_LAST_SYNC_TIME_IN_MILLIS_PARAMETER_BROADCAST = "SYNCHRONISATION_WORKER_LAST_SYNC_TIME_IN_MILLIS_PARAMETER_BROADCAST"
}