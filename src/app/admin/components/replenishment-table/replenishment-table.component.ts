import {Component, Input, SimpleChanges} from '@angular/core';
import {CommonModule} from "@angular/common";
import {MatCardModule} from "@angular/material/card";
import {MatIconModule} from "@angular/material/icon";
import {MatChipsModule} from "@angular/material/chips";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {MatTableDataSource, MatTableModule} from "@angular/material/table";

@Component({
  selector: 'app-replenishment-table',
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTableModule
  ],
  templateUrl: './replenishment-table.component.html',
  styleUrl: './replenishment-table.component.scss'
})
export class ReplenishmentTableComponent {
  @Input() rows: any[] = [];

  data: any[] = [];
  displayedColumns = ['produit', 'stock', 'suggested', 'reason', 'action'];

  ngOnChanges(changes: SimpleChanges) {
    if (changes['rows']) this.data = this.rows || [];
  }

  order(row: any) {

  }
}
