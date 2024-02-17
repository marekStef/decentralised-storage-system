package com.example.locationtracker.model
data class SyncInfo(
    var lastSync: String,
    val eventsNotSynced: Int,
    val oldestEventTimeNotSynced: String,
    val totalEvents: Int
)