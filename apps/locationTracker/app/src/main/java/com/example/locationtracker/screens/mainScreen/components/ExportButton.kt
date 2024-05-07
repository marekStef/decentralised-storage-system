package com.example.locationtracker.screens.mainScreen.components

import android.util.Log
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.State
import androidx.compose.runtime.getValue
import androidx.compose.runtime.livedata.observeAsState
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.colorResource
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.LiveData
import androidx.work.WorkInfo
import com.example.locationtracker.R
import com.example.locationtracker.viewModel.MainViewModel
import java.lang.ref.WeakReference

@Composable
fun ExportButton(
    csvExportWorkInfo: State<WorkInfo?>,
    initiateExportCsvHandler: () -> Unit,
    openFilePickerForGeneratedCsv: (generatedCsvFilePath: String) -> Unit,
) {
    val workInfo = csvExportWorkInfo.value;

    LaunchedEffect(workInfo) {
        when (workInfo?.state) {
            WorkInfo.State.SUCCEEDED -> {
                val filePath = workInfo?.outputData?.getString("filePath") ?: return@LaunchedEffect
                Log.d("ExportCSV", "File exported to: $filePath")
                openFilePickerForGeneratedCsv(filePath) // this will trigger file picker to open
            }
            WorkInfo.State.FAILED -> {
//                mainViewModel.showAlertDialogWithOkButton("Error", "There was an error generating the file")
                Log.e("ExportCSV", "Export failed")
            }
            else -> {}
        }
    }

    Button(
        modifier = Modifier
            .padding(0.dp),
        colors = ButtonDefaults.buttonColors(
            containerColor = colorResource(id = R.color.gray_light2),
            contentColor = Color.DarkGray
        ),
        onClick = { initiateExportCsvHandler() }) {
        Text("Export to csv", style = TextStyle(fontSize = 11.sp))
    }
}