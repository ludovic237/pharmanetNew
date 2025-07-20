package com.example.backend.models

import jakarta.persistence.*
import org.hibernate.annotations.ColumnDefault
import java.time.Instant
import java.time.LocalDateTime

@Entity
@Table(name = "inventaire")
class Inventaire {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id", nullable = false)
  var id: Int? = null

  @Column(name = "etat", length = 15)
  var etat: String? = null

  @ColumnDefault("0")
  @Column(name = "supprimer")
  var supprimer: Int? = null

  @Column(name = "date_debut")
  var dateDebut: LocalDateTime? = null

  @Column(name = "date_fin")
  var dateFin: LocalDateTime? = null

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "employe_id")
  var employe: Employe? = null

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "rayon_id")
  var rayon: Rayon? = null

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "categorie_id")
  var categorie: Categorie? = null

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "fabriquant_id")
  var fabriquant: Fabriquant? = null

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "forme_id")
  var forme: Forme? = null

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "fournisseur_id")
  var fournisseur: Fournisseur? = null

  @Column(name = "commentaire")
  var commentaire: String? = null

  companion object {
    const val INVENTAIRE_EN_COURS = "EN_COURS"
    const val INVENTAIRE_CLOTURER = "CLOTURER"
    const val INVENTAIRE_TERMINER = "TERMINER"
  }
}
