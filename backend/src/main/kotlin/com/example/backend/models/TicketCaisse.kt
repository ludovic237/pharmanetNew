package com.example.backend.models

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import org.hibernate.annotations.ColumnDefault
import java.time.LocalDate

@Entity
@Table(name = "ticket_caisse")
class TicketCaisse {
  @Id
  @Column(name = "id", nullable = false)
  var id: Int? = null

  @Column(name = "codebarre")
  var codebarre: Int? = null

  @Column(name = "montant")
  var montant: Int? = null

  @Column(name = "dateGenere")
  var dateGenere: LocalDate? = null

  @Column(name = "statut", length = 15)
  var statut: String? = null

  @Column(name = "validite")
  var validite: Int? = null

  @ColumnDefault("0")
  @Column(name = "supprimer")
  var  supprimer: Int? = 0
}
