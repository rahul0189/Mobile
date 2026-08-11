package com.example.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "sms_templates")
data class SmsTemplate(
    @PrimaryKey
    val statusKey: String,
    val templateText: String
)
