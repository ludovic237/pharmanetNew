package com.example.backend.models

import jakarta.persistence.*
import org.hibernate.annotations.ColumnDefault
import java.time.Instant
import java.time.LocalDateTime

@Entity
@Table(name = "vente")
class Vente {
@Id
  @GeneratedValue(strategy = GenerationType.IDENTITY) // Use IDENTITY for auto-increment
  @Column(name = "id", nullable = false)
  var id: Long? = null

  @Column(name = "prix_total")
  var prixTotal: Double? = null

  @Column(name = "prix_percu")
  var prixPercu: Double? = null

  @Column(name = "date_vente")
  var dateVente: LocalDateTime? = null

  @Column(name = "date_encaissement")
  var dateEncaissement: LocalDateTime? = null

  @Column(name = "commentaire")
  var commentaire: String? = null

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "malade_id")
  var malade: Malade? = null

  @ColumnDefault("'EN_COURS'")
  @Column(name = "etat", length = 16)
  var etat: String? = null

  @Column(name = "reference", length = 16)
  var reference: String? = null

  @Column(name = "nouveau_info", length = 16)
  var nouveauInfo: String? = null

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id")
  var user: User? = null

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "prescripteur_id")
  var prescripteur: Prescripteur? = null

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "employe_id")
  var employe: Employe? = null

  @Column(name = "reduction", length = 32)
  var reduction: String? = null

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "caisse_id")
  var caisse: Caisse? = null

  @ColumnDefault("0")
  @Column(name = "supprimer")
  var supprimer: Int? = null
}
