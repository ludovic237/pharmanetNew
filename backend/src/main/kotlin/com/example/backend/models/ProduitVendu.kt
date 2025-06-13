package com.example.backend.models

import jakarta.persistence.*

@Entity
@Table(name = "produit_vendu")
class ProduitVendu {
@Id
  @GeneratedValue(strategy = GenerationType.IDENTITY) // Use IDENTITY for auto-increment
  @Column(name = "id", nullable = false)
  var id: Int? = null

  @Column(name = "qtite_vendu")
  var qtiteVendu: Int? = null

  @Column(name = "tva")
  var tva: Double? = null

  @Column(name = "prix_unit")
  var prixUnit: Double? = null

  @Column(name = "montant_ttc")
  var montantTtc: Double? = null

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "produit_id")
  var produit: Produit? = null

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "vente_id")
  var vente: com.example.backend.models.Vente? = null
}
