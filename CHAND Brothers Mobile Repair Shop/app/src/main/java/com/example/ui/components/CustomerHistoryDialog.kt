package com.example.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.example.data.model.CustomerProfile
import com.example.data.model.RepairTicket
import com.example.ui.theme.AccentEmerald
import com.example.ui.theme.AccentRose
import com.example.ui.theme.ElectricCyan
import com.example.ui.theme.SkyBluePrimary
import com.example.util.CommunicationHelper
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CustomerHistoryDialog(
    customerProfile: CustomerProfile,
    onDismiss: () -> Unit,
    onSelectTicket: (RepairTicket) -> Unit,
    onNewTicketForCustomer: (customerName: String, customerPhone: String) -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val sortedTickets = remember(customerProfile) {
        customerProfile.tickets.sortedByDescending { it.dateCreatedMillis }
    }

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Surface(
            modifier = modifier
                .fillMaxSize()
                .padding(16.dp),
            shape = RoundedCornerShape(24.dp),
            color = MaterialTheme.colorScheme.background,
            tonalElevation = 6.dp
        ) {
            Scaffold(
                topBar = {
                    TopAppBar(
                        title = {
                            Column {
                                Text(
                                    text = "Customer Profile & History",
                                    fontSize = 18.sp,
                                    fontWeight = FontWeight.Bold
                                )
                                Text(
                                    text = "${sortedTickets.size} Previous Repairs Registered",
                                    fontSize = 12.sp,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        },
                        navigationIcon = {
                            IconButton(onClick = onDismiss) {
                                Icon(Icons.Default.Close, contentDescription = "Close")
                            }
                        },
                        actions = {
                            FilledTonalButton(
                                onClick = {
                                    onDismiss()
                                    onNewTicketForCustomer(customerProfile.customerName, customerProfile.customerPhone)
                                },
                                shape = RoundedCornerShape(12.dp),
                                colors = ButtonDefaults.filledTonalButtonColors(
                                    containerColor = SkyBluePrimary.copy(alpha = 0.15f),
                                    contentColor = SkyBluePrimary
                                ),
                                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp),
                                modifier = Modifier
                                    .padding(end = 8.dp)
                                    .testTag("new_ticket_for_customer_btn")
                            ) {
                                Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("New Repair", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                            }
                        },
                        colors = TopAppBarDefaults.topAppBarColors(
                            containerColor = MaterialTheme.colorScheme.surface
                        )
                    )
                }
            ) { innerPadding ->
                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(innerPadding)
                        .padding(horizontal = 16.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp),
                    contentPadding = PaddingValues(vertical = 16.dp)
                ) {
                    // 1. Customer Info Header Card
                    item {
                        Card(
                            shape = RoundedCornerShape(20.dp),
                            colors = CardDefaults.cardColors(
                                containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.6f)
                            ),
                            elevation = CardDefaults.cardElevation(2.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(16.dp),
                                verticalArrangement = Arrangement.spacedBy(14.dp)
                            ) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Row(
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                                    ) {
                                        Box(
                                            modifier = Modifier
                                                .size(54.dp)
                                                .clip(CircleShape)
                                                .background(
                                                    Brush.linearGradient(
                                                        colors = listOf(
                                                            SkyBluePrimary,
                                                            ElectricCyan
                                                        )
                                                    )
                                                ),
                                            contentAlignment = Alignment.Center
                                        ) {
                                            Text(
                                                text = customerProfile.customerName.take(1).uppercase(),
                                                fontSize = 24.sp,
                                                fontWeight = FontWeight.ExtraBold,
                                                color = Color.White
                                            )
                                        }

                                        Column {
                                            Text(
                                                text = customerProfile.customerName,
                                                fontSize = 18.sp,
                                                fontWeight = FontWeight.Bold,
                                                color = MaterialTheme.colorScheme.onSurface
                                            )
                                            Text(
                                                text = customerProfile.customerPhone,
                                                fontSize = 14.sp,
                                                color = MaterialTheme.colorScheme.onSurfaceVariant
                                            )
                                        }
                                    }

                                    // Quick Communication Actions
                                    Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                        IconButton(
                                            onClick = {
                                                CommunicationHelper.makePhoneCall(context, customerProfile.customerPhone)
                                            },
                                            modifier = Modifier
                                                .size(38.dp)
                                                .clip(CircleShape)
                                                .background(ElectricCyan.copy(alpha = 0.15f))
                                        ) {
                                            Icon(
                                                Icons.Default.Phone,
                                                contentDescription = "Call",
                                                tint = ElectricCyan,
                                                modifier = Modifier.size(18.dp)
                                            )
                                        }

                                        IconButton(
                                            onClick = {
                                                CommunicationHelper.openWhatsApp(context, customerProfile.customerPhone, "Hello ${customerProfile.customerName}, regarding your repair jobs at CHAND BROTHERS...")
                                            },
                                            modifier = Modifier
                                                .size(38.dp)
                                                .clip(CircleShape)
                                                .background(AccentEmerald.copy(alpha = 0.15f))
                                        ) {
                                            Icon(
                                                Icons.Default.Message,
                                                contentDescription = "WhatsApp",
                                                tint = AccentEmerald,
                                                modifier = Modifier.size(18.dp)
                                            )
                                        }
                                    }
                                }

                                HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f))

                                // Summary Metrics Row
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceAround
                                ) {
                                    MetricColumn(
                                        title = "TOTAL JOBS",
                                        value = "${customerProfile.totalJobsCount}",
                                        color = SkyBluePrimary
                                    )
                                    MetricColumn(
                                        title = "TOTAL SPENT",
                                        value = "₹${String.format("%.2f", customerProfile.totalAmountSpent)}",
                                        color = AccentEmerald
                                    )
                                    MetricColumn(
                                        title = "PENDING DUE",
                                        value = "₹${String.format("%.2f", customerProfile.totalPendingBalance)}",
                                        color = if (customerProfile.totalPendingBalance > 0) AccentRose else MaterialTheme.colorScheme.onSurface
                                    )
                                }
                            }
                        }
                    }

                    // 2. Section Header: Repair History Timeline
                    item {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(top = 8.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "REPAIR HISTORY TIMELINE",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.ExtraBold,
                                color = SkyBluePrimary,
                                letterSpacing = 1.sp
                            )
                            Text(
                                text = "Sorted by newest date",
                                fontSize = 11.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }

                    if (sortedTickets.isEmpty()) {
                        item {
                            Card(
                                shape = RoundedCornerShape(16.dp),
                                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 20.dp)
                            ) {
                                Column(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(32.dp),
                                    horizontalAlignment = Alignment.CenterHorizontally,
                                    verticalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    Icon(
                                        Icons.Default.Build,
                                        contentDescription = null,
                                        tint = MaterialTheme.colorScheme.outline,
                                        modifier = Modifier.size(48.dp)
                                    )
                                    Text(
                                        text = "No repair history found",
                                        fontSize = 15.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = MaterialTheme.colorScheme.onSurface
                                    )
                                    Text(
                                        text = "Tap 'New Repair' above to register the first ticket for this customer.",
                                        fontSize = 12.sp,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }
                            }
                        }
                    } else {
                        items(sortedTickets, key = { it.id }) { ticket ->
                            CustomerTicketHistoryCard(
                                ticket = ticket,
                                onClick = {
                                    onDismiss()
                                    onSelectTicket(ticket)
                                }
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun MetricColumn(
    title: String,
    value: String,
    color: Color
) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(
            text = title,
            fontSize = 9.sp,
            fontWeight = FontWeight.ExtraBold,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            letterSpacing = 0.5.sp
        )
        Spacer(modifier = Modifier.height(2.dp))
        Text(
            text = value,
            fontSize = 15.sp,
            fontWeight = FontWeight.ExtraBold,
            color = color
        )
    }
}

@Composable
fun CustomerTicketHistoryCard(
    ticket: RepairTicket,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val formattedDate = remember(ticket.dateCreatedMillis) {
        if (ticket.dateCreatedMillis > 0) {
            SimpleDateFormat("dd MMM yyyy, hh:mm a", Locale.getDefault()).format(Date(ticket.dateCreatedMillis))
        } else {
            "N/A"
        }
    }

    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        ),
        elevation = CardDefaults.cardElevation(2.dp),
        modifier = modifier
            .fillMaxWidth()
            .clickable { onClick() }
            .testTag("customer_ticket_history_item_${ticket.id}")
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            // Header Row: Ticket # & Date
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Surface(
                        shape = RoundedCornerShape(6.dp),
                        color = SkyBluePrimary.copy(alpha = 0.15f)
                    ) {
                        Text(
                            text = ticket.ticketNumber,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = SkyBluePrimary,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                        )
                    }

                    if (ticket.isPriority) {
                        Surface(
                            shape = RoundedCornerShape(6.dp),
                            color = AccentRose.copy(alpha = 0.15f)
                        ) {
                            Text(
                                text = "PRIORITY",
                                fontSize = 9.sp,
                                fontWeight = FontWeight.ExtraBold,
                                color = AccentRose,
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 3.dp)
                            )
                        }
                    }
                }

                StatusBadge(status = ticket.currentStatusEnum, isSmall = true)
            }

            // Device Info Row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Icon(
                        Icons.Default.Smartphone,
                        contentDescription = null,
                        tint = SkyBluePrimary,
                        modifier = Modifier.size(20.dp)
                    )
                    Text(
                        text = "${ticket.mobileBrand} ${ticket.mobileModel}",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                }

                Text(
                    text = formattedDate,
                    fontSize = 11.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            // Issue Description & Serial/IMEI
            Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                Text(
                    text = "Issue: ${ticket.issueDescription.ifEmpty { ticket.issueCategory }}",
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Medium,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.85f),
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis
                )
                if (ticket.serialOrImei.isNotEmpty()) {
                    Text(
                        text = "IMEI/Serial: ${ticket.serialOrImei}",
                        fontSize = 11.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }

            HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.4f))

            // Cost Details & Arrow Navigation
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                    Column {
                        Text("TOTAL COST", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        Text(
                            text = "₹${String.format("%.2f", ticket.formattedTotalCost)}",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    }

                    Column {
                        Text("ADVANCE", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        Text(
                            text = "₹${String.format("%.2f", ticket.advancePaid)}",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold,
                            color = AccentEmerald
                        )
                    }

                    if (ticket.balanceDue > 0) {
                        Column {
                            Text("DUE", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = AccentRose)
                            Text(
                                text = "₹${String.format("%.2f", ticket.balanceDue)}",
                                fontSize = 13.sp,
                                fontWeight = FontWeight.ExtraBold,
                                color = AccentRose
                            )
                        }
                    }
                }

                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Text("View Ticket", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = SkyBluePrimary)
                    Icon(
                        Icons.AutoMirrored.Filled.ArrowForward,
                        contentDescription = "View Details",
                        tint = SkyBluePrimary,
                        modifier = Modifier.size(16.dp)
                    )
                }
            }
        }
    }
}
