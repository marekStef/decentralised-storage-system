package com.example.locationtracker

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
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
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.getValue
import androidx.compose.runtime.livedata.observeAsState
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.example.locationtracker.model.SyncInfo
import com.example.locationtracker.screens.mainScreen.components.SyncStatusCard
import com.example.locationtracker.viewModel.MainViewModel


@Composable
fun MainScreen(navController: NavController, viewModel: MainViewModel) {
    // Observe SyncInfo from the ViewModel
    val syncInfo by viewModel.syncInfo.observeAsState()

    // Use the value of SyncInfo to update the UI
    syncInfo?.let { info: SyncInfo ->
        SyncStatusCard(syncInfo = info)
    }

    Surface(modifier = Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) {
        Box {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(16.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "Location Logger",
                    fontSize = 32.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.Black
                )
                Spacer(modifier = Modifier.height(24.dp))
                syncInfo?.let { SyncStatusCard(it) }

                Button(onClick = {
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

            // This Column aligns the buttons to the bottom
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(bottom = 16.dp),
                verticalArrangement = Arrangement.Bottom,
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceEvenly
                ) {
                    Button(onClick = { navController.navigate("logScreen") }) {
                        Text("Show Data")
                    }
                    Button(onClick = { /* Handle click */ }) {
                        Text("Button 2")
                    }
                }
            }
        }
    }
}


//@Preview
//@Composable
//fun PreviewLocationLoggerScreen() {
//    val navController = rememberNavController()
//
//    MainScreen(navController)
//}