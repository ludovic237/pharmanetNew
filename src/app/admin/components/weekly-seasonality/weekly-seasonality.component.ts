import {Component, Input, OnInit} from '@angular/core';
import {ChartConfiguration} from "chart.js";
import {CommonModule, DecimalPipe} from "@angular/common";
import {MatCardModule} from "@angular/material/card";
import {MatIconModule} from "@angular/material/icon";
import {MatChipsModule} from "@angular/material/chips";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {MatBadgeModule} from "@angular/material/badge";
import {NgChartsModule} from "ng2-charts";
import {RouterModule} from "@angular/router";
import {FormsModule} from "@angular/forms";
import {FlexLayoutModule} from "@ngbracket/ngx-layout";
import {MatSidenavModule} from "@angular/material/sidenav";
import {MatExpansionModule} from "@angular/material/expansion";
import {MatButtonModule} from "@angular/material/button";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatMenuModule} from "@angular/material/menu";
import {NgScrollbarModule} from "ngx-scrollbar";
import {MatSliderModule} from "@angular/material/slider";
import {NgxPaginationModule} from "ngx-pagination";
import {CategoryListComponent} from "@shared-components/category-list/category-list.component";
import {RatingComponent} from "@shared-components/rating/rating.component";
import {ControlsComponent} from "@shared-components/controls/controls.component";
import {PipesModule} from "../../../theme/pipes/pipes.module";

@Component({
  selector: 'app-weekly-seasonality',
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
    CategoryListComponent,
    RatingComponent,
    ControlsComponent,
    DecimalPipe,
    PipesModule,
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
