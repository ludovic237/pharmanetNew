package com.example.backend.services

import com.example.backend.controllers.EmployeDto
import com.example.backend.controllers.RegisterRequest
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
      registrationDate = LocalDateTime.now()
      createdDate = LocalDateTime.now()
      updatedDate = LocalDateTime.now()
      username = registerRequest.email
      supprimer = 0
      password = passwordEncoder.encode(registerRequest.password)
      role = registerRequest.role // Initialize and set a default role
    }

    println("Registering user: $user")
    println(passwordEncoder.encode(registerRequest.password))
    println(user.password)
    println(user.toString())
    // Save the user
    user = userRepository.save(user)
    var employe = Employe().apply {
      this.user = user
      identifiant = employe.identifiant
    }
    return employeRepository.save(employe)
  }

  fun getAllEmployees(): List<Employe> {
    return employeRepository.findAll()
  }

  fun getEmployeeById(id: Long): Optional<Employe> {
    return employeRepository.findById(id.toInt())
  }

//  fun updateEmployee(id: Long, updatedEmploye: Employe): Employe {
//    val existingEmploye = employeRepository.findById(id.toInt())
//      .orElseThrow { IllegalArgumentException("Employee not found with ID: $id") }
//    val employeToUpdate = existingEmploye.copy(
//      name = updatedEmploye.name,
//      position = updatedEmploye.position,
//      salary = updatedEmploye.salary
//    )
//    return employeRepository.save(employeToUpdate)
//  }

  fun deleteEmployee(id: Long) {
    if (!employeRepository.existsById(id.toInt())) {
      throw IllegalArgumentException("Employee not found with ID: $id")
    }
    employeRepository.deleteById(id.toInt())
  }
}
