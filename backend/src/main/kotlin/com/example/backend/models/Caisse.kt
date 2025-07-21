package com.example.backend.models

import jakarta.persistence.*
import org.hibernate.annotations.ColumnDefault
import java.time.Instant
import java.time.LocalDateTime

@Entity
@Table(name = "caisse")
class Caisse {
  @Id
  @Column(name = "id", nullable = false)
  var id: Int? = null

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id")
  var user: com.example.backend.models.Employe? = null

  @Column(name = "ouvertureCaisse")
  var ouvertureCaisse: String? = null

  @Column(name = "fermetureCaisse")
  var fermetureCaisse: String? = null

  @Column(name = "dateOuvert")
  var dateOuvert: LocalDateTime? = null

  @Column(name = "dateFerme")
  var dateFerme: LocalDateTime? = null

  @Column(name = "session", length = 32)
  var session: String? = null

  @Column(name = "fondCaisseOuvert")
  var fondCaisseOuvert: Double? = 0.0

  @Column(name = "fondCaisseFerme")
  var fondCaisseFerme: Double? = 0.0

  @Column(name = "etat", length = 16)
  var etat: String? = null

  @ColumnDefault("0")
  @Column(name = "supprimer")
  var  supprimer: Int? = 0
}
