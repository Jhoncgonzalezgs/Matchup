package com.matchup.front.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material.*
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import android.net.Uri
import androidx.core.net.toFile
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody
import okhttp3.RequestBody.Companion.asRequestBody
import androidx.compose.ui.platform.LocalContext
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import androidx.compose.ui.platform.LocalContext
import com.matchup.front.api.ApiClient
import com.matchup.front.api.ApiService
import com.matchup.front.data.TokenStorage
import com.matchup.front.models.EditProfileRequest
import com.matchup.front.models.UserProfile
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

@Composable
fun ProfileScreen(navController: NavController) {
    val context = LocalContext.current
    val token = TokenStorage(context).getToken()
    val service = ApiClient.create(ApiService::class.java)

    var profile by remember { mutableStateOf<UserProfile?>(null) }
    var description by remember { mutableStateOf("") }
    var chatLink by remember { mutableStateOf("") }

    LaunchedEffect(token) {
        if (token != null) {
            service.getProfile("Bearer $token").enqueue(object: Callback<UserProfile> {
                override fun onResponse(call: Call<UserProfile>, response: Response<UserProfile>) {
                    val p = response.body()
                    profile = p
                    if (p != null) { description = p.description ?: ""; chatLink = p.chatLink ?: "" }
                }
                override fun onFailure(call: Call<UserProfile>, t: Throwable) {}
            })
        }
    }

    val launcher = rememberLauncherForActivityResult(ActivityResultContracts.GetContent()) { uri: Uri? ->
        if (uri != null && token != null) {
            val cr = context.contentResolver
            val input = cr.openInputStream(uri)
            // We'll write temp file for upload
            val tmp = java.io.File(context.cacheDir, "upload.jpg")
            input?.use { inputStream -> tmp.outputStream().use { output -> inputStream.copyTo(output) } }
            val reqFile = tmp.asRequestBody("image/jpeg".toMediaTypeOrNull())
            val body = MultipartBody.Part.createFormData("photo", tmp.name, reqFile)
            service.uploadPhoto("Bearer $token", body).enqueue(object: retrofit2.Callback<com.matchup.front.models.GenericResponse> {
                override fun onResponse(call: retrofit2.Call<com.matchup.front.models.GenericResponse>, response: retrofit2.Response<com.matchup.front.models.GenericResponse>) {}
                override fun onFailure(call: retrofit2.Call<com.matchup.front.models.GenericResponse>, t: Throwable) {}
            })
        }
    }

    Column(modifier = Modifier.padding(16.dp)) {
        Text(text = "Mi Perfil")
        Spacer(modifier = Modifier.height(8.dp))
        TextField(value = description, onValueChange = { description = it }, label = { Text("Descripción") })
        Spacer(modifier = Modifier.height(8.dp))
        TextField(value = chatLink, onValueChange = { chatLink = it }, label = { Text("Chat link") })
        Spacer(modifier = Modifier.height(8.dp))
        Button(onClick = {
            service.editProfile("Bearer $token", EditProfileRequest(description, chatLink)).enqueue(object: Callback<Any> {
                override fun onResponse(call: Call<Any>, response: Response<Any>) {}
                override fun onFailure(call: Call<Any>, t: Throwable) {}
            })
        }) { Text("Guardar") }
        Spacer(modifier = Modifier.height(8.dp))
        Button(onClick = { launcher.launch("image/*") }) { Text("Subir foto") }
    }
}
