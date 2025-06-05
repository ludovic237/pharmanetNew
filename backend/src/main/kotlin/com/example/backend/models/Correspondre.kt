package com.example.backend.models

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Table

@Entity
@Table(name = "correspondre")
class Correspondre {
  @Column(name = "ID_VENTE", nullable = false)
  var idVente: Int? = null

  @Column(name = "ID_FAC", nullable = false)
  var idFac: Int? = null
}
