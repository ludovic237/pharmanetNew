package com.example.backend.models

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import org.hibernate.annotations.ColumnDefault

@Entity
@Table(name = "concerner")
class Concerner {
  @Id
  @Column(name = "id", nullable = false)
  var id: Int? = null

  @Column(name = "vente_id")
  var venteId: Long? = null

  @Column(name = "produit_id")
  var produitId: Int? = null

  @Column(name = "en_rayon_id")
  var enRayonId: String? = null

  @Column(name = "prixUnit")
  var prixUnit: Int? = null

  @Column(name = "quantite")
  var quantite: Int? = null

  @Column(name = "reduction")
  var reduction: Int? = null

  @ColumnDefault("0")
  @Column(name = "supprimer")
  var  supprimer: Int? = 0

  @ColumnDefault("'en rayon'")
  @Column(name = "type")
  var type: String? = null
}
