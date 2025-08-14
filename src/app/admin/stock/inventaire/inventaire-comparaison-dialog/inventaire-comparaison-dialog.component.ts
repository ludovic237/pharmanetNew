import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef} from "@angular/material/dialog";
import {FormBuilder, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CategorieService} from "@services/categories.service";
import {EtageresService} from "@services/etageres.service";
import {MagasinService} from "@services/magasins.service";
import {RayonService} from "@services/rayons.service";
import {FabriquantService} from "@services/fabriquants.service";
import {FormeService} from "@services/formes.service";
import {ProductService} from "@services/products.service";
import {MatSnackBar, MatSnackBarModule} from "@angular/material/snack-bar";
import {InventaireService} from "@services/inventaire.service";
import {MatTabChangeEvent, MatTabsModule} from "@angular/material/tabs";
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatMenuModule} from "@angular/material/menu";
import {MatListModule} from "@angular/material/list";
import {MatChipsModule} from "@angular/material/chips";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatDividerModule} from "@angular/material/divider";
import {MatExpansionModule} from "@angular/material/expansion";
import {CommonModule} from "@angular/common";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatIconModule} from "@angular/material/icon";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {MatTableModule} from "@angular/material/table";
import {MatCardModule} from "@angular/material/card";
import {MatButtonModule} from "@angular/material/button";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatNativeDateModule} from "@angular/material/core";
import {MatSelectModule} from "@angular/material/select";
import {FlexLayoutModule} from "@ngbracket/ngx-layout";
import {MatStepperModule} from "@angular/material/stepper";
import {MatRadioModule} from "@angular/material/radio";
import {NgxPaginationModule} from "ngx-pagination";
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {AuthService} from "@services/auth.service";

@Component({
  selector: 'app-inventaire-comparaison-dialog',
  imports: [
    MatTooltipModule,
    MatDialogModule,
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
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    // Material
    MatStepperModule,
    MatRadioModule,
    MatIconModule,
    MatCardModule,
    MatSnackBarModule,
    MatChipsModule,
    NgxPaginationModule,
    MatPaginator,
  ],
  templateUrl: './inventaire-comparaison-dialog.component.html',
  styleUrl: './inventaire-comparaison-dialog.component.scss'
})
export class InventaireComparaisonDialogComponent implements OnInit {

  public page: number = 1; // Default to 0 if undefined
  public size = 100;  // Default to 10 if undefined
  public totalItems = 0;  // Default to 10 if undefined
  public count = 10;
  public filtre: string = "null";

  filteredProducts: any[] = [];

   constructor(
    public authService: AuthService,
    private dialogRef: MatDialogRef<InventaireComparaisonDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    public categorieService: CategorieService,
    public etageresService: EtageresService,
    public magasinService: MagasinService,
    public rayonService: RayonService,
    public fabriquantService: FabriquantService,
    public formeService: FormeService,
    private productService: ProductService,
    public snackBar: MatSnackBar,
    private inventaireService: InventaireService,
    public dialog: MatDialog) {

    if (this.data.id) {

    }
  }

  displayedColumns: string[] = ['product', 'system', 'physical', 'difference', 'status'];
  dataSource: any[] = [];

  ngOnInit() {
    this.fetchComparaisonData();
  }

  onTabChange(event: MatTabChangeEvent): void {
    const activeTabLabel = event.tab.textLabel;
    console.log('Active Tab:', activeTabLabel);
    // You can perform additional actions based on the active tab
    if (activeTabLabel === 'Écarts uniquement') {
      // Logic for when the Comparaison tab is active
      this.filtre = "equal"
      this.fetchComparaisonData();
    } else if (activeTabLabel === 'Tous') {
      // Logic for when the Comparaison tab is active
      this.filtre = "null"
      this.fetchComparaisonData();
    } else if (activeTabLabel === 'Manquants') {
      // Logic for when the Comparaison tab is active
      this.filtre = "less"
      this.fetchComparaisonData();
    } else if (activeTabLabel === 'Excédents') {
      // Logic for when the Comparaison tab is active
      this.filtre = "greater"
      this.fetchComparaisonData();
    } else {
      this.filtre = "null"
      this.fetchComparaisonData();
    }
  }

  fetchComparaisonData(): void {
    this.inventaireService.listerProduitsParInventaireAvecFiltre(this.data.id, this.filtre, this.page - 1,
      this.count,).subscribe({
      next: (data: any) => {
        this.dataSource = data.content.map((item: any) => ({
          product: item.nom,
          code: item.rayonId,
          system: item.quantiteSysteme,
          physical: item.quantiteReelle,
          difference: item.quantiteReelle - item.quantiteSysteme,
          status: this.getStatus(item.quantiteReelle - item.quantiteSysteme) || 'unknown', // Default to 'unknown' if status is not provided
        }));
        this.count = data.pageable.pageSize;
        this.totalItems = data.totalElements;

      },
      error: (err: any) => {
        console.error('Failed to fetch products in stock:', err);
        if (err.status === 401 || err.status === 403){
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
        else
        alert('Une erreur est survenue lors de la récupération des produits en rayon.');
      },
    });
  }

  getStatus(difference: number): { icon: string; color: string } {
    if (difference > 0) {
      return {icon: 'check', color: 'green'}; // Positive difference
    } else if (difference < 0) {
      return {icon: 'close', color: 'red'}; // Negative difference
    } else {
      return {icon: 'done', color: 'gray'}; // Zero difference
    }
  }

  onPageChanged(event: PageEvent): void {
    this.page = event.pageIndex + 1;
    this.count = event.pageSize
    this.fetchComparaisonData();
  }

  onCancel(){
    this.dialogRef.close()
  }

  EffectuerValidation(): void {
    this.dialogRef.close({
      type: "valider",
    })
  }
}
