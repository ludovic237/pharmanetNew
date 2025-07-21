package com.example.backend.models

import jakarta.persistence.*
import org.hibernate.annotations.ColumnDefault
import java.time.Instant
import java.time.LocalDate
import java.time.LocalDateTime

@Entity
@Table(name = "en_rayon")
class EnRayon {
  @Id
  @Column(name = "id", nullable = false)
  var id: String? = null

  @Column(name = "produit_id")
  var produitId: Int? = null

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "fournisseur_id")
  var fournisseur: com.example.backend.models.Fournisseur? = null

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "commande_id")
  var commande: Commande? = null

  @Column(name = "dateLivraison")
  var dateLivraison: LocalDateTime? = null

  @Column(name = "datePeremption")
  var datePeremption: LocalDateTime? = null

  @Column(name = "prixAchat")
  var prixAchat: Int? = 0

  @Column(name = "prixVente")
  var prixVente: Int? = 0

  @Column(name = "reduction")
  var reduction: Int? = 0

  @Column(name = "quantite")
  var quantite: Int? = 0

  @Column(name = "quantiteRestante")
  var quantiteRestante: Int? = 0

  @ColumnDefault("0")
  @Column(name = "supprimer")
  var  supprimer: Int? = 0
}
