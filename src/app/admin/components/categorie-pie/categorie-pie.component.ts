import {Component, Input, OnInit} from '@angular/core';
import {CommonModule, DecimalPipe} from "@angular/common";
import {MatCardModule} from "@angular/material/card";
import {MatIconModule} from "@angular/material/icon";
import {MatChipsModule} from "@angular/material/chips";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {MatListModule} from "@angular/material/list";
import {MatSelectModule} from "@angular/material/select";
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
  selector: 'app-categorie-pie',
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
    MatListModule,
    MatSelectModule,
    NgChartsModule
  ],
  templateUrl: './categorie-pie.component.html',
  styleUrl: './categorie-pie.component.scss'
})
export class CategoriePieComponent implements OnInit{
  @Input() data: any[] = [];
  get labels(){ return this.data.map(d=>d.categorie); }
  get values(){ return this.data.map(d=>d.ca); }

  ngOnInit(): void {
    console.log("CategoriePieComponent")
    console.log(this.data)
  }
}
