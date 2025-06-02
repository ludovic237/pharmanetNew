package com.example.backend.controllers

import com.example.backend.config.SecurityConfig
import com.example.backend.models.User
import com.example.backend.repositories.UserRepository
import com.example.backend.services.CustomUserDetailsService
import com.example.backend.utility.JwtUtil
import org.springframework.http.ResponseEntity
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.Authentication
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.crypto.password.PasswordEncoder

import org.springframework.web.bind.annotation.*
import java.time.LocalDateTime
import java.util.*
import kotlin.math.log


@RestController
@RequestMapping("/api/auth")
class AuthController(
  private var authenticationManager: AuthenticationManager? = null,
  private var jwtUtil: JwtUtil,
  var userRepository: UserRepository,
  var securityConfig: SecurityConfig,
  private val userDetailsService: CustomUserDetailsService,
  private val passwordEncoder: PasswordEncoder // Injected here
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
      val authentication: Authentication = authenticationManager!!.authenticate(
        UsernamePasswordAuthenticationToken(loginRequest.username, loginRequest.password)
      )
      println("Authentication successful: $authentication")
      SecurityContextHolder.getContext().authentication = authentication

      val token = jwtUtil.generateToken(authentication)
      println("Generated token: $token")
      ResponseEntity.ok(
        mapOf(
          "message" to "Login successful",
          "token" to token
        )
      )
    } catch (ex: Exception) {
      ResponseEntity.badRequest().body(
        mapOf("message" to "Login failed: Invalid email or password")
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
    return ResponseEntity.ok("Logout successful")
  }

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PostMapping("/register")
  fun register(@RequestBody registerRequest: RegisterRequest): ResponseEntity<*> {
    // Check if the username already exists
    if (userRepository.existsByEmail(registerRequest.email)) {
      return ResponseEntity.badRequest().body("Username is already taken")
    }

    // Create a new user
    val user = User().apply {
      firstName = registerRequest.firstName
      lastName = registerRequest.lastName
      phone = registerRequest.phone
      email = registerRequest.email
      registrationDate = LocalDateTime.now()
      createdDate = LocalDateTime.now()
      updatedDate = LocalDateTime.now()
      username = registerRequest.email
      password = passwordEncoder.encode(registerRequest.password)
      role = registerRequest.role // Initialize and set a default role
    }

    println("Registering user: $user")
    println(passwordEncoder.encode(registerRequest.password))
    println(user.password)
    println(user.toString())
    // Save the user
    userRepository.save(user)

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
