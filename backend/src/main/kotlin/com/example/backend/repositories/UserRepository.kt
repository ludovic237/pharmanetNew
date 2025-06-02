package com.example.backend.repositories

import com.example.backend.models.User
import org.springframework.data.jpa.repository.JpaRepository
import java.util.Optional

interface UserRepository : JpaRepository<User, Long> {
  fun findByEmail(email: String): User
  fun existsByUsername(email: String): Boolean
  fun existsByEmail(email: String): Boolean
  fun findByUsername(username: String): Optional<User>
}
