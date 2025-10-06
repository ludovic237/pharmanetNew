import {Component, Inject, OnInit, PLATFORM_ID, ViewChild} from '@angular/core';
import {StockStatus} from "../../dashboard-new/dashboard-new.component";
import {LoaderService} from "@services/loader.service";
import {AuthService} from "@services/auth.service";
import {AppService} from "@services/app.service";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {DashboardService} from "@services/dashboard.service";
import {MatSnackBar, MatSnackBarModule} from "@angular/material/snack-bar";
import {AiService} from "@services/ai.service";
import {InsightService} from "@services/insight.service";
import {MatPaginator, MatPaginatorModule, PageEvent} from "@angular/material/paginator";
import {MatCardModule} from "@angular/material/card";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatNativeDateModule} from "@angular/material/core";
import {MatButtonModule} from "@angular/material/button";
import {MatGridListModule} from "@angular/material/grid-list";
import {MatTableModule} from "@angular/material/table";
import {MatIconModule} from "@angular/material/icon";
import {MatTooltipModule} from "@angular/material/tooltip";
import {NgChartsModule} from "ng2-charts";
import {NgxChartsModule} from "@swimlane/ngx-charts";
import {MatMenuModule} from "@angular/material/menu";
import {MatListModule} from "@angular/material/list";
import {MatChipsModule} from "@angular/material/chips";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatDividerModule} from "@angular/material/divider";
import {MatExpansionModule} from "@angular/material/expansion";
import {CommonModule} from "@angular/common";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatTabsModule} from "@angular/material/tabs";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {MatSelectModule} from "@angular/material/select";
import {FlexLayoutModule} from "@ngbracket/ngx-layout";
import {MatStepperModule} from "@angular/material/stepper";
import {MatRadioModule} from "@angular/material/radio";
import {NgxPaginationModule} from "ngx-pagination";
import {NgScrollbarModule} from "ngx-scrollbar";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {EnrayonsService} from "@services/enrayons.service";
import {MatSort} from "@angular/material/sort";
import {SelectionModel} from "@angular/cdk/collections";
import {MatBadgeModule} from "@angular/material/badge";

@Component({
  selector: 'app-rupture',
  imports: [
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatDatepickerModule, MatNativeDateModule,
    MatButtonModule, MatGridListModule, MatTableModule,
    MatIconModule, MatTooltipModule,

    // Charts
    NgChartsModule,
    NgxChartsModule,
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
    NgScrollbarModule,
    MatProgressSpinnerModule,
    MatBadgeModule
  ],
  templateUrl: './rupture.component.html',
  styleUrl: './rupture.component.scss'
})
export class RuptureComponent implements OnInit {

  stockCritique: any[] = [];

  selectedIds: any[] = [];
  nomProduit: string | null = null;

  public total: number = 1; // Default to 0 if undefined
  public quantite: number = 1; // Default to 0 if undefined
  public page: number = 1; // Default to 0 if undefined
  public size = 100;  // Default to 10 if undefined
  public totalItems = 0;  // Default to 10 if undefined
  public count = 10;

  public countItemSelect = 0;
  public countItemProduitCommandeSelect = 0;
  public countItemProduitAiSelect = 0;
  displayedColumnsRupture: string[] = ['select', 'id', 'nom', 'stock', 'statut', 'action'];

  selection = new SelectionModel<any>(true, [])
  globalSelection: Set<any> = new Set<any>();
  produitsCommandes: Set<any> = new Set<any>();
  produitsIA: Set<any> = new Set<any>();

  @ViewChild(MatPaginator) paginator!: MatPaginator
  @ViewChild(MatSort) sort!: MatSort

  public form: FormGroup;

  constructor(
    public loaderService: LoaderService,
    public authService: AuthService,
    public appService: AppService,
    public enrayonsService: EnrayonsService,
    private fb: FormBuilder,
    private api: DashboardService,
    public snackBar: MatSnackBar,
    public formBuilder: FormBuilder,
    private ai: AiService, private ins: InsightService,
    @Inject(PLATFORM_ID) platformId: Object) {
    // this.isPlatformBrowser = isPlatformBrowser(platformId);
    this.form = this.formBuilder.group({
      nomProduit: [null],
    })
  }

  ngOnInit(): void {
    this.getStockCritique();
    this.form.get('nomProduit').valueChanges.subscribe(nomProduit => {
      this.nomProduit = nomProduit
      this.page = 1
      this.getStockCritique();
    });
  }

  getStockCritique() {
    this.api.stockCritiquePageable(5,
      this.count - 0,
      this.page - 1,
      this.nomProduit
    ).subscribe({
      next: (data: any) => {
        this.count = data.pageSize;
        this.totalItems = data.totalElements;
        this.stockCritique = data.content;
        this.selectedIds = data.content.filter((p: any) => p.selected).map((p: any) => p.id)
        this.total = data.totalPages;
        this.page = data.pageNumber;
        this.quantite = 0;
        this.restoreSelection();
      },
      error: (err) => {
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

  getStockStatus(row: any): StockStatus {
    const stock = Number(row?.stock ?? 0);
    const min = row?.min != null ? Number(row.min) : null;
    const max = row?.max != null ? Number(row.max) : null;

    // Cas 1 : on a min & max -> règles basées sur min/max
    if (Number.isFinite(min as number) && Number.isFinite(max as number) && (max as number) > 0) {
      const minVal = min as number;
      const maxVal = max as number;
      const mid = minVal + (maxVal - minVal) * 0.5; // milieu de la plage

      if (stock == 0) return {label: 'Rupture', class: 'status-rupture'};
      if (stock <= 0) return {label: 'Rupture', class: 'status-rupture'};
      if (stock <= minVal) return {label: 'Critique', class: 'status-critique'};
      if (stock <= mid) return {label: 'Bas', class: 'status-bas'};
      if (stock <= maxVal) return {label: 'OK', class: 'status-ok'};
      return {label: 'Surstock', class: 'status-surstock'};
    }

    // Cas 2 : fallback (si min/max indisponibles) -> seuils génériques
    if (stock <= 0) return {label: 'Rupture', class: 'status-rupture'};
    if (stock <= 5) return {label: 'Critique', class: 'status-critique'};
    if (stock <= 20) return {label: 'Bas', class: 'status-bas'};
    if (stock <= 100) return {label: 'OK', class: 'status-ok'};
    return {label: 'Surstock', class: 'status-surstock'};
  }

  public onPageChanged(event: PageEvent) {
    this.page = event.pageIndex + 1;
    this.count = event.pageSize
    this.getStockCritique();
  }

  resetFilters(): void {
    this.enrayonsService.resetNegativeStock()
  }

  resetSelected(): void {
    this.selectedIds = Array.from(this.globalSelection).map((p: any) => p.id)
    this.enrayonsService.resetNegativeStock(this.selectedIds, false, false).subscribe({
      next: (data: any) => {
        this.page = 1;
        this.globalSelection.clear();
        this.getStockCritique();
        this.snackBar.open('Tous les produits selectionnees ont ete reset avec succes.', '×', {
          panelClass: 'success',
          verticalPosition: 'top',
          duration: 3000,
        });
      },
      error: (err) => {
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

  resetQuantite(row: any): void {
    this.enrayonsService.resetNegativeStock([row.id], false, false).subscribe({
      next: (data: any) => {
        this.page = 1;
        this.getStockCritique();
        this.snackBar.open('Tous les produits selectionnees ont ete reset avec succes.', '×', {
          panelClass: 'success',
          verticalPosition: 'top',
          duration: 3000,
        });
      },
      error: (err) => {
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

  resetAll(): void {
    this.enrayonsService.resetNegativeStock([], true, false).subscribe({
      next: (data: any) => {
        this.page = 1;
        this.getStockCritique();
        this.snackBar.open('Tous les produits ont ete reset avec succes.', '×', {
          panelClass: 'success',
          verticalPosition: 'top',
          duration: 3000,
        });
      },
      error: (err) => {
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

  resetNegative(): void {
    this.enrayonsService.resetNegativeStock([], false, true).subscribe({
      next: (data: any) => {
        this.page = 1;
        this.getStockCritique();
        this.snackBar.open('Tous les produits negatifs ont ete reset avec succes.', '×', {
          panelClass: 'success',
          verticalPosition: 'top',
          duration: 3000,
        });
      },
      error: (err) => {
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

  toggleAll(selectAll: boolean) {
    this.stockCritique.forEach(p => p.selected = selectAll)
  }

  restoreSelection() {
    this.selection.clear();
    this.stockCritique.forEach(row => {
      if (this.globalSelection.has(row)) {
        this.selection.select(row)
      }
      if (this.produitsCommandes.has(row)) {
        this.selection.select(row)
      }
      if (this.produitsIA.has(row)) {
        this.selection.select(row)
      }
    })
  }

  toggleSelection(row: any) {
    if (this.globalSelection.has(row)) {
      this.globalSelection.delete(row);
      // this.selection.deselect(row)
    } else {
      this.globalSelection.add(row);
      // this.selection.select(row)
    }
    this.countItemSelect = this.globalSelection.size;
  }

  changeSelectionProduitsCommande(row: any) {
    if (this.produitsCommandes.has(row)) {
      this.produitsCommandes.delete(row);
    } else {
      this.produitsCommandes.add(row);
    }
    this.countItemProduitCommandeSelect = this.produitsCommandes.size;
  }

  changeSelectionProduitsAI(row: any) {
    if (this.produitsIA.has(row)) {
      this.produitsIA.delete(row);
    } else {
      this.produitsIA.add(row);
    }
    this.countItemProduitAiSelect = this.produitsIA.size;
  }

  isSelected(row: any) {
    return this.globalSelection.has(row)
  }

  isProduitsCommandesSelected(row: any) {
    return this.produitsCommandes.has(row)
  }

  isProduitsAISelected(row: any) {
    return this.produitsIA.has(row)
  }

  hasSelection(): boolean {
    // return this.selectedIds.length > 0;
    this.countItemSelect = this.globalSelection.size;
    return this.globalSelection.size > 0;
  }

  resetStockSelection() {
    const produitIds = Array.from(this.globalSelection);
  }

  commanderProduit(produit: any) {
    if (this.produitsCommandes.has(produit)) return;
    this.produitsCommandes.add(produit)
  }

  proposerAI(produit: any) {
    if (this.produitsIA.has(produit)) return;
    this.produitsIA.add(produit)
  }

  estCommande(produit:any): boolean {
    return this.produitsCommandes.has(produit);
  }

  estAI(produit:any): boolean {
    return this.produitsIA.has(produit)
  }
}
