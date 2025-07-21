package com.example.backend.models

import jakarta.persistence.*
import java.time.Instant
import java.time.LocalDateTime

@Entity
@Table(name = "license")
class License {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY) // Use IDENTITY for auto-increment
  @Column(name = "id", nullable = false)
  var id: Int? = null

  @Column(name = "cle", nullable = false)
  var cle: LocalDateTime? = null
}
