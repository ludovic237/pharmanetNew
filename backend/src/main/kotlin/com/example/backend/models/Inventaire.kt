package com.example.backend.models

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import org.hibernate.annotations.ColumnDefault
import java.time.Instant

@Entity
@Table(name = "inventaire")
class Inventaire {
  @Id
  @Column(name = "id", nullable = false)
  var id: Int? = null

  @Column(name = "dateDebut")
  var dateDebut: Instant? = null

  @Column(name = "dateFin")
  var dateFin: Instant? = null

  @Column(name = "etat", length = 15)
  var etat: String? = null

  @ColumnDefault("0")
  @Column(name = "supprimer")
  var supprimer: Int? = null
}
