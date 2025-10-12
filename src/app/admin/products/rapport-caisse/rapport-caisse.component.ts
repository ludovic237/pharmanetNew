import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
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
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
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
import {AuthService} from "@services/auth.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import html2canvas from "html2canvas";
import {jsPDF} from "jspdf";
import {LoaderService} from "@services/loader.service";

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
    NgxPaginationModule
  ],
  templateUrl: './rapport-caisse.component.html',
  styleUrl: './rapport-caisse.component.scss'
})
export class RapportCaisseComponent implements OnInit {

  @ViewChild('pdfContent', {static: false}) pdfContent!: ElementRef;

  dataCaisse: any = null;

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
    {type: 'Reduction', montant: 0},
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
    {mode: 'Rendu', montant: 0},
    {mode: 'Total', montant: 0}
  ];

  etatCaisseData: any[] = [
    {mode: 'Espèce', soldeReel: 0, soldeSysteme: 0, difference: 0},
    {mode: 'Électronique', soldeReel: 0, soldeSysteme: 0, difference: 0},
    {mode: 'Bon de caisse', soldeReel: 0, soldeSysteme: 0, difference: 0},
    {mode: 'Rendu', soldeReel: 0, soldeSysteme: 0, difference: 0},
    {mode: 'Total', soldeReel: 0, soldeSysteme: 0, difference: 0}
  ];

  encaissementFactureData: any[] = [];

// DataSources pour les tableaux
  bonCaisseGeneres: any[] = [];
  totalBonCaisseGeneres = 0;
  bonCaisseEncaisse: any[] = [];
  totalBonCaisseEncaisse = 0;
  retourProduits: any[] = [];
  depenses: any[] = [];
  totalDepenses = 0;
  totalRetourProduits = 0;
  totalEncaissementFactureCredit = 0;
  bonCaisseEncaisseDataSource: any[] = [];

// Colonnes des tableaux
  bonCaisseColumns: string[] = ['numeroBon', 'nomClient', 'montant'];
  bonCaisseEncaisseColumns: string[] = ['numeroBon', 'montant'];
  retourCaisseColumns: string[] = ['reference', 'produit', 'quantite', 'total'];
  EtatColumns: string[] = ['numeroBon', 'montant'];
  depensesColumns: string[] = ['designation', 'prixUnitaire'];
  bonCaisseEnColumns: string[] = ['nomClient', 'codebarreId', 'montant'];

  sessionForm!: FormGroup;

  constructor(
    public loaderService: LoaderService,
    public authService: AuthService,
    public snackBar: MatSnackBar,
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
    // this.getRapportCaisse();
    // this.applyFilters();
    this.sessionForm = this.fb.group({
      nombre: [10, [Validators.required, Validators.min(1)]]
    });
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
    const caisseId = this.caisseControl.value

    this.caisseService.getCaisseReport(caisseId).subscribe({
      // this.productService.searchProducts(this.searchTerm, this.page, this.count).subscribe({
      next: (data: any) => {
        console.log("data");
        console.log(data);
        this.dataCaisse = data
        this.totalBonCaisseGeneres = 0
        this.totalBonCaisseEncaisse = 0
        this.totalDepenses = 0
        this.totalRetourProduits = 0
        this.totalEncaissementFactureCredit = 0

        this.caissier = ""
        this.session = ""
        this.startDate = null
        this.endDate = null

        this.caissier = data.caisse.user.identifiant
        this.session = data.caisse.session
        this.startDate = data.caisse.dateOuvert
        this.endDate = data.caisse.dateFerme

        this.resultRapport = data;

        this.bonCaisseGeneres = this.resultRapport.bonCaisseGeneres
        this.bonCaisseGeneres.forEach((item: any) => {
          this.totalBonCaisseGeneres = this.totalBonCaisseGeneres + item.montant;
        });

        this.bonCaisseEncaisse = this.resultRapport.bonCaisseEncaisse
        this.bonCaisseEncaisse.forEach((item: any) => {
          this.totalBonCaisseEncaisse = this.totalBonCaisseEncaisse + item.montant;
        });

        this.depenses = this.resultRapport.depenses
        this.depenses.forEach((item: any) => {
          this.totalDepenses = this.totalDepenses + item.prixUnitaire;
        });

        this.encaissementFactureData = this.resultRapport.encaissementFactureData
        this.encaissementFactureData.forEach((data) => {
          this.totalEncaissementFactureCredit += data.prixTotal
        })

        this.retourProduits = this.resultRapport.retourProduits
        this.retourProduits.forEach((item: any) => {
          this.totalRetourProduits = this.totalRetourProduits + item.total;
        });

        console.log("resultRapport");
        console.log(this.resultRapport)
        this.venteParFournisseurData = [
          {type: 'Grossiste', montant: data.prixTotalGrossiste},
          {type: 'Detaillant', montant: data.prixTotalDetaillant},
          {type: 'Produits Detaillés', montant: data.prixTotalDetail},
          {type: 'Reduction', montant: -data.prixTotalVenteReduction},
          {
            type: 'Total',
            montant: (data.prixTotalGrossiste + data.prixTotalDetaillant + data.prixTotalDetail) - data.prixTotalVenteReduction
          }
        ];
        this.venteParTypeData = [
          {type: 'Comptant', montant: data.totalVenteComptant},
          {type: 'Crédit', montant: data.totalVenteCredit},
          {type: 'Assurance', montant: data.totalVenteAssurance},
          {
            type: 'Total',
            montant: (data.totalVenteComptant + data.totalVenteCredit + data.totalVenteAssurance)
          },
        ];

        this.encaissementVenteData = [
          {mode: 'Espèce', montant: data.soldeSystemeEspece},
          {mode: 'Électronique', montant: data.soldeSystemeElectronique},
          {mode: 'Bon de caisse', montant: data.soldeSystemeTicket},
          {mode: 'Rendu', montant: -data.prixTotalFactureRendu},
          {
            mode: 'Total',
            montant: (data.soldeSystemeEspece + data.soldeSystemeElectronique + data.soldeSystemeTicket) - data.prixTotalFactureRendu
          }
        ];

        this.etatCaisseData = [
          {
            mode: 'Espèce',
            soldeReel: data.soldeReelEspece,
            soldeSysteme: data.soldeSystemeEspece,
            difference: (data.soldeReelEspece - data.soldeSystemeEspece)
          },
          {
            mode: 'Électronique',
            soldeReel: data.soldeReelElectronique,
            soldeSysteme: data.soldeSystemeElectronique,
            difference: (data.soldeReelElectronique - data.soldeSystemeElectronique)
          },
          {
            mode: 'Bon de caisse',
            soldeReel: data.soldeReelTicket,
            soldeSysteme: data.soldeSystemeTicket,
            difference: (data.soldeReelTicket - data.soldeSystemeTicket)
          },
          {
            mode: 'Rendu',
            soldeReel: 0,
            soldeSysteme: data.prixTotalFactureRendu,
            difference: (0 - data.prixTotalFactureRendu)
          },
          {
            mode: 'Total',
            soldeReel: data.soldeReelTotal,
            soldeSysteme: data.soldeSystemelTotal - data.prixTotalFactureRendu,
            difference: (data.soldeReelTotal - (data.soldeSystemelTotal - data.prixTotalFactureRendu))
          }
        ];

      },
      error: (err: any) => {

        console.error('Error searching products:', err);
        if (err.status === 401 || err.status === 403) {

          this.authService.logout().subscribe({
            next: (data) => {

              localStorage.removeItem('token');
              localStorage.setItem("lastLink", window.location.href);
              window.location.href = '/sign-in';
              this.snackBar.open('Déconnexion réussie.', '×', {
                panelClass: 'success',
                verticalPosition: 'top',
                duration: 3000,
              });
            },
            error: (err) => {

              console.error('Error  subscription:', err);
              if (err.status === 401 || err.status === 403) {
                this.authService.logout();
                localStorage.removeItem('token');
                localStorage.setItem("lastLink", window.location.href);
                ;
                this.snackBar.open('Déconnexion, une erreur.', '×', {
                  panelClass: 'success',
                  verticalPosition: 'top',
                  duration: 3000,
                });
                window.location.href = '/sign-in';
              }
            }
          })
        }
      }
    });
  }

  loadCaisses(): void {

    this.caisseService.getAllCaisses(0, 10, 'id', null, null).subscribe({
      next: (data: any) => {

        this.caisses = data.content; // Assuming the API returns a pageable response
      },
      error: (err: any) => {

        console.error('Error loading caisses:', err);
      }
    });
  }

  applyFilters(): void {

    const caisseId = this.caisseControl.value
    const startDate = this.startDate
    const endDate = this.endDate


    this.caisseService.getFilteredCaisses(caisseId, startDate, endDate, 0, 40).subscribe({
      next: (data: any) => {
        this.caisses = data.content;
      },
      error: (err) => {
        console.error('Error applying filters:', err);
      }
    });
  }

  async generatePdf(): Promise<void> {
    const element = this.pdfContent.nativeElement;
    html2canvas(element).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');

      // const pdf = new JsPDF('p', 'mm', 'a4')
      const pdf = new jsPDF();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`rapport_caisse-${this.dataCaisse.caisse.id}-${this.dataCaisse.caisse.etat}-${this.dataCaisse.caisse.session}.pdf`);
    })
  }

  rechercherDernieresSessions(): void {
    const nombre = this.sessionForm.value.nombre;
    // Appelle ton service ici
    console.log(`Recherche des ${nombre} dernières sessions de caisse`);
    // Exemple : this.sessionService.getDernieresSessions(nombre).subscribe(...)

    this.caisseService.getAllCaisses(0, nombre, 'id', null, null).subscribe({
      next: (data: any) => {

        this.caisses = data.content; // Assuming the API returns a pageable response
      },
      error: (err: any) => {

        console.error('Error loading caisses:', err);
      }
    });
  }

}
