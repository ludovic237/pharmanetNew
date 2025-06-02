import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatTabsModule} from '@angular/material/tabs';
import {FlexLayoutModule} from '@ngbracket/ngx-layout';
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatNativeDateModule} from "@angular/material/core";
import {TenantService} from "@services/tenant.service";
import {ServiceService} from "@services/service.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {CommonModule} from "@angular/common";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatIconModule} from "@angular/material/icon";
import {MatChipListbox, MatChipsModule} from "@angular/material/chips";
import {MatDividerModule} from "@angular/material/divider";
import {MatCardModule} from "@angular/material/card";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {SubscriptionService} from "@services/subscription.service";
import {ConfirmationDialogComponent} from "./confirmation-dialog.component";
import {Router} from "@angular/router";
import {MatAccordion, MatExpansionModule} from "@angular/material/expansion";
import {MatTableModule} from "@angular/material/table";

@Component({
  selector: 'app-subscription-dialog',
  imports: [
    FormsModule,
    MatChipListbox,
    MatToolbarModule,
    MatExpansionModule,
    MatCheckboxModule,
    MatTableModule,
    MatIconModule,
    MatChipsModule,
    MatCardModule,
    MatDividerModule,
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    MatTabsModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule
  ],
  templateUrl: './subscription-dialog.component.html',
  styleUrl: './subscription-dialog.component.scss'
})
export class SubscriptionDialogComponent implements OnInit {

  currentStatus: string = 'active'; // Set initial status

  title: string = 'Create Subscription';
  selectedOption: any = null;
  selectedServiceData: any = null;
  isReadonly: boolean = false;
  isReadonlyTenant: boolean = false;
  isReadonlyService: boolean = false;
  selectedQuantity: number | null = null;
  addedOptions: any[] = [];
  disabledStatuses: string[] = [];

  public form: FormGroup;

  public serviceTypes = ['PERIODIC', 'PERIODIC_WITH_OPTIONS', 'OPTIONS'];
  public isPeriodicType = false;
  public isOption = false;
  public locataires: any[] = [];
  public services: any[] = [];
  public _status: string[] = ['ACTIVE', 'PENDING', 'CANCELED', 'EXPIRED'];

  public validatedOptions: any[] = []; // List of validated options
  public selectedOptions: any[] = []; // List of validated options
  isServiceValidated: boolean = false;
  public selectedServiceOptions: any[] = [];
  public totalPrice: number = 0;
  public finalTotal: number = 0;

  constructor(public dialogRef: MatDialogRef<SubscriptionDialogComponent>,
              private snackBar: MatSnackBar,
              private router: Router,
              private tenantService: TenantService,
              private serviceService: ServiceService,
              private subscriptionService: SubscriptionService,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private dialog: MatDialog,
              private fb: FormBuilder) {
    console.log("constructor ");
    console.log(this.data);
    this.form = this.fb.group({
      tenantId: [data?.tenantId || '', Validators.required],
      serviceId: [data?.serviceId || '', Validators.required],
      options: [[]],
      serviceType: [''],
      numberOfSubscriptions: [1, [Validators.min(1)]], // Default value is 1, minimum is 1
      startDate: [null], // Initially not required
      endDate: [],
    });
  }

  ngOnInit(): void {
    if (this.data?.subscriptionId) {
      this.title = "Subscription detail";
    }

    // Initialize the form with data if available
    this.fetchTenants();
  }

  public onSubmit(): void {
    const tenantId = this.form.get('tenantId')?.value;
    // Prepare the payload
    const payload = {
      finalTotal: this.finalTotal,
      tenantId: this.form.get('tenantId')?.value,
      selectedServices: this.selectedServices.map((service) => ({
        id: service.id,
        name: service.name,
        options: service.options.map((option: any) => ({
          id: option.id,
          name: option.name,
          quantity: option.quantity,
          price: option.price,
        })),
        startDate: service.startDate,
        endDate: service.endDate,
        status: service.status,
        totalPrice: service.totalPrice,
        finalTotal: this.finalTotal,
        numberOfSubscriptions: service.numberOfSubscriptions,
      })),
    };
    console.log("payload");
    console.log(payload);
    console.log("this.form");
    console.log(this.form);
    if (this.selectedServices.length > 0 && tenantId) {
      this.subscriptionService.saveSubscriptionsTenantWithInvoice(payload).subscribe({
        next: (data) => {
          // Show success message
          this.snackBar.open('Subscription created successfully!', 'Close', {
            duration: 3000,
            verticalPosition: 'top'
          });
          this.dialogRef.close(payload);
        },
        error: (err) => {
          // Show error message
          this.snackBar.open('Failed to create subscription. Please try again.', 'Close', {
            duration: 3000,
            verticalPosition: 'top'
          });
          if (err.status == "403") {
            this.router.navigate(['/sign-in']); // Redirect to login if not authenticated
          }
          console.error('Error creating subscription:', err);
        }
      });
    }
  }

  fetchServices(): void {
    this.serviceService.getServiceAllWithOptions().subscribe({
      next: (data) => {
        this.services = data;
        if (this.data?.subscriptionId) {
          this.title = "Subscription detail";
          this.getSubscriptionDataAndDisplayStatus();
        }
      },
      error: (err) => {
        console.error('Error fetching housing units:', err);
        if (err.status == "403") {
          this.router.navigate(['/sign-in']); // Redirect to login if not authenticated
        }
      }
    });
  }

  private fetchTenants(): void {
    this.tenantService.getTenants().subscribe({
      next: (data) => {
        this.locataires = data;
        this.fetchServices();
      },
      error: (err) => {
        console.error('Error fetching users:', err);
        if (err.status == "403") {
          this.router.navigate(['/sign-in']); // Redirect to login if not authenticated
        }
      }
    });
  }

  onServiceChange(serviceId: number): void {
    const selectedService = this.services.find(service => service.id === serviceId);
    this.selectedServiceData = selectedService;
    this.selectedServiceOptions = selectedService?.activeOptions || [];

    if (selectedService) {
      const serviceType = selectedService.type;

      // Déduire le type de service et effectuer des actions
      if (serviceType === 'PERIODIC') {
        this.isPeriodicType = true;
        this.isOption = false;
      } else if (serviceType === 'OPTION') {
        this.isPeriodicType = false;
        this.isOption = true;
      } else if (serviceType === 'PERIODIC_WITH_OPTIONS') {
        this.isPeriodicType = true;
        this.isOption = true;
      } else {
        this.isPeriodicType = false;
        this.isOption = false;
      }

      // Réinitialiser les champs si nécessaire
      if (!this.isPeriodicType) {
        this.form.patchValue({
          numberOfSubscriptions: null,
          startDate: null,
          endDate: null
        });
      }
    }

    // Clear existing quantity controls
    Object.keys(this.form.controls).forEach(controlName => {
      if (controlName.startsWith('quantity_')) {
        this.form.removeControl(controlName);
      }
    });

    // Add quantity controls for each option
    this.selectedServiceOptions.forEach(option => {
      this.form.addControl('quantity_' + option.id, this.fb.control(0, [Validators.min(0), Validators.max(option.quantity)]));
    });

    this.form.get('options')?.setValue([]);
    this.calculateTotalPrice();
  }

  onOptionsChange(): void {
    this.calculateTotalPrice();
  }

  removeOption(optionToRemove: any): void {
    this.addedOptions = this.addedOptions.filter((option: any) => option.id !== optionToRemove.id);
    this.calculateTotalPrice();
  }

  /*  calculateTotalPrice(): void {
      // Get the selected service
      const selectedService = this.services.find(service => service.id === this.form.get('serviceId')?.value);

      // Calculate the service price (if it exists)
      const servicePrice = selectedService?.price || 0;

      // Calculate the total price of added options
      const optionsPrice = this.addedOptions.reduce((sum, option) => sum + (option.price * option.quantity), 0);

      // Update the total price
      this.totalPrice = servicePrice + optionsPrice;
    }*/

  /*  addOption(): void {
      console.log("addOption");
      console.log(this.selectedOption);
      console.log(this.selectedQuantity);
      if (this.selectedOption && this.selectedQuantity) {
        this.addedOptions.push({
          ...this.selectedOption,
          quantity: this.selectedQuantity
        });
        this.selectedOption = null;
        this.selectedQuantity = null;
      }
    }*/

  addOption(): void {
    if (this.selectedOption && this.selectedQuantity) {
      const existingOption = this.addedOptions.find(option => option.id === this.selectedOption.id);
      if (existingOption) {
        // Update the quantity of the existing option
        existingOption.quantity = this.selectedQuantity;
      } else {
        // Add the new option
        this.addedOptions.push({
          ...this.selectedOption,
          quantity: this.selectedQuantity
        });
      }
      // Recalculate the total price
      this.calculateTotalPrice();

      // Reset the selection
      this.selectedOption = null;
      this.selectedQuantity = null;
    }
  }

  onStatusChange(selectedStatus: string, isChecked: boolean): void {
    if (isChecked && (selectedStatus.toLowerCase() === 'Canceled'.toLowerCase() || selectedStatus.toLowerCase() === 'Expired'.toLowerCase())) {
      const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        data: {
          message: `Are you sure you want to set the status to ${selectedStatus}?`,
        },
      });

      dialogRef.afterClosed().subscribe((confirmed) => {
        if (confirmed) {
          this.disabledStatuses = this._status; // Disable all statuses
          this.form.get('status')?.setValue(selectedStatus);

          // Update the status in the database
          this.subscriptionService.updateSubscriptionStatus(this.data.id, selectedStatus).subscribe({
            next: () => {
              this.snackBar.open('Status updated successfully!', 'Close', {
                duration: 3000,
                verticalPosition: 'top',
              });
            },
            error: (err) => {
              this.snackBar.open('Failed to update status. Please try again.', 'Close', {
                duration: 3000,
                verticalPosition: 'top',
              });
              if (err.status == "403") {
                this.router.navigate(['/sign-in']); // Redirect to login if not authenticated
              }
              console.error('Error updating status:', err);
            },
          });
        } else {
          this.form.get('status')?.setValue(null); // Reset the status if canceled
        }
      });
    } else if (isChecked) {
      this.form.get('status')?.setValue(selectedStatus);

      // Update the status in the database
      this.subscriptionService.updateSubscriptionStatus(this.data.id, selectedStatus).subscribe({
        next: () => {
          this.snackBar.open('Status updated successfully!', 'Close', {
            duration: 3000,
            verticalPosition: 'top',
          });
        },
        error: (err) => {
          this.snackBar.open('Failed to update status. Please try again.', 'Close', {
            duration: 3000,
            verticalPosition: 'top',
          });
          if (err.status == "403") {
            this.router.navigate(['/sign-in']); // Redirect to login if not authenticated
          }
          console.error('Error updating status:', err);
        },
      });
    }
  }

  public selectedServices: any[] = [];

  addService(): void {
    const serviceId = this.form.get('serviceId')?.value;
    const service = this.services.find(s => s.id === serviceId);

    if (service) {
      this.selectedServices.push({
        id: service.id,
        name: service.name,
        options: [...this.addedOptions],
        startDate: this.form.get('dateDebut')?.value,
        endDate: this.form.get('dateFin')?.value,
        status: this.form.get('status')?.value
      });

      // Réinitialiser le formulaire pour ajouter un autre service
      this.form.reset();
      this.addedOptions = [];
      this.calculateTotalPrice();
    }
  }

  removeService(index: number): void {
    this.selectedServices.splice(index, 1);
    this.calculateTotalPrice();
  }

  trackById(index: number, item: any): number {
    return item.id;
  }

  /*  onSubmit(): void {
      if (this.selectedServices.length > 0) {
        this.subscriptionService.createMultipleSubscriptions(this.selectedServices).subscribe({
          next: () => {
            this.snackBar.open('Subscriptions created successfully!', 'Close', {
              duration: 3000,
              verticalPosition: 'top'
            });
            this.dialogRef.close();
          },
          error: (err) => {
            this.snackBar.open('Failed to create subscriptions. Please try again.', 'Close', {
              duration: 3000,
              verticalPosition: 'top'
            });
            console.error('Error creating subscriptions:', err);
          }
        });
      }
    }*/

  validateService(): void {
    const serviceId = this.form.get('serviceId')?.value;
    const service = this.services.find(s => s.id === serviceId);

    if (service) {
      this.isServiceValidated = true;

      // Remove validators for numberOfSubscriptions and startDate
      this.form.get('numberOfSubscriptions')?.clearValidators();
      this.form.get('startDate')?.clearValidators();

      // Update the form validity
      this.form.get('numberOfSubscriptions')?.updateValueAndValidity();
      this.form.get('startDate')?.updateValueAndValidity();

      const existingServiceIndex = this.selectedServices.findIndex(s => s.id === serviceId);

      // Calculate the total service price
      const numberOfSubscriptions = this.form.get('numberOfSubscriptions')?.value || 1;
      const servicePrice = (service.price || 0) * numberOfSubscriptions;

      // Calculate the total price of selected options
      const totalOptionsPrice = this.addedOptions.reduce(
        (sum, option) => sum + (option.price * (option.quantity || 1) * numberOfSubscriptions),
        0
      );

      const totalServicePrice = servicePrice + totalOptionsPrice;

      if (existingServiceIndex !== -1) {
        // Service already exists, ask for confirmation
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
          data: {
            message: `The service "${service.name}" already exists. Do you want to update it?`,
          },
        });

        dialogRef.afterClosed().subscribe((confirmed) => {
          if (confirmed) {
            // Update the existing service
            this.selectedServices[existingServiceIndex] = {
              ...this.selectedServices[existingServiceIndex],
              options: [...this.addedOptions],
              startDate: this.form.get('startDate')?.value,
              endDate: this.form.get('endDate')?.value,
              status: this.form.get('status')?.value,
              numberOfSubscriptions: this.form.get('numberOfSubscriptions')?.value,
              totalPrice: totalServicePrice,
            };
            this.selectedServices = [...this.selectedServices]; // Trigger change detection
          }
        });
      } else {
        // Add the new service
        const newService = {
          id: service.id,
          name: service.name,
          options: [...this.addedOptions],
          startDate: this.form.get('startDate')?.value,
          endDate: this.form.get('endDate')?.value,
          numberOfSubscriptions: this.form.get('numberOfSubscriptions')?.value,
          status: this.form.get('status')?.value,
          totalPrice: totalServicePrice,
        };

        this.selectedServices = [...this.selectedServices, newService];

        // Reset the form for the next service
        this.form.patchValue({
          dateDebut: '',
          dateFin: '',
          status: '',
          options: [],
          serviceId: '', // Clear the selected service
          numberOfSubscriptions: [null],
          startDate: [null],
          endDate: [null],
        });

        this.addedOptions = [];
      }
      // Reset isPeriodicType and isOption
      this.isPeriodicType = false;
      this.isOption = false;

      // Calculate the final total price of all services
      this.finalTotal = this.selectedServices.reduce((sum, service) => sum + service.totalPrice, 0);
      console.log("Final Total Price:", this.finalTotal);
      console.log("Selected services:", this.selectedServices);
      this.calculateTotalPrice();
    }
  }

  removeServiceAndRefresh(index: number): void {
    // Remove the service at the specified index
    this.selectedServices.splice(index, 1);

    // Reassign the array to trigger change detection
    this.selectedServices = [...this.selectedServices];

    // Recalculate the total price for all services
    this.finalTotal = this.selectedServices.reduce((sum, service) => sum + service.totalPrice, 0);

    console.log("Updated Final Total:", this.finalTotal);
  }

  removeOptionSelected(optionToRemove: any, serviceId?: number): void {
    if (serviceId) {
      // Find the corresponding service
      const service = this.selectedServices.find(s => s.id === serviceId);
      if (service) {
        // Remove the option from the service
        service.options = service.options.filter((option: any) => option.id !== optionToRemove.id);
        // Recalculate the service's total price
        service.totalPrice = this.calculateServiceTotal(service);
      }
    } else {
      // Remove the option from the added options
      this.addedOptions = this.addedOptions.filter(option => option.id !== optionToRemove.id);
    }

    // Recalculate the final total price for all services
    this.finalTotal = this.selectedServices.reduce((sum, service) => sum + service.totalPrice, 0);

    console.log("Updated Final Total:", this.finalTotal);
  }

  onTenantChange(newTenantId: number): void {
    if (this.selectedServices.length > 0) {
      const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        data: {
          message: 'Changing the tenant will reset the selected services. Do you want to proceed?',
        },
      });

      dialogRef.afterClosed().subscribe((confirmed) => {
        if (confirmed) {
          // Clear selected services
          this.selectedServices = [];
          this.form.get('tenantId')?.setValue(newTenantId); // Update tenant
        } else {
          // Revert tenant selection
          this.form.get('tenantId')?.setValue(this.form.get('tenantId')?.value);
        }
      });
    } else {
      // Update tenant if no services are selected
      this.form.get('tenantId')?.setValue(newTenantId);
    }
  }

  onChipClick(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onServiceTypeChange(type: string): void {
    this.isPeriodicType = type === 'PERIODIC' || type === 'PERIODIC_WITH_OPTIONS';
    if (!this.isPeriodicType) {
      this.form.patchValue({numberOfSubscriptions: null, startDate: null, endDate: null});
    }
  }

  calculateEndDate(): void {
    const numberOfSubscriptions = this.form.get('numberOfSubscriptions')?.value;
    const startDate = this.form.get('startDate')?.value;

    if (numberOfSubscriptions && startDate) {
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + numberOfSubscriptions);
      this.form.patchValue({endDate: endDate.toISOString().split('T')[0]});
    }
  }

  calculateTotalPrice(): number {
    return this.selectedServices.reduce((sum: number, service: any) => {
      const optionsTotal = service.options.reduce((optSum: number, option: any) => optSum + (option.price * option.quantity), 0);
      return sum + optionsTotal + (service.price || 0);
    }, 0);
  }

  calculateServiceTotal(service: any): number {
    const numberOfSubscriptions = service.numberOfSubscriptions || 1; // Use the provided number of subscriptions or default to 1
    const serviceTotal = (service.price || 0) * numberOfSubscriptions;
    const optionsTotal = service.options.reduce(
      (sum: number, option: any) => sum + (option.price * option.quantity * numberOfSubscriptions),
      0
    );
    console.log("serviceTotal :", serviceTotal);
    console.log("optionsTotal :", optionsTotal);
    console.log("Total :", serviceTotal + optionsTotal)
    return serviceTotal + optionsTotal;
  }



  changeStatus(status: string) {
    this.currentStatus = status;
    // Call your Service to update the server side status here.
    this.subscriptionService.updateSubscriptionStatus(this.data?.subscriptionId,status).subscribe(
      response => {
        console.log(response);
        this.getSubscriptionDataAndDisplayStatus();
      },
      error => {
        console.error(error);
      }
    );
  }

   getSubscriptionDataAndDisplayStatus() {
    this.subscriptionService.getSubscriptionFormattedData(this.data.subscriptionId).subscribe({
      next: (response) => {
        this.form.patchValue({
          tenantId: response.tenantId,
        });
        this.currentStatus = response.status.toLowerCase();
        response.subscriptionServices.forEach((data: any) => {
          data.options.forEach((option: any) => {
            this.addedOptions = [...this.addedOptions, {
              id: option.subscriptionOptionId,
              quantity: option.quantity,
              name: option?.name || 'Unknown',
              price: option?.price || 0
            }];
          })
          this.selectedServices = [...this.selectedServices, {
            id: data.serviceId,
            name: data.serviceName,
            options: [...this.addedOptions],
            startDate: data.startDate,
            endDate: data.endDate,
            totalPrice: data.totalPrice,
            status: data.status,
            disable: true
          }];
        })

        this.isReadonlyService = true;
        this.isReadonlyTenant = true;
        console.log("this.selectedServices");
        console.log(this.selectedServices);

        this.snackBar.open('Status updated successfully!', 'Close', {
          duration: 3000,
          verticalPosition: 'top',
        });
      },
      error: (err) => {
        this.snackBar.open('Failed to update status. Please try again.', 'Close', {
          duration: 3000,
          verticalPosition: 'top',
        });
        if (err.status == "403") {
          this.router.navigate(['/sign-in']); // Redirect to login if not authenticated
        }
        console.error('Error updating status:', err);
      },
    });
  }

}
