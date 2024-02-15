package com.example.locationtracker.data.database.entities

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity
data class Location(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val latitude: Double,
    val longitude: Double,
    val time: Long
)