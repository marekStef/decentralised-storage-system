package com.example.locationtracker.utils

import android.content.ContentResolver
import android.content.Context
import android.net.Uri
import android.util.Log
import com.example.locationtracker.MainActivity
import java.io.File
import java.io.FileInputStream
import java.io.IOException

fun deleteGivenFile(path: String) {
    val file = File(path)
    if (file.exists()) {
        if (!file.delete()) {
            Log.e("FileDelete", "Failed to delete temporary file: $path")
        }
    }
}


fun deleteUri(contentResolver: ContentResolver, uri: Uri) {
    try {
        contentResolver.delete(uri, null, null)
    } catch (e: Exception) {
        Log.e("FileDelete", "Failed to delete file at URI: $uri", e)
    }
}

fun copyFileToSelectedLocation(applicationContext: Context, mainActivity: MainActivity, tempFilePath: String, destinationUri: Uri) {
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
        mainActivity.runOnUiThread { // displaying the dialog on the main thread
            if (success) {
                showAlertDialogWithOkButton(mainActivity, "Success", "The file was successfully saved.")
            } else {
                showAlertDialogWithOkButton(mainActivity, "Failure", "Failed to save the file. The temporary file will be deleted.")
                deleteGivenFile(tempFilePath)
                deleteUri(contentResolver, destinationUri)
            }
        }
    }
}