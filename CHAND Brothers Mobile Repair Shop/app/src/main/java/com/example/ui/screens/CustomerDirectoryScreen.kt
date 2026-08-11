package com.example.ui.screens

import androidx.compose.foundation.background
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
import com.example.data.model.CustomerProfile
import com.example.data.model.RepairTicket
import com.example.ui.components.CustomerHistoryDialog
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
fun CustomerDirectoryScreen(
    tickets: List<RepairTicket>,
    onSelectTicket: (RepairTicket) -> Unit,
    onNewTicketForCustomer: (customerName: String, customerPhone: String) -> Unit,
    onOpenDrawer: (() -> Unit)? = null,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    var searchQuery by remember { mutableStateOf("") }
    var selectedCustomerForHistory by remember { mutableStateOf<CustomerProfile?>(null) }

    // Group tickets by customer phone
    val customerProfiles = remember(tickets) {
        tickets
            .groupBy { it.customerPhone.trim() }
            .map { (phone, ticketList) ->
                val name = ticketList.firstOrNull { it.customerName.isNotBlank() }?.customerName ?: "Customer"
                CustomerProfile(
                    customerPhone = phone,
                    customerName = name,
                    tickets = ticketList
                )
            }
            .sortedByDescending { it.lastVisitMillis }
    }

    val filteredCustomers = remember(customerProfiles, searchQuery) {
        if (searchQuery.isBlank()) {
            customerProfiles
        } else {
            val q = searchQuery.lowercase().trim()
            customerProfiles.filter {
                it.customerName.lowercase().contains(q) ||
                        it.customerPhone.lowercase().contains(q) ||
                        it.tickets.any { t ->
                            t.mobileBrand.lowercase().contains(q) ||
                                    t.mobileModel.lowercase().contains(q) ||
                                    t.ticketNumber.lowercase().contains(q)
                        }
            }
        }
    }

    val totalCustomersCount = customerProfiles.size
    val totalPendingDue = customerProfiles.sumOf { it.totalPendingBalance }
    val totalCustomerRevenue = customerProfiles.sumOf { it.totalAmountSpent }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = "Customer Profiles & History",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "$totalCustomersCount Total Registered Customers",
                            fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                },
                navigationIcon = {
                    if (onOpenDrawer != null) {
                        IconButton(onClick = onOpenDrawer) {
                            Icon(Icons.Default.Menu, contentDescription = "Open Drawer", tint = SkyBluePrimary)
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface
                )
            )
        },
        modifier = modifier
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            // Search Bar
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                placeholder = { Text("Search by name, phone, or device model...") },
                leadingIcon = {
                    Icon(Icons.Default.Search, contentDescription = "Search", tint = SkyBluePrimary)
                },
                trailingIcon = {
                    if (searchQuery.isNotEmpty()) {
                        IconButton(onClick = { searchQuery = "" }) {
                            Icon(Icons.Default.Clear, contentDescription = "Clear search")
                        }
                    }
                },
                singleLine = true,
                shape = RoundedCornerShape(16.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = SkyBluePrimary,
                    unfocusedBorderColor = MaterialTheme.colorScheme.outline.copy(alpha = 0.3f)
                ),
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("customer_search_input")
            )

            // Top Summary Row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Card(
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = SkyBluePrimary.copy(alpha = 0.1f)),
                    modifier = Modifier.weight(1f)
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Text("TOTAL CUSTOMERS", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = SkyBluePrimary)
                        Text(
                            text = "$totalCustomersCount",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = SkyBluePrimary
                        )
                    }
                }

                Card(
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = AccentEmerald.copy(alpha = 0.1f)),
                    modifier = Modifier.weight(1f)
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Text("TOTAL REVENUE", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = AccentEmerald)
                        Text(
                            text = "₹${String.format("%.0f", totalCustomerRevenue)}",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = AccentEmerald
                        )
                    }
                }

                Card(
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = if (totalPendingDue > 0) AccentRose.copy(alpha = 0.1f) else MaterialTheme.colorScheme.surfaceVariant
                    ),
                    modifier = Modifier.weight(1f)
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Text("PENDING DUES", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = if (totalPendingDue > 0) AccentRose else MaterialTheme.colorScheme.onSurfaceVariant)
                        Text(
                            text = "₹${String.format("%.0f", totalPendingDue)}",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = if (totalPendingDue > 0) AccentRose else MaterialTheme.colorScheme.onSurface
                        )
                    }
                }
            }

            // Customer List
            if (filteredCustomers.isEmpty()) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .weight(1f),
                    contentAlignment = Alignment.Center
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Icon(
                            Icons.Default.PersonSearch,
                            contentDescription = null,
                            tint = MaterialTheme.colorScheme.outline,
                            modifier = Modifier.size(56.dp)
                        )
                        Text(
                            text = if (searchQuery.isNotEmpty()) "No customer matching '$searchQuery'" else "No customer profiles found",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    }
                }
            } else {
                LazyColumn(
                    modifier = Modifier.weight(1f),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    items(filteredCustomers, key = { it.customerPhone }) { customer ->
                        CustomerDirectoryCard(
                            customer = customer,
                            onClick = { selectedCustomerForHistory = customer },
                            onCallClick = { CommunicationHelper.makePhoneCall(context, customer.customerPhone) },
                            onWhatsAppClick = { CommunicationHelper.openWhatsApp(context, customer.customerPhone, "Hello ${customer.customerName}...") }
                        )
                    }
                }
            }
        }
    }

    // Customer History Dialog
    selectedCustomerForHistory?.let { customer ->
        CustomerHistoryDialog(
            customerProfile = customer,
            onDismiss = { selectedCustomerForHistory = null },
            onSelectTicket = { ticket ->
                selectedCustomerForHistory = null
                onSelectTicket(ticket)
            },
            onNewTicketForCustomer = { name, phone ->
                selectedCustomerForHistory = null
                onNewTicketForCustomer(name, phone)
            }
        )
    }
}

@Composable
fun CustomerDirectoryCard(
    customer: CustomerProfile,
    onClick: () -> Unit,
    onCallClick: () -> Unit,
    onWhatsAppClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val formattedLastVisit = remember(customer.lastVisitMillis) {
        if (customer.lastVisitMillis > 0) {
            SimpleDateFormat("dd MMM yyyy", Locale.getDefault()).format(Date(customer.lastVisitMillis))
        } else {
            "N/A"
        }
    }

    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(2.dp),
        modifier = modifier
            .fillMaxWidth()
            .clickable { onClick() }
            .testTag("customer_directory_card_${customer.customerPhone}")
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
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
                            .size(44.dp)
                            .clip(CircleShape)
                            .background(
                                Brush.linearGradient(
                                    colors = listOf(SkyBluePrimary, ElectricCyan)
                                )
                            ),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = customer.customerName.take(1).uppercase(),
                            fontSize = 20.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = Color.White
                        )
                    }

                    Column {
                        Text(
                            text = customer.customerName,
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Text(
                            text = customer.customerPhone,
                            fontSize = 13.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }

                // Call / WhatsApp Quick Actions
                Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                    IconButton(
                        onClick = onCallClick,
                        modifier = Modifier.size(34.dp)
                    ) {
                        Icon(Icons.Default.Phone, contentDescription = "Call", tint = ElectricCyan, modifier = Modifier.size(18.dp))
                    }
                    IconButton(
                        onClick = onWhatsAppClick,
                        modifier = Modifier.size(34.dp)
                    ) {
                        Icon(Icons.Default.Message, contentDescription = "WhatsApp", tint = AccentEmerald, modifier = Modifier.size(18.dp))
                    }
                }
            }

            HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.4f))

            // Sub-details & Total Jobs Badge
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp), verticalAlignment = Alignment.CenterVertically) {
                    Surface(
                        shape = RoundedCornerShape(8.dp),
                        color = SkyBluePrimary.copy(alpha = 0.15f)
                    ) {
                        Text(
                            text = "${customer.totalJobsCount} ${if (customer.totalJobsCount == 1) "Repair" else "Repairs"}",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = SkyBluePrimary,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                        )
                    }

                    if (customer.totalPendingBalance > 0) {
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = AccentRose.copy(alpha = 0.15f)
                        ) {
                            Text(
                                text = "Due: ₹${String.format("%.0f", customer.totalPendingBalance)}",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = AccentRose,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                            )
                        }
                    } else {
                        Text(
                            text = "Spent: ₹${String.format("%.0f", customer.totalAmountSpent)}",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = AccentEmerald
                        )
                    }
                }

                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Text(
                        text = "History",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = SkyBluePrimary
                    )
                    Icon(
                        Icons.AutoMirrored.Filled.ArrowForward,
                        contentDescription = "View History",
                        tint = SkyBluePrimary,
                        modifier = Modifier.size(16.dp)
                    )
                }
            }
        }
    }
}
