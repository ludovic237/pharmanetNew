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
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from "@angular/material/dialog";
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
import {LoaderService} from "@services/loader.service";

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
  title: string = ""

  childrenList: any[] = []

  info: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<AddProductDialogComponent>,
    public loaderService: LoaderService,
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
      nom: ["", Validators.compose([Validators.required, Validators.minLength(4)])],
      ean13: ["", Validators.maxLength(16)],
      codeLaborex: ["", Validators.maxLength(32)],
      codebarre: ["", Validators.maxLength(32)],
      codeUbipharm: ["", Validators.maxLength(32)],
      reference: ["", Validators.maxLength(32)],
      stock: [0, Validators.min(0)],
      stockMax: [0, Validators.min(0)],
      stockMin: [0, Validators.min(0)],
      contenuDetail: [""],
      prixDetail: [""],
      etat: [""],
      id: [0],
      reductionMax: [0, Validators.min(0)],
      // grossisteId: [null],
      detailId: [0],
      categorieId: [0, Validators.required],
      formeId: [0],
      fabriquantId: [0],
      rayonId: [0],
      produitDetail: [""],
      etagere: ["", Validators.maxLength(15)],
      magasinId: [0]
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
      error: (err) => {
        console.log("error");
        console.log(err);

        if (err.status === 401 || err.status === 403) {
          this.authService.logout();
          this.snackBar.open('Déconnexion réussie.', '×', {
            panelClass: 'success',
            verticalPosition: 'top',
            duration: 3000,
          });
          localStorage.removeItem('token');
          window.location.href = '/sign-in';
        }
      }
    })

  }

  public getProductById(id: any) {
    this.productService.getProductById(id).subscribe((data: any) => {
      this.form.patchValue(data);
      this.childrenList = data.stockDetails;
    });
  }

  public onSubmit() {
    if (this.form.valid) {
      console.log("this.form.value");
      console.log(this.form.value);
      if (this.form.value.etagere==null){
        this.form.value.etagere=""
      }
      if (this.form.value.produitDetail==null){
        this.form.value.produitDetail=""
      }
      this.form.value.prixDetail=  this.form.value.prixDetail+"";
      this.form.value.contenuDetail=  this.form.value.contenuDetail+"";
      if (this.data.type == "create") {
        this.productService.createProducNewt(this.form.value).subscribe({
          next: (data: any) => {
            this.form.patchValue(data);
            this.snackBar.open('Creation d un nouveau produit réussie.', '×', {
              panelClass: 'success',
              verticalPosition: 'top',
              duration: 3000,
            });
            this.dialogRef.close()
          },
          error: (err) => {

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
            console.error('Error fetching products:', err);
          }
        });
      } else {
        this.productService.updateProductNew(this.data.id, this.form.value).subscribe({
          next: (data: any) => {
            this.form.patchValue(data);
            this.snackBar.open('Mise a jour d un  produit réussie.', '×', {
              panelClass: 'success',
              verticalPosition: 'top',
              duration: 3000,
            });
          },
          error: (err) => {

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
            console.error('Error fetching products:', err);
          }
        });
      }

    }
  }

  ngOnDestroy() {
    // this.sub.unsubscribe();
  }

}
