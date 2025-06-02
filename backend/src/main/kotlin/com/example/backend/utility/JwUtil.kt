package com.example.backend.utility


import io.jsonwebtoken.Jwts
import io.jsonwebtoken.SignatureAlgorithm
import io.jsonwebtoken.security.Keys
import org.springframework.security.core.Authentication
import org.springframework.stereotype.Component
import java.util.*
import javax.crypto.spec.SecretKeySpec
import java.nio.charset.StandardCharsets
import java.security.Key

@Component
class JwtUtil {

  private val key: Key = Keys.secretKeyFor(SignatureAlgorithm.HS512) // Génère une clé sécurisée

  fun generateToken(authentication: Authentication): String {
    val username = authentication.name
    val now = Date()
    val expiryDate = Date(now.time + 3600000) // 1 heure de validité

    return Jwts.builder()
      .setSubject(username)
      .setIssuedAt(now)
      .setExpiration(expiryDate)
      .signWith(key, SignatureAlgorithm.HS512)
      .compact()
  }

  fun validateToken(token: String): Boolean {
    try {
      Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token)
      return true
    } catch (e: Exception) {
      e.printStackTrace()
      return false
    }
  }

  fun getUsernameFromToken(token: String): String {
      val claims = Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).body
      return claims.subject
  }
}
