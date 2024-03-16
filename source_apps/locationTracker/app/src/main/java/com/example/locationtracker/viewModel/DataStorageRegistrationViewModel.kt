package com.example.locationtracker.viewModel

import android.app.AlertDialog
import android.app.Application
import android.util.Log
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.viewModelScope
import com.example.locationtracker.R
import com.example.locationtracker.constants.App
import com.example.locationtracker.constants.DataStorageRelated.UNIQUE_LOCATION_PROFILE_NAME
import com.example.locationtracker.data.PreferencesManager
import com.example.locationtracker.eventSynchronisation.associateAppWithDataStorageAppHolder
import com.example.locationtracker.eventSynchronisation.isDataStorageServerReachable
import com.example.locationtracker.eventSynchronisation.registerNewProfileToDataStorage
import com.example.locationtracker.eventSynchronisation.sendPermissionRequestToServer
import com.example.locationtracker.model.DataStorageDetails
import com.example.locationtracker.model.EmptyDataStorageDetails
import com.example.locationtracker.utils.loadJsonSchemaFromRes
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

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


class DataStorageRegistrationViewModel(private val application: Application, private val preferencesManager: PreferencesManager): AndroidViewModel(application) {
    private fun saveDataStorageDetails() {
        if (_dataStorageDetails.value == null) return
        preferencesManager.saveDataStorageDetails(_dataStorageDetails.value!!)
    }

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

    private val _isRegisteringLocationProfile = MutableLiveData<Boolean>(false)
    val isRegisteringLocationProfile: LiveData<Boolean> = _isRegisteringLocationProfile

    private val _appProfileRegistrationStatus = MutableLiveData<ProfileRegistrationStatusEnum>(ProfileRegistrationStatusEnum.NOT_TRIED)
    val appProfileRegistrationStatus: LiveData<ProfileRegistrationStatusEnum> = _appProfileRegistrationStatus

    private val _isAskingForPermissions = MutableLiveData<Boolean>(false)
    val isAskingForPermissions: LiveData<Boolean> = _isAskingForPermissions

    private val _askingForPermissionsStatus = MutableLiveData<PermissionsStatusEnum>(PermissionsStatusEnum.NOT_TRIED)
    val askingForPermissionsStatus: LiveData<PermissionsStatusEnum> = _askingForPermissionsStatus

    private val _isRegistrationSetupProperly = MutableLiveData<Boolean>(false)

    init {
        loadDataStorageDetails()
    }

    private fun loadDataStorageDetails() {
        _dataStorageDetails.value = preferencesManager.loadDataStorageDetails()
    }

    fun saveViewModel() {
        saveDataStorageDetails()
    }


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

    fun registerLocationProfileInDataStorageServer(callback: (Boolean, String) -> Unit) {
        val jsonSchema = loadJsonSchemaFromRes(
            context = application,
            resourceId = R.raw.location_profile_for_data_storage
        )

        Log.d("Registering (viewmode)", "Trying to register profile")

        if (_isRegisteringLocationProfile.value == true) return

        viewModelScope.launch {
            _isRegisteringLocationProfile.value = true
            val tokenForPermissionsAndProfiles: String = _dataStorageDetails.value?.tokenForPermissionsAndProfiles ?: ""
            val ip: String = _dataStorageDetails.value?.ipAddress!!
            val port: String = _dataStorageDetails.value?.port!!

            val result = registerNewProfileToDataStorage(ip, port, tokenForPermissionsAndProfiles, UNIQUE_LOCATION_PROFILE_NAME, jsonSchema)
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


    // data storage server - profile creation [END]

    fun setDataStorageNetworkSSID(ssid: String?) {
        val currentDetails = _dataStorageDetails.value ?: EmptyDataStorageDetails
        _dataStorageDetails.value = currentDetails.copy(networkSSID = ssid)
    }

    public fun setIsAppProperlyRegistered(isProperlyRegistered: Boolean) {
        preferencesManager.setIsAppProperlyRegistered(true)
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

}