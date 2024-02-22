package com.example.locationtracker.model
data class SyncInfo(
    var lastSyncTime: String,
    val numberOfNotSyncedEvents: Int,
    val oldestEventTimeNotSynced: String,
    val numberOfSyncedEvents: Int
)

val defaultSyncInfo = SyncInfo("-", 0, "-", 0)