import {Component, Input, OnInit} from '@angular/core';
import { DecimalPipe } from "@angular/common";
import {MatCardModule} from "@angular/material/card";
import {MatIconModule} from "@angular/material/icon";
import {MatChipsModule} from "@angular/material/chips";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {NgChartsModule} from "ng2-charts";
import {MatBadgeModule} from "@angular/material/badge";
import {MatProgressBarModule} from "@angular/material/progress-bar";
import {MatExpansionModule} from "@angular/material/expansion";
import {NgScrollbarModule} from "ngx-scrollbar";
import {MatDividerModule} from "@angular/material/divider";
import {RouterModule} from "@angular/router";
import {FormsModule} from "@angular/forms";
import {FlexLayoutModule} from "@ngbracket/ngx-layout";
import {MatSidenavModule} from "@angular/material/sidenav";
import {MatButtonModule} from "@angular/material/button";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatMenuModule} from "@angular/material/menu";
import {MatSliderModule} from "@angular/material/slider";
import {NgxPaginationModule} from "ngx-pagination";
import {CategoryListComponent} from "@shared-components/category-list/category-list.component";
import {RatingComponent} from "@shared-components/rating/rating.component";
import {ControlsComponent} from "@shared-components/controls/controls.component";
import {PipesModule} from "../../../theme/pipes/pipes.module";

@Component({
  selector: 'app-low-stock',
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
    MatCardModule,
    MatIconModule,
    NgChartsModule,
    MatBadgeModule,
    MatProgressBarModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    NgScrollbarModule,
    MatDividerModule
],
  templateUrl: './low-stock.component.html',
  styleUrl: './low-stock.component.scss'
})
export class LowStockComponent implements OnInit{
  @Input() items: any[] = [];


  ngOnInit(): void {

  }

  getColor(p:number): 'success' | 'danger' | 'pink' {
    if ( p < 30) {
      return 'danger'
    } else if ( p < 70) {
      return 'danger'
    } else {
      return 'danger'
    }
  }
}
