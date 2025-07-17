package com.example.backend.models

import jakarta.persistence.*
import org.hibernate.annotations.ColumnDefault

@Entity
@Table(name = "user")
class User {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY) // Use IDENTITY for auto-increment
  @Column(name = "id", nullable = false)
  var id: Int? = null

  @Column(name = "nom", length = 32)
  var nom: String? = null

  @Column(name = "prenom", length = 32)
  var prenom: String? = null

  @Column(name = "email", length = 64)
  var email: String? = null

  @Column(name = "password", nullable = false)
  var password: String? = null

  @Column(name = "username", nullable = false)
  var username: String? = null

  @Column(name = "fonction", length = 64)
  var fonction: String? = null

  @Column(name = "role", length = 64)
  var role: String? = null

  @Column(name = "telephone", length = 32)
  var telephone: String? = null

  @Column(name = "reduction")
  var reduction: Int? = null

  @Column(name = "reduction_max")
  var reductionMax: Int? = null

  @ColumnDefault("0")
  @Column(name = "supprimer", nullable = false)
  var  supprimer: Int? = 0
}
