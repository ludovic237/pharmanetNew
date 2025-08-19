package com.example.backend.models

import jakarta.persistence.*
import org.hibernate.annotations.ColumnDefault
import java.time.Instant
import java.time.LocalDateTime

@Entity
@Table(name = "commande")
class Commande (
  @Id
  @Column(name = "id", nullable = false)
  var id: Long? = null,

  @Column(name = "employe_id")
  var employeId: Int? = null,

  @Column(name = "dateCreation")
  var dateCreation: LocalDateTime? = null,

  @Column(name = "dateLivraison")
  var dateLivraison: LocalDateTime? = null,

  @Column(name = "note")
  var note: String? = null,

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "fournisseur_id")
  var fournisseur: com.example.backend.models.Fournisseur? = null,

  @OneToMany(mappedBy = "commande", cascade = [CascadeType.ALL], fetch = FetchType.LAZY)
  var produits: MutableList<ProduitCmd?> = mutableListOf(),

  @Column(name = "qtiteCmd")
  var qtiteCmd: Int? = null,

  @Column(name = "qtiteRecu")
  var qtiteRecu: Int? = null,

  @Column(name = "uniteGratuite")
  var uniteGratuite: Int? = null,

  @Column(name = "montantCmd")
  var montantCmd: Double? = 0.0,

  @Column(name = "montantRecu")
  var montantRecu: Double? = 0.0,

  @Column(name = "etat", length = 32)
  var etat: String? = null,

  @Column(name = "ref", length = 32)
  var ref: String? = null,

  @ColumnDefault("0")
  @Column(name = "supprimer")
  var  supprimer: Int? = 0
){
  // Constantes pour les états de la caisse
  companion object {
    const val COMMANDE_ANNULER = "ANNULER"
    //    const val COMMANDE_CLOTURE = "CLOTURE"
    const val COMMANDE_LIVREE = "LIVREE"
    const val COMMANDE_EN_COURS = "EN_COURS"
    const val COMMANDE_EN_ATTENTE = "EN_ATTENTE"
    const val COMMANDE_CLOTUREE = "CLOTUREE"

    const val COMMANDE_RECEPTION_TYPE_COMPLETE = "COMPLETE"
    const val COMMANDE_RECEPTION_TYPE_PARTIEL = "PARTIEL"
    const val COMMANDE_RECEPTION_TYPE_ANNULER = "ANNULER"

  }
}
