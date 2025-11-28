package com.matchup.front.api

import com.matchup.front.models.*
import retrofit2.Call
import okhttp3.MultipartBody
import retrofit2.http.*

interface ApiService {
    @POST("/auth/login")
    fun login(@Body req: LoginRequest): Call<LoginResponse>

    @POST("/auth/register")
    fun register(@Body req: RegisterRequest): Call<GenericResponse>

    @GET("/users/me/profile")
    fun getProfile(@Header("Authorization") token: String): Call<UserProfile>

    @PUT("/users/me/edit")
    fun editProfile(@Header("Authorization") token: String, @Body body: EditProfileRequest): Call<GenericResponse>

    @GET("/users/search")
    fun searchUsers(@Query("q") q: String): Call<List<UserProfile>>

    @POST("/match/like")
    fun giveLike(@Header("Authorization") token: String, @Body req: LikeRequest): Call<GenericResponse>

    @GET("/match")
    fun getMatches(@Header("Authorization") token: String): Call<List<UserProfile>>

    @GET("/messages/{otherUserId}")
    fun getMessages(@Header("Authorization") token: String, @Path("otherUserId") otherUserId: Int): Call<List<Message>>

    @Multipart
    @POST("/photos")
    fun uploadPhoto(@Header("Authorization") token: String, @Part photo: MultipartBody.Part): Call<GenericResponse>
}

