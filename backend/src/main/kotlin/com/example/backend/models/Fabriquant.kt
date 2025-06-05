package com.example.backend.models

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import org.hibernate.annotations.ColumnDefault

@Entity
@Table(name = "fabriquant")
class Fabriquant {
  @Id
  @Column(name = "id", nullable = false)
  var id: Int? = null

  @Column(name = "code", length = 16)
  var code: String? = null

  @Column(name = "nom", length = 32)
  var nom: String? = null

  @Column(name = "adresse", length = 32)
  var adresse: String? = null

  @Column(name = "telephone", length = 32)
  var telephone: String? = null

  @Column(name = "email", length = 32)
  var email: String? = null

  @Column(name = "codepostal", length = 20)
  var codepostal: String? = null

  @ColumnDefault("0")
  @Column(name = "supprimer")
  var supprimer: Int? = null
}
