package com.example.locationtracker.screens.mainScreen.components

import android.content.Context
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.colorResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.sp
import com.example.locationtracker.R
import com.example.locationtracker.foregroundServices.LocationTrackerService.sendInfoToLocationTrackerServiceAboutAutomaticSynchronisation
import com.example.locationtracker.model.AppSettings
import com.example.locationtracker.model.DataStorageDetails
import com.example.locationtracker.model.EmptyDataStorageDetails

@Composable
fun AutoSyncSetter(
    appSettings: AppSettings?,
    dataStorageDetails: DataStorageDetails,
    isServiceRunning: Boolean,
    updateAppSettingsAutoSync: (Boolean) -> Unit,
    showAlertDialogWithOkButton: (String, String) -> Unit
) {
    val localContext: Context = LocalContext.current
    val cannotSetAutosyncTitle = stringResource(id = R.string.cannot_set_autosync_title)
    val autosyncErrorDetail = stringResource(id = R.string.autosync_cannot_be_turned_on_ssid_missing)

    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Row {
                Text(
                    text = stringResource(id = R.string.auto_sync),
                    fontSize = 16.sp,
                    modifier = Modifier.weight(1f)
                )
            }
            Row {
                Text(
                    text = stringResource(id = R.string.app_will_sync_every_24_hours),
                    fontSize = 10.sp,
                    modifier = Modifier.weight(1f)
                )
            }
        }


        Switch(
            checked = appSettings?.isAutoSyncToggled ?: false,
            onCheckedChange = { isChecked: Boolean ->
                if (dataStorageDetails == EmptyDataStorageDetails || dataStorageDetails.networkSSID == null) {
                    showAlertDialogWithOkButton(cannotSetAutosyncTitle, autosyncErrorDetail)
                    return@Switch
                }
                updateAppSettingsAutoSync(isChecked)
                if (isServiceRunning)
                    sendInfoToLocationTrackerServiceAboutAutomaticSynchronisation(localContext, isChecked)
            },
            colors = SwitchDefaults.colors(
                checkedThumbColor = colorResource(id = R.color.gray_light5),
                uncheckedThumbColor = colorResource(id = R.color.gray_light7),
                checkedTrackColor = colorResource(id = R.color.gray_green1).copy(
                    alpha = 0.7f
                ),
                uncheckedTrackColor = colorResource(id = R.color.gray_light1).copy(
                    alpha = 0.3f
                ),
            )
        )
    }
}