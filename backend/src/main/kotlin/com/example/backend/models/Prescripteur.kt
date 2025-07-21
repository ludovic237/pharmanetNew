package com.example.backend.models

import jakarta.persistence.*
import org.hibernate.annotations.ColumnDefault

@Entity
@Table(name = "prescripteur")
class Prescripteur {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY) // Use IDENTITY for auto-increment
  @Column(name = "id", nullable = false)
  var id: Int? = null

  @Column(name = "nom")
  var nom: String? = null

  @Column(name = "structure")
  var structure: String? = null

  @Column(name = "adresse")
  var adresse: String? = null

  @Column(name = "telephone")
  var telephone: String? = null

  @ColumnDefault("0")
  @Column(name = "supprimer")
  var supprimer: Int? = 0
}
