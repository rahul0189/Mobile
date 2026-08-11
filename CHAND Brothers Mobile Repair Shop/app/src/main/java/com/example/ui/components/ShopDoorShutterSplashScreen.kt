package com.example.ui.components

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Build
import androidx.compose.material.icons.filled.DoorSliding
import androidx.compose.material.icons.filled.LockOpen
import androidx.compose.material.icons.filled.Store
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.AccentEmerald
import com.example.ui.theme.ElectricCyan
import com.example.ui.theme.NavyDark
import com.example.ui.theme.SkyBluePrimary
import kotlinx.coroutines.delay
import kotlin.math.roundToInt

@Composable
fun ShopDoorShutterSplashScreen(
    onShopOpened: () -> Unit,
    modifier: Modifier = Modifier
) {
    val shutterOpenProgress = remember { Animatable(0f) }
    val glowAnimation = rememberInfiniteTransition(label = "neon_glow")
    val alphaGlow by glowAnimation.animateFloat(
        initialValue = 0.4f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(1200, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "neon_pulse"
    )

    LaunchedEffect(Unit) {
        delay(600) // Brief pause to show shop sign & closed shutter
        shutterOpenProgress.animateTo(
            targetValue = 1f,
            animationSpec = tween(durationMillis = 1400, easing = FastOutSlowInEasing)
        )
        delay(200)
        onShopOpened()
    }

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(NavyDark)
            .testTag("shop_door_splash_screen")
    ) {
        // Underneath Shop Glow / Interior Light
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.radialGradient(
                        colors = listOf(
                            ElectricCyan.copy(alpha = 0.25f),
                            NavyDark
                        )
                    )
                ),
            contentAlignment = Alignment.Center
        ) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center,
                modifier = Modifier.padding(24.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.Store,
                    contentDescription = null,
                    tint = ElectricCyan,
                    modifier = Modifier.size(64.dp)
                )
                Spacer(modifier = Modifier.height(12.dp))
                Text(
                    text = "Welcome to Workshop",
                    fontSize = 22.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
                Text(
                    text = "Opening CHAND Brothers Mobile Repair...",
                    fontSize = 14.sp,
                    color = ElectricCyan
                )
            }
        }

        // Animated Sliding Metallic Shutter Door (Slides UP)
        val shutterYOffsetFraction = shutterOpenProgress.value
        Box(
            modifier = Modifier
                .fillMaxSize()
                .offset {
                    IntOffset(0, -(shutterYOffsetFraction * 2000).roundToInt())
                }
        ) {
            Column(modifier = Modifier.fillMaxSize()) {
                // Overhead Shop Signboard Banner
                Surface(
                    modifier = Modifier
                        .fillMaxWidth()
                        .shadow(12.dp),
                    color = Color(0xFF0F172A)
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        modifier = Modifier.padding(vertical = 24.dp, horizontal = 16.dp)
                    ) {
                        Surface(
                            shape = CircleShape,
                            color = SkyBluePrimary.copy(alpha = 0.2f),
                            border = androidx.compose.foundation.BorderStroke(2.dp, ElectricCyan),
                            modifier = Modifier.size(68.dp)
                        ) {
                            androidx.compose.foundation.Image(
                                painter = androidx.compose.ui.res.painterResource(id = com.example.R.drawable.ic_launcher_foreground),
                                contentDescription = "CHAND Brothers App Icon",
                                modifier = Modifier
                                    .padding(6.dp)
                                    .fillMaxSize()
                            )
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        Text(
                            text = "CHAND BROTHERS",
                            fontSize = 24.sp,
                            fontWeight = FontWeight.Black,
                            color = Color.White,
                            letterSpacing = 2.sp,
                            textAlign = TextAlign.Center
                        )

                        Text(
                            text = "MOBILE REPAIR SHOP",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            color = ElectricCyan,
                            letterSpacing = 3.sp,
                            textAlign = TextAlign.Center
                        )

                        Spacer(modifier = Modifier.height(12.dp))

                        // Glowing Neon "SHOP IS OPEN" Badge
                        Surface(
                            shape = RoundedCornerShape(20.dp),
                            color = AccentEmerald.copy(alpha = 0.2f * alphaGlow),
                            border = androidx.compose.foundation.BorderStroke(1.dp, AccentEmerald.copy(alpha = alphaGlow))
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(6.dp),
                                modifier = Modifier.padding(horizontal = 14.dp, vertical = 6.dp)
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(8.dp)
                                        .clip(CircleShape)
                                        .background(AccentEmerald)
                                )
                                Text(
                                    text = "WAKING UP SHOP DOOR...",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.ExtraBold,
                                    color = AccentEmerald,
                                    letterSpacing = 1.sp
                                )
                            }
                        }
                    }
                }

                // Metallic Rolling Shutter Slat Canvas
                Canvas(
                    modifier = Modifier
                        .fillMaxWidth()
                        .weight(1f)
                        .background(
                            Brush.verticalGradient(
                                colors = listOf(
                                    Color(0xFF334155),
                                    Color(0xFF1E293B),
                                    Color(0xFF0F172A)
                                )
                            )
                        )
                ) {
                    val width = size.width
                    val height = size.height
                    val slatHeight = 36f

                    var currentY = 0f
                    var isAlt = false
                    while (currentY < height) {
                        val slatColor = if (isAlt) Color(0xFF1E293B) else Color(0xFF334155)
                        drawRect(
                            color = slatColor,
                            topLeft = Offset(0f, currentY),
                            size = Size(width, slatHeight - 2f)
                        )

                        // Highlight Line for 3D metallic ridge effect
                        drawLine(
                            color = Color.White.copy(alpha = 0.15f),
                            start = Offset(0f, currentY + 1f),
                            end = Offset(width, currentY + 1f),
                            strokeWidth = 2f
                        )

                        // Shadow line
                        drawLine(
                            color = Color.Black.copy(alpha = 0.4f),
                            start = Offset(0f, currentY + slatHeight - 2f),
                            end = Offset(width, currentY + slatHeight - 2f),
                            strokeWidth = 2f
                        )

                        currentY += slatHeight
                        isAlt = !isAlt
                    }

                    // Draw vertical guide rails on left and right
                    drawRect(
                        color = Color(0xFF0F172A),
                        topLeft = Offset(0f, 0f),
                        size = Size(32f, height)
                    )
                    drawRect(
                        color = Color(0xFF0F172A),
                        topLeft = Offset(width - 32f, 0f),
                        size = Size(32f, height)
                    )
                }

                // Bottom Shutter Heavy Handle / Lock Bar
                Surface(
                    modifier = Modifier.fillMaxWidth(),
                    color = Color(0xFF020617)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 16.dp, horizontal = 24.dp),
                        horizontalArrangement = Arrangement.Center,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.LockOpen,
                            contentDescription = null,
                            tint = ElectricCyan,
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "AUTOMATIC SHOP DOOR UNLOCKING...",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White,
                            letterSpacing = 1.sp
                        )
                    }
                }
            }
        }
    }
}
