import {Component, Input, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";
import {MatCardModule} from "@angular/material/card";
import {MatIconModule} from "@angular/material/icon";
import {MatChipsModule} from "@angular/material/chips";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {NgChartsModule} from "ng2-charts";
import {MatBadgeModule} from "@angular/material/badge";
import {MatProgressBarModule} from "@angular/material/progress-bar";

@Component({
  selector: 'app-low-stock',
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    NgChartsModule,
    MatBadgeModule,
    MatProgressBarModule,
    MatChipsModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './low-stock.component.html',
  styleUrl: './low-stock.component.scss'
})
export class LowStockComponent implements OnInit{
  @Input() items: any[] = [];


  ngOnInit(): void {
    console.log("this.items")
    console.log(this.items)
  }

}
