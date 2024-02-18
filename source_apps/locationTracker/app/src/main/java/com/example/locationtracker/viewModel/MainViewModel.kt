package com.example.locationtracker.viewModel

import android.util.Log
import androidx.compose.runtime.mutableStateListOf
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope

import com.example.locationtracker.data.LogsManager
import com.example.locationtracker.data.PreferencesManager
import com.example.locationtracker.model.SyncInfo
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import java.time.LocalTime

class MainViewModel(private val dbManager: LogsManager, preferencesManager: PreferencesManager) : ViewModel() {
    private val TIME_PERIOD_MILLISECONDS = 10000L

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

    private val _syncInfo = MutableLiveData<SyncInfo>()
    val syncInfo: LiveData<SyncInfo> = _syncInfo

    private val _selectedStartTimeForLocationLogging = MutableLiveData<LocalTime>()
    val selectedStartTimeForLocationLogging: LiveData<LocalTime> = _selectedStartTimeForLocationLogging // read only so that the ui can observe it
    fun updateStartTimeForLocationLogging(hour: Int, minute: Int) {
        _selectedStartTimeForLocationLogging.value = LocalTime.of(hour, minute)
    }

    private val _selectedEndTimeForLocationLogging = MutableLiveData<LocalTime>()
    val selectedEndTimeForLocationLogging: LiveData<LocalTime> = _selectedEndTimeForLocationLogging // read only so that the ui can observe it
    fun updateEndTimeForLocationLogging(hour: Int, minute: Int) {
        _selectedEndTimeForLocationLogging.value = LocalTime.of(hour, minute)
    }

    private val _isAutoSyncToggled = MutableLiveData<Boolean>(false)
    val isAutoSyncToggled: LiveData<Boolean> = _isAutoSyncToggled
    fun toggleAutoSync(value: Boolean) {
        _isAutoSyncToggled.value = value
    }

    val serviceRunningLiveData = MutableLiveData<Boolean>(preferencesManager.isLocationTrackerServiceRunning())

    init {
        startPeriodicSync()
    }

    private fun startPeriodicSync() {
        viewModelScope.launch {
            while (isActive) { // isActive is a CoroutineScope extension property
                try {
                    _syncInfo.postValue(dbManager.getSyncInfo())
                    Log.d("FETCHING", "FEEEEEEEEEEEEEEEEEEEEEEEEETCHING")
                } catch (e: Exception) {

                }
                delay(TIME_PERIOD_MILLISECONDS)
            }
        }
    }

    fun updateSyncInfo(newSyncInfo: SyncInfo) {
        viewModelScope.launch {
            dbManager.saveSyncInfo(newSyncInfo)
            _syncInfo.value = newSyncInfo
        }
    }
}