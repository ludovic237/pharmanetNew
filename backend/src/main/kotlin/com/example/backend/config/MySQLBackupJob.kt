import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import java.io.File
import java.text.SimpleDateFormat
import java.util.*

@Component
class MySQLBackupJob {

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
}
