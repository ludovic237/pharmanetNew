package com.example.backend.models

import jakarta.persistence.*
import org.hibernate.annotations.ColumnDefault

@Entity
@Table(name = "unite")
class Unite {
@Id
  @GeneratedValue(strategy = GenerationType.IDENTITY) // Use IDENTITY for auto-increment
  @Column(name = "id", nullable = false)
  var id: Int? = null

  @Column(name = "nom", length = 16)
  var nom: String? = null

  @Column(name = "libelle", length = 32)
  var libelle: String? = null

  @ColumnDefault("0")
  @Column(name = "supprimer", nullable = false)
  var supprimer: Int? = null
}
