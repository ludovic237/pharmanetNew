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

  @Column(name = "prix_achat")
  var prixAchat: Double? = null

  @Column(name = "prix_vente")
  var prixVente: Double? = null

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "produit_id")
  var produit: Produit? = null

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "commande_id")
  var commande: Commande? = null

  @Column(name = "pu_cmd")
  var puCmd: Double? = null

  @Column(name = "pt_cmd")
  var ptCmd: Double? = null

  @Column(name = "qtite_cmd")
  var qtiteCmd: Int? = null

  @Column(name = "pu_recept")
  var puRecept: Double? = null

  @Column(name = "pt_recept")
  var ptRecept: Double? = null

  @Column(name = "qtite_recu")
  var qtiteRecu: Int? = null

  @Column(name = "unite_gratuite")
  var uniteGratuite: Int? = null

  @Column(name = "etat")
  var etat: String? = null

  @ColumnDefault("0")
  @Column(name = "supprimer")
  var supprimer: Int? = 0
}
