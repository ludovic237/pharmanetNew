package com.example.backend.models

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import org.hibernate.annotations.ColumnDefault
import java.time.LocalDateTime

@Entity
@Table(name = "ligne_commande")
class LigneCommande {
  @Id
  @Column(name = "id", nullable = false)
  var id: Int? = null

  @Column(name = "type", length = 50)
  var type: String? = null

  @Column(name = "dateDerniere")
  var dateDerniere: LocalDateTime? = null

  @ColumnDefault("0")
  @Column(name = "supprimer", nullable = false)
  var supprimer: Int? = null
}
