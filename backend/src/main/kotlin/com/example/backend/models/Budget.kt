package com.example.backend.models

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table

@Entity
@Table(name = "budget")
class Budget {
  @Id
  @Column(name = "id", nullable = false)
  var id: Int? = null

  @Column(name = "nom", nullable = false, length = 32)
  var nom: String? = null

  @Column(name = "prenom", nullable = false, length = 32)
  var prenom: String? = null

  @Column(name = "montant", nullable = false)
  var montant: Int? = null
}
