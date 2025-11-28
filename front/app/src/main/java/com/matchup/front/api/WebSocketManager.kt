package com.matchup.front.api

import okhttp3.*
import okio.ByteString
import android.util.Log

class WebSocketManager(private val baseUrl: String, private val token: String) {
    private val client = OkHttpClient()
    private var webSocket: WebSocket? = null

    fun connect(listener: WebSocketListener) {
        val url = baseUrl.replace("http://", "ws://").replace("https://", "wss://") + "/ws?token=$token"
        val req = Request.Builder().url(url).build()
        webSocket = client.newWebSocket(req, listener)
    }

    fun send(text: String) { webSocket?.send(text) }
    fun disconnect() { webSocket?.close(1000, "Client closed") }
}
