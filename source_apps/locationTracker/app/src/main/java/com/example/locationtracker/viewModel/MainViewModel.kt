package com.example.locationtracker.viewModel

import android.util.Log
import androidx.compose.runtime.mutableStateListOf
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope

import com.example.locationtracker.data.LogsManager
import com.example.locationtracker.data.PreferencesManager
import com.example.locationtracker.eventSynchronisation.isDataStorageServerReachable
import com.example.locationtracker.model.DataStorageDetails
import com.example.locationtracker.model.EmptyDataStorageDetails
import com.example.locationtracker.model.SyncInfo
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.time.LocalTime

class MainViewModel(private val dbManager: LogsManager, private val preferencesManager: PreferencesManager) : ViewModel() {
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

    // data storage server specific [START]
    private val _dataStorageDetails = MutableLiveData<DataStorageDetails>()
    val dataStorageDetails: LiveData<DataStorageDetails> = _dataStorageDetails

    private val _isServerReachable = MutableLiveData<Boolean>()
    val isServerReachable: LiveData<Boolean> = _isServerReachable

    private val _isLoading = MutableLiveData<Boolean>()
    val isLoading: LiveData<Boolean> = _isLoading

    fun checkDataStorageServerReachability() {
        viewModelScope.launch {
            _isLoading.value = true
            val ipAddress = _dataStorageDetails.value?.ipAddress ?: ""
            val port = _dataStorageDetails.value?.port ?: ""
            val isReachable = withContext(Dispatchers.IO) {
                isDataStorageServerReachable(ipAddress, port)
            }
            _isServerReachable.value = isReachable
            _isLoading.value = false
        }
    }

    fun updateDataStorageIpAddress(value: String) {
        val currentDetails = _dataStorageDetails.value ?: EmptyDataStorageDetails
        _dataStorageDetails.value = currentDetails.copy(ipAddress = value)
    }

    fun updateDataStoragePort(value: String) {
        val currentDetails = _dataStorageDetails.value ?: EmptyDataStorageDetails
        _dataStorageDetails.value = currentDetails.copy(port = value)
    }
    // data storage server specific [END]

    init {
        loadDataStorageDetails()
        startPeriodicSync()
    }

    private fun loadDataStorageDetails() {
        _dataStorageDetails.value = preferencesManager.loadDataStorageDetails()
    }

    fun saveDataStorageDetails() {
        if (_dataStorageDetails.value == null) return
        preferencesManager.saveDataStorageDetails(_dataStorageDetails.value!!)
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