package com.example.locationtracker.model
data class SyncInfo(
    var lastSync: String,
    val eventsNotSynced: Int,
    val oldestEventNotSynced: String,
    val totalEvents: Long
)