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
}

data class UserEmployeeRequest(
    val registerRequest: RegisterRequest,
    val employee: EmployeDto
)

data class EmployeDto(
    val identifiant: String
)
