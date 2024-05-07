package com.example.locationtracker.screens.mainScreen.components

import android.content.Context
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.wrapContentSize
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.State
import androidx.compose.runtime.getValue
import androidx.compose.runtime.livedata.observeAsState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.colorResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.LiveData
import androidx.navigation.NavController
import androidx.work.WorkInfo
import com.example.locationtracker.R
import com.example.locationtracker.constants.ScreenName
import com.example.locationtracker.foregroundServices.LocationTrackerService.toggleLocationGatheringService
import com.example.locationtracker.model.AppSettings
import com.example.locationtracker.model.DataStorageDetails
import com.example.locationtracker.model.SyncInfo
import com.example.locationtracker.viewModel.MainViewModel
import java.lang.ref.WeakReference

@Composable
fun BottomActionBar(
    csvExportWorkInfo: State<WorkInfo?>,
    initiateExportCsvHandler: () -> Unit,
    openFilePickerForGeneratedCsv: (generatedCsvFilePath: String) -> Unit,
    syncInfo: SyncInfo,
    startSyncingData: () -> Unit,
    isServiceRunning: Boolean,
    navigateToScreenHandler: (ScreenName: String, canUserNavigateBack: Boolean) -> Unit,
    appSettings: AppSettings?,
    dataStorageDetails: DataStorageDetails,
) {
    Column(
        modifier = Modifier
            .wrapContentSize()
            .padding(start = 5.dp, end = 5.dp),
        verticalArrangement = Arrangement.Bottom,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Row() {
            SynchronisationComponent(syncInfo, startSyncingData)
        }
        Row(
            modifier = Modifier
                .fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {

            Button(
                modifier = Modifier
                    .padding(0.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = colorResource(id = R.color.gray_light2),
                    contentColor = Color.DarkGray
                ),
                onClick = { navigateToScreenHandler(ScreenName.LOG_SCREEN, true) }) {
                Text(
                    stringResource(id = R.string.show_data),
                    style = TextStyle(
                        fontSize = 11.sp
                    )
                )
            }

            ExportButton(csvExportWorkInfo, initiateExportCsvHandler, openFilePickerForGeneratedCsv)

            ServiceControlButton(appSettings, dataStorageDetails, isServiceRunning)
        }
    }
}

@Composable
fun ServiceControlButton(
    appSettings: AppSettings?,
    dataStorageDetails: DataStorageDetails,
    isServiceRunning: Boolean
) {
    val localContext: Context = LocalContext.current

    Button(
        modifier = Modifier
            .padding(0.dp),
        colors = ButtonDefaults.buttonColors(
            containerColor = colorResource(id = R.color.gray_light2),
            contentColor = Color.DarkGray
        ),
        onClick = {
            toggleLocationGatheringService(
                isServiceRunning,
                localContext,
                appSettings,
                dataStorageDetails
            )
        }) {
        Text(
            if (isServiceRunning) stringResource(id = R.string.stop_service) else stringResource(id = R.string.start_service),
            style = TextStyle(
                fontSize = 11.sp
            )
        )
    }
}