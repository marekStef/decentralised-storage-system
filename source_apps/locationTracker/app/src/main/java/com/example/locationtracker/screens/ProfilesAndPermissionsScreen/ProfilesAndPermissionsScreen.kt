package com.example.locationtracker.screens.ProfilesAndPermissionsScreen

import android.app.Activity
import android.util.Log
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.Icon
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Cancel
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Divider
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.livedata.observeAsState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.colorResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.example.locationtracker.R
import com.example.locationtracker.constants.DataStorageRelated.UNIQUE_LOCATION_PROFILE_NAME
import com.example.locationtracker.utils.loadJsonSchemaFromRes
import com.example.locationtracker.utils.showAlertDialogWithOkButton
import com.example.locationtracker.viewModel.DataStorageRegistrationViewModel
import com.example.locationtracker.viewModel.MainViewModel
import com.example.locationtracker.viewModel.PermissionsStatusEnum
import com.example.locationtracker.viewModel.ProfileRegistrationStatusEnum
import com.example.locationtracker.viewModel.ServerReachabilityEnum

@Composable
fun ProfilesAndPermissionsScreen(
    navController: NavController,
    dataStorageRegistrationViewModel: DataStorageRegistrationViewModel,
    activity: Activity
) {
    val gradientColors = listOf(
        colorResource(id = R.color.header_background),
        colorResource(id = R.color.header_background_2)
    )

    val dataStorageDetails by dataStorageRegistrationViewModel.dataStorageDetails.observeAsState()

    val isRegisteringLocationProfile = dataStorageRegistrationViewModel.isRegisteringLocationProfile.observeAsState()
    val appProfileRegistrationStatus = dataStorageRegistrationViewModel.appProfileRegistrationStatus.observeAsState()

    val isAskingForPermissions = dataStorageRegistrationViewModel.isAskingForPermissions.observeAsState()
    val askingForPermissionsStatus = dataStorageRegistrationViewModel.askingForPermissionsStatus.observeAsState()

    val isRegistrationSetupProperly = dataStorageRegistrationViewModel.isRegistrationSetupProperly.observeAsState()
//
//    val isLoadingDataStorageServerReachability =
//        mainViewModel.isLoadingDataStorageServerReachability.observeAsState()

    Column(
        modifier = Modifier
            .fillMaxWidth(),

        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(0.dp)
                .background(Brush.verticalGradient(colors = gradientColors)),
        ) {
            Text(
                text = "Profiles and Permissions",
                modifier = Modifier
                    .padding(13.dp)
                    .fillMaxWidth(),
                textAlign = TextAlign.Center,
                fontSize = 32.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )
        }

//        Row (modifier = Modifier.fillMaxSize()){
//            Text("Registration Screen")
//            Button(onClick = { }) {
//                Text("Register")
//            }
//        }
        LazyColumn(contentPadding = PaddingValues(10.dp)) {

            item {
                Column(
                    modifier = Modifier
                        .fillMaxWidth(),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "Profiles registration",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.Black,
                        textAlign = TextAlign.Left,
                        modifier = Modifier.fillMaxWidth()
                    )
                    Divider(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(1.dp)
                            .background(colorResource(id = R.color.gray_light1))
                    )
                    Spacer(modifier = Modifier.height(20.dp))

                    Text(
                        text = "Profile being registered",
                        fontSize = 15.sp,
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(bottom = 5.dp)
                    )

                    Text(
                        text = UNIQUE_LOCATION_PROFILE_NAME,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Light,
                        modifier = Modifier
                            .clip(RoundedCornerShape(10.dp))
                            .background(colorResource(id = R.color.gray_light3))
                            .padding(horizontal = 10.dp, vertical = 5.dp),
                    )

                    Spacer(modifier = Modifier.height(20.dp))

                    Button(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(4.dp),
                        onClick = {
                            val jsonSchema = loadJsonSchemaFromRes(
                                context = activity,
                                resourceId = R.raw.location_profile_for_data_storage
                            )
                            dataStorageRegistrationViewModel.registerLocationProfileInDataStorageServer(jsonSchema) { isSuccess, message ->
                                if (isSuccess) {
                                    Log.d("Registering profile", "Success: $message")
                                    showAlertDialogWithOkButton(activity, "Success", message)
                                } else {
                                    Log.e("Registering profile", "Failure: $message")
                                    showAlertDialogWithOkButton(activity, "Error", message)
                                }
                            }
                            Log.d("JSON", jsonSchema)
                        }) {
                        Text("Register needed profiles")

                        if (isRegisteringLocationProfile.value == true)
                            CircularProgressIndicator()
                    }

                    Row(verticalAlignment = Alignment.CenterVertically) {
                        when {
                            isRegisteringLocationProfile.value == true -> CircularProgressIndicator()
                            appProfileRegistrationStatus.value == ProfileRegistrationStatusEnum.PROFILE_CREATION_FAILED -> Text("Profile creation failed")
                            appProfileRegistrationStatus.value == ProfileRegistrationStatusEnum.PROFILE_CREATED -> Text(
                                "Profile has been created"
                            )
                            else -> Text("You need to register profiles")
                        }
                        if (appProfileRegistrationStatus.value == ProfileRegistrationStatusEnum.PROFILE_CREATED) {
                            Icon(
                                imageVector = Icons.Filled.CheckCircle,
                                contentDescription = "Profiles created",
                                tint = colorResource(id = R.color.green3),
                                modifier = Modifier.padding(start = 4.dp)
                            )
                        } else {
                            Icon(
                                imageVector = Icons.Filled.Cancel,
                                contentDescription = "Profiles not created",
                                tint = Color.Red,
                                modifier = Modifier.padding(start = 4.dp)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(20.dp))

                    Text(
                        text = "Permissions Request",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.Black,
                        textAlign = TextAlign.Left,
                        modifier = Modifier.fillMaxWidth()
                    )
                    Divider(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(1.dp)
                            .background(colorResource(id = R.color.gray_light1))
                    )

                    Spacer(modifier = Modifier.height(20.dp))

                    Button(

                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(4.dp),
                        onClick = {
                            if (appProfileRegistrationStatus.value != ProfileRegistrationStatusEnum.PROFILE_CREATED) {
                                showAlertDialogWithOkButton(activity, "Error", "You need to register profiles first")
                                return@Button
                            }

                            dataStorageRegistrationViewModel.sendPermissionRequest() { isSuccess, message ->
                                if (isSuccess) {
                                    Log.d("Creating permission request", "Success: $message")
                                    showAlertDialogWithOkButton(
                                        activity,
                                        "Success",
                                        "Permission request has been sent. You need to approve it now before the app sends some data"
                                    )
                                } else {
                                    Log.e("Creating permission request", "Failure: $message")
                                    showAlertDialogWithOkButton(activity, "Error", message)
                                }
                            }
                        }) {
                        Text("Ask for permissions")
                    }

                    Row(verticalAlignment = Alignment.CenterVertically) {
                        when {
                            isAskingForPermissions.value == true -> CircularProgressIndicator()
                            askingForPermissionsStatus.value == PermissionsStatusEnum.PERMISSIONS_REQUEST_FAILED -> Text("Permissions sending failed")
                            askingForPermissionsStatus.value == PermissionsStatusEnum.PERMISSION_REQUEST_SENT -> Text(
                                "Permission request has been sent. \nNeeds to be approved in the admin centre."
                            )
                            else -> Text("You need to ask for data storage permissions")
                        }
                        if (askingForPermissionsStatus.value == PermissionsStatusEnum.PERMISSION_REQUEST_SENT) {
                            Icon(
                                imageVector = Icons.Filled.CheckCircle,
                                contentDescription = "Profiles created",
                                tint = colorResource(id = R.color.green3),
                                modifier = Modifier.padding(start = 4.dp)
                            )
                        } else {
                            Icon(
                                imageVector = Icons.Filled.Cancel,
                                contentDescription = "Profiles not created",
                                tint = Color.Red,
                                modifier = Modifier.padding(start = 4.dp)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(20.dp))

                    if (askingForPermissionsStatus.value == PermissionsStatusEnum.PERMISSION_REQUEST_SENT) {
                        Text(
                            text = "Welcome to you new app",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.Black,
                            textAlign = TextAlign.Left,
                            modifier = Modifier.fillMaxWidth()
                        )
                        Divider(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(1.dp)
                                .background(colorResource(id = R.color.gray_light1))
                        )
                        Spacer(modifier = Modifier.height(20.dp))


                        Text(
                            text = "Your app is prepared for its cooperation with DataStorage Server",
                            fontSize = 15.sp,
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(bottom = 5.dp)
                        )

                        Spacer(modifier = Modifier.height(20.dp))


                        Button(
                            colors = ButtonDefaults.buttonColors(
                                containerColor = colorResource(id = R.color.green3),
                                contentColor = Color.White
                            ),
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(4.dp),
                            onClick = {
                                dataStorageRegistrationViewModel.updateIsRegistrationSetupProperly(true)
                                navController.navigate("mainScreen")
                            }) {
                            Text("Proceed to the app")
                        }
                    }

                    Button(
                        colors = ButtonDefaults.buttonColors(
                            containerColor = colorResource(id = R.color.green3),
                            contentColor = Color.White
                        ),
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(4.dp),
                        onClick = {
                            navController.navigate("mainScreen")
                        }) {
                        Text("Proceed to the app[DEBUG]")
                    }

                }
            }
        }
    }
}
