package com.example.backend.models

import jakarta.persistence.*
import org.hibernate.annotations.ColumnDefault

@Entity
@Table(name = "concerner")
class Concerner {
  @Id
  @Column(name = "id", nullable = false)
  var id: Int? = null

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "vente_id")
  var vente: com.example.backend.models.Vente? = null

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "produit_id")
  var produit: com.example.backend.models.Produit? = null

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "en_rayon_id")
  var enRayon: com.example.backend.models.EnRayon? = null

  @Column(name = "prixUnit")
  var prixUnit: Int? = null

  @Column(name = "quantite")
  var quantite: Int? = null

  @Column(name = "reduction")
  var reduction: Int? = null

  @ColumnDefault("0")
  @Column(name = "supprimer")
  var supprimer: Int? = null

  @ColumnDefault("'en rayon'")
  @Column(name = "type")
  var type: String? = null
}
