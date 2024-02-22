package com.example.locationtracker.data.database.dataAccessObjects

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.Query
import com.example.locationtracker.data.database.entities.Location

@Dao
interface LocationDao {
    @Insert
    suspend fun insertLocation(location: Location)

    @Query("SELECT * FROM location")
    fun getAllLocations(): List<Location>

    @Query("SELECT * FROM location ORDER BY id DESC LIMIT :limit OFFSET :offset")
    suspend fun getLocationsWithLimitOffset(limit: Int, offset: Int): List<Location>

    @Query("SELECT COUNT(id) FROM location")
    suspend fun countAllLocations(): Int

    @Query("DELETE FROM location")
    suspend fun deleteAllLocations()

    @Query("SELECT MIN(time) FROM location")
    suspend fun getOldestNotSyncedEventTime(): Long?
}
