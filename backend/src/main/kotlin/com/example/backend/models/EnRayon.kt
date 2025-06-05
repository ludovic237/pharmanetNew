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
  var datePeremption: LocalDate? = null

  @Column(name = "prixAchat")
  var prixAchat: Int? = null

  @Column(name = "prixVente")
  var prixVente: Int? = null

  @Column(name = "reduction")
  var reduction: Int? = null

  @Column(name = "quantite")
  var quantite: Int? = null

  @Column(name = "quantiteRestante")
  var quantiteRestante: Int? = null

  @ColumnDefault("0")
  @Column(name = "supprimer")
  var supprimer: Int? = null
}
