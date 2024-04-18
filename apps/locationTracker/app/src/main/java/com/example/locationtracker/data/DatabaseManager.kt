package com.example.locationtracker.data

import android.annotation.SuppressLint
import android.content.Context
import android.util.Log
import androidx.core.content.edit
import com.example.locationtracker.constants.SharedPreferences as constants
import com.example.locationtracker.data.database.Database
import com.example.locationtracker.data.database.DatabaseClient
import com.example.locationtracker.data.database.entities.Location
import com.example.locationtracker.eventSynchronisation.EventsSyncingStatus
import com.example.locationtracker.model.SyncInfo
import com.example.locationtracker.utils.convertLongToTime
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import java.io.File
import java.io.FileWriter


class DatabaseManager private constructor(private var db: Database, private val context: Context) {
    private val job = SupervisorJob()
    private val scope = CoroutineScope(Dispatchers.IO + job)

    companion object {
        @SuppressLint("StaticFieldLeak")
        @Volatile
        private var instance: DatabaseManager? = null

        fun getInstance(context: Context): DatabaseManager =
            instance ?: synchronized(this) {
                instance ?: DatabaseManager(DatabaseClient.getDatabase(context), context).also {
                    instance = it
                }
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

        val syncStatusString = syncInfoSharedPreferences.getString(
            constants.SYNCHRONISATION_INFO_SYNC_STATUS,
            EventsSyncingStatus.NOT_SYNCED_YET.toString()
        ) ?: EventsSyncingStatus.NOT_SYNCED_YET.toString()

        return SyncInfo(
            lastSyncTime = syncInfoSharedPreferences.getString(
                constants.SYNCHRONISATION_INFO_LAST_SYNC,
                "Not Synced Yet"
            ) ?: "",
            syncMessage = syncInfoSharedPreferences.getString(
                constants.SYNCHRONISATION_INFO_SYNC_MESSAGE,
                ""
            ) ?: "",
            syncStatus = EventsSyncingStatus.valueOf(syncStatusString),
            currentSynchronisationProgress = syncInfoSharedPreferences.getInt(
                constants.SYNCHRONISATION_INFO_SYNC_PROGRESS,
                0
            ),
            numberOfNotSyncedEvents = numberOfNotSyncedEvents,
            oldestEventTimeNotSynced = getTimeOfOldestNotSyncedEvent(),
            numberOfSyncedEvents = syncInfoSharedPreferences.getInt(
                constants.SYNCHRONISATION_INFO_TOTAL_EVENTS_SYNCED,
                0
            )
        )
    }

    fun saveNewLocation(newLocation: NewLocation) {
        scope.launch {
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

    fun deleteAllLocations() {
        scope.launch {
            db.locationDao().deleteAllLocations()
        }
    }

    fun clear() {
        job.cancel()  // Cancel the job when the database manager is no longer needed
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
