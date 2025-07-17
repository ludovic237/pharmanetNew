package com.example.backend.repositories

import com.example.backend.models.User
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.Optional


interface UserRepository : JpaRepository<User, Int> {
  fun findByEmail(email: String): User
//  fun existsByUsername(email: String): Boolean
  fun existsByEmail(email: String): Boolean
//  fun findByUsername(username: String): Optional<User>
}
