package com.example.backend.models

import jakarta.persistence.*
import org.hibernate.annotations.ColumnDefault

@Entity
@Table(name = "application_settings")
class AppSetting (
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id", nullable = false)
  var id: Long? = null,

  @Column(name = "key_name")
  var keyName: String? = null,

  @Lob
  @Column(name = "value")
  var value: String? = null,

  @ColumnDefault("'0'")
  @Column(name = "type", length = 50)
  var type: String? = null
)
