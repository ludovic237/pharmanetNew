package com.example.backend.models

import jakarta.persistence.*
import org.hibernate.annotations.ColumnDefault
import java.time.Instant

@Entity
@Table(name = "bon_caisse")
class BonCaisse {
  @Id
  @Column(name = "id", nullable = false)
  var id: Int? = null

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "caisse_id")
  var caisse: com.example.backend.models.Caisse? = null

  @Column(name = "caisse_id_encaisser")
  var caisseIdEncaisser: Int? = null

  @Column(name = "nom_client", length = 100)
  var nomClient: String? = null

  @Column(name = "codebarre_id", length = 50)
  var codebarreId: String? = null

  @Column(name = "montant")
  var montant: Int? = null

  @Column(name = "dateGenerer")
  var dateGenerer: Instant? = null

  @Column(name = "dateEncaisser")
  var dateEncaisser: Instant? = null

  @Column(name = "type", length = 50)
  var type: String? = null

  @ColumnDefault("0")
  @Column(name = "supprimer")
  var supprimer: Int? = null
}
