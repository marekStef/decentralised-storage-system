package com.example.locationtracker.screens.SettingsScreenForRegisteredApp

import android.content.Context
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
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
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.locationtracker.R
import com.example.locationtracker.constants.ScreenName
import com.example.locationtracker.foregroundServices.LocationTrackerService.stopLocationGatheringServiceIfRunning
import com.example.locationtracker.screens.commonComponents.CustomDefaultButton
import com.example.locationtracker.screens.commonComponents.CustomTextField
import com.example.locationtracker.screens.commonComponents.ResetAppButton
import com.example.locationtracker.utils.getCurrentSsid
import com.example.locationtracker.viewModel.DataStorageRegistrationViewModel
import com.example.locationtracker.viewModel.MainViewModel
import com.example.locationtracker.viewModel.ServerReachabilityEnum
import java.lang.ref.WeakReference

@Composable
fun SettingsScreenForRegisteredApp(
    applicationContext: Context,
    mainViewModelRef: WeakReference<MainViewModel>,
    dataStorageRegistrationViewModelRef: WeakReference<DataStorageRegistrationViewModel>,
    navigateToScreenHandler: (ScreenName: String, canUserNavigateBack: Boolean) -> Unit
) {
    val viewModel = mainViewModelRef.get()
    val dataStorageRegistrationViewModel = dataStorageRegistrationViewModelRef.get()
    // viewModel is null because it has been garbage collected
    if (viewModel == null || dataStorageRegistrationViewModel == null) {
        Text(text = "ViewModels not available", color = Color.Red)
        return
    }

    val gradientColors = listOf(
        colorResource(id = R.color.header_background),
        colorResource(id = R.color.header_background_2)
    )

    val dataStorageDetails by dataStorageRegistrationViewModel.dataStorageDetails.observeAsState()

    val isServerReachable =
        dataStorageRegistrationViewModel.serverReachabilityStatus.observeAsState()
    val isLoadingDataStorageServerReachability =
        dataStorageRegistrationViewModel.isLoadingDataStorageServerReachability.observeAsState()


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
                text = stringResource(id = R.string.settings),
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
                        text = stringResource(id = R.string.data_storage_location),
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
                        value = dataStorageDetails?.ipAddress ?: "-",
                        onValueChange = { newValue ->
                            dataStorageRegistrationViewModel.updateDataStorageIpAddress(
                                newValue
                            )
                        },
                        label = "IP Address",
                    )

                    CustomTextField(
                        value = dataStorageDetails?.port ?: "-",
                        onValueChange = { newValue ->
                            dataStorageRegistrationViewModel.updateDataStoragePort(
                                newValue
                            )
                        },
                        label = "Port",
                        keyboardType = KeyboardType.Number
                    )

                    CustomDefaultButton(stringResource(id = R.string.check_whether_ip_and_port_are_correct)) {
                        dataStorageRegistrationViewModel.checkDataStorageServerReachability()
                    }

                    Spacer(modifier = Modifier.height(20.dp))

                    Row(verticalAlignment = Alignment.CenterVertically) {
                        when {
                            isLoadingDataStorageServerReachability.value == true -> CircularProgressIndicator()
                            isServerReachable.value == ServerReachabilityEnum.REACHABLE -> Text(
                                stringResource(id = R.string.server_is_reachable)
                            )

                            isServerReachable.value == ServerReachabilityEnum.NOT_REACHABLE -> Text(
                                stringResource(id = R.string.server_not_reachable)
                            )

                            else -> Text("You need to check server reachability")
                        }
                        if (isServerReachable.value == ServerReachabilityEnum.REACHABLE) {
                            Icon(
                                imageVector = Icons.Filled.CheckCircle,
                                contentDescription = stringResource(id = R.string.server_is_reachable),
                                tint = colorResource(id = R.color.green3),
                                modifier = Modifier.padding(start = 4.dp)
                            )
                        } else {
                            Icon(
                                imageVector = Icons.Filled.Cancel,
                                contentDescription = stringResource(id = R.string.server_not_reachable),
                                tint = Color.Red,
                                modifier = Modifier.padding(start = 4.dp)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(20.dp))

                    Text(
                        text = stringResource(id = R.string.wifi_ssid_setting),
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

                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.Start
                    ) {
                        Text(
                            text = stringResource(id = R.string.network_name_with_colon),
                            fontSize = 15.sp,
                        )

                        Text(
                            text = dataStorageDetails?.networkSSID
                                ?: stringResource(id = R.string.not_set),
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Light,
                            modifier = Modifier
                                .clip(RoundedCornerShape(10.dp))
                                .background(colorResource(id = R.color.gray_light1))
                                .padding(horizontal = 10.dp, vertical = 5.dp),
                        )
                    }

                    Spacer(modifier = Modifier.height(20.dp))

                    CustomDefaultButton(stringResource(id = R.string.set_this_network)) {
                        var ssid = getCurrentSsid(applicationContext)
                        dataStorageRegistrationViewModel.setDataStorageNetworkSSID(ssid)
                        if (ssid == null) {
                            viewModel.updateAppSettingsAutoSync(false)
                            viewModel.showAlertDialogWithOkButton(
                                "AutoSync Turned Off",
                                "No network ssid has been found - Auto Sync is off"
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(20.dp))

                    Text(
                        text = stringResource(id = R.string.app_resetting),
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
                        text = stringResource(id = R.string.resets_the_app_to_its_initial_state_message),
                        fontSize = 15.sp,
                    )

                    Spacer(modifier = Modifier.height(20.dp))

                    ResetAppButton() {
                        viewModel.resetApplication()
                        stopLocationGatheringServiceIfRunning(applicationContext, viewModel.serviceRunningLiveData.value ?: false)
                        viewModel.showAlertDialogWithOkButton("App Reset", "Your app has been successfully reset")

                        navigateToScreenHandler(ScreenName.REGISTRATION_SCREEN, true)
                    }
                }
            }
        }
    }
}