package com.example.locationappandroidtest

import android.icu.text.SimpleDateFormat
import android.location.Location
import android.location.LocationRequest
import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.ViewModel
import com.google.android.gms.location.LocationResult
import kotlinx.coroutines.withContext
import java.util.Date
import java.util.Locale

class LocationViewModel : ViewModel() {
    val lastLocation = mutableStateOf<String?>(null)
    val lastUpdatedTime = mutableStateOf<String?>("")

    fun updateLocation(location: Location) {
        val dateFormat = SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault())
        val currentTime = dateFormat.format(Date())
        lastUpdatedTime.value = "Last updated: $currentTime"
        lastLocation.value = "Altitude: ${location.altitude}, Longitude: ${location.longitude}"
    }
}