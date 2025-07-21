package com.example.backend.models

import jakarta.persistence.*
import org.hibernate.annotations.ColumnDefault
import java.time.Instant
import java.time.LocalDateTime

@Entity
@Table(name = "vente")
class Vente {
  @Id
  @Column(name = "id", nullable = false)
  var id: Long? = null

  @Column(name = "prixTotal")
  var prixTotal: Double? = 0.0

  @Column(name = "prixPercu")
  var prixPercu: Double? = 0.0

  @Column(name = "dateVente")
  var dateVente: LocalDateTime? = null

  @Column(name = "dateEncaissement")
  var dateEncaissement: LocalDateTime? = null

  @Column(name = "commentaire")
  var commentaire: String? = null

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "malade_id")
  var malade: Malade? = null

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
  var  supprimer: Int? = 0

  companion object {
    const val VENTE_COMPTANT = "COMPTANT"
    const val VENTE_ASSURANCE = "ASSURANCE"
    const val VENTE_CREDIT = "CREDIT"

    const val VENTE_TYPE_PAIEMENT_ELECTRONIQUE = "ELECTRONIQUE"
    const val VENTE_TYPE_PAIEMENT_ESPECE = "ESPECE"
    const val VENTE_TYPE_PAIEMENT_TICKET = "TICKET"
    const val VENTE_TYPE_PAIEMENT_MIXTE = "MIXTE"
  }
}
