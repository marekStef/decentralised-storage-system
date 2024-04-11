package com.example.locationtracker.model

import com.example.locationtracker.eventSynchronisation.EventsSyncingStatus


data class SyncInfo(
    var lastSyncTime: String,
    var syncMessage: String,
    val syncStatus: EventsSyncingStatus,
    val currentSynchronisationProgress: Int,
    val numberOfNotSyncedEvents: Int,
    val oldestEventTimeNotSynced: String,
    val numberOfSyncedEvents: Int
)

val defaultSyncInfo = SyncInfo("-", "", EventsSyncingStatus.NOT_SYNCED_YET, 0, 0, "-", 0)