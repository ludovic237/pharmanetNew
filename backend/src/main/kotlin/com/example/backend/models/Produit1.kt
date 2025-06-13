package com.example.backend.models

import jakarta.persistence.*
import java.time.Instant
import java.time.LocalDateTime

@Entity
@Table(name = "produit1")
class Produit1 {
@Id
  @GeneratedValue(strategy = GenerationType.IDENTITY) // Use IDENTITY for auto-increment
  @Column(name = "id", nullable = false)
  var id: Int? = null

  @Column(name = "ean13", nullable = false, length = 16)
  var ean13: String? = null

  @Column(name = "reference", nullable = false, length = 32)
  var reference: String? = null

  @Column(name = "nom", length = 32)
  var nom: String? = null

  @Column(name = "contenance", nullable = false)
  var contenance: String? = null

  @Column(name = "stock")
  var stock: Int? = null

  @Column(name = "stock_max")
  var stockMax: Int? = null

  @Column(name = "stock_min")
  var stockMin: Int? = null

  @Column(name = "date_peremption")
  var datePeremption: LocalDateTime? = null

  @Column(name = "date_cmd")
  var dateCmd: LocalDateTime? = null

  @Column(name = "stock_mag")
  var stockMag: Int? = null

  @Column(name = "prix_public")
  var prixPublic: Double? = null

  @Column(name = "prix_achat")
  var prixAchat: Double? = null

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "categorie_id")
  var categorie: Categorie? = null

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "forme_id")
  var forme: Forme? = null

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "fabriquant_id")
  var fabriquant: Fabriquant? = null

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "fournisseur_id")
  var fournisseur: Fournisseur? = null

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "rayon_id")
  var rayon: com.example.backend.models.Rayon? = null

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "magasin_id")
  var magasin: Magasin? = null

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "unite_id")
  var unite: com.example.backend.models.Unite? = null
}
