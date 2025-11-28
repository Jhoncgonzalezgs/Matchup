package com.matchup.front.data

import android.content.Context

class TokenStorage(private val context: Context) {
    private val prefs = context.getSharedPreferences("matchup_prefs", Context.MODE_PRIVATE)

    fun saveToken(token: String) {
        prefs.edit().putString("jwt", token).apply()
    }

    fun getToken(): String? = prefs.getString("jwt", null)

    fun clear() { prefs.edit().remove("jwt").apply() }
}
