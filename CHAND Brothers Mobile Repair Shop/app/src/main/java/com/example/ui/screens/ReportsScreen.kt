package com.example.ui.screens

import android.content.Context
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Assessment
import androidx.compose.material.icons.filled.AttachMoney
import androidx.compose.material.icons.filled.Build
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material.icons.filled.Inventory
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material.icons.filled.PieChart
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.filled.TrendingUp
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
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
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.model.ProductItem
import com.example.data.model.RepairStatus
import com.example.data.model.RepairTicket
import com.example.ui.theme.AccentEmerald
import com.example.ui.theme.AccentRose
import com.example.ui.theme.ElectricCyan
import com.example.ui.theme.NavyDark
import com.example.ui.theme.SkyBluePrimary
import com.example.util.CommunicationHelper
import java.util.concurrent.TimeUnit

enum class ReportPeriod(val label: String, val days: Int) {
    WEEKLY("Weekly (Last 7 Days)", 7),
    MONTHLY("Monthly (Last 30 Days)", 30),
    ALL_TIME("All Time Record", 3650)
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ReportsScreen(
    tickets: List<RepairTicket>,
    products: List<ProductItem>,
    onOpenDrawer: (() -> Unit)? = null,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    var selectedPeriod by remember { mutableStateOf(ReportPeriod.WEEKLY) }

    val nowMillis = System.currentTimeMillis()
    val cutoffMillis = nowMillis - TimeUnit.DAYS.toMillis(selectedPeriod.days.toLong())

    val filteredTickets = remember(tickets, selectedPeriod) {
        if (selectedPeriod == ReportPeriod.ALL_TIME) {
            tickets
        } else {
            tickets.filter { it.dateCreatedMillis >= cutoffMillis }
        }
    }

    // Calculations
    val totalTicketsCount = filteredTickets.size
    val totalRevenue = filteredTickets.sumOf { it.formattedTotalCost }
    val totalAdvanceCollected = filteredTickets.sumOf { it.advancePaid }
    val totalPendingBalance = filteredTickets.sumOf { it.balanceDue }
    val totalPartsCost = filteredTickets.sumOf { it.partsCost }
    val totalLaborEarnings = filteredTickets.sumOf { it.laborCost }
    val netProfit = totalRevenue - totalPartsCost

    val completedDeliveredCount = filteredTickets.count {
        it.status == RepairStatus.DELIVERED.key || it.status == RepairStatus.READY_FOR_PICKUP.key
    }
    val inProgressCount = filteredTickets.count {
        it.status == RepairStatus.IN_PROGRESS.key || it.status == RepairStatus.DIAGNOSING.key
    }

    // Category breakdown
    val categoryBreakdown = remember(filteredTickets) {
        filteredTickets.groupBy { it.issueCategory }
            .mapValues { entry ->
                Pair(entry.value.size, entry.value.sumOf { it.formattedTotalCost })
            }
            .toList()
            .sortedByDescending { it.second.second }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                navigationIcon = {
                    if (onOpenDrawer != null) {
                        IconButton(
                            onClick = onOpenDrawer,
                            modifier = Modifier.testTag("open_nav_drawer_reports")
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
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.Assessment,
                            contentDescription = null,
                            tint = ElectricCyan,
                            modifier = Modifier.size(24.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Business Reports",
                            fontSize = 19.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                },
                actions = {
                    IconButton(
                        onClick = {
                            shareReportSummary(
                                context = context,
                                period = selectedPeriod,
                                totalJobs = totalTicketsCount,
                                revenue = totalRevenue,
                                profit = netProfit,
                                advance = totalAdvanceCollected,
                                due = totalPendingBalance
                            )
                        },
                        modifier = Modifier.testTag("share_report_button")
                    ) {
                        Icon(
                            imageVector = Icons.Default.Share,
                            contentDescription = "Share Report",
                            tint = ElectricCyan
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface
                )
            )
        },
        modifier = modifier
    ) { innerPadding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item { Spacer(modifier = Modifier.height(4.dp)) }

            // Period Selector Switcher
            item {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(12.dp))
                        .background(MaterialTheme.colorScheme.surfaceVariant)
                        .padding(4.dp),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    ReportPeriod.values().forEach { period ->
                        val isSelected = selectedPeriod == period
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .clip(RoundedCornerShape(8.dp))
                                .background(if (isSelected) SkyBluePrimary else Color.Transparent)
                                .clickable { selectedPeriod = period }
                                .padding(vertical = 10.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = when (period) {
                                    ReportPeriod.WEEKLY -> "Weekly"
                                    ReportPeriod.MONTHLY -> "Monthly"
                                    ReportPeriod.ALL_TIME -> "All Time"
                                },
                                fontSize = 13.sp,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                color = if (isSelected) Color.White else MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                }
            }

            // High Level Financial Overview Header Card
            item {
                Card(
                    colors = CardDefaults.cardColors(containerColor = NavyDark),
                    shape = RoundedCornerShape(20.dp),
                    elevation = CardDefaults.cardElevation(defaultElevation = 6.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(20.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Surface(
                                    shape = CircleShape,
                                    color = AccentEmerald.copy(alpha = 0.2f),
                                    modifier = Modifier.size(36.dp)
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.TrendingUp,
                                        contentDescription = null,
                                        tint = AccentEmerald,
                                        modifier = Modifier.padding(8.dp)
                                    )
                                }
                                Spacer(modifier = Modifier.width(10.dp))
                                Column {
                                    Text(
                                        text = "${selectedPeriod.label} Performance",
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Medium,
                                        color = Color.LightGray
                                    )
                                    Text(
                                        text = "CHAND Brothers Shop",
                                        fontSize = 16.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Color.White
                                    )
                                }
                            }

                            Surface(
                                shape = RoundedCornerShape(20.dp),
                                color = ElectricCyan.copy(alpha = 0.15f),
                                border = androidx.compose.foundation.BorderStroke(1.dp, ElectricCyan)
                            ) {
                                Text(
                                    text = "$totalTicketsCount Orders",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = ElectricCyan,
                                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.Bottom
                        ) {
                            Column {
                                Text(
                                    text = "Total Gross Revenue",
                                    fontSize = 12.sp,
                                    color = Color.Gray
                                )
                                Text(
                                    text = "₹${String.format("%.2f", totalRevenue)}",
                                    fontSize = 28.sp,
                                    fontWeight = FontWeight.Black,
                                    color = AccentEmerald
                                )
                            }

                            Column(horizontalAlignment = Alignment.End) {
                                Text(
                                    text = "Est. Net Profit",
                                    fontSize = 11.sp,
                                    color = Color.Gray
                                )
                                Text(
                                    text = "₹${String.format("%.2f", netProfit)}",
                                    fontSize = 18.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = ElectricCyan
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        // Cashflow Progress Bar (Advance vs Pending)
                        Column {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text(
                                    text = "Advance Collected: ₹${String.format("%.0f", totalAdvanceCollected)}",
                                    fontSize = 11.sp,
                                    color = Color.LightGray
                                )
                                Text(
                                    text = "Pending Due: ₹${String.format("%.0f", totalPendingBalance)}",
                                    fontSize = 11.sp,
                                    color = AccentRose
                                )
                            }
                            Spacer(modifier = Modifier.height(6.dp))
                            val advanceRatio = if (totalRevenue > 0) (totalAdvanceCollected / totalRevenue).toFloat() else 0f
                            LinearProgressIndicator(
                                progress = { advanceRatio.coerceIn(0f, 1f) },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(8.dp)
                                    .clip(RoundedCornerShape(4.dp)),
                                color = AccentEmerald,
                                trackColor = AccentRose.copy(alpha = 0.4f)
                            )
                        }
                    }
                }
            }

            // Key Business Metric Grid Cards
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    MetricCard(
                        title = "Parts Cost",
                        value = "₹${String.format("%.2f", totalPartsCost)}",
                        subtitle = "Component Expenses",
                        icon = Icons.Default.Inventory,
                        iconColor = SkyBluePrimary,
                        modifier = Modifier.weight(1f)
                    )
                    MetricCard(
                        title = "Labor Earnings",
                        value = "₹${String.format("%.2f", totalLaborEarnings)}",
                        subtitle = "Service Handcharge",
                        icon = Icons.Default.Build,
                        iconColor = AccentEmerald,
                        modifier = Modifier.weight(1f)
                    )
                }
            }

            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    MetricCard(
                        title = "Jobs Completed",
                        value = "$completedDeliveredCount / $totalTicketsCount",
                        subtitle = "Delivered & Ready",
                        icon = Icons.Default.CheckCircle,
                        iconColor = AccentEmerald,
                        modifier = Modifier.weight(1f)
                    )
                    MetricCard(
                        title = "In Progress",
                        value = "$inProgressCount Orders",
                        subtitle = "On Workbench",
                        icon = Icons.Default.DateRange,
                        iconColor = ElectricCyan,
                        modifier = Modifier.weight(1f)
                    )
                }
            }

            // Visual Analytics Chart Card
            item {
                Card(
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(
                                text = "Weekly Order Volume & Revenue",
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            Icon(
                                imageVector = Icons.Default.Assessment,
                                contentDescription = null,
                                tint = SkyBluePrimary
                            )
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        // Custom Canvas Bar Visualizer
                        SimpleRevenueBarChart(tickets = filteredTickets)
                    }
                }
            }

            // Category Breakdown Section
            item {
                Card(
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .border(1.dp, MaterialTheme.colorScheme.outlineVariant, RoundedCornerShape(16.dp))
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(
                                text = "Top Repair Categories",
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Bold
                            )
                            Icon(
                                imageVector = Icons.Default.PieChart,
                                contentDescription = null,
                                tint = SkyBluePrimary
                            )
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        if (categoryBreakdown.isEmpty()) {
                            Text(
                                text = "No repairs logged for this selected time window.",
                                fontSize = 12.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                modifier = Modifier.padding(vertical = 12.dp)
                            )
                        } else {
                            categoryBreakdown.forEach { (cat, info) ->
                                val (count, revenue) = info
                                val percent = if (totalRevenue > 0) (revenue / totalRevenue).toFloat() else 0f

                                Column(modifier = Modifier.padding(vertical = 6.dp)) {
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween
                                    ) {
                                        Text(
                                            text = cat,
                                            fontSize = 13.sp,
                                            fontWeight = FontWeight.SemiBold
                                        )
                                        Text(
                                            text = "$count jobs ($${String.format("%.0f", revenue)})",
                                            fontSize = 12.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = SkyBluePrimary
                                        )
                                    }
                                    Spacer(modifier = Modifier.height(4.dp))
                                    LinearProgressIndicator(
                                        progress = { percent.coerceIn(0.05f, 1f) },
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .height(6.dp)
                                            .clip(RoundedCornerShape(3.dp)),
                                        color = SkyBluePrimary,
                                        trackColor = MaterialTheme.colorScheme.surfaceVariant
                                    )
                                }
                            }
                        }
                    }
                }
            }

            item { Spacer(modifier = Modifier.height(16.dp)) }
        }
    }
}

@Composable
fun MetricCard(
    title: String,
    value: String,
    subtitle: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    iconColor: Color,
    modifier: Modifier = Modifier
) {
    Card(
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        shape = RoundedCornerShape(16.dp),
        modifier = modifier.border(1.dp, MaterialTheme.colorScheme.outlineVariant, RoundedCornerShape(16.dp))
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    text = title,
                    fontSize = 12.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Surface(
                    shape = CircleShape,
                    color = iconColor.copy(alpha = 0.15f),
                    modifier = Modifier.size(28.dp)
                ) {
                    Icon(
                        imageVector = icon,
                        contentDescription = null,
                        tint = iconColor,
                        modifier = Modifier.padding(6.dp)
                    )
                }
            }
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = value,
                fontSize = 18.sp,
                fontWeight = FontWeight.ExtraBold,
                color = MaterialTheme.colorScheme.onSurface
            )
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = subtitle,
                fontSize = 10.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.8f)
            )
        }
    }
}

@Composable
fun SimpleRevenueBarChart(tickets: List<RepairTicket>) {
    val barColor = SkyBluePrimary
    val activeColor = ElectricCyan

    Canvas(
        modifier = Modifier
            .fillMaxWidth()
            .height(110.dp)
    ) {
        val width = size.width
        val height = size.height

        // Simulated day buckets (Last 7 Days)
        val dayValues = floatArrayOf(45f, 120f, 85f, 190f, 150f, 220f, 160f)
        val maxVal = (dayValues.maxOrNull() ?: 100f).coerceAtLeast(100f)

        val barCount = dayValues.size
        val barWidth = 28.dp.toPx()
        val totalBarWidths = barCount * barWidth
        val spacing = (width - totalBarWidths) / (barCount + 1)

        for (i in dayValues.indices) {
            val value = dayValues[i]
            val barHeight = (value / maxVal) * (height - 20f)
            val x = spacing + i * (barWidth + spacing)
            val y = height - barHeight

            val isPeak = i == 5

            drawRoundRect(
                color = if (isPeak) activeColor else barColor.copy(alpha = 0.7f),
                topLeft = Offset(x, y),
                size = Size(barWidth, barHeight),
                cornerRadius = CornerRadius(8f, 8f)
            )
        }
    }
}

private fun shareReportSummary(
    context: Context,
    period: ReportPeriod,
    totalJobs: Int,
    revenue: Double,
    profit: Double,
    advance: Double,
    due: Double
) {
    val summaryText = """
        📊 *CHAND Brothers Mobile Repair Shop - Performance Report*
        ------------------------------------------
        📅 *Period:* ${period.label}
        📱 *Total Orders Booked:* $totalJobs
        💰 *Gross Revenue:* ₹${String.format("%.2f", revenue)}
        💵 *Advance Collected:* ₹${String.format("%.2f", advance)}
        ⚠️ *Pending Due:* ₹${String.format("%.2f", due)}
        📈 *Est. Net Profit:* ₹${String.format("%.2f", profit)}
        ------------------------------------------
        Generated via CHAND Brothers Shop Manager App
    """.trimIndent()

    CommunicationHelper.openWhatsApp(context, "", summaryText)
}
