package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Build
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material.icons.filled.PriorityHigh
import androidx.compose.material.icons.filled.Save
import androidx.compose.material.icons.filled.Smartphone
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
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
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.example.data.model.RepairTicket
import com.example.ui.theme.AccentEmerald
import com.example.ui.theme.AccentRose
import com.example.ui.theme.ElectricCyan

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun AddEditTicketDialog(
    ticket: RepairTicket?,
    initialCustomerName: String = "",
    initialCustomerPhone: String = "",
    onSave: (RepairTicket) -> Unit,
    onDismiss: () -> Unit,
    modifier: Modifier = Modifier
) {
    val isEditMode = ticket != null

    var customerName by remember { mutableStateOf(ticket?.customerName ?: initialCustomerName) }
    var customerPhone by remember { mutableStateOf(ticket?.customerPhone ?: initialCustomerPhone) }
    var mobileBrand by remember { mutableStateOf(ticket?.mobileBrand ?: "Samsung") }
    var mobileModel by remember { mutableStateOf(ticket?.mobileModel ?: "") }
    var serialOrImei by remember { mutableStateOf(ticket?.serialOrImei ?: "") }
    var issueCategory by remember { mutableStateOf(ticket?.issueCategory ?: "Screen Replacement") }
    var issueDescription by remember { mutableStateOf(ticket?.issueDescription ?: "") }
    var deviceCondition by remember { mutableStateOf(ticket?.deviceCondition ?: "Normal wear & tear") }
    var customerPasscode by remember { mutableStateOf(ticket?.customerPasscode ?: "") }
    var estimatedCostStr by remember { mutableStateOf(ticket?.estimatedCost?.let { if (it > 0) it.toString() else "" } ?: "") }
    var advancePaidStr by remember { mutableStateOf(ticket?.advancePaid?.let { if (it > 0) it.toString() else "" } ?: "") }
    var partsCostStr by remember { mutableStateOf(ticket?.partsCost?.let { if (it > 0) it.toString() else "" } ?: "") }
    var laborCostStr by remember { mutableStateOf(ticket?.laborCost?.let { if (it > 0) it.toString() else "" } ?: "") }
    var isPriority by remember { mutableStateOf(ticket?.isPriority ?: false) }

    var nameError by remember { mutableStateOf(false) }
    var phoneError by remember { mutableStateOf(false) }
    var modelError by remember { mutableStateOf(false) }

    val brands = listOf("Samsung", "Apple", "Xiaomi", "Google", "OnePlus", "Motorola", "Vivo", "Oppo", "Realme", "Other")
    val issueCategories = listOf(
        "Screen Replacement",
        "Battery Replacement",
        "Charging Port",
        "Water Damage",
        "Camera Repair",
        "Motherboard/IC",
        "Software/Unlock",
        "Speaker/Mic",
        "Back Glass",
        "Other"
    )

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Surface(
            modifier = modifier
                .fillMaxWidth(0.94f)
                .padding(vertical = 16.dp),
            shape = RoundedCornerShape(24.dp),
            color = MaterialTheme.colorScheme.surface,
            tonalElevation = 8.dp,
            border = androidx.compose.foundation.BorderStroke(1.dp, ElectricCyan.copy(alpha = 0.4f))
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState())
                    .padding(20.dp)
            ) {
                // Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(40.dp)
                                .clip(CircleShape)
                                .background(ElectricCyan.copy(alpha = 0.2f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.Build,
                                contentDescription = null,
                                tint = ElectricCyan,
                                modifier = Modifier.size(20.dp)
                            )
                        }
                        Spacer(modifier = Modifier.width(12.dp))
                        Column {
                            Text(
                                text = if (isEditMode) "Edit Repair Ticket" else "New Repair Ticket",
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            Text(
                                text = if (isEditMode) "Ticket #${ticket?.ticketNumber}" else "Enter customer & device intake details",
                                fontSize = 12.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }

                    IconButton(onClick = onDismiss) {
                        Icon(imageVector = Icons.Default.Close, contentDescription = "Close", tint = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Section 1: Customer Details
                Text(
                    text = "CUSTOMER CONTACT",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = ElectricCyan,
                    letterSpacing = 1.sp
                )
                Spacer(modifier = Modifier.height(8.dp))

                OutlinedTextField(
                    value = customerName,
                    onValueChange = {
                        customerName = it
                        nameError = false
                    },
                    label = { Text("Customer Name *") },
                    leadingIcon = { Icon(Icons.Default.Person, contentDescription = null, tint = ElectricCyan) },
                    isError = nameError,
                    supportingText = if (nameError) { { Text("Customer name required") } } else null,
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("input_customer_name"),
                    shape = RoundedCornerShape(12.dp)
                )

                Spacer(modifier = Modifier.height(10.dp))

                OutlinedTextField(
                    value = customerPhone,
                    onValueChange = {
                        customerPhone = it
                        phoneError = false
                    },
                    label = { Text("Phone Number (SMS Alert Target) *") },
                    leadingIcon = { Icon(Icons.Default.Phone, contentDescription = null, tint = ElectricCyan) },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                    isError = phoneError,
                    supportingText = if (phoneError) { { Text("Phone number required for SMS") } } else null,
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("input_customer_phone"),
                    shape = RoundedCornerShape(12.dp)
                )

                Spacer(modifier = Modifier.height(18.dp))

                // Section 2: Mobile Device Details
                Text(
                    text = "DEVICE INFORMATION",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = ElectricCyan,
                    letterSpacing = 1.sp
                )
                Spacer(modifier = Modifier.height(8.dp))

                // Brand Selector Chips
                Text(text = "Select Brand:", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                Spacer(modifier = Modifier.height(6.dp))
                FlowRow(
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    verticalArrangement = Arrangement.spacedBy(6.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    brands.forEach { brand ->
                        val isSelected = mobileBrand == brand
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(8.dp))
                                .background(if (isSelected) ElectricCyan else MaterialTheme.colorScheme.surfaceVariant)
                                .clickable { mobileBrand = brand }
                                .padding(horizontal = 10.dp, vertical = 6.dp)
                        ) {
                            Text(
                                text = brand,
                                fontSize = 12.sp,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                color = if (isSelected) Color.White else MaterialTheme.colorScheme.onSurface
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                OutlinedTextField(
                    value = mobileModel,
                    onValueChange = {
                        mobileModel = it
                        modelError = false
                    },
                    label = { Text("Mobile Model (e.g. Galaxy S23, iPhone 14 Pro) *") },
                    leadingIcon = { Icon(Icons.Default.Smartphone, contentDescription = null, tint = ElectricCyan) },
                    isError = modelError,
                    supportingText = if (modelError) { { Text("Model required") } } else null,
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("input_mobile_model"),
                    shape = RoundedCornerShape(12.dp)
                )

                Spacer(modifier = Modifier.height(10.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    OutlinedTextField(
                        value = serialOrImei,
                        onValueChange = { serialOrImei = it },
                        label = { Text("IMEI / Serial (Optional)") },
                        modifier = Modifier
                            .weight(1f)
                            .testTag("input_serial_imei"),
                        shape = RoundedCornerShape(12.dp)
                    )

                    OutlinedTextField(
                        value = customerPasscode,
                        onValueChange = { customerPasscode = it },
                        label = { Text("Passcode / Pattern") },
                        modifier = Modifier
                            .weight(1f)
                            .testTag("input_passcode"),
                        shape = RoundedCornerShape(12.dp)
                    )
                }

                Spacer(modifier = Modifier.height(10.dp))

                OutlinedTextField(
                    value = deviceCondition,
                    onValueChange = { deviceCondition = it },
                    label = { Text("Physical Condition & Accessories") },
                    placeholder = { Text("e.g. Minor scratches, cracked back, SIM included") },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp)
                )

                Spacer(modifier = Modifier.height(18.dp))

                // Section 3: Problem / Issue Category
                Text(
                    text = "REPAIR ISSUE & PROBLEM",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = ElectricCyan,
                    letterSpacing = 1.sp
                )
                Spacer(modifier = Modifier.height(8.dp))

                Text(text = "Issue Category Preset:", fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                Spacer(modifier = Modifier.height(6.dp))
                FlowRow(
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    verticalArrangement = Arrangement.spacedBy(6.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    issueCategories.forEach { category ->
                        val isSelected = issueCategory == category
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(8.dp))
                                .background(if (isSelected) ElectricCyan else MaterialTheme.colorScheme.surfaceVariant)
                                .clickable { issueCategory = category }
                                .padding(horizontal = 10.dp, vertical = 6.dp)
                        ) {
                            Text(
                                text = category,
                                fontSize = 12.sp,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                color = if (isSelected) Color.White else MaterialTheme.colorScheme.onSurface
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                OutlinedTextField(
                    value = issueDescription,
                    onValueChange = { issueDescription = it },
                    label = { Text("Detailed Problem Description") },
                    placeholder = { Text("Describe specific symptoms, damage origin, or customer requests...") },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(90.dp)
                        .testTag("input_issue_description"),
                    shape = RoundedCornerShape(12.dp)
                )

                Spacer(modifier = Modifier.height(18.dp))

                // Section 4: Financial Estimates & Priority
                Text(
                    text = "COST & PAYMENT ESTIMATES",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = ElectricCyan,
                    letterSpacing = 1.sp
                )
                Spacer(modifier = Modifier.height(8.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    OutlinedTextField(
                        value = estimatedCostStr,
                        onValueChange = { estimatedCostStr = it },
                        label = { Text("Est. Total (₹)") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier
                            .weight(1f)
                            .testTag("input_estimated_cost"),
                        shape = RoundedCornerShape(12.dp)
                    )

                    OutlinedTextField(
                        value = advancePaidStr,
                        onValueChange = { advancePaidStr = it },
                        label = { Text("Advance Deposit (₹)") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier
                            .weight(1f)
                            .testTag("input_advance_paid"),
                        shape = RoundedCornerShape(12.dp)
                    )
                }

                Spacer(modifier = Modifier.height(10.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    OutlinedTextField(
                        value = partsCostStr,
                        onValueChange = { partsCostStr = it },
                        label = { Text("Spare Parts Cost (₹)") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(12.dp)
                    )

                    OutlinedTextField(
                        value = laborCostStr,
                        onValueChange = { laborCostStr = it },
                        label = { Text("Labor Charge (₹)") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(12.dp)
                    )
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Priority Switch
                Surface(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 14.dp, vertical = 8.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Default.PriorityHigh,
                                contentDescription = null,
                                tint = if (isPriority) AccentRose else MaterialTheme.colorScheme.onSurfaceVariant
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Column {
                                Text(
                                    text = "Mark as Express Priority",
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                                Text(
                                    text = "High priority job badge on dashboard",
                                    fontSize = 11.sp,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }

                        Switch(
                            checked = isPriority,
                            onCheckedChange = { isPriority = it },
                            colors = SwitchDefaults.colors(checkedThumbColor = Color.White, checkedTrackColor = AccentRose)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(20.dp))

                // Save Action Button
                Button(
                    onClick = {
                        nameError = customerName.isBlank()
                        phoneError = customerPhone.isBlank()
                        modelError = mobileModel.isBlank()

                        if (!nameError && !phoneError && !modelError) {
                            val estCost = estimatedCostStr.toDoubleOrNull() ?: 0.0
                            val advPaid = advancePaidStr.toDoubleOrNull() ?: 0.0
                            val pCost = partsCostStr.toDoubleOrNull() ?: 0.0
                            val lCost = laborCostStr.toDoubleOrNull() ?: 0.0

                            val savedTicket = (ticket ?: RepairTicket(
                                ticketNumber = "",
                                customerName = customerName.trim(),
                                customerPhone = customerPhone.trim(),
                                mobileBrand = mobileBrand,
                                mobileModel = mobileModel.trim(),
                                issueCategory = issueCategory,
                                issueDescription = issueDescription.trim()
                            )).copy(
                                customerName = customerName.trim(),
                                customerPhone = customerPhone.trim(),
                                mobileBrand = mobileBrand,
                                mobileModel = mobileModel.trim(),
                                serialOrImei = serialOrImei.trim(),
                                issueCategory = issueCategory,
                                issueDescription = issueDescription.trim(),
                                deviceCondition = deviceCondition.trim(),
                                customerPasscode = customerPasscode.trim(),
                                estimatedCost = estCost,
                                advancePaid = advPaid,
                                partsCost = pCost,
                                laborCost = lCost,
                                isPriority = isPriority
                            )

                            onSave(savedTicket)
                        }
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(50.dp)
                        .testTag("save_ticket_btn"),
                    colors = ButtonDefaults.buttonColors(containerColor = ElectricCyan, contentColor = Color.White),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Icon(imageVector = Icons.Default.Save, contentDescription = null, modifier = Modifier.size(18.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = if (isEditMode) "Update Ticket & Notify" else "Create Repair Ticket",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }
    }
}
