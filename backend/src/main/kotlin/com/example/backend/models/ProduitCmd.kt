package com.example.backend.models

import jakarta.persistence.*
import org.hibernate.annotations.ColumnDefault

@Entity
@Table(name = "produit_cmd")
class ProduitCmd {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id", nullable = false)
  var id: Int? = null

  @Column(name = "prixPublic")
  var prixPublic: Double? = 0.0

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "produit_id", insertable = false, updatable = false)
  var produit: Produit? = null

  @Column(name = "produit_id")
  var produitId: Int? = null

  @Column(name = "commande_id")
  var commandeId: Long? = null

  @ManyToOne(fetch = FetchType.EAGER)
  @JoinColumn(name = "commande_id", insertable = false, updatable = false)
  var commande: Commande?=null

  @Column(name = "puCmd")
  var puCmd: Double? = 0.0

  @Column(name = "ptCmd")
  var ptCmd: Double? = 0.0

  @Column(name = "qtiteCmd")
  var qtiteCmd: Int? = null

  @Column(name = "puRecept")
  var puRecept: Double? = 0.0

  @Column(name = "ptRecept")
  var ptRecept: Double? = 0.0

  @Column(name = "qtiteRecu")
  var qtiteRecu: Int? = null

  @Column(name = "uniteGratuite")
  var uniteGratuite: Int? = null

  @Column(name = "etat")
  var etat: String? = null

  @ColumnDefault("0")
  @Column(name = "supprimer")
  var  supprimer: Int? = 0
}
