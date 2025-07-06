import {Component, OnInit} from '@angular/core';
import {EnrayonsService} from "@services/enrayons.service";
import {MatMenuModule} from "@angular/material/menu";
import {MatListModule} from "@angular/material/list";
import {MatChipsModule} from "@angular/material/chips";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {MatDividerModule} from "@angular/material/divider";
import {MatExpansionModule} from "@angular/material/expansion";
import {CommonModule} from "@angular/common";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatTabsModule} from "@angular/material/tabs";
import {MatIconModule} from "@angular/material/icon";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {MatTableModule} from "@angular/material/table";
import {MatCardModule} from "@angular/material/card";
import {MatButtonModule} from "@angular/material/button";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatNativeDateModule} from "@angular/material/core";
import {MatSelectModule} from "@angular/material/select";
import {FlexLayoutModule} from "@ngbracket/ngx-layout";
import {MatStepperModule} from "@angular/material/stepper";
import {MatRadioModule} from "@angular/material/radio";
import {MatSnackBarModule} from "@angular/material/snack-bar";
import {NgxPaginationModule} from "ngx-pagination";
import {MatPaginator} from "@angular/material/paginator";
import {InventaireService} from "@services/inventaire.service";
import {
  AjouterCommandeDialogComponent
} from "../../commandes/lister-ajouter-commande/ajouter-commande-dialog/ajouter-commande-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {InventaireDialogComponent} from "./inventaire-dialog/inventaire-dialog.component";

@Component({
  selector: 'app-inventaire',
  imports: [
    MatMenuModule,
    MatListModule,
    MatChipsModule,
    MatSlideToggleModule,
    FormsModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule,
    MatExpansionModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    // Material
    MatToolbarModule,
    MatTabsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    // Material
    MatStepperModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatRadioModule,
    MatIconModule,
    MatCardModule,
    MatSnackBarModule,
    MatChipsModule,
    NgxPaginationModule,
    MatPaginator,
  ],
  templateUrl: './inventaire.component.html',
  styleUrl: './inventaire.component.scss'
})
export class InventaireComponent implements OnInit {

  inventaire: any[] = [];
  displayedColumns: string[] = ['id', 'dateDebut', 'dateFin', 'etat', 'actions'];
  totalItems = 0;
  count = 10;
  etat: string | null = null;
  dateDebut: Date | null = null;
  dateFin: Date | null = null;

  constructor(private inventaireService: InventaireService,
              public dialog: MatDialog) {}

  ngOnInit(): void {
    this.fetchInventaire();
  }

  fetchInventaire(): void {
    this.inventaireService.getInventaire(this.etat, this.dateDebut, this.dateFin).subscribe((data: any) => {
      this.inventaire = data.items;
      this.totalItems = data.total;
    });
  }

  resetFilters(): void {
    this.etat = null;
    this.dateDebut = null;
    this.dateFin = null;
    this.fetchInventaire();
  }

  onPageChanged(page: number): void {
    this.inventaireService.setPage(page);
    this.fetchInventaire();
  }

  editItem(item: any): void {
    // Open dialog for editing item
    const dialogRef = this.dialog.open(InventaireDialogComponent, {
      data: {
        type: "edit",
        id: item.id,
      },
      width: "80%",
      panelClass: ['theme-dialog'],
      autoFocus: false,
    });
    dialogRef.afterClosed().subscribe((data: any) => {
      console.log('Dialog closed', data);

    });
  }

  addItem(): void {
    // Open dialog for editing item
    const dialogRef = this.dialog.open(InventaireDialogComponent, {
      data: {
        type:"add",
      },
      width: "80%",
      panelClass: ['theme-dialog'],
      autoFocus: false,
    });
    dialogRef.afterClosed().subscribe((data: any) => {
      console.log('Dialog closed', data);

    });
  }

  deleteItem(id: number): void {
    this.inventaireService.deleteInventaire(id).subscribe(() => {
      this.fetchInventaire();
    });
  }
}
