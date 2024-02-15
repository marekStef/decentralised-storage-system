package com.example.locationtracker

import androidx.compose.foundation.layout.*
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.livedata.observeAsState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.example.locationtracker.data.LogsManager
import com.example.locationtracker.data.database.entities.Location

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Divider
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@Composable
fun LogScreen(navController: NavController, logsManager: LogsManager) {
    val locations = logsManager.fetchLast100Locations().observeAsState(initial = emptyList())

    Column(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Button(onClick = { navController.popBackStack() }) {
            Text("Back")
        }
        Button(onClick = { logsManager.saveNewLocation(1.0, 2.0) }) {
            Text("Add New Location")
        }
        Button(onClick = { logsManager.logLast10Locations() }) {
            Text("Log locations")
        }

        Spacer(modifier = Modifier.height(16.dp))
        Text("Last ${locations.value.size} Locations", style = MaterialTheme.typography.bodyMedium)
        LazyColumn(
            modifier = Modifier.fillMaxSize()
        ) {
            items(locations.value) { location ->
                LocationItem(location)
            }
        }
    }
}

@Composable
fun LocationItem(location: Location) {
    val dateFormatter = SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault())
    val dateString = dateFormatter.format(Date(location.time))

    Column(modifier = Modifier.padding(8.dp)) {
        Text("ID: ${location.id}")
        Text("Latitude: ${location.latitude}")
        Text("Longitude: ${location.longitude}")
        Text("Time: ${dateString}")
    }

    Divider(modifier = Modifier.padding(vertical = 4.dp))
}