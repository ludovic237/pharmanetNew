package com.example.backend.controllers

import com.example.backend.models.Employe
import com.example.backend.models.User
import com.example.backend.services.EmployeService
import com.example.backend.services.UserService
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/admin/users-employees")
class UserEmployeeController(
    private val userService: UserService,
    private val employeeService: EmployeService
) {

    @CrossOrigin(origins = ["http://localhost:4200"])
    @PreAuthorize("isAuthenticated()")
    @PostMapping
    fun createUserAndEmployee(@RequestBody request: UserEmployeeRequest): ResponseEntity<Map<String, Any>> {
        val employee = employeeService.createEmployee(request.registerRequest,request.employee)
        return ResponseEntity.ok(mapOf("employee" to employee))
    }

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @GetMapping
  fun getAllEmployees(): ResponseEntity<List<Employe>> {
    return ResponseEntity.ok(employeeService.getAllEmployees())
  }

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @GetMapping("/{id}")
  fun getEmployeById(@PathVariable id: Long): ResponseEntity<Employe> {
    return ResponseEntity.ok(employeeService.getEmployeeById(id).orElseThrow { IllegalArgumentException("User not found") })
  }

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @PutMapping("/{id}")
  fun updateEmployee(@PathVariable id: Long, @RequestBody updatedUser: Employe): ResponseEntity<Employe> {
    return ResponseEntity.ok(employeeService.updateEmployee(id, updatedUser))
  }

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @DeleteMapping("/{id}")
  fun deleteEmployee(@PathVariable id: Long): ResponseEntity<Void> {
    employeeService.deleteEmployee(id)
    return ResponseEntity.noContent().build()
  }


}

data class UserEmployeeRequest(
    val registerRequest: RegisterRequest,
    val employee: EmployeDto
)

data class EmployeDto(
    val identifiant: String
)
