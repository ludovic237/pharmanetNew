package com.example.backend.models

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import org.hibernate.annotations.ColumnDefault
import java.time.Instant
import java.time.LocalDateTime

@Entity
@Table(name = "inventaire")
class Inventaire {
  @Id
  @Column(name = "id", nullable = false)
  var id: Int? = null

  @Column(name = "dateDebut")
  var dateDebut: LocalDateTime? = null

  @Column(name = "dateFin")
  var dateFin: LocalDateTime? = null

  @Column(name = "etat", length = 15)
  var etat: String? = null

  @ColumnDefault("0")
  @Column(name = "supprimer")
  var supprimer: Int? = null
}
