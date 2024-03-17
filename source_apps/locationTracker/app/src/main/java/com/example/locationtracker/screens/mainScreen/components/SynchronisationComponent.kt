package com.example.locationtracker.screens.mainScreen.components

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
import androidx.compose.runtime.livedata.observeAsState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.colorResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.example.locationtracker.R
import com.example.locationtracker.eventSynchronisation.EventsSyncingStatus
import com.example.locationtracker.model.defaultSyncInfo
import com.example.locationtracker.viewModel.MainViewModel
import java.lang.ref.WeakReference

@Composable
fun SynchronisationComponent(mainViewModelRef: WeakReference<MainViewModel>) {
    val mainViewModel = mainViewModelRef.get() ?: return

    val syncInfo = mainViewModel.syncInfo.observeAsState(defaultSyncInfo)

    Button(modifier = Modifier
        .fillMaxWidth()
        .padding(0.dp),
        shape = RoundedCornerShape(16.dp),
        colors = ButtonDefaults.buttonColors(
            containerColor = colorResource(id = R.color.green0),
            contentColor = colorResource(id = R.color.green3)
        ),
        onClick = { mainViewModel.startSynchronisingGatheredData() }
    ){
        Row(verticalAlignment = Alignment.CenterVertically) {
            if (syncInfo.value.syncStatus == EventsSyncingStatus.SYNCING) {
                Text(stringResource(id = R.string.syncing))
                LinearProgressIndicator(
                    progress = (syncInfo.value.currentSynchronisationProgress ?: 1) / 100f,
                    color = colorResource(id = R.color.green3),
                    trackColor = Color.White,
                    modifier = Modifier
                        .padding(horizontal = 10.dp)
                        .width(100.dp)
                )
                Text(text = "${syncInfo.value.currentSynchronisationProgress}%")
            } else {
                Text(stringResource(id = R.string.sync_now))
            }
        }
    }
}