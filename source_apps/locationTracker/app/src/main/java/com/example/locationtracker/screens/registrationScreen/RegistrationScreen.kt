package com.example.locationtracker.screens.registrationScreen

import android.content.Intent
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.material3.TextField
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.livedata.observeAsState
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.colorResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.example.locationtracker.R
import com.example.locationtracker.viewModel.MainViewModel

@Composable
fun RegistrationScreen(navController: NavController, mainViewModel: MainViewModel) {
    val gradientColors = listOf(colorResource(id = R.color.header_background), colorResource(id = R.color.header_background_2))

    val dataStorageDetails by mainViewModel.dataStorageDetails.observeAsState()

    val isServerReachable = mainViewModel.isServerReachable.observeAsState()
    val isLoading = mainViewModel.isLoading.observeAsState()

    Column(
        modifier = Modifier
            .fillMaxWidth(),

        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(0.dp).background(Brush.verticalGradient(colors = gradientColors)),
        ) {
            Text(
                text = "Settings",
                modifier = Modifier.padding(13.dp).fillMaxWidth(),
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
        Row {
            Column(
                modifier = Modifier
                    .fillMaxWidth(),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Existing UI components...
                Row {
                    TextField(
                        value = dataStorageDetails!!.ipAddress,
                        onValueChange = {
                            mainViewModel.updateDataStorageIpAddress(it)
                        },
                        label = { Text("IP Address") },
                        modifier = Modifier.padding(8.dp)
                    )
                }


                TextField(
                    value = dataStorageDetails!!.port,
                    onValueChange = {
                        mainViewModel.updateDataStoragePort(it)
                    },
                    label = { Text("Port") },
                    modifier = Modifier.padding(8.dp),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
                )

                Button(onClick = { mainViewModel.checkDataStorageServerReachability() }) {
                    Text("Check whether ip and port are correct")
                }

                when {
                    isLoading.value == true -> CircularProgressIndicator()
                    isServerReachable.value == true -> Text("Server is reachable")
                    else -> Text("Server is not reachable")
                }
            }
        }
    }


//    Column(modifier = Modifier.fillMaxSize(), verticalArrangement = Arrangement.Center, horizontalAlignment = Alignment.CenterHorizontally) {
//
//    }
}
