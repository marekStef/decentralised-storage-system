package com.example.locationtracker

import android.Manifest
import android.app.Activity
import android.app.AlertDialog
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.util.Log;

import android.os.Bundle
import android.provider.Settings
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
import androidx.core.content.ContextCompat
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.navigation.NavController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.example.locationtracker.constants.LocationTrackerServiceBroadcastParameters
import com.example.locationtracker.constants.ScreenName
import com.example.locationtracker.constants.Services
import com.example.locationtracker.constants.Workers
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
    private lateinit var mainViewModel: MainViewModel;
    private lateinit var logsScreenViewModel: LogsScreenViewModel;
    private lateinit var dataStorageRegistrationViewModel: DataStorageRegistrationViewModel

    private lateinit var createDocumentLauncher: ActivityResultLauncher<String>

    // The showDialog function is now moved to MainActivity
    private fun showAlertDialogWithOkButton(title: String, message: String, onOkPressed: () -> Unit) {
        AlertDialog.Builder(this)
            .setTitle(title)
            .setMessage(message)
            .setPositiveButton("OK") { dialog, _ ->
                dialog.dismiss()
                onOkPressed()
            }
            .show()
    }

    private val viewModelFactory = object : ViewModelProvider.Factory {
        override fun <T : ViewModel> create(modelClass: Class<T>): T {
            if (modelClass.isAssignableFrom(MainViewModel::class.java)) {
                @Suppress("UNCHECKED_CAST")
                return MainViewModel(application, PreferencesManager(applicationContext)) as T
            } else if (modelClass.isAssignableFrom(DataStorageRegistrationViewModel::class.java)) {
                @Suppress("UNCHECKED_CAST")
                return DataStorageRegistrationViewModel(application, PreferencesManager(applicationContext)) as T
            } else if (modelClass.isAssignableFrom(LogsScreenViewModel::class.java)) {
                @Suppress("UNCHECKED_CAST")
                return LogsScreenViewModel(application) as T
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

    private fun registerNotificationObservers() {
        mainViewModel.alertDialogRequest.observe(this) { dialogInfo ->
            dialogInfo?.let {
                showAlertDialogWithOkButton(it.first, it.second) {}
                mainViewModel.resetShowAlertDialog()
            }
        }
    }

    private lateinit var permissionLauncher: ActivityResultLauncher<String>
    private var permissionIndex = 0

    private val permissionsToRequest = arrayOf(
        Manifest.permission.ACCESS_COARSE_LOCATION,
        Manifest.permission.ACCESS_FINE_LOCATION,
        Manifest.permission.ACCESS_BACKGROUND_LOCATION
    )

    private fun requestNextLocationPermission() {
        if (permissionIndex >= permissionsToRequest.size) return

        val allPermissionsGranted =
            permissionsToRequest.all { permission ->
                ContextCompat.checkSelfPermission(
                    applicationContext,
                    permission
                ) == PackageManager.PERMISSION_GRANTED
            }

        if (allPermissionsGranted) return

        if (permissionsToRequest.isNotEmpty()) {
            showAlertDialogWithOkButton(
                title = "Location Permission Required",
                message = "This app requires all types of locations permissions to provide location-based services. Please grant the permission when requested. Otherwise the app will be closed!",
                onOkPressed = {
                    permissionLauncher.launch(permissionsToRequest[permissionIndex])
                }
            )
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        permissionLauncher = registerForActivityResult(ActivityResultContracts.RequestPermission()) { isGranted ->
            if (isGranted) {
                permissionIndex++
                if (permissionIndex < permissionsToRequest.size) {
                    requestNextLocationPermission()
                }
            } else {
                showAlertDialogWithOkButton("Permission Required", "This app cannot function without the required permissions. You will be redirected now to the settings. We need to have the location 'Allow all the time'") {
//                    finish() // Close the application if permission is denied
                    openAppSettings()
                }
            }
        }

        mainViewModel = ViewModelProvider(this, viewModelFactory)[MainViewModel::class.java]
        dataStorageRegistrationViewModel = ViewModelProvider(this, viewModelFactory)[DataStorageRegistrationViewModel::class.java]
        logsScreenViewModel = ViewModelProvider(this, viewModelFactory)[LogsScreenViewModel::class.java]

        if (savedInstanceState == null) { // This means it's the first time creating this Activity
            requestBatteryOptimisationPermission()
            requestNextLocationPermission()
            requestPostNotificationsPermission(this)
        }

        registerReceivers()
        registerNotificationObservers()

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

            MyApp(
                mainViewModelRef,
                logsScreenViewModelRef,
                dataStorageRegistrationViewModelRef,
                applicationContext,
                ::navigateToNewScreen,
                ::popBackScreenFromStack
            )
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

//    private val arePermissionsRequestsPermanentlyDeclined: (permission: String) -> Boolean = { permission ->
//        !ActivityCompat.shouldShowRequestPermissionRationale(
//            this,
//            permission
//        )
//    }

    private fun navigateToNewScreen(navController: NavController, screenName: String, canUserNavigateBack: Boolean) {
        navController.navigate(screenName) {
            if (!canUserNavigateBack) { // so that the user cannot get back
                popUpTo(navController.graph.startDestinationId) {
                    inclusive = true
                }
            }
        }
    }

    private fun popBackScreenFromStack(navController: NavController) {
        navController.popBackStack();
    }
}

@Composable
fun MyApp(mainViewModelRef: WeakReference<MainViewModel>,
          logsScreenViewModelRef: WeakReference<LogsScreenViewModel>,
          dataStorageRegistrationViewModelRef: WeakReference<DataStorageRegistrationViewModel>,
          applicationContext: Context,
          navigateToNewScreen: (NavController, String, canUserNavigateBack: Boolean) -> Unit,
          popBackScreen: (NavController) -> Unit
) {
    val systemUiController = rememberSystemUiController()
    val statusBarColor = colorResource(id = R.color.header_background)
    val navController = rememberNavController()

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

    val startDestination = if (preferencesManager.isAppProperlyRegistered()) ScreenName.MAIN_SCREEN else ScreenName.REGISTRATION_SCREEN

    val navigateToScreenHandler = { screenName: String, canUserNavigateBack: Boolean -> navigateToNewScreen(navController, screenName, canUserNavigateBack) }
    val popBackScreenHandler = { -> popBackScreen(navController) }

    NavHost(navController = navController, startDestination, modifier = Modifier.fillMaxSize()) {
        composable(ScreenName.MAIN_SCREEN) { MainScreen(mainViewModelRef, dataStorageRegistrationViewModelRef, navigateToScreenHandler) }
        composable(ScreenName.LOG_SCREEN) { LogScreen(logsScreenViewModelRef, popBackScreenHandler) }
        composable(ScreenName.PROFILES_AND_PERMISSIONS_SCREEN) { ProfilesAndPermissionsScreen(dataStorageRegistrationViewModelRef, navigateToScreenHandler) }
        composable(ScreenName.REGISTRATION_SCREEN) { RegistrationScreen(dataStorageRegistrationViewModelRef, navigateToScreenHandler) }
        composable(ScreenName.SETTINGS_SCREEN_FOR_REGISTERED_APP) { SettingsScreenForRegisteredApp(applicationContext, mainViewModelRef, dataStorageRegistrationViewModelRef, navigateToScreenHandler) }
    }
}