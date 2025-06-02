package com.example.backend.controllers

import com.example.backend.models.User
import com.example.backend.services.UserService
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/admin/users")
class UserController(
  private val userService: UserService
) {

@CrossOrigin(origins = ["http://localhost:4200"])
@PreAuthorize("isAuthenticated()")
@GetMapping
fun getAllUsers(): ResponseEntity<List<User>> {
    return ResponseEntity.ok(userService.getAllUsers())
}

  @CrossOrigin(origins = ["http://localhost:4200"])
@PreAuthorize("isAuthenticated()")
  @GetMapping("/{id}")
  fun getUserById(@PathVariable id: Long): ResponseEntity<User> {
    return ResponseEntity.ok(userService.getUserById(id).orElseThrow { IllegalArgumentException("User not found") })
  }

  @CrossOrigin(origins = ["http://localhost:4200"])
@PreAuthorize("isAuthenticated()")
  @PostMapping
  fun createUser(@RequestBody user: User): ResponseEntity<User> {
    println("Creating user: $user")
    return ResponseEntity.ok(userService.createUser(user))
  }

  @CrossOrigin(origins = ["http://localhost:4200"])
@PreAuthorize("isAuthenticated()")
  @PutMapping("/{id}")
  fun updateUser(@PathVariable id: Long, @RequestBody updatedUser: User): ResponseEntity<User> {
    return ResponseEntity.ok(userService.updateUser(id, updatedUser))
  }

  @CrossOrigin(origins = ["http://localhost:4200"])
@PreAuthorize("isAuthenticated()")
  @DeleteMapping("/{id}")
  fun deleteUser(@PathVariable id: Long): ResponseEntity<Void> {
    userService.deleteUser(id)
    return ResponseEntity.noContent().build()
  }
}
