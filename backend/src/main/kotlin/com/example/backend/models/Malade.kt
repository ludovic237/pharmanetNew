package com.example.backend.models

import jakarta.persistence.*
import org.hibernate.annotations.ColumnDefault

@Entity
@Table(name = "malade")
class Malade {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY) // Use IDENTITY for auto-increment
  @Column(name = "id", nullable = false)
  var id: Int? = null

  @Column(name = "nom", length = 32)
  var nom: String? = null

  @Column(name = "telephone", nullable = false, length = 32)
  var telephone: String? = null

  @Column(name = "modeReglement", nullable = false, length = 32)
  var modeReglement: String? = null

  @Column(name = "poid", nullable = false)
  var poid: Double? = 0.0

  @Column(name = "taille", nullable = false)
  var taille: Double? = 0.0

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "CodePostal_id")
  var codePostal: CodePostal? = null

  @Column(name = "reduction", nullable = false, length = 32)
  var reduction: String? = null

  @ColumnDefault("0")
  @Column(name = "supprimer", nullable = false)
  var  supprimer: Int? = 0
}
