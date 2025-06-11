package com.example.backend.models

import jakarta.persistence.*
import org.hibernate.annotations.ColumnDefault

@Entity
@Table(name = "produit_retour")
class ProduitRetour {
   @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY) // Use IDENTITY for auto-increment
  @Column(name = "id", nullable = false)
  var id: Int? = null

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "retour_produit_id")
  var retourProduit: com.example.backend.models.RetourProduit? = null

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "concerner_id")
  var concerner: Concerner? = null

  @Column(name = "quantite")
  var quantite: Int? = null

  @ColumnDefault("0")
  @Column(name = "supprimer")
  var supprimer: Int? = null
}
