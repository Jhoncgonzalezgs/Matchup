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
import com.matchup.front.data.TokenStorage
import com.matchup.front.models.UserProfile
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

@Composable
fun MatchesScreen(navController: NavController) {
    val context = LocalContext.current
    val token = TokenStorage(context).getToken()
    val service = ApiClient.create(ApiService::class.java)
    var matches by remember { mutableStateOf(listOf<UserProfile>()) }

    LaunchedEffect(token) {
        if (token != null) {
            service.getMatches("Bearer $token").enqueue(object: Callback<List<UserProfile>> {
                override fun onResponse(call: Call<List<UserProfile>>, response: Response<List<UserProfile>>) {
                    matches = response.body() ?: listOf()
                }
                override fun onFailure(call: Call<List<UserProfile>>, t: Throwable) {}
            })
        }
    }

    Column(modifier = Modifier.padding(16.dp)) {
        matches.forEach { u ->
            Text(text = "${u.email ?: ""}", modifier = Modifier.padding(8.dp))
            Spacer(modifier = Modifier.height(4.dp))
        }
    }
}
