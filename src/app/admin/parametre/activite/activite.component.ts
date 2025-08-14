import {Component, OnInit} from '@angular/core';
import {MatInputModule} from "@angular/material/input";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatSelectModule} from "@angular/material/select";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatButtonModule} from "@angular/material/button";
import {MatCardModule} from "@angular/material/card";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatNativeDateModule, MatOptionModule} from "@angular/material/core";
import {CommonModule} from "@angular/common";
import {VentesService} from "@services/ventes.service";
import {AuthService} from "@services/auth.service";
import {SettingsService} from "@services/settings.service";
import {MatSnackBar, MatSnackBarModule} from "@angular/material/snack-bar";
import {CommandesService} from "@services/commandes.service";
import {DepenseService} from "@services/depenses.service";
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderRow,
  MatHeaderRowDef, MatRow, MatRowDef,
  MatTable, MatTableModule
} from "@angular/material/table";
import {MatCheckbox, MatCheckboxModule} from "@angular/material/checkbox";
import {MatIcon, MatIconModule} from "@angular/material/icon";
import {MatMenu, MatMenuItem, MatMenuModule} from "@angular/material/menu";
import {NgxPaginationModule} from "ngx-pagination";
import {
  DetailCommandeDialogComponent
} from "../../commandes/lister-ajouter-commande/detail-commande-dialog/detail-commande-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {
  MatAccordion, MatExpansionModule,
  MatExpansionPanel,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle
} from "@angular/material/expansion";
import {CaisseService} from "@services/caisse.service";
import {MatPaginatorModule, PageEvent} from "@angular/material/paginator";
import {MatListModule} from "@angular/material/list";
import {MatChipsModule} from "@angular/material/chips";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {MatDividerModule} from "@angular/material/divider";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatTabsModule} from "@angular/material/tabs";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {FlexLayoutModule} from "@ngbracket/ngx-layout";
import {MatStepperModule} from "@angular/material/stepper";
import {MatRadioModule} from "@angular/material/radio";
import {RapportCaisseDialogComponent} from "../../../dialog/rapport-caisse-dialog/rapport-caisse-dialog.component";

@Component({
  selector: 'app-activite',
  imports: [
    MatPaginatorModule,
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
  ],
  templateUrl: './activite.component.html',
  standalone: true,
  styleUrl: './activite.component.scss'
})
export class ActiviteComponent implements OnInit {

  page: number = 1;
  count = 5;
  totalItems = 0;

  rechercheForm!: FormGroup;

  categorieActive: string | null = null;
  resultatsCaisse: any[] = [];
  resultatsVente: any[] = [];
  resultatsCommande: any[] = [];
  resultatsDepense: any[] = [];
  resultats: any[] = [];

  categories = [
    {value: 'vente', label: 'vente'},
    {value: 'caisse', label: 'caisse'},
    {value: 'depense', label: 'depense'},
    {value: 'commande', label: 'commande'}
  ];

  colonnesAdmin = ['utilisateur', 'role'];
  colonnesVente: string[] = ['ref', 'client', 'vendeur', 'montant', 'montantPerçu', 'dateEncaissement', 'dateVente', 'etat', 'actions'];
  colonnesCaisse: string[] = ['nomEmploye', 'session', 'etat', 'fondCaisseOuvert', 'fondCaisseFerme', 'dateOuvert', 'dateFerme', 'action',];
  colonnesDepense: string[] = ['id', 'designation', 'quantite', 'prixUnitaire', 'dateEpense', 'actions'];
  colonnesCommande: string[] = ['select', 'id', 'ref', 'dateCreation', 'etat', 'qtiteCmd', 'qtiteRecu', 'uniteGratuite', 'montantCmd', 'montantRecu', 'fournisseur', 'info', 'action'];

  constructor(
    public dialog: MatDialog,
    public authService: AuthService,
    public caisseService: CaisseService,
    public appSettings: SettingsService,
    public snackBar: MatSnackBar,
    public ventesService: VentesService,
    public commandesService: CommandesService,
    public depenseService: DepenseService,
    private fb: FormBuilder) {
  }

  ngOnInit(): void {
    this.rechercheForm = this.fb.group({
      nomEmploye: [''],
      categorie: ["caisse"],
      dateDebut: [null],
      dateFin: [null]
    });
  }

  rechercher(): void {
    const formValues = this.rechercheForm.value;
    console.log('Critères de recherche :', formValues);
    // Appelle ici ton service ou fais un filtrage local
    this.categorieActive = this.rechercheForm.value.categorie;
    console.log("this.categorieActive")
    console.log(this.categorieActive)
    // Pour l’exemple, on simule un résultat différent selon la catégorie :
    this.page = 1
    switch (this.categorieActive) {
      case 'vente':
        this.resultats = [];
        this.fetchVentesPageable();
        break;
      case 'caisse':
        this.resultats = [];
        this.loadCaisses();
        break;
      case 'depense':
        this.resultats = [];
        this.loadDepenses();
        break;
      case 'commande':
        this.resultats = [];
        this.fetchCommandesPageable();
        break;
      default:
        this.resultats = [];
    }
  }

  reinitialiser(): void {
    this.rechercheForm.reset();
    this.resultats = [];
    this.categorieActive = null;
  }

  fetchVentesPageable(): void {
    this.ventesService.fetchVentesPageable(
      this.page - 1,
      this.count,
      null,
      null,
      null,
      null,
      null,
      null,
      null
    ).subscribe({
      next: (data: any) => {
        this.count = data.pageable.pageSize;
        this.totalItems = data.totalElements;
        this.resultatsVente = data.content;
      },
      error: (err: any) => {
        console.error('Error fetching commandes:', err);
        if (err.status === 401 || err.status === 403) {
          this.authService.logout();
           localStorage.removeItem('token');
          localStorage.setItem("lastLink",window.location.href);;
          this.snackBar.open('Déconnexion réussie.', '×', {
            panelClass: 'success',
            verticalPosition: 'top',
            duration: 3000,
          });
            localStorage.removeItem('token');
          window.location.href = '/sign-in';
        }
      }
    });
  }

  fetchCommandesPageable(): void {
    this.commandesService.fetchCommandesPageable(
      this.page - 1,
      this.count,
      null,
      null,
      null,
      null,
      null
    ).subscribe({
      next: (data: any) => {
        this.count = data.pageable.pageSize;
        this.totalItems = data.totalElements;
        this.resultatsCommande = data.content;
      },
      error: (err) => {
        console.error('Error fetching commandes:', err);
      }
    });
  }

  loadDepenses(): void {
    this.depenseService.getAllDepenses().subscribe({
      next: (data) => this.resultatsDepense = data,
      error: () => this.snackBar.open('Failed to load depenses', '×', {panelClass: 'error', duration: 3000})
    });
  }

  getEtatClass(etat: string): string {
    switch (etat.toLowerCase()) {
      case 'en_attente':
        return 'en-attente';
      case 'cloturee':
        return 'cloturee';
      case 'livree':
        return 'livree';
      case 'en_cours':
        return 'en-cours';
      case 'annuler':
        return 'annuler';
      default:
        return '';
    }
  }

  viewDetails(commande: any): void {
    this.commandesService.getCommandeInfo(commande.id).subscribe({
      next: (data) => {
        const dialogRef = this.dialog.open(DetailCommandeDialogComponent, {
          data: {type: null, data: data},
          width: "90%",
          panelClass: ['theme-dialog'],
          autoFocus: false,
        });
        dialogRef.afterClosed().subscribe((data: any) => {
          console.log('Dialog closed', data);
          this.fetchCommandesPageable();
        });
      },
      error: (err) => {
        console.error('Error fetching commandes:', err)
      }
    });
    console.log('Commande details:', commande);
    // Add logic to display details (e.g., open a dialog or navigate to a details page)

  }

  loadCaisses(): void {
    this.caisseService.getAllCaisses(this.page - 1, this.count, 'id').subscribe({
      next: (data: any) => {
        this.count = data.pageable.pageSize;
        this.totalItems = data.totalElements;
        this.resultatsCaisse = data.content;
      },
      error: (err: any) => {
        console.error('Error loading caisses:', err);
      }
    });
  }

  public onPageChangedVente(event: PageEvent) {
    this.page = event.pageIndex + 1;
    this.count = event.pageSize;
    this.fetchVentesPageable();
  }

  public onPageChangedDepense(event: PageEvent) {
    this.page = event.pageIndex + 1;
    this.count = event.pageSize;
    this.loadDepenses();
  }

  public onPageChangedCaisse(event: PageEvent) {
    this.page = event.pageIndex + 1;
    this.count = event.pageSize;
    this.loadCaisses();
  }

  public onPageChangedCommande(event: PageEvent) {
    this.page = event.pageIndex + 1;
    this.count = event.pageSize;
    this.fetchCommandesPageable();
  }

  showRapportCaisse(caisseId: number) {
    this.caisseService.getCaisseReport(caisseId).subscribe({
      next: (data) => {
        const dialogRef = this.dialog.open(RapportCaisseDialogComponent, {
          data: data,
          width: "90%",
          panelClass: ['theme-dialog'],
          autoFocus: false,
        });
        dialogRef.afterClosed().subscribe((data: any) => {
          console.log('Dialog closed', data);
        });
      },
      error: (err) => {
        console.error('Error fetching commandes:', err)
      }
    });
  }

  showVente(caisseId: number) {

  }

}
