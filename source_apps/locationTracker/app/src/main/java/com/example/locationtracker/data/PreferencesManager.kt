package com.example.locationtracker.data

import android.content.Context
import android.content.Context.MODE_PRIVATE
import androidx.core.content.edit
import com.example.locationtracker.constants.SharedPreferences.DATA_STORAGE_DETAILS
import com.example.locationtracker.constants.SharedPreferences.DATA_STORAGE_DETAILS_PREFERENCES
import com.example.locationtracker.constants.SharedPreferences.LOCATION_TRACKER_SERVICE_RUNNING_FLAG
import com.example.locationtracker.constants.SharedPreferences.LOCATION_TRACKER_SERVICE_SHARED_PREFERENCES
import com.example.locationtracker.data.database.Database
import com.example.locationtracker.model.DataStorageDetails
import com.example.locationtracker.model.SyncInfo
import com.google.gson.Gson

class PreferencesManager constructor(private val context: Context) {
    fun setIsLocationTrackerServiceRunning(isActive: Boolean) {
        val prefs = context.getSharedPreferences(LOCATION_TRACKER_SERVICE_SHARED_PREFERENCES, MODE_PRIVATE)
        prefs.edit().putBoolean(LOCATION_TRACKER_SERVICE_RUNNING_FLAG, isActive).apply()
    }

    fun isLocationTrackerServiceRunning(): Boolean {
        val prefs = context.getSharedPreferences(LOCATION_TRACKER_SERVICE_SHARED_PREFERENCES, Context.MODE_PRIVATE)
        return prefs.getBoolean(LOCATION_TRACKER_SERVICE_RUNNING_FLAG, false)
    }

    fun saveDataStorageDetails(details: DataStorageDetails) {
        val sharedPreferences = context.getSharedPreferences(DATA_STORAGE_DETAILS_PREFERENCES, Context.MODE_PRIVATE)
        val editor = sharedPreferences.edit()
        val gson = Gson()

        // Convert DataStorageDetails to JSON String
        val json = gson.toJson(details)

        editor.putString(DATA_STORAGE_DETAILS, json)
        editor.apply()
    }

//    fun loadDataStorageDetails() : DataStorageDetails {
//        val ret = DataStorageDetails("3000", "192.168.137.1", null, null, null)
//        return ret
////        context.getSharedPreferences(DATA_STORAGE_DETAILS, Context.MODE_PRIVATE)?.let {
////            val details = Gson().fromJson(it, DataStorageDetails::class.java)
////            _dataStorageDetails.value = details
////        }
//    }

    fun loadDataStorageDetails(): DataStorageDetails {
        val sharedPreferences = context.getSharedPreferences(DATA_STORAGE_DETAILS_PREFERENCES, Context.MODE_PRIVATE)

        val json = sharedPreferences.getString(DATA_STORAGE_DETAILS, null) ?: return DataStorageDetails("3001", "192.168.137.1", null, null, null, "", null)
        val gson = Gson()
        return gson.fromJson(json, DataStorageDetails::class.java)
    }
}

