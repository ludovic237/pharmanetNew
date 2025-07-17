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
  public page:number = 1; // Default to 0 if undefined
  public size = 100;  // Default to 10 if undefined
  public totalItems = 0;  // Default to 10 if undefined
  public count = 10;

  public selectedFournisseur: string | null = null;
  public startDate: string | null = null;
  public endDate: string | null = null;

  selection = new SelectionModel<any>(true, []);
  filteredCommandes: any[] = [];
  fournisseurs: any[] = [];
  etats: string[] = ['all', 'en_attente', 'livree', 'en_cours', 'annulee'];
  selectedEtats: string = 'all'; // Default to "All"

  constructor(public appSettings: SettingsService,
              public snackBar: MatSnackBar,
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

  displayedColumns: string[] = ['select', 'id', 'ref', 'dateCreation', 'etat', 'qtiteCmd', 'qtiteRecu', 'uniteGratuite', 'montantCmd', 'montantRecu', 'fournisseur', 'info', 'action'];
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
        console.error('Error searching products:', err);
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

  const formattedStartDate = formatDate(this.startDate);
  const formattedEndDate = formatDate(this.endDate);

  this.commandesService.fetchCommandesPageable(
    this.page - 1,
    this.count,
    this.selectedEtats === 'all' ? null : this.selectedEtats,
    this.selectedFournisseur,
    formattedStartDate,
    formattedEndDate
  ).subscribe({
    next: (data: any) => {
      this.count = data.pageable.pageSize;
      this.totalItems = data.totalElements;
      this.commandes = data.content;
      this.filteredCommandes = data.content;
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
          console.log('Dialog closed', data);
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
    this.commandesService.imprimerBonPdf(commande.id).subscribe({
      next: () => {
        this.snackBar.open('Bon imprimé avec succès.', 'Fermer', {duration: 3000});
      },
      error: (err) => {
        console.error('Erreur lors de l\'impression du bon:', err);
        this.snackBar.open('Échec de l\'impression du bon.', 'Fermer', {duration: 3000});
      },
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
      next: () => {
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
        console.error('Error fetching commandes:', err)
      }
    });
  }
}
