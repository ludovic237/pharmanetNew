import {Component, OnInit} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from "@angular/forms";
import {VentesService} from "@services/ventes.service";
import {MatCardModule} from "@angular/material/card";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatSelectModule} from "@angular/material/select";
import {MatNativeDateModule, MatOptionModule} from "@angular/material/core";
import {MatIconModule} from "@angular/material/icon";
import {MatInputModule} from "@angular/material/input";
import {CommonModule} from "@angular/common";
import {MatListModule, MatListOption, MatSelectionList} from "@angular/material/list";
import {BrowserModule} from "@angular/platform-browser";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {MatTableDataSource, MatTableModule} from "@angular/material/table";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatButtonModule} from "@angular/material/button";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {FlexLayoutModule} from "@ngbracket/ngx-layout";
import {MatDividerModule} from "@angular/material/divider";
import {MatAccordion, MatExpansionModule} from "@angular/material/expansion";
import {Settings, SettingsService} from "@services/settings.service";
import {MatTabsModule} from "@angular/material/tabs";
import {AjouterVenteDialogComponent} from "./ajouter-vente-dialog/ajouter-vente-dialog.component";
import {MatDialog, MatDialogActions} from "@angular/material/dialog";
import {EnrayonsService} from "@services/enrayons.service";
import {ProductService} from "@services/products.service";
import {MatRadioButton, MatRadioGroup, MatRadioModule} from "@angular/material/radio";
import {UsersService} from "@services/users.service";
import {PrescripteursService} from "@services/prescripteurs.service";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {MatSnackBar} from "@angular/material/snack-bar";
import {AppService} from "@services/app.service";
import {PaymentDialogComponent} from "./payment-dialog/payment-dialog.component";
import {AuthService} from "@services/auth.service";
import {AppSettingsService} from "@services/app-settings.service";
import {MatPaginator, PageEvent} from "@angular/material/paginator";

interface VenteLigne {
  id: string;
  nom: string;
  prixUnitaire: number;
  quantite: number;
  prixTotal: number;
  reduction: number;
  dateLivraison: Date;
  type: string;
  rayonId: string;
  stockTotal: number;
}

@Component({
  selector: 'app-ajouter-vente',
  standalone: true,
  providers: [UsersService, VentesService, EnrayonsService, ProductService, PrescripteursService],
  imports: [
    MatRadioGroup,
    MatRadioModule,
    MatSlideToggleModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule,
    MatRadioButton,
    MatAccordion,
    MatExpansionModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    // Material
    MatToolbarModule,
    MatTabsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatTableModule,
    MatCardModule,
    MatCheckboxModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    FlexLayoutModule,
    MatDialogActions,
    MatPaginator
  ],
  templateUrl: './ajouter-vente.component.html',
  styleUrl: './ajouter-vente.component.scss'
})
export class AjouterVenteComponent implements OnInit {

  showPaymentMode = true
  applicableReduction: number = 0
  selectedPrescripteur: any
  selectedClient: any
  selectedOLdClient: any
  selectedOLdPrescripteur: any
  // reductionOptions: number[] = Array.from({length: 101}, (_, i) => i); // Generates percentages from 0 to 100
  reductionOptions: number[] = [0, 1, 2, 3, 4, 5]; // Generates percentages from 0 to 100
  tauxReduction = new FormControl({value: 0, disabled: true}); // Initially disabled
  reductionEnabled = new FormControl(false); // Toggle state

  prescripteurTypeControl = new FormControl('existing');
  prescripteurSearchControl = new FormControl('');
  prescripteurNameControl = new FormControl('');
  prescripteurOptions: { name: string }[] = [
    {name: 'Dr. Alice Johnson'},
    {name: 'Dr. Bob Smith'},
  ];

  clientSearchControl = new FormControl('');

  clientTypeControl = new FormControl(''); // Default value
  selectedClientControl = new FormControl(null);
  clientNameControl = new FormControl('');
  clientPhoneControl = new FormControl('');

  clientOptions: { id: number; name: string; phone: string; reduction: string }[] = [];

  // Autocomplete Médicaments
  medControl = new FormControl('');
  medOptions: any[] = [];

  displayedColumnsCredit: string[] = ['ref', 'client', 'vendeur', 'montant', 'dateVente', 'etat', 'actions'];

  // Table
  displayedColumns: string[] = [
    'nom',
    'prixUnitaire',
    'quantite',
    'prixTotal',
    'reduction',
    'dateLivraison',
    'type',
    'stockTotal',
    'action'
  ];

  dataSource:any[] = [];
  ventesCredit: any[] = [];
  pageCredit: number = 1;
  countCredit = 5;
  totalItemsCredit = 0;

  // Formulaires

  prescripteurName = new FormControl('');
  commentaire = new FormControl('');

  public showOptions: boolean = false;
  public settings: Settings;

  constructor(
    public authService: AuthService,
    public snackBar: MatSnackBar, public appSettings: SettingsService,
    public enRayonService: EnrayonsService,
    public productService: ProductService,
    public appSettingsService: AppSettingsService,
    public appService: AppService,
    public ventesService: VentesService,
    public usersService: UsersService,
    public prescripteursService: PrescripteursService,
    public dialog: MatDialog) {
    this.settings = this.appSettings.settings;
  }

  public changeTheme(theme: string) {
    this.settings.theme = theme;
  }

  loadMedOptions(): void {
    this.productService.getProducts(0, 100).subscribe({
      next: (response: any) => {
        this.medOptions = response.content.map((product: any) => ({
          id: product.id,
          name: product.nom,
          stock: product.stock,
        }));
      },
      error: (err: any) => {
        if (err.status === 401 || err.status === 403) {
          this.authService.logout();
          localStorage.removeItem('token');
          this.snackBar.open('Déconnexion réussie.', '×', {
            panelClass: 'success',
            verticalPosition: 'top',
            duration: 3000,
          });
          // Redirect to login page or clear session
          window.location.href = '/sign-in';
        }
        console.error('Failed to load products:', err);
      }
    });
  }


  // Totaux
  total = 0;
  totaleReduction = 0;
  netAPayer = 0;

  ngOnInit(): void {
    console.log("this.dataSource");
    console.log(this.dataSource);
    this.fetchVentesCreditPageable()
    this.clientTypeControl.patchValue('new');
    this.clientTypeControl.reset('new');
    this.reductionEnabled.reset(true)
    this.tauxReduction.enable();
    this.appSettingsService.getSetting("vente_mode").subscribe({
      next: (data: any) => {
        if (data.key != 'differe') {
          this.showPaymentMode = true
        } else {
          this.showPaymentMode = false
        }

      },
      error: (err: any) => {
        if (err.status === 401 || err.status === 403) {
          this.authService.logout();
          localStorage.removeItem('token');
          this.snackBar.open('Déconnexion réussie.', '×', {
            panelClass: 'success',
            verticalPosition: 'top',
            duration: 3000,
          });
          // Redirect to login page or clear session
          window.location.href = '/sign-in';
        }
        console.error('Error fetching products:', err);
      }
    })
    this.appService.getSystem().subscribe({
      next: (data: any) => {

      },
      error: (err) => {
        if (err.status === 401 || err.status === 403) {
          this.authService.logout();
          localStorage.removeItem('token');
          this.snackBar.open('Déconnexion réussie.', '×', {
            panelClass: 'success',
            verticalPosition: 'top',
            duration: 3000,
          });
          // Redirect to login page or clear session
          window.location.href = '/sign-in';
        }
        console.error('Error fetching products:', err);
      }
    });

    this.reductionOptions = [0, 1, 2, 3, 4, 5]; // Set reduction options

    this.reductionEnabled.valueChanges.subscribe((isEnabled) => {
      if (!isEnabled) {
        console.log('Reduction toggle deactivated');
        // Add logic to handle deactivation
        this.applicableReduction = 0; // Reset applicable reduction
        this.tauxReduction.reset(0); // Reset the reduction percentage to 0
        this.calculeTotaux();
      }
    });

    this.clientTypeControl.valueChanges.subscribe((value) => {
      if (value === 'new') {
        this.reductionOptions = [0, 1, 2, 3, 4, 5]
        this.reductionEnabled.setValue(true); // Enable the toggle
        this.applicableReduction = 0; // Reset applicable reduction
        this.tauxReduction.reset(0); // Reset the reduction percentage to 0
      } else {
        this.reductionOptions = [0]
        this.reductionEnabled.setValue(false); // Disable the toggle
        this.applicableReduction = 0; // Reset applicable reduction
      }
    });

    this.tauxReduction.valueChanges.subscribe((percent) => {
      if (this.reductionEnabled.value) {
        console.log("percent")
        console.log(percent)
        this.applicableReduction = percent; // Assign selected value to applicableReduction
        this.calculeTotaux();
      }
    });

    this.prescripteurSearchControl.valueChanges.subscribe((searchTerm) => {
      if (searchTerm) {
        this.searchPrescripteurs(searchTerm);
      }
    });

    this.clientSearchControl.valueChanges.subscribe((searchTerm) => {
      if (searchTerm) {
        this.searchClients(searchTerm);
      }
    });

    this.medControl.valueChanges.subscribe((searchTerm) => {
      if (searchTerm) {
        this.searchProducts(searchTerm);
      }
    });
    // this.loadMedOptions()

    this.loadClients();
    this.loadPrescripteurs();

    this.reductionEnabled.valueChanges.subscribe((isEnabled) => {
      if (isEnabled) {
        this.tauxReduction.enable(); // Enable the percentage input
      } else {
        this.tauxReduction.disable(); // Disable the percentage input
      }
    });

    // Exemple d’une ligne statique
    this.dataSource = [];
    this.calculeTotaux();
  }

  searchPrescripteurs(searchTerm: string): void {
    // Replace with actual service call
    this.prescripteurOptions = [
      {name: 'Dr. Alice Johnson'},
      {name: 'Dr. Bob Smith'},
      {name: 'Dr. Charlie Brown'},
    ].filter((prescripteur) =>
      prescripteur.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  onPrescripteurSelected(event: any): void {
    console.log('Selected prescriber:', event.option.value);
    this.selectedPrescripteur = this.prescripteurOptions.find(prescripteur => prescripteur.name === event.option.value);
  }

  onPrescripteurTypeChange(event: any): void {
    const value = event.value; // Extract the value from the event
    if (value === 'existing' || value === 'new') {

      this.prescripteurTypeControl.setValue(value); // Update the FormControl value
      if (value === 'new') {
        this.selectedOLdPrescripteur = this.selectedPrescripteur
        this.selectedPrescripteur = null
      }
      if (value === 'existing') {
        this.selectedPrescripteur = this.selectedOLdPrescripteur
      }
      this.calculeTotaux()
      console.log('Client Type Changed:', value);
    } else {
      console.error('Invalid prescripteur type:', value);
    }
  }

  calculeTotaux() {

    this.total = this.dataSource
      .map(l => {
        // this.applicableReduction = 0;
        // if (this.selectedClient && this.selectedClient.reduction) {
        //   // Compare client's reduction with product's reduction
        //   this.applicableReduction = Math.min(this.selectedClient.reduction, l.reduction);
        // } else {
        //   // No reduction for non-existing client
        //   this.applicableReduction = l.reduction;
        // }
        //
        // if (!this.selectedClient) {
        //   this.applicableReduction = 0
        // }

        // Calculate total price after applying the reduction
        const reducedPrice = l.prixTotal;
        return reducedPrice;
      })
      .reduce((a, b) => a + b, 0);

    console.log("this.dataSource")
    console.log(this.dataSource)
    this.totaleReduction = this.dataSource
      .map(l => {
        console.log("this.clientTypeControl.value")
        console.log(this.clientTypeControl.value)
        if (this.clientTypeControl.value == 'new') {
          this.applicableReduction = Math.min(this.applicableReduction, l.reduction);
        } else {
          this.applicableReduction = 0;
          if (this.selectedClient && this.selectedClient.reduction != undefined) {
            console.log("ici")
            this.applicableReduction = Math.min(this.selectedClient.reduction, l.reduction);
          } else {
            this.applicableReduction = l.reduction;
          }
          if (!this.selectedClient) {
            this.applicableReduction = 0
          }
        }

        console.log("this.applicableReduction")
        console.log(this.applicableReduction)
        return (l.prixTotal * (this.applicableReduction / 100));
      })
      .reduce((a, b) => a + b, 0);


    var reductionData = Math.ceil((this.totaleReduction / 5) * 5) + "";
    var firstData = reductionData.substr(0, reductionData.length - 2).toString();
    var lastData = "";
    var finalReductionTotal = 0;
    if (reductionData.length >= 2) {
      var second = parseInt(reductionData.substr(reductionData.length - 2));
      if (second < 100 && second >= 75) {
        lastData = "75";
      } else if (second < 75 && second >= 50) {
        lastData = "50";
      } else if (second < 50 && second >= 25) {
        lastData = "25";
      } else if (second < 25 && second >= 0) {
        lastData = "00";
      }
      this.totaleReduction = parseInt(firstData + lastData);
    }

    this.netAPayer = this.total - this.totaleReduction;
  }

  roundReduction(value: number): number {
    const hundredPart = Math.floor(value / 100) * 100
    const remainder = value % 100;
    if (remainder > 75) {
      return hundredPart + 75;
    } else if (remainder > 50) {
      return hundredPart + 50;
    } else if (remainder > 25) {
      return hundredPart + 25;
    } else if (remainder > 0) {
      return hundredPart;
    } else {
      return hundredPart;
    }
  }

  onAjouterLigne() {
    // logiques d’ajout…
    this.calculeTotaux();
  }


  openMedicamentDialog(med: any): void {
    console.log("med")
    console.log(med)
    this.enRayonService.getProduitsEnRayon(med.id).subscribe({
      next: (data: any) => {
        const dialogRef = this.dialog.open(AjouterVenteDialogComponent, {
          data: {
            type: med.type,
            id: med.id,
            name: med.name,
            enRayonList: data
          },
          // maxWidth: "400px",
          width: "80%",
          panelClass: ['theme-dialog'],
          autoFocus: false,
          direction: (this.settings.rtl) ? 'rtl' : 'ltr'
        });
        dialogRef.afterClosed().subscribe((modifiedProducts: any[]) => {
          console.log("modifiedProducts")
          console.log(modifiedProducts)
          if (modifiedProducts && modifiedProducts.length > 0) {
            const newData = modifiedProducts.map(product => {
              const existingProductIndex = this.dataSource.findIndex(item => item.nom === product.nom);
              if (existingProductIndex !== -1) {
                // Update the existing product
                this.dataSource[existingProductIndex] = {
                  ...this.dataSource[existingProductIndex],
                  quantite: product.quantiteRestante,
                  // quantite: this.dataSource[existingProductIndex].quantite + product.quantiteRestante,
                  prixTotal: (product.prixVente * product.quantiteRestante),
                  // prixTotal: this.dataSource[existingProductIndex].prixTotal + (product.prixVente * product.quantiteRestante),
                  reduction: product.reduction, // Adjust if needed
                };
                return null; // Skip adding a new entry
              }
              // Add as a new product
              return {
                id: product.id,
                nom: product.nom,
                type: product.type,
                rayonId: product.rayonId,
                prixUnitaire: product.prixVente,
                quantite: product.quantiteRestante,
                prixTotal: product.prixVente * product.quantiteRestante,
                reduction: product.reduction, // Adjust if needed
                dateLivraison: product.dateLivraison, // Adjust if needed
                datePeremption: product.datePeremption, // Adjust if needed
                // type: product.type,
                stockTotal: product.quantite // Adjust if needed
              };
            }).filter(item => item !== null);

            this.dataSource = [...this.dataSource, ...newData];
            this.medControl.reset(); // Clears the medControl value
            this.calculeTotaux(); // Recalculate totals
          }
        });
      },
      error: (err: any) => {
        console.error('Failed to fetch products in stock:', err);
        if (err.status === 401 || err.status === 403) {
          this.authService.logout();
          localStorage.removeItem('token');
          this.snackBar.open('Déconnexion réussie.', '×', {
            panelClass: 'success',
            verticalPosition: 'top',
            duration: 3000,
          });
          // Redirect to login page or clear session
          window.location.href = '/sign-in';
        } else
          alert('Une erreur est survenue lors de la récupération des produits en rayon.');
      },
    });
  }

  public searchProducts(searchTerm: string): void {

    this.productService.searchProducts(searchTerm, 0, 40).subscribe({
      // this.productService.searchProducts(this.searchTerm, this.page, this.count).subscribe({
      next: (data: any) => {
        this.medOptions = data.content.map((product: any) => ({
          id: product.id,
          type: product.type,
          name: product.nom,
          stock: product.stock,
        }));
        console.log("this.medOptions");
        console.log(this.medOptions);
      },
      error: (err) => {
        if (err.status === 401 || err.status === 403) {
          this.authService.logout();
          localStorage.removeItem('token');
          this.snackBar.open('Déconnexion réussie.', '×', {
            panelClass: 'success',
            verticalPosition: 'top',
            duration: 3000,
          });
          // Redirect to login page or clear session
          window.location.href = '/sign-in';
        }
        console.error('Error searching products:', err);
      }
    });
  }

  deleteProduct(product: VenteLigne): void {
    const index = this.dataSource.findIndex(item => item.nom === product.nom);
    if (index !== -1) {
      this.dataSource.splice(index, 1);
      this.dataSource = [...this.dataSource]; // Refresh the table
      this.calculeTotaux(); // Recalculate totals
    }
  }


  searchClients(searchTerm: string): void {
    // // Replace with actual service call
    // this.clientOptions = [
    //   { name: 'John Doe', phone: '123456789' },
    //   { name: 'Jane Smith', phone: '987654321' }
    // ].filter(client => client.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }

  onClientSelected(event: any): void {
    this.selectedClient = this.clientOptions.find(client => client.name === event.option.value);
    console.log("selectedClient")
    console.log(this.selectedClient)
    // if (selectedClient) {
    //   this.clientName.setValue(selectedClient.name);
    //   this.clientPhone.setValue(selectedClient.phone);
    // }
    this.calculeTotaux();
  }

  onClientTypeChange(event: any): void {
    const value = event.value; // Extract the value from the event
    if (value === 'existing' || value === 'new') {

      this.clientTypeControl.setValue(value); // Update the FormControl value
      if (value === 'new') {
        this.selectedOLdClient = this.selectedClient
        this.selectedClient = null
      }
      if (value === 'existing') {
        this.selectedClient = this.selectedOLdClient
      }
      this.calculeTotaux()
      console.log('Client Type Changed:', value);
    } else {
      console.error('Invalid client type:', value);
    }
  }

  loadClients(): void {
    this.usersService.getUsers().subscribe({
      next: (data) => {
        this.clientOptions = data.map((client: any) => ({
          name: client.nom + " " + client.prenom,
          phone: client.telephone,
          id: client.id,
          reduction: client.reduction
        }));
        console.log('Clients loaded:', this.clientOptions);
      },
      error: (err) => {
        if (err.status === 401 || err.status === 403) {
          this.authService.logout();
          localStorage.removeItem('token');
          this.snackBar.open('Déconnexion réussie.', '×', {
            panelClass: 'success',
            verticalPosition: 'top',
            duration: 3000,
          });
          // Redirect to login page or clear session
          window.location.href = '/sign-in';
        }
        console.error('Error loading clients:', err);
      }
    });
  }

  loadPrescripteurs(): void {
    this.prescripteursService.getPrescripteurs().subscribe({
      next: (data) => {
        this.prescripteurOptions = data.map((prescipteur: any) => ({
          name: prescipteur.name,
        }));
        console.log('Prescripteurs loaded:', this.prescripteurOptions);
      },
      error: (err) => {
        if (err.status === 401 || err.status === 403) {
          this.authService.logout();
          localStorage.removeItem('token');
          this.snackBar.open('Déconnexion réussie.', '×', {
            panelClass: 'success',
            verticalPosition: 'top',
            duration: 3000,
          });
          // Redirect to login page or clear session
          window.location.href = '/sign-in';
        }
        console.error('Error loading clients:', err);
      }
    });
  }

  onPayer(mode: 'comptant' | 'assurance' | 'credit') {
    // Retrieve all data from the dataSource
    const venteLignes = this.dataSource;

    // Retrieve client information
    const clientInfo = this.selectedClient
      ? {id: this.selectedClient.id, type: 'existing', ...this.selectedClient}
      : this.clientTypeControl.value === 'new'
        ? {type: 'new', name: this.clientNameControl.value, phone: this.clientPhoneControl.value}
        : {type: 'none'};

    // Retrieve prescripteur information
    const prescripteurInfo = this.selectedPrescripteur
      ? {id: this.selectedPrescripteur.id, type: 'existing', ...this.selectedPrescripteur}
      : this.prescripteurTypeControl?.value === 'new'
        ? {type: 'new', name: this.prescripteurNameControl.value}
        : {type: 'none'};

    // Retrieve comments and other fields
    const comments = this.commentaire?.value || '';
    const otherFields = {
      total: this.total,
      totaleReduction: this.totaleReduction,
      netAPayer: this.netAPayer,
    };

    // Combine all data into a single object
    const paymentData = {
      mode,
      venteLignes,
      clientInfo,
      prescripteurInfo,
      comments,
      ...otherFields,
    };

    console.log('Payment Data:', paymentData);

    // Proceed with payment logic (e.g., send to backend)

    const paymentVenteData: any = {
      reduction: this.applicableReduction,
      clientInfo: clientInfo,
      prescripteurInfo: prescripteurInfo,
      reductionEnabled: this.reductionEnabled.value,
      prixTotal: this.total,
      prixReduction: this.totaleReduction,
      commentaire: comments, // Sale comments
      etat: mode.toUpperCase(), // Sale state: "COMPTANT", "ASSURANCE", or "CREDIT"
      produits: venteLignes.map(ligne => ({
        produitId: ligne.id, // Assuming `id` exists in `VenteLigne`
        quantite: ligne.quantite,
        type: ligne.type,
        rayonId: ligne.rayonId,
        reduction: ligne.reduction,
        prixUnit: ligne.prixUnitaire
      }))
    };

    if (this.showPaymentMode) {
      if (mode == "credit") {
        this.ventesService.creerVenteSansEncaissement(paymentVenteData).subscribe({
          next: (response: any) => {
            // Reset form controls
            this.clientTypeControl.reset('');
            this.selectedClient = null;
            this.selectedOLdClient = null;
            this.clientNameControl.reset('');
            this.clientPhoneControl.reset('');
            this.prescripteurTypeControl.reset('existing');
            this.selectedPrescripteur = null;
            this.selectedOLdPrescripteur = null;
            this.prescripteurNameControl.reset('');
            this.commentaire.reset('');

            // Reset table data
            this.dataSource = [];
            this.fetchVentesCreditPageable();
            this.clientTypeControl.reset('new');
            this.reductionEnabled.reset(true)
            this.tauxReduction.enable();
            // Reset totals
            this.total = 0;
            this.totaleReduction = 0;
            this.netAPayer = 0;
            this.snackBar.open("Sale created successfully", '×', {
              panelClass: 'success',
              verticalPosition: 'top',
              duration: 3000
            });
          },
          error: (err: any) => {
            console.error('Failed to create sale:', err);
            if (err.status === 401 || err.status === 403) {
              this.authService.logout();
              this.snackBar.open('Déconnexion réussie.', '×', {
                panelClass: 'success',
                verticalPosition: 'top',
                duration: 3000,
              });
              // Redirect to login page or clear session
              window.location.href = '/sign-in';
            } else
              this.snackBar.open('Failed to create sale', '×', {
                panelClass: 'error',
                verticalPosition: 'top',
                duration: 3000
              });
          }
        });
      } else {
        const dialogRef = this.dialog.open(PaymentDialogComponent, {
          data: paymentVenteData,
          // maxWidth: "400px",
          // width: "80%",
          panelClass: ['theme-dialog'],
          autoFocus: false,
          direction: (this.settings.rtl) ? 'rtl' : 'ltr'
        });
        dialogRef.afterClosed().subscribe((modifiedProducts: any) => {
          console.log("modifiedProducts")
          console.log(modifiedProducts)
          if (modifiedProducts.reference) {
            // Reset form controls
            this.clientTypeControl.reset('');
            this.selectedClient = null;
            this.selectedOLdClient = null;
            this.clientNameControl.reset('');
            this.clientPhoneControl.reset('');
            this.prescripteurTypeControl.reset('existing');
            this.selectedPrescripteur = null;
            this.selectedOLdPrescripteur = null;
            this.prescripteurNameControl.reset('');
            this.commentaire.reset('');
            this.clientTypeControl.reset('new');
            this.reductionEnabled.reset(true)
            this.tauxReduction.enable();
            // Reset table data
            this.dataSource = [];
            this.fetchVentesCreditPageable();
            // Reset totals
            this.total = 0;
            this.totaleReduction = 0;
            this.netAPayer = 0;
          }
        });
      }

    } else {
      this.ventesService.creerVenteSansEncaissement(paymentVenteData).subscribe({
        next: (response: any) => {
          // Reset form controls
          this.clientTypeControl.reset('');
          this.selectedClient = null;
          this.selectedOLdClient = null;
          this.clientNameControl.reset('');
          this.clientPhoneControl.reset('');
          this.prescripteurTypeControl.reset('existing');
          this.selectedPrescripteur = null;
          this.selectedOLdPrescripteur = null;
          this.prescripteurNameControl.reset('');
          this.commentaire.reset('');

          // Reset table data
          this.dataSource = [];
          this.fetchVentesCreditPageable();
          // Reset totals
          this.total = 0;
          this.totaleReduction = 0;
          this.netAPayer = 0;
          this.snackBar.open("Sale created successfully", '×', {
            panelClass: 'success',
            verticalPosition: 'top',
            duration: 3000
          });
        },
        error: (err: any) => {
          console.error('Failed to create sale:', err);
          if (err.status === 401 || err.status === 403) {
            this.authService.logout();
            this.snackBar.open('Déconnexion réussie.', '×', {
              panelClass: 'success',
              verticalPosition: 'top',
              duration: 3000,
            });
            // Redirect to login page or clear session
            window.location.href = '/sign-in';
          } else
            this.snackBar.open('Failed to create sale', '×', {
              panelClass: 'error',
              verticalPosition: 'top',
              duration: 3000
            });
        }
      });
    }

  }

  currentDate = new Date();

  isExpired(datePeremption: Date): boolean {
    return new Date(datePeremption) < this.currentDate;
  }

  isExpiringSoon(datePeremption: Date): boolean {
    const diffInDays = (new Date(datePeremption).getTime() - this.currentDate.getTime()) / (1000 * 60 * 60 * 24);
    return diffInDays > 0 && diffInDays <= 90;
  }

  isValid(datePeremption: Date): boolean {
    const diffInDays = (new Date(datePeremption).getTime() - this.currentDate.getTime()) / (1000 * 60 * 60 * 24);
    return diffInDays > 90;
  }

  fetchVentesCreditPageable(): void {
    const formatDate = (date: string | null): string | null => {
      if (!date) return null;
      const parsedDate = new Date(date);
      return `${parsedDate.getFullYear()}-${String(parsedDate.getMonth() + 1).padStart(2, '0')}-${String(parsedDate.getDate()).padStart(2, '0')}T${String(parsedDate.getHours()).padStart(2, '0')}:${String(parsedDate.getMinutes()).padStart(2, '0')}:${String(parsedDate.getSeconds()).padStart(2, '0')}`;
    };

    // const formattedStartDate = formatDate(this.startDate);
    // const formattedEndDate = formatDate(this.endDate);

    this.ventesService.fetchVentesCreditPageable(
      this.pageCredit - 1,
      this.countCredit
    ).subscribe({
      next: (data: any) => {
        this.countCredit = data.pageable.pageSize;
        this.totalItemsCredit = data.totalElements;
        this.ventesCredit = data.content;
      },
      error: (err) => {
        console.error('Error fetching commandes:', err);
        if (err.status === 401 || err.status === 403){
          this.authService.logout();
          localStorage.removeItem('token');
          this.snackBar.open('Déconnexion réussie.', '×', {
            panelClass: 'success',
            verticalPosition: 'top',
            duration: 3000,
          });
          // Redirect to login page or clear session
          window.location.href = '/sign-in';
        }
      }
    });
  }

  public onPageChangedCredit(event: PageEvent) {
    this.pageCredit = event.pageIndex + 1;
    this.countCredit = event.pageSize;
    this.fetchVentesCreditPageable();
  }

  encaisserVenteCredit(venteId:any){
    this.ventesService.envoyerVentreCreditEnCaisse(
      venteId
    ).subscribe({
      next: (data: any) => {
        this.snackBar.open("Vente envoyer en caisse avec success", '×', {
          panelClass: 'success',
          verticalPosition: 'top',
          duration: 3000
        });
        this.fetchVentesCreditPageable();
      },
      error: (err) => {
        console.error('Error fetching commandes:', err);
        if (err.status === 401 || err.status === 403){
          this.authService.logout();
          localStorage.removeItem('token');
          this.snackBar.open('Déconnexion réussie.', '×', {
            panelClass: 'success',
            verticalPosition: 'top',
            duration: 3000,
          });
          // Redirect to login page or clear session
          window.location.href = '/sign-in';
        }
      }
    });
  }

}
