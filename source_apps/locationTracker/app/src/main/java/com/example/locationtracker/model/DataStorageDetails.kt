package com.example.locationtracker.model

data class DataStorageDetails(
    var port: String,
    var ipAddress: String,
    val networkSSID: String?,
    val latitude: Double?,
    val longitude: Double?,

    val associationTokenUsedDuringRegistration: String,
    val tokenForPermissionsAndProfiles: String?
)

val EmptyDataStorageDetails = DataStorageDetails("", "", null, null, null, "", null)