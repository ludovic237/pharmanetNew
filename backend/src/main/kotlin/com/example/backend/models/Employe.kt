package com.example.backend.models

import jakarta.persistence.*
import org.hibernate.annotations.ColumnDefault

@Entity
@Table(name = "employe")
class Employe {
  @Id
  @Column(name = "id", nullable = false)
  var id: Int? = null

  @Column(name = "identifiant", length = 100)
  var identifiant: String? = null

  @Column(name = "password", length = 50)
  var password: String? = null

  @Column(name = "codebarre_id")
  var codebarreId: String? = null

  @Column(name = "type", length = 100)
  var type: String? = null

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false)
  var user: User? = null

  @Column(name = "etat", length = 20)
  var etat: String? = null

  @Column(name = "faireReductionMax")
  var faireReductionMax: Int? = null
//  @Column(name = "faire_reduction_max")
//  var faireReductionMax: Int? = null

  @ColumnDefault("0")
  @Column(name = "supprimer")
  var  supprimer: Int? = 0
}
