package com.example.backend.models

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import org.hibernate.annotations.ColumnDefault

@Entity
@Table(name = "type_sortie")
class TypeSortie {
  @Id
  @Column(name = "id", nullable = false)
  var id: Int? = null

  @Column(name = "nom", length = 100)
  var nom: String? = null

  @Column(name = "description")
  var description: String? = null

  @ColumnDefault("0")
  @Column(name = "supprimer")
  var supprimer: Int? = null
}
