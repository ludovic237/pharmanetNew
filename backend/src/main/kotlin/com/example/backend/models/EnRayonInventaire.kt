package com.example.backend.models

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import org.hibernate.annotations.ColumnDefault
import java.time.Instant

@Entity
@Table(name = "en_rayon_inventaire")
class EnRayonInventaire {
  @Id
  @Column(name = "id", nullable = false)
  var id: Long? = null

  @Column(name = "inventaire_id")
  var inventaireId: Int? = null

  @Column(name = "en_rayon_id")
  var enRayonId: String? = null

  @Column(name = "employe_id")
  var employeId: Int? = null

  @Column(name = "quantite_rayon")
  var quantiteRayon: Int? = null

  @Column(name = "quantite_inventaire")
  var quantiteInventaire: Int? = null

  @Column(name = "date_debut")
  var dateDebut: Instant? = null

  @Column(name = "date_fin")
  var dateFin: Instant? = null

  @Column(name = "type", length = 100)
  var type: String? = null

  @Column(name = "statut", length = 100)
  var statut: String? = null

  @ColumnDefault("0")
  @Column(name = "supprimer")
  var supprimer: Int? = null
}
