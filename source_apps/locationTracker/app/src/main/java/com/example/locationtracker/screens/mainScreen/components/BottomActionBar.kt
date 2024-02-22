package com.example.locationtracker.screens.mainScreen.components

import android.app.Activity
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
import androidx.compose.ui.res.colorResource
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.example.locationtracker.R
import com.example.locationtracker.foregroundServices.toggleLocationGatheringService
import com.example.locationtracker.model.AppSettings
import com.example.locationtracker.viewModel.MainViewModel

@Composable
fun BottomActionBar(
    activity: Activity,
    viewModel: MainViewModel,
    navController: NavController,
    applicationContext: Context,
    appSettings: AppSettings?
) {
    // This Column aligns the buttons to the bottom
    Column(
        modifier = Modifier
            .wrapContentSize()
            .padding(start = 5.dp, end = 5.dp),
        verticalArrangement = Arrangement.Bottom,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
//            Box(modifier = Modifier.fillMaxWidth()
//                .wrapContentSize()
//                .padding(12.dp)
//
//            ) {
        Row() {
            SynchronisationComponent(activity, viewModel)
        }
        Row(
            modifier = Modifier
                .fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {

            Button(
                modifier = Modifier
//                        .shadow(
//                            elevation = 15.dp,
//                            spotColor = Color.LightGray,
//                            shape = RoundedCornerShape(40.dp)
//                        )
                    .padding(0.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = colorResource(id = R.color.gray_light2),
                    contentColor = Color.DarkGray
                ),
                onClick = { navController.navigate("logScreen") }) {
                Text(
                    "Show Data",
                    style = TextStyle(
                        fontSize = 13.sp
                    )
                )
            }

            ExportButton(activity, viewModel)

            ServiceControlButton(applicationContext, viewModel, appSettings)
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
    applicationContext: Context,
    viewModel: MainViewModel,
    appSettings: AppSettings?
) {
    val isServiceRunning by viewModel.serviceRunningLiveData.observeAsState(false)

    Button(
        modifier = Modifier
//            .shadow(
//                elevation = 15.dp,
//                spotColor = Color.LightGray,
//                shape = RoundedCornerShape(40.dp)
//            )
            .padding(0.dp),
        colors = ButtonDefaults.buttonColors(
            containerColor = colorResource(id = R.color.gray_light2),
            contentColor = Color.DarkGray
        ),
        onClick = {
            toggleLocationGatheringService(
                isServiceRunning,
                applicationContext,
                appSettings
            )
        }) {
        Text(
            if (isServiceRunning) "Stop Service" else "Start Service",
            style = TextStyle(
                fontSize = 13.sp
            )
        )
    }
}