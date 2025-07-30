import { Component } from '@angular/core';
import {CommonModule} from "@angular/common";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatTabsModule} from "@angular/material/tabs";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatCardModule} from "@angular/material/card";
import {MatDialogModule} from "@angular/material/dialog";
import {MatInputModule} from "@angular/material/input";
import {MatSelectModule} from "@angular/material/select";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatButtonModule} from "@angular/material/button";
import {MatDividerModule} from "@angular/material/divider";
import {MatIconModule} from "@angular/material/icon";
import {MatTableModule} from "@angular/material/table";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {FlexLayoutModule} from "@ngbracket/ngx-layout";
import {AuthService} from "@services/auth.service";
import {DepenseService} from "@services/depenses.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatNativeDateModule} from "@angular/material/core";

@Component({
  selector: 'app-depense',
  imports: [
    MatDatepickerModule,
    MatNativeDateModule,
    CommonModule,
    FormsModule,
    MatTabsModule,
    MatToolbarModule,
    MatCardModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatButtonModule, MatDividerModule, MatIconModule,
    MatTableModule,
    MatAutocompleteModule,
    FlexLayoutModule
  ],
  templateUrl: './depense.component.html',
  styleUrl: './depense.component.scss'
})
export class DepenseComponent {

  selectedTabIndex: number = 0;
  depenses: any[] = [];
  displayedColumns: string[] = ['id', 'designation', 'quantite', 'prixUnitaire', 'dateEpense', 'actions'];
  depenseForm: FormGroup;

  constructor(
    public authService: AuthService,
    private fb: FormBuilder, private depenseService: DepenseService, private snackBar: MatSnackBar) {
    this.depenseForm = this.fb.group({
      designation: ['', Validators.required],
      quantite: ['', Validators.required],
      dateDepense: ['', Validators.required],
      beneficiaire: ['', Validators.required],
      numeroCni: ['', Validators.required],
      dateDelivrance: ['', Validators.required],
      lieuDelivrance: ['', Validators.required],
      societe: ['', Validators.required],
      typeDepense: ['', Validators.required],
      prixUnitaire: [0, [Validators.required, Validators.min(1)]],
      // dateEpense: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadDepenses();
  }

  loadDepenses(): void {
    this.depenseService.getAllDepenses().subscribe({
      next: (data) => this.depenses = data,
      error: () => this.snackBar.open('Failed to load depenses', '×', {panelClass: 'error', duration: 3000})
    });
  }

  createDepense(): void {
    console.log("this.depenseForm.value");
    console.log(this.depenseForm.value);
    if (this.depenseForm.valid) {
      this.depenseService.createDepense(this.depenseForm.value).subscribe({
        next: () => {
          this.snackBar.open('Depense created successfully', '×', {panelClass: 'success', duration: 3000});
          this.loadDepenses();
          this.depenseForm.reset();
          this.depenseForm.markAsPristine();
          this.depenseForm.markAsUntouched();
          this.depenseForm.updateValueAndValidity();
          // this.depenseForm.;
        },
        error: () => this.snackBar.open('Failed to create depense', '×', {panelClass: 'error', duration: 3000})
      });
    }
  }

  deleteDepense(id: number): void {
    this.depenseService.deleteDepense(id).subscribe({
      next: () => {
        this.snackBar.open('Depense deleted successfully', '×', {panelClass: 'success', duration: 3000});
        this.loadDepenses();
      },
      error: () => this.snackBar.open('Failed to delete depense', '×', {panelClass: 'error', duration: 3000})
    });
  }

}
