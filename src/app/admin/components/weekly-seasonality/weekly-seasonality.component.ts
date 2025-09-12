import {Component, Input, OnInit} from '@angular/core';
import {ChartConfiguration} from "chart.js";
import {CommonModule} from "@angular/common";
import {MatCardModule} from "@angular/material/card";
import {MatIconModule} from "@angular/material/icon";
import {MatChipsModule} from "@angular/material/chips";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {MatBadgeModule} from "@angular/material/badge";
import {NgChartsModule} from "ng2-charts";

@Component({
  selector: 'app-weekly-seasonality',
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatBadgeModule,
    NgChartsModule
  ],
  templateUrl: './weekly-seasonality.component.html',
  styleUrl: './weekly-seasonality.component.scss'
})
export class WeeklySeasonalityComponent implements OnInit{

  @Input() data?: any[];

  ngOnInit(): void {
    console.log("this.chart")
    console.log(this.data)
  }

  get chart(): ChartConfiguration<'bar'> | undefined {
    if (!this.data) return undefined;
    // return {
    //   plugins: [], type: "line",
    //   data: {
    //     labels: this.data.weekLabels,
    //     datasets: [
    //       { label: 'Ventes réelles', data: this.data.actual, fill:false, tension:.3 },
    //       { label: 'Moyenne historique', data: this.data.mean, borderDash:[6,6], fill:false, tension:.3 }
    //     ]
    //   },
    //   options: { responsive:true, plugins:{ legend:{ position:'bottom'} } }
    // };
    return {
      plugins: [], type: "bar",
      data: {
        labels: this.data.map(m => m.label),
        datasets: [
          {data: this.data.map(m => m.total), label: 'Ventes'}
        ]
      },
      options: { responsive:true, plugins:{ legend:{ position:'bottom'} } }
    };
  }
}
