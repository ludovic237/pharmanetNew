package com.example.backend.models

import jakarta.persistence.*
import org.hibernate.annotations.ColumnDefault
import java.time.LocalDateTime

@Entity
@Table(name = "produit_inventaire")
class ProduitInventaire {
  @Id
  @Column(name = "id", nullable = false)
  var id: Int? = null

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "inventaire_id")
  var inventaire: Inventaire? = null

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "employe_id")
  var employe: Employe? = null

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "en_rayon_id")
  var enRayon: EnRayon? = null

  @Column(name = "stockAvant")
  var stockAvant: Int? = null

  @Column(name = "stockValide")
  var stockValide: Int? = null

  @Column(name = "date_debut")
  var dateDebut: LocalDateTime? = null

  @Column(name = "date_fin")
  var dateFin: LocalDateTime? = null

  @Column(name = "type", length = 100)
  var type: String? = null

  @Column(name = "statut", length = 100)
  var statut: String? = null

  @ColumnDefault("0")
  @Column(name = "supprimer", nullable = false)
  var supprimer: Int? = null
}
