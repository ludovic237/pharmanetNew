package com.example.backend.services

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
    return userRepository.findById(id)
  }

  fun createUser(user: User): User {
    user.createdDate = LocalDateTime.now()
    return userRepository.save(user)
  }

  fun updateUser(id: Long, updatedUser: User): User {
    val existingUser = userRepository.findById(id)
      .orElseThrow { IllegalArgumentException("User with ID $id not found") }

//    println("updatedUser");
//    println(updatedUser.phone);
//    existingUser.firstName = updatedUser.firstName
//    existingUser.lastName = updatedUser.lastName
//    existingUser.email = updatedUser.email
    // Update other fields as necessary

    updatedUser.joinedDate = Date().toInstant();
    updatedUser.updatedDate = LocalDateTime.now();

    return userRepository.save(updatedUser)
  }

  fun deleteUser(id: Long) {
    if (!userRepository.existsById(id)) {
      throw IllegalArgumentException("User with ID $id not found")
    }
    userRepository.deleteById(id)
  }

  fun getCurrentUser(): User? {
    val auth = SecurityContextHolder.getContext().authentication
    val username = when (val principal = auth?.principal) {
      is UserDetails -> principal.username
      is String -> principal
      else -> null
    }
    return username?.let { userRepository.findByUsername(it).orElse(null) }
  }
}
