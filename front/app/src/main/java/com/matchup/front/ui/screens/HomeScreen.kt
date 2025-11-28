package com.matchup.front.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController

@Composable
fun HomeScreen(navController: NavController) {
    Column(modifier = Modifier.padding(16.dp)) {
        Button(onClick = { navController.navigate("search") }) { Text("Buscar") }
        Spacer(modifier = Modifier.height(8.dp))
        Button(onClick = { navController.navigate("matches") }) { Text("Matches") }
        Spacer(modifier = Modifier.height(8.dp))
        Button(onClick = { navController.navigate("profile") }) { Text("Mi Perfil") }
    }
}
