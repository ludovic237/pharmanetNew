package com.example.backend.models

import jakarta.persistence.*
import org.hibernate.annotations.ColumnDefault

@Entity
@Table(name = "produit")
class Produit {
  @Id
  @Column(name = "id", nullable = false)
  var id: Int? = null

  @Column(name = "ean13", length = 16)
  var ean13: String? = null

  @Column(name = "code_laborex", length = 32)
  var codeLaborex: String? = null

  @Column(name = "code_ubipharm", length = 32)
  var codeUbipharm: String? = null

  @Column(name = "reference", length = 32)
  var reference: String? = null

  @Column(name = "nom", length = 50)
  var nom: String? = null

  @Column(name = "stock")
  var stock: Int? = null

  @Column(name = "stock_max")
  var stockMax: Int? = null

  @Column(name = "stock_min")
  var stockMin: Int? = null

  @Column(name = "contenu_detail", length = 10)
  var contenuDetail: String? = null

  @Column(name = "prix_detail", length = 10)
  var prixDetail: String? = null

  @ColumnDefault("'Utile'")
  @Column(name = "etat", length = 10)
  var etat: String? = null

  @ColumnDefault("0")
  @Column(name = "reduction_max")
  var reductionMax: Int? = 0

  @Column(name = "grossiste_id", length = 100)
  var grossisteId: String? = null

  @Column(name = "detail_id")
  var detailId: Int? = null

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "categorie_id")
  var categorie: Categorie? = null

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "forme_id")
  var forme: Forme? = null

  @ManyToOne(fetch = FetchType.EAGER)
  @JoinColumn(name = "fabriquant_id", nullable = true)
  var fabriquant: Fabriquant? = null

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "rayon_id")
  var rayon: com.example.backend.models.Rayon? = null

  @Column(name = "etagere", length = 15)
  var etagere: String? = null

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "magasin_id")
  var magasin: Magasin? = null

  @ColumnDefault("0")
  @Column(name = "supprimer")
  var  supprimer: Int? = 0
}
