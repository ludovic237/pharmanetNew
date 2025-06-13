package com.example.backend.models

import jakarta.persistence.*
import org.hibernate.annotations.ColumnDefault
import java.time.Instant
import java.time.LocalDateTime

@Entity
@Table(name = "audit_logs")
class AuditLog {
@Id
  @GeneratedValue(strategy = GenerationType.IDENTITY) // Use IDENTITY for auto-increment
  @Column(name = "id", nullable = false)
  var id: Long? = null

  @Column(name = "user_id")
  var userId: Long? = null

  @Column(name = "action", length = 50)
  var action: String? = null

  @Column(name = "method_name")
  var methodName: String? = null

  @Lob
  @Column(name = "arguments")
  var arguments: String? = null

  @Lob
  @Column(name = "result")
  var result: String? = null

  @Lob
  @Column(name = "exception")
  var exception: String? = null

  @ColumnDefault("CURRENT_TIMESTAMP")
  @Column(name = "timestamp")
  var timestamp: LocalDateTime? = null

  @Column(name = "created_date")
  var createdDate: LocalDateTime? = null

  @Column(name = "updated_date")
  var updatedDate: LocalDateTime? = null
}
