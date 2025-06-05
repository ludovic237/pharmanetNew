package com.example.backend.models

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import org.hibernate.annotations.ColumnDefault
import java.time.LocalDate

@Entity
@Table(name = "depense")
class Depense {
  @Id
  @Column(name = "id", nullable = false)
  var id: Int? = null

  @Column(name = "caisse_id", length = 10)
  var caisseId: String? = null

  @Column(name = "designation")
  var designation: String? = null

  @Column(name = "quantite")
  var quantite: Int? = null

  @Column(name = "prixUnitaire")
  var prixUnitaire: Int? = null

  @Column(name = "dateDepense")
  var dateDepense: LocalDate? = null

  @Column(name = "beneficiaire", length = 100)
  var beneficiaire: String? = null

  @Column(name = "numeroCni", length = 100)
  var numeroCni: String? = null

  @Column(name = "dateDelivrance")
  var dateDelivrance: LocalDate? = null

  @Column(name = "lieuDelivrance", length = 100)
  var lieuDelivrance: String? = null

  @Column(name = "societe", length = 100)
  var societe: String? = null

  @Column(name = "typeDepense")
  var typeDepense: Int? = null

  @ColumnDefault("0")
  @Column(name = "supprimer")
  var supprimer: Int? = null
}
