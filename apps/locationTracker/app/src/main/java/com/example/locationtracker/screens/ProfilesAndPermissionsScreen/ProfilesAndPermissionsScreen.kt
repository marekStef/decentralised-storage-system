package com.example.locationtracker.screens.ProfilesAndPermissionsScreen

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
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.example.locationtracker.R
import com.example.locationtracker.constants.DataStorageRelated.UNIQUE_LOCATION_PROFILE_NAME
import com.example.locationtracker.constants.ScreensNames
import com.example.locationtracker.screens.commonComponents.CustomDefaultButton
import com.example.locationtracker.viewModel.DataStorageRegistrationViewModel
import com.example.locationtracker.viewModel.PermissionsStatusEnum
import com.example.locationtracker.viewModel.ProfileRegistrationStatusEnum
import java.lang.ref.WeakReference

@Composable
fun ProfilesAndPermissionsScreen(
    navController: NavController,
    dataStorageRegistrationViewModelRef: WeakReference<DataStorageRegistrationViewModel>,
) {
    val dataStorageRegistrationViewModel = dataStorageRegistrationViewModelRef.get() ?: return

    val gradientColors = listOf(
        colorResource(id = R.color.header_background),
        colorResource(id = R.color.header_background_2)
    )

    val dataStorageDetails by dataStorageRegistrationViewModel.dataStorageDetails.observeAsState()

    val isRegisteringLocationProfile =
        dataStorageRegistrationViewModel.isRegisteringLocationProfile.observeAsState()
    val appProfileRegistrationStatus =
        dataStorageRegistrationViewModel.appProfileRegistrationStatus.observeAsState()

    val isAskingForPermissions =
        dataStorageRegistrationViewModel.isAskingForPermissions.observeAsState()
    val askingForPermissionsStatus =
        dataStorageRegistrationViewModel.askingForPermissionsStatus.observeAsState()

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
                text = stringResource(id = R.string.profiles_and_permissions),
                modifier = Modifier
                    .padding(13.dp)
                    .fillMaxWidth(),
                textAlign = TextAlign.Center,
                fontSize = 32.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )
        }

        LazyColumn(contentPadding = PaddingValues(10.dp)) {
            item {
                Column(
                    modifier = Modifier
                        .fillMaxWidth(),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = stringResource(id = R.string.profiles_registration),
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
                        text = stringResource(id = R.string.profile_being_registered),
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

                    CustomDefaultButton(
                        text = stringResource(id = R.string.register_needed_profiles)
                    ) {

                        dataStorageRegistrationViewModel.registerLocationProfileInDataStorageServer() { isSuccess, message ->
                            if (isSuccess) {
                                Log.d("Registering profile", "Success: $message")
                                dataStorageRegistrationViewModel.showAlertDialogWithOkButton(
                                    "Success",
                                    message
                                )
                            } else {
                                Log.e("Registering profile", "Failure: $message")
                                dataStorageRegistrationViewModel.showAlertDialogWithOkButton(
                                    "Error",
                                    message
                                )
                            }
                        }
                    }

                    Row(verticalAlignment = Alignment.CenterVertically) {
                        when {
                            isRegisteringLocationProfile.value == true -> CircularProgressIndicator()
                            appProfileRegistrationStatus.value == ProfileRegistrationStatusEnum.PROFILE_CREATION_FAILED -> Text(
                                "Profile creation failed"
                            )

                            appProfileRegistrationStatus.value == ProfileRegistrationStatusEnum.PROFILE_CREATED -> Text(
                                stringResource(id = R.string.profile_has_been_created)
                            )

                            else -> Text(stringResource(id = R.string.you_need_to_register_profiles))
                        }
                        if (appProfileRegistrationStatus.value == ProfileRegistrationStatusEnum.PROFILE_CREATED) {
                            Icon(
                                imageVector = Icons.Filled.CheckCircle,
                                contentDescription = stringResource(id = R.string.profiles_created),
                                tint = colorResource(id = R.color.green3),
                                modifier = Modifier.padding(start = 4.dp)
                            )
                        } else {
                            Icon(
                                imageVector = Icons.Filled.Cancel,
                                contentDescription = stringResource(id = R.string.profiles_not_created),
                                tint = Color.Red,
                                modifier = Modifier.padding(start = 4.dp)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(20.dp))

                    Text(
                        text = stringResource(id = R.string.permissions_request),
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

                    CustomDefaultButton(
                        text = stringResource(id = R.string.ask_for_permissions)
                    ) {
                        if (appProfileRegistrationStatus.value != ProfileRegistrationStatusEnum.PROFILE_CREATED) {
                            dataStorageRegistrationViewModel.showAlertDialogWithOkButton(
                                "Error",
                                "You need to register profiles first"
                            )
                            return@CustomDefaultButton
                        }

                        dataStorageRegistrationViewModel.sendPermissionRequest() { isSuccess, message ->
                            if (isSuccess) {
                                Log.d("Creating permission request", "Success: $message")
                                dataStorageRegistrationViewModel.showAlertDialogWithOkButton(
                                    "Success",
                                    "Permission request has been sent. You need to approve it now before the app sends some data"
                                )
                            } else {
                                Log.e("Creating permission request", "Failure: $message")
                                dataStorageRegistrationViewModel.showAlertDialogWithOkButton(
                                    "Error",
                                    message
                                )
                            }
                        }
                    }

                    Row(verticalAlignment = Alignment.CenterVertically) {
                        when {
                            isAskingForPermissions.value == true -> CircularProgressIndicator()
                            askingForPermissionsStatus.value == PermissionsStatusEnum.PERMISSIONS_REQUEST_FAILED -> Text(
                                stringResource(id = R.string.permissions_sending_failed)
                            )

                            askingForPermissionsStatus.value == PermissionsStatusEnum.PERMISSION_REQUEST_SENT -> Text(
                                stringResource(id = R.string.permission_request_sent_and_needs_to_be_approved)
                            )

                            else -> Text(stringResource(id = R.string.need_to_ask_for_data_storage_permissions))
                        }
                        if (askingForPermissionsStatus.value == PermissionsStatusEnum.PERMISSION_REQUEST_SENT) {
                            Icon(
                                imageVector = Icons.Filled.CheckCircle,
                                contentDescription = stringResource(id = R.string.profiles_created),
                                tint = colorResource(id = R.color.green3),
                                modifier = Modifier.padding(start = 4.dp)
                            )
                        } else {
                            Icon(
                                imageVector = Icons.Filled.Cancel,
                                contentDescription = stringResource(id = R.string.profiles_not_created),
                                tint = Color.Red,
                                modifier = Modifier.padding(start = 4.dp)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(20.dp))

                    if (askingForPermissionsStatus.value == PermissionsStatusEnum.PERMISSION_REQUEST_SENT) {
                        Text(
                            text = stringResource(id = R.string.welcome_to_new_app),
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
                            text = stringResource(id = R.string.app_prepared_for_cooperation_with_data_storage_server),
                            fontSize = 15.sp,
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(bottom = 5.dp)
                        )

                        Spacer(modifier = Modifier.height(20.dp))


                        CustomDefaultButton(
                            stringResource(id = R.string.proceed_to_the_app),
                            backgroundColor = colorResource(id = R.color.green3),
                            textColor = Color.White
                        ) {
                            dataStorageRegistrationViewModel.setIsAppProperlyRegistered(true);
                            navController.navigate(ScreensNames.MAIN_SCREEN) {
                                // so that the user cannot get back
                                popUpTo(navController.graph.startDestinationId) {
                                    inclusive = true
                                }
                            }
                            dataStorageRegistrationViewModel.showAlertDialogWithOkButton(
                                "Welcome",
                                "Your app has been successfully set!"
                            )
                        }
                    }

                    CustomDefaultButton(
                        "Proceed to the app[DEBUG]",
                        backgroundColor = colorResource(id = R.color.green3),
                        textColor = Color.White
                    ) {
                        dataStorageRegistrationViewModel.setIsAppProperlyRegistered(true);
                        navController.navigate(ScreensNames.MAIN_SCREEN) {
                            // so that the user cannot get back
                            popUpTo(navController.graph.startDestinationId) {
                                inclusive = true
                            }
                        }
                        dataStorageRegistrationViewModel.showAlertDialogWithOkButton(
                            "Welcome",
                            "Your app has been successfully set!"
                        )
                    }
                }
            }
        }
    }
}
