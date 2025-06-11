package com.example.backend.models

import jakarta.persistence.*
import org.hibernate.annotations.ColumnDefault

@Entity
@Table(name = "produit_cmd")
class ProduitCmd {
   @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY) // Use IDENTITY for auto-increment
  @Column(name = "id", nullable = false)
  var id: Int? = null

  @Column(name = "prixPublic")
  var prixPublic: Double? = null

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "produit_id")
  var produit: Produit? = null

  @Column(name = "commande_id")
  var commandeId: Long? = null

  @Column(name = "puCmd")
  var puCmd: Double? = null

  @Column(name = "ptCmd")
  var ptCmd: Double? = null

  @Column(name = "qtiteCmd")
  var qtiteCmd: Int? = null

  @Column(name = "puRecept")
  var puRecept: Double? = null

  @Column(name = "ptRecept")
  var ptRecept: Double? = null

  @Column(name = "qtiteRecu")
  var qtiteRecu: Int? = null

  @Column(name = "uniteGratuite")
  var uniteGratuite: Int? = null

  @Column(name = "etat")
  var etat: String? = null

  @ColumnDefault("0")
  @Column(name = "supprimer")
  var supprimer: Int? = null
}
