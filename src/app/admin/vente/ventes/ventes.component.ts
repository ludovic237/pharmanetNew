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
import {EmployesService} from "@services/employes.service";
import autoTable from "jspdf-autotable";
import {LoaderService} from "@services/loader.service";

@Component({
  selector: 'app-ventes',
  providers: [PrescripteursService, EmployesService, UsersService, VentesService, EnrayonsService, ProductService, PrescripteursService],
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

  totalAmount = 0;

  etat: string = null;
  dateVente: string = null;
  dateEncaissement: string = null;
  userId: string = null;
  employeId: string = null;
  prescripteurId: string = null;
  caisseId: string = null;

  displayedColumns: string[] = ['ref', 'client', 'vendeur', 'montant', 'montantPerçu', 'dateEncaissement', 'dateVente', 'etat', 'actions'];

  etats: string[] = ['COMPTANT', 'CREDIT', 'ASSURANCE'];
  utilisateurs: any[] = [];
  employes: any[] = [];
  prescripteurs: any[] = [];
  caisses: any[] = ["oui", "non"];

  selectedEtat: string | null = null;
  selectedUtilisateur: number | null = null;
  selectedEmploye: number | null = null;
  selectedPrescripteur: number | null = null;
  selectedCaisse: string = "oui";

  startDateVente: Date | null = new Date(new Date().getFullYear(), 0, 1);
  endDateVente: Date | null = new Date();
  startDateEncaissement: Date | null = new Date(new Date().getFullYear(), 0, 1);
  endDateEncaissement: Date | null = new Date();


  fournisseurs: any[] = [];

  selectedEtats: string = 'all'; // Default to "All"

  constructor(
    public loaderService: LoaderService,
    public authService: AuthService,
    public appSettings: SettingsService,
    public snackBar: MatSnackBar,
    public enRayonService: EnrayonsService,
    public employesService: EmployesService,
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
    const today = new Date()
    this.fetchVentesPageable()
    this.getEmployes();
    this.getPrescripteurs()
    this.getClients();
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

    this.ventesService.fetchVentesPageableRange(
      this.page - 1,
      this.count,
      this.selectedEtat,
      formatDate(new Date(new Date(this.startDateVente).setHours(0, 0, 0, 0)) + ""),
      formatDate(new Date(new Date(this.endDateVente).setHours(23, 59, 59, 0)) + ""),
      formatDate(new Date(new Date(this.startDateEncaissement).setHours(0, 0, 0, 0)) + ""),
      formatDate(new Date(new Date(this.endDateEncaissement).setHours(23, 59, 59, 0)) + ""),
      this.selectedUtilisateur + "",
      this.selectedEmploye + "",
      this.selectedPrescripteur + "",
      this.selectedCaisse
    ).subscribe({
      next: (data: any) => {
        this.count = data.pageSize;
        this.totalItems = data.totalElements;
        this.ventes = data.content.content;
        this.totalAmount = data.totalAmount;
      },
      error: (err) => {
        console.error('Error fetching commandes:', err);
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

  fetchVentesPageablePrint(): void {
    const formatDate = (date: string | null): string | null => {
      if (!date) return null;
      const parsedDate = new Date(date);
      return `${parsedDate.getFullYear()}-${String(parsedDate.getMonth() + 1).padStart(2, '0')}-${String(parsedDate.getDate()).padStart(2, '0')}T${String(parsedDate.getHours()).padStart(2, '0')}:${String(parsedDate.getMinutes()).padStart(2, '0')}:${String(parsedDate.getSeconds()).padStart(2, '0')}`;
    };

    this.ventesService.fetchVentesPageableRangePrint(
      this.page - 1,
      this.count,
      this.selectedEtat,
      formatDate(new Date(new Date(this.startDateVente).setHours(0,0,0,0)) + ""),
      formatDate(new Date(new Date(this.endDateVente).setHours(23,59,59,999)) + ""),
      formatDate(new Date(new Date(this.startDateEncaissement).setHours(0,0,0,0)) + ""),
      formatDate(new Date(new Date(this.endDateEncaissement).setHours(23,59,59,999)) + ""),
      this.selectedUtilisateur + "",
      this.selectedEmploye + "",
      this.selectedPrescripteur + "",
      this.selectedCaisse
    ).subscribe({
      next: (data: any) => {

      },
      error: (err) => {
        console.error('Error fetching commandes:', err);
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
      },
    });
  }

  async generateTicket(data: any): Promise<void> {

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width

    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Pharmacie ALSAS', 10, 10);
    doc.text('Dr GAMWO Sandrine', 10, 15);
    doc.text('BP 38 FOUMBOT', 10, 20);
    doc.text('Tel : (+237) 233 267 487', 10, 25);
    doc.text(`Ticket N°: ${data.vente.reference}`, 10, 30);
    doc.text(`Vendu le: ${data.vente.dateVente}`, 10, 35);
    doc.text(`Encaisser le: ${data.vente.dateEncaissement}`, 10, 40);
    doc.text(`Vendeur: ${data.vente.employe.user ? data.vente.employe.user.nom : "N/A"} ${data.vente.employe.user ? data.vente.employe.user.prenom : ""}`, 10, 45);
    doc.text(`Acheteur: ${data.vente.user ? data.vente.user.nom : "N/A"} ${data.vente.user ? data.vente.user.prenom : ""}`, 10, 50);

    const columns = [
      {header: 'Libellé', dataKey: 'nom'},
      {header: 'Prix U', dataKey: 'prixUnitaire'},
      {header: 'Qte', dataKey: 'quantite'},
      {header: 'Total', dataKey: 'prixTotal'},
      {header: 'Rd(%)', dataKey: 'reduction'},
    ];

    autoTable(doc, {
      columns,
      body: data.produits,
      headStyles: {fillColor: [22, 160, 133]},
      margin: {top: 20},
      startY: 60
    })

    const totalPrixProduits = data.produits.reduce((sum: number, produit: any) => sum + produit.prixTotal, 0);

    const prixRemise = totalPrixProduits - data.vente.prixTotal;
    const pourcentageRemise = (prixRemise / totalPrixProduits) * 100;

    // Summary
    let y = (doc as any).lastAutoTable.finalY
    y += 5;
    doc.text(`Montant: ${totalPrixProduits} FCFA`, 10, y);
    y += 5;
    doc.text(`Total: ${data.vente.prixTotal} FCFA`, 10, y);
    y += 5;
    doc.text(`Remise: ${pourcentageRemise} %`, 10, y);
    y += 5;
    doc.text(`Net à payer: ${data.vente.prixTotal} FCFA`, 10, y);

    // Payment Details
    y += 10;
    doc.text(`Montant Espèce: ${data.montantEspece} FCFA`, 10, y);
    y += 5;
    doc.text(`Montant Electronique: ${data.montantElectronique} FCFA`, 10, y);
    y += 5;
    doc.text(`Montant Ticket: ${data.montantTicket} FCFA`, 10, y);

    // Footer
    y += 10;
    doc.text(`Montant total encaissé: ${data.vente.prixPercu} FCFA`, 10, y);
    y += 5;
    doc.text(`Montant rendu: ${(data.vente.prixPercu - data.vente.prixTotal)} FCFA`, 10, y);
    y += 5;
    doc.text('Ce ticket vaut facture', 10, y);
    y += 5;
    doc.text('Merci et bonne santé', 10, y);
    y += 5;
    doc.text('NoCT / POS85127004888', 10, y);

    // QR Code
    if (data.vente.reference) {
      const qrCodeDataUrl = await QRCode.toDataURL(data.vente.id + "");
      doc.addImage(qrCodeDataUrl, 'PNG', pageWidth - 40, y - 30, 30, 30);
    } else {
      console.error('Erreur: La référence de la vente est manquante.');
      this.snackBar.open('Erreur: La référence de la vente est manquante.', '×', {
        panelClass: 'error',
        duration: 3000,
      });
    }

    // Save PDF
    doc.save(`Ticket_${data.vente.reference}.pdf`);
  }

  getEmployes(): void {
    this.employes = null; //for show spinner each time
    this.employesService.getEmployes().subscribe({
      next: (users) => {
        this.employes = users
        this.totalItems = users.length;
      },
      error: (err: any) => {
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

  getPrescripteurs(): void {
    this.employes = null; //for show spinner each time
    this.prescripteursService.getPrescripteurs().subscribe({
      next: (users) => {
        this.prescripteurs = users
        this.totalItems = users.length;
      },
      error: (err: any) => {
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

  getClients(): void {
    this.utilisateurs = null; //for show spinner each time
    this.usersService.getUsers().subscribe({
      next: (users) => {
        this.utilisateurs = users
        this.totalItems = users.length;
      },
      error: (err: any) => {
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
}
