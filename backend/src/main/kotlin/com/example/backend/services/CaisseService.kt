package com.example.backend.services

import com.example.backend.dtos.CaisseDto
import com.example.backend.dtos.CaisseOuvertureRequestDto
import com.example.backend.models.Caisse
import com.example.backend.repositories.CaisseRepository
import com.example.backend.repositories.EmployeRepository
import com.example.backend.utility.UserUtils
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime
import java.util.*

@Service
class CaisseService(
  private val caisseRepository: CaisseRepository,
  private val employeRepository: EmployeRepository,
  private val userUtils: UserUtils
) {

  @Transactional
  fun ouvrirCaisse(requestDto: CaisseOuvertureRequestDto): CaisseDto {
    val currentUser = userUtils.getCurrentUser()
      ?: throw CaisseException("Impossible de récupérer l'utilisateur connecté.")

    var employeData = employeRepository.findByUser(currentUser)

    // Vérification des sessions existantes (selon BPMN Gateway_0zgca5r)
    // 1. Y a-t-il une caisse OUVERTE par N'IMPORTE QUI ?
    val caissesOuvertesGlobal = caisseRepository.findByEtatAndSupprimer(Caisse.ETAT_OUVERT)
    if (caissesOuvertesGlobal.isNotEmpty()) {
      val caisseOuverte = caissesOuvertesGlobal.first()
      if (caisseOuverte.employe?.id != employeData.id) {
        throw CaisseException("Une caisse (ID: ${caisseOuverte.id}, Session: ${caisseOuverte.session}) est déjà ouverte par l'employé ${caisseOuverte.employe?.identifiant ?: "inconnu"}.")
      } else {
        throw CaisseException("Vous avez déjà une caisse ouverte (ID: ${caisseOuverte.id}, Session: ${caisseOuverte.session}).")
      }
    }

    // 2. L'employé actuel a-t-il une caisse en "CLOTURE_EN_ATTENTE" ?
    caisseRepository.findByEmployeAndEtatAndSupprimer(employeData, Caisse.ETAT_CLOTURE_EN_ATTENTE)
      .ifPresent {
        throw CaisseException("Vous avez une caisse (ID: ${it.id}, Session: ${it.session}) en attente de clôture. Veuillez la finaliser.")
      }

    // Si on arrive ici, l'employé peut ouvrir une nouvelle caisse (correspond à la branche "fermer" du BPMN)
    var nouvelleCaisse = Caisse().apply {
      employe = employeData
      fondCaisseOuvert = requestDto.fondCaisseOuvert.toDouble()
      dateOuvert = LocalDateTime.now()
      session = genererSessionId() // "Création de la session de caisse"
      etat = Caisse.ETAT_OUVERT    // "avec statut ouverte"
      supprimer = 0
    }

    val savedCaisse = caisseRepository.save(nouvelleCaisse)
    return mapToCaisseDto(savedCaisse)
  }

  private fun genererSessionId(): String {
    // Ge un identifiant de session simple, vous pouvez le rendre plus complexe
    return "SESS-${LocalDateTime.now().year}${LocalDateTime.now().monthValue}${LocalDateTime.now().dayOfMonth}-${UUID.randomUUID().toString().substring(0, 8).uppercase()}"
  }

  private fun mapToCaisseDto(caisse: Caisse): CaisseDto {
    return CaisseDto(
      id = caisse.id,
      employeId = caisse.employe?.id,
      employeNom = "${caisse.employe?.user?.prenom ?: ""} ${caisse.employe?.user?.nom ?: ""}".trim(),
      dateOuvert = caisse.dateOuvert,
      dateFerme = caisse.dateFerme,
      session = caisse.session,
      fondCaisseOuvert = caisse.fondCaisseOuvert!!.toBigDecimal(),
      fondCaisseFerme = caisse.fondCaisseFerme!!.toBigDecimal(),
      etat = caisse.etat
    )
  }

  // TODO: Implémenter la logique pour les autres opérations (fermerCaisse, enregistrerVente, enregistrerDepense, etc.)
}

// Définir une exception personnalisée
class CaisseException(message: String) : RuntimeException(message)
