package com.example.backend.models

import jakarta.persistence.*
import java.time.Instant
import java.time.LocalDateTime

@Entity
@Table(name = "message")
class Message {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY) // Use IDENTITY for auto-increment
  @Column(name = "id", nullable = false)
  var id: Int? = null

  @Column(name = "type", length = 32)
  var type: String? = null

  @Column(name = "description", length = 64)
  var description: String? = null

  @Column(name = "datemsg")
  var datemsg: LocalDateTime? = null
}
