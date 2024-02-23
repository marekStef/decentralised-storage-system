package com.example.locationtracker.data

import android.annotation.SuppressLint
import android.content.Context
import android.util.Log
import androidx.core.content.edit
import com.example.locationtracker.constants.SharedPreferences as constants
import com.example.locationtracker.data.database.Database
import com.example.locationtracker.data.database.DatabaseClient
import com.example.locationtracker.data.database.entities.Location
import com.example.locationtracker.model.SyncInfo
import com.example.locationtracker.utils.convertLongToTime
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch
import java.io.File
import java.io.FileWriter

class LogsManager private constructor(private var db: Database, private val context: Context) {
    // for signleton pattern
    companion object {

        @SuppressLint("StaticFieldLeak")
        @Volatile
        private var instance: LogsManager? = null

        fun getInstance(context: Context): LogsManager =
            instance ?: synchronized(this) {
                instance ?: LogsManager(DatabaseClient.getDatabase(context), context).also {
                    instance = it
                }
            }
    }




    fun saveSyncInfo(syncInfo: SyncInfo) {
        val syncInfoSharedPreferences = context.getSharedPreferences(constants.SYNCHRONISATION_INFO_SHARED_PREFERENCES, Context.MODE_PRIVATE)
        syncInfoSharedPreferences.edit {
            putString(constants.SYNCHRONISATION_INFO_LAST_SYNC, syncInfo.lastSyncTime)
            // putInt(EVENTS_NOT_SYNCED, syncInfo.eventsNotSynced)
            // putString(OLDEST_EVENT_TIME_NOT_SYNCED, syncInfo.oldestEventTimeNotSynced)
            putInt(constants.SYNCHRONISATION_INFO_TOTAL_EVENTS_SYNCED, syncInfo.numberOfSyncedEvents)
            apply()
        }
    }

    suspend fun getCountOfNotSynchronisedLocationsForSyncInfo(): Int {
        return db.locationDao().countAllLocations()
    }

    suspend fun getTimeOfOldestNotSyncedEvent(): String {
        return convertLongToTime(
            db.locationDao().getOldestNotSyncedEventTime(), "No event yet"
        )
    }

    suspend fun getSyncInfo(): SyncInfo {
        val syncInfoSharedPreferences = context.getSharedPreferences(constants.SYNCHRONISATION_INFO_SHARED_PREFERENCES, Context.MODE_PRIVATE)
        val numberOfNotSyncedEvents = getCountOfNotSynchronisedLocationsForSyncInfo()
        return SyncInfo(
            lastSyncTime = syncInfoSharedPreferences.getString(
                constants.SYNCHRONISATION_INFO_LAST_SYNC,
                "Not Synced Yet"
            ) ?: "",
            numberOfNotSyncedEvents = numberOfNotSyncedEvents,
            oldestEventTimeNotSynced = getTimeOfOldestNotSyncedEvent(),
            numberOfSyncedEvents = syncInfoSharedPreferences.getInt(
                constants.SYNCHRONISATION_INFO_TOTAL_EVENTS_SYNCED,
                0
            )
        )
    }

    fun saveNewLocation(newLocation: NewLocation) {
        GlobalScope.launch(Dispatchers.IO) {
            db.locationDao().insertLocation(
                Location(
                    latitude = newLocation.latitude,
                    longitude = newLocation.longitude,
                    accuracy = newLocation.accuracy,
                    bearing = newLocation.bearing,
                    bearingAccuracy = newLocation.bearingAccuracy,
                    altitude = newLocation.altitude,
                    speed = newLocation.speed,
                    speedAccuracyMetersPerSecond = newLocation.speedAccuracyMetersPerSecond,
                    provider = newLocation.provider,
                    time = System.currentTimeMillis()
                )
            )
        }
    }

    suspend fun fetchLocations(limit: Int, offset: Int): List<Location> {
        return db.locationDao().getLocationsDescendingWithLimitOffset(limit, offset)
    }

    fun logLast10Locations() {
        GlobalScope.launch(Dispatchers.IO) {
            val last100Locations = db.locationDao().getLocationsDescendingWithLimitOffset(10, 0)
            last100Locations.takeLast(10).forEach { location ->
                Log.d(
                    "LocationLog",
                    "Location: - Lat: ${location.latitude}, Long: ${location.longitude}, Time: ${location.time}"
                )
            }
        }
    }

    fun deleteAllLocations() {
        GlobalScope.launch(Dispatchers.IO) {
            db.locationDao().deleteAllLocations()
        }
    }

    suspend fun exportLocationsToCsv(file: File) {
        val locations = db.locationDao().getAllLocations()
        FileWriter(file).use { writer ->
            writer.append("ID, Latitude, Longitude, Accuracy, Bearing, BearingAccuracy, Altitude, Speed, SpeedAccuracyMetersPerSecond, Provider, Time\n")
            locations.forEach { location ->
                with(location) {
                    writer.append("$id, $latitude, $longitude, $accuracy, $bearing, $bearingAccuracy, $altitude, $speed, $speedAccuracyMetersPerSecond, $provider, $time\n")
                }
            }
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
