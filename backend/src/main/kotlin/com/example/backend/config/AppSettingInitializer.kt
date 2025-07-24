package com.example.backend.config

import com.example.backend.models.AppSetting
import com.example.backend.repositories.AppSettingRepository
import org.springframework.boot.ApplicationArguments
import org.springframework.boot.ApplicationRunner
import org.springframework.context.annotation.Configuration
import org.springframework.stereotype.Component
import org.springframework.web.servlet.config.annotation.CorsRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer

@Component
class AppSettingInitializer(
  private val appSettingRepository: AppSettingRepository
) : ApplicationRunner {

  override fun run(args: ApplicationArguments?) {
    val defaultSettings = listOf(
      AppSetting(keyName = "app_name", value = "ALSA", type = "string"),
      AppSetting(keyName = "vente_mode", value = "differe", type = "string"),
      AppSetting(keyName = "show_menu_stats", value = "true", type = "boolean")
    )

    defaultSettings.forEach { setting ->
      val existing = appSettingRepository.findByKeyName(setting.keyName!!)
      if (existing == null){
        appSettingRepository.save(setting)
        println("Parametre initialiser : ${setting.keyName} = ${setting.value}")
      }
      else {
        println("Parametre deja present : ${existing.keyName}")
      }
    }
  }

}
