package com.example.locationtracker.viewModel

import android.app.Application
import android.util.Log
import androidx.compose.runtime.mutableStateListOf
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.viewModelScope
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkInfo
import androidx.work.WorkManager
import com.example.locationtracker.constants.App
import com.example.locationtracker.constants.DataStorageRelated.UNIQUE_LOCATION_PROFILE_NAME

import com.example.locationtracker.data.LogsManager
import com.example.locationtracker.data.PreferencesManager
import com.example.locationtracker.eventSynchronisation.associateAppWithDataStorageAppHolder
import com.example.locationtracker.eventSynchronisation.isDataStorageServerReachable
import com.example.locationtracker.eventSynchronisation.registerNewProfileToDataStorage
import com.example.locationtracker.eventSynchronisation.sendPermissionRequestToServer
import com.example.locationtracker.model.AppSettings
import com.example.locationtracker.model.DataStorageDetails
import com.example.locationtracker.model.EmptyDataStorageDetails
import com.example.locationtracker.model.SyncInfo
import com.example.locationtracker.model.defaultAppSettings
import com.example.locationtracker.model.defaultSyncInfo
import com.example.locationtracker.workManagers.ExportLocationsWorker
import com.example.locationtracker.workManagers.SynchronisationWorker
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.time.LocalTime
import java.util.Date

enum class ServerReachabilityEnum {
    NOT_TRIED,
    NOT_REACHABLE,
    REACHABLE
}

enum class AssociationWithDataStorageStatusEnum {
    NOT_TRIED,
    ASSOCIATED,
    ASSOCIATION_FAILED
}

enum class ProfileRegistrationStatusEnum {
    NOT_TRIED,
    PROFILE_CREATED,
    PROFILE_CREATION_FAILED
}

enum class PermissionsStatusEnum {
    NOT_TRIED,
    PERMISSION_REQUEST_SENT,
    PERMISSIONS_REQUEST_FAILED
}

enum class EventsSyncingStatus {
    NOT_SYNCED_YET,
    SYNCING,
    SYNCED_SUCCESSFULLY,
    SYNCHRONISATION_FAILED
}

class MainViewModel(private val application: Application, private val dbManager: LogsManager, private val preferencesManager: PreferencesManager) : AndroidViewModel(application) {
    private val workManager = WorkManager.getInstance(application)

    private val _appSettings = MutableLiveData<AppSettings>()
    val appSettings: LiveData<AppSettings> = _appSettings

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

    private val _syncInfo = MutableLiveData<SyncInfo>()
    val syncInfo: LiveData<SyncInfo> = _syncInfo
    fun updateLastSynchronisation(date: Date) {
        val currentSyncInfo = _syncInfo.value ?: defaultSyncInfo
        _syncInfo.value = currentSyncInfo.copy(lastSyncTime = date.toString())
    }
    fun updateNumberOfSynchronisedEvents(numberOfSyncedEvents: Int) {
        val currentSyncInfo = _syncInfo.value ?: defaultSyncInfo
        _syncInfo.value = currentSyncInfo.copy(numberOfSyncedEvents = numberOfSyncedEvents)
    }
    fun updateNumberOfNotSynchronisedEvents(count: Int) {
        val currentSyncInfo = _syncInfo.value ?: defaultSyncInfo
        _syncInfo.value = currentSyncInfo.copy(numberOfNotSyncedEvents = count)
    }

    val serviceRunningLiveData = MutableLiveData<Boolean>(preferencesManager.isLocationTrackerServiceRunning())

    // data storage server specific [START]
    private val _dataStorageDetails = MutableLiveData<DataStorageDetails>()
    val dataStorageDetails: LiveData<DataStorageDetails> = _dataStorageDetails

    private val _serverReachabilityStatus = MutableLiveData<ServerReachabilityEnum>(ServerReachabilityEnum.NOT_TRIED)
    val serverReachabilityStatus: LiveData<ServerReachabilityEnum> = _serverReachabilityStatus

    private val _isLoadingDataStorageServerReachability = MutableLiveData<Boolean>()
    val isLoadingDataStorageServerReachability: LiveData<Boolean> = _isLoadingDataStorageServerReachability

    private val _isAssociatingAppWithStorage = MutableLiveData<Boolean>()
    val isAssociatingAppWithStorage: LiveData<Boolean> = _isAssociatingAppWithStorage

    private val _appAssociatedWithDataStorageStatus = MutableLiveData<AssociationWithDataStorageStatusEnum>(AssociationWithDataStorageStatusEnum.NOT_TRIED)
    val appAssociatedWithDataStorageStatus: LiveData<AssociationWithDataStorageStatusEnum> = _appAssociatedWithDataStorageStatus

    fun associateAppWithStorageAppHolder(callback: (Boolean, String) -> Unit) {
        if (_isAssociatingAppWithStorage.value == true) return

        viewModelScope.launch {
            _isAssociatingAppWithStorage.value = true
            val url: String = "http://${_dataStorageDetails.value?.ipAddress}:${_dataStorageDetails.value?.port}/app/api/associate_with_storage_app_holder"
            val associationToken: String =
                _dataStorageDetails.value?.associationTokenUsedDuringRegistration ?: ""

            val result = associateAppWithDataStorageAppHolder(associationTokenId = associationToken, App.APP_NAME, url)
            _isAssociatingAppWithStorage.value = false
            result.onSuccess { data ->
                val currentDetails = _dataStorageDetails.value ?: EmptyDataStorageDetails
                _dataStorageDetails.value = currentDetails.copy(tokenForPermissionsAndProfiles = data)
                _appAssociatedWithDataStorageStatus.value = AssociationWithDataStorageStatusEnum.ASSOCIATED
                saveDataStorageDetails()
                callback(true, data)
            }.onFailure { error ->
                _appAssociatedWithDataStorageStatus.value = AssociationWithDataStorageStatusEnum.ASSOCIATION_FAILED
                callback(false, error.message ?: "Unknown error occurred")
            }
        }
    }

    fun checkDataStorageServerReachability() {
        if (_isLoadingDataStorageServerReachability.value == true) return

        viewModelScope.launch {
            _isLoadingDataStorageServerReachability.value = true
            val ipAddress = _dataStorageDetails.value?.ipAddress ?: ""
            val port = _dataStorageDetails.value?.port ?: ""
            val isReachable = withContext(Dispatchers.IO) {
                isDataStorageServerReachable(ipAddress, port)
            }
            _serverReachabilityStatus.value = if (isReachable) ServerReachabilityEnum.REACHABLE else ServerReachabilityEnum.NOT_REACHABLE
            _isLoadingDataStorageServerReachability.value = false
        }
    }

    fun updateDataStorageIpAddress(value: String) {
        val currentDetails = _dataStorageDetails.value ?: EmptyDataStorageDetails
        _dataStorageDetails.value = currentDetails.copy(ipAddress = value)
        _serverReachabilityStatus.value = ServerReachabilityEnum.NOT_TRIED
    }

    fun updateDataStoragePort(value: String) {
        val currentDetails = _dataStorageDetails.value ?: EmptyDataStorageDetails
        _dataStorageDetails.value = currentDetails.copy(port = value)
        _serverReachabilityStatus.value = ServerReachabilityEnum.NOT_TRIED
    }

    fun updateDataStorageAssociationToken(value: String) {
        val currentDetails = _dataStorageDetails.value ?: EmptyDataStorageDetails
        _dataStorageDetails.value = currentDetails.copy(associationTokenUsedDuringRegistration = value)
    }

    // data storage server specific [END]

    // data storage server - profile creation [START]

    private val _isRegisteringLocationProfile = MutableLiveData<Boolean>(false)
    val isRegisteringLocationProfile: LiveData<Boolean> = _isRegisteringLocationProfile

    private val _appProfileRegistrationStatus = MutableLiveData<ProfileRegistrationStatusEnum>(ProfileRegistrationStatusEnum.NOT_TRIED)
    val appProfileRegistrationStatus: LiveData<ProfileRegistrationStatusEnum> = _appProfileRegistrationStatus

    fun registerLocationProfileInDataStorageServer(schema: String, callback: (Boolean, String) -> Unit) {
        Log.d("Registering (viewmode)", "Trying to register profile")

        if (_isRegisteringLocationProfile.value == true) return

        viewModelScope.launch {
            _isRegisteringLocationProfile.value = true
            val tokenForPermissionsAndProfiles: String = _dataStorageDetails.value?.tokenForPermissionsAndProfiles ?: ""
            val ip: String = _dataStorageDetails.value?.ipAddress!!
            val port: String = _dataStorageDetails.value?.port!!

            val result = registerNewProfileToDataStorage(ip, port, tokenForPermissionsAndProfiles, UNIQUE_LOCATION_PROFILE_NAME, schema)
            _isRegisteringLocationProfile.value = false

            result.onSuccess { data ->
                saveDataStorageDetails()
                _appProfileRegistrationStatus.value = ProfileRegistrationStatusEnum.PROFILE_CREATED
                callback(true, data)
            }.onFailure { error ->
                _appProfileRegistrationStatus.value = ProfileRegistrationStatusEnum.PROFILE_CREATION_FAILED
                callback(false, error.message ?: "Unknown error occurred")
            }
        }
    }

    private val _isAskingForPermissions = MutableLiveData<Boolean>(false)
    val isAskingForPermissions: LiveData<Boolean> = _isAskingForPermissions

    private val _askingForPermissionsStatus = MutableLiveData<PermissionsStatusEnum>(PermissionsStatusEnum.NOT_TRIED)
    val askingForPermissionsStatus: LiveData<PermissionsStatusEnum> = _askingForPermissionsStatus

    fun sendPermissionRequest(callback: (Boolean, String) -> Unit) {
        Log.d("Sending permission request", "Trying to send permission request")

        if (_isAskingForPermissions.value == true) return

        viewModelScope.launch {
            _isAskingForPermissions.value = true
            val tokenForPermissionsAndProfiles: String = _dataStorageDetails.value?.tokenForPermissionsAndProfiles ?: ""
            val ip: String = _dataStorageDetails.value?.ipAddress!!
            val port: String = _dataStorageDetails.value?.port!!

            val result = sendPermissionRequestToServer(ip, port, tokenForPermissionsAndProfiles)
            _isAskingForPermissions.value = false

            result.onSuccess { data ->
                saveDataStorageDetails()
                _askingForPermissionsStatus.value = PermissionsStatusEnum.PERMISSION_REQUEST_SENT
                callback(true, data)
            }.onFailure { error ->
                _askingForPermissionsStatus.value = PermissionsStatusEnum.PERMISSIONS_REQUEST_FAILED
                callback(false, error.message ?: "Unknown error occurred")
            }
        }
    }

    private val _isRegistrationSetupProperly = MutableLiveData<Boolean>(false)
    val isRegistrationSetupProperly: LiveData<Boolean> = _isRegistrationSetupProperly
    fun updateIsRegistrationSetupProperly(isProperlySetup: Boolean) {
        _isRegistrationSetupProperly.value = isProperlySetup
    }
    // data storage server - profile creation [END]

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

    private val _tempFilePath = MutableLiveData<String?>() // file path if it's requested to open dialog, otherwise null
    val tempFilePath: LiveData<String?> = _tempFilePath

    fun setTempFilePath(filePath: String) {
        _tempFilePath.value = filePath
    }

    // Reset the trigger to allow for future requests
    fun resetTempFilePath() {
        _tempFilePath.value = null
    }

    // csv exporting [end]

    init {
        loadDataStorageDetails()
        loadAppSettings()
        startPeriodicFetchingOfTheCountOfNotSyncedEvents()
    }

    private fun loadDataStorageDetails() {
        _dataStorageDetails.value = preferencesManager.loadDataStorageDetails()
    }

    fun saveDataStorageDetails() {
        if (_dataStorageDetails.value == null) return
        preferencesManager.saveDataStorageDetails(_dataStorageDetails.value!!)
    }

    private fun loadAppSettings() {
        _appSettings.value = preferencesManager.loadAppSettings()
    }

    fun saveAppSettings() {
        appSettings.value?.let { preferencesManager.saveAppSettings(it) }
    }


    private fun startPeriodicFetchingOfTheCountOfNotSyncedEvents() {
        viewModelScope.launch {
            while (isActive) { // isActive is a CoroutineScope extension property
                try {
                    updateNumberOfNotSynchronisedEvents(dbManager.getCountOfNotSynchronisedLocationsForSyncInfo())
//                    _syncInfo.value = dbManager.getSyncInfo()
                    Log.d("FETCHING", "FEEEEEEEEEEEEEEEEEEEEEEEEETCHING")
                } catch (e: Exception) {

                }
                delay(10000L)
            }
        }
    }

    // ---------------------------- EVENTS SYNCING [START]

    private val _progress = MutableStateFlow(0)
    val progress = _progress.asStateFlow()

    private val _lastSyncStatus = MutableStateFlow(EventsSyncingStatus.NOT_SYNCED_YET)
    val lastSyncStatus = _lastSyncStatus.asStateFlow()

    private val _syncCompletionTime = MutableStateFlow<Date?>(null)
    val syncCompletionTime = _syncCompletionTime.asStateFlow()

    fun startSyncing() {
        val request = OneTimeWorkRequestBuilder<SynchronisationWorker>().build()
        WorkManager.getInstance(application).enqueue(request)
        _lastSyncStatus.value = EventsSyncingStatus.SYNCING

        WorkManager.getInstance(application).getWorkInfoByIdLiveData(request.id).observeForever { workInfo ->
            when (workInfo?.state) {
                WorkInfo.State.RUNNING -> {
                    val progress = workInfo.progress.getInt(SynchronisationWorker.Progress, 0)
                    val numberOfSyncedEvents: Int = workInfo.progress.getInt(SynchronisationWorker.SyncedEvents, 0)
                    _progress.value = progress
                    updateNumberOfSynchronisedEvents(numberOfSyncedEvents)
                }
                WorkInfo.State.SUCCEEDED -> {
                    _lastSyncStatus.value = EventsSyncingStatus.SYNCED_SUCCESSFULLY
                    _syncCompletionTime.value = Date()
                    updateLastSynchronisation(Date())
                }
                WorkInfo.State.FAILED, WorkInfo.State.CANCELLED -> {
                    _lastSyncStatus.value = EventsSyncingStatus.SYNCHRONISATION_FAILED
                    _syncCompletionTime.value = Date()
                    updateLastSynchronisation(Date())
                }
                else -> {}
            }
        }

        viewModelScope.launch {
            SynchronisationWorker.syncProgress.collect {
                _progress.value = it
            }
        }
    }

    // ---------------------------- EVENTS SYNCING [END]

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
}