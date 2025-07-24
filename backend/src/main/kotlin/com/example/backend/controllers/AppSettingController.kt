package com.example.backend.controllers

import com.example.backend.models.AppSetting
import com.example.backend.models.BonCaisse
import com.example.backend.services.AppSettingService
import com.example.backend.services.BonCaisseService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/admin/setting")
class AppSettingController(
  private val appSettingService: AppSettingService
) {

  @GetMapping("/{key}")
  fun getParam(@PathVariable key: String): ResponseEntity<Map<String,Any?>>{
    var data = appSettingService.getParam(key)
    return ResponseEntity.ok(mapOf("key" to data))
  }

  @PostMapping("/{key}")
  fun setParam(@PathVariable key: String, @RequestBody value: String): ResponseEntity<AppSetting>{
    return ResponseEntity.ok(appSettingService.updateParam(key, value))
  }

  @GetMapping
  fun getAll(): ResponseEntity<List<AppSetting>> {
    return ResponseEntity.ok(appSettingService.getAll())
  }

}
