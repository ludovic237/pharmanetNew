package com.example.backend.models

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.LocalDateTime

@Entity
@Table(name = "message")
class Message {
  @Id
  @Column(name = "id", nullable = false)
  var id: Int? = null

  @Column(name = "type", length = 32)
  var type: String? = null

  @Column(name = "description", length = 64)
  var description: String? = null

  @Column(name = "datemsg")
  var datemsg: LocalDateTime? = null
}
