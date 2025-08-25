package com.example.backend.models

import jakarta.persistence.*
import org.hibernate.annotations.ColumnDefault

@Entity
@Table(name = "magasin")
class Magasin {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY) // Use IDENTITY for auto-increment
  @Column(name = "id", nullable = false)
  var id: Int? = null

  @Column(name = "code", nullable = true, length = 16)
  var code: String? = null

  @Column(name = "nom", nullable = false, length = 32)
  var nom: String? = null

  @ColumnDefault("0")
  @Column(name = "supprimer", nullable = false)
  var  supprimer: Int? = 0
}
