package com.example.backend.models

import jakarta.persistence.*
import org.hibernate.annotations.ColumnDefault
import java.time.Instant
import java.time.LocalDateTime

@Entity
@Table(name = "ligne_commande")
class LigneCommande {
@Id
  @GeneratedValue(strategy = GenerationType.IDENTITY) // Use IDENTITY for auto-increment
  @Column(name = "id", nullable = false)
  var id: Int? = null

  @Column(name = "type", length = 50)
  var type: String? = null

  @Column(name = "date_derniere")
  var dateDerniere: LocalDateTime? = null

  @ColumnDefault("0")
  @Column(name = "supprimer", nullable = false)
  var supprimer: Int? = null
}
