package com.example.locationtracker

import android.Manifest
import android.app.Activity
import android.app.TimePickerDialog
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.provider.Settings
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.wrapContentSize
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.Icon
import androidx.compose.material.IconButton
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.outlined.Settings
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Divider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.livedata.observeAsState
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.colorResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.app.ActivityCompat.shouldShowRequestPermissionRationale
import androidx.core.content.ContextCompat
import androidx.navigation.NavController
import com.example.locationtracker.foregroundServices.LocationTrackerService
import com.example.locationtracker.model.SyncInfo
import com.example.locationtracker.screens.mainScreen.components.FineLocationPermissionTextProvider
import com.example.locationtracker.screens.mainScreen.components.PermissionDialog
import com.example.locationtracker.screens.mainScreen.components.BackgroundLocationPermissionTextProvider
import com.example.locationtracker.screens.mainScreen.components.CoarseLocationPermissionTextProvider
import com.example.locationtracker.screens.mainScreen.components.SyncStatusCard
import com.example.locationtracker.viewModel.MainViewModel
import java.util.Calendar


@Composable
fun MainScreen(
    navController: NavController,
    viewModel: MainViewModel,
    applicationContext: Context,
    activity: Activity
) {
    // Observe SyncInfo from the ViewModel
    val syncInfo by viewModel.syncInfo.observeAsState()

    val context = LocalContext.current
    val dialoPermissionsQueue = viewModel.visiblePermissionDialogQueue
    val permissionsToRequest = arrayOf(
        Manifest.permission.ACCESS_COARSE_LOCATION,
        Manifest.permission.ACCESS_FINE_LOCATION,
        Manifest.permission.ACCESS_BACKGROUND_LOCATION
    )

    val selectedStartTimeForLocationLogging by viewModel.selectedStartTimeForLocationLogging.observeAsState()
    val selectedEndTimeForLocationLogging by viewModel.selectedEndTimeForLocationLogging.observeAsState()

    val isAutoSyncToggled by viewModel.isAutoSyncToggled.observeAsState(false)

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

//    syncInfo?.let { info: SyncInfo ->
//        SyncStatusCard(syncInfo = info)
//    }
    Box( Modifier.background(Color.White)) {
        LazyColumn() {
            item {


                Box(
                    modifier = Modifier
                        .fillMaxWidth()

                    // Apply the vertical gradient from top to bottom
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(0.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {


                        syncInfo?.let { SyncStatusCard(it) }

                        Box() {
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(16.dp),
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
                                    verticalAlignment = Alignment.CenterVertically, // This will align the children of the Row vertically to the center
                                    modifier = Modifier.fillMaxWidth() // This will make the Row take the full width of its parent
                                ) {
                                    Text(
                                        text = "Active Hours",
                                        fontSize = 16.sp,
                                        modifier = Modifier.weight(1f)
                                    )
                                    Button(
                                        onClick = {
                                            val calendar = Calendar.getInstance()
                                            TimePickerDialog(
                                                context,
                                                { _, hourOfDay, minute ->
                                                    viewModel.updateStartTimeForLocationLogging(
                                                        hourOfDay,
                                                        minute
                                                    )
                                                },
                                                calendar.get(Calendar.HOUR_OF_DAY),
                                                calendar.get(Calendar.MINUTE),
                                                true // 24-hour time
                                            ).show()
                                        },
                                        modifier = Modifier.padding(1.dp),
                                        shape = RoundedCornerShape(4.dp),
                                        colors = ButtonDefaults.buttonColors(
                                            containerColor = colorResource(id = R.color.gray_light1),
                                            contentColor = colorResource(id = R.color.gray_light7)
                                        ),
                                        contentPadding = PaddingValues(
                                            start = 13.dp,
                                            top = 0.dp,
                                            end = 13.dp,
                                            bottom = 0.dp
                                        ),
                                    ) {
                                        Text(
                                            text = selectedStartTimeForLocationLogging?.toString()
                                                ?: "Set Time"
                                        )
                                    }
                                    
                                    Spacer(modifier = Modifier.width(5.dp))

                                    Button(
                                        onClick = {
                                            val calendar = Calendar.getInstance()
                                            TimePickerDialog(
                                                context,
                                                { _, hourOfDay, minute ->
                                                    viewModel.updateEndTimeForLocationLogging(
                                                        hourOfDay,
                                                        minute
                                                    )
                                                },
                                                calendar.get(Calendar.HOUR_OF_DAY),
                                                calendar.get(Calendar.MINUTE),
                                                true // 24-hour time
                                            ).show()
                                        },
                                        modifier = Modifier.padding(1.dp),
                                        shape = RoundedCornerShape(4.dp),
                                        colors = ButtonDefaults.buttonColors(
                                            containerColor = colorResource(id = R.color.gray_light1),
                                            contentColor = colorResource(id = R.color.gray_light7),
                                        ),
                                        contentPadding = PaddingValues(
                                            start = 13.dp,
                                            top = 0.dp,
                                            end = 13.dp,
                                            bottom = 0.dp
                                        ),
                                    ) {
                                        Text(
                                            text = selectedEndTimeForLocationLogging?.toString()
                                                ?: "Set Time"
                                        )
                                    }
                                }

                                Row(
                                    verticalAlignment = Alignment.CenterVertically, // This will align the children of the Row vertically to the center
                                    modifier = Modifier.fillMaxWidth() // This will make the Row take the full width of its parent
                                ) {
                                    Text(
                                        text = "Auto Sync",
                                        fontSize = 16.sp,
                                        modifier = Modifier.weight(1f)
                                    )

                                    Switch(
                                        checked = isAutoSyncToggled,
                                        onCheckedChange = { isChecked: Boolean ->
                                            viewModel.toggleAutoSync(
                                                isChecked
                                            )
                                        },
                                        colors = SwitchDefaults.colors(
                                            checkedThumbColor = colorResource(id = R.color.gray_light5),
                                            uncheckedThumbColor = colorResource(id = R.color.gray_light7),
                                            checkedTrackColor = colorResource(id = R.color.gray_green1).copy(alpha = 0.7f), // Optional: Track color when switch is ON
                                            uncheckedTrackColor = colorResource(id = R.color.gray_light1).copy(alpha = 0.3f), // Optional: Track color when switch is OFF
                                        )
                                    )
                                }

                                Row (verticalAlignment = Alignment.CenterVertically) {
                                    Text(
                                        text = "Network for synchronisation",
                                        fontSize = 16.sp,
//                                        modifier = Modifier.weight(1f)
                                    )

                                    IconButton(onClick = { navController.navigate("registrationScreen") }) {
                                        Icon(
                                            imageVector = Icons.Outlined.Settings,
                                            contentDescription = "Delete All Locations",
                                            tint = colorResource(id = R.color.gray_light4)
                                        )
                                    }
                                }

                                Row(
                                    verticalAlignment = Alignment.CenterVertically, // This will align the children of the Row vertically to the center
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(start = 20.dp)// This will make the Row take the full width of its parent
                                ) {
                                    Column {



                                        Row (verticalAlignment = Alignment.CenterVertically){
                                            Text(
                                                text = "Network name (SSID): ",
                                                fontSize = 12.sp,
                                                modifier = Modifier.weight(1f)
                                            )

                                            Text(
                                                text = "alsdkfj223",
                                                fontSize = 12.sp,
                                                fontWeight = FontWeight.Light,
                                                modifier = Modifier
                                                    .clip(RoundedCornerShape(10.dp))
                                                    .background(colorResource(id = R.color.gray_light1))
                                                    .padding(horizontal = 10.dp, vertical = 5.dp),
                                            )
                                        }
                                        
                                        Spacer(modifier = Modifier.height(3.dp))

                                        Row (verticalAlignment = Alignment.CenterVertically){
                                            Text(
                                                text = "Server address",
                                                fontSize = 12.sp,
                                                modifier = Modifier.weight(1f)
                                            )

                                            Text(
                                                text = "192.168.102",
                                                fontSize = 12.sp,
                                                fontWeight = FontWeight.Light,
                                                modifier = Modifier
                                                    .clip(RoundedCornerShape(10.dp))
                                                    .background(colorResource(id = R.color.gray_light1))
                                                    .padding(horizontal = 10.dp, vertical = 5.dp),
                                            )
                                        }

                                        Spacer(modifier = Modifier.height(3.dp))

                                        Row (verticalAlignment = Alignment.CenterVertically){
                                            Text(
                                                text = "Server port",
                                                fontSize = 12.sp,
                                                modifier = Modifier.weight(1f)
                                            )

                                            Text(
                                                text = "3000",
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
            }
        }
        // This Column aligns the buttons to the bottom
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(bottom = 10.dp, start = 30.dp, end = 30.dp),
            verticalArrangement = Arrangement.Bottom,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
//            Box(modifier = Modifier.fillMaxWidth()
//                .wrapContentSize()
//                .padding(12.dp)
//
//            ) {
            Row() {
                Button(modifier = Modifier.fillMaxWidth().padding(0.dp),
                    shape = RoundedCornerShape(16.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = colorResource(id = R.color.green0),
                        contentColor = colorResource(id = R.color.green3)
                    ),
                    onClick = {
                    val updatedSyncInfo = SyncInfo(
                        lastSync = "New Sync Time",
                        eventsNotSynced = 1234,
                        oldestEventTimeNotSynced = "New Oldest Event Time",
                        totalEvents = 987654321
                    )

                    viewModel.updateSyncInfo(updatedSyncInfo) // Call the function in the ViewModel to handle the sync event
                }) {
                    Text("Sync Now")
                }
            }
            Row(
                modifier = Modifier
                    .fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {

                Button(
                    modifier = Modifier
                        .shadow(
                            elevation = 15.dp,
                            spotColor = Color.LightGray,
                            shape = RoundedCornerShape(40.dp)
                        )
                        .padding(0.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = colorResource(id = R.color.gray_light2),
                        contentColor = Color.DarkGray
                    ),
                    onClick = { navController.navigate("logScreen") }) {
                    Text("Show Data")
                }
//                Spacer(modifier = Modifier.width(42.dp))
                ServiceControlButton(applicationContext, viewModel)
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
}


@Composable
fun ServiceControlButton(
    applicationContext: Context,
    viewModel: MainViewModel
) {
    val isServiceRunning by viewModel.serviceRunningLiveData.observeAsState(false)

    Button(
        modifier = Modifier
            .shadow(
                elevation = 15.dp,
                spotColor = Color.LightGray,
                shape = RoundedCornerShape(40.dp)
            )
            .padding(0.dp),
        colors = ButtonDefaults.buttonColors(
            containerColor = colorResource(id = R.color.gray_light2),
            contentColor = Color.DarkGray
        ),
        onClick = {
            val action = if (isServiceRunning) {
                LocationTrackerService.Actions.STOP.toString()
            } else {
                LocationTrackerService.Actions.START.toString()
            }

            Intent(applicationContext, LocationTrackerService::class.java).also { intent ->
                intent.action = action
                applicationContext.startForegroundService(intent)
            }

        }) {
        Text(if (isServiceRunning) "Stop Service" else "Start Service")
    }
}

fun openAppSettings(activity: Activity) {
    val intent = Intent(
        Settings.ACTION_APPLICATION_DETAILS_SETTINGS,
        Uri.fromParts("package", activity.packageName, null)
    )
    activity.startActivity(intent)
}

//@Preview
//@Composable
//fun PreviewLocationLoggerScreen(context: Context, applicationContext: Context, activity: Activity) {
//    val navController = rememberNavController()
//    val viewModel = MainViewModel(LogsManager.getInstance(context), PreferencesManager(context))
//
//    MainScreen(navController, viewModel, applicationContext, activity)
//}