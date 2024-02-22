package com.example.locationtracker.workManagers

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.Data
import androidx.work.WorkerParameters
import com.example.locationtracker.data.LogsManager
import java.io.File

class ExportLocationsWorker(
    private val appContext: Context,
    workerParams: WorkerParameters
): CoroutineWorker(appContext, workerParams) {

    override suspend fun doWork(): Result {
        return try {
            var dbManager : LogsManager = LogsManager.getInstance(appContext);
            val file = File(applicationContext.cacheDir, "locations.csv")
            dbManager.exportLocationsToCsv(file)

            val outputData = Data.Builder()
                .putString("filePath", file.absolutePath)
                .build()

            Result.success(outputData)
        } catch (e: Exception) {
            Result.failure()
        }
    }
}
