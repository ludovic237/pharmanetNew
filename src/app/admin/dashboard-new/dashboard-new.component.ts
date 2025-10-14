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
import { CommonModule, formatDate, isPlatformBrowser, NgStyle } from '@angular/common';
import {ChartData, ChartOptions} from "chart.js";
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
import {OptimizeDashboardComponent} from "../components/optimize-dashboard/optimize-dashboard.component";
import {ForecastChartComponent} from "../components/forecast-chart/forecast-chart.component";
import {LowStockTableComponent} from "../components/low-stock-table/low-stock-table.component";
import {ReplenishmentComponent} from "../components/replenishment/replenishment.component";
import {AssociatedProductsComponent} from "../components/associated-products/associated-products.component";
import {CategoriePieComponent} from "../components/categorie-pie/categorie-pie.component";
import {WeeklySeasonalityComponent} from "../components/weekly-seasonality/weekly-seasonality.component";
import {DailySalesComponent} from "../components/daily-sales/daily-sales.component";
import {TopProductsComponent} from "../components/top-products/top-products.component";
import {LowStockComponent} from "../components/low-stock/low-stock.component";
import {ReplenishmentTableComponent} from "../components/replenishment-table/replenishment-table.component";
import {AiService} from "@services/ai.service";
import {InsightService} from "@services/insight.service";
import {MonthlySalesComponent} from "../components/monthly-sales/monthly-sales.component";
import {AppService} from "@services/app.service";
import {NgScrollbarModule} from "ngx-scrollbar";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {RouterModule} from "@angular/router";

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

export class StockStatus {
  label: string;
  class: string
};

@Component({
  selector: 'app-dashboard-new',
  imports: [
    OptimizeDashboardComponent,
    LowStockTableComponent,
    ReplenishmentComponent,
    ForecastChartComponent,
    AssociatedProductsComponent,
    CategoriePieComponent,
    WeeklySeasonalityComponent,
    DailySalesComponent,
    AssociatedProductsComponent,
    TopProductsComponent,
    LowStockComponent,
    MonthlySalesComponent,
    ReplenishmentTableComponent,
    ReactiveFormsModule,
    // Material
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatDatepickerModule, MatNativeDateModule,
    MatButtonModule, MatGridListModule, MatTableModule,
    MatIconModule, MatTooltipModule,
    NgStyle,
    CommonModule,
    RouterModule,
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
    MatProgressSpinnerModule
  ],
  host: {
    'ngSkipHydration': ''
  },
  templateUrl: './dashboard-new.component.html',
  styleUrls: ['./dashboard-new.component.scss']
})
export class DashboardNewComponent implements OnInit, OnDestroy {


  displayedColumnsRupture: string[] = ['id', 'nom', 'stock', 'statut'];
  reorderDataRupture: any[] = [];

  tempsReelDataVente: any[] = [];


  selectedTabIndex: number = 0;

  updatedAt = '';
  kpis: any[] = [];
  monthly?: any = {
    labels: [],
    datasets: []
  };

  dataBestSeller?: any[] = [];

  weekly?: any[] = [];
  categories: any[] = [];
  assoc: any[] = [];
  repl: any[] = [];
  low: any[] = [];
  top: any[] = [];
  top7: any[] = [];

  topToday: any[] = [];
  totalTodayVente = 0;
  totalTodayVentePrice = 0;

  stockActuel: any[] = [];
  totalStockActuel = 0;
  totalStockActuelPrice = 0;

  stockCritique: any[] = [];

  stockPerime: any[] = [];
  totalStockPerime = 0;
  totalStockPerimePrice = 0;

  daily?: any[] = [];

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
    public appService: AppService,
    private fb: FormBuilder,
    private api: DashboardService,
    public snackBar: MatSnackBar,
    private ai: AiService, private ins: InsightService,
    @Inject(PLATFORM_ID) platformId: Object) {
    // this.isPlatformBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {

    // déclenche un premier refresh
    this.fetchVentesPageable();

    // charger les tables statiques

    this.loadAll()

    this.api.stockActual().subscribe({
      next: (r: any[]) => {
        this.stockActuel = r
        this.totalStockActuel = this.stockActuel[0].qty
        this.totalStockActuelPrice = this.stockActuel[0].total
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

    this.api.stockPerime().subscribe({
      next: (r: any[]) => {
        this.stockPerime = r
        this.totalStockPerime = this.stockPerime[0].qty
        this.totalStockPerimePrice = this.stockPerime[0].total
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

    this.api.ordersRecent(0, 8).subscribe({
      next: (r: any[]) => {
        this.ordersRecent = r
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

    this.api.stockAlerts(10, 30, 10).subscribe({
      next: (r: any[]) => {
        this.stockAlerts = r;

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

    // Rafraîchir tout à chaque changement de période


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
      this.api.kpis(
        formatDate(new Date(new Date(this.startDateVente).setHours(0, 0, 0, 0)) + ""),
        formatDate(new Date(new Date(this.endDateVente).setHours(23, 59, 59, 999)) + "")),
      this.api.salesMonthly(formatDate(new Date(new Date(this.startDateVente).setHours(0, 0, 0, 0)) + ""), formatDate(new Date(new Date(this.endDateVente).setHours(23, 59, 59, 999)) + "")),
      this.api.salesByCategory(formatDate(new Date(new Date(this.startDateVente).setHours(0, 0, 0, 0)) + ""), formatDate(new Date(new Date(this.endDateVente).setHours(23, 59, 59, 999)) + "")),
      this.api.topProducts(10, formatDate(new Date(new Date(this.startDateVente).setHours(0, 0, 0, 0)) + ""), formatDate(new Date(new Date(this.endDateVente).setHours(23, 59, 59, 999)) + "")),
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

    this.ai.optimizeBestSellRange(
      10,
      0,
      this.appService.formatDate(new Date(new Date(this.startDateVente).setHours(0, 0, 0, 0)) + ""),
      this.appService.formatDate(new Date(new Date(this.endDateVente).setHours(23, 59, 59, 999)) + ""),
      20,
      100
    ).subscribe({
      next: res => {
        this.dataBestSeller = res;
      },
      error: () => {
      },
      // complete: () => this.loading = false
    });

    this.ai.topProducts(20,
      this.appService.formatDate(new Date(new Date(this.startDateVente).setHours(0, 0, 0, 0)) + ""),
      this.appService.formatDate(new Date(new Date(this.endDateVente).setHours(23, 59, 59, 999)) + "")
    )
      .subscribe(v => this.top = v);

    this.api.stockCritique(5, 20).subscribe({
      next: (r: any[]) => {
        this.stockCritique = r
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

    this.ins.weeklySeasonalityRange(
      this.appService.formatDate(new Date(new Date(this.startDateVente).setHours(0, 0, 0, 0)) + ""),
      this.appService.formatDate(new Date(new Date(this.endDateVente).setHours(23, 59, 59, 999)) + ""),
    ).subscribe(
      {
        next: (data: any[]) => {
          this.weekly = data
          const barChartWeeklySeasonality = {
            labels: data.map(m => m.label),
            datasets: [{data: data.map(m => m.total), label: 'Ventes'}]
          }
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

  loadAll() {
    this.updatedAt = new Date().toLocaleTimeString();
    this.ins.kpis().subscribe(v => this.kpis = v);
    // this.ins.monthlySales().subscribe(
    //   {
    //     next: (data: any[]) => {
    //       this.monthly = {
    //         labels: data.map(m => m.mois),
    //         datasets: [{data: data.map(m => m.total), label: 'Ventes'}]
    //       }
    //     },
    //     error: (err) => {
    //       if (err.status === 401 || err.status === 403) {
    //
    //         this.authService.logout().subscribe({
    //           next: (data) => {
    //
    //             localStorage.removeItem('token');
    //             localStorage.setItem("lastLink", window.location.href);
    //             window.location.href = '/sign-in';
    //             this.snackBar.open('Déconnexion réussie.', '×', {
    //               panelClass: 'success',
    //               verticalPosition: 'top',
    //               duration: 3000,
    //             });
    //           },
    //           error: (err) => {
    //             if (err.status === 401 || err.status === 403) {
    //               this.authService.logout();
    //               localStorage.removeItem('token');
    //               localStorage.setItem("lastLink", window.location.href);
    //               ;
    //               this.snackBar.open('Déconnexion, une erreur.', '×', {
    //                 panelClass: 'success',
    //                 verticalPosition: 'top',
    //                 duration: 3000,
    //               });
    //               window.location.href = '/sign-in';
    //             }
    //           }
    //         })
    //       }
    //     }
    //   });
    this.ins.weeklySeasonalityRange(
      this.appService.formatDate(new Date(new Date(this.startDateVente).setHours(0, 0, 0, 0)) + ""),
      this.appService.formatDate(new Date(new Date(this.endDateVente).setHours(23, 59, 59, 999)) + ""),
    ).subscribe(
      {
        next: (data: any[]) => {
          this.weekly = data
          const barChartWeeklySeasonality = {
            labels: data.map(m => m.label),
            datasets: [{data: data.map(m => m.total), label: 'Ventes'}]
          }
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

    this.ins.salesByCategory(160,
      this.appService.formatDate(new Date(new Date(this.startDateVente).setHours(0, 0, 0, 0)) + ""),
      this.appService.formatDate(new Date(new Date(this.endDateVente).setHours(23, 59, 59, 999)) + ""),
    ).subscribe(
      {
        next: (data: any[]) => {
          this.categories = data
          // this.categories = {
          //   labels: data.map(m => m.categorie),
          //   datasets: [{data: data.map(m => m.ca), label: 'Ventes'}]
          // }
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
    // this.ins.dailySales().subscribe(
    //   {
    //     next: (data: any[]) => {
    //       this.daily = data
    //       // this.categories = {
    //       //   labels: data.map(m => m.categorie),
    //       //   datasets: [{data: data.map(m => m.ca), label: 'Ventes'}]
    //       // }
    //     },
    //     error: (err) => {
    //       if (err.status === 401 || err.status === 403) {
    //
    //         this.authService.logout().subscribe({
    //           next: (data) => {
    //
    //             localStorage.removeItem('token');
    //             localStorage.setItem("lastLink", window.location.href);
    //             window.location.href = '/sign-in';
    //             this.snackBar.open('Déconnexion réussie.', '×', {
    //               panelClass: 'success',
    //               verticalPosition: 'top',
    //               duration: 3000,
    //             });
    //           },
    //           error: (err) => {
    //             if (err.status === 401 || err.status === 403) {
    //               this.authService.logout();
    //               localStorage.removeItem('token');
    //               localStorage.setItem("lastLink", window.location.href);
    //               ;
    //               this.snackBar.open('Déconnexion, une erreur.', '×', {
    //                 panelClass: 'success',
    //                 verticalPosition: 'top',
    //                 duration: 3000,
    //               });
    //               window.location.href = '/sign-in';
    //             }
    //           }
    //         })
    //       }
    //     }
    //   });
    // this.ai.associations(10).subscribe(v => this.assoc = v);
    // this.ai.suggestReplenishment().subscribe(v => this.repl = v);
    /* this.ai.lowStock().subscribe(
       {
         next: (data: any[]) => {
           this.low = data
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
       });*/

    const today = new Date();
    today.setHours(23, 59, 59, 999)
    const lastWeek = new Date();
    lastWeek.setDate(today.getDate() - 7)
    lastWeek.setHours(0, 0, 0, 0)

    this.ai.topProducts(20,
      this.appService.formatDate(lastWeek + ""),
      this.appService.formatDate(today + "")
    )

    this.ai.topProducts(10000,
      this.appService.formatDate(new Date(new Date().setHours(0, 0, 0, 0)) + ""),
      this.appService.formatDate(today + "")
    ).subscribe(
      {
        next: (v: any[]) => {
          this.topToday = v;
          this.totalTodayVentePrice = this.topToday.reduce((sum, item) => sum + (item.total), 0);
          this.totalTodayVente = this.topToday.reduce((sum, item) => sum + (item.qte), 0);
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

   /* this.ai.optimizeDashboardNew().subscribe(
      {
        next: (data: any) => {

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
      });*/
  }

  protected readonly Plugin = Plugin;

  pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right'
      }
    }
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
}

