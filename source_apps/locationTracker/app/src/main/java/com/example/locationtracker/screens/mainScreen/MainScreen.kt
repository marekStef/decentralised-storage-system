package com.example.locationtracker

import android.Manifest
import android.app.Activity
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.provider.Settings
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
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
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.Icon
import androidx.compose.material.IconButton
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Settings
import androidx.compose.material3.Divider
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.livedata.observeAsState
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.colorResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.app.ActivityCompat.shouldShowRequestPermissionRationale
import androidx.core.content.ContextCompat
import androidx.navigation.NavController
import com.example.locationtracker.constants.ScreensNames
import com.example.locationtracker.foregroundServices.LocationTrackerService.sendInfoToLocationTrackerServiceAboutAutomaticSynchronisation
import com.example.locationtracker.foregroundServices.LocationTrackerService.stopLocationGatheringServiceIfRunning
import com.example.locationtracker.model.EmptyDataStorageDetails
import com.example.locationtracker.screens.mainScreen.components.FineLocationPermissionTextProvider
import com.example.locationtracker.screens.mainScreen.components.PermissionDialog
import com.example.locationtracker.screens.mainScreen.components.BackgroundLocationPermissionTextProvider
import com.example.locationtracker.screens.mainScreen.components.BottomActionBar
import com.example.locationtracker.screens.mainScreen.components.CoarseLocationPermissionTextProvider
import com.example.locationtracker.screens.mainScreen.components.SyncStatusCard
import com.example.locationtracker.screens.mainScreen.components.TimeSetter
import com.example.locationtracker.utils.showAlertDialogWithOkButton
import com.example.locationtracker.viewModel.DataStorageRegistrationViewModel
import com.example.locationtracker.viewModel.MainViewModel

@Composable
fun MainScreen(
    navController: NavController,
    viewModel: MainViewModel,
    dataStorageRegistrationViewModel: DataStorageRegistrationViewModel,
    applicationContext: Context,
    activity: Activity
) {

    val dataStorageDetails by dataStorageRegistrationViewModel.dataStorageDetails.observeAsState(EmptyDataStorageDetails)

    val context = LocalContext.current
    val dialoPermissionsQueue = viewModel.visiblePermissionDialogQueue
    val permissionsToRequest = arrayOf(
        Manifest.permission.ACCESS_COARSE_LOCATION,
        Manifest.permission.ACCESS_FINE_LOCATION,
        Manifest.permission.ACCESS_BACKGROUND_LOCATION
    )

    val appSettings by viewModel.appSettings.observeAsState()

    val isServiceRunning by viewModel.serviceRunningLiveData.observeAsState(false)

//    val FineLocationPermissionResultLauncher = rememberLauncherForActivityResult(
//        contract = ActivityResultContracts.RequestPermission(),
//        onResult = {isGranted ->
//            viewModel.onPermissionResult(
//                permission = Manifest.permission.ACCESS_FINE_LOCATION,
//                isGranted = isGranted
//            )
//        }
//    )


    val multiplePermissionResultLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestMultiplePermissions(),
        onResult = { permissions ->
            permissionsToRequest.forEach { permission ->
                viewModel.onPermissionResult(
                    permission = permission,
                    isGranted = permissions[permission] == true
                )
            }
        }
    )

    LaunchedEffect(key1 = Unit) { // Unit for key1 so this only launches once when the Composable enters the composition
        val allPermissionsGranted =
            permissionsToRequest.all { permission -> // Determine if permissions are already granted
                ContextCompat.checkSelfPermission(
                    context,
                    permission
                ) == PackageManager.PERMISSION_GRANTED
            }

        // If not all permissions are granted, launch the permission request
        if (!allPermissionsGranted) {
            multiplePermissionResultLauncher.launch(permissionsToRequest)
        }
    }

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
                SyncStatusCard(viewModel)

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
                                    text = "Settings",
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

                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Text(
                                        text = "Active Hours",
                                        fontSize = 16.sp,
                                        modifier = Modifier.weight(1f)
                                    )

                                    TimeSetter(
                                        context,
                                        appSettings?.selectedStartTimeForLocationLogging
                                    ) {
                                        viewModel.updateAppSettingsStartTime(it)
                                        stopLocationGatheringServiceIfRunning(
                                            applicationContext,
                                            viewModel,
                                        )
                                    }

                                    Spacer(modifier = Modifier.width(5.dp))

                                    TimeSetter(
                                        context,
                                        appSettings?.selectedEndTimeForLocationLogging
                                    ) {
                                        viewModel.updateAppSettingsEndTime(it)
                                        stopLocationGatheringServiceIfRunning(
                                            applicationContext,
                                            viewModel,
                                        )
                                    }
                                }

                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Column(modifier = Modifier.weight(1f)) {
                                        Row {
                                            Text(
                                                text = "Auto Sync",
                                                fontSize = 16.sp,
                                                modifier = Modifier.weight(1f)
                                            )
                                        }
                                        Row {
                                            Text(
                                                text = "App will try to sync locations once per 24 hours",
                                                fontSize = 10.sp,
                                                modifier = Modifier.weight(1f)
                                            )
                                        }
                                    }


                                    Switch(
                                        checked = appSettings?.isAutoSyncToggled ?: false,
                                        onCheckedChange = { isChecked: Boolean ->
                                            if (dataStorageRegistrationViewModel.dataStorageDetails.value == null || dataStorageRegistrationViewModel.dataStorageDetails.value!!.networkSSID == null) {
                                                showAlertDialogWithOkButton(activity, "Cannot Set AutoSync", "Autosync cannot be turned on - you need to specifiy network SSID in the settings first")
                                                return@Switch
                                            }
                                            viewModel.updateAppSettingsAutoSync(isChecked)
                                            if (isServiceRunning)
                                                sendInfoToLocationTrackerServiceAboutAutomaticSynchronisation(applicationContext, isChecked)
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

                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Text(
                                        text = "Network for synchronisation",
                                        fontSize = 16.sp,
//                                        modifier = Modifier.weight(1f)
                                    )

                                    IconButton(onClick = { navController.navigate(ScreensNames.SETTINGS_SCREEN_FOR_REGISTERED_APP) }) {
                                        Icon(
                                            imageVector = Icons.Outlined.Settings,
                                            contentDescription = "Settings",
                                            tint = colorResource(id = R.color.gray_light4)
                                        )
                                    }
                                }

                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(start = 20.dp)
                                ) {
                                    Column {


                                        Row(verticalAlignment = Alignment.CenterVertically) {
                                            Text(
                                                text = "Network name (SSID): ",
                                                fontSize = 12.sp,
                                                modifier = Modifier.weight(1f)
                                            )

                                            Text(
                                                text = dataStorageDetails?.networkSSID ?: "Not Set",
                                                fontSize = 12.sp,
                                                fontWeight = FontWeight.Light,
                                                modifier = Modifier
                                                    .clip(RoundedCornerShape(10.dp))
                                                    .background(colorResource(id = R.color.gray_light1))
                                                    .padding(horizontal = 10.dp, vertical = 5.dp),
                                            )
                                        }

                                        Spacer(modifier = Modifier.height(3.dp))

                                        Row(verticalAlignment = Alignment.CenterVertically) {
                                            Text(
                                                text = "Server address",
                                                fontSize = 12.sp,
                                                modifier = Modifier.weight(1f)
                                            )

                                            Text(
                                                text = dataStorageDetails?.ipAddress ?: "No Ip",
                                                fontSize = 12.sp,
                                                fontWeight = FontWeight.Light,
                                                modifier = Modifier
                                                    .clip(RoundedCornerShape(10.dp))
                                                    .background(colorResource(id = R.color.gray_light1))
                                                    .padding(horizontal = 10.dp, vertical = 5.dp),
                                            )
                                        }

                                        Spacer(modifier = Modifier.height(3.dp))

                                        Row(verticalAlignment = Alignment.CenterVertically) {
                                            Text(
                                                text = "Server port",
                                                fontSize = 12.sp,
                                                modifier = Modifier.weight(1f)
                                            )

                                            Text(
                                                text = dataStorageDetails?.port ?: "No Port",
                                                fontSize = 12.sp,
                                                fontWeight = FontWeight.Light,
                                                modifier = Modifier
                                                    .clip(RoundedCornerShape(10.dp))
                                                    .background(colorResource(id = R.color.gray_light1))
                                                    .padding(horizontal = 10.dp, vertical = 5.dp),
                                            )
                                        }

                                        Spacer(modifier = Modifier.height(3.dp))

                                        Row(verticalAlignment = Alignment.CenterVertically) {
                                            Text(
                                                text = "Association Token Used",
                                                fontSize = 12.sp,
                                                modifier = Modifier.weight(1f)
                                            )

                                            Text(
                                                text = dataStorageDetails?.associationTokenUsedDuringRegistration
                                                    ?: "No Token",
                                                fontSize = 12.sp,
                                                fontWeight = FontWeight.Light,
                                                modifier = Modifier
                                                    .clip(RoundedCornerShape(10.dp))
                                                    .background(colorResource(id = R.color.gray_light1))
                                                    .padding(horizontal = 10.dp, vertical = 5.dp),
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            dialoPermissionsQueue
                .reversed()
                .forEach { permission ->
                    PermissionDialog(
                        permissionTextProvider = when (permission) {
                            Manifest.permission.ACCESS_COARSE_LOCATION -> CoarseLocationPermissionTextProvider()
                            Manifest.permission.ACCESS_FINE_LOCATION -> FineLocationPermissionTextProvider()
                            Manifest.permission.ACCESS_BACKGROUND_LOCATION -> BackgroundLocationPermissionTextProvider()
                            else -> return@forEach
                        },
                        isPermanentlyDeclined = !shouldShowRequestPermissionRationale(
                            activity,
                            permission
                        ),
                        onDismiss = { viewModel.dismissDialog() },
                        onOkClick = {
                            viewModel.dismissDialog()
                            multiplePermissionResultLauncher.launch(
                                permissionsToRequest
                            )
                        },
                        onGoToAppSettingsClick = {
                            openAppSettings(activity)
                        })
                }
        }
        BottomActionBar(activity, viewModel, navController, applicationContext, appSettings, dataStorageDetails)
    }
}

fun openAppSettings(activity: Activity) {
    val intent = Intent(
        Settings.ACTION_APPLICATION_DETAILS_SETTINGS,
        Uri.fromParts("package", activity.packageName, null)
    )
    activity.startActivity(intent)
}