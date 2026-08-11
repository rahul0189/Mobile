package com.example.ui.screens

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.AccentEmerald
import com.example.ui.theme.AccentRose
import com.example.ui.theme.ElectricCyan
import com.example.ui.theme.SkyBluePrimary

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LoginScreen(
    onContinueWithGoogle: (email: String, name: String) -> Unit,
    onContinueWithPhone: (phone: String, techName: String) -> Unit,
    onContinueAsGuest: () -> Unit
) {
    var showGoogleDialog by remember { mutableStateOf(false) }
    var showPhoneDialog by remember { mutableStateOf(false) }

    var googleEmailInput by remember { mutableStateOf("chand.brothers.shop@gmail.com") }
    var googleNameInput by remember { mutableStateOf("Chand Brothers Repair") }

    var phoneNumberInput by remember { mutableStateOf("") }
    var techNameInput by remember { mutableStateOf("Technician") }
    var otpInput by remember { mutableStateOf("") }
    var isOtpSent by remember { mutableStateOf(false) }
    var phoneError by remember { mutableStateOf<String?>(null) }

    val scrollState = rememberScrollState()

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                Brush.verticalGradient(
                    colors = listOf(
                        Color(0xFF0F172A), // Dark slate blue
                        Color(0xFF1E293B),
                        Color(0xFF0F172A)
                    )
                )
            )
            .padding(20.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(scrollState),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Spacer(modifier = Modifier.height(24.dp))

            // Branding Section
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.fillMaxWidth()
            ) {
                // Shop Logo & Glow Ring
                Surface(
                    modifier = Modifier
                        .size(96.dp)
                        .shadow(16.dp, CircleShape, spotColor = ElectricCyan),
                    shape = CircleShape,
                    color = Color(0xFF1E293B),
                    border = androidx.compose.foundation.BorderStroke(2.dp, ElectricCyan)
                ) {
                    Box(
                        contentAlignment = Alignment.Center,
                        modifier = Modifier.fillMaxSize()
                    ) {
                        Icon(
                            imageVector = Icons.Default.Build,
                            contentDescription = "Repair Shop Logo",
                            tint = ElectricCyan,
                            modifier = Modifier.size(48.dp)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(20.dp))

                Text(
                    text = "CHAND BROTHERS",
                    fontSize = 26.sp,
                    fontWeight = FontWeight.Black,
                    color = Color.White,
                    letterSpacing = 2.sp
                )

                Text(
                    text = "MOBILE REPAIR SHOP & INVENTORY MANAGER",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = ElectricCyan,
                    letterSpacing = 1.sp,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.padding(top = 4.dp)
                )

                Surface(
                    modifier = Modifier.padding(top = 12.dp),
                    shape = RoundedCornerShape(20.dp),
                    color = AccentEmerald.copy(alpha = 0.15f),
                    border = androidx.compose.foundation.BorderStroke(1.dp, AccentEmerald.copy(alpha = 0.5f))
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 14.dp, vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.CheckCircle,
                            contentDescription = null,
                            tint = AccentEmerald,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "100% Free • Offline Ready • Cloud Sync",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = AccentEmerald
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(32.dp))

            // Main Action Card
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .shadow(12.dp, RoundedCornerShape(24.dp)),
                shape = RoundedCornerShape(24.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B))
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "Sign In to Get Started",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )

                    Text(
                        text = "Choose your preferred login option to access shop tickets, inventory, and reports.",
                        fontSize = 12.sp,
                        color = Color.LightGray,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.padding(top = 6.dp, bottom = 24.dp)
                    )

                    // Option 1: Continue with Google
                    Button(
                        onClick = { showGoogleDialog = true },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(52.dp)
                            .testTag("btn_continue_google"),
                        shape = RoundedCornerShape(14.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color.White,
                            contentColor = Color(0xFF1F2937)
                        ),
                        elevation = ButtonDefaults.buttonElevation(defaultElevation = 4.dp)
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.Center
                        ) {
                            Surface(
                                shape = CircleShape,
                                color = Color(0xFF4285F4),
                                modifier = Modifier.size(24.dp)
                            ) {
                                Box(contentAlignment = Alignment.Center) {
                                    Text(
                                        text = "G",
                                        fontWeight = FontWeight.Black,
                                        color = Color.White,
                                        fontSize = 14.sp
                                    )
                                }
                            }
                            Spacer(modifier = Modifier.width(12.dp))
                            Text(
                                text = "Continue with Google",
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    // Option 2: Phone / OTP Technician Login
                    OutlinedButton(
                        onClick = { showPhoneDialog = true },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(52.dp)
                            .testTag("btn_continue_phone"),
                        shape = RoundedCornerShape(14.dp),
                        colors = ButtonDefaults.outlinedButtonColors(
                            contentColor = ElectricCyan
                        ),
                        border = androidx.compose.foundation.BorderStroke(1.5.dp, ElectricCyan)
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.PhoneAndroid,
                                contentDescription = null,
                                tint = ElectricCyan,
                                modifier = Modifier.size(20.dp)
                            )
                            Spacer(modifier = Modifier.width(10.dp))
                            Text(
                                text = "Technician Login (Phone)",
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(18.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        HorizontalDivider(
                            modifier = Modifier.weight(1f),
                            color = Color.Gray.copy(alpha = 0.4f)
                        )
                        Text(
                            text = " OR ",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.Gray,
                            modifier = Modifier.padding(horizontal = 8.dp)
                        )
                        HorizontalDivider(
                            modifier = Modifier.weight(1f),
                            color = Color.Gray.copy(alpha = 0.4f)
                        )
                    }

                    Spacer(modifier = Modifier.height(18.dp))

                    // Option 3: Continue as Guest / Free Demo Access
                    Button(
                        onClick = { onContinueAsGuest() },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(52.dp)
                            .testTag("btn_continue_guest"),
                        shape = RoundedCornerShape(14.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = SkyBluePrimary,
                            contentColor = Color.White
                        )
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.FlashOn,
                                contentDescription = null,
                                tint = Color.Yellow,
                                modifier = Modifier.size(20.dp)
                            )
                            Spacer(modifier = Modifier.width(10.dp))
                            Text(
                                text = "Continue as Guest (Free Demo)",
                                fontSize = 15.sp,
                                fontWeight = FontWeight.ExtraBold
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(28.dp))

            // App Specs & Security Footer
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 12.dp),
                horizontalArrangement = Arrangement.SpaceEvenly,
                verticalAlignment = Alignment.CenterVertically
            ) {
                FeatureBadge(icon = Icons.Default.Shield, label = "Secure Data")
                FeatureBadge(icon = Icons.Default.CloudCheck, label = "Drive Backup")
                FeatureBadge(icon = Icons.Default.OfflineBolt, label = "Offline Works")
            }
        }
    }

    // Google Sign-In Confirmation Dialog
    if (showGoogleDialog) {
        AlertDialog(
            onDismissRequest = { showGoogleDialog = false },
            title = {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.AccountCircle,
                        contentDescription = null,
                        tint = SkyBluePrimary,
                        modifier = Modifier.size(28.dp)
                    )
                    Spacer(modifier = Modifier.width(10.dp))
                    Text("Google Account Sign In", fontWeight = FontWeight.Bold)
                }
            },
            text = {
                Column {
                    Text(
                        text = "Enter your Google email and display name to associate your repair shop backups.",
                        fontSize = 13.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    OutlinedTextField(
                        value = googleNameInput,
                        onValueChange = { googleNameInput = it },
                        label = { Text("Display / Shop Name") },
                        leadingIcon = { Icon(Icons.Default.Store, contentDescription = null) },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    OutlinedTextField(
                        value = googleEmailInput,
                        onValueChange = { googleEmailInput = it },
                        label = { Text("Google Gmail Address") },
                        leadingIcon = { Icon(Icons.Default.Email, contentDescription = null) },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        showGoogleDialog = false
                        onContinueWithGoogle(
                            googleEmailInput.ifBlank { "chand.brothers.shop@gmail.com" },
                            googleNameInput.ifBlank { "Chand Brothers" }
                        )
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = SkyBluePrimary)
                ) {
                    Text("Sign In with Google", fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { showGoogleDialog = false }) {
                    Text("Cancel")
                }
            }
        )
    }

    // Phone / OTP Verification Dialog
    if (showPhoneDialog) {
        AlertDialog(
            onDismissRequest = {
                showPhoneDialog = false
                isOtpSent = false
                phoneError = null
            },
            title = {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.PhoneAndroid,
                        contentDescription = null,
                        tint = ElectricCyan,
                        modifier = Modifier.size(28.dp)
                    )
                    Spacer(modifier = Modifier.width(10.dp))
                    Text(if (isOtpSent) "Verify OTP Code" else "Technician Mobile Login", fontWeight = FontWeight.Bold)
                }
            },
            text = {
                Column {
                    if (!isOtpSent) {
                        Text(
                            text = "Enter your phone number to receive a fast access OTP code.",
                            fontSize = 13.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )

                        Spacer(modifier = Modifier.height(16.dp))

                        OutlinedTextField(
                            value = techNameInput,
                            onValueChange = { techNameInput = it },
                            label = { Text("Technician / Owner Name") },
                            leadingIcon = { Icon(Icons.Default.Person, contentDescription = null) },
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth()
                        )

                        Spacer(modifier = Modifier.height(12.dp))

                        OutlinedTextField(
                            value = phoneNumberInput,
                            onValueChange = {
                                phoneNumberInput = it
                                phoneError = null
                            },
                            label = { Text("Phone Number (+91...)") },
                            leadingIcon = { Icon(Icons.Default.Phone, contentDescription = null) },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                            singleLine = true,
                            isError = phoneError != null,
                            modifier = Modifier.fillMaxWidth()
                        )

                        if (phoneError != null) {
                            Text(
                                text = phoneError!!,
                                color = AccentRose,
                                fontSize = 11.sp,
                                modifier = Modifier.padding(top = 4.dp)
                            )
                        }
                    } else {
                        Text(
                            text = "OTP sent to +91 $phoneNumberInput. Enter verification code below:",
                            fontSize = 13.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )

                        Spacer(modifier = Modifier.height(16.dp))

                        OutlinedTextField(
                            value = otpInput,
                            onValueChange = { otpInput = it },
                            label = { Text("6-Digit OTP Code") },
                            leadingIcon = { Icon(Icons.Default.Lock, contentDescription = null) },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth()
                        )

                        Text(
                            text = "Tip: Demo OTP is 123456 or tap Confirm to sign in directly.",
                            fontSize = 11.sp,
                            color = AccentEmerald,
                            modifier = Modifier.padding(top = 6.dp)
                        )
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (!isOtpSent) {
                            if (phoneNumberInput.length < 5) {
                                phoneError = "Please enter a valid phone number"
                            } else {
                                isOtpSent = true
                                otpInput = "123456" // Auto fill demo OTP
                            }
                        } else {
                            showPhoneDialog = false
                            onContinueWithPhone(phoneNumberInput, techNameInput)
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = ElectricCyan)
                ) {
                    Text(if (isOtpSent) "Verify & Sign In" else "Send OTP", fontWeight = FontWeight.Bold, color = Color.Black)
                }
            },
            dismissButton = {
                TextButton(onClick = {
                    showPhoneDialog = false
                    isOtpSent = false
                    phoneError = null
                }) {
                    Text("Cancel")
                }
            }
        )
    }
}

@Composable
private fun FeatureBadge(icon: androidx.compose.ui.graphics.vector.ImageVector, label: String) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            tint = ElectricCyan,
            modifier = Modifier.size(14.dp)
        )
        Spacer(modifier = Modifier.width(4.dp))
        Text(
            text = label,
            fontSize = 11.sp,
            color = Color.LightGray,
            fontWeight = FontWeight.Medium
        )
    }
}
