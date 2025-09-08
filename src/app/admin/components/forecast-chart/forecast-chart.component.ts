import {Component, Input, OnInit} from '@angular/core';
import {ChartConfiguration} from "chart.js";
import {ForecastResponse} from "../../../model/ai.models";
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
import {MatTableModule} from "@angular/material/table";
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
  selector: 'app-forecast-chart',
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
  templateUrl: './forecast-chart.component.html',
  styleUrl: './forecast-chart.component.scss'
})
export class ForecastChartComponent implements OnInit {
  @Input() produitId!: number;

  loading = false;
  data?: ForecastResponse;
  lineChartData?: ChartConfiguration<'line'>['data'];
  lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true, maintainAspectRatio: false
  };

  constructor(private ai: AiService) {
  }

  ngOnInit(): void {
    if (!this.produitId) return;
    this.loading = true;
    this.ai.forecast(this.produitId).subscribe({
      next: (res) => {
        this.data = res;
        const labels = res.forecast.map((p: any) => p.date);
        const values = res.forecast.map((p: any) => p.yhat);
        this.lineChartData = {
          labels,
          datasets: [{data: values, label: 'Prévision (unités/jour)'}]
        };
      },
      error: () => {
      },
      complete: () => (this.loading = false)
    });
  }
}
