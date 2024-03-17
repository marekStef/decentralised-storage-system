package com.example.locationtracker.viewModel

import android.app.AlertDialog
import android.app.Application
import android.content.Context
import androidx.compose.runtime.mutableStateListOf
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.viewModelScope
import androidx.navigation.NavController
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkInfo
import androidx.work.WorkManager
import com.example.locationtracker.constants.ScreensNames

import com.example.locationtracker.data.DatabaseManager
import com.example.locationtracker.data.PreferencesManager
import com.example.locationtracker.eventSynchronisation.CentralizedSyncManager
import com.example.locationtracker.eventSynchronisation.EventsSyncingStatus
import com.example.locationtracker.foregroundServices.LocationTrackerService.stopLocationGatheringServiceIfRunning
import com.example.locationtracker.model.AppSettings
import com.example.locationtracker.model.SyncInfo
import com.example.locationtracker.model.defaultAppSettings
import com.example.locationtracker.model.defaultSyncInfo
import com.example.locationtracker.utils.convertDateToFormattedString
import com.example.locationtracker.workManagers.ExportLocationsWorker
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import java.lang.ref.WeakReference
import java.time.LocalTime
import java.util.Date

class MainViewModel(private val application: Application, private val dbManager: DatabaseManager, private val preferencesManager: PreferencesManager) : AndroidViewModel(application) {
    private val workManager = WorkManager.getInstance(application)

    private val _appSettings = MutableLiveData<AppSettings>()
    val appSettings: LiveData<AppSettings> = _appSettings

    private val _syncInfo = MutableLiveData<SyncInfo>()
    val syncInfo: LiveData<SyncInfo> = _syncInfo

    val serviceRunningLiveData =
        MutableLiveData<Boolean>(preferencesManager.isLocationTrackerServiceRunning())

    init {
        loadAppSettings()
        loadSynchronisationInfo()
    }

    fun resetViewModel() {
        _syncInfo.value = defaultSyncInfo
        _appSettings.value = defaultAppSettings
    }

    fun saveViewModel() {
        saveSynchronisationInfo()
        saveAppSettings()
    }

    fun updateAppSettingsEndTime(value: LocalTime) {
        val currentSettings = _appSettings.value ?: defaultAppSettings
        _appSettings.value = currentSettings.copy(selectedEndTimeForLocationLogging = value)
    }

    fun updateAppSettingsStartTime(value: LocalTime) {
        val currentSettings = _appSettings.value ?: defaultAppSettings
        _appSettings.value = currentSettings.copy(selectedStartTimeForLocationLogging = value)
    }

    fun updateAppSettingsAutoSync(value: Boolean) {
        val currentSettings = _appSettings.value ?: defaultAppSettings
        _appSettings.value = currentSettings.copy(isAutoSyncToggled = value)
    }

    fun updateLastSynchronisation(date: Date) {
        val currentSyncInfo = _syncInfo.value ?: defaultSyncInfo
        _syncInfo.value = currentSyncInfo.copy(lastSyncTime = convertDateToFormattedString(date))
    }

    fun updateAdditionalNumberOfSynchronisedEvents(additionalEvents: Int) {
        val currentSyncInfo = _syncInfo.value ?: defaultSyncInfo
        _syncInfo.value =
            currentSyncInfo.copy(numberOfSyncedEvents = currentSyncInfo.numberOfSyncedEvents + additionalEvents)
    }

    fun updateNumberOfNotSynchronisedEvents(count: Int) {
        val currentSyncInfo = _syncInfo.value ?: defaultSyncInfo
        _syncInfo.value = currentSyncInfo.copy(numberOfNotSyncedEvents = count)
    }

    fun updateLastNotSynchronisedEvent(value: String) {
        val currentSyncInfo = _syncInfo.value ?: defaultSyncInfo
        _syncInfo.value = currentSyncInfo.copy(oldestEventTimeNotSynced = value)
    }

    fun updateSyncMessage(message: String?) {
        val currentSyncInfo = _syncInfo.value ?: defaultSyncInfo
        _syncInfo.value = message?.let { currentSyncInfo.copy(syncMessage = it) }
    }

    fun updateSyncStatus(status: EventsSyncingStatus) {
        val currentSyncInfo = _syncInfo.value ?: defaultSyncInfo
        _syncInfo.value = currentSyncInfo.copy(syncStatus = status)
    }

    fun updateCurrentSyncProgress(progress: Int) {
        val currentSyncInfo = _syncInfo.value ?: defaultSyncInfo
        _syncInfo.value = currentSyncInfo.copy(currentSynchronisationProgress = progress)
    }

    // csv exporting
    private val _workInfo = MutableLiveData<WorkInfo>()
    val workInfo: LiveData<WorkInfo> = _workInfo

    fun exportData() {
        val request = OneTimeWorkRequestBuilder<ExportLocationsWorker>().build()
        workManager.getWorkInfoByIdLiveData(request.id).observeForever { workInfo ->
            _workInfo.postValue(workInfo)
        }
        workManager.enqueue(request)
    }

    private val _tempFilePath =
        MutableLiveData<String?>() // file path if it's requested to open dialog, otherwise null
    val tempFilePath: LiveData<String?> = _tempFilePath

    fun setTempFilePath(filePath: String) {
        _tempFilePath.value = filePath
    }

    // Reset the trigger to allow for future requests
    fun resetTempFilePath() {
        _tempFilePath.value = null
    }

    // csv exporting [end]

    private fun loadAppSettings() {
        _appSettings.value = preferencesManager.loadAppSettings()
    }

    private fun saveAppSettings() {
        appSettings.value?.let { preferencesManager.saveAppSettings(it) }
    }

    private fun saveSynchronisationInfo() {
        _syncInfo.value?.let { preferencesManager.saveSyncInfo(it) }
    }

    fun loadSynchronisationInfo() {
        viewModelScope.launch {
            _syncInfo.value = dbManager.getSyncInfo()
        }
        startPeriodicFetchingOfTheCountOfNotSyncedEvents()
    }


    private fun startPeriodicFetchingOfTheCountOfNotSyncedEvents() {
        viewModelScope.launch {
            while (isActive) { // isActive is a CoroutineScope extension property
                try {
                    updateNumberOfNotSynchronisedEvents(dbManager.getCountOfNotSynchronisedLocationsForSyncInfo())
                    updateLastNotSynchronisedEvent(dbManager.getTimeOfOldestNotSyncedEvent())
//                    Log.d("FETCHING", "FEEEEEEEEEEEEEEEEEEEEEEEEETCHING")
                } catch (e: Exception) {

                }
                delay(1000L)
            }
        }
    }

    fun deleteAllLocations() {
        viewModelScope.launch {
            dbManager.deleteAllLocations()
        }
    }

    // queue for permissions
    // [camera permission]
    val visiblePermissionDialogQueue = mutableStateListOf<String>()
    fun dismissDialog() {
        visiblePermissionDialogQueue.removeFirst()
    }

    fun onPermissionResult(
        permission: String,
        isGranted: Boolean
    ) {
        if (!isGranted && !visiblePermissionDialogQueue.contains(permission)) {
            visiblePermissionDialogQueue.add(permission)
        }
    }

    fun resetApplication(applicationContext: Context, navController: NavController) {
        preferencesManager.resetAllPreferences()
        stopLocationGatheringServiceIfRunning(applicationContext, WeakReference(this))
        deleteAllLocations()
        resetViewModel()
        navController.navigate(ScreensNames.REGISTRATION_SCREEN)
    }

    fun showAlertDialogWithOkButton(title: String, message: String) {
        AlertDialog.Builder(application)
            .setTitle(title)
            .setMessage(message)
            .setPositiveButton("OK") { dialog, _ ->
                dialog.dismiss()
            }
            .show()
    }

    val syncManager = CentralizedSyncManager.getInstance(application)
    fun startSynchronisingGatheredData() {
        syncManager.startSyncing();
    }

}