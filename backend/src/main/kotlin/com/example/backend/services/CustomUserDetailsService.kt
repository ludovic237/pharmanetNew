package com.example.backend.services

import com.example.backend.repositories.EmployeRepository
import com.example.backend.repositories.UserRepository
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.userdetails.User
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.stereotype.Service
import java.util.*

@Service
class CustomUserDetailsService(
  private val userRepository: UserRepository,
  private val employeRepository: EmployeRepository
) : UserDetailsService {

//  override fun loadUserByUsername(username: String): UserDetails {
//    val user = userRepository.findByUsername(username)
//      .orElseThrow { UsernameNotFoundException("User not found with username: $username") }
//
//    return User(
//      user.username,
//      user.password,
//      user.role!!.map { SimpleGrantedAuthority(it.toString()) }
//    )
//  }


  override fun loadUserByUsername(email: String): UserDetails {
    var employe = employeRepository.findByIdentifiant(email)
      ?: throw UsernameNotFoundException("Employe not found with email: $email")
    val user = employe.user
    return User(
      employe.identifiant!!,
      employe.password!!,
      user!!.fonction!!.map { SimpleGrantedAuthority(it.toString()) }
    )

  }

}
