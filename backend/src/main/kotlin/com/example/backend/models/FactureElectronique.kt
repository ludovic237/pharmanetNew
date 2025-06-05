package com.example.backend.models

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import org.hibernate.annotations.ColumnDefault

@Entity
@Table(name = "facture_electronique")
class FactureElectronique {
  @Id
  @Column(name = "id", nullable = false)
  var id: Int? = null

  @Column(name = "facturation_id")
  var facturationId: Long? = null

  @Column(name = "numeroTelephone", length = 15)
  var numeroTelephone: String? = null

  @Column(name = "montant")
  var montant: Int? = null

  @ColumnDefault("0")
  @Column(name = "supprimer")
  var supprimer: Int? = null
}
