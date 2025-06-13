package com.example.backend.models

import jakarta.persistence.*
import org.hibernate.annotations.ColumnDefault
import java.time.Instant
import java.time.LocalDateTime

@Entity
@Table(name = "commande")
class Commande (
@Id
  @GeneratedValue(strategy = GenerationType.IDENTITY) // Use IDENTITY for auto-increment
  @Column(name = "id", nullable = false)
  var id: Long? = null,

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "employe_id")
  var employe: com.example.backend.models.Employe? = null,

  @Column(name = "date_creation")
  var dateCreation: LocalDateTime? = null,

  @Column(name = "date_livraison")
  var dateLivraison: LocalDateTime? = null,

  @Column(name = "note")
  var note: String? = null,

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "fournisseur_id")
  var fournisseur: com.example.backend.models.Fournisseur? = null,

  @Column(name = "qtite_cmd")
  var qtiteCmd: Int? = null,

  @Column(name = "qtite_recu")
  var qtiteRecu: Int? = null,

  @Column(name = "unite_gratuite")
  var uniteGratuite: Int? = null,

  @Column(name = "montant_cmd")
  var montantCmd: Double? = null,

  @Column(name = "montant_recu")
  var montantRecu: Double? = null,

  @Column(name = "etat", length = 32)
  var etat: String? = null,

  @Column(name = "ref", length = 32)
  var ref: String? = null,

  @ColumnDefault("0")
  @Column(name = "supprimer")
  var supprimer: Int? = null
  ){
  // Constantes pour les états de la caisse
  companion object {
    const val COMMANDE_ANNULER = "ANNULER"
    const val COMMANDE_CLOTURE = "CLOTURE"
    const val COMMANDE_LIVREE = "LIVREE"
    const val COMMANDE_EN_COURS = "EN_COURS"
    const val COMMANDE_EN_ATTENTE = "EN_ATTENTE"

  }
}
