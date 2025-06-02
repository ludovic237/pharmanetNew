package com.example.backend.models

import jakarta.persistence.*
import org.hibernate.annotations.ColumnDefault
import java.time.Instant
import java.time.LocalDateTime

@Entity
@Table(name = "audit_logs")
class AuditLog {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id", nullable = true)
  var id: Long? = null

  @Column(name = "user_id", nullable = true)
  var userId: Long? = null

  @Column(name = "action", nullable = true, length = 50)
  var action: String? = null

  @Column(name = "method_name", nullable = true)
  var methodName: String? = null

  @Lob
  @Column(name = "arguments")
  var arguments: String? = null

  @Lob
  @Column(columnDefinition = "LONGTEXT")
  var result: String? = null

  @Lob
  @Column(name = "exception")
  var exception: String? = null

  @ColumnDefault("CURRENT_TIMESTAMP")
  @Column(name = "timestamp")
  val timestamp: LocalDateTime = LocalDateTime.now()

  @Column(name = "created_date")
  var createdDate: LocalDateTime? = null

  @Column(name = "updated_date")
  var updatedDate: LocalDateTime? = null

//  override fun toString():String {
//    return "AuditLog(id=$id, userId=$userId, action=$action, methodName=$methodName, arguments=$arguments, result=$result, exception=$exception, timestamp=$timestamp)"
//  }
}
