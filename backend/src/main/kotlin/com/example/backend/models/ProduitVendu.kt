package com.example.backend.models

import jakarta.persistence.*

@Entity
@Table(name = "produit_vendu")
class ProduitVendu {
  @Id
  @Column(name = "id", nullable = false)
  var id: Int? = null

  @Column(name = "qtiteVendu")
  var qtiteVendu: Int? = null

  @Column(name = "tva")
  var tva: Double? = null

  @Column(name = "prixUnit")
  var prixUnit: Double? = null

  @Column(name = "montantTTC")
  var montantTTC: Double? = null

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "produit_id")
  var produit: Produit? = null

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "vente_id")
  var vente: com.example.backend.models.Vente? = null
}
