package com.keval.myfitnesscoach.sync

import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.ActiveCaloriesBurnedRecord
import androidx.health.connect.client.records.ExerciseSessionRecord
import androidx.health.connect.client.records.HeartRateRecord
import androidx.health.connect.client.records.StepsRecord
import androidx.health.connect.client.request.ReadRecordsRequest
import androidx.health.connect.client.time.TimeRangeFilter
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId
import java.util.UUID

@Serializable
data class ExportV1(
  val version: Int = 1,
  val exportedAt: String,
  val source: String = "health-connect",
  val workouts: List<WorkoutExport>,
  val daily: List<DailyExport>,
)

@Serializable
data class WorkoutExport(
  val externalId: String,
  val startTime: String,
  val endTime: String,
  val activityType: String,
  val title: String? = null,
  val distanceKm: Double? = null,
  val activeCaloriesKcal: Double? = null,
  val steps: Long? = null,
  val avgHeartRateBpm: Double? = null,
  val maxHeartRateBpm: Double? = null,
  val heartRateSeries: List<HeartRatePoint>? = null,
)

@Serializable
data class HeartRatePoint(
  val time: String,
  val bpm: Double,
)

@Serializable
data class DailyExport(
  val date: String,
  val steps: Long? = null,
  val activeCaloriesKcal: Double? = null,
  val restingHeartRateBpm: Double? = null,
)

class HealthConnectExporter(
  private val client: HealthConnectClient,
) {
  companion object {
    val REQUIRED_PERMISSIONS = setOf(
      HealthPermission.getReadPermission(ExerciseSessionRecord::class),
      HealthPermission.getReadPermission(HeartRateRecord::class),
      HealthPermission.getReadPermission(ActiveCaloriesBurnedRecord::class),
      HealthPermission.getReadPermission(StepsRecord::class),
    )
  }

  suspend fun export(daysBack: Long = 90): ExportV1 {
    val now = Instant.now()
    val start = now.minusSeconds(daysBack * 24L * 60L * 60L)
    val range = TimeRangeFilter.between(start, now)

    val sessions = client.readRecords(
      ReadRecordsRequest(
        recordType = ExerciseSessionRecord::class,
        timeRangeFilter = range,
        pageSize = 1000
      )
    ).records

    val workouts = sessions.map { session ->
      val sessionRange = TimeRangeFilter.between(session.startTime, session.endTime)

      val steps = client.readRecords(
        ReadRecordsRequest(
          recordType = StepsRecord::class,
          timeRangeFilter = sessionRange,
          pageSize = 1000
        )
      ).records.sumOf { it.count }

      val calories = client.readRecords(
        ReadRecordsRequest(
          recordType = ActiveCaloriesBurnedRecord::class,
          timeRangeFilter = sessionRange,
          pageSize = 1000
        )
      ).records.sumOf { it.energy.inKilocalories }

      val hrRecords = client.readRecords(
        ReadRecordsRequest(
          recordType = HeartRateRecord::class,
          timeRangeFilter = sessionRange,
          pageSize = 1000
        )
      ).records

      val points = hrRecords.flatMap { it.samples }.map {
        HeartRatePoint(time = it.time.toString(), bpm = it.beatsPerMinute)
      }

      val avgHr = if (points.isNotEmpty()) points.map { it.bpm }.average() else null
      val maxHr = points.maxOfOrNull { it.bpm }

      WorkoutExport(
        externalId = session.metadata.id.ifBlank { UUID.randomUUID().toString() },
        startTime = session.startTime.toString(),
        endTime = session.endTime.toString(),
        activityType = session.exerciseType.toString(),
        title = session.title,
        distanceKm = null,
        activeCaloriesKcal = calories.takeIf { it > 0.0 },
        steps = steps.takeIf { it > 0L },
        avgHeartRateBpm = avgHr,
        maxHeartRateBpm = maxHr,
        heartRateSeries = points.takeIf { it.isNotEmpty() }
      )
    }

    // Simple daily aggregates (steps + calories by date) from records.
    val stepsByDate = client.readRecords(
      ReadRecordsRequest(
        recordType = StepsRecord::class,
        timeRangeFilter = range,
        pageSize = 1000
      )
    ).records.groupBy { it.startTime.atZone(ZoneId.systemDefault()).toLocalDate() }
      .mapValues { (_, recs) -> recs.sumOf { it.count } }

    val caloriesByDate = client.readRecords(
      ReadRecordsRequest(
        recordType = ActiveCaloriesBurnedRecord::class,
        timeRangeFilter = range,
        pageSize = 1000
      )
    ).records.groupBy { it.startTime.atZone(ZoneId.systemDefault()).toLocalDate() }
      .mapValues { (_, recs) -> recs.sumOf { it.energy.inKilocalories } }

    val allDates = (0..daysBack.toInt()).map {
      LocalDate.now().minusDays(it.toLong())
    }.reversed()

    val daily = allDates.map { d ->
      DailyExport(
        date = d.toString(),
        steps = stepsByDate[d],
        activeCaloriesKcal = caloriesByDate[d]
      )
    }

    return ExportV1(
      exportedAt = Instant.now().toString(),
      workouts = workouts,
      daily = daily
    )
  }
}

