package com.example.backend.utility

import com.example.backend.models.User // Your entity
import com.example.backend.repositories.UserRepository // Import UserRepository
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.core.userdetails.UserDetails // Import UserDetails
import org.springframework.stereotype.Component

@Component
class UserUtils(
  private val userRepository: UserRepository // Inject UserRepository
) {

  fun getCurrentUserId(): Long? {
    val authentication = SecurityContextHolder.getContext().authentication
    println("getCurrentUserId authentication: $authentication") // Keep for debugging if needed

    if (authentication != null && authentication.isAuthenticated) {
      val principal = authentication.principal
      println("Principal type: ${principal?.javaClass?.name}") // Debug: See the actual type

      // The principal is usually UserDetails after standard authentication
      if (principal is UserDetails) {
        val username = principal.username // This holds the email you used for login
        println("Username from principal: $username")

        // Fetch your custom User entity using the email (username)
        val user:User = userRepository.findByEmail(username)

        if (user.id != null) {
          println("User found in DB: ID = ${user.id}")
          return user.id
        } else {
          println("User not found in DB for email: $username")
          // This case should ideally not happen if the user is authenticated,
          // but good to handle defensively.
          return null
        }
      } else if (principal is String && principal == "anonymousUser") {
        println("Principal is anonymousUser")
        return null // Explicitly handle anonymous user
      } else {
        println("Principal is not an instance of UserDetails. Actual principal: $principal")
        // Handle other principal types if necessary, or return null/throw exception
        return null
      }
    } else {
      println("Authentication is null or not authenticated.")
      return null
    }
  }
}
