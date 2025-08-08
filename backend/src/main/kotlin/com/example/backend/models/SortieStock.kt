package com.example.backend.models

import jakarta.persistence.*
import org.hibernate.annotations.ColumnDefault
import java.time.Instant
import java.time.LocalDateTime

@Entity
@Table(name = "sortie_stock")
class SortieStock {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY) // Use IDENTITY for auto-increment
  @Column(name = "id", nullable = false)
  var id: Int? = null

  @ManyToOne(fetch = FetchType.EAGER)
  @JoinColumn(name = "en_rayon_id")
  var enRayon: EnRayon? = null

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "type_sortie_id")
  var typeSortie: com.example.backend.models.TypeSortie? = null

  @Column(name = "quantite")
  var quantite: Int? = null

  @Column(name = "dateSortie")
  var dateSortie: LocalDateTime? = null

  @Column(name = "detail_id", length = 20)
  var detailId: String? = null

  @ColumnDefault("0")
  @Column(name = "supprimer")
  var  supprimer: Int? = 0
}
