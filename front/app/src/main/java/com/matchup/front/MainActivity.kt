package com.matchup.front

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.material.MaterialTheme
import androidx.compose.material.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.tooling.preview.Preview
import com.matchup.front.ui.theme.MatchUpTheme
import androidx.compose.material.Text
import androidx.navigation.compose.rememberNavController
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MatchUpTheme {
                Surface(color = MaterialTheme.colors.background) {
                    val navController = rememberNavController()
                    AppNav(navController)
                }
            }
        }
    }
}

@Composable
fun AppNav(navController: NavHostController) {
    NavHost(navController = navController, startDestination = "login") {
        composable("login") { LoginScreen(navController) }
        composable("register") { RegisterScreen(navController) }
        composable("profile") { ProfileScreen(navController) }
        composable("home") { HomeScreen(navController) }
        composable("search") { SearchScreen(navController) }
        composable("matches") { MatchesScreen(navController) }
        composable("chat/{otherUserId}") { backStackEntry ->
            ChatScreen(navController, backStackEntry.arguments?.getString("otherUserId"))
        }
    }
}

@Preview(showBackground = true)
@Composable
fun DefaultPreview() {
    MatchUpTheme {
        Text(text = "Hola MatchUp")
    }
}
