package com.example.backend.models

import jakarta.persistence.*

@Entity
@Table(name = "code_postal")
class CodePostal {
  @Id
  @Column(name = "id", nullable = false)
  var id: Int? = null

  @Column(name = "code", length = 16)
  var code: String? = null

  @Column(name = "nom", nullable = false, length = 32)
  var nom: String? = null

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "Ville_id")
  var ville: com.example.backend.models.Ville? = null
}
