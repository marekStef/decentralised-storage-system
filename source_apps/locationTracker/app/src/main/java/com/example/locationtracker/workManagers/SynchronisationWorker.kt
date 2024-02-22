package com.example.locationtracker.workManagers

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.example.locationtracker.data.database.DatabaseClient
import kotlinx.coroutines.flow.MutableStateFlow
import androidx.work.workDataOf
import com.example.locationtracker.eventSynchronisation.sendLocationsToServer

class SynchronisationWorker(
    private val context: Context,
    workerParams: WorkerParameters
) : CoroutineWorker(context, workerParams) {

    companion object {
        const val Progress = "Progress"
        val syncProgress = MutableStateFlow(0)
        const val SyncedEvents = "SyncedEvents"
        val numberOfSyncedEvents = MutableStateFlow(0)
    }

    override suspend fun doWork(): Result {
        val database = DatabaseClient.getDatabase(context)
        val dao = database.locationDao()

        val totalCount = dao.countAllLocations()
        val batchSize = 1000 // Number of events to be sent in one api request
        var offset = 0

        while (offset < totalCount) {
            val locations = dao.getLocationsFromOldestFirstWithLimitOffset(batchSize, offset)
            sendLocationsToServer(locations)
            offset += locations.size
            updateProgress(offset, totalCount)
        }
        updateProgress(offset, totalCount)
        return Result.success()
    }

    private suspend fun updateProgress(offset: Int, totalCount: Int) {
        val progress = (offset.toFloat() / totalCount * 100).toInt()
        setProgress(workDataOf(Progress to progress, SyncedEvents to offset))

        syncProgress.value = progress
        numberOfSyncedEvents.value = offset
    }
}