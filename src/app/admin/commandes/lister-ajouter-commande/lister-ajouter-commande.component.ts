import {Component, HostListener, OnInit, ViewChild} from '@angular/core';
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
import {MatList, MatListItem, MatListModule, MatListOption, MatSelectionList} from "@angular/material/list";
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
import {EnrayonsService} from "@services/enrayons.service";
import {ProductService} from "@services/products.service";
import {MatRadioButton, MatRadioGroup, MatRadioModule} from "@angular/material/radio";
import {UsersService} from "@services/users.service";
import {PrescripteursService} from "@services/prescripteurs.service";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {MatSnackBar, MatSnackBarModule} from "@angular/material/snack-bar";
import {MatStepper, MatStepperModule} from "@angular/material/stepper";
import {MatDialog} from "@angular/material/dialog";
import {CommandesService} from "@services/commandes.service";
import {SelectionModel} from "@angular/cdk/collections";
import {VenteDialogComponent} from "../../sales/encaisser-vente/vente-dialog/vente-dialog.component";
import {AjouterCommandeDialogComponent} from "./ajouter-commande-dialog/ajouter-commande-dialog.component";
import {MatChipListbox, MatChipsModule} from "@angular/material/chips";
import {log} from "node:util";
import {MatTooltip} from "@angular/material/tooltip";
import {DetailCommandeDialogComponent} from "./detail-commande-dialog/detail-commande-dialog.component";
import {MatMenuModule} from "@angular/material/menu";
import {NgxPaginationModule} from "ngx-pagination";
import {DomHandlerService} from "@services/dom-handler.service";
import {FournisseursService} from "@services/fournisseurs.service";
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {AuthService} from "@services/auth.service";
import {
  SimpleReapprovisionnementCommandeDialogComponent
} from "./simple-reapprovisionnement-commande-dialog/simple-reapprovisionnement-commande-dialog.component";
import {LoaderService} from "@services/loader.service";
import {jsPDF} from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from "qrcode";

interface Commande {
  id: string;
  reference: string;
  client: string;
  dateCommande: Date;
  status: string;
  produits: ProduitCommande[];
}

interface ProduitCommande {
  id: string;
  nom: string;
  quantiteCommandee: number;
  quantiteRecue: number;
}

@Component({
  selector: 'app-lister-ajouter-commande',
  standalone: true,
  providers: [UsersService, VentesService, EnrayonsService, ProductService, PrescripteursService],
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
  templateUrl: './lister-ajouter-commande.component.html',
  styleUrl: './lister-ajouter-commande.component.scss'
})
export class ListerAjouterCommandeComponent implements OnInit {

  public viewCol: number = 25;
  public page: number = 1; // Default to 0 if undefined
  public size = 100;  // Default to 10 if undefined
  public totalItems = 0;  // Default to 10 if undefined
  public count = 10;

  totalAmount = 0;
  totalAmountRecu = 0;
  totalAmountCommande = 0;
  totalQteRecu = 0;
  totalQteCommande = 0;

  public selectedFournisseur: string | null = null;
  public selectedFournisseurType: string | null = null;
  public startDate: Date | null = new Date(new Date().getFullYear(), 0, 1);
  public endDate: Date | null = new Date();

  selection = new SelectionModel<any>(true, []);
  filteredCommandes: any[] = [];
  fournisseurs: any[] = [];
  // etats: string[] = ['all', 'en_attente', 'livree', 'en_cours', 'annulee'];
  etats: any[] = [
    {data: 'Tous', value: 'all'},
    {data: 'En attente', value: 'en_attente'},
    {data: 'Livree', value: 'livree'},
    {data: 'En cours', value: 'en_cours'},
    {data: 'Cloturee', value: 'cloturee'},
    {data: 'Annuler', value: 'annulee'}
  ];
  typeFournisseur: string[] = ['all', 'Detaillant', 'Grossiste'];
  selectedEtats: string = 'all'; // Default to "All"

  constructor(
    public loaderService: LoaderService,
    public authService: AuthService,
    public snackBar: MatSnackBar, public appSettings: SettingsService,
    public enRayonService: EnrayonsService,
    public commandesService: CommandesService,
    public fournisseursService: FournisseursService,
    public productService: ProductService,
    public ventesService: VentesService,
    public usersService: UsersService,
    public prescripteursService: PrescripteursService,
    public domHandlerService: DomHandlerService,
    public dialog: MatDialog) {

  }

  // displayedColumns: string[] = ['select', 'id', 'ref', 'dateCreation', 'etat', 'qtiteCmd', 'qtiteRecu', 'uniteGratuite', 'montantCmd', 'montantRecu', 'fournisseur', 'info', 'action'];
  displayedColumns: string[] = ['id', 'ref', 'dateCreation', 'etat', 'qtiteCmd', 'qtiteRecu', 'uniteGratuite', 'montantCmd', 'montantRecu', 'fournisseur', 'info', 'action'];
  commandes: any[] = [];


  ngOnInit(): void {
    if (this.domHandlerService.window?.innerWidth < 1280) {
      this.viewCol = 33.3;
    }
    ;
    this.fetchCommandesPageable();
    this.searchFournisseur();
  }

  public searchFournisseur(): void {

    this.fournisseursService.getFournisseurs().subscribe({
      // this.productService.searchProducts(this.searchTerm, this.page, this.count).subscribe({
      next: (data: any) => {
        this.fournisseurs = data;

      },
      error: (err) => {

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

  fetchCommandes(): void {

    this.commandesService.getCommandes().subscribe({
      next: (data) => {
        this.commandes = data
        this.filteredCommandes = data

      },
      error: (err) => {
        console.error('Error fetching commandes:', err)

      }
    });
  }

  fetchCommandesPageable(): void {
    const formatDate = (date: string | null): string | null => {
      if (!date) return null;
      const parsedDate = new Date(date);
      return `${parsedDate.getFullYear()}-${String(parsedDate.getMonth() + 1).padStart(2, '0')}-${String(parsedDate.getDate()).padStart(2, '0')}T${String(parsedDate.getHours()).padStart(2, '0')}:${String(parsedDate.getMinutes()).padStart(2, '0')}:${String(parsedDate.getSeconds()).padStart(2, '0')}`;
    };
    console.log("fetchCommandesPageable")
    const formattedStartDate = formatDate((new Date(new Date(this.startDate).setHours(0, 0, 0, 0))) + "");
    const formattedEndDate = formatDate((new Date(new Date(this.endDate).setHours(23, 59, 59, 999))) + "");
    this.commandesService.fetchCommandesPageable(
      this.page - 1,
      this.count,
      this.selectedEtats === 'all' ? null : this.selectedEtats,
      this.selectedFournisseurType,
      this.selectedFournisseur,
      formattedStartDate,
      formattedEndDate
    ).subscribe({
      next: (data: any) => {
        this.count = data.pageSize;
        this.totalItems = data.totalElements;
        this.commandes = data.content.content;
        this.filteredCommandes = data.content.content;
        this.totalAmountRecu = data.totalAmountRecu;
        this.totalAmountCommande = data.totalAmountCommande;
        this.totalQteRecu = data.totalQteRecu;
        this.totalQteCommande = data.totalQteCommande;

      },
      error: (err) => {

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

  fetchCommandesPageablePrint(): void {
    const formatDate = (date: string | null): string | null => {
      if (!date) return null;
      const parsedDate = new Date(date);
      return `${parsedDate.getFullYear()}-${String(parsedDate.getMonth() + 1).padStart(2, '0')}-${String(parsedDate.getDate()).padStart(2, '0')}T${String(parsedDate.getHours()).padStart(2, '0')}:${String(parsedDate.getMinutes()).padStart(2, '0')}:${String(parsedDate.getSeconds()).padStart(2, '0')}`;
    };

    const formattedStartDate = formatDate(new Date(new Date(this.startDate).setHours(0, 0, 0, 0)) + "");
    const formattedEndDate = formatDate(new Date(new Date(this.endDate).setHours(23, 59, 59, 999)) + "");

    this.commandesService.fetchCommandesPageablePrint(
      this.page - 1,
      this.count,
      this.selectedEtats === 'all' ? null : this.selectedEtats,
      this.selectedFournisseurType,
      this.selectedFournisseur,
      formattedStartDate,
      formattedEndDate
    ).subscribe({
      next: (data: any) => {

      },
      error: (err) => {
        console.error('Error fetching commandes:', err);
      }
    });
  }

  public onPageChanged(event: PageEvent) {
    this.page = event.pageIndex + 1;
    this.count = event.pageSize;
    this.fetchCommandesPageable();
  }

  @HostListener('window:resize')
  public onWindowResize(): void {
    (this.domHandlerService.window?.innerWidth < 1280) ? this.viewCol = 33.3 : this.viewCol = 25;
  }

  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.commandes.length;
    return numSelected === numRows;
  }

  toggleAllSelection(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    } else {
      this.commandes.forEach(row => this.selection.select(row));
    }
  }

  toggleSelection(commande: any): void {
    this.selection.toggle(commande);
  }

  openCommandeDialog(param: any) {
    const dialogRef = this.dialog.open(AjouterCommandeDialogComponent, {
      data: null,
      width: "80%",
      panelClass: ['theme-dialog'],
      autoFocus: false,
    });
    dialogRef.afterClosed().subscribe((data: any) => {
      console.log('Dialog closed', data);
      this.fetchCommandesPageable();
    });
  }

  openSimpleReaDialog(param: any) {
    const dialogRef = this.dialog.open(SimpleReapprovisionnementCommandeDialogComponent, {
      data: null,
      width: "80%",
      panelClass: ['theme-dialog'],
      autoFocus: false,
    });
    dialogRef.afterClosed().subscribe((data: any) => {
      console.log('Dialog closed', data);
      this.fetchCommandesPageable();
    });
  }

  getEtatClass(etat: string): string {
    switch (etat.toLowerCase()) {
      case 'en_attente':
        return 'en-attente';
      case 'cloturee':
        return 'cloturee';
      case 'commandé':
        return 'commande';
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

  canPerformAction(action: string, commande: any): boolean {
    if (!this.selection.hasValue()) {
      return false;
    }

    const selectedCommandes = this.selection.selected;

    switch (action) {
      case 'receptionnerComplete':
      case 'receptionnerPartielle':
        return selectedCommandes.every(commande =>
          commande.etat === 'en_attente' || commande.etat === 'en_cours'
        );
      case 'annuler':
        return selectedCommandes.every(commande =>
          commande.etat === 'en_attente' || commande.etat === 'en_cours'
        );
      case 'mettreEnAttente':
        return selectedCommandes.every(commande => commande.etat !== 'livree');
      default:
        return false;
    }
  }

  recevoirComplete(commande: any): void {
    const payload = commande.produits.map((produit: any) => ({
      id: produit.id,
      productId: produit.produit.id,
      productCmdId: commande.id,
      datePeremption: produit.datePeremption || null,
    }));

    this.commandesService.receptionComplete(commande.id,
      'complete',
      payload).subscribe({
      next: (response) => {
        console.log('Réception complète réussie:', response);
        this.fetchCommandesPageable();
      },
      error: (err) => {
        console.error('Erreur lors de la réception complète:', err);
      },
    });
  }

  recevoirPartielle(commande: any): void {


    this.commandesService.getCommandeInfo(commande.id).subscribe({
      next: (data) => {
        const dialogRef = this.dialog.open(DetailCommandeDialogComponent, {
          data: {type: 'partiel', data: data},
          width: "80%",
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
  }

  annuler(commande: any): void {
    const payload: any[] = []; // No data required for cancellation

    this.commandesService.receptionComplete(commande.id,
      'annuler',
      payload).subscribe({
      next: (response) => {
        console.log('Réception complète réussie:', response);
        this.fetchCommandesPageable();

      },
      error: (err) => {
        console.error('Erreur lors de la réception complète:', err);

      },
    });
  }

  remettreEnAttente(commande: any): void {
    const payload: any[] = []; // No data required for putting on hold

    this.commandesService.receptionComplete(commande.id,
      'mettreEnAttente',
      payload).subscribe({
      next: (response) => {
        console.log('Réception complète réussie:', response);
        this.fetchCommandesPageable();
      },
      error: (err) => {
        console.error('Erreur lors de la réception complète:', err);
      },
    });
  }

  toggleEtatFilter(etat: string): void {
    if (etat === 'all') {
      // If "all" is selected, deselect all other states and select "all"
      this.selectedEtats = 'all';
    } else {
      // Remove "all" if another state is selected
      this.selectedEtats = etat;
    }
    // this.applyFilters();
    this.fetchCommandesPageable();
  }

  applyFilters(): void {
    if (this.selectedEtats === 'all') {
      this.filteredCommandes = this.commandes;
    } else {
      this.filteredCommandes = this.commandes.filter(commande =>
        this.selectedEtats === commande.etat.toLowerCase()
      );
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

  // En attente
  modifierLignes(commande: any): void {
    console.log('Modifier les lignes:', commande);
    // Logic to modify products or quantities

    this.commandesService.getCommandeInfo(commande.id).subscribe({
      next: (data) => {
        const dialogRef = this.dialog.open(DetailCommandeDialogComponent, {
          data: {type: 'partiel', data: data},
          width: "80%",
          panelClass: ['theme-dialog'],
          autoFocus: false,
        });
        dialogRef.afterClosed().subscribe((data: any) => {
          this.fetchCommandesPageable();
        });

      },
      error: (err) => {
        console.error('Error fetching commandes:', err)

      }
    });
  }

  supprimerCommande(commande: any): void {

    this.commandesService.supprimerCommande(commande.id).subscribe({
      next: () => {
        this.snackBar.open('Commande supprimée avec succès.', 'Fermer', {duration: 3000});
        this.fetchCommandesPageable();

      },
      error: (err) => {

        console.error('Erreur lors de la suppression de la commande:', err);
        this.snackBar.open('Échec de la suppression de la commande.', 'Fermer', {duration: 3000});
      },
    });
  }

  ajouterFournisseur(commande: any): void {

    this.commandesService.ajouterFournisseur(commande.id, commande.fournisseurId).subscribe({
      next: () => {
        this.snackBar.open('Fournisseur ajouté avec succès.', 'Fermer', {duration: 3000});
        this.fetchCommandesPageable();

      },
      error: (err) => {

        console.error('Erreur lors de l\'ajout du fournisseur:', err);
        this.snackBar.open('Échec de l\'ajout du fournisseur.', 'Fermer', {duration: 3000});
      },
    });
  }

  annulerCommande(commande: any): void {

    this.commandesService.annulerCommande(commande.id).subscribe({
      next: () => {

        this.snackBar.open('Commande annulée avec succès.', 'Fermer', {duration: 3000});
        this.fetchCommandesPageable();
      },
      error: (err) => {

        console.error('Erreur lors de l\'annulation de la commande:', err);
        this.snackBar.open('Échec de l\'annulation de la commande.', 'Fermer', {duration: 3000});
      },
    });
  }

  imprimerBon(commande: any): void {

    this.commandesService.getCommandeInfo(commande.id).subscribe({
      next: (data: any) => {
        this.generateBonCommande(data)
      },
      error: (err) => {
        console.error('Error fetching commandes:', err)

      }
    });
  }

  imprimerBonReception(commande: any): void {

    this.commandesService.getCommandeInfo(commande.id).subscribe({
      next: (data: any) => {
        this.generateBonReception(data)
      },
      error: (err) => {
        console.error('Error fetching commandes:', err)

      }
    });
  }

  recevoirComplementaire(commande: any): void {

    this.commandesService.getCommandeInfo(commande.id).subscribe({
      next: (data) => {
        const dialogRef = this.dialog.open(DetailCommandeDialogComponent, {
          data: {type: 'complementaire', data: data},
          width: "80%",
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
  }

  ajouterJustificatif(commande: any): void {

    this.commandesService.ajouterJustificatif(commande.id, commande.justificatif).subscribe({
      next: () => {

        this.snackBar.open('Justificatif ajouté avec succès.', 'Fermer', {duration: 3000});
        this.fetchCommandesPageable();
      },
      error: (err) => {

        console.error('Erreur lors de l\'ajout du justificatif:', err);
        this.snackBar.open('Échec de l\'ajout du justificatif.', 'Fermer', {duration: 3000});
      },
    });
  }

  visualiserHistorique(commande: any): void {

    this.commandesService.visualiserHistoriqueReception(commande.id).subscribe({
      next: () => {

        this.snackBar.open('Historique visualisé avec succès.', 'Fermer', {duration: 3000});
      },
      error: (err) => {

        console.error('Erreur lors de la visualisation de l\'historique:', err);
        this.snackBar.open('Échec de la visualisation de l\'historique.', 'Fermer', {duration: 3000});
      },
    });
  }

  cloturerManuellement(commande: any): void {

    this.commandesService.cloturerCommande(commande.id).subscribe({
      next: (data: any) => {

        this.snackBar.open('Commande clôturée avec succès.', 'Fermer', {duration: 3000});
        this.fetchCommandesPageable();
      },
      error: (err) => {

        console.error('Erreur lors de la clôture de la commande:', err);
        this.snackBar.open('Échec de la clôture de la commande.', 'Fermer', {duration: 3000});
      },
    });
  }

  ajouterFacture(commande: any): void {

    this.commandesService.ajouterFacture(commande.id, commande.facture).subscribe({
      next: () => {

        this.snackBar.open('Facture ajoutée avec succès.', 'Fermer', {duration: 3000});
        this.fetchCommandesPageable();
      },
      error: (err) => {

        console.error('Erreur lors de l\'ajout de la facture:', err);
        this.snackBar.open('Échec de l\'ajout de la facture.', 'Fermer', {duration: 3000});
      },
    });
  }

  genererRapport(commande: any): void {

    this.commandesService.genererRapportLivraison(commande.id).subscribe({
      next: () => {

        this.snackBar.open('Rapport généré avec succès.', 'Fermer', {duration: 3000});
      },
      error: (err) => {

        console.error('Erreur lors de la génération du rapport:', err);
        this.snackBar.open('Échec de la génération du rapport.', 'Fermer', {duration: 3000});
      },
    });
  }

  exporterCommande(commande: any): void {

    this.commandesService.exporterCommande(commande.id).subscribe({
      next: () => {

        this.snackBar.open('Commande exportée avec succès.', 'Fermer', {duration: 3000});
      },
      error: (err) => {

        console.error('Erreur lors de l\'exportation de la commande:', err);
        this.snackBar.open('Échec de l\'exportation de la commande.', 'Fermer', {duration: 3000});
      },
    });
  }


  // Annulée
  lireDetails(commande: any): void {
    console.log('Lire les détails:', commande);
    // Logic to read details of the canceled order
    this.viewDetails(commande);
  }

  ajouterMotifAnnulation(commande: any): void {
    console.log('Ajouter un motif d\'annulation:', commande);
    // Logic to add cancellation reason

    this.commandesService.getCommandeInfo(commande.id).subscribe({
      next: (data) => {
        const dialogRef = this.dialog.open(DetailCommandeDialogComponent, {
          data: {type: 'partiel', data: data},
          width: "80%",
          panelClass: ['theme-dialog'],
          autoFocus: false,
        });
        dialogRef.afterClosed().subscribe((data: any) => {
          console.log('Dialog closed', data);
          this.fetchCommandesPageable();
        });

      },
      error: (err) => {

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

  async generateBonCommande(vente: any): Promise<void> {
    // const doc = new jsPDF({
    //   orientation: 'portrait', unit: 'mm',
    //   // format: [data.produits.length+100,100]
    //   format: [10 * 10, ((vente.produitsRetournes.length + 14) * 10)]
    //   // format: [100, (data.produits.length * 30 + 150)]
    // });
    // const doc = new jsPDF();
    let doc: jsPDF = new jsPDF('p', 'mm', 'a4')
    // const doc = new jsPDF({orientation: 'landscape', unit: 'cm', format: [30, 20]});
    // const doc = new jsPDF({orientation: 'landscape', unit: 'cm'});

    const pageWidth = doc.internal.pageSize.width
    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9); // Fixed font size for header
    doc.text('Pharmacie ALSAS', 2, 10);
    doc.text(`Bon de commande: ${vente.id}`, 2, 15);
    doc.text(`Numero de commande : ${vente.reference}`, 2, 20);


    // Table Content
    const rows = vente.produits.map((produit: any) => [
      produit.produit.nom,
      produit.prixAchat ?? 0,
      produit.qtiteCmd ?? 0,
      (produit.prixAchat ?? 0) * (produit.qtiteCmd ?? 0),
    ]);


    autoTable(doc, {
      head: [['Designation.', 'Quantité', 'Prix achat', 'Total']],
      body: rows,
      headStyles: {fillColor: [22, 160, 133]},
      margin: {top: 0, left: 0, right: 0},
      startY: 30,
      styles: {
        fontSize: 7
      }
    });

    const totalQte = vente.produits.reduce((sum: number, item: any) => sum + (item.qtiteCmd * 1), 0);
    const article = rows.length;

    let y = (doc as any).lastAutoTable.finalY; // Get the position after the tablet the position after the table
    // doc.setFontSize(8); // Smaller font size for footer
    y += 5;
    doc.text('Total : ' + vente.montantTotal + ' FCFA', 2, y);
    y += 5;
    doc.text('Nombre d article commande : ' + article, 2, y);
    y += 5;
    doc.text('Nombre de produit commande : ' + totalQte, 2, y);

    // Save PDF
    doc.save(`bon${vente.reference}.pdf`);
  }

  async generateBonReception(vente: any): Promise<void> {
    // const doc = new jsPDF({
    //   orientation: 'portrait', unit: 'mm',
    //   // format: [data.produits.length+100,100]
    //   format: [10 * 10, ((vente.produitsRetournes.length + 14) * 10)]
    //   // format: [100, (data.produits.length * 30 + 150)]
    // });
    // const doc = new jsPDF();
    let doc: jsPDF = new jsPDF('p', 'mm', 'a4')
    // const doc = new jsPDF({orientation: 'landscape', unit: 'cm', format: [30, 20]});
    // const doc = new jsPDF({orientation: 'landscape', unit: 'cm'});

    const pageWidth = doc.internal.pageSize.width
    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9); // Fixed font size for header
    doc.text('Pharmacie ALSAS', 2, 10);
    doc.text(`Bordereau de reception: ${vente.id}`, 2, 15);
    doc.text(`Numero de bon de commande : ${vente.reference}`, 2, 20);
    doc.text(`Numero de bon de reception : ${vente.reference}`, 2, 25);
    doc.text(`Numero de bordereau livraison : ${vente.reference}`, 2, 30);
    doc.text(`Date commande : ${vente.reference}`, 2, 35);
    doc.text(`Fournisseur :  : ${vente.reference}`, 2, 40);


    // Table Content
    const rows = vente.produits.map((produit: any) => [
      produit.produit.nom,
      produit.qtiteCmd ?? 0,
      produit.qtiteRecu ?? 0,
      produit.prixAchat ?? 0,
      produit.prixVente ?? 0,
      (produit.prixAchat ?? 0) * (produit.qtiteCmd ?? 0),
      (produit.prixVente ?? 0) * (produit.qtiteRecu ?? 0),
    ]);


    autoTable(doc, {
      head: [['Designation.', 'Quantité commande', 'Quantité recu', 'Prix achat', 'Prix vente', 'Total Achat']],
      body: rows,
      headStyles: {fillColor: [22, 160, 133]},
      margin: {top: 0, left: 0, right: 0},
      startY: 40,
      styles: {
        fontSize: 7
      }
    });

    const totalQte = vente.produits.reduce((sum: number, item: any) => sum + (item.qtiteCmd * 1), 0);
    const article = rows.length;

    let y = (doc as any).lastAutoTable.finalY; // Get the position after the tablet the position after the table
    // doc.setFontSize(8); // Smaller font size for footer
    y += 5;
    doc.text('Total achat: ' + vente.montantTotal + ' FCFA', 2, y);
    y += 5;
    doc.text('Nombre d article commande : ' + article, 2, y);
    y += 5;
    doc.text('Nombre de produit commande : ' + totalQte, 2, y);

    // Save PDF
    doc.save(`bon${vente.reference}.pdf`);
  }
}
