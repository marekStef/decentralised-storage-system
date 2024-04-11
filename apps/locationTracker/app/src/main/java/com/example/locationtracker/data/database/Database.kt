package com.example.locationtracker.data.database

import androidx.room.Database
import androidx.room.RoomDatabase
import com.example.locationtracker.data.database.dataAccessObjects.LocationDao
import com.example.locationtracker.data.database.entities.Location

@Database(entities = [Location::class], version = 1)
abstract class Database : RoomDatabase() {
    abstract fun locationDao(): LocationDao
}