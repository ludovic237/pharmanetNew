package com.example.backend.models

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import org.hibernate.annotations.ColumnDefault

@Entity
@Table(name = "produit_detail")
class ProduitDetail {
  @Id
  @Column(name = "id", nullable = false)
  var id: Int? = null

  @Column(name = "reference", length = 32)
  var reference: String? = null

  @Column(name = "nom", nullable = false, length = 50)
  var nom: String? = null

  @Column(name = "stock", nullable = false)
  var stock: Int? = null

  @Column(name = "stockMax", nullable = false)
  var stockMax: Int? = null

  @Column(name = "stockMin", nullable = false)
  var stockMin: Int? = null

  @ColumnDefault("0")
  @Column(name = "reductionMax", nullable = false)
  var reductionMax: Int? = null

  @Column(name = "prix", nullable = false)
  var prix: Int? = null

  @Column(name = "grossiste_list", nullable = false, length = 100)
  var grossisteList: String? = null

  @ColumnDefault("0")
  @Column(name = "supprimer", nullable = false)
  var  supprimer: Int? = 0
}
