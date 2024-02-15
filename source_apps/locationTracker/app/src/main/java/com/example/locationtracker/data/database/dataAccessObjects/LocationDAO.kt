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

    @Query("SELECT * FROM location ORDER BY id DESC LIMIT 100")
    suspend fun getLast100Locations(): List<Location>
}
