import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
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
import {MatTableModule} from "@angular/material/table";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {FlexLayoutModule} from "@ngbracket/ngx-layout";
import {VentesService} from "@services/ventes.service";
import {FournisseursService} from "@services/fournisseurs.service";
import {CommandesService} from "@services/commandes.service";

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
    FlexLayoutModule
  ],
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
  public enRayonList: any[] = [];
  public modifiedProducts: any[] = [];
  public displayedColumns: string[] = [
    'produit',
    'quantite',
    'quantiteAdjust',
    'prixVente',
    'datePeremption',
    'dateLivraison',
    'actions'
  ];
  public settings: Settings;

  constructor(
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
    this.searchFournisseur()
  }

  validateModifiedQuantities(): void {
    this.modifiedProducts = this.enRayonList.filter(item => item.quantiteRestante > 0);
    this.snackBar.open(`${this.modifiedProducts.length} produits modifiés.`, '×', {
      panelClass: 'success',
      verticalPosition: 'top',
      duration: 3000
    });
    console.log("this.modifiedProducts")
    console.log(this.modifiedProducts)
    // this.dialogRef.close(this.modifiedProducts);

    this.commandesService.commandeByFournisseur(this.selectedFournisseur, this.total + "", this.modifiedProducts).subscribe({
      next: (data) => {
        this.dialogRef.close(data);
        this.snackBar.open(`Commande cree.`, '×', {
          panelClass: 'success',
          verticalPosition: 'top',
          duration: 3000
        });
      },
      error: (err: any) => {
        if (err.status === 401 || err.status === 403) {
          this.authService.logout();
          localStorage.removeItem('token');
          this.snackBar.open('Déconnexion réussie.', '×', {
            panelClass: 'success',
            verticalPosition: 'top',
            duration: 3000,
          });
          // Redirect to login page or clear session
          window.location.href = '/sign-in';
        }
        if (err.status === 500) {
          this.authService.logout();
          localStorage.removeItem('token');
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
    this.modifiedProducts = this.enRayonList.filter(item => item.quantiteRestante > 0);
    this.total = 0
    this.modifiedProducts.forEach((product: any) => {
      this.total = this.total + (product.quantiteRestante * product.prixAchat)
    })
  }

  increment(item: any, field: 'quantiteRestante' | 'prixAchat') {
    item[field]++;
    this.modifiedProducts = this.enRayonList.filter(item => item.quantiteRestante > 0);
    this.total = 0
    this.modifiedProducts.forEach((product: any) => {
      this.total = this.total + (product.quantiteRestante * product.prixAchat)
    })
  }

  decrement(item: any, field: 'quantiteRestante' | 'prixAchat') {
    if (item[field] > 0) {
      item[field]--;
    }
    this.modifiedProducts = this.enRayonList.filter(item => item.quantiteRestante > 0);
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

  getDataVente() {
    if (this.form.valid){
      this.ventesService.listerVenteParNombreDeJourEtFournisseur(this.form.value.fournisseur, this.form.value.jour + "").subscribe({
        next: (data: any[]) => {
          console.log("getDataVente")
          console.log(data)
          this.enRayonList = data;
          this.total = 0;
        },
        error: (err: any) => {
          if (err.status === 401 || err.status === 403) {
            this.authService.logout();
            this.snackBar.open('Déconnexion réussie.', '×', {
              panelClass: 'success',
              verticalPosition: 'top',
              duration: 3000,
            });
            // Redirect to login page or clear session
            window.location.href = '/sign-in';
          }
          console.error('Error deleting user:', err);
        }
      });
    }
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

}
