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
import {TypeSortiesService} from "@services/type-sorties.service";
import {ProductService} from "@services/products.service";
import {BehaviorSubject, Subject, combineLatest, switchMap, takeUntil} from 'rxjs';
import {SortiesService} from "@services/sorties.service";
import {LoaderService} from "@services/loader.service";

@Component({
  selector: 'app-sortie-simple-product-detail-rayon-dialog',
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
  templateUrl: './sortie-simple-product-detail-rayon-dialog.component.html',
  styleUrl: './sortie-simple-product-detail-rayon-dialog.component.scss'
})
export class SortieSimpleProductDetailRayonDialogComponent implements OnInit {
  type = "detail"
  public enRayonList: any[] = [];
  public sourceList: any[] = [];

  sortieForm: FormGroup;
  typeSorties: any[] = [];
  produits: any[] = [];

  public modifiedProducts: any[] = [];
  public displayedColumns: string[] = [
    'produit',
    'quantite',
    'quantiteAdjust',
    'prixVente',
    'datePeremption',
    'dateLivraison',
    'reduction',
    'actions'
  ];
  public form: FormGroup;
  public settings: Settings;

  title = "Gestion des Produits en Rayon"
  produitName = "N/A"
  produit: any

  constructor(
     public loaderService: LoaderService,
    public authService: AuthService,
    public snackBar: MatSnackBar, public dialogRef: MatDialogRef<SortieSimpleProductDetailRayonDialogComponent>,
    public enRayonService: EnrayonsService, // Replace with actual service
    @Inject(MAT_DIALOG_DATA) public data: any,
    public fb: FormBuilder,
    public typeSortiesService: TypeSortiesService,
    public productService: ProductService,
    public sortiesService: SortiesService,
    public dialog: MatDialog,
    public settingsService: SettingsService) {
    this.settings = this.settingsService.settings;
    this.sortieForm = this.fb.group({
      produitName: [null, Validators.required],
      produitTypeSortieList: [null, Validators.required],
    });
  }

  ngOnInit(): void {
    this.getTypeSortiePageable("null");

    combineLatest([
      this.productService.getProductById(this.data.id),
      this.typeSortiesService.getTypeSortiePageable(0, 10, "id", "desc", "")
    ]).subscribe({
      next: ([produit, sorties]) => {
        this.typeSorties = sorties.content.filter((item: any) => item.id == 3)
        this.produit = produit
        this.produitName = this.produit.nom

        this.sortieForm.patchValue({
          produitName: this.produitName,
          // produitTypeSortieList: 0,
        })

      },
      error: (err) => {

        if (err.status === 401 || err.status === 403) {
          this.authService.logout();
          this.snackBar.open('Déconnexion réussie.', '×', {
            panelClass: 'success',
            verticalPosition: 'top',
            duration: 3000,
          });
            localStorage.removeItem('token');
          window.location.href = '/sign-in';
        }
      }
    })


    this.type = this.data.type;

    this.form = this.fb.group({
      id: 0,
      name: [null, Validators.required],
      hasSubCategory: false,
      parentId: 0
    });

    this.sourceList = this.data.sourceList
    let existingRayonIds = []

    existingRayonIds = this.sourceList.map((product: any) => product.rayonId);

    console.log("this.sourceList")
    console.log(this.sourceList)
    this.enRayonList = this.data.enRayonList.map((item: any) => ({
      ...item,
      quantiteRestante: 0,
      quantiteOld: Number(existingRayonIds.includes(item.rayonId) ? this.sourceList.find((data: any) => item.rayonId == data.rayonId).quantite : 0),
      quantiteStock: item.quantiteRestante,
      prixVente: item.prixVente,
      disabled: existingRayonIds.includes(item.rayonId) // Mark as disabled if rayonId exists
    }));

    this.enRayonList.forEach((item: any) => {
      item.quantiteRestante = (Number(item.quantiteOld) > 0) ? Number(item.quantiteOld) : 0
    })

    console.log("this.enRayonList")
    console.log(this.enRayonList)
  }

  public onSubmit() {
    console.log(this.form.value);
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }

  saveChanges(item: any): void {
    const updatedItem = {
      id: item.id,
      quantiteRestante: item.quantiteRestante,
      prixVente: item.prixVente
    };
    // this.enRayonService.updateEnRayon(updatedItem).subscribe(() => {
    //   alert('Modifications sauvegardées avec succès.');
    // });
  }

  resetValues(item: any): void {
    item.quantiteRestante = 0; // Reset quantity to modify
    item.prixVente = item.prixVente; // Reset to default price if needed
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
    this.dialogRef.close(this.modifiedProducts);
  }

  increment(item: any, field: 'quantiteRestante' | 'prixVente') {
    item[field]++;
    this.modifiedProducts = this.enRayonList.filter(item => item.quantiteRestante > 0);
  }

  decrement(item: any, field: 'quantiteRestante' | 'prixVente') {
    if (item[field] > 0) {
      item[field]--;
    }
    this.modifiedProducts = this.enRayonList.filter(item => item.quantiteRestante > 0);
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

  augmenterDetail() {
    const dialogRef = this.dialog.open(UpdateProduitDetailDialogComponent, {
      data: {
        id: this.data.id
      },
      maxWidth: "400px",
      // width: "80%",
      panelClass: ['theme-dialog'],
      autoFocus: false,
      direction: (this.settings.rtl) ? 'rtl' : 'ltr'
    });
    dialogRef.afterClosed().subscribe((modifiedProducts: any[]) => {

    });
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

  executerSortie() {
    let dataSave = this.modifiedProducts.map((product: any) => ({
      contenuDetail: null,
      id: product.id ?? 0,
      quantite: product.quantiteRestante ?? 0,
      rayonId: product.rayonId ?? 0,
      stockTotal: product.stockTotal ?? 0
    }))
    let sortie = {
      enrayon: dataSave,
      produitDetailId: "null",
      typeSortieId: this.sortieForm.get("produitTypeSortieList").value
    }
    if (this.sortieForm.valid) {
      const produitId = this.data.id
      console.log("this.sortieForm.value");
      console.log(this.sortieForm.value);

      this.sortiesService.addProduitDetail(sortie).subscribe({
        next: (response: any) => {
          this.dialogRef.close(response);

        },
        error: (err: any) => {

          if (err.status === 401 || err.status === 403) {
            this.authService.logout();
            localStorage.removeItem('token');
            localStorage.setItem("lastLink",window.location.href);;
            this.snackBar.open('Déconnexion réussie.', '×', {
              panelClass: 'success',
              verticalPosition: 'top',
              duration: 3000,
            });
            // Redirect to login page or clear session
            window.location.href = '/sign-in';
          }
          console.error('Failed to load products:', err);
        }
      });
    }

  }

  getTypeSortiePageable(name: string) {

    this.typeSortiesService.getTypeSortiePageable(0, 10, "id", "desc", name).subscribe({
      next: (response: any) => {
        this.typeSorties = response.content.filter((item: any) => item.id == 3)

      },
      error: (err: any) => {

        if (err.status === 401 || err.status === 403) {
          this.authService.logout();
          localStorage.removeItem('token');
          localStorage.setItem("lastLink", window.location.href);
          this.snackBar.open('Déconnexion réussie.', '×', {
            panelClass: 'success',
            verticalPosition: 'top',
            duration: 3000,
          });
            localStorage.removeItem('token');
          window.location.href = '/sign-in';
        }
        console.error('Failed to load products:', err);
      }
    });
  }
}
