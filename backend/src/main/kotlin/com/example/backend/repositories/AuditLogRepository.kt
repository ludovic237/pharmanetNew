package com.example.backend.repositories

import com.example.backend.models.AuditLog
import com.example.backend.models.BillingCycleDetailsView
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.time.LocalDateTime

@Repository
interface AuditLogRepository : JpaRepository<AuditLog, Long> {


}
