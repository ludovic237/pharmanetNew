package com.example.backend.repositories;

import com.example.backend.models.License
import org.springframework.data.jpa.repository.JpaRepository

interface LicenseRepository : JpaRepository<License, Int> {
}
