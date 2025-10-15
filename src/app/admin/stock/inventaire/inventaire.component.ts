import {Component, OnInit} from '@angular/core';
import {EnrayonsService} from "@services/enrayons.service";
import {MatMenuModule} from "@angular/material/menu";
import {MatListModule} from "@angular/material/list";
import {MatChipsModule} from "@angular/material/chips";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms";
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
import {MatSnackBar, MatSnackBarModule} from "@angular/material/snack-bar";
import {NgxPaginationModule} from "ngx-pagination";
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {InventaireService} from "@services/inventaire.service";
import {
  AjouterCommandeDialogComponent
} from "../../commandes/lister-ajouter-commande/ajouter-commande-dialog/ajouter-commande-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {InventaireDialogComponent} from "./inventaire-dialog/inventaire-dialog.component";
import {InventaireSaisieDialogComponent} from "./inventaire-saisie-dialog/inventaire-saisie-dialog.component";
import {
  InventaireComparaisonDialogComponent
} from "./inventaire-comparaison-dialog/inventaire-comparaison-dialog.component";
import {InventaireValdationDialogComponent} from "./inventaire-valdation-dialog/inventaire-valdation-dialog.component";
import {AuthService} from "@services/auth.service";
import {LoaderService} from "@services/loader.service";
import {AppService} from "@services/app.service";

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
    CommonModule
  ],
  templateUrl: './inventaire.component.html',
  styleUrl: './inventaire.component.scss'
})
export class InventaireComponent implements OnInit {
  public form: FormGroup;
  startDate: Date | null = new Date(new Date().getFullYear(), 0, 1);
  endDate: Date | null = new Date();

  inventaire: any[] = [];
  displayedColumns: string[] = ['id', 'dateDebut', 'dateFin', 'etat', 'totalProduitsManquant', 'totalProduitsExcedent', 'totalProduitsEcart', 'actions'];
  etat: string | null = null;
  dateDebut: Date | null = null;
  dateFin: Date | null = null;

  public page: number = 1; // Default to 0 if undefined
  public size = 100;  // Default to 10 if undefined
  public totalItems = 0;  // Default to 10 if undefined
  public count = 10;

  constructor(
    public formBuilder: FormBuilder,
    public loaderService: LoaderService,
    public appService: AppService,
    public authService: AuthService,
    public snackBar: MatSnackBar, private inventaireService: InventaireService,
    public dialog: MatDialog) {
    this.form = this.formBuilder.group({
      etat: ["null"],
      startDate: [this.startDate],
      endDate: [this.endDate],
    })
  }

  ngOnInit(): void {
    this.fetchInventaire();
    this.form.get('etat').valueChanges.subscribe(nomProduit => {
      this.page = 1
      this.fetchInventaire();
    });
  }

  fetchInventaire(): void {

    this.inventaireService.getInventaire(
      this.page - 1, this.count,
      this.form.get('etat').value,
      this.appService.formatDate(new Date(new Date(this.form.get('startDate').value).setHours(0,0,0,0))+""),
      this.appService.formatDate(new Date(new Date(this.form.get('endDate').value).setHours(23,59,59,999))+""),
    ).subscribe({
      next: (data: any) => {
        this.count = data.pageable.pageSize;
        this.totalItems = data.totalElements;
        this.inventaire = data.content;

      },
      error: (err: any) => {

        if (err.status === 401 || err.status === 403) {

          this.authService.logout().subscribe({
            next: (data) => {

              localStorage.removeItem('token');
              localStorage.setItem("lastLink", window.location.href);
              window.location.href = '/sign-in';
              this.snackBar.open('Déconnexion réussie.', '×', {
                panelClass: 'success',
                verticalPosition: 'top',
                duration: 3000,
              });
            },
            error: (err) => {

              console.error('Error  subscription:', err);
              if (err.status === 401 || err.status === 403) {
                this.authService.logout();
                localStorage.removeItem('token');
                localStorage.setItem("lastLink", window.location.href);
                ;
                this.snackBar.open('Déconnexion, une erreur.', '×', {
                  panelClass: 'success',
                  verticalPosition: 'top',
                  duration: 3000,
                });
                window.location.href = '/sign-in';
              }
            }
          })
        }
        console.error('Error fetching commandes:', err);
      }
    });

  }

  resetFilters(): void {
    this.etat = null;
    this.dateDebut = null;
    this.dateFin = null;
    this.fetchInventaire();
  }

  onPageChanged(event: PageEvent): void {
    this.page = event.pageIndex + 1;
    this.count = event.pageSize
    this.fetchInventaire();
  }

  editItem(item: any): void {
    // Open dialog for editing item
    const dialogRef = this.dialog.open(InventaireSaisieDialogComponent, {
      data: {
        type: "edit",
        id: item.id,
      },
      width: "80%",
      panelClass: ['theme-dialog'],
      autoFocus: false,
    });
    dialogRef.afterClosed().subscribe((data: any) => {
      if (data.type === "cloture") {
        const dialogRef = this.dialog.open(InventaireComparaisonDialogComponent, {
          data: {
            type: "edit",
            id: item.id,
          },
          width: "80%",
          panelClass: ['theme-dialog'],
          autoFocus: false,
        });
        dialogRef.afterClosed().subscribe((data: any) => {
          this.fetchInventaire();
        });
      }
      this.fetchInventaire();
    });
  }

  addItem(): void {
    // Open dialog for editing item
    const dialogRef = this.dialog.open(InventaireDialogComponent, {
      data: {
        type: "add",
      },
      width: "80%",
      panelClass: ['theme-dialog'],
      autoFocus: false,
    });
    dialogRef.afterClosed().subscribe((data: any) => {
      const dialogRef = this.dialog.open(InventaireSaisieDialogComponent, {
        data: {
          type: "edit",
          id: data.id,
        },
        width: "80%",
        panelClass: ['theme-dialog'],
        autoFocus: false,
      });
      dialogRef.afterClosed().subscribe(dialogResult => {
        if (dialogResult) {

        }
        this.fetchInventaire();
      });
      this.fetchInventaire();
    });
  }

  deleteItem(id: number): void {
    this.inventaireService.deleteInventaire(id).subscribe(() => {
      this.fetchInventaire();
    });
  }

  showComparison(item: any): void {
    const dialogRef = this.dialog.open(InventaireComparaisonDialogComponent, {
      data: {
        type: "edit",
        id: item.id,
      },
      width: "80%",
      panelClass: ['theme-dialog'],
      autoFocus: false,
    });
    dialogRef.afterClosed().subscribe((data: any) => {
      this.fetchInventaire();
      if (data.type === "valider") {
        this.validateItem(item);
      }
    });
  }


  validateItem(item: any): void {
    const dialogRef = this.dialog.open(InventaireValdationDialogComponent, {
      data: {
        type: "edit",
        id: item.id,
      },
      // width: "80%",
      panelClass: ['theme-dialog'],
      autoFocus: false,
    });
    dialogRef.afterClosed().subscribe((data: any) => {
      this.fetchInventaire();
    });
  }

}
