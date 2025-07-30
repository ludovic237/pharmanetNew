package com.example.backend.services

import com.example.backend.controllers.EmployeDto
import com.example.backend.controllers.RegisterRequest
import com.example.backend.dtos.EmployeNewDto
import com.example.backend.models.Employe
import com.example.backend.models.User
import com.example.backend.repositories.EmployeRepository
import com.example.backend.repositories.UserRepository
import org.springframework.http.ResponseEntity
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import java.time.LocalDateTime
import java.util.*

@Service
class EmployeService(
  private val passwordEncoder: PasswordEncoder, // Injected here
  private val employeRepository: EmployeRepository,
  private val userRepository: UserRepository,
) {

  fun createEmployee(registerRequest: RegisterRequest, employe: EmployeDto): Employe {
    if (userRepository.existsByEmail(registerRequest.email)) {
      return null ?: throw IllegalArgumentException("Email already exists")
    }

    // Create a new user
    var user = User().apply {
      nom = registerRequest.firstName
      prenom = registerRequest.lastName
      telephone = registerRequest.phone
      email = registerRequest.email
//      registrationDate = LocalDateTime.now()
//      createdDate = LocalDateTime.now()
//      updatedDate = LocalDateTime.now()
//      username = registerRequest.email
      supprimer = 0
//      password = passwordEncoder.encode(registerRequest.password)
      fonction = registerRequest.role // Initialize and set a default role
    }

    println("Registering user: $user")
    println(passwordEncoder.encode(registerRequest.password))
    // Save the user
    user = userRepository.save(user)
    var employe = Employe().apply {
      password = passwordEncoder.encode(registerRequest.password)
      this.user = user
      identifiant = employe.identifiant
    }
    return employeRepository.save(employe)
  }

  fun getAllEmployees(): List<Employe> {
    return employeRepository.findAllBySupprimerEquals()
  }

  fun getEmployeeById(id: Long): Optional<Employe> {
    return employeRepository.findById(id.toInt())
  }

  fun updateEmployee(id: Long, updatedEmploye: EmployeNewDto): Employe {
    if (id== 0.0.toLong()){
      var user = userRepository.findById(updatedEmploye.user!!.toInt()).get()
      var employe = Employe().apply {
        this.identifiant = updatedEmploye.identifiant
        this.password = updatedEmploye.password
        this.codebarreId = updatedEmploye.codebarreId
        this.type = updatedEmploye.type
        this.user = user
        this.etat = updatedEmploye.etat
        this.faireReductionMax = updatedEmploye.faireReductionMax!!.toInt()
        this.faireReductionMax = updatedEmploye.faireReductionMax.toInt()
        this.supprimer = 0
      }
      return employeRepository.save(employe)
    }
    else {
      val existingEmploye = employeRepository.findById(id.toInt())
        .orElseThrow { IllegalArgumentException("Employee not found with ID: $id") }
      var user = userRepository.findById(updatedEmploye.user!!.toInt()).get()
      existingEmploye.identifiant = updatedEmploye.identifiant
      existingEmploye.password = updatedEmploye.password
      existingEmploye.codebarreId = updatedEmploye.codebarreId
      existingEmploye.type = updatedEmploye.type
      existingEmploye.user = user
      existingEmploye.etat = updatedEmploye.etat
      existingEmploye.faireReductionMax = updatedEmploye.faireReductionMax!!.toInt()
      existingEmploye.faireReductionMax = updatedEmploye.faireReductionMax.toInt()
      existingEmploye.supprimer = 0
      return employeRepository.save(existingEmploye)
    }

  }

  fun deleteEmployee(id: Long) {
    if (!employeRepository.existsById(id.toInt())) {
      throw IllegalArgumentException("Employee not found with ID: $id")
    }
//    employeRepository.deleteById(id.toInt())
    var employe = employeRepository.findById(id.toInt()).get()
    employe.supprimer=1
    employeRepository.save(employe)
  }
}
