import {Component, Inject, OnDestroy, OnInit, PLATFORM_ID} from '@angular/core';

import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {
  KpiDto, SalesMonthlyPoint, CategorySales, TopProduct,
  OrderRow, StockAlertRow
} from './../../model/data';
import {BehaviorSubject, Subject, combineLatest, switchMap, takeUntil} from 'rxjs';
import {DashboardService} from "@services/dashboard.service";
import {MatCardModule} from "@angular/material/card";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatButtonModule} from "@angular/material/button";
import {MatGridListModule} from "@angular/material/grid-list";
import {MatIconModule} from "@angular/material/icon";
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatTableModule} from "@angular/material/table";
import {MatNativeDateModule} from "@angular/material/core";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {NgxChartsModule} from "@swimlane/ngx-charts";
import {NgChartsModule} from "ng2-charts";
import {CommonModule, isPlatformBrowser} from '@angular/common';
import {ChartData} from "chart.js";
import {MatPaginatorModule} from "@angular/material/paginator";
import {MatMenuModule} from "@angular/material/menu";
import {MatListModule} from "@angular/material/list";
import {MatChipsModule} from "@angular/material/chips";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatDividerModule} from "@angular/material/divider";
import {MatExpansionModule} from "@angular/material/expansion";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatTabsModule} from "@angular/material/tabs";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {MatSelectModule} from "@angular/material/select";
import {FlexLayoutModule} from "@ngbracket/ngx-layout";
import {MatStepperModule} from "@angular/material/stepper";
import {MatRadioModule} from "@angular/material/radio";
import {MatSnackBar, MatSnackBarModule} from "@angular/material/snack-bar";
import {NgxPaginationModule} from "ngx-pagination";
import {AuthService} from "@services/auth.service";
import {LoaderService} from "@services/loader.service";

function toIso(dt: Date, endOfDay = false): string {
  if (!dt) return '';
  const d = new Date(dt);
  if (endOfDay) {
    d.setHours(23, 59, 59, 999);
  } else {
    d.setHours(0, 0, 0, 0);
  }
  // Format ISO local without timezone shift expected by backend DateTime ISO
  return d.toISOString().slice(0, 19);
}

@Component({
  selector: 'app-dashboard-new',
  imports: [
    ReactiveFormsModule,
    // Material
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
  ],
  host: {
    'ngSkipHydration': ''
  },
  templateUrl: './dashboard-new.component.html',
  styleUrls: ['./dashboard-new.component.scss']
})
export class DashboardNewComponent implements OnInit, OnDestroy {

  range!: FormGroup;
  refresh$ = new BehaviorSubject<void>(undefined);
  destroy$ = new Subject<void>();

  startDateVente: Date | null = new Date();
  endDateVente: Date | null = new Date();

  // Data
  kpi?: KpiDto;
  salesMonthly: SalesMonthlyPoint[] = [];
  salesByCategory: CategorySales[] = [];
  topProducts: TopProduct[] = [];
  ordersRecent: OrderRow[] = [];
  stockAlerts: StockAlertRow[] = [];

  // tables
  displayedColumnsOrders = ['id', 'ref', 'fournisseur', 'montantCmd', 'etat', 'dateCreation', 'actions'];
  displayedColumnsStock = ['produit', 'quantiteRestante', 'datePeremption'];

  public lineChartData: ChartData<'line'> = {labels: [], datasets: []};
  public pieChartData: ChartData<'pie'> = {labels: [], datasets: []};

  // charts (ng2-charts)
  salesMonthlyLabels: string[] = [];
  salesMonthlyRaw: { data: number[]; label: string }[] = [];
  catLabels: string[] = [];
  catRaw: { data: number[]; label: string }[] = [];

  public barChartData: ChartData<'bar'> = {labels: [], datasets: []};


  isPlatformBrowser: boolean;

  constructor(
    public loaderService: LoaderService,
    public authService: AuthService,
    private fb: FormBuilder,
    private api: DashboardService,
    public snackBar: MatSnackBar,
    @Inject(PLATFORM_ID) platformId: Object) {
    // this.isPlatformBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    // charger les tables statiques

    this.api.ordersRecent(0, 8).subscribe({
      next: (r: any[]) => {
        this.ordersRecent = r

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

    this.api.stockAlerts(10, 30, 10).subscribe({
      next: (r: any[]) => {
        this.stockAlerts = r;

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

    // Rafraîchir tout à chaque changement de période

    // déclenche un premier refresh
    this.fetchVentesPageable();
  }

  refresh(): void {
    this.refresh$.next();
  }

  formatMoney(n?: number | null): string {
    if (n == null) return '—';
    return new Intl.NumberFormat('fr-FR', {style: 'currency', currency: 'XAF'}).format(n);
  }

  ngOnDestroy(): void {
    // this.destroy$.next(); this.destroy$.complete();
  }

  fetchVentesPageable() {
    const formatDate = (date: string | null): string | null => {
      if (!date) return null;
      const parsedDate = new Date(date);
      return `${parsedDate.getFullYear()}-${String(parsedDate.getMonth() + 1).padStart(2, '0')}-${String(parsedDate.getDate()).padStart(2, '0')}T${String(parsedDate.getHours()).padStart(2, '0')}:${String(parsedDate.getMinutes()).padStart(2, '0')}:${String(parsedDate.getSeconds()).padStart(2, '0')}`;
    };
    // Rafraîchir tout à chaque changement de période

    combineLatest([
      this.api.kpis(formatDate(this.startDateVente + ""), formatDate(this.endDateVente + "")),
      this.api.salesMonthly(formatDate(this.startDateVente + ""), formatDate(this.endDateVente + "")),
      this.api.salesByCategory(formatDate(this.startDateVente + ""), formatDate(this.endDateVente + "")),
      this.api.topProducts(10, formatDate(this.startDateVente + ""), formatDate(this.endDateVente + "")),
    ]).subscribe({
      next: ([kpi, monthly, byCat, top]) => {
        this.kpi = kpi;

        this.salesMonthly = monthly;
        this.salesMonthlyLabels = monthly.map(m => m.mois);
        // this.salesMonthlyData = [{ data: monthly.map(m => m.total), label: 'Ventes' }];

        this.salesByCategory = byCat;
        // this.catLabels = byCat.map(x => x.categorie);
        // this.catData = [{ data: byCat.map(x => x.total), label: 'Répartition' }];

        this.catLabels = byCat.map(c => c.categorie);
        this.catRaw = [{data: byCat.map(c => c.total), label: 'Répartition'}];

        this.pieChartData = {
          labels: this.catLabels,
          datasets: this.catRaw
        };

        this.salesMonthlyLabels = monthly.map(m => m.mois);
        this.salesMonthlyRaw = [{data: monthly.map(m => m.total), label: 'Ventes'}];

        // compose le ChartData complet
        this.lineChartData = {
          labels: this.salesMonthlyLabels,
          datasets: this.salesMonthlyRaw
        };

        this.topProducts = top;

        // Transforme en ChartData
        this.barChartData = {
          labels: top.map(p => p.nom),
          datasets: [
            {data: top.map(p => p.qty), label: 'Quantité vendue'}
          ]
        };

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
}

