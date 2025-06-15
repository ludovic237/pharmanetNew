package com.example.backend.models

import jakarta.persistence.*
import org.hibernate.annotations.ColumnDefault
import java.time.LocalDate

@Entity
@Table(name = "ticket_caisse")
class TicketCaisse {
@Id
  @GeneratedValue(strategy = GenerationType.IDENTITY) // Use IDENTITY for auto-increment
  @Column(name = "id", nullable = false)
  var id: Int? = null

  @Column(name = "codebarre")
  var codebarre: Int? = null

  @Column(name = "montant")
  var montant: Int? = null

  @Column(name = "date_genere")
  var dateGenere: LocalDate? = null

  @Column(name = "statut", length = 15)
  var statut: String? = null

  @Column(name = "validite")
  var validite: Int? = null

  @ColumnDefault("0")
  @Column(name = "supprimer")
  var supprimer: Int? = 0
}
