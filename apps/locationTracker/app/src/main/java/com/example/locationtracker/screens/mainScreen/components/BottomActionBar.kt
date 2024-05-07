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
import androidx.navigation.NavController
import com.example.locationtracker.R
import com.example.locationtracker.constants.ScreenName
import com.example.locationtracker.foregroundServices.LocationTrackerService.toggleLocationGatheringService
import com.example.locationtracker.model.AppSettings
import com.example.locationtracker.model.DataStorageDetails
import com.example.locationtracker.viewModel.MainViewModel
import java.lang.ref.WeakReference

@Composable
fun BottomActionBar(
    viewModelRef: WeakReference<MainViewModel>,
    navigateToScreenHandler: (ScreenName: String, canUserNavigateBack: Boolean) -> Unit,
    appSettings: AppSettings?,
    dataStorageDetails: DataStorageDetails
) {
    // This Column aligns the buttons to the bottom
    Column(
        modifier = Modifier
            .wrapContentSize()
            .padding(start = 5.dp, end = 5.dp),
        verticalArrangement = Arrangement.Bottom,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Row() {
            SynchronisationComponent(viewModelRef)
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

            ExportButton(viewModelRef)

            ServiceControlButton(viewModelRef, appSettings, dataStorageDetails)
        }

//            }
//                Row(
//                    modifier = Modifier.fillMaxWidth(),
//                    horizontalArrangement = Arrangement.SpaceEvenly
//                ) {
////                    Button(onClick = {
////                        FineLocationPermissionTextProvider.launch(
////                            Manifest.permission.ACCESS_FINE_LOCATION
////                        )
////                    }) {
////                        Text("Request 1 permission")
////                    }
//                    Button(onClick = {
//
//                    }) {
//                        Text("Request multiple permissions")
//                    }
//                }
    }
}

@Composable
fun ServiceControlButton(
    viewModelRef: WeakReference<MainViewModel>,
    appSettings: AppSettings?,
    dataStorageDetails: DataStorageDetails
) {
    val localContext: Context = LocalContext.current

    val viewModel = viewModelRef.get() ?: return

    val isServiceRunning by viewModel.serviceRunningLiveData.observeAsState(false)

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