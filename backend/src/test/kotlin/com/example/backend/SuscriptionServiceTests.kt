import com.example.backend.BackendApplication
import com.example.backend.constants.StatusConstants.SERVICE_BILLING_MODEL_MONTHLY
import com.example.backend.models.*
import com.example.backend.repositories.*
import com.example.backend.services.SubscriptionService
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.mockito.Mock
import org.mockito.Mockito.*
import org.springframework.boot.test.context.SpringBootTest
import java.math.BigDecimal
import java.time.LocalDateTime
import java.util.*

import com.example.backend.services.InvoiceService
import com.example.backend.services.PaymentService
import com.example.backend.services.UserService
import org.junit.jupiter.api.BeforeEach

@SpringBootTest(classes = [BackendApplication::class])
class SubscriptionServiceTests {

  @Mock
  private lateinit var tenantRepository: TenantRepository

  @Mock
  private lateinit var userService: UserService

  @Mock
  private lateinit var paymentService: PaymentService

  @Mock
  private lateinit var subscriptionServiceRepository: SubscriptionServiceRepository

  @Mock
  private lateinit var serviceRepository: ServiceRepository

  @Mock
  private lateinit var serviceOptionRepository: ServiceOptionRepository

  @Mock
  private lateinit var subscriptionRepository: SubscriptionRepository

  @Mock
  private lateinit var subscriptionOptionRepository: SubscriptionOptionRepository

  @Mock
  private lateinit var serviceUsageRepository: ServiceUsageRepository

  @Mock
  private lateinit var billingCycleRepository: BillingCycleRepository

  @Mock
  private lateinit var paymentRepository: PaymentRepository

  @Mock
  private lateinit var paymentLineRepository: PaymentLineRepository

  @Mock
  private lateinit var invoiceRepository: InvoiceRepository

  @Mock
  private lateinit var invoiceService: InvoiceService

  private lateinit var subscriptionService: SubscriptionService

  @BeforeEach
  fun setUp() {
    subscriptionService = SubscriptionService(
      paymentService,
      invoiceRepository,
      subscriptionServiceRepository,
      invoiceService,
      serviceRepository,
      serviceOptionRepository,
      subscriptionRepository,
      subscriptionOptionRepository,
      serviceUsageRepository,
      tenantRepository,
      billingCycleRepository,
      paymentRepository,
      paymentLineRepository,
      userService
    )
  }
  @Test
  fun saveSubscriptionsTenantWithInvoice_createsInvoiceAndSubscriptionSuccessfully() {
    val data = mapOf(
      "finalTotal" to 100,
      "tenantId" to 1,
      "selectedServices" to listOf(
        mapOf(
          "id" to 1,
          "startDate" to "2023-01-01T00:00:00",
          "endDate" to "2023-12-31",
          "numberOfSubscriptions" to 1,
          "totalPrice" to 100,
          "options" to listOf(
            mapOf("id" to 1, "quantity" to 2)
          )
        )
      )
    )

    val tenant = Tenant().apply { id = 1; user = User() }
    val service = Services().apply { id = 1; billingMode = SERVICE_BILLING_MODEL_MONTHLY }
    val serviceOption = ServiceOption().apply { id = 1; price = BigDecimal(10) }
    val invoice = Invoice().apply { id = 1 }

    `when`(tenantRepository.findByIdWithUser(1)).thenReturn(Optional.of(tenant))
    `when`(serviceRepository.findById(1)).thenReturn(Optional.of(service))
    `when`(serviceOptionRepository.findById(1)).thenReturn(Optional.of(serviceOption))
    `when`(invoiceRepository.save(any(Invoice::class.java))).thenReturn(invoice)

    println("Data before calling service: $data")
//    val result = subscriptionService.saveSubscriptionsTenantWithInvoice(data)
    val subscriptionServiceSpy = spy(subscriptionService)

    doReturn(tenant).`when`(tenantRepository).findByIdWithUser(1)
    doReturn(invoice).`when`(invoiceRepository).save(any(Invoice::class.java))

    val result = subscriptionServiceSpy.saveSubscriptionsTenantWithInvoice(data)

    verify(subscriptionServiceSpy).saveSubscriptionsTenantWithInvoice(data)

    println("Result after service call: $result")

    assertNotNull(result["invoiceId"])
    assertEquals("Subscription processed successfully", result["message"])
    verify(invoiceRepository, times(1)).save(any(Invoice::class.java))
    verify(subscriptionRepository, times(1)).save(any(Subscription::class.java))
  }

  @Test
  fun saveSubscriptionsTenantWithInvoice_throwsExceptionWhenTenantNotFound() {
    val data = mapOf(
      "finalTotal" to 100,
      "tenantId" to 999,
      "selectedServices" to emptyList<Map<String, Any?>>()
    )

    `when`(tenantRepository.findByIdWithUser(999)).thenReturn(Optional.empty())

    val exception = assertThrows(IllegalArgumentException::class.java) {
      subscriptionService.saveSubscriptionsTenantWithInvoice(data)
    }

    assertEquals("Tenant not found with ID 999", exception.message)
  }

  @Test
  fun saveSubscriptionsTenantWithInvoice_throwsExceptionWhenServiceNotFound() {
    val data = mapOf(
      "finalTotal" to 100,
      "tenantId" to 1,
      "selectedServices" to listOf(
        mapOf("id" to 999, "totalPrice" to 100, "options" to emptyList<Map<String, Any?>>())
      )
    )

    val tenant = Tenant().apply { id = 1; user = User() }

    `when`(tenantRepository.findByIdWithUser(1)).thenReturn(Optional.of(tenant))
    `when`(serviceRepository.findById(999)).thenReturn(Optional.empty())

    val exception = assertThrows(IllegalArgumentException::class.java) {
      subscriptionService.saveSubscriptionsTenantWithInvoice(data)
    }

    assertEquals("Service not found with ID 999", exception.message)
  }

}
