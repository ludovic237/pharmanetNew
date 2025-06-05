package com.example.backend.models

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.Instant
import java.time.LocalDateTime

@Entity
@Table(name = "transaction")
class Transaction {
  @Id
  @Column(name = "id", nullable = false)
  var id: Int? = null

  @Column(name = "montant", nullable = false)
  var montant: Double? = null

  @Column(name = "type", nullable = false, length = 32)
  var type: String? = null

  @Column(name = "note", nullable = false, length = 128)
  var note: String? = null

  @Column(name = "dateTransac", nullable = false)
  var dateTransac: LocalDateTime? = null
}
