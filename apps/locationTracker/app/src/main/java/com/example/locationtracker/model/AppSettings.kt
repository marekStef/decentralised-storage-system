package com.example.locationtracker.model

import java.time.LocalTime

data class AppSettings(
    var selectedStartTimeForLocationLogging: LocalTime,
    var selectedEndTimeForLocationLogging: LocalTime,
    val isAutoSyncToggled: Boolean
)

val defaultAppSettings = AppSettings(LocalTime.of(6, 0), LocalTime.of(23, 30), false)