package com.example.ui.components

import androidx.compose.animation.animateColorAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Build
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.DoneAll
import androidx.compose.material.icons.filled.HourglassTop
import androidx.compose.material.icons.filled.Inbox
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.ShoppingBag
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.RepairStatus

@Composable
fun StatusTimeline(
    currentStatus: RepairStatus,
    onStatusSelected: (RepairStatus) -> Unit,
    modifier: Modifier = Modifier
) {
    val steps = listOf(
        RepairStatus.RECEIVED to Icons.Default.Inbox,
        RepairStatus.DIAGNOSING to Icons.Default.Search,
        RepairStatus.IN_PROGRESS to Icons.Default.Build,
        RepairStatus.WAITING_FOR_PARTS to Icons.Default.HourglassTop,
        RepairStatus.READY_FOR_PICKUP to Icons.Default.Check,
        RepairStatus.DELIVERED to Icons.Default.DoneAll
    )

    Surface(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
        border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.3f))
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Text(
                text = "Repair Lifecycle Status",
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Spacer(modifier = Modifier.height(14.dp))

            // Stepper timeline steps
            steps.forEachIndexed { index, (status, icon) ->
                val isCurrent = currentStatus == status
                val isPassed = currentStatus.stepOrder > status.stepOrder && currentStatus != RepairStatus.CANCELLED
                val isCancelled = currentStatus == RepairStatus.CANCELLED

                val circleBg by animateColorAsState(
                    targetValue = when {
                        isCurrent -> status.badgeColor
                        isPassed -> status.badgeColor.copy(alpha = 0.7f)
                        else -> MaterialTheme.colorScheme.surface
                    },
                    label = "circleBg"
                )

                val iconColor by animateColorAsState(
                    targetValue = when {
                        isCurrent || isPassed -> Color.Black
                        else -> MaterialTheme.colorScheme.onSurfaceVariant
                    },
                    label = "iconColor"
                )

                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(8.dp))
                        .clickable { onStatusSelected(status) }
                        .padding(vertical = 6.dp, horizontal = 4.dp)
                        .testTag("status_step_${status.key.lowercase()}"),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Box(
                            modifier = Modifier
                                .size(32.dp)
                                .clip(CircleShape)
                                .background(circleBg)
                                .border(
                                    width = if (isCurrent) 2.dp else 1.dp,
                                    color = if (isCurrent) Color.White else MaterialTheme.colorScheme.outline.copy(alpha = 0.5f),
                                    shape = CircleShape
                                ),
                            contentAlignment = Alignment.Center
                        ) {
                            if (isPassed) {
                                Icon(
                                    imageVector = Icons.Default.Check,
                                    contentDescription = "Completed",
                                    tint = iconColor,
                                    modifier = Modifier.size(16.dp)
                                )
                            } else {
                                Icon(
                                    imageVector = icon,
                                    contentDescription = status.displayName,
                                    tint = iconColor,
                                    modifier = Modifier.size(16.dp)
                                )
                            }
                        }

                        if (index < steps.size - 1) {
                            Box(
                                modifier = Modifier
                                    .width(2.dp)
                                    .height(16.dp)
                                    .background(
                                        if (isPassed) status.badgeColor.copy(alpha = 0.6f)
                                        else MaterialTheme.colorScheme.outline.copy(alpha = 0.2f)
                                    )
                            )
                        }
                    }

                    Spacer(modifier = Modifier.width(12.dp))

                    Column(modifier = Modifier.weight(1f)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = status.displayName,
                                fontSize = 14.sp,
                                fontWeight = if (isCurrent) FontWeight.Bold else FontWeight.Medium,
                                color = if (isCurrent) status.badgeColor else MaterialTheme.colorScheme.onSurface
                            )
                            if (isCurrent) {
                                Spacer(modifier = Modifier.width(8.dp))
                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(4.dp))
                                        .background(status.badgeColor)
                                        .padding(horizontal = 6.dp, vertical = 2.dp)
                                ) {
                                    Text(
                                        text = "CURRENT",
                                        fontSize = 9.sp,
                                        fontWeight = FontWeight.ExtraBold,
                                        color = Color.Black
                                    )
                                }
                            }
                        }
                        Text(
                            text = status.description,
                            fontSize = 11.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }
        }
    }
}
