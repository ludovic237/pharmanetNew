package com.example.backend.models

import jakarta.persistence.*
import org.hibernate.annotations.ColumnDefault
import java.time.LocalDateTime

@Entity
@Table(name = "facturation")
class Facturation {
  @Id
  @Column(name = "id", nullable = false)
  var id: Int? = null

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "vente_id")
  var vente: com.example.backend.models.Vente? = null

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "caisse_id")
  var caisse: Caisse? = null

  @Column(name = "typePaiement", length = 100)
  var typePaiement: String? = null

  @Column(name = "montantPercu")
  var montantPercu: Int? = null

  @Column(name = "reste")
  var reste: Int? = null

  @Column(name = "montantTtc")
  var montantTtc: Int? = null

  @Column(name = "dateFacture")
  var dateFacture: LocalDateTime? = null

  @ColumnDefault("0")
  @Column(name = "supprimer")
  var supprimer: Int? = null
}
