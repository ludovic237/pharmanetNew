package com.example.backend.models

import java.time.LocalDateTime
import jakarta.persistence.*
import org.hibernate.annotations.ColumnDefault


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
