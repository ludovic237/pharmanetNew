import {Component, Input, OnInit} from '@angular/core';
import {ChartData} from "chart.js";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
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
import {MatPaginatorModule} from "@angular/material/paginator";
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
import {MatSnackBarModule} from "@angular/material/snack-bar";
import {NgxPaginationModule} from "ngx-pagination";
import {NgScrollbarModule} from "ngx-scrollbar";

@Component({
  selector: 'app-daily-sales',
  imports: [
    ReactiveFormsModule,
    // Material
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatDatepickerModule, MatNativeDateModule,
    MatButtonModule, MatGridListModule, MatTableModule,
    MatIconModule, MatTooltipModule,
    NgScrollbarModule,
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
  templateUrl: './daily-sales.component.html',
  styleUrl: './daily-sales.component.scss'
})
export class DailySalesComponent implements OnInit{
  @Input() data?: any;

  salesMonthlyLabels : any[]=[]
  salesMonthlyRaw : any[]=[]
  lineChartData: ChartData<'line'> = {labels: [], datasets: []};

  ngOnInit() {
    this.salesMonthlyLabels = this.data.map((m:any) => m[0]);
    this.salesMonthlyRaw = [{data: this.data.map((m:any) => m[1]), label: 'Vente par jour'}];
    this.lineChartData = {
      labels: this.salesMonthlyLabels,
      datasets: this.salesMonthlyRaw
    };
  }
}
