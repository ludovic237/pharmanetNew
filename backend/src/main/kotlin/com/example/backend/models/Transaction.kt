package com.example.backend.models

import jakarta.persistence.*
import java.time.Instant
import java.time.LocalDateTime

@Entity
@Table(name = "transaction")
class Transaction {
@Id
  @GeneratedValue(strategy = GenerationType.IDENTITY) // Use IDENTITY for auto-increment
  @Column(name = "id", nullable = false)
  var id: Int? = null

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id")
  var user: com.example.backend.models.User? = null

  @Column(name = "montant", nullable = false)
  var montant: Double? = null

  @Column(name = "type", nullable = false, length = 32)
  var type: String? = null

  @Column(name = "note", nullable = false, length = 128)
  var note: String? = null

  @Column(name = "date_transac", nullable = false)
  var dateTransac: LocalDateTime? = null
}
