package com.example.backend.utility

import com.example.backend.repositories.EmployeRepository
import com.example.backend.services.CustomUserDetailsService
import com.example.backend.utility.JwtUtil
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.web.filter.OncePerRequestFilter

class JwtAuthenticationFilter(
  private val jwtUtil: JwtUtil,
  private val employeRepository: EmployeRepository,
  private val userDetailsService: CustomUserDetailsService
) : OncePerRequestFilter() {

  override fun doFilterInternal(
    request: HttpServletRequest,
    response: HttpServletResponse,
    filterChain: FilterChain
  ) {
    val token = extractToken(request)
    if (token != null && jwtUtil.validateToken(token)) {
      val username = jwtUtil.getUsernameFromToken(token)
//      val userDetails: UserDetails = userDetailsService.loadUserByUsername(username)
      val employe = employeRepository.findByIdentifiant(username)
        ?: throw UsernameNotFoundException("Employe not found with email: $username")
      val authentication = UsernamePasswordAuthenticationToken(employe, null, employe.type!!.map { SimpleGrantedAuthority(it.toString()) })
      SecurityContextHolder.getContext().authentication = authentication
    }
    filterChain.doFilter(request, response)
  }

  private fun extractToken(request: HttpServletRequest): String? {
    val bearerToken = request.getHeader("Authorization")
    return if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
      bearerToken.substring(7)
    } else null
  }
}
