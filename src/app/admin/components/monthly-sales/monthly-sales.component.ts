import {Component, Input, OnInit} from '@angular/core';
import {ChartConfiguration} from "chart.js";
import {CommonModule, DecimalPipe} from "@angular/common";
import {MatCardModule} from "@angular/material/card";
import {MatIconModule} from "@angular/material/icon";
import {MatChipsModule} from "@angular/material/chips";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {MatProgressBar} from "@angular/material/progress-bar";
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
  selector: 'app-monthly-sales',
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

  }
}
