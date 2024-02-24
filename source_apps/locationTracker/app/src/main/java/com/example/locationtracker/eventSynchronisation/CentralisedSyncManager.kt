package com.example.locationtracker.eventSynchronisation

import android.app.Application
import androidx.work.ExistingWorkPolicy
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkInfo
import androidx.work.WorkManager
import com.example.locationtracker.workManagers.SynchronisationWorker
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.util.Date
import java.util.UUID

enum class EventsSyncingStatus {
    NOT_SYNCED_YET,
    SYNCING,
    SYNCED_SUCCESSFULLY,
    SYNCHRONISATION_FAILED
}


class CentralizedSyncManager private constructor(private val application: Application) {

    companion object {
        private var instance: CentralizedSyncManager? = null
        const val SYNCHRONISATION_WORKER_UNIQUE_NAME = "SynchronisationWorkerUniqueName"

        fun getInstance(application: Application): CentralizedSyncManager {
            if (instance == null) {
                synchronized(this) {
                    if (instance == null) {
                        instance = CentralizedSyncManager(application)
                    }
                }
            }
            return instance!!
        }
    }

//    private val _progress = MutableStateFlow(0)
//    val progress = _progress.asStateFlow()

//    private val _lastSyncStatus = MutableStateFlow(EventsSyncingStatus.SYNCING)
//    val lastSyncStatus: StateFlow<EventsSyncingStatus> = _lastSyncStatus.asStateFlow()

//    private val _syncCompletionTime = MutableStateFlow<Date?>(null)
//    val syncCompletionTime = _syncCompletionTime.asStateFlow()

    fun startSyncing(initiatedFromBackground: Boolean = false) {
//        if (_lastSyncStatus.value == EventsSyncingStatus.SYNCING) return

        val request = OneTimeWorkRequestBuilder<SynchronisationWorker>().build()

        WorkManager.getInstance(application)
            .enqueueUniqueWork(SYNCHRONISATION_WORKER_UNIQUE_NAME, ExistingWorkPolicy.KEEP, request)

//        if (!initiatedFromBackground) {
//            _lastSyncStatus.value = EventsSyncingStatus.SYNCING
//            observeWorkInfoById(request.id)
//        }
    }

//    private fun observeWorkInfoById(workId: UUID) {
//        WorkManager.getInstance(application).getWorkInfoByIdLiveData(workId).observeForever { workInfo ->
//            when (workInfo?.state) {
//                WorkInfo.State.RUNNING -> updateProgress(workInfo)
//                WorkInfo.State.SUCCEEDED -> updateSyncStatusSuccess()
//                WorkInfo.State.FAILED, WorkInfo.State.CANCELLED -> updateSyncStatusFailure()
//                else -> {}
//            }
//        }
//    }

    private fun updateProgress(workInfo: WorkInfo) {
//        val progress = workInfo.progress.getInt(SynchronisationWorker.Progress, 0)
//        val numberOfSyncedEvents: Int = workInfo.progress.getInt(SynchronisationWorker.SyncedEvents, 0)
////        _progress.value = progress
//        updateNumberOfSynchronisedEvents(numberOfSyncedEvents)
    }

    private fun updateSyncStatusSuccess() {
//        _lastSyncStatus.value = EventsSyncingStatus.SYNCED_SUCCESSFULLY
//        _syncCompletionTime.value = Date()
        updateLastSynchronisation(Date())
    }

    private fun updateSyncStatusFailure() {
//        _lastSyncStatus.value = EventsSyncingStatus.SYNCHRONISATION_FAILED
//        _syncCompletionTime.value = Date()
        updateLastSynchronisation(Date())
    }

    private fun updateNumberOfSynchronisedEvents(additionalCountOfSyncedEvents: Int) {

    }

    private fun updateLastSynchronisation(date: Date) {

    }
}
