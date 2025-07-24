package com.example.backend.services

  import com.example.backend.models.AppSetting
  import com.example.backend.models.AuditLog
  import com.example.backend.repositories.AppSettingRepository
  import com.example.backend.repositories.AuditLogRepository
  import org.springframework.stereotype.Service

  @Service
  class AppSettingService(
    private val appSettingRepository: AppSettingRepository
  ) {

    fun getParam(key:String):String? = appSettingRepository.findByKeyName(key)?.value

    fun getBoolean(key: String):Boolean = appSettingRepository.findByKeyName(key)?.value.toBoolean()

    fun updateParam(key: String, value: String):AppSetting {
      val setting = appSettingRepository.findByKeyName(key) ?: AppSetting(keyName = key, value = value)
      setting.value = value
      return appSettingRepository.save(setting)
    }

    fun getAll():List<AppSetting> = appSettingRepository.findAll()

  }
