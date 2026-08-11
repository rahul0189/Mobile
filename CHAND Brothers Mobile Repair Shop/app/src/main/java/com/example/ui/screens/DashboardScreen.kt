package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Clear
import androidx.compose.material.icons.filled.CloudUpload
import androidx.compose.material.icons.filled.DoorSliding
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material.icons.filled.Message
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Smartphone
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
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
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.RepairStatus
import com.example.data.model.RepairTicket
import com.example.ui.components.QuickStatsHeader
import com.example.ui.components.TicketCard
import com.example.ui.theme.ElectricCyan

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    tickets: List<RepairTicket>,
    searchQuery: String,
    onSearchQueryChanged: (String) -> Unit,
    selectedFilter: String,
    onFilterSelected: (String) -> Unit,
    onTicketClick: (RepairTicket) -> Unit,
    onSendSmsClick: (RepairTicket) -> Unit,
    onNewTicketClick: () -> Unit,
    onOpenSmsTemplatesClick: () -> Unit,
    onOpenCloudSyncClick: (() -> Unit)? = null,
    onOpenDrawer: (() -> Unit)? = null,
    modifier: Modifier = Modifier
) {
    var isSearchActive by remember { mutableStateOf(false) }

    val filterChips = listOf(
        "ALL" to "All Jobs",
        RepairStatus.RECEIVED.key to "Received",
        RepairStatus.IN_PROGRESS.key to "In Repair",
        RepairStatus.WAITING_FOR_PARTS.key to "Parts Ordered",
        RepairStatus.READY_FOR_PICKUP.key to "Ready",
        RepairStatus.DELIVERED.key to "Delivered"
    )

    Scaffold(
        topBar = {
            TopAppBar(
                navigationIcon = {
                    if (onOpenDrawer != null) {
                        IconButton(
                            onClick = onOpenDrawer,
                            modifier = Modifier.testTag("open_nav_drawer_dashboard")
                        ) {
                            Icon(
                                imageVector = Icons.Default.Menu,
                                contentDescription = "Open Drawer",
                                tint = ElectricCyan
                            )
                        }
                    }
                },
                title = {
                    if (isSearchActive) {
                        OutlinedTextField(
                            value = searchQuery,
                            onValueChange = onSearchQueryChanged,
                            placeholder = { Text("Search customer, phone, ticket #...") },
                            trailingIcon = {
                                IconButton(onClick = {
                                    onSearchQueryChanged("")
                                    isSearchActive = false
                                }) {
                                    Icon(Icons.Default.Clear, contentDescription = "Clear")
                                }
                            },
                            singleLine = true,
                            modifier = Modifier
                                .fillMaxWidth()
                                .testTag("dashboard_search_input"),
                            shape = RoundedCornerShape(12.dp),
                            colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = ElectricCyan)
                        )
                    } else {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .size(34.dp)
                                    .clip(CircleShape)
                                    .background(ElectricCyan.copy(alpha = 0.2f)),
                                contentAlignment = Alignment.Center
                            ) {
                                androidx.compose.foundation.Image(
                                    painter = androidx.compose.ui.res.painterResource(id = com.example.R.drawable.ic_launcher_foreground),
                                    contentDescription = "CHAND Brothers Logo",
                                    modifier = Modifier.size(26.dp)
                                )
                            }
                            Spacer(modifier = Modifier.width(10.dp))
                            Text(
                                text = "CHAND Brothers Repair Shop",
                                fontSize = 20.sp,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                        }
                    }
                },
                actions = {
                    if (!isSearchActive) {
                        IconButton(
                            onClick = { isSearchActive = true },
                            modifier = Modifier.testTag("toggle_search_btn")
                        ) {
                            Icon(imageVector = Icons.Default.Search, contentDescription = "Search", tint = ElectricCyan)
                        }
                    }
                    if (onOpenCloudSyncClick != null) {
                        IconButton(
                            onClick = onOpenCloudSyncClick,
                            modifier = Modifier.testTag("cloud_sync_appbar_btn")
                        ) {
                            Icon(imageVector = Icons.Default.CloudUpload, contentDescription = "Google Drive Cloud Sync", tint = ElectricCyan)
                        }
                    }
                    IconButton(
                        onClick = onOpenSmsTemplatesClick,
                        modifier = Modifier.testTag("sms_settings_btn")
                    ) {
                        Icon(imageVector = Icons.Default.Message, contentDescription = "SMS Templates", tint = ElectricCyan)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = MaterialTheme.colorScheme.background)
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = onNewTicketClick,
                containerColor = ElectricCyan,
                contentColor = Color.White,
                shape = CircleShape,
                modifier = Modifier.testTag("add_ticket_fab")
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(imageVector = Icons.Default.Add, contentDescription = "New Repair Ticket")
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(text = "New Repair", fontWeight = FontWeight.Bold)
                }
            }
        },
        modifier = modifier
    ) { innerPadding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding),
            contentPadding = PaddingValues(bottom = 90.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            // Header KPI Stats Card
            item {
                QuickStatsHeader(
                    tickets = tickets,
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 4.dp)
                )
            }

            // Search Input Bar
            item {
                OutlinedTextField(
                    value = searchQuery,
                    onValueChange = onSearchQueryChanged,
                    placeholder = { Text("Search by customer name or mobile model...") },
                    leadingIcon = {
                        Icon(
                            imageVector = Icons.Default.Search,
                            contentDescription = "Search",
                            tint = ElectricCyan
                        )
                    },
                    trailingIcon = {
                        if (searchQuery.isNotEmpty()) {
                            IconButton(onClick = { onSearchQueryChanged("") }) {
                                Icon(
                                    imageVector = Icons.Default.Clear,
                                    contentDescription = "Clear search",
                                    tint = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }
                    },
                    singleLine = true,
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp)
                        .testTag("repair_search_bar"),
                    shape = RoundedCornerShape(12.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = ElectricCyan,
                        unfocusedBorderColor = MaterialTheme.colorScheme.outline
                    )
                )
            }

            // Status Filter Chips Row
            item {
                LazyRow(
                    contentPadding = PaddingValues(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(filterChips) { (key, label) ->
                        val isSelected = selectedFilter == key
                        Surface(
                            shape = RoundedCornerShape(10.dp),
                            color = if (isSelected) ElectricCyan else MaterialTheme.colorScheme.surfaceVariant,
                            modifier = Modifier
                                .clip(RoundedCornerShape(10.dp))
                                .clickable { onFilterSelected(key) }
                                .testTag("filter_chip_$key")
                        ) {
                            Text(
                                text = label,
                                fontSize = 12.sp,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                color = if (isSelected) Color.White else MaterialTheme.colorScheme.onSurface,
                                modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp)
                            )
                        }
                    }
                }
            }

            // Ticket List Count Header
            item {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "REPAIR ORDERS (${tickets.size})",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        letterSpacing = 1.sp
                    )

                    if (searchQuery.isNotBlank()) {
                        Text(
                            text = "Filter: \"$searchQuery\"",
                            fontSize = 11.sp,
                            color = ElectricCyan
                        )
                    }
                }
            }

            // Empty State view
            if (tickets.isEmpty()) {
                item {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(40.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Box(
                            modifier = Modifier
                                .size(64.dp)
                                .clip(CircleShape)
                                .background(ElectricCyan.copy(alpha = 0.15f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.Smartphone,
                                contentDescription = null,
                                tint = ElectricCyan,
                                modifier = Modifier.size(32.dp)
                            )
                        }
                        Spacer(modifier = Modifier.height(14.dp))
                        Text(
                            text = if (searchQuery.isNotBlank()) "No repair tickets found" else "No repair jobs recorded yet",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = if (searchQuery.isNotBlank()) "Try searching for another customer name, mobile model, or ticket #" else "Tap '+ New Repair' below to book your first customer job!",
                            fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            } else {
                // Ticket Cards
                items(tickets, key = { it.id }) { ticket ->
                    Box(modifier = Modifier.padding(horizontal = 16.dp)) {
                        TicketCard(
                            ticket = ticket,
                            onCardClick = { onTicketClick(ticket) },
                            onSendSmsClick = { onSendSmsClick(ticket) }
                        )
                    }
                }
            }
        }
    }
}
