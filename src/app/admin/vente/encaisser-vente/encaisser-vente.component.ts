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
import {CaisseService} from "@services/caisse.service";
import {ConfirmationDialogComponent} from "./confirmation-dialog/confirmation-dialog.component";
import {AuthService} from "@services/auth.service";
import {GestionCaisseDialogComponent} from "./gestion-caisse-dialog/gestion-caisse-dialog.component";
import {MatPaginatorModule, PageEvent} from "@angular/material/paginator";

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

enum CaisseStatus {
  OPEN = 'open',
  ALREADYOPEN = 'alreadyopen',
  CLOSED = 'closed',
  NONE = 'none',
  ACTIVE = 'active',
  PENDING = 'pending',
  OTHER = 'other'
}

@Component({
  selector: 'app-encaisser-vente',
  imports: [
    MatPaginatorModule,
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

export class EncaisserVenteComponent implements OnInit {

  modalType: string = "";
  session: string = "";
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

  // Tables
  headerColumns = ['netAPayer', 'reduction', 'reference', 'infoClients', 'vendeur', 'commentaire', 'dateVente', 'actions'];
  headerDataSource: any[] = []

  leftColumns = ['nom', 'prixUnitaire', 'quantite', 'prixTotal', 'reduction'];
  leftDataSource: any[] = [];

  bottomColumns = ['prixTotal', 'etat', 'reference', 'vendeur', 'client', 'dateVente', 'actions'];
  bottomDataSource: any[] = [];

  // Paiement
  netAPayer = 0;

  caisseStatus: any = CaisseStatus.OTHER;
  cashierName: string = 'N/A';

  constructor(public appSettings: SettingsService,
              public snackBar: MatSnackBar,
              public enRayonService: EnrayonsService,
              public caisseService: CaisseService,
              public authService: AuthService,
              public ticketCaisseService: TicketCaisseService,
              public depenseService: DepenseService,
              public bonCaisseService: BonCaisseService,
              public productService: ProductService,
              public ventesService: VentesService,
              public prescripteursService: PrescripteursService,
              public dialog: MatDialog) {

  }

  ngOnInit(): void {
    this.checkCaisseStatus();
  }

  checkCaisseStatus(): void {
    this.caisseService.isCaisseOuverte().subscribe({
      next: (response: any) => {
        if (response.status.toLowerCase() === 'ouvert' || response.status.toLowerCase() === 'active') {
          this.session = response.caisseDetails.session;
          this.caisseStatus = CaisseStatus.OPEN;
          this.onRefresh();
          this.cashierName = response.caisseDetails?.nomEmploye || 'N/A';
        } else if (response.status === 'pending_closure') {
          this.session = response.caisseDetails.session;
          this.caisseStatus = CaisseStatus.PENDING;
          this.cashierName = response.caisseDetails?.nomEmploye || 'N/A';
        } else if (response.status === 'none') {
          this.caisseStatus = CaisseStatus.NONE;
          this.cashierName = response.caisseDetails?.nomEmploye || 'N/A';
        }
        else if (response.status === 'already_open') {
          this.caisseStatus = CaisseStatus.ALREADYOPEN;
          this.cashierName = response.caisseDetails?.nomEmploye || 'N/A';
        } else {
          this.caisseStatus = CaisseStatus.OTHER;
          this.cashierName = 'N/A';
        }

      },
      error: (err: any) => {
        console.error('Failed to check caisse status:', err);
        this.caisseStatus = CaisseStatus.OTHER;
        this.cashierName = 'N/A';
      }
    });
  }

  manageCaisse(): void {
    if (this.caisseStatus === 'none') {
      const dialogRef = this.dialog.open(GestionCaisseDialogComponent, {
        data: {
          type: "open",
          session: this.session,
          statut: this.caisseStatus,
          caissierName: this.cashierName
        },
        width: "80%",
        panelClass: ['theme-dialog'],
        autoFocus: false,
      });
      dialogRef.afterClosed().subscribe((data: any) => {
        console.log('Dialog closed', data);
        if (data.type === 'open') {
          this.caisseService.ouvrirCaisse(parseFloat(data.data.fondCaisse), data.data.ouvertureCaisse).subscribe({
            next: () => {
              this.snackBar.open('Caisse clôturée avec succès.', '×', {
                panelClass: 'success',
                verticalPosition: 'top',
                duration: 3000,
              });
              this.checkCaisseStatus();
            },
            error: (err: any) => {
              console.error('Erreur lors de la clôture de la caisse:', err);
              this.snackBar.open('Erreur lors de la clôture de la caisse.', '×', {
                panelClass: 'error',
                verticalPosition: 'top',
                duration: 3000,
              });
            }
          });
        }
      });
    } else if (this.caisseStatus === 'pending') {
      const dialogRef = this.dialog.open(GestionCaisseDialogComponent, {
        data: {
          type: "",
          session: this.session,
          statut: this.caisseStatus,
          caissierName: this.cashierName
        },
        width: "80%",
        panelClass: ['theme-dialog'],
        autoFocus: false,
      });
      dialogRef.afterClosed().subscribe((data: any) => {
        console.log('Dialog closed', data);
        if (data.action === 'validate') {
          this.caisseService.cloturerCaisse(parseFloat(data.data.fondCaisse), data.data.fermetureCaisse).subscribe({
            next: () => {
              this.snackBar.open('Caisse clôturée avec succès.', '×', {
                panelClass: 'success',
                verticalPosition: 'top',
                duration: 3000,
              });
              this.checkCaisseStatus();
            },
            error: (err: any) => {
              console.error('Erreur lors de la clôture de la caisse:', err);
              this.snackBar.open('Erreur lors de la clôture de la caisse.', '×', {
                panelClass: 'error',
                verticalPosition: 'top',
                duration: 3000,
              });
            }
          });
        }
      });
    } else if (this.caisseStatus === 'open') {
      this.caisseService.isCaisseOuverte().subscribe({
        next: () => {
          this.snackBar.open("Caisse fermée avec succès.", '×', {
            panelClass: 'success',
            verticalPosition: 'top',
            duration: 3000
          });
          this.checkCaisseStatus();
        },
        error: (err: any) => {
          console.error('Erreur lors de la fermeture de la caisse:', err);
          this.snackBar.open('Erreur lors de la fermeture de la caisse.', '×', {
            panelClass: 'error',
            verticalPosition: 'top',
            duration: 3000
          });
        }
      });
    } else if (this.caisseStatus === 'closed') {
      this.caisseService.isCaisseOuverte().subscribe({
        next: () => {
          this.snackBar.open("Caisse ouverte avec succès.", '×', {
            panelClass: 'success',
            verticalPosition: 'top',
            duration: 3000
          });
          this.checkCaisseStatus();
        },
        error: (err: any) => {
          console.error('Erreur lors de l\'ouverture de la caisse:', err);
          this.snackBar.open('Erreur lors de l\'ouverture de la caisse.', '×', {
            panelClass: 'error',
            verticalPosition: 'top',
            duration: 3000
          });
        }
      });
    } else {
      this.snackBar.open('Statut de la caisse inconnu.', '×', {
        panelClass: 'error',
        verticalPosition: 'top',
        duration: 3000
      });
    }
  }


  onAnnuler() {
    this.montantEncaisse = 0;
    this.calculateRendu();
  }


  onImprimer() {
    // logique d'impression
  }

  chargerVente(venteId: number) {
    // recharger les données
    this.venteId = venteId;
    this.ventesService.chargerVentesEnCoursNonEncaisser(venteId).subscribe({
      next: (response: any) => {
        this.leftDataSource = response.produits;
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

  supprimerVente(venteId: number, item: any) {
    // recharger les données
    this.venteId = venteId;
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      // width: '50%',
      data: {type: 'supprimerVente', data: item},
      panelClass: ['theme-dialog'],
      autoFocus: false,
    });
    dialogRef.afterClosed().subscribe((data: boolean) => {
      if (data === true) {
        this.ventesService.supprimerVente(venteId).subscribe({
          next: (response: any) => {
            this.onRefresh();
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
      } else {
        // Handle the "No" or dismissal case
        console.log('User canceled the action.');
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
        this.leftDataSource = [];

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
    const dialogRef = this.dialog.open(VenteDialogComponent, {
      data: null,
      width: "80%",
      panelClass: ['theme-dialog'],
      autoFocus: false,
    });
    dialogRef.afterClosed().subscribe((data: any) => {
      console.log('Dialog closed', data);
    });
  }

  fermerCaisse() {
    this.modalType = 'fermerCaisse';
    this.ventesService.listerVentesNonEncaissees(this.pageEnCours,this.sizeEnCours).subscribe({
      next: (ventes: any[]) => {
        if (ventes.length > 0) {
          this.snackBar.open('Impossible de fermer la caisse. Des ventes non encaissées sont présentes.', '×', {
            panelClass: 'error',
            verticalPosition: 'top',
            duration: 3000,
          });
        } else {
          const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            // width: '50%',
            data: {type: this.modalType, data: null},
            panelClass: ['theme-dialog'],
            autoFocus: false,
          });
          dialogRef.afterClosed().subscribe((data: boolean) => {
            if (data === true) {
              // Handle the "Yes" case
              console.log('User confirmed the action.');
              // Add logic for specific scenarios here
              this.performActionBasedOnType();
            } else {
              // Handle the "No" or dismissal case
              console.log('User canceled the action.');
            }
          });
        }
      },
      error: (err: any) => {
        console.error('Failed to fetch unencashed sales:', err);
        this.snackBar.open('Erreur lors de la vérification des ventes non encaissées.', '×', {
          panelClass: 'error',
          verticalPosition: 'top',
          duration: 3000,
        });
      }
    });
  }

  performActionBasedOnType(): void {
    // Example logic for handling different scenarios
    switch (this.modalType) {
      case 'fermerCaisse':
        this.closeCaisse();
        break;
      case 'ouvrirCaisse':
        this.openCaisse();
        break;
      case 'deleteItem':
        this.deleteItem();
        break;
      default:
        console.log('Unknown action type.');
    }
  }

  closeCaisse(): void {
    console.log('Closing caisse...');
    // Add logic to close caisse
    this.putCaissePendingClosure();
  }

  putCaissePendingClosure(): void {
    this.caisseService.setCaisseToClosed().subscribe({
      next: () => {
        this.snackBar.open('La caisse est maintenant en attente de clôture.', '×', {
          panelClass: 'success',
          verticalPosition: 'top',
          duration: 3000,
        });
        this.logoutUser();
      },
      error: (err: any) => {
        console.error('Erreur lors de la mise en attente de clôture de la caisse:', err);
        this.snackBar.open('Erreur lors de la mise en attente de clôture de la caisse.', '×', {
          panelClass: 'error',
          verticalPosition: 'top',
          duration: 3000,
        });
      }
    });
  }

  openCaisse(): void {
    console.log('Opening caisse...');
    // Add logic to open caisse
    this.manageCaisse()
  }

  deleteItem(): void {
    console.log('Deleting item...');
    // A

  }

  ouvrirCaisse() {
    this.modalType = 'ouvrirCaisse';
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      // width: '50%',
      data: {type: this.modalType, data: null},
      panelClass: ['theme-dialog'],
      autoFocus: false,
    });
    dialogRef.afterClosed().subscribe((data: boolean) => {
      if (data === true) {
        // Handle the "Yes" case
        console.log('User confirmed the action.');
        // Add logic for specific scenarios here
        this.performActionBasedOnType();
      } else {
        // Handle the "No" or dismissal case
        console.log('User canceled the action.');
      }
    });
  }

  handleOtherStatus() {

  }

  logoutUser(): void {
    this.authService.logout().subscribe({
      next: () => {
        localStorage.removeItem('token');
        this.snackBar.open('Déconnexion réussie.', '×', {
          panelClass: 'success',
          verticalPosition: 'top',
          duration: 3000,
        });
        // Redirect to login page or clear session
        window.location.href = '/sign-in';
      },
      error: (err: any) => {
        console.error('Erreur lors de la déconnexion:', err);
        this.snackBar.open('Erreur lors de la déconnexion.', '×', {
          panelClass: 'error',
          verticalPosition: 'top',
          duration: 3000,
        });
      }
    });
  }

  public pageEnCours:number = 1; // Default to 0 if undefined
  public sizeEnCours = 5;  // Default to 10 if undefined
  public totalItemsEnCours = 0;  // Default to 10 if undefined
  public countEnCours = 10;

  public onPageChangedVenteEnCours(event: PageEvent) {
    this.pageEnCours = event.pageIndex + 1;
    this.countEnCours = event.pageSize
    this.onRefresh();
  }

  onRefresh() {
    // recharger les données
    this.ventesService.listerVentesNonEncaissees(this.pageEnCours-1,this.countEnCours).subscribe({
      next: (response: any) => {
        this.headerDataSource = response.content;
        this.countEnCours= response.pageable.pageSize;
        this.totalItemsEnCours = response.totalElements;

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
    });
  }

}
