package com.example.backend.models

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "ligne_caisse")
class LigneCaisse {
   @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY) // Use IDENTITY for auto-increment
  @Column(name = "id", nullable = false)
  var id: Int? = null

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "caisse_id")
  var caisse: Caisse? = null

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "produit_id")
  var produit: com.example.backend.models.Produit? = null

  @Column(name = "libelle", nullable = false)
  var libelle: String? = null

  @Column(name = "dateLigne", nullable = false)
  var dateLigne: LocalDateTime? = null

  @Column(name = "debit")
  var debit: Double? = null

  @Column(name = "credit")
  var credit: Double? = null

  @Column(name = "type", nullable = false, length = 32)
  var type: String? = null

  @Column(name = "refProduit", nullable = false)
  var refProduit: Int? = null

  @Column(name = "motif", nullable = false, length = 128)
  var motif: String? = null
}
