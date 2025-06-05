package com.example.backend.models

import jakarta.persistence.*
import org.hibernate.annotations.ColumnDefault
import java.time.Instant

@Entity
@Table(name = "caisse")
class Caisse {
  @Id
  @Column(name = "id", nullable = false)
  var id: Int? = null

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "employe_id")
  var employe: com.example.backend.models.Employe? = null

  @Column(name = "ouvertureCaisse")
  var ouvertureCaisse: String? = null

  @Column(name = "fermetureCaisse")
  var fermetureCaisse: String? = null

  @Column(name = "dateOuvert")
  var dateOuvert: Instant? = null

  @Column(name = "dateFerme")
  var dateFerme: Instant? = null

  @Column(name = "session", length = 32)
  var session: String? = null

  @Column(name = "fondCaisseOuvert")
  var fondCaisseOuvert: Double? = null

  @Column(name = "fondCaisseFerme")
  var fondCaisseFerme: Double? = null

  @Column(name = "etat", length = 16)
  var etat: String? = null

  @ColumnDefault("0")
  @Column(name = "supprimer")
  var supprimer: Int? = null
}
