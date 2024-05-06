package com.example.locationtracker.viewModel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.viewModelScope
import com.example.locationtracker.data.DatabaseManager
import kotlinx.coroutines.launch

import com.example.locationtracker.data.database.entities.Location

class LogsScreenViewModel(private val application: Application): AndroidViewModel(application) {
    private val databaseManager: DatabaseManager = DatabaseManager.getInstance(application.applicationContext);

    val limit = 100
    private var offset = 0

    public fun setShowDeleteLocationsDialog(shouldDelete: Boolean) {
        _showDeleteLocationsDialog.value = shouldDelete
    }

    public fun deleteAllLocations() {
        viewModelScope.launch {
            databaseManager.deleteAllLocations()
            _locations.value = emptyList()
        }
    }

    public fun loadMoreLocations() {
        viewModelScope.launch {
            _loading.value = true
            val newLocations = databaseManager.fetchLocations(limit, offset )
            val currentLocations = _locations.value ?: emptyList()
            _locations.value = currentLocations.plus(newLocations)
            _moreAvailable.value = newLocations.size == limit
            _loading.value = false
            offset += limit
        }
    }

    public fun refreshLocations() {
        offset = 0;
        _locations.value = listOf<Location>()
        loadMoreLocations()
    }

    private val _showDeleteLocationsDialog = MutableLiveData<Boolean>()
    val showDeleteLocationsDialog: LiveData<Boolean> = _showDeleteLocationsDialog

    private val _loading = MutableLiveData<Boolean>()
    val loading: LiveData<Boolean> = _loading

    private val _locations = MutableLiveData<List<Location>>() // mutable state list that holds the current locations to be displayed; defined with remember to survive recompositions and initialized with an empty list
    val locations: LiveData<List<Location>> = _locations

    private val _moreAvailable = MutableLiveData<Boolean>()
    val moreAvailable: LiveData<Boolean> = _moreAvailable;
}