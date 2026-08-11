package com.example.ui.components

import android.text.format.DateFormat
import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Print
import androidx.compose.material.icons.filled.Receipt
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Divider
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.example.data.model.RepairTicket
import com.example.ui.theme.*
import com.example.util.CommunicationHelper
import java.util.Date

@Composable
fun ReceiptDialog(
    ticket: RepairTicket,
    onDismiss: () -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val createdDateStr = DateFormat.format("MMM dd, yyyy • hh:mm a", Date(ticket.dateCreatedMillis)).toString()

    Dialog(onDismissRequest = onDismiss) {
        Surface(
            modifier = modifier
                .fillMaxWidth()
                .padding(vertical = 16.dp),
            shape = RoundedCornerShape(20.dp),
            color = PureWhite,
            tonalElevation = 8.dp,
            border = androidx.compose.foundation.BorderStroke(1.dp, SkyBluePrimary.copy(alpha = 0.3f))
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState())
                    .padding(20.dp)
            ) {
                // Top Action Bar
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.Receipt,
                            contentDescription = "Receipt",
                            tint = SkyBluePrimary,
                            modifier = Modifier.size(24.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "JOB RECEIPT",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimaryLight
                        )
                    }
                    IconButton(onClick = onDismiss) {
                        Icon(imageVector = Icons.Default.Close, contentDescription = "Close", tint = TextSecondaryLight)
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Receipt Content Paper Card
                Surface(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(14.dp),
                    color = OffWhiteBackground,
                    border = androidx.compose.foundation.BorderStroke(1.dp, BorderLight)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        // Shop Name
                        Text(
                            text = "CHAND BROTHERS MOBILE REPAIR SHOP",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = SkyBluePrimary,
                            letterSpacing = 1.sp
                        )
                        Text(
                            text = "Professional Tech & Device Services",
                            fontSize = 11.sp,
                            color = TextSecondaryLight
                        )
                        Text(
                            text = "Date: $createdDateStr",
                            fontSize = 11.sp,
                            color = TextSecondaryLight
                        )

                        HorizontalDivider(
                            modifier = Modifier.padding(vertical = 12.dp),
                            color = BorderLight
                        )

                        // Ticket ID & Customer
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column {
                                Text(text = "TICKET NUMBER", fontSize = 10.sp, color = TextSecondaryLight, fontWeight = FontWeight.Bold)
                                Text(text = ticket.ticketNumber, fontSize = 16.sp, fontWeight = FontWeight.Bold, color = SkyBluePrimary)
                            }
                            Column(horizontalAlignment = Alignment.End) {
                                Text(text = "STATUS", fontSize = 10.sp, color = TextSecondaryLight, fontWeight = FontWeight.Bold)
                                StatusBadge(status = ticket.currentStatusEnum, isSmall = true)
                            }
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        Text(text = "CUSTOMER DETAILS", fontSize = 10.sp, color = TextSecondaryLight, fontWeight = FontWeight.Bold)
                        Text(text = ticket.customerName, fontSize = 14.sp, fontWeight = FontWeight.Bold, color = TextPrimaryLight)
                        Text(text = "Phone: ${ticket.customerPhone}", fontSize = 12.sp, color = TextSecondaryLight)

                        Spacer(modifier = Modifier.height(10.dp))

                        Text(text = "DEVICE INFORMATION", fontSize = 10.sp, color = TextSecondaryLight, fontWeight = FontWeight.Bold)
                        Text(text = "${ticket.mobileBrand} ${ticket.mobileModel}", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = TextPrimaryLight)
                        if (ticket.serialOrImei.isNotBlank()) {
                            Text(text = "IMEI / Serial: ${ticket.serialOrImei}", fontSize = 11.sp, color = TextSecondaryLight)
                        }
                        if (ticket.customerPasscode.isNotBlank()) {
                            Text(text = "Device Passcode: ${ticket.customerPasscode}", fontSize = 11.sp, color = AccentEmerald)
                        }

                        HorizontalDivider(
                            modifier = Modifier.padding(vertical = 12.dp),
                            color = BorderLight
                        )

                        Text(text = "REPAIR ISSUE & DIAGNOSTIC", fontSize = 10.sp, color = TextSecondaryLight, fontWeight = FontWeight.Bold)
                        Text(text = "Category: ${ticket.issueCategory}", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = SkyBluePrimary)
                        Text(text = ticket.issueDescription, fontSize = 12.sp, color = TextSecondaryLight)

                        HorizontalDivider(
                            modifier = Modifier.padding(vertical = 12.dp),
                            color = BorderLight
                        )

                        // Financial breakdown
                        Text(text = "COST BREAKDOWN", fontSize = 10.sp, color = TextSecondaryLight, fontWeight = FontWeight.Bold)
                        Spacer(modifier = Modifier.height(4.dp))

                        if (ticket.partsCost > 0) {
                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                Text(text = "Spare Parts", fontSize = 12.sp, color = TextSecondaryLight)
                                Text(text = "₹${String.format("%.2f", ticket.partsCost)}", fontSize = 12.sp, color = TextPrimaryLight)
                            }
                        }
                        if (ticket.laborCost > 0) {
                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                Text(text = "Labor & Service Charge", fontSize = 12.sp, color = TextSecondaryLight)
                                Text(text = "₹${String.format("%.2f", ticket.laborCost)}", fontSize = 12.sp, color = TextPrimaryLight)
                            }
                        }

                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(top = 4.dp),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(text = "ESTIMATED TOTAL COST", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = TextPrimaryLight)
                            Text(text = "₹${String.format("%.2f", ticket.formattedTotalCost)}", fontSize = 14.sp, fontWeight = FontWeight.ExtraBold, color = SkyBluePrimary)
                        }

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(text = "Advance Deposit Paid", fontSize = 12.sp, color = TextSecondaryLight)
                            Text(text = "-₹${String.format("%.2f", ticket.advancePaid)}", fontSize = 12.sp, color = AccentEmerald)
                        }

                        HorizontalDivider(
                            modifier = Modifier.padding(vertical = 8.dp),
                            color = BorderLight
                        )

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(text = "NET BALANCE DUE", fontSize = 14.sp, fontWeight = FontWeight.ExtraBold, color = TextPrimaryLight)
                            Text(
                                text = "₹${String.format("%.2f", ticket.balanceDue)}",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.ExtraBold,
                                color = if (ticket.balanceDue > 0) AccentRose else AccentEmerald
                            )
                        }

                        Spacer(modifier = Modifier.height(14.dp))
                        Text(
                            text = "Terms: 30-Day warranty on screen & battery hardware replacements. Water damage repairs carry diagnostic guarantee.",
                            fontSize = 9.sp,
                            color = TextSecondaryLight,
                            fontFamily = FontFamily.Monospace
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Bottom actions: Share Receipt via SMS/WhatsApp
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Button(
                        onClick = {
                            val msg = "CHAND Brothers Mobile Repair Shop Receipt\nTicket #${ticket.ticketNumber}\nDevice: ${ticket.mobileBrand} ${ticket.mobileModel}\nIssue: ${ticket.issueCategory}\nTotal: ₹${String.format("%.2f", ticket.formattedTotalCost)}\nDue: ₹${String.format("%.2f", ticket.balanceDue)}\nStatus: ${ticket.currentStatusEnum.displayName}"
                            CommunicationHelper.openWhatsApp(context, ticket.customerPhone, msg)
                        },
                        modifier = Modifier
                            .weight(1f)
                            .testTag("share_receipt_btn"),
                        colors = ButtonDefaults.buttonColors(containerColor = SkyBluePrimary, contentColor = PureWhite),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Icon(imageVector = Icons.Default.Share, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Share Receipt", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                    }

                    OutlinedButton(
                        onClick = onDismiss,
                        modifier = Modifier.weight(0.8f),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Text("Done", color = TextPrimaryLight)
                    }
                }
            }
        }
    }
}
