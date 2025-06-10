package com.example.backend.models

import jakarta.persistence.*
import org.hibernate.annotations.ColumnDefault
import java.time.LocalDateTime

@Entity
@Table(name = "commande")
class Commande {
  @Id
  @Column(name = "id", nullable = false)
  var id: Long? = null

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "employe_id")
  var employe: com.example.backend.models.Employe? = null

  @Column(name = "dateCreation")
  var dateCreation: LocalDateTime? = null

  @Column(name = "dateLivraison")
  var dateLivraison: LocalDateTime? = null

  @Column(name = "note")
  var note: String? = null

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "fournisseur_id")
  var fournisseur: com.example.backend.models.Fournisseur? = null

  @Column(name = "qtiteCmd")
  var qtiteCmd: Int? = null

  @Column(name = "qtiteRecu")
  var qtiteRecu: Int? = null

  @Column(name = "uniteGratuite")
  var uniteGratuite: Int? = null

  @Column(name = "montantCmd")
  var montantCmd: Double? = null

  @Column(name = "montantRecu")
  var montantRecu: Double? = null

  @Column(name = "etat", length = 32)
  var etat: String? = null

  @Column(name = "ref", length = 32)
  var ref: String? = null

  @ColumnDefault("0")
  @Column(name = "supprimer")
  var supprimer: Int? = null
}
