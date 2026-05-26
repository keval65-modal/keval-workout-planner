package com.keval.myfitnesscoach.sync

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.provider.DocumentsContract
import androidx.activity.ComponentActivity
import androidx.activity.result.contract.ActivityResultContracts
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.ExerciseSessionRecord
import com.keval.myfitnesscoach.sync.databinding.ActivityMainBinding
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

class MainActivity : ComponentActivity() {
  private lateinit var binding: ActivityMainBinding
  private lateinit var client: HealthConnectClient
  private lateinit var exporter: HealthConnectExporter

  private val json = Json {
    prettyPrint = true
    encodeDefaults = true
    ignoreUnknownKeys = true
  }

  private val permissionsLauncher = registerForActivityResult(
    ActivityResultContracts.RequestMultiplePermissions()
  ) { _ ->
    refreshStatus()
  }

  private val createDocLauncher = registerForActivityResult(
    ActivityResultContracts.CreateDocument("application/json")
  ) { uri: Uri? ->
    if (uri == null) return@registerForActivityResult
    exportToUri(uri)
  }

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    binding = ActivityMainBinding.inflate(layoutInflater)
    setContentView(binding.root)

    client = HealthConnectClient.getOrCreate(this)
    exporter = HealthConnectExporter(client)

    binding.btnPermissions.setOnClickListener {
      requestPermissions()
    }
    binding.btnExport.setOnClickListener {
      createDocLauncher.launch("my-fitness-coach-healthconnect-export.json")
    }

    refreshStatus()
  }

  private fun requestPermissions() {
    permissionsLauncher.launch(HealthConnectExporter.REQUIRED_PERMISSIONS.toTypedArray())
  }

  private fun refreshStatus() {
    CoroutineScope(Dispatchers.Main).launch {
      val granted = client.permissionController.getGrantedPermissions()
      val ok = granted.containsAll(HealthConnectExporter.REQUIRED_PERMISSIONS)
      binding.status.text = if (ok) {
        "Permissions granted. You can export now."
      } else {
        "Grant Health Connect read permissions for workouts, heart rate, calories, and steps."
      }
    }
  }

  private fun exportToUri(uri: Uri) {
    binding.status.text = "Exporting…"
    CoroutineScope(Dispatchers.Main).launch {
      try {
        val payload = withContext(Dispatchers.IO) { exporter.export(daysBack = 180) }
        val text = json.encodeToString(payload)
        withContext(Dispatchers.IO) {
          contentResolver.openOutputStream(uri)?.use { out ->
            out.write(text.toByteArray())
          }
        }
        binding.status.text = "Export complete. Import this JSON in My Fitness Coach → Settings."
      } catch (e: Exception) {
        binding.status.text = "Export failed: ${e.message}"
      }
    }
  }
}

