import {Component, OnInit} from '@angular/core';
import {MatMenuModule} from "@angular/material/menu";
import {MatListModule} from "@angular/material/list";
import {MatChipsModule} from "@angular/material/chips";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
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
import {MatDialog} from "@angular/material/dialog";
import {SettingsService} from "@services/settings.service";
import {CommandesService} from "@services/commandes.service";
import {FournisseursService} from "@services/fournisseurs.service";
import {EnrayonsService} from "@services/enrayons.service";
import {ProductService} from "@services/products.service";
import {UsersService} from "@services/users.service";
import {VentesService} from "@services/ventes.service";
import {PrescripteursService} from "@services/prescripteurs.service";
import {DomHandlerService} from "@services/dom-handler.service";
import {MatPaginator, PageEvent} from "@angular/material/paginator";
import {AuthService} from "@services/auth.service";
import {AppService} from "@services/app.service";
import {LoaderService} from "@services/loader.service";

@Component({
  selector: 'app-entree',
  providers: [UsersService,
    SettingsService,
    CommandesService,
    FournisseursService,
    EnrayonsService,
    ProductService,
    UsersService,
    VentesService,
    PrescripteursService],
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
  templateUrl: './entree.component.html',
  standalone: true,
  styleUrl: './entree.component.scss'
})
export class EntreeComponent implements OnInit {
  public form: FormGroup;
  total = 0;
  quantite = 0;
  nomProduit: string | null = null;
  bientotPerimee: boolean | null = null;
  joursAvantPeremption: number | null = null;
  enStock: boolean | null = null;

  displayedColumns: string[] = [
    'nomProduit',
    'fournisseurNom',
    'quantite',
    'quantiteRestante',
    'prixAchat',
    'prixVente',
    'dateLivraison',
    'datePeremption',
    'enStock'
  ];

  entrees: any[] = []

  public viewCol: number = 25;
  public page: number = 1; // Default to 0 if undefined
  public size = 100;  // Default to 10 if undefined
  public totalItems = 0;  // Default to 10 if undefined
  public count = 10;

  startDateLivraison: Date | null = new Date(new Date().getFullYear(), 0, 1);
  endDateLivraison: Date | null = new Date();

  constructor(
    public loaderService: LoaderService,
    public authService: AuthService,
    public appService: AppService,
    public appSettings: SettingsService,
    public snackBar: MatSnackBar,
    public enRayonService: EnrayonsService,
    public commandesService: CommandesService,
    public fournisseursService: FournisseursService,
    public productService: ProductService,
    public ventesService: VentesService,
    public usersService: UsersService,
    public prescripteursService: PrescripteursService,
    public domHandlerService: DomHandlerService,
    public formBuilder: FormBuilder,
    public dialog: MatDialog) {

    this.form = this.formBuilder.group({
      nomProduit: [null],
      bientotPerimee: [null],
      startDateLivraison: [this.startDateLivraison],
      endDateLivraison: [this.endDateLivraison],
      enStock: [null],
    })
  }

  ngOnInit(): void {

    this.fetchEnRayonsPageable();

    this.form.get('nomProduit').valueChanges.subscribe(nomProduit => {
      this.nomProduit = nomProduit
      this.page = 1
      this.fetchEnRayonsPageable()
    });

    this.form.get('bientotPerimee').valueChanges.subscribe(bientotPerimee => {
      this.bientotPerimee = bientotPerimee
      this.page = 1
      this.fetchEnRayonsPageable()
    });

    this.form.get('enStock').valueChanges.subscribe(enStock => {
      this.enStock = enStock
      this.page = 1
      this.fetchEnRayonsPageable()
    });
  }

  fetchEnRayonsPageable(): void {

    this.enRayonService.getProduitsEnRayonPageable(
      this.page - 1,
      this.count,
      this.nomProduit,
      this.appService.formatDate(new Date(new Date(this.form.get('startDateLivraison').value).setHours(0, 0, 0, 0)) + ""),
      this.appService.formatDate(new Date(new Date(this.form.get('endDateLivraison').value).setHours(23, 59, 59, 999)) + ""),
      this.bientotPerimee,
      null,
      this.enStock,
    ).subscribe({
      next: (data: any) => {
        this.count = data.pageSize;
        this.totalItems = data.totalElements;
        this.entrees = data.content.content;
        this.total = data.totalAmountEnRayon;
        this.quantite = data.totalQte;

      },
      error: (err: any) => {

        if (err.status === 401 || err.status === 403) {
          this.authService.logout();
          localStorage.removeItem('token');
          localStorage.setItem("lastLink", window.location.href);
          ;
          this.snackBar.open('Déconnexion réussie.', '×', {
            panelClass: 'success',
            verticalPosition: 'top',
            duration: 3000,
          });
          localStorage.removeItem('token');
          window.location.href = '/sign-in';
        }
        console.error('Error fetching commandes:', err);
      }
    });
  }

  public onPageChanged(event: PageEvent) {
    this.page = event.pageIndex + 1;
    this.count = event.pageSize
    this.fetchEnRayonsPageable();
  }

  resetFilters(): void {
    this.nomProduit = null;
    this.bientotPerimee = null;
    this.joursAvantPeremption = null;
    this.enStock = null;
    this.fetchEnRayonsPageable();
  }

}
