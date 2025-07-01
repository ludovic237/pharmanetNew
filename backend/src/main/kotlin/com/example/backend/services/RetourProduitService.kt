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
class RetourProduitService(
  private val enRayonRepository: EnRayonRepository,
  private val concernerRepository: ConcernerRepository,
  private val prescripteurRepository: PrescripteurRepository,
  private val bonCaisseRepository: BonCaisseRepository,
  private val userRepository: UserRepository,
  private val venteRepository: VenteRepository,
  private val caisseRepository: CaisseRepository,
  private val produitRepository: ProduitRepository,
  private val facturationRepository: FacturationRepository,
  private val factureEspeceRepository: FactureEspeceRepository,
  private val retourProduitRepository: RetourProduitRepository,
  private val produitRetourRepository: ProduitRetourRepository,
  private val factureElectroniqueRepository: FactureElectroniqueRepository,
  private val factureTicketRepository: FactureTicketRepository,
  private val employeRepository: EmployeRepository,
  private val userUtils: UserUtils,
  private val rayonRepository: RayonRepository
) {

@Transactional
fun listerRetourProduitsAvecDetails(pageable: Pageable): Page<Map<String, Any?>> {
    return retourProduitRepository.findAll(pageable).map { retourProduit ->
        val produitsRetournes = produitRetourRepository.findByRetourProduitId(retourProduit.id!!.toLong())
        val quantiteTotalRetour = produitsRetournes.sumOf { it.quantite ?: 0 }
        val quantiteTotalRetourPrix = produitsRetournes.sumOf { (it.quantite ?: 0) * (it.concerner?.prixUnit ?: 0) }

        mapOf(
            "idRetour" to retourProduit.id,
            "caisseId" to retourProduit.caisse!!.id,
            "caissier" to retourProduit.caisse!!.employe!!.user!!.nom + " " + retourProduit.caisse!!.employe!!.user!!.prenom,
            "dateRetour" to retourProduit.dateRetour,
            "nomEmploye" to retourProduit.employe!!.user!!.nom + " " + retourProduit.employe!!.user!!.prenom,
            "venteReference" to retourProduit.vente!!.reference,
            "quantiteTotalRetour" to quantiteTotalRetour,
            "quantiteTotalRetourPrix" to quantiteTotalRetourPrix,
            "produitsRetournes" to produitsRetournes.map { produitRetour ->
                mapOf(
                    "produitId" to produitRetour.concerner!!.produit!!.id,
                    "nomProduit" to produitRetour.concerner!!.produit!!.nom,
                    "quantiteRetournee" to produitRetour.quantite,
                    "prixUnit" to produitRetour.concerner!!.prixUnit
                )
            }
        )
    }
}

}
