package com.example.backend.models

import jakarta.persistence.*
import java.time.Instant
import java.time.LocalDateTime

@Entity
@Table(name = "history")
class History {
@Id
  @GeneratedValue(strategy = GenerationType.IDENTITY) // Use IDENTITY for auto-increment
  @Column(name = "id", nullable = false)
  var id: Int? = null

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "produit_id")
  var produit: com.example.backend.models.Produit? = null

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id")
  var user: com.example.backend.models.User? = null

  @Column(name = "date_histo")
  var dateHisto: LocalDateTime? = null

  @Column(name = "description", length = 64)
  var description: String? = null

  @Column(name = "quantite", nullable = false)
  var quantite: Int? = null

  @Column(name = "typeHisto", nullable = false, length = 64)
  var typeHisto: String? = null
}
