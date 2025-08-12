import {Component, Inject, inject, OnInit} from '@angular/core';
import {AuthService} from "@services/auth.service";
import {MatSnackBar, MatSnackBarModule} from "@angular/material/snack-bar";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatCardModule} from '@angular/material/card';
import {ActivatedRoute} from '@angular/router';
import {Category} from '@models/category';
import {AppService} from '@services/app.service';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {FlexLayoutModule} from '@ngbracket/ngx-layout';
import {CategorieService} from "@services/categories.service";
import {MagasinService} from "@services/magasins.service";
import {RayonService} from "@services/rayons.service";
import {FabriquantService} from "@services/fabriquants.service";
import {FormeService} from "@services/formes.service";
import {CommonModule} from "@angular/common";
import {ProductService} from "@services/products.service";
import {EtageresService} from "@services/etageres.service";
import {MatToolbarModule} from "@angular/material/toolbar";
import {InputFileModule} from "../../../../theme/components/input-file/input-file.module";
import {MAT_DIALOG_DATA, MatDialogModule} from "@angular/material/dialog";
import {BehaviorSubject, Subject, combineLatest, switchMap, takeUntil} from 'rxjs';
import {MatMenuModule} from "@angular/material/menu";
import {MatListModule} from "@angular/material/list";
import {MatChipsModule} from "@angular/material/chips";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatDividerModule} from "@angular/material/divider";
import {MatExpansionModule} from "@angular/material/expansion";
import {MatTabsModule} from "@angular/material/tabs";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {MatTableModule} from "@angular/material/table";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatNativeDateModule} from "@angular/material/core";
import {MatStepperModule} from "@angular/material/stepper";
import {MatRadioModule} from "@angular/material/radio";
import {NgxPaginationModule} from "ngx-pagination";

@Component({
  selector: 'app-add-product-dialog',
  imports: [
    MatDialogModule,
    MatToolbarModule,
    CommonModule,
    FormsModule,
    MatToolbarModule,
    ReactiveFormsModule,
    MatCardModule,
    InputFileModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    FlexLayoutModule,
    MatDialogModule,
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
    NgxPaginationModule
  ],
  templateUrl: './add-product-dialog.component.html',
  styleUrl: './add-product-dialog.component.scss'
})
export class AddProductDialogComponent implements OnInit {
  public form: FormGroup;
  public colors = ["#5C6BC0", "#66BB6A", "#EF5350", "#BA68C8", "#FF4081", "#9575CD", "#90CAF9", "#B2DFDB", "#DCE775", "#FFD740", "#00E676", "#FBC02D", "#FF7043", "#F5F5F5", "#696969"];
  public sizes = ["S", "M", "L", "XL", "2XL", "32", "36", "38", "46", "52", "13.3\"", "15.4\"", "17\"", "21\"", "23.4\""];
  public selectedColors: string;
  public categories: any[];
  public rayons: any[];
  public magasins: any[];
  public formes: any[];
  public fabriquants: any[];
  public etagere: any[];
  private sub: any;
  public id: any;
  title:string=""

  info: boolean = false;

  constructor(
    public authService: AuthService,
    public snackBar: MatSnackBar,
    public categorieService: CategorieService,
    public etageresService: EtageresService,
    public magasinService: MagasinService,
    public rayonService: RayonService,
    public fabriquantService: FabriquantService,
    public formeService: FormeService,
    public productService: ProductService,
    public appService: AppService,
    public formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
  }

  ngOnInit(): void {

    this.title = this.data.title

    this.form = this.formBuilder.group({
      nom: [null, Validators.compose([Validators.required, Validators.minLength(4)])],
      ean13: [null, Validators.maxLength(16)],
      codeLaborex: [null, Validators.maxLength(32)],
      codeUbipharm: [null, Validators.maxLength(32)],
      reference: [null, Validators.maxLength(32)],
      stock: [null, Validators.min(0)],
      stockMax: [null, Validators.min(0)],
      stockMin: [null, Validators.min(0)],
      contenuDetail: [null],
      prixDetail: [null],
      etat: [null],
      id: [null],
      reductionMax: [null, Validators.min(0)],
      // grossisteId: [null],
      detailId: [null],
      categorieId: [null, Validators.required],
      formeId: [null],
      fabriquantId: [null],
      rayonId: [null],
      produitDetail: [null],
      etagere: [null, Validators.maxLength(15)],
      magasinId: [null]
    });
    combineLatest([
      this.categorieService.getCategories(),
      this.rayonService.getRayons(),
      // this.etageresService.getEtageress(),
      this.magasinService.getMagasins(),
      this.formeService.getFormes(),
      this.fabriquantService.getFabriquants()
    ]).subscribe({
      next: ([dataCategories, dataRayon, dataMagasin, dataForme, dataFabriquants]) => {
        this.categories = dataCategories;
        this.rayons = dataRayon;

        this.magasins = dataMagasin;
        this.formes = dataForme;
        this.fabriquants = dataFabriquants;
        if (this.data.type == "info") {
          this.info = true
        }
        this.getProductById(this.data.id);
        console.log("next");
        // console.log()
      },
      error:(err)=>{
        console.log("error");
        console.log(err);
        if (err.status === 401 || err.status === 403) {
          this.authService.logout();
          this.snackBar.open('Déconnexion réussie.', '×', {
            panelClass: 'success',
            verticalPosition: 'top',
            duration: 3000,
          });
          // Redirect to login page or clear session
          window.location.href = '/sign-in';
        }
      }
    })

  }

  public getProductById(id: any) {
    this.productService.getProductById(id).subscribe((data: any) => {
      this.form.patchValue(data);
    });
  }

  public onSubmit() {
    if (this.form.valid){
      console.log("this.form.value");
      console.log(this.form.value);
      this.productService.updateProductNew(this.data.id, this.form.value).subscribe({
        next: (data: any) => {
          this.form.patchValue(data);
        },
        error: (err) => {
          if (err.status === 401 || err.status === 403){
            this.authService.logout();
            this.snackBar.open('Déconnexion réussie.', '×', {
              panelClass: 'success',
              verticalPosition: 'top',
              duration: 3000,
            });
            // Redirect to login page or clear session
            window.location.href = '/sign-in';
          }
          console.error('Error fetching products:', err);
        }
      });
    }
  }

  ngOnDestroy() {
    // this.sub.unsubscribe();
  }

}
