package com.example.locationtracker.screens.mainScreen.components

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.wrapContentHeight
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.livedata.observeAsState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.graphics.vector.rememberVectorPainter
import androidx.compose.ui.res.colorResource
import androidx.compose.ui.res.vectorResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.locationtracker.R
import com.example.locationtracker.model.defaultSyncInfo
import com.example.locationtracker.viewModel.MainViewModel

@Composable
fun SyncStatusCard(viewModel: MainViewModel) {
    val syncInfo by viewModel.syncInfo.observeAsState(defaultSyncInfo)

    val gradientColors = listOf(colorResource(id = R.color.header_background), colorResource(id = R.color.header_background_2))

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .background(Brush.verticalGradient(colors = gradientColors))
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ){
            Text(
                text = "Location",
                fontSize = 32.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )
            Text(
                text = "Logger",
                fontSize = 16.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color.White
            )
            Spacer(modifier = Modifier.height(32.dp))
        Box (modifier = Modifier.wrapContentHeight()) {
            Row(modifier = Modifier.padding(16.dp)) {
                // Left Column for labels
                Column(
                    modifier = Modifier
                        .weight(1f)
                        .padding(end = 8.dp)
                        .wrapContentHeight()
                ) {
                    Text(text = "Last Synchronization", color = Color.White)
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(text = "Sync Message", color = Color.White)
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(text = "Number of events not synchronised", color = Color.White)
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(text = "Oldest event not synchronised", color = Color.White)
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(text = "Number of events synchronised", color = Color.White)
                }

                // Vertical Divider
//                Box(
//                    modifier = Modifier
////                        .fillMaxHeight()
//                        .height(50.dp)
//                        .width(1.dp)
//                        .background(Color.White)
//                )

                val imageVector = ImageVector.vectorResource(id = R.drawable.vertical_line)
                Image(
                    painter = rememberVectorPainter(image = imageVector),
                    contentDescription = "Divider",
                    modifier = Modifier.padding(horizontal = 8.dp)
                )
                Column(
                    modifier = Modifier
                        .weight(1f)
                        .padding(start = 8.dp)
                        .wrapContentHeight()
                ) {
                    Box {
                        Text(text = "Last Synchronization", color = Color.Transparent)
                        Text(text = syncInfo.lastSyncTime, fontWeight = FontWeight.Bold, color = Color.White)
                    }
                    Spacer(modifier = Modifier.height(4.dp))
                    Box {
                        Text(text = "Sync Message", color = Color.Transparent)
                        Text(text = syncInfo.syncMessage, fontWeight = FontWeight.Bold, color = Color.White)
                    }
                    Spacer(modifier = Modifier.height(4.dp))
                    Box {
                        Text(text = "Number of events not synchronised", color = Color.Transparent)
                        Text(text = syncInfo.numberOfNotSyncedEvents.toString(), fontWeight = FontWeight.Bold, color = Color.White)
                    }
                    Spacer(modifier = Modifier.height(4.dp))
                    Box {
                        Text(text = "Oldest event not synchronised", color = Color.Transparent)
                        Text(text = syncInfo.oldestEventTimeNotSynced, fontWeight = FontWeight.Bold, color = Color.White)
                    }
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(text = "${syncInfo.numberOfSyncedEvents}", fontWeight = FontWeight.Bold, color = Color.White)
                }
            }
        }


//            Column(
//                modifier = Modifier.padding(16.dp)
//            ) {
//                SyncStatusItem("Last Synchronization", syncInfo.lastSync)
//                SyncStatusItem("Number of events not synchronised", syncInfo.eventsNotSynced.toString())
//                SyncStatusItem("Oldest event not synchronised", syncInfo.oldestEventTimeNotSynced)
//                SyncStatusItem("Number of events synchronised", syncInfo.totalEvents.toString())
//            }
        }

    }
}

@Composable
fun SyncStatusItem(label: String, value: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(text = label, color = Color.White)
        Text(text = value, fontWeight = FontWeight.Bold, color = Color.White)
    }
}