package com.example.backend.models

import jakarta.persistence.*
import org.hibernate.annotations.ColumnDefault
import java.time.Instant
import java.time.LocalDateTime

@Entity
@Table(name = "caisse")
class Caisse(
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY) // Use IDENTITY for auto-increment
  @Column(name = "id", nullable = false)
  var id: Int? = null,

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "employe_id")
  var employe: com.example.backend.models.Employe? = null,

  @Column(name = "ouverture_caisse")
  var ouvertureCaisse: String? = null,

  @Column(name = "fermeture_caisse")
  var fermetureCaisse: String? = null,

  @Column(name = "date_ouvert")
  var dateOuvert: LocalDateTime? = null,

  @Column(name = "date_ferme")
  var dateFerme: LocalDateTime? = null,

  @Column(name = "session", length = 32)
  var session: String? = null,

  @Column(name = "fond_caisse_ouvert")
  var fondCaisseOuvert: Double? = null,

  @Column(name = "fond_caisse_ferme")
  var fondCaisseFerme: Double? = null,

  @Column(name = "etat", length = 16)
  var etat: String? = null,

  @ColumnDefault("0")
  @Column(name = "supprimer")
  var supprimer: Int? = 0
) {
  // Constantes pour les états de la caisse
  companion object {
    const val ETAT_OUVERT = "OUVERT"
    const val ETAT_FERME = "FERME"
    const val ETAT_CLOTURE_EN_ATTENTE = "CLOTURE_EN_ATTENTE"
  }
}
