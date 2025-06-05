package com.example.backend.models

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Table

@Entity
@Table(name = "gerer")
class Gerer {
  @Column(name = "ID_UTI", nullable = false)
  var idUti: Long? = null

  @Column(name = "ID_PRODUIT", nullable = false)
  var idProduit: Long? = null
}
