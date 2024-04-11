package com.example.locationtracker.foregroundServices.LocationTrackerService

import android.app.Activity
import android.content.Context
import android.content.Intent
import com.example.locationtracker.constants.LocationTrackerServiceParameters
import com.example.locationtracker.model.AppSettings
import com.example.locationtracker.model.DataStorageDetails
import com.example.locationtracker.model.SyncInfo
import com.example.locationtracker.utils.showAlertDialogWithOkButton
import com.example.locationtracker.viewModel.MainViewModel
import java.lang.ref.WeakReference

fun stopLocationGatheringServiceIfRunning(
    applicationContext: Context,
    viewModelRef: WeakReference<MainViewModel>,
) {
    val viewModel = viewModelRef.get() ?: return

    val appSettings = viewModel.appSettings.value

    val isServiceRunning = viewModel.serviceRunningLiveData.value ?: false

    if (!isServiceRunning) return

    toggleLocationGatheringService(
        isServiceRunning,
        applicationContext,
        appSettings,
        null
    )

    viewModel.showAlertDialogWithOkButton(
        "Location Tracker Service",
        "Location Tracking Service has been stopped."
    )
}

fun toggleLocationGatheringService(
    isServiceRunning: Boolean,
    applicationContext: Context,
    appSettings: AppSettings?,
    dataStorageDetails: DataStorageDetails?
) {
    val action = if (isServiceRunning) {
        LocationTrackerService.Actions.STOP.toString()
    } else {
        LocationTrackerService.Actions.START.toString()
    }

    Intent(applicationContext, LocationTrackerService::class.java).also { intent ->
        intent.action = action
        if (action == LocationTrackerService.Actions.START.toString()) {
            if (appSettings != null) {
                intent.putExtra(
                    LocationTrackerServiceParameters.LOCATION_TRACKER_SERVICE_START_TIME_PARAMETER,
                    appSettings.selectedStartTimeForLocationLogging.toString()
                )
                intent.putExtra(
                    LocationTrackerServiceParameters.LOCATION_TRACKER_SERVICE_END_TIME_PARAMETER,
                    appSettings.selectedEndTimeForLocationLogging.toString()
                )
                intent.putExtra(
                    LocationTrackerServiceParameters.LOCATION_TRACKER_SERVICE_AUTOMATIC_SYNC_PARAMETER,
                    appSettings.isAutoSyncToggled.toString()
                )
                if (dataStorageDetails != null) {
                    dataStorageDetails.networkSSID.let {
                        intent.putExtra(
                            LocationTrackerServiceParameters.LOCATION_TRACKER_SERVICE_NETWORK_NAME_PARAMETER,
                            dataStorageDetails.networkSSID
                        )
                    }
                }

            }
        }
        applicationContext.startForegroundService(intent)
    }
}

fun sendInfoToLocationTrackerServiceAboutAutomaticSynchronisation(
    applicationContext: Context,
    shouldSyncAutomatically: Boolean
) {
    val action = if (shouldSyncAutomatically) {
        LocationTrackerService.Actions.ENABLE_AUTOMATIC_SYNC.toString()
    } else {
        LocationTrackerService.Actions.DISABLE_AUTOMATIC_SYNC.toString()
    }

    Intent(applicationContext, LocationTrackerService::class.java).also { intent ->
        intent.action = action
        applicationContext.startForegroundService(intent)
    }
}