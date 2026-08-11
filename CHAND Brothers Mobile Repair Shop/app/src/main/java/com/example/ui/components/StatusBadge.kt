package com.example.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.RepairStatus

@Composable
fun StatusBadge(
    status: RepairStatus,
    modifier: Modifier = Modifier,
    isSmall: Boolean = false
) {
    val backgroundColor = status.badgeColor.copy(alpha = 0.18f)
    val contentColor = status.badgeColor

    Row(
        modifier = modifier
            .clip(RoundedCornerShape(8.dp))
            .background(backgroundColor)
            .padding(
                horizontal = if (isSmall) 8.dp else 10.dp,
                vertical = if (isSmall) 4.dp else 6.dp
            ),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(if (isSmall) 6.dp else 8.dp)
                .clip(CircleShape)
                .background(contentColor)
        )
        Spacer(modifier = Modifier.width(6.dp))
        Text(
            text = status.displayName,
            color = contentColor,
            fontSize = if (isSmall) 11.sp else 12.sp,
            fontWeight = FontWeight.Bold
        )
    }
}
