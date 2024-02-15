package com.example.locationtracker.data

import android.content.Context
import com.example.locationtracker.model.SyncInfo

class DatabaseLogsManager(private val context: Context) {
    companion object {
        private const val PREFERENCES_FILE_KEY = "com.example.syncinfo_preferences"
        private const val LAST_SYNC = "last_sync"
        private const val EVENTS_NOT_SYNCED = "events_not_synced"
        private const val OLDEST_EVENT_NOT_SYNCED = "oldest_event_not_synced"
        private const val TOTAL_EVENTS = "total_events"
    }

//    private val sharedPreferences: SharedPreferences =
//        context.getSharedPreferences(PREFERENCES_FILE_KEY, Context.MODE_PRIVATE)

    fun saveSyncInfo(syncInfo: SyncInfo) {
//        sharedPreferences.edit {
//            putString(LAST_SYNC, syncInfo.lastSync)
//            putInt(EVENTS_NOT_SYNCED, syncInfo.eventsNotSynced)
//            putString(OLDEST_EVENT_NOT_SYNCED, syncInfo.oldestEventNotSynced)
//            putLong(TOTAL_EVENTS, syncInfo.totalEvents)
//            apply()
//        }
    }

    fun getSyncInfo(): SyncInfo {
        return SyncInfo(
            lastSync = "No data",
            eventsNotSynced = 0,
            oldestEventNotSynced = "No data",
            totalEvents = 0
        )
    }
}