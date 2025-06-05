package com.example.backend.models

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import org.hibernate.annotations.ColumnDefault

@Entity
@Table(name = "categorie")
class Categorie {
  @Id
  @Column(name = "id", nullable = false)
  var id: Int? = null

  @Column(name = "nom", nullable = false, length = 32)
  var nom: String? = null

  @ColumnDefault("0")
  @Column(name = "supprimer", nullable = false)
  var supprimer: Int? = null
}
