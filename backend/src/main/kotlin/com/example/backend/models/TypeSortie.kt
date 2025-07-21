package com.example.backend.models

import jakarta.persistence.*
import org.hibernate.annotations.ColumnDefault

@Entity
@Table(name = "type_sortie")
class TypeSortie {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY) // Use IDENTITY for auto-increment
  @Column(name = "id", nullable = false)
  var id: Int? = null

  @Column(name = "nom", length = 100)
  var nom: String? = null

  @Column(name = "description")
  var description: String? = null

  @ColumnDefault("0")
  @Column(name = "supprimer")
  var  supprimer: Int? = 0
}
