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
import {MatDialog} from "@angular/material/dialog";
import {EnrayonsService} from "@services/enrayons.service";
import {ProductService} from "@services/products.service";
import {MatRadioButton, MatRadioGroup, MatRadioModule} from "@angular/material/radio";
import {UsersService} from "@services/users.service";
import {PrescripteursService} from "@services/prescripteurs.service";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {MatSnackBar} from "@angular/material/snack-bar";
import {AuthService} from "@services/auth.service";
import {LoaderService} from "@services/loader.service";

interface VenteLigne {
  id: string;
  nom: string;
  prixUnitaire: number;
  quantite: number;
  prixTotal: number;
  reduction: number;
  dateLivraison: Date;
  type: string;
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
    FlexLayoutModule
  ],
  templateUrl: './ajouter-vente.component.html',
  styleUrl: './ajouter-vente.component.scss'
})
export class AjouterVenteComponent implements OnInit {

  applicableReduction: number = 0
  selectedPrescripteur: any
  selectedClient: any
  selectedOLdClient: any
  selectedOLdPrescripteur: any
  reductionOptions: number[] = Array.from({length: 101}, (_, i) => i); // Generates percentages from 0 to 100
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
  medOptions: { name: string }[] = [];

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

  dataSource = new MatTableDataSource<VenteLigne>([]);

  // Formulaires

  prescripteurName = new FormControl('');
  commentaire = new FormControl('');

  public showOptions: boolean = false;
  public settings: Settings;

  constructor(
    public loaderService: LoaderService,
    public authService: AuthService, public appSettings: SettingsService,
    public snackBar: MatSnackBar,
    public enRayonService: EnrayonsService,
    public productService: ProductService,
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
          name: product.nom
        }));
      },
      error: (err: any) => {
        console.error('Failed to load products:', err);
      }
    });
  }


  // Totaux
  total = 0;
  totaleReduction = 0;
  netAPayer = 0;

  ngOnInit(): void {

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
    this.dataSource.data = [];
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

    } else {

    }
  }

  calculeTotaux() {

    this.total = this.dataSource.data
      .map(l => {
        this.applicableReduction = 0;
        if (this.selectedClient && this.selectedClient.reduction) {
          // Compare client's reduction with product's reduction
          this.applicableReduction = Math.min(this.selectedClient.reduction, l.reduction);
        } else {
          // No reduction for non-existing client
          this.applicableReduction = l.reduction;
        }

        if (!this.selectedClient) {
          this.applicableReduction = 0
        }

        // Calculate total price after applying the reduction
        const reducedPrice = l.prixTotal * (1 - this.applicableReduction / 100);
        return reducedPrice;
      })
      .reduce((a, b) => a + b, 0);

    this.totaleReduction = this.dataSource.data
      .map(l => {
        this.applicableReduction = 0;
        if (this.selectedClient && this.selectedClient.reduction) {
          this.applicableReduction = Math.min(this.selectedClient.reduction, l.reduction);
        } else {
          this.applicableReduction = l.reduction;
        }
        if (!this.selectedClient) {
          this.applicableReduction = 0
        }
        return l.prixTotal * (this.applicableReduction / 100);
      })
      .reduce((a, b) => a + b, 0);
    this.netAPayer = this.total;
  }

  onAjouterLigne() {
    // logiques d’ajout…
    this.calculeTotaux();
  }


  openMedicamentDialog(med: any): void {

    this.enRayonService.getProduitsEnRayon(med.id).subscribe({
      next: (data: any) => {
        const dialogRef = this.dialog.open(AjouterVenteDialogComponent, {
          data: {name: med.name, enRayonList: data},
          // maxWidth: "400px",
          width: "80%",
          panelClass: ['theme-dialog'],
          autoFocus: false,
          direction: (this.settings.rtl) ? 'rtl' : 'ltr'
        });
        dialogRef.afterClosed().subscribe((modifiedProducts: any[]) => {
          if (modifiedProducts && modifiedProducts.length > 0) {
            const newData = modifiedProducts.map(product => {
              const existingProductIndex = this.dataSource.data.findIndex(item => item.nom === product.produit.nom);
              if (existingProductIndex !== -1) {
                // Update the existing product
                this.dataSource.data[existingProductIndex] = {
                  ...this.dataSource.data[existingProductIndex],
                  quantite: product.quantiteRestante,
                  // quantite: this.dataSource.data[existingProductIndex].quantite + product.quantiteRestante,
                  prixTotal: (product.prixVente * product.quantiteRestante),
                  // prixTotal: this.dataSource.data[existingProductIndex].prixTotal + (product.prixVente * product.quantiteRestante),
                  reduction: product.reduction, // Adjust if needed
                };
                return null; // Skip adding a new entry
              }
              // Add as a new product
              return {
                id: product.id,
                nom: product.produit.nom,
                prixUnitaire: product.prixVente,
                quantite: product.quantiteRestante,
                prixTotal: product.prixVente * product.quantiteRestante,
                reduction: product.reduction, // Adjust if needed
                dateLivraison: product.dateLivraison, // Adjust if needed
                type: 'Générique', // Adjust if needed
                stockTotal: product.quantite // Adjust if needed
              };
            }).filter(item => item !== null);

            this.dataSource.data = [...this.dataSource.data, ...newData];
            this.calculeTotaux(); // Recalculate totals
          }
        });

      },
      error: (err: any) => {

        console.error('Failed to fetch products in stock:', err);
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
          name: product.nom
        }));

      },
      error: (err) => {

        console.error('Error searching products:', err);
      }
    });
  }

  deleteProduct(product: VenteLigne): void {
    const index = this.dataSource.data.findIndex(item => item.nom === product.nom);
    if (index !== -1) {
      this.dataSource.data.splice(index, 1);
      this.dataSource.data = [...this.dataSource.data]; // Refresh the table
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
      // console.log('Client Type Changed:', value);
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

      },
      error: (err) => {

      }
    });
  }

  loadPrescripteurs(): void {

    this.prescripteursService.getPrescripteurs().subscribe({
      next: (data) => {
        this.prescripteurOptions = data.map((prescipteur: any) => ({
          name: prescipteur.name,
        }));

      },
      error: (err) => {

        console.error('Error loading clients:', err);
      }
    });
  }

  onPayer(mode: 'comptant' | 'assurance' | 'credit') {
    // Retrieve all data from the dataSource
    const venteLignes = this.dataSource.data;

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

    // Proceed with payment logic (e.g., send to backend)

    const paymentVenteData: any = {
      clientInfo: clientInfo,
      prescripteurInfo: prescripteurInfo,
      prixTotal: this.total, // Total price of the sale
      commentaire: comments, // Sale comments
      etat: mode.toUpperCase(), // Sale state: "COMPTANT", "ASSURANCE", or "CREDIT"
      produits: venteLignes.map(ligne => ({
        produitId: ligne.id, // Assuming `id` exists in `VenteLigne`
        quantite: ligne.quantite,
        prixUnit: ligne.prixUnitaire
      }))
    };

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
        this.dataSource.data = [];

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

        this.snackBar.open('Failed to create sale', '×', {
          panelClass: 'error',
          verticalPosition: 'top',
          duration: 3000
        });
      }
    });
  }

}
