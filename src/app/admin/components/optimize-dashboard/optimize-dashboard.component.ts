import {Component, OnInit} from '@angular/core';
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
import {CommonModule} from "@angular/common";
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

@Component({
  selector: 'app-optimize-dashboard',
  imports: [
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
  loading = false;
  data?: OptimizeDashboardResponse;

  lowStockData = new MatTableDataSource<any>([]);
  reorderData = new MatTableDataSource<any>([]);
  lowColumns = ['produit', 'stock', 'threshold'];
  reorderColumns = ['produit_id', 'current_stock', 'safety_stock', 'reorder_point', 'suggested_order_qty'];

  constructor(private ai: AiService) {}

  ngOnInit(): void {
    this.loading = true;
    this.ai.optimizeDashboard().subscribe({
      next: res => {
        this.data = res;
        this.lowStockData.data = res.low_stock;
        this.reorderData.data = res.reorder_suggestions;
      },
      error: () => {},
      complete: () => this.loading = false
    });
  }
}
