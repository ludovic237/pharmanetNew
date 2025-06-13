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
  @GeneratedValue(strategy = GenerationType.IDENTITY) // Use IDENTITY for auto-increment
  @Column(name = "id", nullable = false)
  var id: Int? = null

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "produit_id")
  var produit: com.example.backend.models.Produit? = null

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "rayon_id")
  var rayon: com.example.backend.models.Rayon? = null

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "fournisseur_id")
  var fournisseur: com.example.backend.models.Fournisseur? = null

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "unite_id")
  var unite: com.example.backend.models.Unite? = null

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "commande_id")
  var commande: Commande? = null

  @Column(name = "date_livraison")
  var dateLivraison: LocalDateTime? = null

  @Column(name = "date_peremption")
  var datePeremption: LocalDateTime? = null

  @Column(name = "prix_achat")
  var prixAchat: Int? = null

  @Column(name = "prix_vente")
  var prixVente: Int? = null

  @Column(name = "reduction")
  var reduction: Int? = null

  @Column(name = "quantite")
  var quantite: Int? = null

  @Column(name = "quantite_restante")
  var quantiteRestante: Int? = null

  @ColumnDefault("0")
  @Column(name = "supprimer")
  var supprimer: Int? = null
}
