import {Component, Input, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";
import {MatCardModule} from "@angular/material/card";
import {MatIconModule} from "@angular/material/icon";
import {MatChipsModule} from "@angular/material/chips";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {MatProgressBarModule} from "@angular/material/progress-bar";
import {MatBadgeModule} from "@angular/material/badge";

@Component({
  selector: 'app-top-products',
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatChipsModule,
    MatBadgeModule,
    MatProgressSpinnerModule,
    MatProgressBarModule
  ],
  templateUrl: './top-products.component.html',
  styleUrl: './top-products.component.scss'
})
export class TopProductsComponent implements OnInit{

  @Input() items: any[] = [];

  ngOnInit() {

  }

  progressValue = 45

  getColor(p:any): 'primary' | 'accent' | 'warn' {
    if ( p.score < 30) {
      return 'warn'
    } else if ( p.score < 70) {
      return 'accent'
    } else {
      return 'primary'
    }
  }

  getCustomClass(p:any) {
    if ( p.score < 30) {
      return 'red-progress'
    } else if ( p.score < 70) {
      return 'orange-progress'
    } else {
      return 'green-progress'
    }
  }
}
