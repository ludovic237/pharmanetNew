package com.example.backend.services

import com.example.backend.dtos.UserNewDto
import com.example.backend.models.Employe
import com.example.backend.models.User
import com.example.backend.repositories.UserRepository
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.stereotype.Service
import java.time.LocalDateTime
import java.util.*

@Service
class UserService(
  private val userRepository: UserRepository
) {

  fun getAllUsers(): List<User> {
    return userRepository.findAll()
  }

  fun getUserById(id: Long): Optional<User> {
    return userRepository.findById(id.toInt())
  }

  fun createUser(user: User): User {
//    user.createdDate = LocalDateTime.now()
    return userRepository.save(user)
  }

  fun updateUser(id: Long, updatedUser: UserNewDto): User {

    if (id== 0.0.toLong()){
      var user = User().apply {
        this.nom = updatedUser.nom
        this.prenom = updatedUser.prenom
        this.email = updatedUser.email
        this.password = null
        this.username = null
        this.fonction = null
        this.role = null
        this.telephone = updatedUser.telephone
        this.reduction = updatedUser.reduction!!.toInt()
        this.reductionMax = updatedUser.reductionMax!!.toInt()
        this. supprimer = 0
      }
      return userRepository.save(user)
    }
    else {
      val existingUser = userRepository.findById(id.toInt())
        .orElseThrow { IllegalArgumentException("User with ID $id not found") }
      existingUser.nom = updatedUser.nom
      existingUser.prenom = updatedUser.prenom
      existingUser.email = updatedUser.email
      existingUser.password = null
      existingUser.username = null
      existingUser.fonction = null
      existingUser.role = null
      existingUser.telephone = updatedUser.telephone
      existingUser.reduction = updatedUser.reduction!!.toInt()
      existingUser.reductionMax = updatedUser.reductionMax!!.toInt()
      existingUser. supprimer = 0
      return userRepository.save(existingUser)
    }

  }

  fun deleteUser(id: Long) {
    if (!userRepository.existsById(id.toInt())) {
      throw IllegalArgumentException("User with ID $id not found")
    }
//    userRepository.deleteById(id.toInt())
    var user = userRepository.findById(id.toInt()).get()
    user.supprimer=1
    userRepository.save(user)
  }


  fun getCurrentUser(): User? {
    val auth = SecurityContextHolder.getContext().authentication
    val username = when (val principal = auth?.principal) {
      is UserDetails -> principal.username
      is String -> principal
      else -> null
    }
    return username?.let { userRepository.findByEmail(it) }
  }
}
