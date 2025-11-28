package com.matchup.front.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import androidx.compose.ui.platform.LocalContext
import com.matchup.front.data.TokenStorage
import com.matchup.front.api.WebSocketManager
import okhttp3.WebSocketListener
import okhttp3.WebSocket
import okhttp3.Response
import okio.ByteString

@Composable
fun ChatScreen(navController: NavController, otherUserId: String?) {
    val context = LocalContext.current
    val token = TokenStorage(context).getToken()
    val baseUrl = "http://10.0.2.2:3000"
    var wsManager: WebSocketManager? = null
    var messages by remember { mutableStateOf(listOf<String>()) }
    var input by remember { mutableStateOf("") }

    DisposableEffect(token) {
        if (token != null) {
            wsManager = WebSocketManager(baseUrl, token)
            wsManager?.connect(object: WebSocketListener() {
                override fun onMessage(webSocket: WebSocket, text: String) {
                    messages = messages + text
                }
                override fun onMessage(webSocket: WebSocket, bytes: ByteString) {
                    messages = messages + bytes.base64()
                }
            })
        }
        onDispose {
            wsManager?.disconnect()
        }
    }

    Column(modifier = Modifier.padding(16.dp)) {
        Text(text = "Chat con $otherUserId")
        Spacer(modifier = Modifier.height(8.dp))
        Column(modifier = Modifier.weight(1f)) {
            messages.forEach { m -> Text(m) }
        }
        Row {
            TextField(value = input, onValueChange = { input = it }, modifier = Modifier.weight(1f))
            Spacer(modifier = Modifier.width(8.dp))
            Button(onClick = {
                val obj = "{ \"type\": \"send_message\", \"toUserId\": ${otherUserId}, \"content\": \"${input}\" }"
                wsManager?.send(obj)
                input = ""
            }) { Text("Enviar") }
        }
    }
}
