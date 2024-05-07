package com.example.locationtracker

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material.Icon
import androidx.compose.material.IconButton
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Settings
import androidx.compose.material3.Divider
import androidx.compose.runtime.State
import androidx.compose.runtime.getValue
import androidx.compose.runtime.livedata.observeAsState
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.colorResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.work.WorkInfo
import com.example.locationtracker.constants.ScreenName
import com.example.locationtracker.model.EmptyDataStorageDetails
import com.example.locationtracker.model.defaultSyncInfo
import com.example.locationtracker.screens.mainScreen.components.ActiveHoursSetter
import com.example.locationtracker.screens.mainScreen.components.AutoSyncSetter
import com.example.locationtracker.screens.mainScreen.components.BottomActionBar
import com.example.locationtracker.screens.mainScreen.components.DataStorageDetailsSection
import com.example.locationtracker.screens.mainScreen.components.SyncStatusCard
import com.example.locationtracker.viewModel.DataStorageRegistrationViewModel
import com.example.locationtracker.viewModel.MainViewModel
import java.lang.ref.WeakReference

@Composable
fun MainScreen(
    viewModelRef: WeakReference<MainViewModel>,
    dataStorageRegistrationViewModelRef: WeakReference<DataStorageRegistrationViewModel>,
    navigateToScreenHandler: (ScreenName: String, canUserNavigateBack: Boolean) -> Unit
) {

    val viewModel = viewModelRef.get()
    val dataStorageRegistrationViewModel = dataStorageRegistrationViewModelRef.get()

    // viewModel is null because it has been garbage collected
    if (viewModel == null || dataStorageRegistrationViewModel == null) {
        Text(text = stringResource(id = R.string.view_models_not_available), color = Color.Red)
        return
    }


    val dataStorageDetails by dataStorageRegistrationViewModel.dataStorageDetails.observeAsState(
        EmptyDataStorageDetails
    )

    val csvExportingWorkInfoObservedAsState: State<WorkInfo?> = viewModel.csvExportingWorkInfo.observeAsState()
    val syncInfo by viewModel.syncInfo.observeAsState(defaultSyncInfo)

    val appSettings by viewModel.appSettings.observeAsState()

    val isServiceRunning by viewModel.serviceRunningLiveData.observeAsState(false)

    Column(Modifier.background(Color.White)) {

        Box(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(0.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                SyncStatusCard(syncInfo)

                LazyColumn() {
                    item {
                        Box() {
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(horizontal = 16.dp, vertical = 8.dp),
                                horizontalAlignment = Alignment.Start
                            ) {
                                Text(
                                    text = stringResource(id = R.string.settings),
                                    fontSize = 24.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color.Black
                                )
                                Divider(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .height(1.dp)
                                )
                                Spacer(modifier = Modifier.height(10.dp))

                                ActiveHoursSetter(
                                    appSettings,
                                    viewModel::updateAppSettingsStartTime,
                                    viewModel::updateAppSettingsEndTime,
                                    isServiceRunning
                                )

                                AutoSyncSetter(
                                    appSettings,
                                    dataStorageDetails,
                                    isServiceRunning,
                                    viewModel::updateAppSettingsAutoSync,
                                    viewModel::showAlertDialogWithOkButton
                                )

                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Text(
                                        text = stringResource(id = R.string.network_for_synchronisation),
                                        fontSize = 16.sp
                                    )
                                    IconButton(onClick = { navigateToScreenHandler(ScreenName.SETTINGS_SCREEN_FOR_REGISTERED_APP, true) }) {
                                        Icon(
                                            imageVector = Icons.Outlined.Settings,
                                            contentDescription = stringResource(id = R.string.settings),
                                            tint = colorResource(id = R.color.gray_light4)
                                        )
                                    }
                                }
                                DataStorageDetailsSection(dataStorageDetails)
                            }
                        }
                    }
                }
            }
        }

        BottomActionBar(
            csvExportingWorkInfoObservedAsState,
            initiateExportCsvHandler = { viewModel.exportData() },
            openFilePickerForGeneratedCsv = {filePath: String -> viewModel.setTempFilePath(filePath) },
            syncInfo,
            startSyncingData = { viewModel.startSynchronisingGatheredData() },
            isServiceRunning,
            navigateToScreenHandler,
            appSettings,
            dataStorageDetails
        )
    }
}