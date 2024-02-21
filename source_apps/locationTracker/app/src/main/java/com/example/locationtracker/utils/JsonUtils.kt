package com.example.locationtracker.utils

import android.content.Context
import java.io.BufferedReader
import java.io.InputStreamReader

fun loadJsonSchemaFromRes(context: Context, resourceId: Int): String {
    val inputStream = context.resources.openRawResource(resourceId)
    val reader = BufferedReader(InputStreamReader(inputStream))
    val stringBuilder = StringBuilder()
    var line: String? = reader.readLine()
    while (line != null) {
        stringBuilder.append(line)
        line = reader.readLine()
    }
    return stringBuilder.toString()
}