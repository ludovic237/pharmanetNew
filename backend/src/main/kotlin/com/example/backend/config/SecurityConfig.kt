package com.example.backend.config


import com.example.backend.services.CustomUserDetailsService
import com.example.backend.utility.JwtAuthenticationFilter
import com.example.backend.utility.JwtUtil
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter
import org.springframework.web.filter.OncePerRequestFilter

@Configuration
class SecurityConfig(
  private val customUserDetailsService: CustomUserDetailsService,
  private val jwtUtil: JwtUtil,
) {

  @Bean
  fun passwordEncoder(): PasswordEncoder {
    return BCryptPasswordEncoder()
  }

  @Bean
  fun authenticationManager(authConfig: AuthenticationConfiguration): AuthenticationManager {
    return authConfig.authenticationManager
  }

  @Bean
  fun securityFilterChain(http: HttpSecurity): SecurityFilterChain {
    return http
      .cors { }
      .csrf { it.disable() }
      .authorizeHttpRequests {
        it.requestMatchers("/api/auth/**").permitAll()
//          .requestMatchers("/api/admin/**").authenticated()
          .requestMatchers("/api/**").authenticated()
          .anyRequest().permitAll()
      }
      .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter::class.java)
      .build()
  }

  @Bean
  fun jwtAuthenticationFilter(): JwtAuthenticationFilter {
    return JwtAuthenticationFilter(jwtUtil, customUserDetailsService)
  }

}

