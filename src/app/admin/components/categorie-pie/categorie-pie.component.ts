import {Component, Input, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";
import {MatCardModule} from "@angular/material/card";
import {MatIconModule} from "@angular/material/icon";
import {MatChipsModule} from "@angular/material/chips";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {MatListModule} from "@angular/material/list";
import {MatSelectModule} from "@angular/material/select";
import {NgChartsModule} from "ng2-charts";

@Component({
  selector: 'app-categorie-pie',
  imports: [
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
