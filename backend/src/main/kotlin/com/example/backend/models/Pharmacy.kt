package com.example.backend.models

import jakarta.persistence.*

@Entity
@Table(name = "pharmacy")
class Pharmacy {
  @Id
  @Column(name = "id", nullable = false)
  var id: Int? = null

  @Column(name = "nom", length = 64)
  var nom: String? = null

  @Column(name = "telephone", nullable = false, length = 128)
  var telephone: String? = null

  @Column(name = "adresse", nullable = false, length = 128)
  var adresse: String? = null

  @Column(name = "logo", nullable = false, length = 64)
  var logo: String? = null

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "CodePostal_id")
  var codePostal: CodePostal? = null

  @Column(name = "slogan", nullable = false, length = 128)
  var slogan: String? = null

  @Column(name = "docteur", nullable = false, length = 128)
  var docteur: String? = null

  @Column(name = "contribuable", nullable = false, length = 128)
  var contribuable: String? = null
}
