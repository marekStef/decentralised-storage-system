package com.example.locationtracker.screens.mainScreen.components

import android.content.Context
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.width
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.MutableLiveData
import com.example.locationtracker.R
import com.example.locationtracker.foregroundServices.LocationTrackerService.stopLocationGatheringServiceIfRunning
import com.example.locationtracker.model.AppSettings
import com.example.locationtracker.viewModel.MainViewModel
import java.lang.ref.WeakReference
import java.time.LocalTime

@Composable
fun ActiveHoursSetter(
    appSettings: AppSettings?,
    updateAppSettingsStartTime: (LocalTime) -> Unit,
    updateAppSettingsEndTime: (LocalTime) -> Unit,
    isLocationServiceRunning: Boolean
) {
    val context: Context = LocalContext.current

    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier.fillMaxWidth()
    ) {
        Text(
            text = stringResource(id = R.string.active_hours),
            fontSize = 16.sp,
            modifier = Modifier.weight(1f)
        )

        TimeSetter(
            context,
            appSettings?.selectedStartTimeForLocationLogging
        ) {
            updateAppSettingsStartTime(it)
            stopLocationGatheringServiceIfRunning(
                context,
                isLocationServiceRunning
            )
        }

        Spacer(modifier = Modifier.width(5.dp))

        TimeSetter(
            context,
            appSettings?.selectedEndTimeForLocationLogging
        ) {
            updateAppSettingsEndTime(it)
            stopLocationGatheringServiceIfRunning(
                context,
                isLocationServiceRunning
            )
        }
    }
}