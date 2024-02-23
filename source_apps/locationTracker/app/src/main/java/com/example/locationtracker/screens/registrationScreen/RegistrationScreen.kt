package com.example.locationtracker.screens.registrationScreen

import android.app.Activity
import android.util.Log
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.IntrinsicSize
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.ContentAlpha
import androidx.compose.material.Icon
import androidx.compose.material.MaterialTheme
import androidx.compose.material.TextField
import androidx.compose.material.TextFieldDefaults
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Cancel
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Divider
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.State
import androidx.compose.runtime.getValue
import androidx.compose.runtime.livedata.observeAsState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.colorResource
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.example.locationtracker.R
import com.example.locationtracker.screens.commonComponents.CustomDefaultButton
import com.example.locationtracker.screens.commonComponents.CustomTextField
import com.example.locationtracker.utils.showAlertDialogWithOkButton
import com.example.locationtracker.viewModel.AssociationWithDataStorageStatusEnum
import com.example.locationtracker.viewModel.DataStorageRegistrationViewModel
import com.example.locationtracker.viewModel.MainViewModel
import com.example.locationtracker.viewModel.ServerReachabilityEnum

@Composable
fun RegistrationScreen(
    navController: NavController,
    dataStorageRegistrationViewModel: DataStorageRegistrationViewModel,
    activity: Activity,
) {
    val gradientColors = listOf(
        colorResource(id = R.color.header_background),
        colorResource(id = R.color.header_background_2)
    )

    val dataStorageDetails by dataStorageRegistrationViewModel.dataStorageDetails.observeAsState()

    val isServerReachable = dataStorageRegistrationViewModel.serverReachabilityStatus.observeAsState()
    val isLoadingDataStorageServerReachability =
        dataStorageRegistrationViewModel.isLoadingDataStorageServerReachability.observeAsState()

    val isAssociatingAppWithStorage = dataStorageRegistrationViewModel.isAssociatingAppWithStorage.observeAsState()
    val appAssociatedWithDataStorageStatus = dataStorageRegistrationViewModel.appAssociatedWithDataStorageStatus.observeAsState()

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color.White),

        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(0.dp)
                .background(Brush.verticalGradient(colors = gradientColors)),
        ) {
            Text(
                text = "Registration",
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
                        text = "Data Storage Finding",
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

                    CustomTextField(
                        value = dataStorageDetails!!.ipAddress,
                        onValueChange = { newIp -> dataStorageRegistrationViewModel.updateDataStorageIpAddress(newIp) },
                        label = "IP Address",
                    )

                    CustomTextField(
                        value = dataStorageDetails!!.port,
                        onValueChange = { newPort -> dataStorageRegistrationViewModel.updateDataStoragePort(newPort) },
                        label = "Port",
                        keyboardType = KeyboardType.Number
                    )

                    CustomDefaultButton("Check whether ip and port are correct") {
                        dataStorageRegistrationViewModel.checkDataStorageServerReachability()
                    }

                    Spacer(modifier = Modifier.height(20.dp))

                    Row(verticalAlignment = Alignment.CenterVertically) {
                        when {
                            isLoadingDataStorageServerReachability.value == true -> CircularProgressIndicator()
                            isServerReachable.value == ServerReachabilityEnum.REACHABLE -> Text("Server is reachable")
                            isServerReachable.value == ServerReachabilityEnum.NOT_REACHABLE -> Text(
                                "Server is not reachable"
                            )

                            else -> Text("You need to check server reachability")
                        }
                        if (isServerReachable.value == ServerReachabilityEnum.REACHABLE) {
                            Icon(
                                imageVector = Icons.Filled.CheckCircle,
                                contentDescription = "Server is reachable",
                                tint = colorResource(id = R.color.green3),
                                modifier = Modifier.padding(start = 4.dp)
                            )
                        } else {
                            Icon(
                                imageVector = Icons.Filled.Cancel,
                                contentDescription = "Server is reachable",
                                tint = Color.Red,
                                modifier = Modifier.padding(start = 4.dp)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(30.dp))

                    Text(
                        text = "Association With Data Storage",
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
                    )
                    Spacer(modifier = Modifier.height(20.dp))

                    TextField(
                        value = dataStorageDetails!!.associationTokenUsedDuringRegistration,
                        onValueChange = { dataStorageRegistrationViewModel.updateDataStorageAssociationToken(it) },
                        label = { Text("Enter Data Storage Association Token") },
                        singleLine = true,
                        textStyle = TextStyle(fontSize = 16.sp, fontWeight = FontWeight.Medium),
                        modifier = Modifier
                            .padding(8.dp)
                            .fillMaxWidth()
                            .height(IntrinsicSize.Min),
                        colors = TextFieldDefaults.textFieldColors(
                            backgroundColor = if (isServerReachable.value != ServerReachabilityEnum.REACHABLE) MaterialTheme.colors.onSurface.copy(
                                alpha = 0.12f
                            ) else Color.Transparent,
                            focusedIndicatorColor = MaterialTheme.colors.primary,
                            unfocusedIndicatorColor = Color.Gray,
                            disabledIndicatorColor = Color.Red,
                            leadingIconColor = MaterialTheme.colors.onSurface.copy(alpha = ContentAlpha.medium),
                            trailingIconColor = MaterialTheme.colors.onSurface.copy(alpha = ContentAlpha.medium),
                            disabledLeadingIconColor = Color.Gray,
                            disabledTrailingIconColor = Color.Gray,
                            focusedLabelColor = MaterialTheme.colors.primary,
                            unfocusedLabelColor = Color.Gray,
                        ),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        readOnly = isServerReachable.value != ServerReachabilityEnum.REACHABLE,
                        leadingIcon = {
                            Icon(Icons.Filled.Lock, contentDescription = "Data Storage Token")
                        }
                    )

                    CustomDefaultButton("Associate this app with the Data Storage") {
                        dataStorageRegistrationViewModel.associateAppWithStorageAppHolder() { isSuccess, message ->
                            if (isSuccess) {
                                // Handle success
                                Log.d("AssociateApp", "Success: $message")
                            } else {
                                // Handle failure
                                Log.e("AssociateApp", "Failure: $message")
                                showAlertDialogWithOkButton(activity, "Error", message)
                            }
                        }
                    }

                    Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(vertical = 20.dp)) {
                        when {
                            isAssociatingAppWithStorage.value == true -> CircularProgressIndicator()
                            appAssociatedWithDataStorageStatus.value == AssociationWithDataStorageStatusEnum.ASSOCIATED -> Text("App has been associated")
                            appAssociatedWithDataStorageStatus.value == AssociationWithDataStorageStatusEnum.ASSOCIATION_FAILED -> Text(
                                "App could not have been associated"
                            )
                            else -> Text("You need to associate this app")
                        }
                        if (appAssociatedWithDataStorageStatus.value == AssociationWithDataStorageStatusEnum.ASSOCIATED) {
                            Icon(
                                imageVector = Icons.Filled.CheckCircle,
                                contentDescription = "App has been associated",
                                tint = colorResource(id = R.color.green3),
                                modifier = Modifier.padding(start = 4.dp)
                            )
                        } else {
                            Icon(
                                imageVector = Icons.Filled.Cancel,
                                contentDescription = "App could not have been associated",
                                tint = Color.Red,
                                modifier = Modifier.padding(start = 4.dp)
                            )
                        }
                    }

                    Text(
                        text = "Profiles and Permissions",
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
                    )
                    Spacer(modifier = Modifier.height(20.dp))

                    if (canUserProceedToProfilesAndPermissions(isServerReachable, appAssociatedWithDataStorageStatus)) {
                        CustomDefaultButton(
                            "Proceed to requesting permissions and profiles",
                            backgroundColor = colorResource(id = R.color.green3),
                            textColor = Color.White
                        ) {
                            navController.navigate("profilesAndPermissions")
                        }
                    } else {
                        Text(text = "You need to pass previous conditions first.")
                        Text(text = "Only then you will be able to proceed.")
                    }

                    CustomDefaultButton(
                        "Proceed to requesting permissions and profiles [debug]",
                        backgroundColor = colorResource(id = R.color.green3),
                        textColor = Color.White
                    ) {
                        navController.navigate("profilesAndPermissions")
                    }
                }
            }
        }
    }
}

fun canUserProceedToProfilesAndPermissions(
    isServerReachable: State<ServerReachabilityEnum?>,
    appAssociatedWithDataStorageStatus: State<AssociationWithDataStorageStatusEnum?>
): Boolean {
    return isServerReachable.value == ServerReachabilityEnum.REACHABLE
            && appAssociatedWithDataStorageStatus.value == AssociationWithDataStorageStatusEnum.ASSOCIATED
}