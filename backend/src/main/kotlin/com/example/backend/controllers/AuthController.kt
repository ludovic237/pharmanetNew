package com.example.backend.controllers

import com.example.backend.config.SecurityConfig
import com.example.backend.models.Employe
import com.example.backend.models.User
import com.example.backend.repositories.EmployeRepository
import com.example.backend.repositories.UserRepository
import com.example.backend.services.CustomUserDetailsService
import com.example.backend.utility.JwtUtil
import com.example.backend.utility.UserUtils
import org.springframework.http.ResponseEntity
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.Authentication
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.crypto.password.PasswordEncoder

import org.springframework.web.bind.annotation.*
import java.util.*


@RestController
@RequestMapping("/api/auth")
class AuthController(
  private var authenticationManager: AuthenticationManager? = null,
  private var jwtUtil: JwtUtil,
  var userRepository: UserRepository,
  var securityConfig: SecurityConfig,
  var userUtils: UserUtils,
  private val userDetailsService: CustomUserDetailsService,
  private val passwordEncoder: PasswordEncoder, // Injected here
  private val employeRepository: EmployeRepository
) {

  fun AuthController(authenticationManager: AuthenticationManager) {
    this.authenticationManager = authenticationManager
  }

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PostMapping("/login")
 fun login(@RequestBody loginRequest: LoginRequest): ResponseEntity<*> {
    if (loginRequest.username.isEmpty() || loginRequest.password.isEmpty()) {
      return ResponseEntity.badRequest().body(
        mapOf("message" to "Email and password must not be empty")
      )
    }
    println("Login request: $loginRequest")
    return try {
      // Rechercher l'employé par identifiant
      val employe = employeRepository.findByIdentifiant(loginRequest.username)
        ?: return ResponseEntity.badRequest().body(
          mapOf("message" to "Login failed: Invalid username or password")
        )

      // Vérifier le mot de passe
//      if (!passwordEncoder.matches(loginRequest.password, employe.password)) {
//        return ResponseEntity.badRequest().body(
//          mapOf("message" to "Login failed: Invalid username or password")
//        )
//      }

      // Générer le token JWT
      val authentication = UsernamePasswordAuthenticationToken(employe.identifiant, null, emptyList())
      SecurityContextHolder.getContext().authentication = authentication
      val token = jwtUtil.generateToken(authentication)

      println("Generated token: $token")
      ResponseEntity.ok(
        mapOf(
          "message" to "Login successful",
          "token" to token,
          "nom" to "${employe.user?.nom ?: "Unknown"} ${employe.user?.prenom ?: ""}"
        )
      )
    } catch (ex: Exception) {
      ResponseEntity.badRequest().body(
        mapOf("message" to "Login failed: An error occurred")
      )
    }
  }
//  fun login(@RequestBody request: AuthenticationRequest): AuthenticationResponse {
//    authenticationManager!!.authenticate(
//      UsernamePasswordAuthenticationToken(request.username, request.password)
//    )
//    val userDetails = userDetailsService.loadUserByUsername(request.username)
//    println("userDetails")
//    println(userDetails)
//    val jwt = jwtService.generateToken(userDetails)
//    return AuthenticationResponse(jwt)
//  }

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PostMapping("/logout")
  fun logout(): ResponseEntity<*> {
    SecurityContextHolder.clearContext()
    return ResponseEntity.ok(mapOf("message" to "Logout successful"))
  }

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PostMapping("/register")
  fun register(@RequestBody registerRequest: RegisterRequest): ResponseEntity<*> {
    // Check if the username already exists
    if (userRepository.existsByEmail(registerRequest.email)) {
      return ResponseEntity.badRequest().body("Username is already taken")
    }

    // Create a new user
    var user = User().apply {
      nom = registerRequest.firstName
      prenom = registerRequest.lastName
      telephone = registerRequest.phone
      email = registerRequest.email
      fonction = registerRequest.role
      supprimer = 0
    }

    user = userRepository.save(user)

    var employee = Employe().apply {
      this.user = user
      this.identifiant = registerRequest.email
      this.codebarreId = "0"
      this.supprimer = 0
      this.password = passwordEncoder.encode(registerRequest.password)
    }
    employee = employeRepository.save(employee)


    return ResponseEntity.ok(mapOf("message" to "User registered successfully"))
  }
}

data class LoginRequest(
  val username: String,
  val password: String
)

data class RegisterRequest(
  val firstName: String,
  val lastName: String,
  val role: String,
  val phone: String,
  val email: String,
  val password: String,
)

data class AuthenticationRequest(
  val username: String,
  val password: String
)

data class AuthenticationResponse(
  val jwt: String
)
