package com.example.ui.screens

import android.text.format.DateFormat
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Build
import androidx.compose.material.icons.filled.Chat
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.Key
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material.icons.filled.PriorityHigh
import androidx.compose.material.icons.filled.Receipt
import androidx.compose.material.icons.filled.Save
import androidx.compose.material.icons.filled.Sms
import androidx.compose.material.icons.filled.Smartphone
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.RepairStatus
import com.example.data.model.RepairTicket
import com.example.data.model.CustomerProfile
import com.example.ui.components.CustomerHistoryDialog
import com.example.ui.components.StatusBadge
import com.example.ui.components.StatusTimeline
import com.example.ui.theme.AccentEmerald
import com.example.ui.theme.AccentRose
import com.example.ui.theme.ElectricCyan
import com.example.ui.theme.SkyBluePrimary
import com.example.util.CommunicationHelper
import java.util.Date

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TicketDetailScreen(
    ticket: RepairTicket,
    allTickets: List<RepairTicket> = emptyList(),
    onBack: () -> Unit,
    onStatusChanged: (RepairStatus, String) -> Unit,
    onEditTicket: (RepairTicket) -> Unit,
    onShowReceipt: (RepairTicket) -> Unit,
    onDeleteTicket: (RepairTicket) -> Unit,
    onSendSmsAlert: (RepairTicket) -> Unit,
    onSelectTicket: ((RepairTicket) -> Unit)? = null,
    onNewTicketForCustomer: ((String, String) -> Unit)? = null,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    var technicianNotesText by remember(ticket) { mutableStateOf(ticket.technicianNotes) }
    var isNotesEditing by remember { mutableStateOf(false) }
    var showCustomerHistoryDialog by remember { mutableStateOf(false) }

    val customerTickets = remember(ticket.customerPhone, allTickets) {
        allTickets.filter { it.customerPhone.trim() == ticket.customerPhone.trim() }
    }
    val customerJobCount = customerTickets.size.coerceAtLeast(1)

    val formattedCreated = DateFormat.format("MMM dd, yyyy • hh:mm a", Date(ticket.dateCreatedMillis)).toString()
    val formattedUpdated = DateFormat.format("MMM dd, yyyy • hh:mm a", Date(ticket.dateUpdatedMillis)).toString()

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = "Ticket #${ticket.ticketNumber}",
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            if (ticket.isPriority) {
                                Spacer(modifier = Modifier.width(8.dp))
                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(4.dp))
                                        .background(AccentRose)
                                        .padding(horizontal = 6.dp, vertical = 2.dp)
                                ) {
                                    Text("PRIORITY", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = Color.White)
                                }
                            }
                        }
                        Text(
                            text = "Created: $formattedCreated",
                            fontSize = 11.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(imageVector = Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                },
                actions = {
                    IconButton(onClick = { onShowReceipt(ticket) }) {
                        Icon(imageVector = Icons.Default.Receipt, contentDescription = "Receipt", tint = ElectricCyan)
                    }
                    IconButton(onClick = { onEditTicket(ticket) }) {
                        Icon(imageVector = Icons.Default.Edit, contentDescription = "Edit Ticket", tint = ElectricCyan)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = MaterialTheme.colorScheme.background)
            )
        },
        modifier = modifier
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // 1. Real-Time Status Lifecycle Stepper
            StatusTimeline(
                currentStatus = ticket.currentStatusEnum,
                onStatusSelected = { newStatus ->
                    onStatusChanged(newStatus, technicianNotesText)
                }
            )

            // 2. Customer Contact Card with Quick Action Buttons
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.3f))
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "CUSTOMER CONTACT",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = ElectricCyan,
                        letterSpacing = 1.sp
                    )
                    Spacer(modifier = Modifier.height(10.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .size(38.dp)
                                    .clip(CircleShape)
                                    .background(ElectricCyan.copy(alpha = 0.2f)),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(imageVector = Icons.Default.Person, contentDescription = null, tint = ElectricCyan, modifier = Modifier.size(20.dp))
                            }
                            Spacer(modifier = Modifier.width(10.dp))
                            Column {
                                Text(text = ticket.customerName, fontSize = 16.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurface)
                                Text(text = ticket.customerPhone, fontSize = 13.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            }
                        }

                        StatusBadge(status = ticket.currentStatusEnum, isSmall = true)
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    // 1-Tap Communication Row
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Button(
                            onClick = { CommunicationHelper.makePhoneCall(context, ticket.customerPhone) },
                            modifier = Modifier
                                .weight(1f)
                                .testTag("detail_call_btn"),
                            colors = ButtonDefaults.buttonColors(containerColor = ElectricCyan.copy(alpha = 0.2f), contentColor = ElectricCyan),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Icon(imageVector = Icons.Default.Phone, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Call", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        }

                        Button(
                            onClick = { onSendSmsAlert(ticket) },
                            modifier = Modifier
                                .weight(1f)
                                .testTag("detail_sms_btn"),
                            colors = ButtonDefaults.buttonColors(containerColor = AccentEmerald.copy(alpha = 0.2f), contentColor = AccentEmerald),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Icon(imageVector = Icons.Default.Sms, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("SMS Alert", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        }

                        Button(
                            onClick = {
                                val msg = "Hi ${ticket.customerName}, status update for your ${ticket.mobileBrand} ${ticket.mobileModel} (Ticket #${ticket.ticketNumber}): ${ticket.currentStatusEnum.displayName}"
                                CommunicationHelper.openWhatsApp(context, ticket.customerPhone, msg)
                            },
                            modifier = Modifier
                                .weight(1.1f)
                                .testTag("detail_whatsapp_btn"),
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF25D366).copy(alpha = 0.2f), contentColor = Color(0xFF25D366)),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Icon(imageVector = Icons.Default.Chat, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("WhatsApp", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    OutlinedButton(
                        onClick = { showCustomerHistoryDialog = true },
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("view_customer_repair_history_btn"),
                        shape = RoundedCornerShape(10.dp),
                        colors = ButtonDefaults.outlinedButtonColors(
                            contentColor = SkyBluePrimary
                        ),
                        border = androidx.compose.foundation.BorderStroke(1.dp, SkyBluePrimary.copy(alpha = 0.5f))
                    ) {
                        Icon(imageVector = Icons.Default.History, contentDescription = null, modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "View Customer Profile & History ($customerJobCount ${if (customerJobCount == 1) "repair" else "repairs"})",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }

            // 3. Mobile Device & Problem Diagnostics Card
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.3f))
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "DEVICE & ISSUE DIAGNOSTICS",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = ElectricCyan,
                        letterSpacing = 1.sp
                    )
                    Spacer(modifier = Modifier.height(10.dp))

                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(imageVector = Icons.Default.Smartphone, contentDescription = null, tint = ElectricCyan, modifier = Modifier.size(22.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "${ticket.mobileBrand} ${ticket.mobileModel}",
                            fontSize = 17.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    DetailRow(label = "Issue Category", value = ticket.issueCategory, valueColor = ElectricCyan)
                    if (ticket.issueDescription.isNotBlank()) {
                        DetailRow(label = "Problem Notes", value = ticket.issueDescription)
                    }
                    if (ticket.serialOrImei.isNotBlank()) {
                        DetailRow(label = "IMEI / Serial", value = ticket.serialOrImei)
                    }
                    if (ticket.customerPasscode.isNotBlank()) {
                        DetailRow(label = "Customer Passcode", value = ticket.customerPasscode, valueColor = AccentEmerald)
                    }
                    DetailRow(label = "Physical Condition", value = ticket.deviceCondition)
                }
            }

            // 4. Financial & Payment Status Card
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.3f))
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "FINANCIAL BREAKDOWN",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = ElectricCyan,
                            letterSpacing = 1.sp
                        )

                        Text(
                            text = if (ticket.balanceDue <= 0) "PAID IN FULL" else "BALANCE DUE",
                            fontSize = 10.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = if (ticket.balanceDue <= 0) AccentEmerald else AccentRose
                        )
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    if (ticket.partsCost > 0) {
                        DetailRow(label = "Spare Parts Cost", value = "₹${String.format("%.2f", ticket.partsCost)}")
                    }
                    if (ticket.laborCost > 0) {
                        DetailRow(label = "Labor Charge", value = "₹${String.format("%.2f", ticket.laborCost)}")
                    }
                    DetailRow(label = "Total Estimated Cost", value = "₹${String.format("%.2f", ticket.formattedTotalCost)}", isBold = true)
                    DetailRow(label = "Advance Deposit Paid", value = "-₹${String.format("%.2f", ticket.advancePaid)}", valueColor = AccentEmerald)

                    HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp), color = MaterialTheme.colorScheme.outline.copy(alpha = 0.3f))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(text = "Remaining Due", fontSize = 15.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurface)
                        Text(
                            text = "₹${String.format("%.2f", ticket.balanceDue)}",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = if (ticket.balanceDue > 0) AccentRose else AccentEmerald
                        )
                    }
                }
            }

            // 5. Technician Work Logs Card
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.3f))
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "TECHNICIAN REPAIR LOG",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = ElectricCyan,
                            letterSpacing = 1.sp
                        )
                        IconButton(
                            onClick = {
                                if (isNotesEditing) {
                                    onStatusChanged(ticket.currentStatusEnum, technicianNotesText)
                                }
                                isNotesEditing = !isNotesEditing
                            },
                            modifier = Modifier.size(28.dp)
                        ) {
                            Icon(
                                imageVector = if (isNotesEditing) Icons.Default.Save else Icons.Default.Edit,
                                contentDescription = "Edit Notes",
                                tint = ElectricCyan,
                                modifier = Modifier.size(16.dp)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    if (isNotesEditing) {
                        OutlinedTextField(
                            value = technicianNotesText,
                            onValueChange = { technicianNotesText = it },
                            label = { Text("Technician Log Notes") },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(100.dp)
                                .testTag("tech_notes_input"),
                            shape = RoundedCornerShape(10.dp)
                        )
                    } else {
                        Text(
                            text = if (technicianNotesText.isNotBlank()) technicianNotesText else "No technician notes logged yet.",
                            fontSize = 13.sp,
                            color = if (technicianNotesText.isNotBlank()) MaterialTheme.colorScheme.onSurface else MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }

            // 6. Footer Actions: Receipt & Delete Ticket
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 8.dp),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Button(
                    onClick = { onShowReceipt(ticket) },
                    modifier = Modifier
                        .weight(1f)
                        .height(48.dp)
                        .testTag("view_receipt_btn"),
                    colors = ButtonDefaults.buttonColors(containerColor = ElectricCyan, contentColor = Color.White),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Icon(imageVector = Icons.Default.Receipt, contentDescription = null, modifier = Modifier.size(18.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("View Job Receipt", fontWeight = FontWeight.Bold)
                }

                OutlinedButton(
                    onClick = { onDeleteTicket(ticket) },
                    modifier = Modifier
                        .weight(0.7f)
                        .height(48.dp)
                        .testTag("delete_ticket_btn"),
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = AccentRose),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Icon(imageVector = Icons.Default.Delete, contentDescription = null, tint = AccentRose, modifier = Modifier.size(18.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Delete", fontWeight = FontWeight.Bold)
                }
            }
        }
    }

    if (showCustomerHistoryDialog) {
        CustomerHistoryDialog(
            customerProfile = CustomerProfile(
                customerPhone = ticket.customerPhone,
                customerName = ticket.customerName,
                tickets = customerTickets
            ),
            onDismiss = { showCustomerHistoryDialog = false },
            onSelectTicket = { selectedTicket ->
                showCustomerHistoryDialog = false
                onSelectTicket?.invoke(selectedTicket)
            },
            onNewTicketForCustomer = { name, phone ->
                showCustomerHistoryDialog = false
                onNewTicketForCustomer?.invoke(name, phone)
            }
        )
    }
}

@Composable
private fun DetailRow(
    label: String,
    value: String,
    valueColor: Color = MaterialTheme.colorScheme.onSurface,
    isBold: Boolean = false
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(text = label, fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
        Text(
            text = value,
            fontSize = 13.sp,
            fontWeight = if (isBold) FontWeight.Bold else FontWeight.Medium,
            color = valueColor
        )
    }
}
