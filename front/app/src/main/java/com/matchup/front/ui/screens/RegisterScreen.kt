package com.matchup.front.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.matchup.front.api.ApiClient
import com.matchup.front.api.ApiService
import com.matchup.front.models.RegisterRequest
import com.matchup.front.models.GenericResponse
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

@Composable
fun RegisterScreen(navController: NavController) {
    var email by remember { mutableStateOf("") }
    var document by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    val service = ApiClient.create(ApiService::class.java)

    Column(modifier = Modifier.padding(16.dp)) {
        TextField(value = email, onValueChange = { email = it }, label = { Text("Email") })
        Spacer(modifier = Modifier.height(8.dp))
        TextField(value = document, onValueChange = { document = it }, label = { Text("Documento") })
        Spacer(modifier = Modifier.height(8.dp))
        TextField(value = password, onValueChange = { password = it }, label = { Text("Password") })
        Spacer(modifier = Modifier.height(16.dp))
        Button(onClick = {
            service.register(RegisterRequest(email, document, password)).enqueue(object: Callback<GenericResponse> {
                override fun onResponse(call: Call<GenericResponse>, response: Response<GenericResponse>) {
                    navController.navigate("login")
                }
                override fun onFailure(call: Call<GenericResponse>, t: Throwable) {}
            })
        }) { Text("Registrar") }
    }
}
