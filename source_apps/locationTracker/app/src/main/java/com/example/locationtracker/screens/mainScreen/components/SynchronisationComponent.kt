package com.example.locationtracker.screens.mainScreen.components

import android.app.Activity
import android.util.Log
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.livedata.observeAsState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.colorResource
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.work.WorkInfo
import com.example.locationtracker.R
import com.example.locationtracker.model.SyncInfo
import com.example.locationtracker.utils.showAlertDialogWithOkButton
import com.example.locationtracker.viewModel.EventsSyncingStatus
import com.example.locationtracker.viewModel.MainViewModel

@Composable
fun SynchronisationComponent(activity: Activity, mainViewModel: MainViewModel) {
    val progress = mainViewModel.progress.collectAsState().value
    val lastSyncStatus = mainViewModel.lastSyncStatus.collectAsState()

    Button(modifier = Modifier
        .fillMaxWidth()
        .padding(0.dp),
        shape = RoundedCornerShape(16.dp),
        colors = ButtonDefaults.buttonColors(
            containerColor = colorResource(id = R.color.green0),
            contentColor = colorResource(id = R.color.green3)
        ),
        onClick = {
            mainViewModel.startSyncing()
//            val updatedSyncInfo = SyncInfo(
//                lastSync = "New Sync Time",
//                eventsNotSynced = 1234,
//                oldestEventTimeNotSynced = "New Oldest Event Time",
//                totalEvents = 987654321
//            )
//
//            mainViewModel.updateSyncInfo(updatedSyncInfo) // Call the function in the ViewModel to handle the sync event
        }) {
        Row (verticalAlignment = Alignment.CenterVertically) {
            if (lastSyncStatus.value == EventsSyncingStatus.SYNCING) {
                Text("Syncing")
                LinearProgressIndicator(
                    progress = progress / 100f,
                    color = colorResource(id = R.color.green3),
                    trackColor = Color.White,
                    modifier = Modifier.padding(horizontal = 10.dp).width(100.dp)
                )
                Text(text = "$progress%")
            } else {
                Text("Sync Now")
            }

        }
    }
}