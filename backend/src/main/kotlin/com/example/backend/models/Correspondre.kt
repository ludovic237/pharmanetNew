package com.example.backend.models

import jakarta.persistence.*

@Entity
@Table(name = "correspondre")
class Correspondre {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY) // Use IDENTITY for auto-increment
  @Column(name = "ID_VENTE", nullable = false)
  var idVente: Int? = null

  @Column(name = "ID_FAC", nullable = false)
  var idFac: Int? = null
}
