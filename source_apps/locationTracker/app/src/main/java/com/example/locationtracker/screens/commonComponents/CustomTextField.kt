package com.example.locationtracker.screens.commonComponents

import android.app.TimePickerDialog
import android.content.Context
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.IntrinsicSize
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.TextField
import androidx.compose.material.TextFieldDefaults
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.colorResource
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import com.example.locationtracker.R
import java.time.LocalTime
import java.util.Calendar

/**
 * A custom TextField composable function that allows passing parameters to customize its behavior,
 * including the keyboard type.
 *
 * @param value The current value of the text field.
 * @param onValueChange Callback that is triggered when the text field's value changes.
 * @param label The label to be displayed for the text field.
 * @param keyboardType The type of keyboard to be used with the text field.
 * @param modifier A [Modifier] for styling the text field.
 */
@Composable
fun CustomTextField(
    value: String,
    onValueChange: (String) -> Unit,
    label: String,
    keyboardType: KeyboardType = KeyboardType.Text, // Default to Text if not specified
    modifier: Modifier = Modifier
) {
    TextField(
        value = value,
        onValueChange = onValueChange,
        label = { Text(label) },
        modifier = modifier
            .padding(8.dp)
            .fillMaxWidth()
            .height(IntrinsicSize.Min),
        colors = TextFieldDefaults.outlinedTextFieldColors(
            textColor = Color.Black,
            cursorColor = Color.Blue,
            focusedBorderColor = colorResource(id = R.color.header_background),
            unfocusedBorderColor = colorResource(id = R.color.gray_light4),
            backgroundColor = colorResource(id = R.color.gray_light1)
        ),
        keyboardOptions = KeyboardOptions(keyboardType = keyboardType)
    )
}