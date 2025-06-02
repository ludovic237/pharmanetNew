package com.example.backend.models

import jakarta.persistence.*
import lombok.Data
import lombok.ToString
import org.hibernate.annotations.ColumnDefault
import java.time.Instant
import java.time.LocalDateTime
@Data
@Entity
@ToString
@Table(name = "users")
class User {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id", nullable = false)
  var id: Long? = null

  @Column(name = "first_name", nullable = false, length = 100)
  var firstName: String? = null

  @Column(name = "last_name", nullable = false, length = 100)
  var lastName: String? = null

  @Column(name = "email", nullable = false, length = 150)
  var email: String? = null

  @Column(name = "password", nullable = false)
  var password: String? = null

  @Column(name = "phone", length = 20)
  var phone: String? = null

  @Lob
  @Column(name = "role", nullable = false)
  var role: String? = null

  @Column(name = "birthday")
  var birthday: LocalDateTime? = null

  @Lob
  @Column(name = "gender", nullable = true)
  var gender: String? = null

  @Column(name = "image")
  var image: String? = null

  @ColumnDefault("1")
  @Column(name = "is_active", nullable = false)
  var isActive: Boolean? = false

  @ColumnDefault("0")
  @Column(name = "is_deleted", nullable = false)
  var isDeleted: Boolean? = false

  @Column(name = "registration_date", nullable = false)
  var registrationDate: LocalDateTime? = null

  @Column(name = "joined_date")
  var joinedDate: Instant? = null

  @Column(name = "username", nullable = false)
  var username: String? = null

  @Column(name = "created_date")
  var createdDate: LocalDateTime? = null

  @Column(name = "updated_date")
  var updatedDate: LocalDateTime? = null
}
