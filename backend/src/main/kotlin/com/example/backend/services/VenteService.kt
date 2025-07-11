package com.example.backend.services

import com.example.backend.dtos.EncaissementDto
import com.example.backend.dtos.EncaissementRequestDto
import com.example.backend.dtos.VenteRequestDto
import com.example.backend.models.*
import com.example.backend.repositories.*
import com.example.backend.utility.UserUtils
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.text.Normalizer
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import java.util.*

@Service
class VenteService(
  private val enRayonRepository: EnRayonRepository,
  private val caisseService: CaisseService,
  private val concernerRepository: ConcernerRepository,
  private val prescripteurRepository: PrescripteurRepository,
  private val bonCaisseRepository: BonCaisseRepository,
  private val userRepository: UserRepository,
  private val venteRepository: VenteRepository,
  private val caisseRepository: CaisseRepository,
  private val produitRepository: ProduitRepository,
  private val facturationRepository: FacturationRepository,
  private val factureEspeceRepository: FactureEspeceRepository,
  private val factureElectroniqueRepository: FactureElectroniqueRepository,
  private val factureTicketRepository: FactureTicketRepository,
  private val employeRepository: EmployeRepository,
  private val userUtils: UserUtils,
  private val rayonRepository: RayonRepository,
  private val produitDetailRepository: ProduitDetailRepository
) {

  @Transactional
  fun creerVenteSansEncaissement(venteRequestDto: VenteRequestDto): Vente {
    val currentUser = userUtils.getCurrentUser()
      ?: throw RuntimeException("Impossible de récupérer l'utilisateur connecté.")

    val employe = employeRepository.findByUser(currentUser)
      ?: throw RuntimeException("Employé introuvable pour l'utilisateur connecté.")

    if (venteRequestDto.etat !in listOf("COMPTANT", "ASSURANCE", "CREDIT")) {
      throw RuntimeException("État de la vente invalide: ${venteRequestDto.etat}")
    }


    // Handle client
    val client = when (venteRequestDto.clientInfo.type) {
      "existing" -> userRepository.findById(venteRequestDto.clientInfo.id!!.toLong())
        .orElseThrow { RuntimeException("Client introuvable avec l'ID: ${venteRequestDto.clientInfo.id}") }

      "new" -> User().apply {
        this.nom = venteRequestDto.clientInfo.name
          ?: throw RuntimeException("Nom du client requis pour un nouveau client")
        this.telephone = venteRequestDto.clientInfo.phone
          ?: throw RuntimeException("Téléphone du client requis pour un nouveau client")
      }.also { userRepository.save(it) }

      "none" -> null
      else -> throw RuntimeException("Type de client invalide: ${venteRequestDto.clientInfo.type}")
    }

    // Handle prescriber
    val prescripteur = when (venteRequestDto.prescripteurInfo.type) {
      "existing" -> prescripteurRepository.findById(venteRequestDto.prescripteurInfo.id!!)
        .orElseThrow { RuntimeException("Prescripteur introuvable avec l'ID: ${venteRequestDto.prescripteurInfo.id}") }

      "new" -> Prescripteur().apply {
        this.nom = venteRequestDto.prescripteurInfo.name
          ?: throw RuntimeException("Nom du prescripteur requis pour un nouveau prescripteur")
      }.also { prescripteurRepository.save(it) }

      "none" -> null
      else -> throw RuntimeException("Type de prescripteur invalide: ${venteRequestDto.prescripteurInfo.type}")
    }
    val dateTimeNow = LocalDateTime.now()
    val formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss")
    val formattedDateTimeNow = dateTimeNow.format(formatter)
    // Create the sale
    val nouvelleVente = Vente().apply {
      this.id = "${formattedDateTimeNow}".toLong()
      this.employe = employe
      this.reference = genererReference(venteRepository.countMois().toInt())
      this.dateVente = LocalDateTime.now()
      this.etat = venteRequestDto.etat
      this.prixTotal = venteRequestDto.prixTotal
      this.commentaire = venteRequestDto.commentaire
      this.user = client
      this.prescripteur = prescripteur
      this.supprimer = 0
    }
    val savedVente = venteRepository.save(nouvelleVente)

    venteRequestDto.produits.forEach { produitAssocieDto ->
      if (produitAssocieDto.type?.toLowerCase() == "detail".toLowerCase()) {
        var produitDetail = produitDetailRepository.findById(produitAssocieDto.produitId!!.toInt()).get()
        produitDetail.stock = produitDetail.stock!! - produitAssocieDto.quantite!!
        produitDetailRepository.save(produitDetail)

        val concerner = Concerner().apply {
          this.vente = savedVente
          this.produitDetail = produitDetail
          this.quantite = produitAssocieDto.quantite
          this.prixUnit = produitAssocieDto.prixUnit
          this.type = produitAssocieDto.type
          this.reduction = produitAssocieDto.reduction
        }
        concernerRepository.save(concerner)
      } else {
        val rayon = enRayonRepository.findById(produitAssocieDto.rayonId!!.toInt()).get()
        rayon.quantiteRestante = rayon.quantiteRestante!! - produitAssocieDto.quantite!!
        enRayonRepository.save(rayon)

        val produit = produitRepository.findById(rayon.produit!!.id!!)
          .orElseThrow { RuntimeException("Produit introuvable avec l'ID: ${produitAssocieDto.produitId}") }
        produit.stock = produit.stock!! - produitAssocieDto.quantite!!
        produitRepository.save(produit)

        val concerner = Concerner().apply {
          this.vente = savedVente
          this.produit = produit
          this.enRayon = rayon
          this.quantite = produitAssocieDto.quantite
          this.prixUnit = produitAssocieDto.prixUnit
          this.type = produitAssocieDto.type
          this.reduction = produitAssocieDto.reduction
        }
        concernerRepository.save(concerner)
      }

    }

    return savedVente
  }

  @Transactional
  fun encaisserVente(venteId: Long, encaissementRequestDto: EncaissementRequestDto): Facturation {
    val vente = venteRepository.findById(venteId)
      .orElseThrow { RuntimeException("Vente introuvable avec l'ID: $venteId") }

    if (vente.etat != "EN_COURS") {
      throw RuntimeException("La vente doit être en cours pour être encaissée.")
    }

    val currentUser = userUtils.getCurrentUser()
    val employe = employeRepository.findByUser(currentUser!!)
    val caisse = caisseRepository.findByEmployeAndEtatAndSupprimer(employe, Caisse.ETAT_OUVERT)
      ?: throw RuntimeException("Aucune caisse ouverte trouvée pour l'utilisateur connecté.")

    val facturation = Facturation().apply {
      this.vente = vente
      this.caisse = caisse
      this.typePaiement = encaissementRequestDto.typePaiement
      this.montantPercu = encaissementRequestDto.montantPercu
      this.reste = encaissementRequestDto.reste
      this.montantTtc = encaissementRequestDto.montantTtc
      this.dateFacture = LocalDateTime.now()
      this.supprimer = 0
    }

    when (encaissementRequestDto.typePaiement.toLowerCase()) {
      Vente.VENTE_TYPE_PAIEMENT_ESPECE.toLowerCase() -> {
        encaissementRequestDto.espece?.let { montantEspece ->
          val factureEspece = FactureEspece().apply {
            this.facturationId = facturation!!.id?.toLong()
            this.montant = montantEspece
          }
          factureEspeceRepository.save(factureEspece)
        }
      }

      Vente.VENTE_TYPE_PAIEMENT_ELECTRONIQUE.toLowerCase() -> {
        encaissementRequestDto.electronique?.let { electronique ->
          val factureElectronique = FactureElectronique().apply {
            this.facturationId = facturation!!.id?.toLong()
            this.numeroTelephone = electronique.numeroTelephone
            this.montant = electronique.montant
          }
          factureElectroniqueRepository.save(factureElectronique)
        }
      }

      Vente.VENTE_TYPE_PAIEMENT_TICKET.toLowerCase() -> {
        encaissementRequestDto.ticket?.let { montantTicket ->
          val factureTicket = FactureTicket().apply {
            this.facturationId = facturation!!.id?.toLong()
            this.montant = montantTicket
          }
          factureTicketRepository.save(factureTicket)
        }
      }

      Vente.VENTE_TYPE_PAIEMENT_MIXTE.toLowerCase() -> {
        encaissementRequestDto.espece?.let { montantEspece ->
          val factureEspece = FactureEspece().apply {
            this.facturationId = facturation!!.id?.toLong()
            this.montant = montantEspece
          }
          factureEspeceRepository.save(factureEspece)
        }
        encaissementRequestDto.electronique?.let { electronique ->
          val factureElectronique = FactureElectronique().apply {
            this.facturationId = facturation!!.id?.toLong()
            this.numeroTelephone = electronique.numeroTelephone
            this.montant = electronique.montant
          }
          factureElectroniqueRepository.save(factureElectronique)
        }
        encaissementRequestDto.ticket?.let { montantTicket ->
          val factureTicket = FactureTicket().apply {
            this.facturationId = facturation!!.id?.toLong()
            this.montant = montantTicket
          }
          factureTicketRepository.save(factureTicket)
        }
      }

      else -> throw RuntimeException("Type de paiement non pris en charge: ${encaissementRequestDto.typePaiement}")
    }

    // Update sale status
//    vente.etat = "ENCAISSE"
    venteRepository.save(vente)

    return facturationRepository.save(facturation)
  }

  @Transactional
  fun encaisserVente(encaissementDto: EncaissementDto): Facturation {
    encaissementDto.typeEncaissement = convertToSimpleString(encaissementDto.typeEncaissement).lowercase()

    val vente = venteRepository.findById(encaissementDto.venteId).get()

    val currentUser = userUtils.getCurrentUser()
    val employe = employeRepository.findByUser(currentUser!!)
    val caisse = caisseRepository.findByEmployeAndEtatAndSupprimer(employe, Caisse.ETAT_OUVERT)
      ?: throw RuntimeException("Aucune caisse ouverte trouvée pour l'utilisateur connecté.")

    var facturation = Facturation().apply {
      this.vente = vente
      this.caisse = caisse
      this.typePaiement = encaissementDto.typeEncaissement
      this.montantPercu = encaissementDto.montantPercu
      this.reste = encaissementDto.montantRendu
      this.montantTtc = vente.prixTotal!!.toInt()
      this.dateFacture = LocalDateTime.now()
      this.supprimer = 0
    }
    facturation = facturationRepository.save(facturation)

    when (encaissementDto.typeEncaissement.toLowerCase()) {
      Vente.VENTE_TYPE_PAIEMENT_ESPECE.toLowerCase() -> {
        encaissementDto.espece?.let { montantEspece ->
          val factureEspece = FactureEspece().apply {
            this.facturationId = facturation!!.id?.toLong()
            this.montant = montantEspece
          }
          factureEspeceRepository.save(factureEspece)
        }
      }

      Vente.VENTE_TYPE_PAIEMENT_ELECTRONIQUE.toLowerCase() -> {
        encaissementDto.electronique?.let { electronique ->
          val factureElectronique = FactureElectronique().apply {
            this.facturationId = facturation!!.id?.toLong()
            this.numeroTelephone = electronique.numeroTelephone
            this.montant = electronique.montantElectronique
          }
          factureElectroniqueRepository.save(factureElectronique)
        }
      }

      Vente.VENTE_TYPE_PAIEMENT_TICKET.toLowerCase() -> {
        encaissementDto.ticket?.let { ticket ->
          val ticketCaisse = bonCaisseRepository.findByCodebarreId(ticket.numeroTicket)
          ticketCaisse!!.type = "Encaisser" // Transition to Encaisser
          ticketCaisse!!.dateEncaisser = LocalDateTime.now() // Set the encaisser date
          ticketCaisse!!.caisseIdEncaisser = caisseService.getActiveCaisse()!!.id
          bonCaisseRepository.save(ticketCaisse)

          val factureTicket = FactureTicket().apply {
            this.facturationId = facturation!!.id?.toLong()
            this.ticketCaisseId = ticketCaisse!!.id
            this.montant = ticket.montantTicket
          }
          factureTicketRepository.save(factureTicket)
        }
      }

      Vente.VENTE_TYPE_PAIEMENT_MIXTE.toLowerCase() -> {
        encaissementDto.espece?.let { montantEspece ->
          val factureEspece = FactureEspece().apply {
            this.facturationId = facturation!!.id?.toLong()
            this.montant = montantEspece
          }
          factureEspeceRepository.save(factureEspece)
        }
        encaissementDto.electronique?.let { electronique ->
          val factureElectronique = FactureElectronique().apply {
            this.facturationId = facturation!!.id?.toLong()
            this.numeroTelephone = electronique.numeroTelephone
            this.montant = electronique.montantElectronique
          }
          factureElectroniqueRepository.save(factureElectronique)
        }
        encaissementDto.ticket?.let { ticket ->
          val ticketCaisse = bonCaisseRepository.findByCodebarreId(ticket.numeroTicket)
          ticketCaisse!!.type = "Encaisser" // Transition to Encaisser
          ticketCaisse!!.dateEncaisser = LocalDateTime.now() // Set the encaisser date
          ticketCaisse!!.caisseIdEncaisser = caisseService.getActiveCaisse()!!.id
          bonCaisseRepository.save(ticketCaisse)

          val factureTicket = FactureTicket().apply {
            this.facturationId = facturation!!.id?.toLong()
            this.ticketCaisseId = ticketCaisse!!.id
            this.montant = ticket.montantTicket
          }
          factureTicketRepository.save(factureTicket)
        }
      }

      else -> throw RuntimeException("Type de paiement non pris en charge: ${encaissementDto.typeEncaissement}")
    }
    vente.prixPercu = encaissementDto.montantPercu.toDouble()
    vente.dateEncaissement = LocalDateTime.now()
    vente.caisse = caisseService.getActiveCaisse()
    venteRepository.save(vente)

    return facturation
  }

  @Transactional
  fun chargerVentesEnCoursNonEncaisser(venteId: Long): Map<String, Any?> {
    val ventes = venteRepository.findById(venteId).get()
    if (ventes.prixPercu != null && ventes.prixPercu!! > 0) {
      throw RuntimeException("La vente est déjà encaissée.")
    }
    val produits = concernerRepository.findByVente(ventes)
      .map { concerner ->
        var nom = concerner?.produit?.nom
        if (concerner?.produitDetail != null) {
          nom = concerner.produitDetail!!.nom
        }
        mapOf(
          "id" to concerner?.id,
          "nom" to nom,
          "prixUnitaire" to concerner?.prixUnit,
          "quantite" to concerner?.quantite,
          "prixTotal" to (concerner?.prixUnit!! * concerner.quantite!!),
          "reduction" to concerner.reduction,
          "type" to concerner.type
        )
      }
    return mapOf(
      "vente" to ventes,
      "produits" to produits
    )
  }

  fun supprimerVente(venteId: Long): Map<String, Any?> {
    val ventes = venteRepository.findById(venteId).get()
    if (ventes.supprimer == 1) {
      throw RuntimeException("La vente est déjà supprimée.")
    }
    ventes.supprimer = 1
    venteRepository.save(ventes)
    var concernerListe = concernerRepository.findByVente(ventes)
    concernerListe.forEach { concerner ->
      concerner!!.supprimer = 1
      concernerRepository.save(concerner)
    }
    return mapOf(
      "message" to "vente supprimée avec succès"
    )
  }

  @Transactional
  fun listerVentes(): List<Map<String, Any?>> {
    return venteRepository.findAll().map { vente ->
      mapOf(
        "netAPayer" to vente.prixTotal as Any?,
        "reduction" to vente.reduction as Any?,
        "reference" to vente.reference as Any?,
        "infoClients" to (vente.user?.let { "${it.nom} (${it.telephone})" } ?: "Aucun client") as Any?,
        "vendeur" to (vente.employe?.user?.nom ?: "Inconnu") as Any?,
        "commentaire" to vente.commentaire as Any?,
        "dateVente" to vente.dateVente as Any?,
        "actions" to "edit,delete" as Any? // Placeholder for actions
      )
    }
  }


  fun listerVentesPageable(
    pageable: Pageable,
    etat: String?,
    dateVente: String?,
    dateEncaissement: String?,
    userId: String?,
    employeId: String?,
    prescripteurId: String?,
    caisseId: String?
  ): Page<Map<String, Any?>> {
    val spec = VenteRepository.filterVentes(
      etat, dateVente, dateEncaissement, userId, employeId, prescripteurId, caisseId
    )
    return venteRepository.findAll(spec, pageable).map { vente ->
      val produits = concernerRepository.findByVente(vente).map { concerner ->
        mapOf(
          "id" to concerner!!.id,
          "nom" to concerner!!.produit?.nom,
          "produitId" to concerner!!.produit?.id,
          "quantite" to concerner!!.quantite,
          "prixUnitaire" to concerner!!.prixUnit,
          "reduction" to concerner!!.reduction,
          "prixTotal" to (concerner!!.prixUnit!! * concerner!!.quantite!!)
        )
      }

      mapOf(
        "id" to vente.id as Any?,
        "prixPercu" to vente.prixPercu as Any?,
        "netAPayer" to vente.prixTotal as Any?,
        "reduction" to vente.reduction as Any?,
        "reference" to vente.reference as Any?,
        "infoClients" to (vente.user?.let { "${it.nom} (${it.telephone})" } ?: "Aucun client") as Any?,
        "vendeur" to (vente.employe?.user?.nom ?: "Inconnu") as Any?,
        "commentaire" to vente.commentaire as Any?,
        "etat" to vente.etat as Any?,
        "dateVente" to vente.dateVente as Any?,
        "dateEncaissement" to vente.dateEncaissement as Any?,
        "produits" to produits,
        "actions" to "edit,delete" as Any? // Placeholder for actions
      )
    }
  }

  @Transactional
  fun listerVentesNonEncaissees(): List<Map<String, Any?>> {
//      return venteRepository.findByPrixPercuGreaterThan(0.0).map { vente ->
    return venteRepository.findVentesWithPrixPercuZero().map { vente ->
      mapOf(
        "id" to vente.id as Any?,
        "netAPayer" to vente.prixTotal as Any?,
        "reduction" to vente.reduction as Any?,
        "reference" to vente.reference as Any?,
        "infoClients" to (vente.user?.let { "${it.nom} (${it.telephone})" } ?: "Aucun client") as Any?,
        "vendeur" to (vente.employe?.user?.nom ?: "Inconnu") as Any?,
        "commentaire" to vente.commentaire as Any?,
        "dateVente" to vente.dateVente as Any?,
        "actions" to "edit,delete" as Any? // Placeholder for actions
      )
    }
  }

  @Transactional
  fun listerVentesEncaissees(): List<Map<String, Any?>> {
//      return venteRepository.findByPrixPercuGreaterThan(0.0).map { vente ->
    return venteRepository.findVentesWithPrixPercu().map { vente ->
      mapOf(
        "id" to vente.id as Any?,
        "prixPercu" to vente.prixPercu as Any?,
        "netAPayer" to vente.prixTotal as Any?,
        "reduction" to vente.reduction as Any?,
        "reference" to vente.reference as Any?,
        "infoClients" to (vente.user?.let { "${it.nom} (${it.telephone})" } ?: "Aucun client") as Any?,
        "vendeur" to (vente.employe?.user?.nom ?: "Inconnu") as Any?,
        "commentaire" to vente.commentaire as Any?,
        "etat" to vente.etat as Any?,
        "dateVente" to vente.dateVente as Any?,
        "dateEncaissement" to vente.dateEncaissement as Any?,
        "actions" to "edit,delete" as Any? // Placeholder for actions
      )
    }
  }


  @Transactional
  fun chargerVentesEncaisser(venteId: Long): Map<String, Any?> {
    val ventes = venteRepository.findById(venteId).get()
    if (ventes.prixPercu == null && ventes.prixPercu!! <= 0) {
      throw RuntimeException("La vente est déjà encaissée.")
    }
    val produits = concernerRepository.findByVente(ventes)
      .map { concerner ->
        mapOf(
          "id" to concerner?.id,
          "nom" to concerner?.produit?.nom,
          "prixUnitaire" to concerner?.prixUnit,
          "quantite" to concerner?.quantite,
          "prixTotal" to (concerner?.prixUnit!! * concerner.quantite!!),
          "reduction" to concerner.reduction
        )
      }

    val facturation = facturationRepository.findByVente(ventes)

    val montantEspece = when (facturation!!.typePaiement!!.lowercase()) {
      Vente.VENTE_TYPE_PAIEMENT_ESPECE.lowercase(), Vente.VENTE_TYPE_PAIEMENT_MIXTE.lowercase() ->
        factureEspeceRepository.findByFacturationId(facturation!!.id!!.toLong()).montant ?: 0

      else -> 0
    }

    val montantElectronique = when (facturation!!.typePaiement!!.lowercase()) {
      Vente.VENTE_TYPE_PAIEMENT_ELECTRONIQUE.lowercase(), Vente.VENTE_TYPE_PAIEMENT_MIXTE.lowercase() ->
        factureElectroniqueRepository.findByFacturationId(facturation!!.id!!.toLong()).montant ?: 0

      else -> 0
    }

    val montantTicket = when (facturation!!.typePaiement!!.lowercase()) {
      Vente.VENTE_TYPE_PAIEMENT_TICKET.lowercase(), Vente.VENTE_TYPE_PAIEMENT_MIXTE.lowercase() ->
        factureTicketRepository.findByFacturationId(facturation!!.id!!.toLong()).montant ?: 0

      else -> 0
    }
    return mapOf(
      "vente" to ventes,
      "produits" to produits,
      "montantFacturation" to facturation!!.montantTtc,
      "montantEspece" to montantEspece,
      "montantElectronique" to montantElectronique,
      "montantTicket" to montantTicket
    )
  }

  fun genererReference(num: Int): String {
    // Get today's date
    val today = LocalDate.now()
    val formatter = DateTimeFormatter.ofPattern("yy-MM-dd")
    val formattedDate = today.format(formatter)

    // Extract year, month, and day
    val annee = formattedDate.substring(0, 2)
    val mois = formattedDate.substring(3, 5)
    val jour = formattedDate.substring(6, 8)

    // Increment the number
    var numeroRegBig = num + 1

    // Format the number to always have 4 digits
    val formattedNumeroRegBig = String.format("%04d", numeroRegBig)

    // Generate the reference
    return "ALS$annee$mois$jour-$formattedNumeroRegBig"
  }

  fun getVenteDetailsByReference(reference: String): Map<String, Any?> {
    val vente: Vente = venteRepository.findByReferenceAndSupprimer(reference, 0)
      ?: throw IllegalArgumentException("Vente not found with reference: $reference")

    val produits: List<Map<String, Any?>> = concernerRepository.findByVente(vente).map { concerner ->
      mapOf(
        "id" to concerner!!.id,
        "nom" to concerner!!.produit?.nom,
        "produitId" to concerner!!.produit?.id,
        "rayonId" to concerner!!.enRayon?.id,
        "quantite" to concerner!!.quantite,
        "prixUnitaire" to concerner!!.prixUnit,
        "reduction" to concerner!!.reduction,
        "prixTotal" to (concerner!!.prixUnit!! * concerner.quantite!!)
      )
    }
    return mapOf(
      "vente" to vente,
      "produits" to produits
    )
  }

  fun convertToSimpleString(input: String): String {
    return Normalizer.normalize(input, Normalizer.Form.NFD)
      .replace("[\\p{InCombiningDiacriticalMarks}]".toRegex(), "")
      .lowercase()
  }
}
