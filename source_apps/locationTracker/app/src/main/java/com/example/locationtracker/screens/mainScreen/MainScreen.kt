package com.example.locationtracker

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material.Icon
import androidx.compose.material.IconButton
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Settings
import androidx.compose.material3.Divider
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.livedata.observeAsState
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.colorResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import androidx.navigation.NavController
import com.example.locationtracker.constants.ScreensNames
import com.example.locationtracker.model.EmptyDataStorageDetails
import com.example.locationtracker.screens.mainScreen.components.ActiveHoursSetter
import com.example.locationtracker.screens.mainScreen.components.AutoSyncSetter
import com.example.locationtracker.screens.mainScreen.components.FineLocationPermissionTextProvider
import com.example.locationtracker.screens.mainScreen.components.PermissionDialog
import com.example.locationtracker.screens.mainScreen.components.BackgroundLocationPermissionTextProvider
import com.example.locationtracker.screens.mainScreen.components.BottomActionBar
import com.example.locationtracker.screens.mainScreen.components.CoarseLocationPermissionTextProvider
import com.example.locationtracker.screens.mainScreen.components.DataStorageDetailsSection
import com.example.locationtracker.screens.mainScreen.components.SyncStatusCard
import com.example.locationtracker.viewModel.DataStorageRegistrationViewModel
import com.example.locationtracker.viewModel.MainViewModel
import java.lang.ref.WeakReference

@Composable
fun MainScreen(
    navController: NavController,
    viewModelRef: WeakReference<MainViewModel>,
    dataStorageRegistrationViewModelRef: WeakReference<DataStorageRegistrationViewModel>,
    applicationContext: Context,
    openAppSettings: () -> Unit,
    arePermissionsRequestsPermanentlyDeclined: (String) -> Boolean
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
                SyncStatusCard(viewModelRef)

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
                                    context,
                                    applicationContext,
                                    appSettings,
                                    viewModelRef
                                )

                                AutoSyncSetter(
                                    viewModelRef,
                                    appSettings,
                                    dataStorageDetails,
                                    dataStorageRegistrationViewModel,
                                    isServiceRunning,
                                    applicationContext
                                )

                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Text(
                                        text = stringResource(id = R.string.network_for_synchronisation),
                                        fontSize = 16.sp
                                    )
                                    IconButton(onClick = { navController.navigate(ScreensNames.SETTINGS_SCREEN_FOR_REGISTERED_APP) }) {
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
                        isPermanentlyDeclined = arePermissionsRequestsPermanentlyDeclined(permission),
                        onDismiss = { viewModel.dismissDialog() },
                        onOkClick = {
                            viewModel.dismissDialog()
                            multiplePermissionResultLauncher.launch(
                                permissionsToRequest
                            )
                        },
                        onGoToAppSettingsClick = { openAppSettings() })
                }
        }
        BottomActionBar(
            viewModelRef,
            navController,
            applicationContext,
            appSettings,
            dataStorageDetails
        )
    }
}