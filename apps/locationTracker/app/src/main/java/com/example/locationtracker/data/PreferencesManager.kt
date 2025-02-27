package com.example.locationtracker.data

import android.content.Context
import android.content.Context.MODE_PRIVATE
import androidx.core.content.edit
import com.example.locationtracker.constants.SharedPreferences
import com.example.locationtracker.constants.SharedPreferences.APPLICATION_SETTINGS_PREF_MAIN_KEY
import com.example.locationtracker.constants.SharedPreferences.APPLICATION_SETTINGS_PREFERENCES
import com.example.locationtracker.constants.SharedPreferences.APPLICATION_SETTINGS_PREF_IS_APP_REGISTERED
import com.example.locationtracker.constants.SharedPreferences.DATA_STORAGE_DETAILS
import com.example.locationtracker.constants.SharedPreferences.DATA_STORAGE_DETAILS_PREFERENCES
import com.example.locationtracker.constants.SharedPreferences.LOCATION_TRACKER_SERVICE_RUNNING_FLAG
import com.example.locationtracker.constants.SharedPreferences.LOCATION_TRACKER_SERVICE_SHARED_PREFERENCES
import com.example.locationtracker.constants.SharedPreferences.SYNCHRONISATION_INFO_SHARED_PREFERENCES
import com.example.locationtracker.constants.Workers
import com.example.locationtracker.eventSynchronisation.EventsSyncingStatus
import com.example.locationtracker.model.AppSettings
import com.example.locationtracker.model.DataStorageDetails
import com.example.locationtracker.model.EmptyDataStorageDetails
import com.example.locationtracker.model.SyncInfo
import com.example.locationtracker.model.defaultAppSettings
import com.example.locationtracker.utils.convertLongToTime
import com.google.gson.Gson
import com.google.gson.GsonBuilder
import com.google.gson.JsonDeserializationContext
import com.google.gson.JsonDeserializer
import com.google.gson.JsonElement
import com.google.gson.JsonPrimitive
import com.google.gson.JsonSerializationContext
import com.google.gson.JsonSerializer
import java.lang.reflect.Type
import java.time.LocalTime
import java.time.format.DateTimeFormatter
import java.util.Date

class PreferencesManager constructor(private val context: Context) {
    fun resetAllPreferences() {
        // Unregister the app
        setIsAppProperlyRegistered(false)

        // Reset application settings preferences
        val appSettingsPrefs = context.getSharedPreferences(APPLICATION_SETTINGS_PREFERENCES, MODE_PRIVATE)
        appSettingsPrefs.edit().clear().apply()

        // Reset location tracker service preferences
        val locationTrackerPrefs = context.getSharedPreferences(LOCATION_TRACKER_SERVICE_SHARED_PREFERENCES, MODE_PRIVATE)
        locationTrackerPrefs.edit().clear().apply()

        // Reset data storage details preferences
        val dataStoragePrefs = context.getSharedPreferences(DATA_STORAGE_DETAILS_PREFERENCES, MODE_PRIVATE)
        dataStoragePrefs.edit().clear().apply()

        // Reset sync info preferences
        val syncInfoPrefs = context.getSharedPreferences(SYNCHRONISATION_INFO_SHARED_PREFERENCES, MODE_PRIVATE)
        syncInfoPrefs.edit().clear().apply()
    }

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

    fun saveSyncInfo(syncInfo: SyncInfo) {
        val syncInfoSharedPreferences = context.getSharedPreferences(SYNCHRONISATION_INFO_SHARED_PREFERENCES, Context.MODE_PRIVATE)
        syncInfoSharedPreferences.edit {
            putString(SharedPreferences.SYNCHRONISATION_INFO_LAST_SYNC, syncInfo.lastSyncTime)
            putString(SharedPreferences.SYNCHRONISATION_INFO_SYNC_MESSAGE, syncInfo.syncMessage)
            // putInt(EVENTS_NOT_SYNCED, syncInfo.eventsNotSynced)
            // putString(OLDEST_EVENT_TIME_NOT_SYNCED, syncInfo.oldestEventTimeNotSynced)
            putInt(SharedPreferences.SYNCHRONISATION_INFO_TOTAL_EVENTS_SYNCED, syncInfo.numberOfSyncedEvents)
            apply()
        }
    }

    fun savePartialSyncInfo(progress: Int? = null, additionalNumberOfSyncedEvents: Int? = null, syncMessage: String? = null, lastSynchronisationTimeInMillis: Long? = null, syncStatus: EventsSyncingStatus? = null) {
        val syncInfoSharedPreferences = context.getSharedPreferences(SYNCHRONISATION_INFO_SHARED_PREFERENCES, Context.MODE_PRIVATE)
        syncInfoSharedPreferences.edit {
            progress?.let {
                putInt(SharedPreferences.SYNCHRONISATION_INFO_SYNC_PROGRESS, it)
            }
            additionalNumberOfSyncedEvents?.let {
                val numberOfSyncedEvents = syncInfoSharedPreferences.getInt(
                    SharedPreferences.SYNCHRONISATION_INFO_TOTAL_EVENTS_SYNCED,
                    0
                )
                putInt(SharedPreferences.SYNCHRONISATION_INFO_TOTAL_EVENTS_SYNCED, it + numberOfSyncedEvents)
            }
            syncMessage?.let {
                putString(SharedPreferences.SYNCHRONISATION_INFO_SYNC_MESSAGE, it)
            }
            lastSynchronisationTimeInMillis?.let {
                putString(SharedPreferences.SYNCHRONISATION_INFO_LAST_SYNC, convertLongToTime(it, "-"))
            }
            syncStatus?.let {
                putString(SharedPreferences.SYNCHRONISATION_INFO_SYNC_STATUS, it.toString())
            }
            apply()
        }
    }

    fun loadDataStorageDetails(): DataStorageDetails {
        val sharedPreferences = context.getSharedPreferences(DATA_STORAGE_DETAILS_PREFERENCES, Context.MODE_PRIVATE)

        val json = sharedPreferences.getString(DATA_STORAGE_DETAILS, null) ?: return EmptyDataStorageDetails
        val gson = Gson()
        return gson.fromJson(json, DataStorageDetails::class.java)
    }

    private fun getGsonWithCustomSerialisers(): Gson? {
        val gsonBuilder = GsonBuilder()
        gsonBuilder.registerTypeAdapter(LocalTime::class.java, LocalTimeSerializer())
        gsonBuilder.registerTypeAdapter(LocalTime::class.java, LocalTimeDeserializer())
        val gson = gsonBuilder.create()
        return gson
    }

    fun loadAppSettings(): AppSettings {
        val sharedPreferences = context.getSharedPreferences(APPLICATION_SETTINGS_PREFERENCES, Context.MODE_PRIVATE)

        val json = sharedPreferences.getString(APPLICATION_SETTINGS_PREF_MAIN_KEY, null) ?: return defaultAppSettings
        val gson = getGsonWithCustomSerialisers()
        return gson?.fromJson(json, AppSettings::class.java) ?: defaultAppSettings
    }

    fun saveAppSettings(settings: AppSettings) {
        val sharedPreferences = context.getSharedPreferences(APPLICATION_SETTINGS_PREFERENCES, Context.MODE_PRIVATE)
        val editor = sharedPreferences.edit()
        val gson = getGsonWithCustomSerialisers()


        val json = gson?.toJson(settings) // Convert AppSettings to JSON string

        editor.putString(APPLICATION_SETTINGS_PREF_MAIN_KEY, json)
        editor.apply()
    }

    fun setIsAppProperlyRegistered(isProperlyRegistered: Boolean) {
        val prefs = context.getSharedPreferences(APPLICATION_SETTINGS_PREFERENCES, MODE_PRIVATE)
        prefs.edit().putBoolean(APPLICATION_SETTINGS_PREF_IS_APP_REGISTERED, isProperlyRegistered).apply()
    }

    fun isAppProperlyRegistered(): Boolean {
        val prefs = context.getSharedPreferences(APPLICATION_SETTINGS_PREFERENCES, Context.MODE_PRIVATE)
        return prefs.getBoolean(APPLICATION_SETTINGS_PREF_IS_APP_REGISTERED, false)
    }
}

class LocalTimeSerializer : JsonSerializer<LocalTime> {
    override fun serialize(src: LocalTime?, typeOfSrc: Type?, context: JsonSerializationContext?): JsonElement {
        return JsonPrimitive(src?.format(DateTimeFormatter.ISO_LOCAL_TIME))
    }
}

class LocalTimeDeserializer : JsonDeserializer<LocalTime> {
    override fun deserialize(json: JsonElement?, typeOfT: Type?, context: JsonDeserializationContext?): LocalTime {
        return LocalTime.parse(json?.asString, DateTimeFormatter.ISO_LOCAL_TIME)
    }
}