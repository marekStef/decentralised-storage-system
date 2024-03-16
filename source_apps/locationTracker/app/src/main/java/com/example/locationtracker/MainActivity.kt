package com.example.locationtracker

import android.app.Activity
import android.app.AlertDialog
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.net.Uri
import android.os.Build
import android.util.Log;

import android.os.Bundle
import android.provider.Settings
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.ActivityResultLauncher
import androidx.activity.result.contract.ActivityResultContract
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.colorResource
import androidx.core.app.ActivityCompat
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.example.locationtracker.constants.LocationTrackerServiceBroadcastParameters
import com.example.locationtracker.constants.ScreensNames

import com.example.locationtracker.constants.Services
import com.example.locationtracker.constants.Workers
import com.example.locationtracker.data.DatabaseManager
import com.example.locationtracker.data.PreferencesManager
import com.example.locationtracker.eventSynchronisation.EventsSyncingStatus
import com.example.locationtracker.screens.ProfilesAndPermissionsScreen.ProfilesAndPermissionsScreen
import com.example.locationtracker.screens.SettingsScreenForRegisteredApp.SettingsScreenForRegisteredApp
import com.example.locationtracker.screens.registrationScreen.RegistrationScreen
import com.example.locationtracker.utils.*
import com.example.locationtracker.viewModel.DataStorageRegistrationViewModel
import com.example.locationtracker.viewModel.LogsScreenViewModel
import com.example.locationtracker.viewModel.MainViewModel
import com.google.accompanist.systemuicontroller.rememberSystemUiController
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers.IO
import kotlinx.coroutines.launch
import java.lang.ref.WeakReference
import java.util.Date

class MainActivity : ComponentActivity() {
    private lateinit var dbManager : DatabaseManager;
    private lateinit var mainViewModel: MainViewModel;
    private lateinit var logsScreenViewModel: LogsScreenViewModel;
    private lateinit var dataStorageRegistrationViewModel: DataStorageRegistrationViewModel

    private lateinit var createDocumentLauncher: ActivityResultLauncher<String>

    private val viewModelFactory = object : ViewModelProvider.Factory {
        override fun <T : ViewModel> create(modelClass: Class<T>): T {
            if (modelClass.isAssignableFrom(MainViewModel::class.java)) {
                @Suppress("UNCHECKED_CAST")
                return MainViewModel(application, dbManager, PreferencesManager(applicationContext)) as T
            } else if (modelClass.isAssignableFrom(DataStorageRegistrationViewModel::class.java)) {
                @Suppress("UNCHECKED_CAST")
                return DataStorageRegistrationViewModel(application, PreferencesManager(applicationContext)) as T
            } else if (modelClass.isAssignableFrom(LogsScreenViewModel::class.java)) {
                @Suppress("UNCHECKED_CAST")
                return LogsScreenViewModel(application, dbManager) as T
            }
            throw IllegalArgumentException("Unknown ViewModel class")
        }
    }

    private val locationServiceInfoReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context, intent: Intent) {
            val isRunning = intent.getBooleanExtra(
                LocationTrackerServiceBroadcastParameters.LOCATION_TRACKER_SERVICE_IS_RUNNING_BROADCAST_PARAMETER,false
            )
            mainViewModel.serviceRunningLiveData.postValue(isRunning)
        }
    }

    private val synchronisationWorkerInfoReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context, intent: Intent) {
            val progress = intent.getIntExtra(
                Workers.SYNCHRONISATION_WORKER_PROGRESS_PARAMETER_BROADCAST,0
            )
            val additionalNumberOfSyncedEvents = intent.getIntExtra(
                Workers.SYNCHRONISATION_WORKER_ADDITIONAL_NUMBER_OF_SYNCED_EVENTS_PARAMETER_BROADCAST,
                0
            )
            val syncMessage = intent.getStringExtra(
                Workers.SYNCHRONISATION_WORKER_SYNC_MESSAGE_PARAMETER_BROADCAST
            )
            val lastSynchronisationTime: Long = intent.getLongExtra(
                Workers.SYNCHRONISATION_WORKER_LAST_SYNC_TIME_IN_MILLIS_PARAMETER_BROADCAST, 0L
            )
            val statusString = intent.getStringExtra(
                Workers.SYNCHRONISATION_WORKER_SYNC_STATUS_PARAMETER_BROADCAST
            )
            val status = if (statusString != null) EventsSyncingStatus.valueOf(statusString) else EventsSyncingStatus.NOT_SYNCED_YET

            mainViewModel.updateCurrentSyncProgress(progress)
            mainViewModel.updateSyncStatus(status)
            mainViewModel.updateAdditionalNumberOfSynchronisedEvents(additionalNumberOfSyncedEvents)
            mainViewModel.updateSyncMessage(syncMessage)

            if (lastSynchronisationTime != 0L) {
                mainViewModel.updateLastSynchronisation(Date(lastSynchronisationTime))
            }
        }
    }

    private val requestBatteryOptimisationPermission = {
        Log.d("TAG", "aaaaaaare optimisations turned offff?  ${isAppExemptFromBatteryOptimizations(this)}");
        requestDisableBatteryOptimization(this)
    }

    private fun registerReceivers() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(locationServiceInfoReceiver, IntentFilter(Services.LOCATION_TRACKER_SERVICE_BROADCAST),
                RECEIVER_EXPORTED
            )
            registerReceiver(synchronisationWorkerInfoReceiver, IntentFilter(Workers.SYNCHRONISATION_WORKER_BROADCAST),
                RECEIVER_EXPORTED
            )
        } else {
            registerReceiver(locationServiceInfoReceiver, IntentFilter(Services.LOCATION_TRACKER_SERVICE_BROADCAST))
            registerReceiver(synchronisationWorkerInfoReceiver, IntentFilter(Workers.SYNCHRONISATION_WORKER_BROADCAST))
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        requestPostNotificationsPermission(this)

        dbManager = DatabaseManager.getInstance(this);
        mainViewModel = ViewModelProvider(this, viewModelFactory)[MainViewModel::class.java]
        Log.d("still here", "heeere---")
        dataStorageRegistrationViewModel = ViewModelProvider(this, viewModelFactory)[DataStorageRegistrationViewModel::class.java]
        logsScreenViewModel = ViewModelProvider(this, viewModelFactory)[LogsScreenViewModel::class.java]

        requestBatteryOptimisationPermission()

        registerReceivers()

        initCreateDocumentLauncher()

        mainViewModel.tempFilePath.observe(this) { filePath ->
            if (filePath != null) {
                // Launch the file picker
                createDocumentLauncher.launch("locations_${convertDateToFormattedString(Date())}.csv")
            }
        }

        setContent {
            val mainViewModelRef = WeakReference(mainViewModel)
            val logsScreenViewModelRef = WeakReference(logsScreenViewModel)
            val dataStorageRegistrationViewModelRef = WeakReference(dataStorageRegistrationViewModel)

            MyApp(mainViewModelRef, logsScreenViewModelRef, dataStorageRegistrationViewModelRef,
                applicationContext, openAppSettings, arePermissionsRequestsPermanentlyDeclined)
        }
    }

    private fun initCreateDocumentLauncher() {
        createDocumentLauncher = registerForActivityResult(createDocumentContract) { uri ->
            Log.d("MainActivity", "${mainViewModel.tempFilePath.value} Received URI: $uri")
            if (uri != null) {
                val tempFilePath = mainViewModel.tempFilePath.value
                if (tempFilePath != null) {
                    CoroutineScope(IO).launch {
                        copyFileToSelectedLocation(applicationContext, this@MainActivity, tempFilePath, uri)
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

    override fun onDestroy() {
        super.onDestroy()
        unregisterReceiver(locationServiceInfoReceiver) // Unregistering the broadcast receiver to prevent memory leaks
    }

    override fun onStop() {
        super.onStop()
        mainViewModel.saveViewModel()
        dataStorageRegistrationViewModel.saveViewModel()
    }

    private val openAppSettings: () -> Unit = {
        val intent = Intent(
            Settings.ACTION_APPLICATION_DETAILS_SETTINGS,
            Uri.fromParts("package", this.packageName, null)
        )
        this.startActivity(intent)
    }

    private val arePermissionsRequestsPermanentlyDeclined: (permission: String) -> Boolean = { permission ->
        !ActivityCompat.shouldShowRequestPermissionRationale(
            this,
            permission
        )
    }
}

@Composable
fun MyApp(mainViewModelRef: WeakReference<MainViewModel>,
          logsScreenViewModelRef: WeakReference<LogsScreenViewModel>,
          dataStorageRegistrationViewModelRef: WeakReference<DataStorageRegistrationViewModel>,
          applicationContext: Context,
          openAppSettings: () -> Unit,
          arePermissionsRequestsPermanentlyDeclined: (String) -> Boolean) {
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

    var preferencesManager = PreferencesManager(applicationContext)

    val startDestination = if (preferencesManager.isAppProperlyRegistered()) ScreensNames.MAIN_SCREEN else ScreensNames.REGISTRATION_SCREEN

    val navController = rememberNavController()
    NavHost(navController = navController, startDestination, modifier = Modifier.fillMaxSize()) {
        composable(ScreensNames.MAIN_SCREEN) { MainScreen(navController, mainViewModelRef, dataStorageRegistrationViewModelRef, applicationContext, openAppSettings, arePermissionsRequestsPermanentlyDeclined) }
        composable(ScreensNames.LOG_SCREEN) { LogScreen(navController, logsScreenViewModelRef) }
        composable(ScreensNames.PROFILES_AND_PERMISSIONS_SCREEN) { ProfilesAndPermissionsScreen(navController, dataStorageRegistrationViewModelRef) }
        composable(ScreensNames.REGISTRATION_SCREEN) { RegistrationScreen(navController, dataStorageRegistrationViewModelRef) }
        composable(ScreensNames.SETTINGS_SCREEN_FOR_REGISTERED_APP) { SettingsScreenForRegisteredApp(applicationContext, navController, mainViewModelRef, dataStorageRegistrationViewModelRef) }
    }
}