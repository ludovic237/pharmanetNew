package com.example.backend.models

import jakarta.persistence.*
import java.time.Instant
import java.time.LocalDateTime

@Entity
@Table(name = "history")
class History {
  @Id
  @Column(name = "id", nullable = false)
  var id: Int? = null

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "produit_id")
  var produit: com.example.backend.models.Produit? = null

  @Column(name = "dateHisto")
  var dateHisto: LocalDateTime? = null

  @Column(name = "description", length = 64)
  var description: String? = null

  @Column(name = "quantite", nullable = false)
  var quantite: Int? = null

  @Column(name = "typeHisto", nullable = false, length = 64)
  var typeHisto: String? = null
}
