package com.example.backend.repositories

import com.example.backend.models.AppSetting
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface AppSettingRepository : JpaRepository<AppSetting, Long> {
  fun findByKeyName(key:String):AppSetting?
}
