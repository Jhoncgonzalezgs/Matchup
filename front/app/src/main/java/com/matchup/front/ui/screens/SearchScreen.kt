package com.matchup.front.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import androidx.compose.ui.platform.LocalContext
import com.matchup.front.api.ApiClient
import com.matchup.front.api.ApiService
import com.matchup.front.models.UserProfile
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import androidx.compose.foundation.clickable

@Composable
fun SearchScreen(navController: NavController) {
    val context = LocalContext.current
    val service = ApiClient.create(ApiService::class.java)
    var q by remember { mutableStateOf("") }
    var results by remember { mutableStateOf(listOf<UserProfile>()) }

    Column(modifier = Modifier.padding(16.dp)) {
        TextField(value = q, onValueChange = { q = it }, label = { Text("Buscar") })
        Spacer(modifier = Modifier.height(8.dp))
        Button(onClick = {
            service.searchUsers(q).enqueue(object: Callback<List<UserProfile>> {
                override fun onResponse(call: Call<List<UserProfile>>, response: Response<List<UserProfile>>) {
                    results = response.body() ?: listOf()
                }
                override fun onFailure(call: Call<List<UserProfile>>, t: Throwable) {}
            })
        }) { Text("Buscar") }

        Spacer(modifier = Modifier.height(8.dp))
        Column {
            results.forEach { u ->
                Text(text = "ID ${u.id} - ${u.email ?: ""}", modifier = Modifier.clickable { })
                Spacer(modifier = Modifier.height(4.dp))
            }
        }
    }
}
