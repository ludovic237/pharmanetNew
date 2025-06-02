import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatTableModule} from "@angular/material/table";
import {MatIconModule} from "@angular/material/icon";
import {MatDividerModule} from "@angular/material/divider";
import {MatListModule} from "@angular/material/list";
import {MatChipsModule} from "@angular/material/chips";
import {MatGridListModule} from "@angular/material/grid-list";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatCardModule} from "@angular/material/card";
import {MatExpansionModule} from "@angular/material/expansion";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {FlexLayoutModule} from "@ngbracket/ngx-layout";
import {MatTabsModule} from "@angular/material/tabs";
import {MatInputModule} from "@angular/material/input";
import {MatSelectModule} from "@angular/material/select";
import {MatButtonModule} from "@angular/material/button";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatNativeDateModule} from "@angular/material/core";
import {CommonModule} from "@angular/common";
import {MatStepperModule} from "@angular/material/stepper";
import {MatMenuModule} from "@angular/material/menu";
import {NgxPaginationModule} from "ngx-pagination";
import {PipesModule} from "../../../theme/pipes/pipes.module";

@Component({
  selector: 'app-confirmation-dialog',
  imports: [
    MatTableModule,
    MatIconModule,
    MatDividerModule,
    MatListModule,
    MatChipsModule,
    MatGridListModule,
    MatToolbarModule,

    MatCardModule,
    MatExpansionModule,
    MatTableModule,
    MatIconModule,
    MatDividerModule,

    ReactiveFormsModule,
    FlexLayoutModule,
    MatTabsModule,
    MatCardModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatChipsModule, // Import MatChipsModule
    MatStepperModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatTabsModule,
    MatMenuModule,
    MatDialogModule,
    MatButtonModule,
    CommonModule,
    MatTableModule,
    MatSelectModule,
    FormsModule,
    CommonModule,
    MatDialogModule,
    NgxPaginationModule,
    PipesModule
  ],
  template: `
    <mat-toolbar>
      <h1 mat-dialog-title>Confirmation</h1>
    </mat-toolbar>
    <mat-dialog-content>
      <p>{{ data.message }}</p>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" (click)="onConfirm()">Confirm</button>
    </mat-dialog-actions>
  `,
})
export class ConfirmationDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
