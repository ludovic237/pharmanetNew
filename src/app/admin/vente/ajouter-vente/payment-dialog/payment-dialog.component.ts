import {Component, Inject, OnInit} from '@angular/core';
import {SettingsService} from "@services/settings.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {EnrayonsService} from "@services/enrayons.service";
import {CaisseService} from "@services/caisse.service";
import {AuthService} from "@services/auth.service";
import {TicketCaisseService} from "@services/tickets.service";
import {DepenseService} from "@services/depenses.service";
import {BonCaisseService} from "@services/boncaisses.service";
import {ProductService} from "@services/products.service";
import {VentesService} from "@services/ventes.service";
import {PrescripteursService} from "@services/prescripteurs.service";
import {MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef} from "@angular/material/dialog";
import {FormBuilder, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {MatCardModule} from "@angular/material/card";
import {MatInputModule} from "@angular/material/input";
import {MatSelectModule} from "@angular/material/select";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatButtonModule} from "@angular/material/button";
import {MatDividerModule} from "@angular/material/divider";
import {MatIconModule} from "@angular/material/icon";
import {MatTableModule} from "@angular/material/table";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {FlexLayoutModule} from "@ngbracket/ngx-layout";
import {MatPaginatorModule} from "@angular/material/paginator";
import {MatRadioModule} from "@angular/material/radio";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatExpansionModule} from "@angular/material/expansion";
import {MatTabsModule} from "@angular/material/tabs";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatNativeDateModule} from "@angular/material/core";

@Component({
  selector: 'app-payment-dialog',
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
    FlexLayoutModule,
    CommonModule,
    FormsModule,
    MatCardModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatButtonModule, MatDividerModule, MatIconModule,
    MatTableModule,
    MatToolbarModule,
    MatAutocompleteModule
  ],
  templateUrl: './payment-dialog.component.html',
  styleUrl: './payment-dialog.component.scss'
})
export class PaymentDialogComponent implements OnInit {

  venteId: number = 0;

  netAPayer = 0;
  selectedTabIndex: number = 0;
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

  result: any = {}

  constructor(
    public authService: AuthService,
    public snackBar: MatSnackBar, public dialogRef: MatDialogRef<PaymentDialogComponent>,
    public appSettings: SettingsService,
    public enRayonService: EnrayonsService,
    public caisseService: CaisseService,
    public ticketCaisseService: TicketCaisseService,
    public depenseService: DepenseService,
    public bonCaisseService: BonCaisseService,
    public productService: ProductService,
    public ventesService: VentesService,
    public prescripteursService: PrescripteursService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public fb: FormBuilder,
    public dialog: MatDialog) {

  }

  ngOnInit(): void {
    console.log(this.data)
    this.result = {
      venteRequestDto: this.data,
      encaissementDto: null
    }
    this.netAPayer = this.data.prixTotal - this.data.prixReduction
  }

  onTabChange(index: number): void {
    this.selectedTabIndex = index;
    // this.rendu = 0
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

    this.result.encaissementDto = encaissementDetails

    this.ventesService.encaisserVenteDirect(this.result).subscribe({
      next: () => {

        // Show success message
        this.snackBar.open("Vente successfully", '×', {
          panelClass: 'success',
          verticalPosition: 'top',
          duration: 3000
        });
        this.dialogRef.close()
      },
      error: (err: any) => {
        console.error('Failed to fetch BonCaisse list:', err);
        if (err.status === 401 || err.status === 403){
          this.authService.logout();
          this.snackBar.open('Déconnexion réussie.', '×', {
            panelClass: 'success',
            verticalPosition: 'top',
            duration: 3000,
          });
          // Redirect to login page or clear session
          window.location.href = '/sign-in';
        }
        else
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
        error: (err:any) => {
          this.montantTicket = 0;
          if (err.status === 401 || err.status === 403){
            this.authService.logout();
            this.snackBar.open('Déconnexion réussie.', '×', {
              panelClass: 'success',
              verticalPosition: 'top',
              duration: 3000,
            });
            // Redirect to login page or clear session
            window.location.href = '/sign-in';
          }
          else
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

  onAnnuler() {
    this.montantEncaisse = 0;
    this.calculateRendu();
  }

  onImprimer() {
    // logique d'impression
  }

}
