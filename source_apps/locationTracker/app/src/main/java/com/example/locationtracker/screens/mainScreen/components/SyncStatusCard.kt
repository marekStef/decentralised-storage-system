package com.example.locationtracker.screens.mainScreen.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Card
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.locationtracker.model.SyncInfo

@Composable
fun SyncStatusCard(syncInfo: SyncInfo) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(8.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            SyncStatusItem("Last Synchronisation", syncInfo.lastSync)
            SyncStatusItem("Number of events not synchronised", syncInfo.eventsNotSynced.toString())
            SyncStatusItem("Oldest event not synchronised", syncInfo.oldestEventNotSynced)
            SyncStatusItem("Total events gathered", syncInfo.totalEvents.toString())
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