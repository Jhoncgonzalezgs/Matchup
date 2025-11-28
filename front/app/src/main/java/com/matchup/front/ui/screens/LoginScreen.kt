package com.matchup.front.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material.*
import androidx.compose.runtime.*
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.matchup.front.api.ApiClient
import com.matchup.front.api.ApiService
import com.matchup.front.data.TokenStorage
import com.matchup.front.models.LoginRequest
import com.matchup.front.models.LoginResponse
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import android.content.Context

@Composable
import androidx.compose.ui.platform.LocalContext
fun LoginScreen(navController: NavController) {
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    val service = ApiClient.create(ApiService::class.java)
    val context = LocalContext.current

    Column(modifier = Modifier.padding(16.dp)) {
        TextField(value = email, onValueChange = { email = it }, label = { Text("Email o documento") })
        Spacer(modifier = Modifier.height(8.dp))
        TextField(value = password, onValueChange = { password = it }, label = { Text("Password") }, visualTransformation = PasswordVisualTransformation())
        Spacer(modifier = Modifier.height(16.dp))
        Button(onClick = {
            service.login(LoginRequest(email, password)).enqueue(object: Callback<LoginResponse> {
                override fun onResponse(call: Call<LoginResponse>, response: Response<LoginResponse>) {
                    val body = response.body()
                    if (body?.token != null) {
                        TokenStorage(context).saveToken(body.token)
                        navController.navigate("home")
                    }
                }
                override fun onFailure(call: Call<LoginResponse>, t: Throwable) {
                    // show error
                }
            })
        }) { Text("Login") }
        Spacer(modifier = Modifier.height(8.dp))
        TextButton(onClick = { navController.navigate("register") }) { Text("Registrarse") }
    }
}
