package com.example.locationtracker.foregroundServices.LocationTrackerService

import android.app.Activity
import android.content.Context
import android.content.Intent
import androidx.compose.runtime.getValue
import androidx.compose.runtime.livedata.observeAsState
import com.example.locationtracker.model.AppSettings
import com.example.locationtracker.utils.showAlertDialogWithOkButton
import com.example.locationtracker.viewModel.MainViewModel

fun stopLocationGatheringServiceIfRunning(
    applicationContext: Context,
    viewModel: MainViewModel,
    activity: Activity
) {
    val appSettings = viewModel.appSettings.value

    val isServiceRunning = viewModel.serviceRunningLiveData.value ?: false

    if (!isServiceRunning) return

    toggleLocationGatheringService(isServiceRunning, applicationContext, appSettings)

    showAlertDialogWithOkButton(
        activity,
        "Location Tracker Service",
        "Location Tracking Service has been stopped."
    )
}

fun toggleLocationGatheringService(
    isServiceRunning: Boolean,
    applicationContext: Context,
    appSettings: AppSettings?
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
                    "startTime",
                    appSettings.selectedStartTimeForLocationLogging.toString()
                )
                intent.putExtra("endTime", appSettings.selectedEndTimeForLocationLogging.toString())
            }
        }

        applicationContext.startForegroundService(intent)
    }
}