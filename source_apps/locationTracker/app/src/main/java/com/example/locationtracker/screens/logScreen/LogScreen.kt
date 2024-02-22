package com.example.locationtracker

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.Toast
import androidx.compose.foundation.layout.*
import androidx.compose.material.Button
import androidx.compose.material.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.example.locationtracker.data.LogsManager
import com.example.locationtracker.data.database.entities.Location

import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.AlertDialog
import androidx.compose.material.icons.Icons
import androidx.compose.material.Divider
import androidx.compose.material.Icon
import androidx.compose.material.IconButton
import androidx.compose.material.MaterialTheme
import androidx.compose.material.TextButton
import androidx.compose.material.TopAppBar
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.AccessTime
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.LocationSearching
import androidx.compose.material.icons.filled.Navigation
import androidx.compose.material.icons.filled.Place
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Speed
import androidx.compose.material.icons.filled.Terrain
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.colorResource
import androidx.compose.ui.text.font.FontWeight
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale


@Composable
fun LogScreen(navController: NavController, logsManager: LogsManager, applicationContext: Context) {
    var showDeleteLocationsDialog by remember { mutableStateOf(false) }

    var locations by remember { mutableStateOf(listOf<Location>()) } // mutable state list that holds the current locations to be displayed; defined with remember to survive recompositions and initialized with an empty list
    val coroutineScope = rememberCoroutineScope()

    var offset by remember { mutableStateOf(0) } // state to track the offset
    val limit = 100
    var loading by remember { mutableStateOf(false) }
    var moreAvailable by remember { mutableStateOf(true) }

    fun refreshLocations() {
        coroutineScope.launch {
            loading = true
            val newLocations = logsManager.fetchLocations(limit, offset)
            locations += newLocations
            moreAvailable = newLocations.size == limit
            loading = false
            offset += limit
        }
    }

    fun deleteAllLocations() {
        coroutineScope.launch {
            logsManager.deleteAllLocations()
            locations = emptyList()
        }
    }

    // LaunchedEffect(Unit) ensures refreshLocations is called when the composable first enters the composition,
    // effectively loading the locations initially and also providing a mechanism to refresh the list whenever the refresh button is tapped
    LaunchedEffect(Unit) {
        refreshLocations()
    }

    if (showDeleteLocationsDialog) {
        AlertDialog(
            onDismissRequest = { showDeleteLocationsDialog = false },
            title = { Text("Delete All Locations") },
            text = { Text("Are you sure you want to delete all locations? This action cannot be undone.") },
            confirmButton = {
                TextButton(
                    onClick = {
                        deleteAllLocations()
                        showDeleteLocationsDialog = false
                    }
                ) {
                    Text("Confirm")
                }
            },
            dismissButton = {
                TextButton(onClick = { showDeleteLocationsDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }


    Column(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        TopAppBar(
            title = { Column {
                Text("Location Log", color = Color.White)
                Text("Last ${locations.size} Unsynced Locations", style = MaterialTheme.typography.subtitle2, color = Color.White)
            } },
            navigationIcon = {
                IconButton(onClick = { navController.popBackStack() }) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                        contentDescription = "Back",
                        tint = Color.White
                    )
                }
            },
            backgroundColor = colorResource(id = R.color.header_background),
            actions = {
                IconButton(onClick = {
                    locations = listOf<Location>()
                    offset = 0
                    refreshLocations()
                }) {
                    Icon(
                        imageVector = Icons.Filled.Refresh,
                        contentDescription = "Reload Locations",
                        tint = Color.White
                    )
                }
                IconButton(onClick = { showDeleteLocationsDialog = true }) {
                    Icon(
                        imageVector = Icons.Filled.Delete,
                        contentDescription = "Delete All Locations",
                        tint = Color.White
                    )
                }
            }
        )

        Row {
//            Button(onClick = {
//                logsManager.saveNewLocation(
//                    NewLocation(
//                    latitude = 50.0755381,
//                    longitude = 14.4378005,
//                    accuracy = 10.0f,
//                    bearing = 100.0f,
//                    bearingAccuracy = 5.0f,
//                    altitude = 235.0,
//                    speed = 2.5f,
//                    speedAccuracyMetersPerSecond = 1.5f,
//                    provider = "fake"
//                )).also {
//                    refreshLocations()
//                }
//            }) {
//                Text("Add New Location [DEBUG]")
//            }
//            Button(onClick = { logsManager.logLast10Locations() }) {
//                Text("Log locations [DEBUG]")
//            }
        }

        LazyColumn(
            modifier = Modifier.fillMaxSize()
        ) {
            items(locations) { location ->
                LocationItem(location, applicationContext)
            }

            if (moreAvailable) {
                item {
                    Button(
                        onClick = {
                            if (!loading) {
                                refreshLocations()
                            }
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(8.dp),
                        enabled = !loading
                    ) {
                        if (loading) {
                            Text("Loading...")
                        } else {
                            Text("Load More")
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun LocationItem(location: Location, applicationContext: Context) {
    val dateFormatter = SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault())
    val dateString = dateFormatter.format(Date(location.time))

    Column(modifier = Modifier.padding(8.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically) {
//          Icon(Icons.Filled.Info, contentDescription = "ID", modifier = Modifier.padding(end = 4.dp), tint = Color.LightGray)
            Text("ID: ${location.id}", fontWeight = FontWeight.Bold)
        }
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(Icons.Filled.Place, contentDescription = "Location", modifier = Modifier.padding(end = 4.dp), tint = Color.LightGray)
            Text("Latitude: ${location.latitude}")
            Text(", Longitude: ${location.longitude}")
        }
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(Icons.Filled.AccessTime, contentDescription = "Time", modifier = Modifier.padding(end = 4.dp), tint = Color.LightGray)
            Text("Time: $dateString")
        }
        if (location.accuracy != null) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Filled.LocationSearching, contentDescription = "Accuracy", modifier = Modifier.padding(end = 4.dp), tint = Color.LightGray)
                Text("Accuracy: ${location.accuracy}")
            }
        }
        if (location.bearing != null) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Filled.Navigation, contentDescription = "Bearing", modifier = Modifier.padding(end = 4.dp), tint = Color.LightGray)
                Text("Bearing: ${location.bearing}")
            }
        }
        if (location.altitude != null) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Filled.Terrain, contentDescription = "Altitude", modifier = Modifier.padding(end = 4.dp), tint = Color.LightGray)
                Text("Altitude: ${location.altitude}")
            }
        }
        if (location.speed != null) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Filled.Speed, contentDescription = "Speed", modifier = Modifier.padding(end = 4.dp), tint = Color.LightGray)
                Text("Speed: ${location.speed}")
            }
        }

        if (location.provider != null) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    Icons.Filled.AutoAwesome,
                    contentDescription = "Provider",
                    modifier = Modifier.padding(end = 4.dp),
                    tint = Color.LightGray
                )
                Text("Provider: ${location.provider}")
            }
        }
    }

    Divider(modifier = Modifier.padding(vertical = 4.dp))
}