package com.example.backend.services

  import com.example.backend.models.AuditLog
  import com.example.backend.repositories.AuditLogRepository
  import org.springframework.stereotype.Service

  @Service
  class AuditLogService(
    private val auditLogRepository: AuditLogRepository
  ) {
    fun saveLog(userActionLog: AuditLog) {
      auditLogRepository.save(userActionLog)
    }
  }
