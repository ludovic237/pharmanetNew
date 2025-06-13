package com.example.backend.models

import jakarta.persistence.*
import org.hibernate.annotations.ColumnDefault

@Entity
@Table(name = "fournisseur")
class Fournisseur {
@Id
  @GeneratedValue(strategy = GenerationType.IDENTITY) // Use IDENTITY for auto-increment
  @Column(name = "id", nullable = false)
  var id: Int? = null

  @Column(name = "code", length = 16)
  var code: String? = null

  @Column(name = "nom", length = 32)
  var nom: String? = null

  @Column(name = "statut", length = 32)
  var statut: String? = null

  @Column(name = "codepostal", length = 20)
  var codepostal: String? = null

  @Column(name = "adresse", length = 32)
  var adresse: String? = null

  @Column(name = "telephone", length = 32)
  var telephone: String? = null

  @Column(name = "email", length = 32)
  var email: String? = null

  @ColumnDefault("0")
  @Column(name = "supprimer")
  var supprimer: Int? = null
}
