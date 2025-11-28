package com.matchup.front.models

data class LoginRequest(val emailOrDocument: String, val password: String)
data class LoginResponse(val message: String, val token: String?)

data class RegisterRequest(val email: String, val document: String, val password: String)

data class GenericResponse(val message: String?, val error: String?)

data class UserProfile(val id: Int, val email: String?, val description: String?, val chatLink: String?, val confirmed: Boolean?, val blocked: Boolean?)

data class EditProfileRequest(val description: String, val chatLink: String)

data class LikeRequest(val toUserId: Int)

data class Message(val id: Int, val match_id: Int, val sender_id: Int, val content: String, val created_at: String)
