package com.example.backend.config

import org.springframework.context.annotation.Configuration
import org.springframework.web.servlet.config.annotation.CorsRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer

@Configuration
class CorsConfig : WebMvcConfigurer {
    override fun addCorsMappings(registry: CorsRegistry) {
        registry.addMapping("/**") // Autorise toutes les routes
            .allowedOrigins("http://localhost:4200") // Autorise l'origine Angular
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Méthodes HTTP autorisées
            .allowedHeaders("*") // Autorise tous les en-têtes
            .allowCredentials(true) // Autorise les cookies si nécessaire
    }
}
