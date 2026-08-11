package com.example.ui.theme

import android.app.Activity
import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val DarkColorScheme = darkColorScheme(
    primary = ElectricCyan,
    onPrimary = Color.Black,
    primaryContainer = CyanDark,
    onPrimaryContainer = Color.White,
    secondary = AccentEmerald,
    onSecondary = Color.Black,
    tertiary = AccentAmber,
    onTertiary = Color.Black,
    background = DarkSlateBackground,
    onBackground = TextPrimaryDark,
    surface = DarkSlateSurface,
    onSurface = TextPrimaryDark,
    surfaceVariant = DarkSlateSurfaceVariant,
    onSurfaceVariant = TextSecondaryDark,
    outline = BorderDark
)

private val LightColorScheme = lightColorScheme(
    primary = SkyBluePrimary,
    onPrimary = Color.White,
    primaryContainer = SkyBlueLight,
    onPrimaryContainer = SkyBlueDark,
    secondary = AccentEmerald,
    onSecondary = Color.White,
    tertiary = AccentAmber,
    onTertiary = Color.White,
    background = OffWhiteBackground,
    onBackground = TextPrimaryLight,
    surface = PureWhite,
    onSurface = TextPrimaryLight,
    surfaceVariant = LightSurfaceVariant,
    onSurfaceVariant = TextSecondaryLight,
    outline = BorderLight
)

@Composable
fun FixTrackTheme(
    darkTheme: Boolean = false, // Clean, high-contrast White & Sky Blue theme as default
    dynamicColor: Boolean = false,
    content: @Composable () -> Unit,
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }
        darkTheme -> DarkColorScheme
        else -> LightColorScheme
    }

    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = colorScheme.background.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = !darkTheme
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}

// Alias for compatibility if needed
@Composable
fun MyApplicationTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = false,
    content: @Composable () -> Unit,
) {
    FixTrackTheme(darkTheme = darkTheme, dynamicColor = dynamicColor, content = content)
}

