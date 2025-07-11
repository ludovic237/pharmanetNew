import {Component, OnInit} from '@angular/core';
import {UsersService} from "@services/users.service";
import {SettingsService} from "@services/settings.service";
import {CommandesService} from "@services/commandes.service";
import {FournisseursService} from "@services/fournisseurs.service";
import {EnrayonsService} from "@services/enrayons.service";
import {ProductService} from "@services/products.service";
import {VentesService} from "@services/ventes.service";
import {PrescripteursService} from "@services/prescripteurs.service";
import {MatMenuModule} from "@angular/material/menu";
import {MatListModule} from "@angular/material/list";
import {MatChipsModule} from "@angular/material/chips";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {FormBuilder, FormControl, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatDividerModule} from "@angular/material/divider";
import {MatExpansionModule} from "@angular/material/expansion";
import {CommonModule} from "@angular/common";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatTabsModule} from "@angular/material/tabs";
import {MatIconModule} from "@angular/material/icon";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {MatTableModule} from "@angular/material/table";
import {MatCardModule} from "@angular/material/card";
import {MatButtonModule} from "@angular/material/button";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatNativeDateModule} from "@angular/material/core";
import {MatSelectModule} from "@angular/material/select";
import {FlexLayoutModule} from "@ngbracket/ngx-layout";
import {MatStepperModule} from "@angular/material/stepper";
import {MatRadioModule} from "@angular/material/radio";
import {MatSnackBarModule} from "@angular/material/snack-bar";
import {NgxPaginationModule} from "ngx-pagination";
import {MatPaginator} from "@angular/material/paginator";
import {AppService} from "@services/app.service";
import {CategorieService} from "@services/categories.service";
import {MatDialog} from "@angular/material/dialog";
import {DomHandlerService} from "@services/dom-handler.service";
import {CaisseService} from "@services/caisse.service";

@Component({
  selector: 'app-rapport-caisse',
  providers: [UsersService,
    SettingsService,
    CommandesService,
    FournisseursService,
    EnrayonsService,
    ProductService,
    UsersService,
    VentesService,
    PrescripteursService],
  imports: [
    MatMenuModule,
    MatListModule,
    MatChipsModule,
    MatSlideToggleModule,
    FormsModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule,
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
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    // Material
    MatStepperModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatRadioModule,
    MatIconModule,
    MatCardModule,
    MatSnackBarModule,
    MatChipsModule,
    NgxPaginationModule,
    MatPaginator,
  ],
  templateUrl: './rapport-caisse.component.html',
  styleUrl: './rapport-caisse.component.scss'
})
export class RapportCaisseComponent implements OnInit {

  startDate: Date | null = null;
  endDate: Date | null = null;

  currentDate: Date = new Date();
  caissier: string = 'NK';
  session: string = 'Matin';

  caisses: any[] = []; // List of caisses
  caisseControl = new FormControl(); // Form control for mat-select

  resultRapport: any

// Données pour les sections de statistiques
  venteParFournisseurData: any[] = [
    {type: 'Grossiste', montant: 0},
    {type: 'Detaillant', montant: 0},
    {type: 'Produits Detaillés', montant: 0},
    {type: 'Total', montant: 0}
  ];

  venteParTypeData: any[] = [
    {type: 'Comptant', montant: 0},
    {type: 'Crédit', montant: 0},
    {type: 'Assurance', montant: 0},
  ];

  encaissementVenteData: any[] = [
    {mode: 'Espèce', montant: 0},
    {mode: 'Électronique', montant: 0},
    {mode: 'Bon de caisse', montant: 0},
    {mode: 'Total', montant: 0}
  ];

  etatCaisseData: any[] = [
    {mode: 'Espèce', soldeReel: 0, soldeSysteme: 0, difference: 0},
    {mode: 'Électronique', soldeReel: 0, soldeSysteme: 0, difference: 0},
    {mode: 'Bon de caisse', soldeReel: 0, soldeSysteme: 0, difference: 0},
    {mode: 'Total', soldeReel: 0, soldeSysteme: 0, difference: 0}
  ];

  encaissementFactureData: any[] = [
  ];

// DataSources pour les tableaux
  bonCaisseGeneres: any[] = [];
  bonCaisseEncaisse: any[] = [];
  retourProduits: any[] = [];
  depenses: any[] = [];
  bonCaisseEncaisseDataSource: any[] = [];

// Colonnes des tableaux
  bonCaisseColumns: string[] = ['numeroBon', 'nomClient', 'montant'];
  bonCaisseEncaisseColumns: string[] = ['numeroBon', 'montant'];
  retourCaisseColumns: string[] = ['reference', 'produit', 'quantite', 'total'];
  EtatColumns: string[] = ['numeroBon', 'montant'];
  depensesColumns: string[] = ['designation', 'quantite', 'prixUnitaire', 'total'];
  bonCaisseEnColumns: string[] = ['nomClient', 'codebarreId', 'montant'];

  constructor(
    public appService: AppService,
    public caisseService: CaisseService,
    public categorieService: CategorieService,
    public dialog: MatDialog,
    public fb: FormBuilder,
    public domHandlerService: DomHandlerService) {
  }

  ngOnInit(): void {
// Initialisation des données des tableaux (vides selon l'image)
    this.loadCaisses();
    this.getRapportCaisse();
  }

// Méthode pour obtenir la classe CSS selon le type
  getRowClass(type: string): string {
    if (type === 'Total') {
      return 'total-row';
    }
    return '';
  }

// Méthode pour formater les montants
  formatMontant(montant: number): string {
    return montant.toLocaleString('fr-FR');
  }

// Méthode pour obtenir la couleur selon le montant
  getMontantColor(montant: number): string {
    if (montant === 0) {
      return 'zero-amount';
    } else if (montant > 100000) {
      return 'high-amount';
    }
    return 'normal-amount';
  }

  public getRapportCaisse(): void {
    this.caisseService.getCaisseReport(5).subscribe({
      // this.productService.searchProducts(this.searchTerm, this.page, this.count).subscribe({
      next: (data: any) => {
        console.log("data");
        console.log(data);
        this.resultRapport = data;
        this.bonCaisseGeneres = this.resultRapport.bonCaisseGeneres
        this.bonCaisseEncaisse = this.resultRapport.bonCaisseEncaisse
        this.depenses = this.resultRapport.depenses
        this.encaissementFactureData = this.resultRapport.encaissementFactureData
        this.retourProduits = this.resultRapport.retourProduits
        console.log("resultRapport");
        console.log(this.resultRapport)
        this.venteParFournisseurData = [
          {type: 'Grossiste', montant: data.prixTotalGrossiste},
          {type: 'Detaillant', montant: data.prixTotalDetaillant},
          {type: 'Produits Detaillés', montant: data.prixTotalDetail},
          {type: 'Total', montant: (data.prixTotalGrossiste + data.prixTotalDetaillant + data.prixTotalDetail)}
        ];
        this.venteParTypeData = [
          {type: 'Comptant', montant: data.prixTotalVenteComptant},
          {type: 'Crédit', montant: data.prixTotalVenteCredit},
          {type: 'Assurance', montant: data.prixTotalVenteAssurance},
          {
            type: 'Total',
            montant: (data.prixTotalVenteAssurance + data.prixTotalVenteComptant + data.prixTotalVenteCredit)
          },
        ];

        this.encaissementVenteData = [
          {mode: 'Espèce', montant: data.soldeSystemeEspece},
          {mode: 'Électronique', montant: data.soldeSystemeElectronique},
          {mode: 'Bon de caisse', montant: data.soldeSystemeTicket},
          {mode: 'Total', montant: (data.soldeSystemeEspece+data.soldeSystemeElectronique+data.soldeSystemeTicket)}
        ];

        this.etatCaisseData = [
          {mode: 'Espèce', soldeReel: data.soldeReelEspece, soldeSysteme: data.soldeSystemeEspece, difference: (data.soldeReelEspece-data.soldeSystemeEspece)},
          {mode: 'Électronique', soldeReel: data.soldeReelElectronique, soldeSysteme: data.soldeSystemeElectronique, difference: (data.soldeReelElectronique-data.soldeSystemeElectronique)},
          {mode: 'Bon de caisse', soldeReel: data.soldeReelTicket, soldeSysteme: data.soldeSystemeTicket, difference: (data.soldeReelTicket-data.soldeSystemeTicket)},
          {mode: 'Total', soldeReel: data.soldeReelTotal, soldeSysteme: data.soldeSystemelTotal, difference: (data.soldeReelTotal-data.soldeSystemelTotal)}
        ];
      },
      error: (err) => {
        console.error('Error searching products:', err);
      }
    });
  }

  loadCaisses(): void {
    this.caisseService.getAllCaisses(0, 10, 'id').subscribe({
      next: (data: any) => {
        this.caisses = data.content; // Assuming the API returns a pageable response
      },
      error: (err:any) => {
        console.error('Error loading caisses:', err);
      }
    });
  }

  applyFilters(): void {
    const filters = {
      caisseId: this.caisseControl.value,
      startDate: this.startDate,
      endDate: this.endDate
    };

    this.caisseService.getFilteredCaisses(filters).subscribe({
      next: (data: any) => {
        this.caisses = data.content;
      },
      error: (err) => {
        console.error('Error applying filters:', err);
      }
    });
  }

}
