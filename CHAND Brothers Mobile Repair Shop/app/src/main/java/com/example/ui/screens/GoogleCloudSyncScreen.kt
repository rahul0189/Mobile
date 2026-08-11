package com.example.ui.screens

import android.widget.Toast
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
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
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.sync.GoogleAccountInfo
import com.example.data.sync.GoogleCloudSyncManager
import com.example.ui.theme.AccentEmerald
import com.example.ui.theme.ElectricCyan
import com.example.ui.theme.SkyBluePrimary

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun GoogleCloudSyncScreen(
    accountInfo: GoogleAccountInfo,
    isSyncing: Boolean,
    syncStatusMessage: String,
    onSignIn: (email: String, name: String) -> Unit,
    onSignOut: () -> Unit,
    onToggleAutoSync: (Boolean) -> Unit,
    onPerformBackup: () -> Unit,
    onPerformRestore: () -> Unit,
    onRestoreCustomJson: ((String, (Boolean, String) -> Unit) -> Unit)? = null,
    onOpenDrawer: (() -> Unit)? = null,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val scrollState = rememberScrollState()

    var showAccountEditDialog by remember { mutableStateOf(false) }
    var inputEmail by remember { mutableStateOf(accountInfo.email) }
    var inputName by remember { mutableStateOf(accountInfo.displayName) }

    var showRestoreConfirmDialog by remember { mutableStateOf(false) }
    var showPasteJsonDialog by remember { mutableStateOf(false) }
    var pasteJsonText by remember { mutableStateOf("") }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = "Google Drive Cloud Sync",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "Auto-save & Device Recovery",
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
                .verticalScroll(scrollState)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {

            // Status Banner if Syncing
            AnimatedVisibility(visible = isSyncing, enter = fadeIn(), exit = fadeOut()) {
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = SkyBluePrimary.copy(alpha = 0.15f),
                    border = androidx.compose.foundation.BorderStroke(1.dp, SkyBluePrimary)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(24.dp),
                            color = SkyBluePrimary,
                            strokeWidth = 2.dp
                        )
                        Text(
                            text = if (syncStatusMessage.isNotEmpty()) syncStatusMessage else "Synchronizing data with Google Drive...",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = SkyBluePrimary
                        )
                    }
                }
            }

            // 1. Gmail Account Card
            Card(
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)
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
                                    .size(52.dp)
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
                                    text = accountInfo.email.take(1).uppercase(),
                                    fontSize = 22.sp,
                                    fontWeight = FontWeight.ExtraBold,
                                    color = Color.White
                                )
                            }

                            Column {
                                Text(
                                    text = accountInfo.displayName,
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                                Text(
                                    text = accountInfo.email,
                                    fontSize = 13.sp,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }

                        Surface(
                            shape = CircleShape,
                            color = if (accountInfo.isSignedIn) AccentEmerald.copy(alpha = 0.15f) else Color.Gray.copy(alpha = 0.15f)
                        ) {
                            Row(
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(4.dp)
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(8.dp)
                                        .clip(CircleShape)
                                        .background(if (accountInfo.isSignedIn) AccentEmerald else Color.Gray)
                                )
                                Text(
                                    text = if (accountInfo.isSignedIn) "Connected" else "Signed Out",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (accountInfo.isSignedIn) AccentEmerald else Color.Gray
                                )
                            }
                        }
                    }

                    HorizontalDivider(color = MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            Icon(Icons.Default.VerifiedUser, contentDescription = null, tint = SkyBluePrimary, modifier = Modifier.size(18.dp))
                            Text("Google Account Verified", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }

                        OutlinedButton(
                            onClick = {
                                inputEmail = accountInfo.email
                                inputName = accountInfo.displayName
                                showAccountEditDialog = true
                            },
                            shape = RoundedCornerShape(12.dp),
                            contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp),
                            modifier = Modifier.testTag("switch_gmail_account_btn")
                        ) {
                            Icon(Icons.Default.SwitchAccount, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Change Account", fontSize = 12.sp)
                        }
                    }
                }
            }

            // 2. Google Drive Backup & Auto-Save Control
            Card(
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(
                    containerColor = SkyBluePrimary.copy(alpha = 0.08f)
                ),
                modifier = Modifier
                    .fillMaxWidth()
                    .border(1.dp, SkyBluePrimary.copy(alpha = 0.3f), RoundedCornerShape(20.dp))
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(18.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            Surface(
                                shape = CircleShape,
                                color = SkyBluePrimary,
                                modifier = Modifier.size(40.dp)
                            ) {
                                Icon(
                                    Icons.Default.CloudDone,
                                    contentDescription = null,
                                    tint = Color.White,
                                    modifier = Modifier
                                        .padding(8.dp)
                                        .fillMaxSize()
                                )
                            }
                            Column {
                                Text(
                                    text = "Google Drive Auto-Sync",
                                    fontSize = 15.sp,
                                    fontWeight = FontWeight.ExtraBold,
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                                Text(
                                    text = "Auto-save tickets & inventory on change",
                                    fontSize = 11.sp,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }

                        Switch(
                            checked = accountInfo.isAutoSyncEnabled,
                            onCheckedChange = { onToggleAutoSync(it) },
                            colors = SwitchDefaults.colors(
                                checkedThumbColor = Color.White,
                                checkedTrackColor = SkyBluePrimary
                            ),
                            modifier = Modifier.testTag("auto_sync_toggle_switch")
                        )
                    }

                    HorizontalDivider(color = SkyBluePrimary.copy(alpha = 0.2f))

                    // Backup Meta Info
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column {
                            Text("LAST CLOUD BACKUP", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = SkyBluePrimary)
                            Text(
                                text = GoogleCloudSyncManager.formatTimestamp(accountInfo.lastBackupTimestamp),
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                        }

                        Column(horizontalAlignment = Alignment.End) {
                            Text("BACKUP FILE SIZE", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = SkyBluePrimary)
                            Text(
                                text = "${String.format("%.1f", accountInfo.totalBackupSizeKb)} KB",
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                        }
                    }

                    // Backup Actions
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Button(
                            onClick = {
                                onPerformBackup()
                                Toast.makeText(context, "Data backed up to Google Drive successfully!", Toast.LENGTH_SHORT).show()
                            },
                            enabled = !isSyncing,
                            shape = RoundedCornerShape(12.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = SkyBluePrimary),
                            modifier = Modifier
                                .weight(1f)
                                .testTag("backup_now_google_drive_btn")
                        ) {
                            Icon(Icons.Default.CloudUpload, contentDescription = null, modifier = Modifier.size(18.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Backup Now", fontSize = 13.sp, fontWeight = FontWeight.Bold)
                        }

                        Button(
                            onClick = { showRestoreConfirmDialog = true },
                            enabled = !isSyncing,
                            shape = RoundedCornerShape(12.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = AccentEmerald),
                            modifier = Modifier
                                .weight(1f)
                                .testTag("restore_from_google_drive_btn")
                        ) {
                            Icon(Icons.Default.CloudDownload, contentDescription = null, modifier = Modifier.size(18.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Restore Data", fontSize = 13.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }

            // 3. Device Shift & App Reinstall Safety Info Card
            Card(
                shape = RoundedCornerShape(18.dp),
                colors = CardDefaults.cardColors(
                    containerColor = AccentEmerald.copy(alpha = 0.1f)
                ),
                modifier = Modifier
                    .fillMaxWidth()
                    .border(1.dp, AccentEmerald.copy(alpha = 0.3f), RoundedCornerShape(18.dp))
            ) {
                Row(
                    modifier = Modifier.padding(16.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    verticalAlignment = Alignment.Top
                ) {
                    Icon(
                        Icons.Default.PhonelinkSetup,
                        contentDescription = null,
                        tint = AccentEmerald,
                        modifier = Modifier.size(28.dp)
                    )
                    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                        Text(
                            text = "Shift Device or App Reinstall Support",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = AccentEmerald
                        )
                        Text(
                            text = "When you switch to a new phone or reinstall the app, simply click 'Restore Data'. All your repair tickets and stock items auto-restore seamlessly!",
                            fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.85f),
                            lineHeight = 17.sp
                        )
                    }
                }
            }
        }
    }

    // Account Edit / Switch Dialog
    if (showAccountEditDialog) {
        AlertDialog(
            onDismissRequest = { showAccountEditDialog = false },
            title = {
                Text(
                    text = "Gmail Account Settings",
                    fontWeight = FontWeight.Bold,
                    fontSize = 18.sp
                )
            },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text(
                        text = "Enter the Gmail address you want to link for Google Drive Cloud Sync.",
                        fontSize = 12.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )

                    OutlinedTextField(
                        value = inputName,
                        onValueChange = { inputName = it },
                        label = { Text("Display Name / Shop Owner") },
                        singleLine = true,
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.fillMaxWidth()
                    )

                    OutlinedTextField(
                        value = inputEmail,
                        onValueChange = { inputEmail = it },
                        label = { Text("Gmail Address") },
                        singleLine = true,
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("gmail_input_field")
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (inputEmail.contains("@")) {
                            onSignIn(inputEmail, inputName)
                            showAccountEditDialog = false
                            Toast.makeText(context, "Gmail account linked to $inputEmail", Toast.LENGTH_SHORT).show()
                        } else {
                            Toast.makeText(context, "Please enter a valid Gmail address", Toast.LENGTH_SHORT).show()
                        }
                    },
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Text("Save & Connect")
                }
            },
            dismissButton = {
                TextButton(onClick = { showAccountEditDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }

    // Restore Confirmation Dialog
    if (showRestoreConfirmDialog) {
        AlertDialog(
            onDismissRequest = { showRestoreConfirmDialog = false },
            icon = {
                Icon(Icons.Default.CloudDownload, contentDescription = null, tint = AccentEmerald, modifier = Modifier.size(36.dp))
            },
            title = {
                Text(
                    text = "Restore All Data from Google Cloud?",
                    fontWeight = FontWeight.Bold,
                    fontSize = 18.sp,
                    textAlign = TextAlign.Center
                )
            },
            text = {
                Column(
                    verticalArrangement = Arrangement.spacedBy(8.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "This will fetch your latest backup stored in Google Drive under '${accountInfo.email}' and update all repair tickets, product stock items, and SMS settings.",
                        fontSize = 13.sp,
                        textAlign = TextAlign.Center,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Surface(
                        shape = RoundedCornerShape(8.dp),
                        color = AccentEmerald.copy(alpha = 0.15f),
                        modifier = Modifier.padding(top = 6.dp)
                    ) {
                        Text(
                            text = "Last Cloud Backup: ${GoogleCloudSyncManager.formatTimestamp(accountInfo.lastBackupTimestamp)}",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = AccentEmerald,
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                        )
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        showRestoreConfirmDialog = false
                        onPerformRestore()
                        Toast.makeText(context, "Cloud restore complete! All shop data updated.", Toast.LENGTH_LONG).show()
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = AccentEmerald),
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier.testTag("confirm_cloud_restore_btn")
                ) {
                    Text("Restore Now", fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { showRestoreConfirmDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }
}