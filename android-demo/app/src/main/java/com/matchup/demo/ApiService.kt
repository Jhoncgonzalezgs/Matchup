package com.matchup.demo

import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Multipart
import retrofit2.http.POST
import retrofit2.http.Part
import okhttp3.MultipartBody

interface ApiService {

    @POST("auth/login")
    suspend fun login(@Body req: LoginRequest): Response<LoginResponse>

    @POST("auth/register")
    suspend fun register(@Body req: RegisterRequest): Response<RegisterResponse>

    @GET("users/me/profile")
    suspend fun getProfile(): Response<UserProfile>

    @Multipart
    @POST("photos")
    suspend fun upload(@Part file: MultipartBody.Part): Response<UploadResponse>

}
