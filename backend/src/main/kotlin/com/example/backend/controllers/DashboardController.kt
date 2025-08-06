package com.example.backend.controllers

import com.example.backend.dtos.*
import com.example.backend.services.DashboardService
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import java.time.LocalDateTime

@RestController
@RequestMapping("/api/dashboard")
class DashboardController(
  private val service: DashboardService
) {

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @GetMapping("/kpis")
  fun kpis(
    @RequestParam from: String?,
    @RequestParam to: String?
  ): KpiDto = service.kpis(LocalDateTime.parse(from!!.trim()), LocalDateTime.parse(to!!.trim()))

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @GetMapping("/sales-monthly")
  fun salesMonthly(
    @RequestParam from: String?,
    @RequestParam to: String?
  ): List<SalesMonthlyPoint> =
    service.salesMonthly(LocalDateTime.parse(from!!.trim()), LocalDateTime.parse(to!!.trim()))

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @GetMapping("/sales-by-category")
  fun salesByCategory(
    @RequestParam from: String?,
    @RequestParam to: String?
  ): List<CategorySales> = service.salesByCategory(LocalDateTime.parse(from!!.trim()), LocalDateTime.parse(to!!.trim()))

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @GetMapping("/top-products")
  fun topProducts(
    @RequestParam(defaultValue = "10") limit: Int,
    @RequestParam from: String?,
    @RequestParam to: String?
  ): List<TopProduct> = service.topProducts(limit, LocalDateTime.parse(from!!.trim()), LocalDateTime.parse(to!!.trim()))

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @GetMapping("/orders-recent")
  fun ordersRecent(
    @RequestParam(defaultValue = "0") page: Int,
    @RequestParam(defaultValue = "10") size: Int
  ): List<OrderRow> = service.ordersRecent(page, size)

  @CrossOrigin(origins = ["http://localhost:4200"])
  @PreAuthorize("isAuthenticated()")
  @GetMapping("/stock-alerts")
  fun stockAlerts(
    @RequestParam(defaultValue = "10") low: Int,
    @RequestParam(defaultValue = "30") days: Int,
    @RequestParam(defaultValue = "20") limit: Int
  ): List<StockAlertRow> = service.stockAlerts(low, days, limit)
}
