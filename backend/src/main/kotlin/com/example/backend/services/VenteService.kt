package com.example.backend.services

import com.example.backend.dtos.*
import com.example.backend.models.*
import com.example.backend.repositories.*
import com.example.backend.utility.UserUtils
import com.itextpdf.kernel.geom.PageSize
import com.itextpdf.kernel.pdf.PdfDocument
import com.itextpdf.kernel.pdf.PdfWriter
import com.itextpdf.layout.Document
import com.itextpdf.layout.element.Paragraph
import com.itextpdf.layout.element.Table
import com.itextpdf.layout.properties.UnitValue
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Sort
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.io.File
import java.text.Normalizer
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

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
    val employe =
      userUtils.getCurrentEmploye() ?: throw RuntimeException("Impossible de récupérer l'utilisateur connecté.")


    if (venteRequestDto.etat !in listOf("COMPTANT", "ASSURANCE", "CREDIT")) {
      throw RuntimeException("État de la vente invalide: ${venteRequestDto.etat}")
    }


    // Handle client
    val client = when (venteRequestDto.clientInfo.type) {
      "existing" -> userRepository.findById(venteRequestDto.clientInfo.id!!.toInt())
        .orElseThrow { RuntimeException("Client introuvable avec l'ID: ${venteRequestDto.clientInfo.id}") }

      "new" -> User().apply {
        this.nom =
          venteRequestDto.clientInfo.name ?: throw RuntimeException("Nom du client requis pour un nouveau client")
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

      "new" -> {
        if (!venteRequestDto.prescripteurInfo.name.isNullOrEmpty()) {
          Prescripteur().apply {
            this.nom = venteRequestDto.prescripteurInfo.name
          }.also { prescripteurRepository.save(it) }
        } else {
          null // Skip creating the prescripteur and continue
        }
      }

      "none" -> null
      else -> throw RuntimeException("Type de prescripteur invalide: ${venteRequestDto.prescripteurInfo.type}")
    }
    val dateTimeNow = LocalDateTime.now()
    val formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss")
    val formattedDateTimeNow = dateTimeNow.format(formatter)
    val activeCaisse = caisseService.getCaisseActive()
    // Create the sale
    val nouvelleVente = Vente().apply {
      this.id = "${formattedDateTimeNow}".toLong()
      this.employe = employe
      this.reduction = venteRequestDto.prixReduction.toString()
      this.caisse = if (venteRequestDto.etat == "CREDIT") {
        null
      } else {
        activeCaisse
      }
      this.reference = genererReference(venteRepository.countMois().toInt())
      this.dateVente = LocalDateTime.now()
      this.etat = venteRequestDto.etat
      this.prixTotal = (venteRequestDto.prixTotal - venteRequestDto.prixReduction)
      this.commentaire = venteRequestDto.commentaire
      this.user = client
      this.prescripteur = prescripteur
      this.supprimer = 0
    }
    val savedVente = venteRepository.save(nouvelleVente)

    if (venteRequestDto.reductionEnabled) {
      employe.faireReductionMax = employe?.faireReductionMax!! - venteRequestDto?.prixReduction!!.toInt()
      employeRepository.save(employe)
    }

    venteRequestDto.produits.forEach { produitAssocieDto ->
      if (produitAssocieDto.type?.lowercase() == "detail".lowercase()) {
        var produitDetail = produitDetailRepository.findById(produitAssocieDto.produitId!!.toInt()).get()
        produitDetail.stock = produitDetail.stock!! - produitAssocieDto.quantite!!
        produitDetailRepository.save(produitDetail)

        val concerner = Concerner().apply {
          this.venteId = savedVente.id
          this.produitId = produitDetail.id
          this.quantite = produitAssocieDto.quantite
          this.prixUnit = produitAssocieDto.prixUnit
          this.type = produitAssocieDto.type
          this.reduction = produitAssocieDto.reduction
        }
        concernerRepository.save(concerner)
      } else {
        val rayon = enRayonRepository.findById(produitAssocieDto.rayonId!!).get()
        rayon.quantiteRestante = rayon.quantiteRestante!! - produitAssocieDto.quantite!!
        enRayonRepository.save(rayon)

        val produit = produitRepository.findById(rayon.produitId!!)
          .orElseThrow { RuntimeException("Produit introuvable avec l'ID: ${produitAssocieDto.produitId}") }
        produit.stock = produit.stock!! - produitAssocieDto.quantite!!
        produitRepository.save(produit)

        val concerner = Concerner().apply {
          this.venteId = savedVente.id
          this.produitId = produit.id
          this.enRayonId = rayon.id
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
  fun encaisserVenteDirect(encaissementDirectDto: EncaissementDirectDto): Vente {
    val employe =
      userUtils.getCurrentEmploye() ?: throw RuntimeException("Impossible de récupérer l'utilisateur connecté.")

    if (encaissementDirectDto.venteRequestDto.etat !in listOf("COMPTANT", "ASSURANCE", "CREDIT")) {
      throw RuntimeException("État de la vente invalide: ${encaissementDirectDto.venteRequestDto.etat}")
    }


    // Handle client
    val client = when (encaissementDirectDto.venteRequestDto.clientInfo.type) {
      "existing" -> userRepository.findById(encaissementDirectDto.venteRequestDto.clientInfo.id!!.toInt())
        .orElseThrow { RuntimeException("Client introuvable avec l'ID: ${encaissementDirectDto.venteRequestDto.clientInfo.id}") }

      "new" -> User().apply {
        this.nom = encaissementDirectDto.venteRequestDto.clientInfo.name
          ?: throw RuntimeException("Nom du client requis pour un nouveau client")
        this.telephone = encaissementDirectDto.venteRequestDto.clientInfo.phone
          ?: throw RuntimeException("Téléphone du client requis pour un nouveau client")
      }.also { userRepository.save(it) }

      "none" -> null
      else -> throw RuntimeException("Type de client invalide: ${encaissementDirectDto.venteRequestDto.clientInfo.type}")
    }

    // Handle prescriber
    val prescripteur = when (encaissementDirectDto.venteRequestDto.prescripteurInfo.type) {
      "existing" -> prescripteurRepository.findById(encaissementDirectDto.venteRequestDto.prescripteurInfo.id!!)
        .orElseThrow { RuntimeException("Prescripteur introuvable avec l'ID: ${encaissementDirectDto.venteRequestDto.prescripteurInfo.id}") }

      "new" -> {
        if (!encaissementDirectDto.venteRequestDto.prescripteurInfo.name.isNullOrEmpty()) {
          Prescripteur().apply {
            this.nom = encaissementDirectDto.venteRequestDto.prescripteurInfo.name
          }.also { prescripteurRepository.save(it) }
        } else {
          null // Skip creating the prescripteur and continue
        }
      }

      "none" -> null
      else -> throw RuntimeException("Type de prescripteur invalide: ${encaissementDirectDto.venteRequestDto.prescripteurInfo.type}")
    }
    val dateTimeNow = LocalDateTime.now()
    val formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss")
    val formattedDateTimeNow = dateTimeNow.format(formatter)
    val activeCaisse = caisseService.getCaisseActive()
    // Create the sale
    val nouvelleVente = Vente().apply {
      this.id = "${formattedDateTimeNow}".toLong()
      this.employe = employe
      this.reduction = encaissementDirectDto.venteRequestDto.prixReduction.toString() ?: "0"
      this.caisse = activeCaisse
      this.reference = genererReference(venteRepository.countMois().toInt())
      this.dateVente = LocalDateTime.now()
      this.etat = encaissementDirectDto.venteRequestDto.etat
      this.prixTotal =
        (encaissementDirectDto.venteRequestDto.prixTotal ?: 0.0 - encaissementDirectDto.venteRequestDto.prixReduction
        ?: 0.0)
      this.commentaire = encaissementDirectDto.venteRequestDto.commentaire
      this.user = client
      this.prescripteur = prescripteur
      this.supprimer = 0
      this.dateEncaissement = LocalDateTime.now()
      this.prixPercu = encaissementDirectDto.encaissementDto.montantPercu.toDouble() ?: 0.0
    }
    val savedVente = venteRepository.save(nouvelleVente)

    if (encaissementDirectDto.venteRequestDto.reductionEnabled) {
      employe.faireReductionMax =
        employe?.faireReductionMax!! - encaissementDirectDto.venteRequestDto?.prixReduction!!.toInt()
      employeRepository.save(employe)
    }

    encaissementDirectDto.venteRequestDto.produits.forEach { produitAssocieDto ->
      if (produitAssocieDto.type?.lowercase() == "detail".lowercase()) {
        var produitDetail = produitDetailRepository.findById(produitAssocieDto.produitId!!.toInt()).get()
        produitDetail.stock = produitDetail.stock!! - produitAssocieDto.quantite!!
        produitDetailRepository.save(produitDetail)

        val concerner = Concerner().apply {
          this.venteId = savedVente.id
          this.produitId = produitDetail.id
          this.quantite = produitAssocieDto.quantite
          this.prixUnit = produitAssocieDto.prixUnit
          this.type = produitAssocieDto.type
          this.reduction = produitAssocieDto.reduction
        }
        concernerRepository.save(concerner)
      } else {
        val rayon = enRayonRepository.findById(produitAssocieDto.rayonId!!).get()
        rayon.quantiteRestante = rayon.quantiteRestante!! - produitAssocieDto.quantite!!
        enRayonRepository.save(rayon)

        val produit = produitRepository.findById(rayon.produitId!!)
          .orElseThrow { RuntimeException("Produit introuvable avec l'ID: ${produitAssocieDto.produitId}") }
        produit.stock = produit.stock!! - produitAssocieDto.quantite!!
        produitRepository.save(produit)

        val concerner = Concerner().apply {
          this.venteId = savedVente.id
          this.produitId = produit.id
          this.enRayonId = rayon.id
          this.quantite = produitAssocieDto.quantite
          this.prixUnit = produitAssocieDto.prixUnit
          this.type = produitAssocieDto.type
          this.reduction = produitAssocieDto.reduction
        }
        concernerRepository.save(concerner)
      }
    }
    val caisse = caisseService.getCaisseActive()
    var facturation = Facturation().apply {
      this.id = generateId()!!.toLong()
      this.vente = savedVente
      this.caisse = caisse
      this.typePaiement = encaissementDirectDto.encaissementDto.typeEncaissement
      this.montantPercu = encaissementDirectDto.encaissementDto.montantPercu
      this.reste = encaissementDirectDto.encaissementDto.montantRendu
      this.montantTtc = savedVente?.prixTotal!!.toInt()
      this.dateFacture = LocalDateTime.now()
      this.supprimer = 0
    }
    facturation = facturationRepository.save(facturation)
    var typeEncaissement = userUtils.removeAccent(encaissementDirectDto.encaissementDto.typeEncaissement)

    when (typeEncaissement.lowercase()) {
      "espece".lowercase() -> {
        encaissementDirectDto.encaissementDto.espece?.let { montantEspece ->
          val factureEspece = FactureEspece().apply {
            this.facturationId = facturation!!.id?.toLong()
            this.montant = montantEspece
          }
          factureEspeceRepository.save(factureEspece)
        }
      }

      "electronique".lowercase() -> {
        encaissementDirectDto.encaissementDto.electronique?.let { electronique ->
          val factureElectronique = FactureElectronique().apply {
            this.facturationId = facturation!!.id?.toLong()
            this.numeroTelephone = electronique.numeroTelephone
            this.montant = electronique.montantElectronique
          }
          factureElectroniqueRepository.save(factureElectronique)
        }
      }

      "ticket".lowercase() -> {
        encaissementDirectDto.encaissementDto.ticket?.let { ticket ->
          val ticketCaisse = bonCaisseRepository.findByCodebarreId(ticket.numeroTicket)
          ticketCaisse!!.type = "Encaisser" // Transition to Encaisser
          ticketCaisse!!.dateEncaisser = LocalDateTime.now() // Set the encaisser date
          ticketCaisse!!.caisseIdEncaisser = caisseService.getCaisseActive()!!.id
          bonCaisseRepository.save(ticketCaisse)

          val factureTicket = FactureTicket().apply {
            this.facturationId = facturation!!.id?.toLong()
            this.ticketCaisseId = ticketCaisse!!.id
            this.montant = ticket.montantTicket
          }
          factureTicketRepository.save(factureTicket)
        }
      }

      "mixte".lowercase() -> {
        encaissementDirectDto.encaissementDto.espece?.let { montantEspece ->
          val factureEspece = FactureEspece().apply {
            this.facturationId = facturation!!.id?.toLong()
            this.montant = montantEspece
          }
          factureEspeceRepository.save(factureEspece)
        }
        encaissementDirectDto.encaissementDto.electronique?.let { electronique ->
          val factureElectronique = FactureElectronique().apply {
            this.facturationId = facturation!!.id?.toLong()
            this.numeroTelephone = electronique.numeroTelephone
            this.montant = electronique.montantElectronique
          }
          factureElectroniqueRepository.save(factureElectronique)
        }
        encaissementDirectDto.encaissementDto.ticket?.let { ticket ->
          val ticketCaisse = bonCaisseRepository.findByCodebarreId(ticket.numeroTicket)
          ticketCaisse!!.type = "Encaisser" // Transition to Encaisser
          ticketCaisse!!.dateEncaisser = LocalDateTime.now() // Set the encaisser date
          ticketCaisse!!.caisseIdEncaisser = caisseService.getCaisseActive()!!.id
          bonCaisseRepository.save(ticketCaisse)

          val factureTicket = FactureTicket().apply {
            this.facturationId = facturation!!.id?.toLong()
            this.ticketCaisseId = ticketCaisse!!.id
            this.montant = ticket.montantTicket
          }
          factureTicketRepository.save(factureTicket)
        }
      }

      else -> throw RuntimeException("Type de paiement non pris en charge: ${typeEncaissement}")
    }

    return savedVente
  }

  @Transactional
  fun encaisserVente(venteId: Long, encaissementRequestDto: EncaissementRequestDto): Facturation {
    val vente =
      venteRepository.findById(venteId).orElseThrow { RuntimeException("Vente introuvable avec l'ID: $venteId") }

    if (vente.etat != "EN_COURS") {
      throw RuntimeException("La vente doit être en cours pour être encaissée.")
    }

    val employe = userUtils.getCurrentEmploye()

    val caisse = caisseService.getCaisseActive()
    val facturation = Facturation().apply {
      this.id = generateId()!!.toLong()
      this.vente = vente
      this.caisse = caisse
      this.typePaiement = encaissementRequestDto.typePaiement
      this.montantPercu = encaissementRequestDto.montantPercu
      this.reste = encaissementRequestDto.reste
      this.montantTtc = encaissementRequestDto.montantTtc
      this.dateFacture = LocalDateTime.now()
      this.supprimer = 0
    }

    when (encaissementRequestDto.typePaiement.lowercase()) {
      "espece".lowercase() -> {
        encaissementRequestDto.espece?.let { montantEspece ->
          val factureEspece = FactureEspece().apply {
            this.facturationId = facturation!!.id?.toLong()
            this.montant = montantEspece
          }
          factureEspeceRepository.save(factureEspece)
        }
      }

      "electronique".lowercase() -> {
        encaissementRequestDto.electronique?.let { electronique ->
          val factureElectronique = FactureElectronique().apply {
            this.facturationId = facturation!!.id?.toLong()
            this.numeroTelephone = electronique.numeroTelephone
            this.montant = electronique.montant
          }
          factureElectroniqueRepository.save(factureElectronique)
        }
      }

      "ticket".lowercase() -> {
        encaissementRequestDto.ticket?.let { montantTicket ->
          val factureTicket = FactureTicket().apply {
            this.facturationId = facturation!!.id?.toLong()
            this.montant = montantTicket
          }
          factureTicketRepository.save(factureTicket)
        }
      }

      "mixte".lowercase() -> {
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

    val employe = userUtils.getCurrentEmploye()
    val caisse = caisseService.getCaisseActive()
    var facturation = Facturation().apply {
      this.id = generateId()!!.toLong()
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

    when (encaissementDto.typeEncaissement.lowercase()) {
      "espece".lowercase() -> {
        encaissementDto.espece?.let { montantEspece ->
          val factureEspece = FactureEspece().apply {
            this.facturationId = facturation!!.id?.toLong()
            this.montant = montantEspece
          }
          factureEspeceRepository.save(factureEspece)
        }
      }

      "electronique".lowercase() -> {
        encaissementDto.electronique?.let { electronique ->
          val factureElectronique = FactureElectronique().apply {
            this.facturationId = facturation!!.id?.toLong()
            this.numeroTelephone = electronique.numeroTelephone
            this.montant = electronique.montantElectronique
          }
          factureElectroniqueRepository.save(factureElectronique)
        }
      }

      "ticket".lowercase() -> {
        encaissementDto.ticket?.let { ticket ->
          val ticketCaisse = bonCaisseRepository.findByCodebarreId(ticket.numeroTicket)
          ticketCaisse!!.type = "Encaisser" // Transition to Encaisser
          ticketCaisse!!.dateEncaisser = LocalDateTime.now() // Set the encaisser date
          ticketCaisse!!.caisseIdEncaisser = caisseService.getCaisseActive()!!.id
          bonCaisseRepository.save(ticketCaisse)

          val factureTicket = FactureTicket().apply {
            this.facturationId = facturation!!.id?.toLong()
            this.ticketCaisseId = ticketCaisse!!.id
            this.montant = ticket.montantTicket
          }
          factureTicketRepository.save(factureTicket)
        }
      }

      "mixte".lowercase() -> {
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
          ticketCaisse!!.caisseIdEncaisser = caisseService.getCaisseActive()!!.id
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
    vente.caisse = caisseService.getCaisseActive()
    venteRepository.save(vente)

    return facturation
  }

  private fun generateId(): String? {
    val dateTimeNow = LocalDateTime.now()
    val formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss")
    val formattedDateTimeNow = dateTimeNow.format(formatter)
    return formattedDateTimeNow
  }

  @Transactional
  fun chargerVentesEnCoursNonEncaisser(venteId: Long): Map<String, Any?> {
    val activeCaisse = caisseService.getCaisseActive()
    val ventes = venteRepository.findById(venteId).get()
    if (ventes.prixPercu != null && ventes.prixPercu!! > 0) {
      throw RuntimeException("La vente est déjà encaissée.")
    }
    val produits = concernerRepository.findByVenteId(ventes.id!!.toLong()).map { concerner ->
      var produit =
        produitRepository.findById(enRayonRepository.findById(concerner?.enRayonId!!).get().produitId!!!!).get()
      var nom = produit.nom
      if (concerner?.type === "detail") {
        var produitDetail = produitDetailRepository.findById(concerner.enRayonId!!.toInt()).get()
        nom = produitDetail.nom
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
      "vente" to ventes, "produits" to produits
    )
  }

  fun supprimerVente(venteId: Long): Map<String, Any?> {
    val ventes = venteRepository.findById(venteId).get()
    if (ventes.supprimer == 1) {
      throw RuntimeException("La vente est déjà supprimée.")
    }
    ventes.supprimer = 1
    venteRepository.save(ventes)
    var concernerListe = concernerRepository.findByVenteId(ventes.id!!.toLong())
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
      mapOf("netAPayer" to vente.prixTotal as Any?,
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
  fun listerVenteParNombreDeJourEtFournisseur(fournisseurId: String?, jour: Int): List<Map<String, Any?>> {
    val dateDebut = LocalDateTime.now().minusDays(jour.toLong())
    val dateFin = LocalDateTime.now()

    val ventes = venteRepository.findByDateVenteBetweenAndSupprimer(dateDebut, dateFin)

    val produits = ventes.flatMap { vente: Vente? ->
      concernerRepository.findByVenteId(vente?.id!!).mapNotNull { concerner ->
        if (concerner?.enRayonId!!.toLong() > 1000) {
          val enRayon = enRayonRepository.findById(concerner?.enRayonId!!).get()
          val produit = produitRepository.findById(enRayon?.produitId!!).orElse(null)
          // Filtre les produits du fournisseur spécifié
          if (fournisseurId == "null") {
            mapOf(
              "id" to produit.id,
              "nom" to produit.nom,
              "prix" to concerner.prixUnit,
              "stock" to produit.stock,
              "fournisseur" to enRayon.fournisseur!!.nom,
              "dateLivraison" to enRayon.dateLivraison,
              "datePeremption" to enRayon.datePeremption,
              "quantiteStock" to produit.stock,
              "prixAchat" to enRayon.prixAchat,
              "quantiteRestante" to 0,
            )
          } else if (fournisseurId!!.toLong() > 0.0.toLong()) {
            if (produit != null && enRayon.fournisseur?.id?.toLong() == fournisseurId.toLong()) {
              mapOf(
                "id" to produit.id,
                "nom" to produit.nom,
                "prix" to concerner.prixUnit,
                "stock" to produit.stock,
                "fournisseur" to enRayon.fournisseur!!.nom,
                "dateLivraison" to enRayon.dateLivraison,
                "datePeremption" to enRayon.datePeremption,
                "quantiteStock" to produit.stock,
                "prixAchat" to enRayon.prixAchat,
                "quantiteRestante" to 0,
                // ajoute d'autres champs si besoin
              )
            } else null
          } else {
            mapOf(
              "id" to produit.id,
              "nom" to produit.nom,
              "prix" to concerner.prixUnit,
              "stock" to produit.stock,
              "fournisseur" to enRayon.fournisseur!!.nom,
              "dateLivraison" to enRayon.dateLivraison,
              "datePeremption" to enRayon.datePeremption,
              "quantiteStock" to produit.stock,
              "prixAchat" to enRayon.prixAchat,
              "quantiteRestante" to 0,
            )
          }
        } else
          null

      }
    }

    return produits.distinctBy { it["nom"] }
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
    val activeCaisse = caisseService.getCaisseActive()
    val spec = VenteRepository.filterVentes(
      activeCaisse, 0, 1, etat, dateVente, dateEncaissement, userId, employeId, prescripteurId, caisseId
    )
    var ventes = venteRepository.findAll(spec, pageable).map { vente ->
      val produits = concernerRepository.findByVenteId(vente.id!!.toLong()).map { concerner ->
        var nom = ""
        var id = ""
        if (concerner!!.type == "detail") {
          var produitDetail = produitDetailRepository.findById(concerner.enRayonId!!.toInt()).get()
          nom = produitDetail.nom.toString()
          id = produitDetail.id.toString()
        } else {
          var produit =
            produitRepository.findById(enRayonRepository.findById(concerner!!.enRayonId!!).get().produitId!!).get()
          nom = produit.nom.toString()
          id = produit.id.toString()
        }

        mapOf(
          "id" to concerner!!.id,
          "nom" to nom,
          "produitId" to id,
          "quantite" to concerner!!.quantite,
          "prixUnitaire" to concerner!!.prixUnit,
          "reduction" to concerner!!.reduction,
          "prixTotal" to (concerner!!.prixUnit!! * concerner!!.quantite!!)
        )
      }

      mapOf("id" to vente.id as Any?,
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


    return ventes
  }

  fun listerVentesPageableDetail(
    pageable: Pageable,
    etat: String?,
    startDateVente: String?,
    endDateVente: String?,
    startDateEncaissement: String?,
    endDateEncaissement: String?,
    userId: String?,
    employeId: String?,
    prescripteurId: String?,
    caisseId: String?
  ): VentePageableCustomlDto {
    var activeCaisse = caisseService.getCaisseActive()
    if (caisseId == "non") {
      activeCaisse = null
    }

    val spec = VenteRepository.filterVentesRange(
      activeCaisse, 0, 1, etat, startDateVente,
      endDateVente,
      startDateEncaissement,
      endDateEncaissement, userId, employeId, prescripteurId, caisseId
    )
    var ventes = venteRepository.findAll(spec, pageable).map { vente ->
      val produits = concernerRepository.findByVenteId(vente.id!!.toLong()).map { concerner ->
        var nom = ""
        var id = ""
        if (concerner!!.type == "detail") {
          var produitDetail = produitDetailRepository.findById(concerner.enRayonId!!.toInt()).get()
          nom = produitDetail.nom.toString()
          id = produitDetail.id.toString()
        } else {
          var produit =
            produitRepository.findById(enRayonRepository.findById(concerner!!.enRayonId!!).get().produitId!!).get()
          nom = produit.nom.toString()
          id = produit.id.toString()
        }

        mapOf(
          "id" to concerner!!.id,
          "nom" to nom,
          "produitId" to id,
          "quantite" to concerner!!.quantite,
          "prixUnitaire" to concerner!!.prixUnit,
          "reduction" to concerner!!.reduction,
          "prixTotal" to (concerner!!.prixUnit!! * concerner!!.quantite!!)
        )
      }

      mapOf("id" to vente.id as Any?,
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

    var totalAmount = 0.0
    if (ventes.totalElements > 0) {
      val pageableElement = PageRequest.of(0, ventes.totalElements.toInt(), Sort.by(Sort.Direction.DESC, "dateVente"))
      val venteTotal = venteRepository.findAll(spec, pageableElement)
      totalAmount = venteTotal.content.sumOf { it.prixTotal as Double }
    }


    var data = VentePageableCustomlDto(
      content = ventes,
      totalElements = ventes.totalElements,
      totalPages = ventes.totalPages,
      pageSize = ventes.size,
      pageNumber = ventes.number,
      totalAmount = totalAmount
    )

    return data
  }

  fun listerVentesPageableDetailPrint(
    pageable: Pageable,
    etat: String?,
    startDateVente: String?,
    endDateVente: String?,
    startDateEncaissement: String?,
    endDateEncaissement: String?,
    userId: String?,
    employeId: String?,
    prescripteurId: String?,
    caisseId: String?,
    outputPath: String?,
  ) {
    var activeCaisse = caisseService.getCaisseActive()
//    var activeCaisse = caisseService.getCaisseActive()
    if (caisseId == "non") {
      activeCaisse = null
    }

    val spec = VenteRepository.filterVentesRange(
      activeCaisse, 0, 1, etat, startDateVente,
      endDateVente,
      startDateEncaissement,
      endDateEncaissement, userId, employeId, prescripteurId, caisseId
    )
    var ventes = venteRepository.findAll(spec, pageable)

    var totalAmount = 0.0
    val pageableElement = PageRequest.of(0, ventes.totalElements.toInt(), Sort.by(Sort.Direction.DESC, "dateVente"))
    val venteTotal = venteRepository.findAll(spec, pageableElement)
    totalAmount = venteTotal.content.sumOf { it.prixTotal as Double }

    val smallFontSize = 8f

    val file = File(outputPath)
    val pdfWriter = PdfWriter(file)
    val pdfDocument = PdfDocument(pdfWriter)
    val document = Document(pdfDocument, PageSize.A4.rotate())

    document.add(Paragraph("Liste des ventes"))
//    document.add(PdfName.NEW)
    val table = Table(UnitValue.createPercentArray(10)).useAllAvailableWidth()
//    table.width = 100f
    listOf<String>(
      "Id",
      "reference",
      "montant",
      "montant percu",
      "client",
      "vendeur",
      "date encaissement",
      "date de vente",
      "etat",
      "employe",
    ).forEach {
      table.addCell(it).setFontSize(smallFontSize).setBold()
    }

    venteTotal.content.forEach { vente ->
      table.addCell("${vente.id}").setFontSize(smallFontSize)
      table.addCell("${vente.reference}").setFontSize(smallFontSize)
      table.addCell("${vente.prixTotal}").setFontSize(smallFontSize)
      table.addCell("${vente.prixPercu}").setFontSize(smallFontSize)
      table.addCell("${vente.user?.nom ?: "N/A"}").setFontSize(smallFontSize)
      table.addCell("${vente.caisse?.user?.user?.nom ?: "N/A"}").setFontSize(smallFontSize)
      table.addCell("${vente.dateEncaissement}").setFontSize(smallFontSize)
      table.addCell("${vente.dateVente}").setFontSize(smallFontSize)
      table.addCell("${vente.etat}").setFontSize(smallFontSize)
      table.addCell("${vente.employe?.user?.nom} ${vente.employe?.user?.prenom}").setFontSize(smallFontSize)
    }

    document.add(table)
    document.close()

  }

  @Transactional
  fun listerVentesNonEncaissees(
    pageable: Pageable,
  ): Page<Map<String, Any?>> {
//      return venteRepository.findByPrixPercuGreaterThan(0.0).map { vente ->
    val activeCaisse = caisseService.getCaisseActive()
    if (activeCaisse != null) {
      val spec = VenteRepository.filterVentes(
        activeCaisse,
        0, 0,
        "null", "null", "null", "null", "null", "null", "null",
      )
      return venteRepository.findAll(spec, pageable).map { vente ->
        mapOf("id" to vente.id as Any?,
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
    return Page.empty<Map<String, Any?>>()
  }

  @Transactional
  fun listerVentesCreditNonEncaissees(
    pageable: Pageable,
  ): Page<Map<String, Any?>> {
//      return venteRepository.findByPrixPercuGreaterThan(0.0).map { vente ->
    val spec = VenteRepository.filterVentes(
      null,
      0, 0,
      "CREDIT", "null", "null", "null", "null", "null", "null",
    )
    return venteRepository.findAll(spec, pageable).map { vente ->
      val produits = concernerRepository.findByVenteId(vente.id!!.toLong()).map { concerner ->
        var nom = ""
        var id = ""
        if (concerner!!.type == "detail") {
          var produitDetail = produitDetailRepository.findById(concerner.enRayonId!!.toInt()).get()
          nom = produitDetail.nom.toString()
          id = produitDetail.id.toString()
        } else {
          var produit =
            produitRepository.findById(enRayonRepository.findById(concerner!!.enRayonId!!).get().produitId!!).get()
          nom = produit.nom.toString()
          id = produit.id.toString()
        }

        mapOf(
          "id" to concerner!!.id,
          "nom" to nom,
          "produitId" to id,
          "quantite" to concerner!!.quantite,
          "prixUnitaire" to concerner!!.prixUnit,
          "reduction" to concerner!!.reduction,
          "prixTotal" to (concerner!!.prixUnit!! * concerner!!.quantite!!)
        )
      }

      mapOf("id" to vente.id as Any?,
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
  fun listerVentesEncaissees(
    pageable: Pageable,
  ): Page<Map<String, Any?>> {
//      return venteRepository.findByPrixPercuGreaterThan(0.0).map { vente ->
    val activeCaisse = caisseService.getCaisseActive()
    val spec = VenteRepository.filterVentes(
      activeCaisse,
      0, 1,
      "null", "null", "null", "null", "null", "null", "null",
    )
    return venteRepository.findAll(spec, pageable).map { vente ->
      mapOf("id" to vente.id as Any?,
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
    val produits = concernerRepository.findByVenteId(ventes.id!!.toLong()).map { concerner ->
      var produit =
        produitRepository.findById(enRayonRepository.findById(concerner!!.enRayonId!!).get().produitId!!).get()
      var nom = produit.nom
      if (concerner.type == "detail") {
        var produitDetail = produitDetailRepository.findById(concerner.enRayonId!!.toInt()).get()
        nom = produitDetail.nom
      }
      mapOf(
        "id" to concerner?.id,
        "nom" to nom,
        "prixUnitaire" to concerner?.prixUnit,
        "quantite" to concerner?.quantite,
        "prixTotal" to (concerner?.prixUnit!! * concerner.quantite!!),
        "reduction" to concerner.reduction
      )
    }

    val facturation = facturationRepository.findByVente(ventes)

    val montantEspece = when (facturation!!.typePaiement!!.lowercase()) {
      "espece".lowercase(), "mixte".lowercase() -> factureEspeceRepository.findByFacturationId(facturation!!.id!!.toLong()).montant
        ?: 0

      else -> 0
    }

    val montantElectronique = when (facturation!!.typePaiement!!.lowercase()) {
      "electronique".lowercase(), "mixte".lowercase() -> factureElectroniqueRepository.findByFacturationId(facturation!!.id!!.toLong()).montant
        ?: 0

      else -> 0
    }

    val montantTicket = when (facturation!!.typePaiement!!.lowercase()) {
      "ticket".lowercase(), "mixte".lowercase() -> factureTicketRepository.findByFacturationId(facturation!!.id!!.toLong()).montant
        ?: 0

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

    val produits: List<Map<String, Any?>> = concernerRepository.findByVenteId(vente.id!!.toLong()).filter { it!!.quantite!! >0 }.map { concerner ->
      var produit =
        produitRepository.findById(enRayonRepository.findById(concerner!!.enRayonId!!).get().produitId!!).get()
      var nom = produit.nom
      var id = produit.id
      if (concerner.type == "detail") {
        var produitDetail = produitDetailRepository.findById(concerner.enRayonId!!.toInt()).get()
        nom = produitDetail.nom
        id = produitDetail.id
      }
      mapOf(
        "id" to concerner!!.id,
        "nom" to nom,
        "produitId" to id,
        "rayonId" to concerner!!.enRayonId,
        "quantite" to concerner!!.quantite,
        "prixUnitaire" to concerner!!.prixUnit,
        "reduction" to concerner!!.reduction,
        "prixTotal" to (concerner!!.prixUnit!! * concerner.quantite!!)
      )
    }
    return mapOf(
      "vente" to vente, "produits" to produits
    )
  }

  fun getVenteDetailsByVenteId(venteId: String): Map<String, Any?> {
    val vente: Vente = venteRepository.findByIdAndSupprimer(venteId.toLong(), 0)
      ?: throw IllegalArgumentException("Vente not found with reference: $venteId")

    val produits: List<Map<String, Any?>> = concernerRepository.findByVenteId(vente.id!!.toLong()).filter { it!!.quantite!! >0 }.map { concerner ->
      var produit =
        produitRepository.findById(enRayonRepository.findById(concerner!!.enRayonId!!).get().produitId!!).get()
      var nom = produit.nom
      var id = produit.id
      if (concerner.type == "detail") {
        var produitDetail = produitDetailRepository.findById(concerner.enRayonId!!.toInt()).get()
        nom = produitDetail.nom
        id = produitDetail.id
      }
      mapOf(
        "id" to concerner!!.id,
        "nom" to nom,
        "produitId" to id,
        "rayonId" to concerner!!.enRayonId,
        "quantite" to concerner!!.quantite,
        "prixUnitaire" to concerner!!.prixUnit,
        "reduction" to concerner!!.reduction,
        "prixTotal" to (concerner!!.prixUnit!! * concerner.quantite!!)
      )
    }
    return mapOf(
      "vente" to vente, "produits" to produits
    )
  }

  fun convertToSimpleString(input: String): String {
    return Normalizer.normalize(input, Normalizer.Form.NFD).replace("[\\p{InCombiningDiacriticalMarks}]".toRegex(), "")
      .lowercase()
  }

  fun envoyerVentreCreditEnCaisse(venteId: String): Vente {
    val activeCaisse = caisseService.getCaisseActive()
    var venteCredit = venteRepository.findById(venteId.toLong()).get()
    venteCredit.caisse = activeCaisse
    // Generate the reference
    return venteRepository.save(venteCredit)
  }

  fun listerVentesPageableDetailByProduit(
    pageable: Pageable,
    etat: String?,
    produitId: String?,
    startDateVente: String?,
    endDateVente: String?,
    startDateEncaissement: String?,
    endDateEncaissement: String?,
    userId: String?,
    employeId: String?,
    prescripteurId: String?,
    caisseId: String?
  ): VentePageableCustomlDto {
    var activeCaisse = caisseService.getCaisseActive()
    if (caisseId == "non") {
      activeCaisse = null
    }

    val spec = VenteRepository.filterVentesRange(
      activeCaisse, 0, 1, etat, startDateVente,
      endDateVente,
      startDateEncaissement,
      endDateEncaissement, userId, employeId, prescripteurId, caisseId
    )
    var ventes = venteRepository.findAll(spec, pageable).map { vente ->
      val concerner = concernerRepository.findByVenteIdAndProduitId(vente.id!!.toLong(),produitId!!.toInt())

      mapOf("id" to (vente.id ?:0) as Any?,
        "prixPercu" to ((vente.prixPercu ?:0)) as Any?,
        "netAPayer" to (vente.prixTotal ?:0) as Any?,
        "reduction" to (vente.reduction ?:0) as Any?,
        "quantite" to (concerner?.quantite ?:0) as Any?,
        "prixVente" to (concerner?.prixUnit ?:0) as Any?,
        "reduction" to (concerner?.reduction ?:0) as Any?,
        "reference" to( vente.reference ?:0) as Any?,
        "infoClients" to ((vente.user?.let { "${it.nom} (${it.telephone})" } ?: "Aucun client") ?:0) as Any?,
        "vendeur" to( (vente.employe?.user?.nom ?: "Inconnu") ?:0 )as Any?,
        "commentaire" to (vente.commentaire ?:0) as Any?,
        "etat" to (vente.etat ?:0) as Any?,
        "dateVente" to (vente.dateVente ?:0) as Any?,
        "dateEncaissement" to (vente.dateEncaissement ?:0) as Any?,
//        "produits" to concerner,
        "actions" to "edit,delete"  as Any? // Placeholder for actions
      )
    }

    var totalAmount = 0.0
    if (ventes.totalElements > 0) {
      val pageableElement = PageRequest.of(0, ventes.totalElements.toInt(), Sort.by(Sort.Direction.DESC, "dateVente"))
      val venteTotal = venteRepository.findAll(spec, pageableElement)
      totalAmount = venteTotal.content.sumOf { it.prixTotal as Double }
    }


    var data = VentePageableCustomlDto(
      content = ventes,
      totalElements = ventes.totalElements,
      totalPages = ventes.totalPages,
      pageSize = ventes.size,
      pageNumber = ventes.number,
      totalAmount = totalAmount
    )

    return data
  }
}
