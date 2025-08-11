import com.example.backend.repositories.*
import com.example.backend.services.CaisseService
import com.example.backend.utility.UserUtils
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import java.io.File
import java.text.SimpleDateFormat
import java.util.*

@Component
class MySQLBackupJob(
  private val userUtils: UserUtils,
  private val retourProduitRepository: RetourProduitRepository,
  private val produitRetourRepository: ProduitRetourRepository,
  private val produitCmdRepository: ProduitCmdRepository,
  private val produitDetailRepository: ProduitDetailRepository,
  private val employeRepository: EmployeRepository,
  private val concernerRepository: ConcernerRepository,
  private val venteRepository: VenteRepository,
  private val produitRepository: ProduitRepository,
  private val categorieRepository: CategorieRepository,
  private val fournisseurRepository: FournisseurRepository,
  private val rayonRepository: RayonRepository,
  private val enRayonRepository: EnRayonRepository,
  private val formeRepository: FormeRepository,
  private val magasinRepository: MagasinRepository,
  private val fabriquantRepository: FabriquantRepository,
  private val caisseRepository: CaisseRepository,
  private val commandeRepository: CommandeRepository,
  private  val caisseService: CaisseService
) {

  private val user = "root"
  private val password = "root"
  private val database = "nom_de_ta_base"
  private val mysqldumpPath = "C:\\laragon\\bin\\mysql\\mysql-8.0.30-winx64\\bin\\mysqldump.exe"
//  private val mysqldumpPath = "C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysqldump.exe"
  private val backupDir = "C:\\backups_mysql"

  @Scheduled(cron = "0 0 2 * * *") // Tous les jours à 02h00
  fun backupDatabase() {
    val dateFormat = SimpleDateFormat("yyyy-MM-dd_HH-mm-ss")
    val fileName = "backup_${dateFormat.format(Date())}.sql"
    val filePath = "$backupDir\\$fileName"

    File(backupDir).mkdirs()

    val process = ProcessBuilder(
      mysqldumpPath,
      "-u$user",
      "-p$password",
      database
    )
      .redirectOutput(File(filePath))
      .start()

    val exitCode = process.waitFor()
    if (exitCode == 0) {
      println("✅ Backup réussi: $filePath")
    } else {
      println("❌ Échec du backup. Code de sortie: $exitCode")
    }
  }

  @Scheduled(cron = "0 0 2 * * *")
  fun refreshStockProduct(){
    var produits = produitRepository.findAll()
    produits.forEach { produit ->
      var enRayon = enRayonRepository.findAllByProduitIdAndSupprimer(produit.id!!)
      var totalStock = enRayon.sumOf { it.quantiteRestante!! }
      produit.stock = totalStock
      produitRepository.save(produit)
    }
  }

}
