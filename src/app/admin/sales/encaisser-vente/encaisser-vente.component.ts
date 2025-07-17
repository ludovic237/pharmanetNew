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
import {MatDialog} from "@angular/material/dialog";
import {EnrayonsService} from "@services/enrayons.service";
import {ProductService} from "@services/products.service";
import {MatRadioButton, MatRadioGroup, MatRadioModule} from "@angular/material/radio";
import {UsersService} from "@services/users.service";
import {PrescripteursService} from "@services/prescripteurs.service";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {MatSnackBar} from "@angular/material/snack-bar";
import {TicketCaisseService} from "@services/tickets.service";
import {BonCaisseService} from "@services/boncaisses.service";
import {AjouterVenteDialogComponent} from "../ajouter-vente/ajouter-vente-dialog/ajouter-vente-dialog.component";
import {BonCaisseDialogComponent} from "./bon-caisse-dialog/bon-caisse-dialog.component";
import {DepenseService} from "@services/depenses.service";
import {DepenseDialogComponent} from "./depense-dialog/depense-dialog.component";
import {VenteDialogComponent} from "./vente-dialog/vente-dialog.component";

interface LigneHeader {
  netAPayer?: number;
  reduction?: number;
  reference?: string;
  infoClients?: string;
  vendeur?: string;
  commentaire?: string;
  dateVente?: Date;
  actions?: any;
}

interface LigneProduit {
  nom: string;
  prixUnitaire: number;
  quantite: number;
  prixTotal: number;
  reduction: number;
}

interface LigneVente {
  prixTotal: number;
  etat: string;
  reference: string;
  vendeur: string;
  client: string;
  dateVente: Date;
  actions?: any;
}

@Component({
  selector: 'app-encaisser-vente',
  imports: [
    MatRadioModule,
    MatSlideToggleModule,
    FormsModule,
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
    MatCheckboxModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    FlexLayoutModule
  ],
  templateUrl: './encaisser-vente.component.html',
  styleUrl: './encaisser-vente.component.scss'
})


export class EncaisserVenteComponent {

  selectedTabIndex: number = 0;
  venteId: number = 0;
  montantEncaisse: number = 0;
  montantElectronique: number = 0;
  numeroTelephone: string = '';
  numeroTicket: string = '';
  montantTicket: number = 0;
  montantEspece: number = 0;
  numeroTelephoneMixte: string = '';
  montantElectroniqueMixte: number = 0;
  numeroTicketMixte: string = '';
  montantTicketMixte: number = 0;
  totalEncaisse: number = 0;
  rendu: number = 0;

  cashierName = 'Nsangou Safiatou';

  // Tables
  headerColumns = ['netAPayer', 'reduction', 'reference', 'infoClients', 'vendeur', 'commentaire', 'dateVente', 'actions'];
  headerDataSource = new MatTableDataSource<LigneHeader>([{}]);

  leftColumns = ['nom', 'prixUnitaire', 'quantite', 'prixTotal', 'reduction'];
  leftDataSource = new MatTableDataSource<LigneProduit>([]);

  bottomColumns = ['prixTotal', 'etat', 'reference', 'vendeur', 'client', 'dateVente', 'actions'];
  bottomDataSource = new MatTableDataSource<LigneVente>([]);

  // Paiement
  netAPayer = 0;

  constructor(public appSettings: SettingsService,
              public snackBar: MatSnackBar,
              public enRayonService: EnrayonsService,
              public ticketCaisseService: TicketCaisseService,
              public depenseService: DepenseService,
              public bonCaisseService: BonCaisseService,
              public productService: ProductService,
              public ventesService: VentesService,
              public prescripteursService: PrescripteursService,
              public dialog: MatDialog) {

  }

  ngOnInit(): void {
    // Exemple de ligne produit ; remplacer par vos données réelles
    // this.leftDataSource.data = [{
    //   nom: 'Paracétamol', prixUnitaire: 500, quantite:2, prixTotal:1000, reduction:50
    // }];
  }


  onAnnuler() {
    this.montantEncaisse = 0;
    this.calculateRendu();
  }


  onImprimer() {
    // logique d'impression
  }

  onRefresh() {
    // recharger les données
    /*this.ventesService.listerVentesNonEncaissees(page).subscribe({
      next: (response: any) => {
        this.headerDataSource.data = response;
        this.snackBar.open("Sale refresh success", '×', {
          panelClass: 'success',
          verticalPosition: 'top',
          duration: 3000
        });
      },
      error: (err: any) => {
        this.snackBar.open('Failed to refresh sale', '×', {
          panelClass: 'error',
          verticalPosition: 'top',
          duration: 3000
        });
      }
    });*/
  }

  chargerVente(venteId: number) {
    // recharger les données
    this.venteId = venteId;
    this.ventesService.chargerVentesEnCoursNonEncaisser(venteId).subscribe({
      next: (response: any) => {
        this.leftDataSource.data = response.produits;
        this.netAPayer = response.vente.prixTotal;
        this.snackBar.open("success", '×', {
          panelClass: 'success',
          verticalPosition: 'top',
          duration: 3000
        });
      },
      error: (err: any) => {
        this.snackBar.open('Failed', '×', {
          panelClass: 'error',
          verticalPosition: 'top',
          duration: 3000
        });
      }
    });
  }

  onTabChange(index: number): void {
    this.selectedTabIndex = index;
  }

  calculateRendu(): void {
    if (this.selectedTabIndex === 0) {
      this.rendu = this.montantEncaisse - this.netAPayer;
    } else if (this.selectedTabIndex === 1) {
      this.rendu = this.montantElectronique - this.netAPayer;
    } else if (this.selectedTabIndex === 2) {
      this.rendu = this.montantTicket - this.netAPayer;
    } else if (this.selectedTabIndex === 3) {
      this.totalEncaisse = this.montantEspece + this.montantElectroniqueMixte + this.montantTicketMixte;
      this.rendu = this.totalEncaisse - this.netAPayer;
    }
  }

  validateTicket(): void {
    if (this.numeroTicket && this.numeroTicket.length === 12) {
      this.bonCaisseService.getBonByCodebarreId(this.numeroTicket).subscribe({
        next: (data) => {
          if (data) {
            this.montantTicket = data.montant;
            this.calculateRendu()
            alert(`Ticket validé. Montant: ${this.montantTicket}`);
          } else {
            this.montantTicket = 0;
            alert('Numéro de ticket invalide.');
          }
        },
        error: () => {
          this.montantTicket = 0;
          alert('Erreur lors de la validation du ticket.');
        }
      });
    } else {
      alert('Veuillez entrer un numéro de ticket valide.');
    }
  }

  validateTicketMixte(): void {
    if (this.numeroTicketMixte && this.numeroTicketMixte.length === 12) {
      this.bonCaisseService.getBonByCodebarreId(this.numeroTicketMixte).subscribe({
        next: (data) => {
          if (data) {
            this.montantTicketMixte = data.montant;
            this.calculateRendu()
            alert(`Ticket validé. Montant: ${this.montantTicketMixte}`);
          } else {
            this.montantTicketMixte = 0;
            alert('Numéro de ticket invalide.');
          }
        },
        error: () => {
          this.montantTicketMixte = 0;
          alert('Erreur lors de la validation du ticket.');
        }
      });
    } else {
      alert('Veuillez entrer un numéro de ticket valide.');
    }
  }

  onValider(): void {
    if (this.selectedTabIndex === 0 && !this.montantEncaisse) {
      alert('Veuillez remplir tous les champs.');
      return;
    }
    if (this.selectedTabIndex === 1 && (!this.numeroTelephone || !this.montantElectronique)) {
      alert('Veuillez remplir tous les champs.');
      return;
    }
    if (this.selectedTabIndex === 2 && (!this.numeroTicket || !this.montantTicket)) {
      alert('Veuillez remplir tous les champs.');
      return;
    }
    if (this.selectedTabIndex === 3 && (!this.montantEspece || !this.numeroTelephoneMixte || !this.montantElectroniqueMixte || !this.numeroTicketMixte || !this.montantTicketMixte)) {
      alert('Veuillez remplir tous les champs.');
      return;
    }

    const encaissementDetails = {
      venteId: this.venteId, // Replace with the actual sale ID
      typeEncaissement: this.selectedTabIndex === 0 ? 'Espèce' :
        this.selectedTabIndex === 1 ? 'Électronique' :
          this.selectedTabIndex === 2 ? 'Ticket' : 'Mixte',
      montantPercu: this.selectedTabIndex === 0 ? this.montantEncaisse :
        this.selectedTabIndex === 1 ? this.montantElectronique :
          this.selectedTabIndex === 2 ? this.montantTicket :
            this.montantEspece + this.montantElectroniqueMixte + this.montantTicketMixte,
      espece: this.selectedTabIndex === 3 ? this.montantEspece : this.montantEncaisse,
      electronique: this.selectedTabIndex === 3 ? {
        numeroTelephone: this.numeroTelephoneMixte,
        montantElectronique: this.montantElectroniqueMixte
      } : {
        numeroTelephone: this.numeroTelephone,
        montantElectronique: this.montantElectronique
      },
      ticket: this.selectedTabIndex === 3 ? {
        numeroTicket: this.numeroTicketMixte,
        montantTicket: this.montantTicketMixte
      } : {
        numeroTicket: this.numeroTicket,
        montantTicket: this.montantTicket
      },
      montantRendu: this.rendu
    };
    // Proceed with validation logic
    console.log('Validation successful for tab:', this.selectedTabIndex);
    console.log(encaissementDetails)

this.ventesService.encaisserVente(this.venteId, encaissementDetails).subscribe({
  next: () => {
    // Clear the leftDataSource table
    this.leftDataSource.data = [];

    // Refresh the data
    this.onRefresh();

    // Reset encaissementDetails values
    this.venteId = 0;
    this.montantEncaisse = 0;
    this.montantElectronique = 0;
    this.numeroTelephone = '';
    this.numeroTicket = '';
    this.montantTicket = 0;
    this.montantEspece = 0;
    this.numeroTelephoneMixte = '';
    this.montantElectroniqueMixte = 0;
    this.numeroTicketMixte = '';
    this.montantTicketMixte = 0;
    this.totalEncaisse = 0;
    this.rendu = 0;

    // Show success message
    this.snackBar.open("Vente successfully", '×', {
      panelClass: 'success',
      verticalPosition: 'top',
      duration: 3000
    });
  },
  error: (err: any) => {
    console.error('Failed to fetch BonCaisse list:', err);
    this.snackBar.open('Erreur lors de la récupération des bons de caisse.', '×', {
      panelClass: 'error',
      verticalPosition: 'top',
      duration: 3000,
    });
  }
});
  }

  onTicketInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    if (value.length === 12) {
      this.validateTicket();
    }
  }

  onTicketMixteInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    if (value.length === 12) {
      this.validateTicketMixte();
    }
  }

  showBonCaisse() {
    this.bonCaisseService.getAllBons().subscribe({
      next: (bons: any[]) => {
        const dialogRef = this.dialog.open(BonCaisseDialogComponent, {
          data: bons,
          width: "80%",
          panelClass: ['theme-dialog'],
          autoFocus: false,
        });
        dialogRef.afterClosed().subscribe((data: any) => {
          console.log('Dialog closed', data);
        });
      },
      error: (err: any) => {
        console.error('Failed to fetch BonCaisse list:', err);
        this.snackBar.open('Erreur lors de la récupération des bons de caisse.', '×', {
          panelClass: 'error',
          verticalPosition: 'top',
          duration: 3000,
        });
      }
    });
  }

  showDepense() {
    this.depenseService.getAllDepenses().subscribe({
      next: (depense: any[]) => {
        const dialogRef = this.dialog.open(DepenseDialogComponent, {
          data: depense,
          width: "80%",
          panelClass: ['theme-dialog'],
          autoFocus: false,
        });
        dialogRef.afterClosed().subscribe((data: any) => {
          console.log('Dialog closed', data);
        });
      },
      error: (err: any) => {
        console.error('Failed to fetch BonCaisse list:', err);
        this.snackBar.open('Erreur lors de la récupération des bons de caisse.', '×', {
          panelClass: 'error',
          verticalPosition: 'top',
          duration: 3000,
        });
      }
    });
  }

  showVente() {
    // this.ventesService.listerVentesEncaissees().subscribe({
    //   next: (ventes: any[]) => {
    //     const dialogRef = this.dialog.open(VenteDialogComponent, {
    //       data: ventes,
    //       width: "80%",
    //       panelClass: ['theme-dialog'],
    //       autoFocus: false,
    //     });
    //     dialogRef.afterClosed().subscribe((data: any) => {
    //       console.log('Dialog closed', data);
    //     });
    //   },
    //   error: (err: any) => {
    //     console.error('Failed to fetch BonCaisse list:', err);
    //     this.snackBar.open('Erreur lors de la récupération des bons de caisse.', '×', {
    //       panelClass: 'error',
    //       verticalPosition: 'top',
    //       duration: 3000,
    //     });
    //   }
    // });
  }
}
