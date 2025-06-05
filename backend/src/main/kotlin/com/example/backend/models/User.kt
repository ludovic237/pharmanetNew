package com.example.backend.models

import jakarta.persistence.*
import org.hibernate.annotations.ColumnDefault
import java.time.Instant
import java.time.LocalDateTime

@Entity
@Table(name = "user")
class User {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id", nullable = false)
  var id: Int? = null

  @Column(name = "nom", length = 100)
  var nom: String? = null

  @Column(name = "prenom", length = 100)
  var prenom: String? = null

  @Column(name = "email", length = 150)
  var email: String? = null

  @Column(name = "password", nullable = false)
  var password: String? = null

  @Column(name = "fonction", length = 64)
  var fonction: String? = null

  @Column(name = "telephone", length = 32)
  var telephone: String? = null

  @Column(name = "reduction")
  var reduction: Int? = null

  @Column(name = "reductionMax")
  var reductionMax: Int? = null

  @Lob
  @Column(name = "role", nullable = false)
  var role: String? = null

  @Column(name = "birthday")
  var birthday: LocalDateTime? = null

  @Lob
  @Column(name = "gender")
  var gender: String? = null

  @Column(name = "image")
  var image: String? = null

  @ColumnDefault("1")
  @Column(name = "is_active", nullable = false)
  var isActive: Boolean? = false

  @ColumnDefault("0")
  @Column(name = "is_deleted", nullable = false)
  var isDeleted: Boolean? = false

  @Column(name = "registration_date", nullable = false)
  var registrationDate: LocalDateTime? = null

  @Column(name = "joined_date")
  var joinedDate: LocalDateTime? = null

  @Column(name = "created_date")
  var createdDate: LocalDateTime? = null

  @Column(name = "updated_date")
  var updatedDate: LocalDateTime? = null

  @Column(name = "username", nullable = false)
  var username: String? = null

  @ColumnDefault("0")
  @Column(name = "supprimer", nullable = false)
  var supprimer: Int? = null
}
