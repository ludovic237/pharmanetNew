import {Component, Input, OnInit} from '@angular/core';
import {OptimizeDashboardResponse} from "../../../model/ai.models";
import {MatTableDataSource, MatTableModule} from "@angular/material/table";
import {AiService} from "@services/ai.service";
import {MatMenuModule} from "@angular/material/menu";
import {MatListModule} from "@angular/material/list";
import {MatChipsModule} from "@angular/material/chips";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatDividerModule} from "@angular/material/divider";
import {MatExpansionModule} from "@angular/material/expansion";
import { CommonModule, DecimalPipe } from "@angular/common";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatTabsModule} from "@angular/material/tabs";
import {MatIconModule} from "@angular/material/icon";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {MatCardModule} from "@angular/material/card";
import {MatButtonModule} from "@angular/material/button";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatNativeDateModule} from "@angular/material/core";
import {MatSelectModule} from "@angular/material/select";
import {FlexLayoutModule} from "@ngbracket/ngx-layout";
import {MatStepperModule} from "@angular/material/stepper";
import {MatRadioModule} from "@angular/material/radio";
import {MatSnackBarModule} from "@angular/material/snack-bar";
import {NgxPaginationModule} from "ngx-pagination";
import {MatPaginator, MatPaginatorModule} from "@angular/material/paginator";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {RouterModule} from "@angular/router";
import {MatSidenavModule} from "@angular/material/sidenav";
import {NgScrollbarModule} from "ngx-scrollbar";
import {MatSliderModule} from "@angular/material/slider";
import {CategoryListComponent} from "@shared-components/category-list/category-list.component";
import {RatingComponent} from "@shared-components/rating/rating.component";
import {ControlsComponent} from "@shared-components/controls/controls.component";
import {PipesModule} from "../../../theme/pipes/pipes.module";
import {AppService} from "@services/app.service";

@Component({
  selector: 'app-optimize-dashboard',
  imports: [
    RouterModule,
    FormsModule,
    FlexLayoutModule,
    MatSidenavModule,
    MatExpansionModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatMenuModule,
    MatChipsModule,
    NgScrollbarModule,
    MatSliderModule,
    MatCardModule,
    NgxPaginationModule,
    DecimalPipe,
    PipesModule,
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
    MatPaginatorModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './optimize-dashboard.component.html',
  styleUrl: './optimize-dashboard.component.scss'
})
export class OptimizeDashboardComponent implements OnInit {
  @Input() dataBestSeller:any[] = [];

  loading = false;
  data: any[] = [];
  // data?: OptimizeDashboardResponse;

  lowStockData = new MatTableDataSource<any>([]);
  reorderData = new MatTableDataSource<any>([]);
  lowColumns = ['produit', 'stock', 'threshold'];
  reorderColumns = ['produit_id', 'current_stock', 'safety_stock', 'reorder_point', 'suggested_order_qty', 'avg_daily'];

  constructor(
    private ai: AiService,
    private appService: AppService,
  ) {
  }

  ngOnInit(): void {

    this.loading = true;
    // this.ai.optimizeDashboard(0, 10, 100).subscribe({
    //   next: res => {
    //     this.reorderData.data = res.reorders;
    //   },
    //   error: () => {
    //   },
    //   complete: () => this.loading = false
    // });
    this.ai.lowStock(5, 10).subscribe({
      next: res => {
        this.lowStockData = res;
      },
      error: () => {
      },
      complete: () => this.loading = false
    });


  }
}
