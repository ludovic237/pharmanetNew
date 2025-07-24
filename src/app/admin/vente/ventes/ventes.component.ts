import {Component, inject, OnInit} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatDividerModule} from '@angular/material/divider';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {FlexLayoutModule} from '@ngbracket/ngx-layout';
import {DomHandlerService} from '@services/dom-handler.service';
import {NgxPaginationModule} from 'ngx-pagination';
import {SettingsService} from "@services/settings.service";
import {MatSnackBar, MatSnackBarModule} from "@angular/material/snack-bar";
import {EnrayonsService} from "@services/enrayons.service";
import {CommandesService} from "@services/commandes.service";
import {FournisseursService} from "@services/fournisseurs.service";
import {ProductService} from "@services/products.service";
import {VentesService} from "@services/ventes.service";
import {UsersService} from "@services/users.service";
import {PrescripteursService} from "@services/prescripteurs.service";
import {MatDialog} from "@angular/material/dialog";
import {MatTableModule} from "@angular/material/table";
import {MatMenuModule} from "@angular/material/menu";
import {MatListModule} from "@angular/material/list";
import {MatChipsModule} from "@angular/material/chips";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatExpansionModule} from "@angular/material/expansion";
import {CommonModule} from "@angular/common";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatTabsModule} from "@angular/material/tabs";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatNativeDateModule} from "@angular/material/core";
import {MatSelectModule} from "@angular/material/select";
import {MatStepperModule} from "@angular/material/stepper";
import {MatRadioModule} from "@angular/material/radio";
import {jsPDF} from "jspdf";
import QRCode from "qrcode";
import {MatPaginatorModule, PageEvent} from "@angular/material/paginator";
import {AuthService} from "@services/auth.service";

@Component({
  selector: 'app-ventes',
  providers: [UsersService, VentesService, EnrayonsService, ProductService, PrescripteursService],
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
  templateUrl: './ventes.component.html'
})
export class VentesComponent implements OnInit {
  ventes: any[] = []
  page: number = 1;
  count = 5;
  totalItems = 0;

  etat: string = null;
  dateVente: string = null;
  dateEncaissement: string = null;
  userId: string = null;
  employeId: string = null;
  prescripteurId: string = null;
  caisseId: string = null;

  displayedColumns: string[] = ['ref', 'client', 'vendeur', 'montant', 'montantPerçu', 'dateEncaissement', 'dateVente', 'etat', 'actions'];

  etats: string[] = ['EN_COURS', 'ENCAISSE', 'ANNULER'];
  utilisateurs: any[] = [];
  employes: any[] = [];
  prescripteurs: any[] = [];
  caisses: any[] = [];

  selectedEtat: string | null = null;
  selectedUtilisateur: number | null = null;
  selectedEmploye: number | null = null;
  selectedPrescripteur: number | null = null;
  selectedCaisse: number | null = null;

  startDateVente: Date | null = null;
  endDateVente: Date | null = null;
  startDateEncaissement: Date | null = null;
  endDateEncaissement: Date | null = null;

  fournisseurs: any[] = [];

  selectedEtats: string = 'all'; // Default to "All"

  constructor(
    public authService: AuthService,
    public appSettings: SettingsService,
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

  ngOnInit(): void {
    this.fetchVentesPageable()
  }

  public onPageChanged(event: PageEvent) {
    this.page = event.pageIndex + 1;
    this.count = event.pageSize;
    this.domHandlerService.winScroll(0, 0);
    this.fetchVentesPageable();
  }

  fetchVentesPageable(): void {
    const formatDate = (date: string | null): string | null => {
      if (!date) return null;
      const parsedDate = new Date(date);
      return `${parsedDate.getFullYear()}-${String(parsedDate.getMonth() + 1).padStart(2, '0')}-${String(parsedDate.getDate()).padStart(2, '0')}T${String(parsedDate.getHours()).padStart(2, '0')}:${String(parsedDate.getMinutes()).padStart(2, '0')}:${String(parsedDate.getSeconds()).padStart(2, '0')}`;
    };

    // const formattedStartDate = formatDate(this.startDate);
    // const formattedEndDate = formatDate(this.endDate);

    this.ventesService.fetchVentesPageable(
      this.page - 1,
      this.count,
      this.etat,
      this.dateVente,
      this.dateEncaissement,
      this.userId,
      this.employeId,
      this.prescripteurId,
      this.caisseId
    ).subscribe({
      next: (data: any) => {
        this.count = data.pageable.pageSize;
        this.totalItems = data.totalElements;
        this.ventes = data.content;
      },
      error: (err) => {
        console.error('Error fetching commandes:', err);
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
      }
    });
  }

  loadFilters(): void {
    this.ventesService.getUtilisateurs().subscribe(data => this.utilisateurs = data);
    this.ventesService.getEmployes().subscribe(data => this.employes = data);
    this.ventesService.getPrescripteurs().subscribe(data => this.prescripteurs = data);
    this.ventesService.getCaisses().subscribe(data => this.caisses = data);
  }

  imprimerTicket(venteId: string): void {
    this.ventesService.chargerVentesEncaisser(Number(venteId)).subscribe({
      next: (vente: any) => {
        this.generateTicket(vente).then(() => {
          this.snackBar.open(`Ticket imprimé pour la référence: ${vente.vente.reference}`, '×', {
            panelClass: 'success',
            duration: 3000,
          });
        });
      },
      error: (err: any) => {
        console.error('Erreur lors de la récupération des informations de la vente:', err);
        this.snackBar.open('Erreur lors de la récupération des informations de la vente.', '×', {
          panelClass: 'error',
          duration: 3000,
        });
      },
    });
  }

  async generateTicket(vente: any): Promise<void> {
    console.log("vente")
    console.log(vente)

    const doc = new jsPDF();

    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Pharmacie ALSAS', 10, 10);
    doc.text('Dr GAMWO Sandrine', 10, 15);
    doc.text('BP 38 FOUMBOT', 10, 20);
    doc.text('Tel : (+237) 233 267 487', 10, 25);
    doc.text(`Ticket N°: ${vente.vente.ref}`, 10, 30);
    doc.text(`Vendu le: ${vente.vente.dateVente}`, 10, 35);
    doc.text(`Encaisser le: ${vente.vente.dateEncaissement}`, 10, 40);
    doc.text(`Vendeur: ${vente.vente.vendeur}`, 10, 45);
    doc.text(`Acheteur: ${vente.vente.acheteur}`, 10, 50);

    // Table Header
    doc.setFontSize(10);
    doc.text('Libellé', 10, 60);
    doc.text('Prix U.', 60, 60);
    doc.text('Qte', 90, 60);
    doc.text('Total', 110, 60);
    doc.text('Rd(%)', 140, 60);

    // Table Content
    let y = 65;
    vente.produits.forEach((produit: any) => {
      doc.text(produit.nom + " " + produit.nom + " " + produit.nom, 10, y);
      doc.text(`${produit.prixUnitaire ?? 0}`, 60, y);
      doc.text(`${produit.quantite ?? 0}`, 90, y);
      doc.text(`${produit.prixTotal ?? 0}`, 110, y);
      doc.text(`${produit.reduction ?? 0}`, 140, y);
      y += 5;
    });
    const totalPrixProduits = vente.produits.reduce((sum: number, produit: any) => sum + produit.prixTotal, 0);
    console.log(`Prix total des produits: ${totalPrixProduits}`);

    const prixRemise = totalPrixProduits - vente.vente.prixTotal;
    const pourcentageRemise = (prixRemise / totalPrixProduits) * 100;
    // Summary
    y += 5;
    doc.text(`Montant: ${totalPrixProduits} FCFA`, 10, y);
    y += 5;
    doc.text(`Total: ${vente.vente.prixTotal} FCFA`, 10, y);
    y += 5;
    doc.text(`Remise: ${pourcentageRemise} %`, 10, y);
    y += 5;
    doc.text(`Net à payer: ${vente.vente.prixTotal} FCFA`, 10, y);

    // Payment Details
    y += 10;
    doc.text(`Montant Espèce: ${vente.montantEspece} FCFA`, 10, y);
    y += 5;
    doc.text(`Montant Electronique: ${vente.montantElectronique} FCFA`, 10, y);
    y += 5;
    doc.text(`Montant Ticket: ${vente.montantTicket} FCFA`, 10, y);

    // Footer
    y += 10;
    doc.text(`Montant total encaissé: ${vente.vente.prixPercu} FCFA`, 10, y);
    y += 5;
    doc.text(`Montant rendu: ${(vente.vente.prixPercu - vente.vente.prixTotal)} FCFA`, 10, y);
    y += 5;
    doc.text('Ce ticket vaut facture', 10, y);
    y += 5;
    doc.text('Merci et bonne santé', 10, y);
    y += 5;
    doc.text('NoCT / POS85127004888', 10, y);

    // QR Code
    if (vente.vente.ref) {
      const qrCodeDataUrl = await QRCode.toDataURL(vente.vente.reference);
      doc.addImage(qrCodeDataUrl, 'PNG', 10, y + 5, 30, 30);
    } else {
      console.error('Erreur: La référence de la vente est manquante.');
      this.snackBar.open('Erreur: La référence de la vente est manquante.', '×', {
        panelClass: 'error',
        duration: 3000,
      });
    }

    // Save PDF
    doc.save(`Ticket_${vente.vente.reference}.pdf`);
  }

}
