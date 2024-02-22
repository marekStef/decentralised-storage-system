package com.example.locationtracker.utils

import android.content.ContentResolver
import android.net.Uri
import android.util.Log
import java.io.File

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