package com.example.backend.repositories;

import com.example.backend.models.Message
import org.springframework.data.jpa.repository.JpaRepository

interface MessageRepository : JpaRepository<Message, Int> {
}
