package com.example.backend.models

import jakarta.persistence.*
import org.hibernate.annotations.ColumnDefault
import java.time.Instant

@Entity
@Table(name = "retour_produit")
class RetourProduit {
  @Id
  @Column(name = "id", nullable = false)
  var id: Int? = null

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "vente_id")
  var vente: com.example.backend.models.Vente? = null

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "employe_id")
  var employe: Employe? = null

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "caisse_id")
  var caisse: Caisse? = null

  @Column(name = "dateRetour")
  var dateRetour: Instant? = null

  @ColumnDefault("0")
  @Column(name = "supprimer")
  var supprimer: Int? = null
}
