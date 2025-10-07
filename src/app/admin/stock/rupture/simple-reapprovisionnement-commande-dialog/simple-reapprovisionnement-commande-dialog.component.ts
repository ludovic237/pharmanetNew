import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {Settings, SettingsService} from "@services/settings.service";
import {AuthService} from "@services/auth.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef} from "@angular/material/dialog";
import {EnrayonsService} from "@services/enrayons.service";
import {
  UpdateProduitDetailDialogComponent
} from "../../../vente/ajouter-vente/ajouter-vente-dialog/update-produit-detail-dialog/update-produit-detail-dialog.component";
import {CommonModule} from "@angular/common";
import {MatCardModule} from "@angular/material/card";
import {MatInputModule} from "@angular/material/input";
import {MatSelectModule} from "@angular/material/select";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatButtonModule} from "@angular/material/button";
import {MatDividerModule} from "@angular/material/divider";
import {MatIconModule} from "@angular/material/icon";
import {MatTableDataSource, MatTableModule} from "@angular/material/table";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {FlexLayoutModule} from "@ngbracket/ngx-layout";
import {VentesService} from "@services/ventes.service";
import {FournisseursService} from "@services/fournisseurs.service";
import {CommandesService} from "@services/commandes.service";
import {LoaderService} from "@services/loader.service";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatNativeDateModule, provideNativeDateAdapter} from "@angular/material/core";
import {MatPaginator, MatPaginatorModule} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";

@Component({
  selector: 'app-simple-reapprovisionnement-commande-dialog',
  imports: [
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
    MatAutocompleteModule,
    FlexLayoutModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatPaginatorModule
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './simple-reapprovisionnement-commande-dialog.component.html',
  styleUrl: './simple-reapprovisionnement-commande-dialog.component.scss'
})
export class SimpleReapprovisionnementCommandeDialogComponent implements OnInit {
  public selectedFournisseur: string | null = null;
  public jour: number = 14;
  fournisseurs: any[] = [];
  public form: FormGroup;
  total: number = 0
  type = "detail"
  public enRayonList = new MatTableDataSource<any>([]);
  public modifiedProducts: any[] = [];
  public displayedColumns: string[] = [
    'produit',
    'quantite',
    'quantiteAdjust',
    'prixVente',
    'prixAchat',
    'datePeremption',
    'dateLivraison',
    'actions'
  ];
  public settings: Settings;

  fournisseur: any = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator
  @ViewChild(MatSort) sort!: MatSort

  constructor(
    public loaderService: LoaderService,
    public authService: AuthService,
    public fournisseursService: FournisseursService,
    public ventesService: VentesService,
    public commandesService: CommandesService,
    public snackBar: MatSnackBar, public dialogRef: MatDialogRef<SimpleReapprovisionnementCommandeDialogComponent>,
    public enRayonService: EnrayonsService, // Replace with actual service
    @Inject(MAT_DIALOG_DATA) public data: any,
    public fb: FormBuilder,
    public dialog: MatDialog,
    public settingsService: SettingsService) {
    this.settings = this.settingsService.settings;
  }

  ngOnInit(): void {
    // this.getDataVente()
    this.form = this.fb.group({
      id: 0,
      fournisseur: ['', Validators.required],
      jour: [14, Validators.required],
    });
    this.searchFournisseur();
    this.enRayonList = new MatTableDataSource<any, MatPaginator>(this.data.data.map((produit: any) => {
      produit.datePeremptionControl = new FormControl(new Date(produit.datePeremption))
      produit.dateLivraisonControl = new FormControl(new Date(produit.dateLivraison))
      return produit
    }))
  }

  ngAfterViewInit() {
    this.enRayonList.paginator = this.paginator
  }

  validateModifiedQuantities(): void {
    this.modifiedProducts = this.enRayonList.data.filter(item => item.quantiteRestante > 0);
    console.log("this.fournisseur")
    console.log(this.fournisseur)
    this.snackBar.open(`${this.modifiedProducts.length} produits modifiés.`, '×', {
      panelClass: 'success',
      verticalPosition: 'top',
      duration: 3000
    });
    console.log("this.modifiedProducts")
    console.log(this.modifiedProducts)
    // this.dialogRef.close(this.modifiedProducts);

    this.commandesService.commandeByFournisseurRupture("", this.fournisseur.id, this.total + "", this.modifiedProducts).subscribe({
      next: (data) => {
        this.dialogRef.close({type:"commande"});
        this.snackBar.open(`Commande cree.`, '×', {
          panelClass: 'success',
          verticalPosition: 'top',
          duration: 3000
        });

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
        if (err.status === 500) {
          this.authService.logout();
          localStorage.removeItem('token');
          localStorage.setItem("lastLink", window.location.href);
          ;
          this.snackBar.open(err.message, '×', {
            panelClass: 'success',
            verticalPosition: 'top',
            duration: 3000,
          });
        }
        console.error('Error deleting user:', err);
      }
    });
  }

  updateTotal(item: any) {
    this.modifiedProducts = this.enRayonList.data.filter(item => item.quantiteRestante > 0);
    this.total = 0
    this.modifiedProducts.forEach((product: any) => {
      this.total = this.total + (product.quantiteRestante * product.prixAchat)
    })
  }

  increment(item: any, field: 'quantiteRestante' | 'prixAchat' | 'prix') {
    item[field]++;
    this.modifiedProducts = this.enRayonList.data.filter(item => item.quantiteRestante > 0);
    this.total = 0
    this.modifiedProducts.forEach((product: any) => {
      this.total = this.total + (product.quantiteRestante * product.prixAchat)
    })
  }

  decrement(item: any, field: 'quantiteRestante' | 'prixAchat' | 'prix') {
    if (item[field] > 0) {
      item[field]--;
    }
    this.modifiedProducts = this.enRayonList.data.filter(item => item.quantiteRestante > 0);
    this.total = 0
    this.modifiedProducts.forEach((product: any) => {
      this.total = this.total + (product.quantiteRestante * product.prixAchat)
    })
  }

  currentDate = new Date();

  isExpired(datePeremption: Date): boolean {
    return new Date(datePeremption) < this.currentDate;
  }

  isExpiringSoon(datePeremption: Date): boolean {
    const diffInDays = (new Date(datePeremption).getTime() - this.currentDate.getTime()) / (1000 * 60 * 60 * 24);
    return diffInDays > 0 && diffInDays <= 90;
  }

  isValid(datePeremption: Date): boolean {
    const diffInDays = (new Date(datePeremption).getTime() - this.currentDate.getTime()) / (1000 * 60 * 60 * 24);
    return diffInDays > 90;
  }


  getDaysToExpiration(datePeremtion: any) {
    const today = new Date();
    const expirationDate = new Date(datePeremtion)
    const diff = expirationDate.getTime() - today.getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  getDaysAfterExpiration(datePeremtion: any) {
    const today = new Date();
    const expirationDate = new Date(datePeremtion)
    if (today <= expirationDate) {
      return 0
    }
    const diff = today.getTime() - expirationDate.getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
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

  saveDatePeremtion(item: any) {
    console.log("save date")
    console.log(item)
    if (item.datePeremptionControl) {
      const nouvelleDate = item.datePeremptionControl.value;
      console.log("nouvelleDate")
      console.log(nouvelleDate)
      const dateIsoPourBackend = nouvelleDate.toISOString();
      if (nouvelleDate) {
        console.log("dateIsoPourBackend")
        console.log(dateIsoPourBackend)
        item.datePeremption = dateIsoPourBackend
      } else {
        item.datePeremption = null
      }
    }
  }

  saveDateLivraison(item: any) {
    console.log("save date")
    console.log(item)
    if (item.dateLivraisonControl) {
      const nouvelleDate = item.dateLivraisonControl.value;
      console.log("nouvelleDate")
      console.log(nouvelleDate)
      const dateIsoPourBackend = nouvelleDate.toISOString();
      if (nouvelleDate) {
        console.log("dateIsoPourBackend")
        console.log(dateIsoPourBackend)
        item.dateLivraison = dateIsoPourBackend
      } else {
        item.dateLivraison = null
      }
    }
  }

  get canCreateCommande(): boolean {
    return this.fournisseur != null &&
      this.modifiedProducts.length > 0;
  }

}
