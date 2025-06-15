package com.example.backend.models

import jakarta.persistence.*
import org.hibernate.annotations.ColumnDefault
import java.time.Instant
import java.time.LocalDate
import java.time.LocalDateTime

@Entity
@Table(name = "depense")
class Depense {
@Id
  @GeneratedValue(strategy = GenerationType.IDENTITY) // Use IDENTITY for auto-increment
  @Column(name = "id", nullable = false)
  var id: Int? = null

  @Column(name = "caisse_id", length = 10)
  var caisseId: String? = null

  @Column(name = "designation")
  var designation: String? = null

  @Column(name = "quantite")
  var quantite: Int? = null

  @Column(name = "prix_unitaire")
  var prixUnitaire: Int? = null

  @Column(name = "date_epense")
  var dateEpense: LocalDateTime? = null

  @Column(name = "beneficiaire", length = 100)
  var beneficiaire: String? = null

  @Column(name = "numero_cni", length = 100)
  var numeroCni: String? = null

  @Column(name = "date_delivrance")
  var dateDelivrance: LocalDate? = null

  @Column(name = "lieu_delivrance", length = 100)
  var lieuDelivrance: String? = null

  @Column(name = "societe", length = 100)
  var societe: String? = null

  @Column(name = "type_depense")
  var typeDepense: Int? = null

  @ColumnDefault("0")
  @Column(name = "supprimer")
  var supprimer: Int? = 0
}
