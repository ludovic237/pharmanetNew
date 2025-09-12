import {Component, Input, OnInit} from '@angular/core';
import {ChartConfiguration} from "chart.js";
import {CommonModule} from "@angular/common";
import {MatCardModule} from "@angular/material/card";
import {MatIconModule} from "@angular/material/icon";
import {MatChipsModule} from "@angular/material/chips";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {MatProgressBar} from "@angular/material/progress-bar";
import {MatBadgeModule} from "@angular/material/badge";
import {NgChartsModule} from "ng2-charts";

@Component({
  selector: 'app-monthly-sales',
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatBadgeModule,
    NgChartsModule
  ],
  templateUrl: './monthly-sales.component.html',
  styleUrl: './monthly-sales.component.scss'
})
export class MonthlySalesComponent implements OnInit{

  @Input() data?: any;

  get chart(): ChartConfiguration<'bar'> | undefined {
    if (!this.data) return undefined;
    return {
      plugins: [], type: "bar",
      data: {
        labels: this.data.months,
        datasets: [
          { label: 'current', data: this.data.current },
          { label: 'previous', data: this.data.previous }
        ]
      },
      options: { responsive:true, plugins:{ legend:{ position:'bottom'} } }
    };
  }

  ngOnInit() {
    console.log("MonthlySalesComponent")
    console.log(this.data)
  }
}
