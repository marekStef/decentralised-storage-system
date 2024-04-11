package com.example.locationtracker.screens.commonComponents

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.colorResource
import androidx.compose.ui.unit.dp
import com.example.locationtracker.R

@Composable
fun CustomDefaultButton(
    text: String,
    backgroundColor: Color = colorResource(id = R.color.header_background),
    textColor: Color = Color.White,
    onClick: () -> Unit
    ) {
    Button(
        colors = ButtonDefaults.buttonColors(
            containerColor = backgroundColor,
            contentColor = textColor
        ),
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(4.dp),
        onClick = onClick
    ) {
        Text(text)
    }
}

