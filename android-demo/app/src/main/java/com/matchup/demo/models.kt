package com.matchup.demo

import com.google.gson.annotations.SerializedName

data class LoginRequest(
    val emailOrDocument: String,
    val password: String
)

data class LoginResponse(
    val message: String?,
    val token: String?
)

data class RegisterRequest(
    val email: String,
    val document: String,
    val password: String
)

data class RegisterResponse(
    val message: String?
)

data class UserProfile(
    val id: Int,
    val email: String?,
    val document: String?,
    val description: String?,
    @SerializedName("chatLink") val chatLink: String?
)

data class UploadResponse(
    val message: String?,
    val file: String?,
    val url: String?
)
