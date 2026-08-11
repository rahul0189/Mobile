package com.example.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.AccentEmerald
import com.example.ui.theme.AccentRose
import com.example.ui.theme.ElectricCyan
import com.example.ui.theme.SkyBluePrimary

enum class AppNavDestination {
    REPAIR_TICKETS,
    PRODUCT_INVENTORY,
    CUSTOMERS,
    REPORTS,
    SMS_TEMPLATES,
    GOOGLE_CLOUD_SYNC
}

@Composable
fun SideNavDrawerContent(
    currentDestination: AppNavDestination,
    totalTicketCount: Int,
    lowStockCount: Int,
    userName: String = "Technician",
    userEmail: String = "chand.brothers.shop@gmail.com",
    authProvider: String = "Google",
    onDestinationSelected: (AppNavDestination) -> Unit,
    onLogout: () -> Unit = {},
    onCloseDrawer: () -> Unit
) {
    ModalDrawerSheet(
        drawerContainerColor = MaterialTheme.colorScheme.surface,
        drawerContentColor = MaterialTheme.colorScheme.onSurface,
        modifier = Modifier.width(300.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxHeight()
                .padding(16.dp)
        ) {
            // Header
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(16.dp))
                    .background(SkyBluePrimary.copy(alpha = 0.1f))
                    .padding(14.dp)
            ) {
                Column {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Surface(
                            modifier = Modifier.size(44.dp),
                            shape = CircleShape,
                            color = SkyBluePrimary.copy(alpha = 0.2f),
                            border = androidx.compose.foundation.BorderStroke(1.dp, ElectricCyan)
                        ) {
                            androidx.compose.foundation.Image(
                                painter = androidx.compose.ui.res.painterResource(id = com.example.R.drawable.ic_launcher_foreground),
                                contentDescription = "CHAND Brothers App Icon",
                                modifier = Modifier
                                    .padding(4.dp)
                                    .fillMaxSize()
                            )
                        }
                        Column {
                            Text(
                                text = "CHAND BROTHERS",
                                fontSize = 15.sp,
                                fontWeight = FontWeight.ExtraBold,
                                color = SkyBluePrimary,
                                letterSpacing = 1.sp
                            )
                            Text(
                                text = "Repair & Stock Manager",
                                fontSize = 11.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    // User Account Details Chip
                    Surface(
                        shape = RoundedCornerShape(10.dp),
                        color = MaterialTheme.colorScheme.surface.copy(alpha = 0.8f),
                        border = androidx.compose.foundation.BorderStroke(1.dp, ElectricCyan.copy(alpha = 0.3f)),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(
                                    imageVector = Icons.Default.AccountCircle,
                                    contentDescription = null,
                                    tint = ElectricCyan,
                                    modifier = Modifier.size(18.dp)
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Column {
                                    Text(
                                        text = userName,
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = MaterialTheme.colorScheme.onSurface
                                    )
                                    Text(
                                        text = userEmail,
                                        fontSize = 9.sp,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }
                            }
                            Surface(
                                shape = RoundedCornerShape(6.dp),
                                color = AccentEmerald.copy(alpha = 0.2f)
                            ) {
                                Text(
                                    text = authProvider,
                                    fontSize = 8.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = AccentEmerald,
                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    Row(
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = AccentEmerald.copy(alpha = 0.15f)
                        ) {
                            Text(
                                text = "● $totalTicketCount Active Jobs",
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                color = AccentEmerald,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                            )
                        }

                        if (lowStockCount > 0) {
                            Surface(
                                shape = RoundedCornerShape(8.dp),
                                color = AccentRose.copy(alpha = 0.15f)
                            ) {
                                Text(
                                    text = "⚠️ $lowStockCount Low Stock",
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = AccentRose,
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                )
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            Text(
                text = "MANAGEMENT MODULES",
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                letterSpacing = 1.sp,
                modifier = Modifier.padding(horizontal = 12.dp, vertical = 4.dp)
            )

            Spacer(modifier = Modifier.height(8.dp))

            // Navigation Item 1: Repair Tickets
            NavigationDrawerItem(
                label = {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("Repair Tickets", fontWeight = FontWeight.SemiBold)
                        Surface(
                            shape = CircleShape,
                            color = if (currentDestination == AppNavDestination.REPAIR_TICKETS) Color.White else SkyBluePrimary.copy(alpha = 0.2f)
                        ) {
                            Text(
                                text = "$totalTicketCount",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (currentDestination == AppNavDestination.REPAIR_TICKETS) SkyBluePrimary else MaterialTheme.colorScheme.onSurface,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp)
                            )
                        }
                    }
                },
                icon = { Icon(Icons.Default.ConfirmationNumber, contentDescription = null) },
                selected = currentDestination == AppNavDestination.REPAIR_TICKETS,
                onClick = {
                    onDestinationSelected(AppNavDestination.REPAIR_TICKETS)
                    onCloseDrawer()
                },
                modifier = Modifier
                    .padding(vertical = 4.dp)
                    .testTag("nav_drawer_tickets")
            )

            // Navigation Item 2: Product & Inventory
            NavigationDrawerItem(
                label = {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("Product & Inventory", fontWeight = FontWeight.SemiBold)
                        if (lowStockCount > 0) {
                            Surface(
                                shape = CircleShape,
                                color = AccentRose
                            ) {
                                Text(
                                    text = "$lowStockCount",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color.White,
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp)
                                )
                            }
                        }
                    }
                },
                icon = { Icon(Icons.Default.Inventory, contentDescription = null) },
                selected = currentDestination == AppNavDestination.PRODUCT_INVENTORY,
                onClick = {
                    onDestinationSelected(AppNavDestination.PRODUCT_INVENTORY)
                    onCloseDrawer()
                },
                modifier = Modifier
                    .padding(vertical = 4.dp)
                    .testTag("nav_drawer_inventory")
            )

            // Navigation Item 3: Customer Profiles & History
            NavigationDrawerItem(
                label = { Text("Customer Profiles & History", fontWeight = FontWeight.SemiBold) },
                icon = { Icon(Icons.Default.People, contentDescription = null, tint = ElectricCyan) },
                selected = currentDestination == AppNavDestination.CUSTOMERS,
                onClick = {
                    onDestinationSelected(AppNavDestination.CUSTOMERS)
                    onCloseDrawer()
                },
                modifier = Modifier
                    .padding(vertical = 4.dp)
                    .testTag("nav_drawer_customers")
            )

            // Navigation Item 4: Business & Sales Reports
            NavigationDrawerItem(
                label = { Text("Weekly & Monthly Reports", fontWeight = FontWeight.SemiBold) },
                icon = { Icon(Icons.Default.Assessment, contentDescription = null) },
                selected = currentDestination == AppNavDestination.REPORTS,
                onClick = {
                    onDestinationSelected(AppNavDestination.REPORTS)
                    onCloseDrawer()
                },
                modifier = Modifier
                    .padding(vertical = 4.dp)
                    .testTag("nav_drawer_reports")
            )

            // Navigation Item 4: SMS Templates
            NavigationDrawerItem(
                label = { Text("SMS Alert Templates", fontWeight = FontWeight.SemiBold) },
                icon = { Icon(Icons.Default.Sms, contentDescription = null) },
                selected = currentDestination == AppNavDestination.SMS_TEMPLATES,
                onClick = {
                    onDestinationSelected(AppNavDestination.SMS_TEMPLATES)
                    onCloseDrawer()
                },
                modifier = Modifier
                    .padding(vertical = 4.dp)
                    .testTag("nav_drawer_sms")
            )

            // Navigation Item 5: Google Drive Sync & Backup
            NavigationDrawerItem(
                label = {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("Google Sync & Backup", fontWeight = FontWeight.SemiBold)
                        Surface(
                            shape = CircleShape,
                            color = AccentEmerald.copy(alpha = 0.2f)
                        ) {
                            Text(
                                text = "Cloud",
                                fontSize = 9.sp,
                                fontWeight = FontWeight.ExtraBold,
                                color = AccentEmerald,
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                            )
                        }
                    }
                },
                icon = { Icon(Icons.Default.CloudUpload, contentDescription = null, tint = SkyBluePrimary) },
                selected = currentDestination == AppNavDestination.GOOGLE_CLOUD_SYNC,
                onClick = {
                    onDestinationSelected(AppNavDestination.GOOGLE_CLOUD_SYNC)
                    onCloseDrawer()
                },
                modifier = Modifier
                    .padding(vertical = 4.dp)
                    .testTag("nav_drawer_cloud_sync")
            )

            // Log Out Option
            NavigationDrawerItem(
                label = { Text("Log Out / Change Account", fontWeight = FontWeight.SemiBold, color = AccentRose) },
                icon = { Icon(Icons.Default.ExitToApp, contentDescription = null, tint = AccentRose) },
                selected = false,
                onClick = {
                    onCloseDrawer()
                    onLogout()
                },
                modifier = Modifier
                    .padding(vertical = 4.dp)
                    .testTag("nav_drawer_logout")
            )

            Spacer(modifier = Modifier.weight(1f))

            HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant)

            Spacer(modifier = Modifier.height(12.dp))

            // App Footer Info
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    Text(
                        text = "CHAND Brothers Mobile",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Text(
                        text = "Inventory & Ticket Sync",
                        fontSize = 10.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.7f)
                    )
                }
                Icon(
                    imageVector = Icons.Default.CheckCircle,
                    contentDescription = null,
                    tint = AccentEmerald,
                    modifier = Modifier.size(18.dp)
                )
            }
        }
    }
}
