package com.example.backend.models

import jakarta.persistence.*
import org.hibernate.annotations.ColumnDefault
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime

@Entity
@Table(name = "tarification")
class Tarification (
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  var id: Int? = null,

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "produit_id", nullable = false)
  var produit: Produit,

  @Column(name = "prix_vente", nullable = false)
  var prixVente: BigDecimal,

  @Column(name = "date_debut", nullable = false)
  var dateDebut: LocalDateTime = LocalDateTime.now(),

  @Column(name = "date_fin")
  var dateFin: LocalDateTime? = null, // For temporary prices or promotions

  @Column(nullable = false)
  var actif: Boolean = true,

  @Column(columnDefinition = "int default 0")
  var supprimer: Int = 0
)
