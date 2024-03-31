package com.example.locationtracker.workManagers

import android.content.Context
import android.content.Intent
import android.util.Log
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.example.locationtracker.data.database.DatabaseClient
import com.example.locationtracker.constants.Workers
import com.example.locationtracker.data.PreferencesManager
import com.example.locationtracker.eventSynchronisation.EventsSyncingStatus
import com.example.locationtracker.eventSynchronisation.checkAccessTokenStatus
import com.example.locationtracker.eventSynchronisation.isDataStorageServerReachable
import com.example.locationtracker.eventSynchronisation.sendLocationsToServer
import com.example.locationtracker.model.DataStorageDetails
import com.example.locationtracker.utils.getCurrentTimeInMillis
import java.util.Date

class SynchronisationWorker(
    private val context: Context,
    workerParams: WorkerParameters
) : CoroutineWorker(context, workerParams) {
    private var preferencesManager: PreferencesManager = PreferencesManager(context)

    override suspend fun doWork(): Result {
        val dataStorageDetails: DataStorageDetails = this.preferencesManager.loadDataStorageDetails()

        if (dataStorageDetails.ipAddress.length == 0 || dataStorageDetails.port.length == 0) {
            return Result.failure()
        }

        val isReachable = isDataStorageServerReachable(dataStorageDetails.ipAddress, dataStorageDetails.port)
        if (!isReachable) {
            return Result.failure();
        }
        if (dataStorageDetails.accessTokenForLocationEvents == null)
            return Result.failure();

        val isTokenActive = checkAccessTokenStatus(dataStorageDetails.ipAddress, dataStorageDetails.port, dataStorageDetails.accessTokenForLocationEvents)
        Log.d("ACTIIIIIIIIVE", "$isTokenActive")
        if (!isTokenActive) {
            return Result.failure();
        }

        val database = DatabaseClient.getDatabase(context)
        val dao = database.locationDao()

        val totalCount = dao.countAllLocations()
        val batchSize = 100 // Number of events to be sent in one api request
        var offset = 0

        updateProgress(offset, 0,  totalCount, EventsSyncingStatus.SYNCING, "Started Syncing")

        while (offset < totalCount) {
            val locations = dao.getLocationsFromOldestFirstWithLimitOffset(batchSize, 0)
            if (sendLocationsToServer(dataStorageDetails.ipAddress, dataStorageDetails.port, locations)) {
                val locationIds = locations.map { it.id }
                dao.deleteLocationsByIds(locationIds)
            }
            offset += locations.size
            updateProgress(locations.size, offset, totalCount, EventsSyncingStatus.SYNCING, "Syncing")
        }

        updateProgress(0, offset, totalCount, EventsSyncingStatus.SYNCED_SUCCESSFULLY, "Successfully synced", getCurrentTimeInMillis())

        kotlinx.coroutines.delay(100) // this needs to be here as the last call of updateProgress was overshadowed by the Result.success() :/

        return Result.success()
    }

    private fun updateProgress(numberOfNewlySyncedLocations: Int, offset:Int, totalCount: Int, status: EventsSyncingStatus, message: String, endSyncTimeInMillis: Long = 0) {
        val progress = (offset.toFloat() / totalCount * 100).toInt()

        val intent = Intent(Workers.SYNCHRONISATION_WORKER_BROADCAST)
        intent.putExtra(
            Workers.SYNCHRONISATION_WORKER_PROGRESS_PARAMETER_BROADCAST,
            progress
        )
        intent.putExtra(
            Workers.SYNCHRONISATION_WORKER_SYNC_STATUS_PARAMETER_BROADCAST,
            status.toString()
        )
        intent.putExtra(
            Workers.SYNCHRONISATION_WORKER_SYNC_MESSAGE_PARAMETER_BROADCAST,
            message
        )
        intent.putExtra(
            Workers.SYNCHRONISATION_WORKER_LAST_SYNC_TIME_IN_MILLIS_PARAMETER_BROADCAST,
            endSyncTimeInMillis
        )
        intent.putExtra(
            Workers.SYNCHRONISATION_WORKER_ADDITIONAL_NUMBER_OF_SYNCED_EVENTS_PARAMETER_BROADCAST,
            numberOfNewlySyncedLocations
        )
        context.sendBroadcast(intent)
        preferencesManager.savePartialSyncInfo(
            progress = progress,
            additionalNumberOfSyncedEvents = numberOfNewlySyncedLocations,
            syncMessage = message,
            syncStatus = status,
        )

        if (endSyncTimeInMillis != 0L) {
            preferencesManager.savePartialSyncInfo(
                lastSynchronisationTimeInMillis = endSyncTimeInMillis
            )
        }
    }
}