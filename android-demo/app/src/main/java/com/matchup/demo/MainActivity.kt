package com.matchup.demo

import android.content.Intent
import android.content.SharedPreferences
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.ScrollView
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.launch

class MainActivity : AppCompatActivity() {

    private lateinit var prefs: SharedPreferences
    private lateinit var tvOutput: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        prefs = getSharedPreferences("matchup_prefs", MODE_PRIVATE)

        val etEmail = findViewById<EditText>(R.id.etEmail)
        val etPassword = findViewById<EditText>(R.id.etPassword)
        val btnLogin = findViewById<Button>(R.id.btnLogin)
        val btnRegister = findViewById<Button>(R.id.btnRegister)
        val btnProfile = findViewById<Button>(R.id.btnProfile)
        val btnOpenWebView = findViewById<Button>(R.id.btnOpenWebView)
        tvOutput = findViewById(R.id.tvOutput)

        btnLogin.setOnClickListener {
            val email = etEmail.text.toString()
            val password = etPassword.text.toString()
            if (email.isBlank() || password.isBlank()) {
                showOutput("Email/Password required")
            } else {
                login(email, password)
            }
        }

        btnRegister.setOnClickListener {
            val email = etEmail.text.toString()
            val password = etPassword.text.toString()
            if (email.isBlank() || password.isBlank()) {
                showOutput("Email/Password required for register")
            } else {
                register(email, password)
            }
        }

        btnProfile.setOnClickListener { getProfile() }

        btnOpenWebView.setOnClickListener {
            startActivity(Intent(this, WebViewActivity::class.java))
        }

    }

    private fun showOutput(text: String) {
        runOnUiThread { tvOutput.text = text }
    }

    private fun login(email: String, password: String) {
        showOutput("Logging in...")
        lifecycleScope.launch {
            try {
                val api = ApiClient.apiService
                val resp = api.login(LoginRequest(email, password))
                if (resp.isSuccessful) {
                    val body = resp.body()
                    body?.token?.let {
                        prefs.edit().putString("JWT_TOKEN", it).apply()
                        showOutput("Login OK, token saved")
                    } ?: showOutput("Login OK but no token in response")
                } else {
                    showOutput("Login failed: ${resp.code()} - ${resp.errorBody()?.string()}")
                }
            } catch (e: Exception) {
                e.printStackTrace()
                showOutput("Login error: ${e.message}")
            }
        }
    }

    private fun register(email: String, password: String) {
        showOutput("Registering...")
        lifecycleScope.launch {
            try {
                val api = ApiClient.apiService
                val resp = api.register(RegisterRequest(email, "0000000", password))
                if (resp.isSuccessful) {
                    val body = resp.body()
                    showOutput("Register OK: ${body?.message}")
                } else {
                    showOutput("Register failed: ${resp.code()} - ${resp.errorBody()?.string()}")
                }
            } catch (e: Exception) {
                e.printStackTrace()
                showOutput("Register error: ${e.message}")
            }
        }
    }

    private fun getProfile() {
        showOutput("Fetching profile...")
        lifecycleScope.launch {
            try {
                val api = ApiClient.withToken(prefs)
                val resp = api.getProfile()
                if (resp.isSuccessful) {
                    val body = resp.body()
                    showOutput("Profile: $body")
                } else {
                    showOutput("Profile error ${resp.code()} - ${resp.errorBody()?.string()}")
                }
            } catch (e: Exception) {
                e.printStackTrace()
                showOutput("Get profile error: ${e.message}")
            }
        }
    }
}
