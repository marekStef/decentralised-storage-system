package com.example.locationtracker

import androidx.compose.foundation.layout.*
import androidx.compose.material.Button
import androidx.compose.material.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.livedata.observeAsState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.example.locationtracker.data.LogsManager
import com.example.locationtracker.data.database.entities.Location

import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.Divider
import androidx.compose.material.Icon
import androidx.compose.material.IconButton
import androidx.compose.material.MaterialTheme
import androidx.compose.material.TopAppBar
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.res.colorResource
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale


@Composable
fun LogScreen(navController: NavController, logsManager: LogsManager) {
    var locations by remember { mutableStateOf(listOf<Location>()) } // mutable state list that holds the current locations to be displayed; defined with remember to survive recompositions and initialized with an empty list
    val coroutineScope = rememberCoroutineScope()

    fun refreshLocations() {
        coroutineScope.launch {
            locations = logsManager.fetchLast100Locations()
        }
    }

    // LaunchedEffect(Unit) ensures refreshLocations is called when the composable first enters the composition,
    // effectively loading the locations initially and also providing a mechanism to refresh the list whenever the refresh button is tapped
    LaunchedEffect(Unit) {
        refreshLocations()
    }

    Column(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        TopAppBar(
            title = { Text("Location Log") },
            navigationIcon = {
                IconButton(onClick = { navController.popBackStack() }) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                        contentDescription = "Back"
                    )
                }
            },
            backgroundColor = colorResource(id = R.color.header_background),
            actions = {
                IconButton(onClick = {
                    refreshLocations()
                }) {
                    Icon(
                        imageVector = Icons.Filled.Refresh,
                        contentDescription = "Reload Locations"
                    )
                }
            }
        )

        Text("Last ${locations.size} Locations", style = MaterialTheme.typography.subtitle2)

        Row {
            Button(onClick = { logsManager.saveNewLocation(1.0, 2.0) }) {
                Text("Add New Location")
            }
            Button(onClick = { logsManager.logLast10Locations() }) {
                Text("Log locations")
            }
        }

        LazyColumn(
            modifier = Modifier.fillMaxSize()
        ) {
            items(locations) { location ->
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