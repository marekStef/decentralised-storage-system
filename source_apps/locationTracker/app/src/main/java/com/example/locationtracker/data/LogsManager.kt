package com.example.locationtracker.data

import android.annotation.SuppressLint
import android.content.Context
import android.util.Log
import androidx.core.content.edit
import androidx.lifecycle.LiveData
import androidx.lifecycle.liveData
import com.example.locationtracker.data.database.Database
import com.example.locationtracker.data.database.DatabaseClient
import com.example.locationtracker.data.database.entities.Location
import com.example.locationtracker.model.SyncInfo
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch

class LogsManager private constructor(private var db: Database, private val context: Context) {
    // for signleton pattern
    companion object {
        private const val PREFERENCES_FILE_KEY = "com.example.locationtracker.data.database.syncinfo_preferences"
        private const val LAST_SYNC = "last_sync"
        private const val EVENTS_NOT_SYNCED = "events_not_synced"
        private const val OLDEST_EVENT_TIME_NOT_SYNCED = "oldest_event_not_synced"
        private const val TOTAL_EVENTS = "total_events"

        @SuppressLint("StaticFieldLeak")
        @Volatile private var instance: LogsManager? = null

        fun getInstance(context: Context): LogsManager =
            instance ?: synchronized(this) {
                instance ?: LogsManager(DatabaseClient.getDatabase(context), context).also {
                    instance = it
                }
            }
    }

    val SyncInfoSharedPreferences = context.getSharedPreferences(PREFERENCES_FILE_KEY, Context.MODE_PRIVATE)


    fun saveSyncInfo(syncInfo: SyncInfo) {
        SyncInfoSharedPreferences.edit {
            putString(LAST_SYNC, syncInfo.lastSync)
            // putInt(EVENTS_NOT_SYNCED, syncInfo.eventsNotSynced)
            // putString(OLDEST_EVENT_TIME_NOT_SYNCED, syncInfo.oldestEventTimeNotSynced)
            putLong(TOTAL_EVENTS, syncInfo.totalEvents)
            apply()
        }
    }

    fun getSyncInfo(): SyncInfo {
        return SyncInfo(
            lastSync = SyncInfoSharedPreferences.getString(LAST_SYNC, "") ?: "",
            eventsNotSynced = 0,
            oldestEventTimeNotSynced = "fetch from db",
            totalEvents = SyncInfoSharedPreferences.getLong(TOTAL_EVENTS, 0L)
        )
    }

    fun saveNewLocation(newLocation: NewLocation) {
        GlobalScope.launch(Dispatchers.IO) {
            db.locationDao().insertLocation(Location(
                latitude = newLocation.latitude,
                longitude = newLocation.longitude,
                accuracy = newLocation.accuracy,
                bearing = newLocation.bearing,
                bearingAccuracy = newLocation.bearingAccuracy,
                altitude = newLocation.altitude,
                speed = newLocation.speed,
                speedAccuracyMetersPerSecond = newLocation.speedAccuracyMetersPerSecond,
                provider = newLocation.provider,
                time = System.currentTimeMillis())
            )
        }
    }

    suspend fun fetchLocations(limit: Int, offset: Int): List<Location> {
        return db.locationDao().getLocationsWithLimitOffset(limit, offset)
    }

    fun logLast10Locations() {
        GlobalScope.launch(Dispatchers.IO) {
            val last100Locations = db.locationDao().getLocationsWithLimitOffset(10, 0)
            last100Locations.takeLast(10).forEach { location ->
                Log.d("LocationLog", "Location: - Lat: ${location.latitude}, Long: ${location.longitude}, Time: ${location.time}")
            }
        }
    }

    fun deleteAllLocations() {
        GlobalScope.launch(Dispatchers.IO) {
            db.locationDao().deleteAllLocations()
        }
    }

}

class NewLocation(
    val latitude: Double,
    val longitude: Double,
    val accuracy: Float?,
    val bearing: Float?,
    val bearingAccuracy: Float?,
    val altitude: Double?,
    val speed: Float?,
    val speedAccuracyMetersPerSecond: Float?,
    val provider: String?
)
