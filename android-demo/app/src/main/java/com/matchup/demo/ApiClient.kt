package com.matchup.demo

import android.content.SharedPreferences
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

object ApiClient {
    private val logging = HttpLoggingInterceptor().apply { level = HttpLoggingInterceptor.Level.BODY }

    private fun buildClient(token: String?): OkHttpClient {
        val builder = OkHttpClient.Builder()
            .addInterceptor(logging)

        if (!token.isNullOrEmpty()) {
            builder.addInterceptor { chain ->
                val req = chain.request().newBuilder().apply {
                    addHeader("Authorization", "Bearer $token")
                }.build()
                chain.proceed(req)
            }
        }
        return builder.build()
    }

    private fun retrofit(token: String?): Retrofit {
        return Retrofit.Builder()
            .baseUrl(BuildConfig.API_BASE_URL)
            .client(buildClient(token))
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }

    val apiService: ApiService = retrofit(null).create(ApiService::class.java)

    fun withToken(prefs: SharedPreferences): ApiService {
        val token = prefs.getString("JWT_TOKEN", null)
        return retrofit(token).create(ApiService::class.java)
    }
}
