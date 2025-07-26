package com.example.backend.services

import com.example.backend.dtos.CaisseDto
import com.example.backend.dtos.CaisseOuvertureRequestDto
import com.example.backend.models.Caisse
import com.example.backend.repositories.*
import com.example.backend.utility.UserUtils
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.LocalTime

@Service
class CaisseService(
  private val caisseRepository: CaisseRepository,
  private val bonCaisseRepository: BonCaisseRepository,
  private val retourProduitRepository: RetourProduitRepository,
  private val depenseRepository: DepenseRepository,
  private val venteRepository: VenteRepository,
  private val employeRepository: EmployeRepository,
  private val userUtils: UserUtils,
  private val produitRetourRepository: ProduitRetourRepository,
  private val concernerRepository: ConcernerRepository,
  private val facturationRepository: FacturationRepository,
  private val factureEspeceRepository: FactureEspeceRepository,
  private val factureTicketRepository: FactureTicketRepository,
  private val factureElectroniqueRepository: FactureElectroniqueRepository,
  private val enRayonRepository: EnRayonRepository,
  private val produitRepository: ProduitRepository
) {

  fun isCaisseOuverte(): Boolean {
    return caisseRepository.existsByEtatAndSupprimer("Ouvert", 0)
  }

  fun getCaisseActive(): Caisse? {
    return caisseRepository.findByEtatAndSupprimer("Ouvert", 0)
      .firstOrNull()
  }

  fun getCaisseFermer(): Caisse? {
    return caisseRepository.findByEtatAndSupprimer("Clot", 0)
      .firstOrNull()
  }

  fun getCaisseEnCours(): Caisse? {
    return caisseRepository.findByEtatAndSupprimer("En cours", 0)
      .firstOrNull()
  }


  fun getCaisseAttenteCloture(): Caisse? {
    return caisseRepository.findByEtatAndSupprimer("En cours1", 0)
      .firstOrNull()
  }

  @Transactional
  fun ouvrirCaisse(requestDto: CaisseOuvertureRequestDto): CaisseDto {
    val currentUser = userUtils.getCurrentUser()
      ?: throw CaisseException("Unable to retrieve the logged-in user.")

    val employeData = employeRepository.findByUser(currentUser)

    // Check if there is already an active caisse
    val activeCaisse = caisseRepository.findByEtatAndSupprimer("En cours", 0).firstOrNull()
    if (activeCaisse != null) {
      throw CaisseException("A caisse (ID: ${activeCaisse.id}, Session: ${activeCaisse.session}) is already open.")
    }

    // Create a new caisse
    val nouvelleCaisse = Caisse().apply {
      this.user = employeData
      this.fondCaisseOuvert = requestDto.fondCaisseOuvert.toDouble()
      this.ouvertureCaisse = requestDto.ouvertureCaisse
      this.dateOuvert = LocalDateTime.now()
      this.session = genererSessionId()
      this.etat = "Ouvert"
      this.supprimer = 0
    }


    val savedCaisse = caisseRepository.save(nouvelleCaisse)
    return mapToCaisseDto(savedCaisse)
  }

  private fun genererSessionId(): String {
    // Ge un identifiant de session simple, vous pouvez le rendre plus complexe
    var heure = LocalTime.now()
    return when (heure) {
      in LocalTime.of(5, 0)..LocalTime.of(11, 59) -> "matin"
      in LocalTime.of(12, 0)..LocalTime.of(23, 59) -> "soir"
      else -> "soir"
    }
  }

  fun mapToCaisseDto(caisse: Caisse): CaisseDto {
    return CaisseDto(
      id = caisse.id,
      employeId = caisse.user?.id,
      employeNom = "${caisse.user?.user?.prenom ?: ""} ${caisse.user?.user?.nom ?: ""}".trim(),
      dateOuvert = caisse.dateOuvert,
      dateFerme = null,
      session = caisse.session,
      fondCaisseOuvert = caisse.fondCaisseOuvert!!.toBigDecimal(),
      fondCaisseFerme = null,
      etat = caisse.etat
    )
  }

  // TODO: Implémenter la logique pour les autres opérations (fermerCaisse, enregistrerVente, enregistrerDepense, etc.)

  fun getAllCaisse(pageable: PageRequest): Page<Map<String, Any?>> {
    val activeCaisses = caisseRepository.findAll(pageable)
    val caisseDetails = activeCaisses.map { activeCaisse ->
      mapOf(
        "id" to activeCaisse.id as Any?,
        "etat" to activeCaisse.etat as Any?,
        "nomEmploye" to (activeCaisse.user?.user?.nom ?: "Inconnu") as Any?,
        "dateOuvert" to activeCaisse.dateOuvert as Any?,
        "dateFerme" to activeCaisse.dateFerme as Any?
      )
    }
    return caisseDetails
  }

  fun setCaisseToPendingClosure(): Caisse {
    val activeCaisse = getCaisseActive() ?: throw CaisseException("Aucune caisse active trouvée.")
    val getCurrentEmploye = employeRepository.findById(userUtils.getCurrentEmployeId()!!.toInt()).get()

    if (activeCaisse?.user == getCurrentEmploye) {
      if (activeCaisse.etat!!.lowercase() == "Ouvert".lowercase()) {
        activeCaisse.etat = "En cours"
        activeCaisse.dateFerme = LocalDateTime.now()
        caisseRepository.save(activeCaisse)
      }
      return caisseRepository.save(activeCaisse)
    } else {
      return caisseRepository.save(activeCaisse)
    }
  }

  @Transactional
  fun cloturerCaisse(fondCaisseFerme: Int, fermetureCaisse: String): CaisseDto {
    val currentUser = userUtils.getCurrentEmployeId()
    val clotureCaisse = getCaisseAttenteCloture()
    val caisseEnCours = getCaisseEnCours()
    val employeCurrentId = userUtils.getCurrentEmployeId()
    var employeCurrent = employeRepository.findById(employeCurrentId!!.toInt()).get()

    val caisseEnCoursCurrentUser =
      caisseRepository.findByUserAndEtatAndSupprimer(employeCurrent, "En cours", 0).firstOrNull()



    if (caisseEnCours != null && caisseEnCoursCurrentUser?.user?.id?.toLong() == currentUser) {
      caisseEnCoursCurrentUser.apply {
        this?.fermetureCaisse = fermetureCaisse
        this?.fondCaisseFerme = fondCaisseFerme.toDouble()
        this?.dateFerme = LocalDateTime.now()
        this?.etat = "Clot"
      }
      val updatedCaisse = caisseRepository.save(caisseEnCoursCurrentUser!!)
      return mapToCaisseDto(updatedCaisse)
    } else {
      throw CaisseException("Unauthorized or no caisse found for closure.")
    }
  }

  @Transactional
  fun mettreCaisseEnAttente(): CaisseDto {
    val currentUser = userUtils.getCurrentEmployeId()
    val caisseActive = getCaisseActive()
    if (caisseActive != null && caisseActive.user?.id?.toLong() == currentUser) {
      caisseActive.apply {
        this.etat = "En cours"
      }
      val updatedCaisse = caisseRepository.save(caisseActive)
      return mapToCaisseDto(updatedCaisse)
    } else {
      throw CaisseException("Unauthorized or no caisse found for closure.")
    }
  }

  @Transactional
  fun ouvrirNouvelleCaisse(caisse: CaisseOuvertureRequestDto): CaisseDto {
    val currentUser = userUtils.getCurrentUser()
    val currentEmployeId = userUtils.getCurrentEmployeId()
    val employeData = employeRepository.findByUser(currentUser!!)
    val caisseActive = getCaisseActive()
    val caisseEnCoursCurrentUser =
      caisseRepository.findByUserAndEtatAndSupprimer(employeData, "En cours", 0).firstOrNull()

    if (caisseActive == null && caisseEnCoursCurrentUser == null) {
      var caisse = Caisse().apply {
        this.user = employeData
        this.fondCaisseOuvert = caisse.fondCaisseOuvert.toDouble() ?: 0.0
        this.ouvertureCaisse = caisse.ouvertureCaisse ?: ""
        this.dateOuvert = LocalDateTime.now()
        this.etat = "Ouvert"
        this.session = genererSessionId()
        this.supprimer = 0
      }
      val updatedCaisse = caisseRepository.save(caisse)
      return mapToCaisseDto(updatedCaisse)
    } else {
      throw CaisseException("Unauthorized or no caisse found for closure.")
    }
  }


  @Transactional
  fun generateCaisseReport(caisseId: Long): Map<String, Any?> {
    val caisse =
      caisseRepository.findById(caisseId.toInt()).orElseThrow { IllegalArgumentException("Caisse not found") }
    var prixTotalEncaissementVente = 0
    var prixTotalFactureEspece = 0
    var prixTotalFactureElectronique = 0
    var prixTotalFactureTicket = 0

    if (facturationRepository.findByCaisse(caisse)!!.size > 0) {
      facturationRepository.findByCaisse(caisse)!!.forEach { facturation ->
        val facturationId = facturation!!.id?.toLong()
        if (facturationId != null) {
          if (factureEspeceRepository.existsByFacturationId(facturationId)) {
            val factureEspece = factureEspeceRepository.findByFacturationId(facturationId)
            prixTotalFactureEspece += factureEspece?.montant ?: 0
          }
          if (factureElectroniqueRepository.existsByFacturationId(facturationId)) {
            val factureElectronique = factureElectroniqueRepository.findByFacturationId(facturationId)
            prixTotalFactureElectronique += factureElectronique?.montant ?: 0
          }
          if (factureTicketRepository.existsByFacturationId(facturationId)) {
            val factureTicket = factureTicketRepository.findByFacturationId(facturationId)
            prixTotalFactureTicket += factureTicket?.montant ?: 0
          }
        }
      }
      prixTotalEncaissementVente = prixTotalFactureTicket + prixTotalFactureEspece + prixTotalFactureElectronique
    }

    val ventes = venteRepository.findByCaisseId(caisseId)
    val bonCaisseGeneres = bonCaisseRepository.findGeneratedByCaisseId(caisseId.toString())
    val bonCaisseEncaisse = bonCaisseRepository.findEncaisseByCaisseId(caisseId.toString())
    val depensesMap = depenseRepository.findByCaisseId(caisseId.toString())!!.map { depense ->
      mapOf(
        "designation" to depense.designation,
        "quantite" to depense.quantite,
        "prixUnitaire" to depense.prixUnitaire,
        "typeDepense" to depense.typeDepense,
      )
    }
    val depenses = depenseRepository.findByCaisseId(caisseId.toString())
    val retourProduitsMap = retourProduitRepository.findByCaisse(caisse).orEmpty().map { retourProduit ->
      var produitRetour = produitRetourRepository.findByRetourProduitId(retourProduit.id!!.toLong())
      mapOf(
        "reference" to retourProduit.vente?.reference,
        "produit" to produitRetour.map { produitRepository.findById(it.concerner!!.produitId!!)!!.get().nom }
          .joinToString { "," },
        "quantite" to produitRetour.sumOf { it.quantite!! },
        "total" to produitRetour.sumOf { it.quantite!! * it.concerner?.prixUnit!! }
      )
    }
    val retourProduits = retourProduitRepository.findByCaisse(caisse).orEmpty()
    val produitRetourList = produitRetourRepository.findByRetourProduitIn(retourProduits).orEmpty()
    var listReduction = mutableListOf<Map<String, Any?>>()
    var prixTotalVenteReduction = 0.0
    var prixTotalVenteCredit = 0.0
    var prixTotalVenteComptant = 0.0
    var prixTotalVenteAssurance = 0.0
    var prixTotalVente = 0
    var prixTotalDetail = 0
    var prixTotalGrossiste = 0
    var prixTotalDetaillant = 0
    var listVenteCredit = mutableListOf<Map<String, Any?>>()
    ventes!!.stream().forEach { vente ->
      if ((vente.reduction?.toInt() ?: 0) > 0) {
        prixTotalVenteReduction += vente.prixTotal ?: 0.0
        listReduction.add(
          mapOf(
            "reductionPrixTotal" to (vente.prixTotal ?: 0.0),
            "reductionDateVente" to vente.dateVente,
            "reductionReduction" to vente.reduction,
            "reductionReference" to vente.reference,
            "reductionId" to vente.id,
          )
        )
      }
      when (vente.etat) {
        "Crédit" -> {
          listVenteCredit.add(
            mapOf(
              "reference" to vente.reference,
              "prixTotal" to vente.prixTotal,
              "id" to vente.id,
              "prixPercu" to vente.prixPercu,
              "dateVente" to vente.dateVente,
              "client" to vente.user?.nom,
            )
          )
          prixTotalVenteCredit += vente.prixTotal!!
        }

        "Comptant" -> {
          prixTotalVenteComptant += vente.prixTotal!!
        }

        "Assurance" -> {
          prixTotalVenteAssurance += vente.prixTotal!!
        }

        else -> {

        }
      }
      val concernerList = concernerRepository.findByVenteId(vente.id!!.toLong())
      concernerList.stream().forEach { concerne ->
        var enRayon = enRayonRepository.findById(concerne!!.enRayonId!!).get()
        when (enRayon.fournisseur?.statut) {
          "Grossiste" -> {
            prixTotalGrossiste += (concerne?.prixUnit!! * concerne?.quantite!!)
          }

          "Detaillant" -> {
            prixTotalDetaillant += (concerne?.prixUnit!! * concerne?.quantite!!)
          }

          else -> {
            prixTotalDetail += (concerne?.prixUnit!! * concerne?.quantite!!)
          }
        }
      }
    }
    prixTotalVente = prixTotalDetail + prixTotalDetaillant + prixTotalGrossiste
    val totalVenteComptant = ventes!!.filter { it.etat == "COMPTANT" }.sumOf { it.prixTotal ?: 0.0 }
    val totalVenteCredit = ventes!!.filter { it.etat == "CREDIT" }.sumOf { it.prixTotal ?: 0.0 }
    val totalVenteAssurance = ventes!!.filter { it.etat == "ASSURANCE" }.sumOf { it.prixTotal ?: 0.0 }

    val totalBonCaisseGeneres = bonCaisseGeneres!!.sumOf { it.montant ?: 0 }
    val totalBonCaisseEncaisse = bonCaisseEncaisse!!.sumOf { it.montant ?: 0 }
    val totalDepenses = depenses!!.sumOf { (it.quantite ?: 0) * (it.prixUnitaire ?: 0) }
    val totalRetourProduits = produitRetourList.sumOf { it.quantite ?: 0 }

    val montantSystem =
      totalVenteComptant + totalBonCaisseGeneres - totalBonCaisseEncaisse - totalDepenses - totalRetourProduits
    val difference = caisse.fondCaisseFerme ?: 0!!.minus(montantSystem) ?: 0.0

    var dataFermeture = caisse.fermetureCaisse

    val resultat = mutableListOf<Int>()

    var totalCaisseEspece = 0
    var totalCaisseElectronique = 0
    var totalCaisseTicket = 0
    // On saute la première ligne (index == 0)
    if (dataFermeture != null) {
      val lignes = dataFermeture!!.split("|")
      for ((index, ligne) in lignes.withIndex()) {
        when (index) {
          0 -> {
            val valeurs = ligne.split("-")


            for ((i, valeurStr) in valeurs.withIndex()) {
              val valeur = valeurStr.toIntOrNull() ?: 0
              val montant = when (i) {
                0 -> valeur * 25
                1 -> valeur * 50
                2 -> valeur * 100
                3 -> valeur * 500
                4 -> valeur * 10
                5 -> valeur * 500
                6 -> valeur * 1000
                7 -> valeur * 2000
                8 -> valeur * 5000
                9 -> valeur * 10000
                else -> 0
              }
              totalCaisseEspece += montant
            }
            resultat.add(totalCaisseEspece)
          }

          1 -> {
            totalCaisseElectronique = ligne.toInt()
          }

          2 -> {
            totalCaisseTicket = ligne.toInt()
          }
        }

      }
    }

    var soldeReelEspece = totalCaisseEspece
    var soldeReelElectronique = totalCaisseElectronique
    var soldeReelTicket = totalCaisseTicket

    var soldeSystemeEspece = prixTotalFactureEspece
    var soldeSystemeElectronique = prixTotalFactureElectronique
    var soldeSystemeTicket = prixTotalFactureTicket

    var soldeReelTotal = soldeReelEspece + soldeReelElectronique + soldeReelTicket
    var soldeSystemelTotal = soldeSystemeEspece + soldeSystemeElectronique + soldeSystemeTicket



    return mapOf(
      "ventes" to ventes,
      "bonCaisseGeneres" to bonCaisseGeneres,
      "bonCaisseEncaisse" to bonCaisseEncaisse,
      "depenses" to depensesMap,
      "encaissementFactureData" to listVenteCredit,
      "retourProduits" to retourProduitsMap,
      "produitRetourList" to produitRetourList,
      "listReduction" to listReduction,
      "totalVenteComptant" to totalVenteComptant,
      "totalVenteCredit" to totalVenteCredit,
      "totalVenteAssurance" to totalVenteAssurance,
      "totalBonCaisseGeneres" to totalBonCaisseGeneres,
      "totalBonCaisseEncaisse" to totalBonCaisseEncaisse,
      "totalDepenses" to totalDepenses,
      "totalRetourProduits" to totalRetourProduits,
      "montantSystem" to montantSystem,
      "difference" to difference,
      "caisse" to caisse,
      "prixTotalEncaissementVente" to prixTotalEncaissementVente,
      "prixTotalGrossiste" to prixTotalGrossiste,
      "prixTotalDetaillant" to prixTotalDetaillant,
      "prixTotalDetail" to prixTotalDetail,
      "prixTotalVente" to prixTotalVente,
      "prixTotalVenteCredit" to prixTotalVenteCredit,
      "prixTotalVenteComptant" to prixTotalVenteComptant,
      "prixTotalVenteAssurance" to prixTotalVenteAssurance,
      "soldeReelEspece" to soldeReelEspece,
      "soldeReelElectronique" to soldeReelElectronique,
      "soldeReelTicket" to soldeReelTicket,
      "soldeSystemeEspece" to soldeSystemeEspece,
      "soldeSystemeElectronique" to soldeSystemeElectronique,
      "soldeSystemeTicket" to soldeSystemeTicket,
      "soldeReelTotal" to soldeReelTotal,
      "soldeSystemelTotal" to soldeSystemelTotal,
    )
  }

  fun getAllCaisses(pageable: PageRequest): Page<Map<String, Any?>> {
    val caisses = caisseRepository.findAll(pageable)
    return caisses.map { caisse ->
      mapOf(
        "id" to caisse.id,
        "etat" to caisse.etat,
        "nomEmploye" to (caisse.user?.user?.nom ?: "Inconnu"),
        "dateOuvert" to caisse.dateOuvert,
        "dateFerme" to caisse.dateFerme
      )
    }
  }

  fun getFilteredCaisses(
    caisseId: Long?,
    startDate: String?,
    endDate: String?,
    pageable: Pageable
  ): Page<Map<String, Any?>> {
    val start = startDate?.let { LocalDate.parse(it) }
    val end = endDate?.let { LocalDate.parse(it) }
    val specification = CaisseRepository.filterByCriteria(caisseId, start, end)
    val caisses = caisseRepository.findAll(specification, pageable)
    return caisses.map { caisse ->
      mapOf(
        "id" to caisse.id,
        "etat" to caisse.etat,
        "nomEmploye" to (caisse.user?.user?.nom ?: "Inconnu"),
        "dateOuvert" to caisse.dateOuvert,
        "dateFerme" to caisse.dateFerme
      )
    }
  }
}

// Définir une exception personnalisée
class CaisseException(message: String) : RuntimeException(message)
