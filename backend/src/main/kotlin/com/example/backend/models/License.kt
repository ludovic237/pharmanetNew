package com.example.backend.models

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.Instant
import java.time.LocalDateTime

@Entity
@Table(name = "license")
class License {
  @Id
  @Column(name = "id", nullable = false)
  var id: Int? = null

  @Column(name = "cle", nullable = false)
  var cle: LocalDateTime? = null
}
