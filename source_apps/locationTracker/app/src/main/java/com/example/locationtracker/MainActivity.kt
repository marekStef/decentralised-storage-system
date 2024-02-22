package com.example.locationtracker

import android.app.Activity
import android.app.AlertDialog
import android.content.BroadcastReceiver
import android.content.ContentResolver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.net.Uri
import android.util.Log;

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.ActivityResultLauncher
import androidx.activity.result.contract.ActivityResultContract
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.colorResource
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.work.WorkInfo

import com.example.locationtracker.constants.Services
import com.example.locationtracker.data.LogsManager
import com.example.locationtracker.data.PreferencesManager
import com.example.locationtracker.eventSynchronisation.AppRegisteredToStorageState
import com.example.locationtracker.eventSynchronisation.EventSynchronisationManager
import com.example.locationtracker.screens.ProfilesAndPermissionsScreen.ProfilesAndPermissionsScreen
import com.example.locationtracker.screens.registrationScreen.RegistrationScreen
import com.example.locationtracker.utils.*
import com.example.locationtracker.viewModel.MainViewModel
import com.google.accompanist.systemuicontroller.rememberSystemUiController
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers.IO
import kotlinx.coroutines.launch
import java.io.File
import java.io.FileInputStream
import java.io.IOException

class MainActivity : ComponentActivity() {
    private lateinit var dbManager : LogsManager;
    private lateinit var mainViewModel: MainViewModel

    private lateinit var createDocumentLauncher: ActivityResultLauncher<String>

    private val viewModelFactory = object : ViewModelProvider.Factory {
        override fun <T : ViewModel> create(modelClass: Class<T>): T {
            if (modelClass.isAssignableFrom(MainViewModel::class.java)) {
                @Suppress("UNCHECKED_CAST")
                return MainViewModel(application, dbManager, PreferencesManager(applicationContext)) as T
            }
            throw IllegalArgumentException("Unknown ViewModel class")
        }
    }

    private val serviceStatusReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context, intent: Intent) {
            val isRunning = intent.getBooleanExtra("isRunning", false)
            mainViewModel.serviceRunningLiveData.postValue(isRunning)
        }
    }

    private val requestBatteryOptimisationPermission = {
        Log.d("TAG", "aaaaaaare optimisations turned offff?  ${isAppExemptFromBatteryOptimizations(this)}");
        requestDisableBatteryOptimization(this)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        requestPostNotificationsPermission(this)

        dbManager = LogsManager.getInstance(this);
        mainViewModel = ViewModelProvider(this, viewModelFactory)[MainViewModel::class.java]

        requestBatteryOptimisationPermission()

        registerReceiver(serviceStatusReceiver, IntentFilter(Services.LOCATION_TRACKER_SERVICE_BROADCAST)) // Register the broadcast receiver

        initCreateDocumentLauncher()

        mainViewModel.tempFilePath.observe(this) { filePath ->
            if (filePath != null) {
                // Launch the file picker
                createDocumentLauncher.launch("new_file_name.csv")
            }
        }

        setContent {
            MyApp(mainViewModel, dbManager, applicationContext, this)
        }
    }

    private fun initCreateDocumentLauncher() {
        createDocumentLauncher = registerForActivityResult(createDocumentContract) { uri ->
            Log.d("MainActivity", "${mainViewModel.tempFilePath.value} Received URI: $uri")
            if (uri != null) {
                val tempFilePath = mainViewModel.tempFilePath.value
                if (tempFilePath != null) {
                    CoroutineScope(IO).launch {
                        copyFileToSelectedLocation(tempFilePath, uri)
                    }
                    mainViewModel.resetTempFilePath()
                }
            } else {
                Log.d("MainActivity", "The URI is null. User cancelled the picker.")
            }
        }
    }

    val createDocumentContract = object : ActivityResultContract<String, Uri?>() {
        override fun createIntent(context: Context, input: String): Intent {
            return Intent(Intent.ACTION_CREATE_DOCUMENT).apply {
                addCategory(Intent.CATEGORY_OPENABLE)
                type = "text/csv"
                putExtra(Intent.EXTRA_TITLE, input) // The default name for the saved file
            }
        }

        override fun parseResult(resultCode: Int, intent: Intent?): Uri? {
            if (resultCode == Activity.RESULT_OK) {
                return intent?.data
            }
            return null
        }
    }

    private fun copyFileToSelectedLocation(tempFilePath: String, destinationUri: Uri) {
        val contentResolver = applicationContext.contentResolver
        var success = false

        try {
            FileInputStream(File(tempFilePath)).use { inputStream ->
                contentResolver.openOutputStream(destinationUri).use { outputStream ->
                    if (outputStream != null) {
                        inputStream.copyTo(outputStream)
                        success = true // Set the success flag if copy completes without exception
                    } else {
                        Log.e("FileCopy", "Failed to open output stream.")
                    }
                }
            }
        } catch (e: IOException) {
            Log.e("FileCopy", "Error copying file.", e)
        } finally {
            runOnUiThread { // displaying the dialog on the main thread
                if (success) {
                    showAlertDialogWithOkButton(this, "Success", "The file was successfully saved.")
                } else {
                    showAlertDialogWithOkButton(this, "Failure", "Failed to save the file. The temporary file will be deleted.")
                    deleteGivenFile(tempFilePath)
                    deleteUri(contentResolver, destinationUri)
                }
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        unregisterReceiver(serviceStatusReceiver) // Unregister the broadcast receiver to prevent memory leaks
    }

    override fun onPause() {
        super.onPause()
        mainViewModel.saveDataStorageDetails()
        mainViewModel.saveAppSettings()
    }
}

@Composable
fun MyApp(mainViewModel: MainViewModel, logsManager: LogsManager, applicationContext: Context, activity: Activity) {
    val systemUiController = rememberSystemUiController()
    val statusBarColor = colorResource(id = R.color.header_background)
    SideEffect {
        systemUiController.setStatusBarColor(
            color = statusBarColor,
            darkIcons = false
        )

        systemUiController.setNavigationBarColor(
            color = Color.White,
            darkIcons = true
        )
    }

    var eventSyncManager = EventSynchronisationManager()
    val startDestination = if (eventSyncManager.isAppRegisteredInStorage() == AppRegisteredToStorageState.NON_REGISTERED) "registrationScreen" else "mainScreen"

    val navController = rememberNavController()
    NavHost(navController = navController, startDestination, modifier = Modifier.fillMaxSize()) {
        composable("mainScreen") { MainScreen(navController, mainViewModel, applicationContext, activity) }

        composable("logScreen") { LogScreen(navController, logsManager) }

        composable("profilesAndPermissions") { ProfilesAndPermissionsScreen(navController, mainViewModel, activity) }

        composable("registrationScreen") { RegistrationScreen(navController, mainViewModel, activity) }
    }
}

