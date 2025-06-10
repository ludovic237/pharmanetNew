package com.example.backend.repositories;

import com.example.backend.models.Categorie
import org.springframework.data.jpa.repository.JpaRepository

interface CategorieRepository : JpaRepository<Categorie, Int> {
fun findByNom(nom:String):Categorie
fun findAllBySupprimer(supprimer:Int):List<Categorie>
fun findByNomAndSupprimer(nom:String,supprimer:Int):Categorie
}
